# Docker Deployment Guide

## Quick Start

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### Production Deployment

1. **Copy environment file:**
   ```bash
   cp .env.docker.example .env
   ```

2. **Generate JWT secrets:**
   ```bash
   echo "JWT_SECRET=$(openssl rand -hex 32)" >> .env
   echo "JWT_REFRESH_SECRET=$(openssl rand -hex 32)" >> .env
   ```

3. **Edit `.env` file:**
   - Set `POSTGRES_PASSWORD` to a strong password
   - Update `CORS_ORIGIN` with your domain(s)

4. **Start services:**
   ```bash
   docker compose up -d
   ```

5. **Check status:**
   ```bash
   docker compose ps
   docker compose logs -f api
   ```

6. **Access application:**
   - Web UI: http://localhost:8080
   - API: http://localhost:3000
   - Caddy (reverse proxy): http://localhost:80

### Development Mode

Use the override file for development with hot reload:

```bash
# Start with development overrides
docker compose -f docker-compose.yml -f docker compose.override.yml up

# Or simply (override is loaded automatically)
docker compose up
```

## Services

### 🗄️ PostgreSQL
- **Container:** `balda_postgres`
- **Port:** 5432
- **Database:** balda
- **Volume:** `postgres_data`

### 🚀 API Server
- **Container:** `balda_api`
- **Port:** 3000
- **Tech:** Bun + Elysia
- **Health Check:** `/health`

### 🌐 Web Frontend
- **Container:** `balda_web`
- **Port:** 8080 (nginx on port 80 inside container)
- **Tech:** React + Vite (built), served by nginx

### 🔒 Caddy (Reverse Proxy)
- **Container:** `balda_caddy`
- **Ports:** 80 (HTTP), 443 (HTTPS)
- **Volumes:** `caddy_data`, `caddy_config`

## Useful Commands

### View logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api
docker compose logs -f postgres
```

### Restart services
```bash
# All services
docker compose restart

# Specific service
docker compose restart api
```

### Rebuild after code changes
```bash
docker compose build --no-cache api web
docker compose up -d
```

### Database operations
```bash
# Access PostgreSQL
docker compose exec postgres psql -U balda -d balda

# Run migrations
docker compose exec api bun run db:migrate

# Reset database (⚠️ DESTRUCTIVE)
docker compose exec api bun run db:reset --confirm
```

### Stop and clean up
```bash
# Stop services
docker compose down

# Stop and remove volumes (⚠️ DELETES DATA)
docker compose down -v
```

## Environment Variables

### Required (Production)
- `JWT_SECRET` - JWT signing secret (generate with `openssl rand -hex 32`)
- `JWT_REFRESH_SECRET` - Refresh token secret
- `POSTGRES_PASSWORD` - Database password

### Optional
- `NODE_ENV` - Environment mode (default: production)
- `LOG_LEVEL` - Logging level (debug, info, warn, error)
- `CORS_ORIGIN` - Allowed CORS origins (comma-separated)
- `DATABASE_URL` - Full database connection string

## Security Checklist

✅ **Before Production Deployment:**

1. Generate unique JWT secrets (never use defaults)
2. Set strong PostgreSQL password
3. Configure CORS to allow only your domains
4. Use HTTPS with Caddy (configure Caddyfile)
5. Review exposed ports (close unnecessary ones)
6. Enable Docker secrets for sensitive data
7. Set up backup strategy for `postgres_data` volume

## Troubleshooting

### API won't start
```bash
# Check if database is ready
docker compose logs postgres

# Check API logs
docker compose logs api

# Verify environment variables
docker compose exec api env | grep JWT
```

### Port conflicts
If ports 3000, 5432, or 8080 are in use:

```bash
# Edit docker-compose.yml port mappings
# Change "3000:3000" to "3001:3000" for example
```

### Database connection issues
```bash
# Check network
docker network inspect b2_default

# Verify DATABASE_URL
docker compose exec api printenv DATABASE_URL
```

## Architecture

```
┌─────────────┐
│   Caddy     │ :80, :443 (reverse proxy)
└──────┬──────┘
       │
    ┌──┴───────────┐
    │              │
┌───▼───┐    ┌────▼────┐
│  Web  │    │   API   │ :3000
│ nginx │    │   Bun   │
└───────┘    └────┬────┘
                  │
             ┌────▼─────┐
             │ Postgres │ :5432
             └──────────┘
```

## Performance Tips

1. **Use Docker BuildKit** for faster builds:
   ```bash
   export DOCKER_BUILDKIT=1
   docker compose build
   ```

2. **Layer caching**: Dependencies are cached in separate layer for faster rebuilds

3. **Multi-stage builds**: Smaller final images (API: ~100MB, Web: ~50MB)

4. **Health checks**: Services won't be marked healthy until they pass checks

## Production Recommendations

- Use `docker compose.prod.yml` for production overrides
- Enable resource limits (CPU, memory)
- Set up log aggregation (Loki, ELK)
- Use Docker secrets for sensitive data
- Enable automatic restarts: `restart: unless-stopped`
- Monitor with Prometheus + Grafana
- Regular backups of `postgres_data` volume
