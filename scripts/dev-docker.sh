#!/bin/bash

# Development Docker script for Balda Game Application
# This script sets up the development environment with hot reloading

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v bun &> /dev/null; then
        print_error "Bun is not installed. Please install Bun first."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Create development environment file
create_dev_env() {
    print_status "Setting up development environment..."
    
    if [ ! -f ".env.dev" ]; then
        cat > .env.dev << EOF
# Development Environment Variables
NODE_ENV=development
DATABASE_URL=postgresql://balda:balda@postgres:5432/balda
JWT_SECRET=dev-jwt-secret-key-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-key-change-in-production
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:5173
EOF
        print_success "Created .env.dev file"
    else
        print_status ".env.dev already exists"
    fi
}

# Build development images
build_dev_images() {
    print_status "Building development Docker images..."
    
    # Build API development image
    print_status "Building API development image..."
    docker build -f Dockerfile.api.dev -t balda-api-dev .
    print_success "API development image built"
    
    # Build Web development image
    print_status "Building Web development image..."
    docker build -f Dockerfile.web.dev -t balda-web-dev .
    print_success "Web development image built"
    
    print_success "All development images built successfully"
}

# Start development services
start_dev_services() {
    print_status "Starting development services..."
    
    # Start services with docker compose
    docker compose up -d postgres
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10
    
    # Start API and Web services
    docker compose up -d api web caddy
    
    print_success "Development services started"
}

# Show service status
show_status() {
    print_status "Service Status:"
    echo ""
    
    # Show running containers
    docker compose ps
    
    echo ""
    print_status "Service URLs:"
    echo "  🌐 Web Application: http://localhost:5173"
    echo "  🔧 API Server: http://localhost:3000"
    echo "  📚 API Documentation: http://localhost:3000/swagger"
    echo "  🏥 Health Check: http://localhost:3000/health"
    echo "  🗄️  Database: postgresql://balda:balda@localhost:5432/balda"
    echo ""
}

# Show logs
show_logs() {
    print_status "Showing service logs..."
    docker compose logs -f
}

# Stop services
stop_services() {
    print_status "Stopping development services..."
    docker compose down
    print_success "Development services stopped"
}

# Clean up
cleanup() {
    print_status "Cleaning up development environment..."
    
    # Stop and remove containers
    docker compose down -v
    
    # Remove development images
    docker rmi balda-api-dev balda-web-dev 2>/dev/null || true
    
    # Remove development volumes
    docker volume prune -f
    
    print_success "Development environment cleaned up"
}

# Main execution
main() {
    case "${1:-start}" in
        "start")
            echo "🚀 Starting Balda Game Development Environment"
            echo "=============================================="
            check_dependencies
            create_dev_env
            build_dev_images
            start_dev_services
            show_status
            ;;
        "logs")
            show_logs
            ;;
        "stop")
            stop_services
            ;;
        "clean")
            cleanup
            ;;
        "status")
            show_status
            ;;
        "restart")
            stop_services
            sleep 2
            main start
            ;;
        *)
            echo "Usage: $0 {start|logs|stop|clean|status|restart}"
            echo ""
            echo "Commands:"
            echo "  start   - Start development environment (default)"
            echo "  logs    - Show service logs"
            echo "  stop    - Stop all services"
            echo "  clean   - Clean up everything"
            echo "  status  - Show service status"
            echo "  restart - Restart all services"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
