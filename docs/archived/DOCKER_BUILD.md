# Docker Build Guide for Balda Game Application

This guide explains how to build and deploy the Balda game application using Docker with proper `dist/` directory handling.

## 📁 Directory Structure

The application builds into the following structure:

```
dist/
├── server/           # Built server application
│   └── index.js      # Main server entry point
└── web/              # Built web application
    ├── index.html    # Main HTML file
    ├── assets/       # Static assets (JS, CSS, images)
    └── ...           # Other web assets
```

## 🐳 Docker Images

### API Server (`Dockerfile.api`)
- **Base**: `oven/bun:1-alpine`
- **Build**: Uses `bun run build:server`
- **Output**: `dist/server/` directory
- **Runtime**: Runs `bun run dist/server/index.js`
- **Health Check**: HTTP GET `/health`

### Web Server (`Dockerfile.web`)
- **Base**: `nginx:alpine`
- **Build**: Uses `bun run build:web`
- **Output**: `dist/web/` directory
- **Runtime**: Nginx serving static files
- **Health Check**: HTTP GET on port 80

## 🚀 Build Process

### 1. Manual Build

```bash
# Build everything
bun run build:all

# Or build individually
bun run build:server  # Creates dist/server/
bun run build:web     # Creates dist/web/
```

### 2. Docker Build

```bash
# Build using the automated script
bun run build:docker

# Or build manually
docker build -f Dockerfile.api -t balda-api .
docker build -f Dockerfile.web -t balda-web .
```

### 3. Docker Compose

```bash
# Development
docker compose up

# Production
docker compose -f docker-compose.yml up -d
```

## 🔧 Build Script Features

The `scripts/build-docker.sh` script provides:

- ✅ **Dependency checking** (Bun, Docker, Docker Compose)
- ✅ **Clean builds** (removes old dist/ and Docker images)
- ✅ **Application building** (server + web)
- ✅ **Docker image building** (API + Web)
- ✅ **Health check testing**
- ✅ **Colored output** for better visibility
- ✅ **Error handling** with proper exit codes

## 📋 Build Script Usage

```bash
# Make executable (first time only)
chmod +x scripts/build-docker.sh

# Run the build script
./scripts/build-docker.sh

# Or use npm/bun script
bun run build:docker
```

## 🏗️ Build Configuration

### Server Build (`build:server`)
```bash
bun build src/server/index.ts \
  --target=bun \
  --outdir=dist/server \
  --external=postgres \
  --external=c12 \
  --external=drizzle-orm
```

### Web Build (`build:web`)
```bash
vite build  # Outputs to dist/web/
```

## 🐳 Docker Configuration

### API Container
- **Port**: 3000
- **Health Check**: `wget http://localhost:3000/health`
- **Dependencies**: All production dependencies
- **User**: Non-root user `balda`

### Web Container
- **Port**: 80
- **Health Check**: `wget http://localhost:80`
- **Static Files**: Served from `/usr/share/nginx/html`
- **Configuration**: Custom nginx.conf

## 🔍 Verification

After building, verify the structure:

```bash
# Check dist structure
ls -la dist/
ls -la dist/server/
ls -la dist/web/

# Check Docker images
docker images | grep balda

# Test containers
docker run --rm balda-api wget --spider http://localhost:3000/health
docker run --rm balda-web wget --spider http://localhost:80
```

## 🚨 Troubleshooting

### Common Issues

1. **Missing dist/ directory**
   ```bash
   # Ensure build scripts are run
   bun run build:all
   ```

2. **Docker build failures**
   ```bash
   # Clean and rebuild
   docker system prune -f
   bun run build:docker
   ```

3. **Health check failures**
   ```bash
   # Check if services are running
   docker compose logs api
   docker compose logs web
   ```

4. **Permission issues**
   ```bash
   # Fix script permissions
   chmod +x scripts/build-docker.sh
   ```

### Debug Commands

```bash
# Check build output
ls -la dist/

# Inspect Docker images
docker inspect balda-api
docker inspect balda-web

# View container logs
docker compose logs -f

# Enter container for debugging
docker exec -it balda_api sh
docker exec -it balda_web sh
```

## 📊 Performance Optimizations

### Docker Build Optimizations
- **Multi-stage builds** to reduce image size
- **Layer caching** for faster rebuilds
- **Production-only dependencies** in final stage
- **Non-root user** for security

### Nginx Optimizations
- **Gzip compression** for static assets
- **Cache headers** for long-term caching
- **Rate limiting** for API protection
- **Security headers** for protection

## 🔒 Security Features

- **Non-root containers** for both API and Web
- **Security headers** in nginx configuration
- **Rate limiting** to prevent abuse
- **Health checks** for container monitoring
- **Minimal base images** (Alpine Linux)

## 📈 Monitoring

### Health Checks
- **API**: `GET /health` endpoint
- **Web**: HTTP response on port 80
- **Database**: PostgreSQL connection check

### Logging
- **Application logs** via Docker Compose
- **Nginx access/error logs**
- **Container health status**

## 🚀 Deployment

### Development
```bash
docker compose up
```

### Production
```bash
# Set environment variables
export JWT_SECRET="your-secret-key"
export JWT_REFRESH_SECRET="your-refresh-secret"

# Start production services
docker compose -f docker-compose.yml up -d
```

### Environment Variables
```bash
# Required for production
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Optional
LOG_LEVEL=info
CORS_ORIGIN=http://localhost
```

This setup ensures proper handling of the `dist/` directory structure and provides a robust, production-ready Docker deployment.
