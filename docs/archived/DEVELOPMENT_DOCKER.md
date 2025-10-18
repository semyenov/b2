# Development Docker Setup for Balda Game Application

This guide explains how to set up and use the development Docker environment for the Balda game application with hot reloading and proper `dist/` directory handling.

## 🚀 Quick Start

```bash
# Start development environment
bun run dev:docker

# View logs
bun run dev:docker:logs

# Stop services
bun run dev:docker:stop

# Clean up
bun run dev:docker:clean
```

## 📁 Development Structure

### Dockerfile.api.dev
- **Base**: `oven/bun:1-alpine`
- **Features**: Hot reloading, development tools, health checks
- **Port**: 3000
- **Command**: `bun run dev`
- **Volumes**: Source code mounted for live reloading

### Dockerfile.web.dev
- **Base**: `oven/bun:1-alpine`
- **Features**: Vite dev server, hot module replacement
- **Port**: 5173
- **Command**: `bun run dev:web`
- **Volumes**: Source code mounted for live reloading

## 🔧 Development Features

### Hot Reloading
- **API Server**: Automatic restart on file changes
- **Web Server**: Hot module replacement (HMR)
- **Source Maps**: Full debugging support
- **Volume Mounting**: Live code changes without rebuilds

### Development Tools
- **curl/wget**: For health checks and testing
- **git**: For version control operations
- **bash**: Enhanced shell experience
- **Non-root user**: Security best practices

### Health Checks
- **API**: `GET /health` endpoint monitoring
- **Web**: HTTP response on port 5173
- **Automatic restart**: On health check failures

## 🐳 Docker Compose Override

The `docker compose.override.yml` provides development-specific configuration:

### API Service Override
```yaml
api:
  build:
    dockerfile: Dockerfile.api.dev
  environment:
    - NODE_ENV=development
    - LOG_LEVEL=debug
  volumes:
    - .:/app              # Live code mounting
    - /app/node_modules   # Preserve dependencies
    - /app/dist          # Preserve build output
```

### Web Service Override
```yaml
web:
  build:
    dockerfile: Dockerfile.web.dev
  volumes:
    - .:/app              # Live code mounting
    - /app/node_modules   # Preserve dependencies
    - /app/dist          # Preserve build output
```

## 🛠️ Development Scripts

### Available Commands

```bash
# Start development environment
bun run dev:docker

# View service logs
bun run dev:docker:logs

# Stop all services
bun run dev:docker:stop

# Clean up everything
bun run dev:docker:clean

# Show service status
./scripts/dev-docker.sh status

# Restart services
./scripts/dev-docker.sh restart
```

### Manual Docker Commands

```bash
# Start services manually
docker compose up -d

# View specific service logs
docker compose logs -f api
docker compose logs -f web

# Rebuild specific service
docker compose build api
docker compose up -d api

# Stop specific service
docker compose stop api
```

## 🌐 Service URLs

When development environment is running:

- **🌐 Web Application**: http://localhost:5173
- **🔧 API Server**: http://localhost:3000
- **📚 API Documentation**: http://localhost:3000/swagger
- **🏥 Health Check**: http://localhost:3000/health
- **🗄️ Database**: postgresql://balda:balda@localhost:5432/balda

## 🔍 Development Workflow

### 1. Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd b2

# Start development environment
bun run dev:docker
```

### 2. Development
```bash
# Make code changes
# Files are automatically reloaded

# View logs
bun run dev:docker:logs

# Test API endpoints
curl http://localhost:3000/health
curl http://localhost:3000/swagger
```

### 3. Debugging
```bash
# Enter API container
docker exec -it balda_api sh

# Enter Web container
docker exec -it balda_web sh

# View container logs
docker logs balda_api
docker logs balda_web
```

### 4. Cleanup
```bash
# Stop services
bun run dev:docker:stop

# Clean up everything
bun run dev:docker:clean
```

## 📊 Monitoring

### Health Checks
- **API**: Monitors `/health` endpoint every 30s
- **Web**: Monitors port 5173 every 30s
- **Automatic restart**: On health check failures

### Logs
```bash
# View all logs
docker compose logs -f

# View specific service logs
docker compose logs -f api
docker compose logs -f web
docker compose logs -f postgres
```

### Service Status
```bash
# Show running containers
docker compose ps

# Show resource usage
docker stats
```

## 🔧 Configuration

### Environment Variables
Create `.env.dev` file:
```env
NODE_ENV=development
DATABASE_URL=postgresql://balda:balda@postgres:5432/balda
JWT_SECRET=dev-jwt-secret-key
JWT_REFRESH_SECRET=dev-refresh-secret-key
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:5173
```

### Volume Mounting
- **Source Code**: `.:/app` - Live code changes
- **Node Modules**: `/app/node_modules` - Preserve dependencies
- **Build Output**: `/app/dist` - Preserve build artifacts

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check if ports are in use
   lsof -i :3000
   lsof -i :5173
   lsof -i :5432
   ```

2. **Container won't start**
   ```bash
   # Check logs
   docker compose logs api
   docker compose logs web
   
   # Rebuild containers
   docker compose build --no-cache
   ```

3. **Hot reloading not working**
   ```bash
   # Check volume mounts
   docker compose exec api ls -la /app
   docker compose exec web ls -la /app
   ```

4. **Database connection issues**
   ```bash
   # Check database status
   docker compose logs postgres
   
   # Test connection
   docker compose exec api bun run db:view
   ```

### Debug Commands

```bash
# Check container status
docker compose ps

# Check resource usage
docker stats

# View container details
docker inspect balda_api
docker inspect balda_web

# Check volume mounts
docker volume ls
docker volume inspect b2_postgres_data
```

## 🔄 Development vs Production

### Development Features
- ✅ **Hot reloading** for both API and Web
- ✅ **Source maps** for debugging
- ✅ **Volume mounting** for live code changes
- ✅ **Development dependencies** included
- ✅ **Debug logging** enabled
- ✅ **Non-root users** for security

### Production Features
- ✅ **Optimized builds** with production dependencies only
- ✅ **Multi-stage builds** for smaller images
- ✅ **Health checks** for monitoring
- ✅ **Security headers** and rate limiting
- ✅ **Static file serving**

## 📝 Best Practices

1. **Use development scripts** for common tasks
2. **Monitor logs** regularly during development
3. **Clean up** when switching between projects
4. **Use health checks** to verify service status
5. **Test API endpoints** regularly
6. **Keep dependencies updated** in package.json

## 🚀 Advanced Usage

### Custom Development Setup
```bash
# Override specific services
docker compose up -d postgres api

# Use custom environment file
docker compose --env-file .env.custom up

# Scale services
docker compose up --scale api=2
```

### Integration with IDE
- **VS Code**: Use Docker extension for container management
- **IntelliJ**: Use Docker integration for debugging
- **Vim/Emacs**: Use terminal-based Docker commands

This development setup provides a robust, hot-reloading environment for efficient development of the Balda game application.
