# Docker Setup for Balda Game Application

This document describes the Docker setup for the Balda game application using Caddy as a reverse proxy.

## Architecture

The application consists of the following services:

- **PostgreSQL**: Database server
- **API**: Backend API server (Node.js/Bun)
- **Web**: Frontend web server (React/Vite)
- **Caddy**: Reverse proxy and static file server

## Services

### PostgreSQL
- **Image**: `postgres:16-alpine`
- **Port**: `5432`
- **Database**: `balda`
- **User**: `balda`
- **Password**: `balda`

### API Server
- **Port**: `3000`
- **Environment**: Production/Development
- **Health Check**: `/health` endpoint

### Web Server
- **Port**: `5173`
- **Environment**: Production/Development
- **Static Files**: Served by Caddy

### Caddy Reverse Proxy
- **Ports**: `80` (HTTP), `443` (HTTPS)
- **Configuration**: `Caddyfile` or `Caddyfile.dev`
- **Features**:
  - Automatic HTTPS (production)
  - CORS handling
  - WebSocket support
  - Static file serving
  - API proxying

## Usage

### Development

```bash
# Start all services in development mode
docker compose up

# Start specific services
docker compose up postgres api web caddy

# Build and start
docker compose up --build

# Run in background
docker compose up -d
```

### Production

```bash
# Start production services
docker compose -f docker-compose.yml up -d

# With custom environment file
docker compose --env-file .env.production up -d
```

## Environment Variables

Create a `.env` file with the following variables:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Database Configuration
DATABASE_URL=postgresql://balda:balda@postgres:5432/balda

# Server Configuration
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
```

## File Structure

```
├── docker-compose.yml              # Main compose file
├── docker compose.override.yml     # Development overrides
├── Caddyfile                       # Production Caddy config
├── Caddyfile.dev                   # Development Caddy config
├── Dockerfile.api                  # Production API Dockerfile
├── Dockerfile.api.dev              # Development API Dockerfile
├── Dockerfile.web                  # Production Web Dockerfile
├── Dockerfile.web.dev              # Development Web Dockerfile
├── nginx.conf                      # Nginx config for web service
└── DOCKER_SETUP.md                 # This file
```

## Caddy Configuration

### Development (`Caddyfile.dev`)
- Proxies API requests to `api:3000`
- Proxies web requests to `web:5173`
- Enables CORS for development
- Supports WebSocket connections

### Production (`Caddyfile`)
- Serves static files from `/srv`
- Proxies API requests to `localhost:3000`
- Automatic HTTPS with Let's Encrypt
- Security headers
- SPA routing support

## Health Checks

- **PostgreSQL**: `pg_isready -U balda`
- **API**: `curl -f http://localhost:3000/health`
- **Caddy**: Built-in health monitoring

## Volumes

- `postgres_data`: PostgreSQL data persistence
- `caddy_data`: Caddy data persistence
- `caddy_config`: Caddy configuration persistence

## Networking

All services are connected via Docker's default bridge network. Services can communicate using service names as hostnames.

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 80, 443, 3000, 5173, and 5432 are available
2. **Permission issues**: Check file permissions for mounted volumes
3. **Build failures**: Ensure all Dockerfiles are present and valid

### Logs

```bash
# View all logs
docker compose logs

# View specific service logs
docker compose logs api
docker compose logs web
docker compose logs caddy
docker compose logs postgres

# Follow logs in real-time
docker compose logs -f api
```

### Restart Services

```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart api
```

## Security Notes

- Change default passwords in production
- Use strong JWT secrets
- Configure proper CORS policies
- Enable HTTPS in production
- Use environment variables for sensitive data
