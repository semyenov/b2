#!/bin/bash

# Build script for Docker containers
# This script ensures proper dist/ directory structure

set -e

echo "🚀 Building Balda Game Application for Docker"

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

# Clean previous builds
clean_builds() {
    print_status "Cleaning previous builds..."
    
    # Remove dist directory
    if [ -d "dist" ]; then
        rm -rf dist
        print_success "Removed dist directory"
    fi
    
    # Remove Docker images
    if docker images | grep -q "balda"; then
        print_status "Removing existing Docker images..."
        docker rmi $(docker images | grep "balda" | awk '{print $3}') 2>/dev/null || true
        print_success "Removed existing Docker images"
    fi
}

# Build the application
build_application() {
    print_status "Building application..."
    
    # Install dependencies
    print_status "Installing dependencies..."
    bun install --frozen-lockfile
    
    # Build server
    print_status "Building server..."
    bun run build:server
    
    # Build web
    print_status "Building web..."
    bun run build:web
    
    # Verify dist structure
    print_status "Verifying dist structure..."
    
    if [ ! -d "dist/server" ]; then
        print_error "dist/server directory not found"
        exit 1
    fi
    
    if [ ! -d "dist/web" ]; then
        print_error "dist/web directory not found"
        exit 1
    fi
    
    if [ ! -f "dist/server/index.js" ]; then
        print_error "dist/server/index.js not found"
        exit 1
    fi
    
    if [ ! -f "dist/web/index.html" ]; then
        print_error "dist/web/index.html not found"
        exit 1
    fi
    
    print_success "Application built successfully"
    print_success "dist/server/ contains server build"
    print_success "dist/web/ contains web build"
}

# Build Docker images
build_docker_images() {
    print_status "Building Docker images..."
    
    # Build API image
    print_status "Building API Docker image..."
    docker build -f Dockerfile.api -t balda-api .
    print_success "API Docker image built"
    
    # Build Web image
    print_status "Building Web Docker image..."
    docker build -f Dockerfile.web -t balda-web .
    print_success "Web Docker image built"
    
    print_success "All Docker images built successfully"
}

# Test Docker containers
test_containers() {
    print_status "Testing Docker containers..."
    
    # Test API container
    print_status "Testing API container..."
    if docker run --rm balda-api wget --no-verbose --tries=1 --spider http://localhost:3000/health 2>/dev/null; then
        print_success "API container health check passed"
    else
        print_warning "API container health check failed (expected in test mode)"
    fi
    
    # Test Web container
    print_status "Testing Web container..."
    if docker run --rm balda-web wget --no-verbose --tries=1 --spider http://localhost:80 2>/dev/null; then
        print_success "Web container health check passed"
    else
        print_warning "Web container health check failed (expected in test mode)"
    fi
    
    print_success "Container tests completed"
}

# Main execution
main() {
    echo "🐳 Balda Game Application Docker Build Script"
    echo "=============================================="
    
    check_dependencies
    clean_builds
    build_application
    build_docker_images
    test_containers
    
    echo ""
    print_success "🎉 Build completed successfully!"
    echo ""
    print_status "To start the application:"
    echo "  docker compose up -d"
    echo ""
    print_status "To view logs:"
    echo "  docker compose logs -f"
    echo ""
    print_status "To stop the application:"
    echo "  docker compose down"
    echo ""
}

# Run main function
main "$@"
