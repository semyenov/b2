# Configuration Guide

## Overview

The Balda application uses **c12** (UnJS smart configuration loader) for centralized, type-safe configuration management. Configuration is loaded from multiple sources with clear priority ordering and environment-specific overrides.

## Configuration Architecture

### Multi-Source Loading

Configuration is loaded in the following priority order (highest to lowest):

1. **Environment variables** (highest priority)
2. **.env files** (`.env`, `.env.local`, etc.)
3. **balda.config.ts** (base configuration file)
4. **Default values** (defined in `src/server/config/schema.ts`)

### Configuration Files

```
project-root/
├── balda.config.ts          # Base configuration with environment-specific overrides
├── .env                      # Environment variables (not in git)
├── .env.example              # Template for environment variables (in git)
└── src/server/config/
    ├── schema.ts             # TypeScript interfaces and validation
    └── index.ts              # Configuration loader using c12
```

## Quick Start

### 1. Copy Environment Template

```bash
cp .env.example .env
```

### 2. Configure Required Variables

Edit `.env` and set:

```bash
# Required for production
DATABASE_URL=postgresql://user:password@localhost:5432/balda
JWT_SECRET=your-secret-here  # Generate with: openssl rand -base64 32
JWT_REFRESH_SECRET=your-refresh-secret-here
```

### 3. Start the Server

```bash
bun run dev
```

Configuration is automatically loaded and validated on startup.

## Configuration Reference

### Server Configuration

```typescript
interface ServerConfig {
  port: number              // Server port (default: 3000)
  host: string              // Hostname (default: localhost)
  nodeEnv: 'development' | 'production' | 'test'
  isProduction: boolean     // Computed from nodeEnv
  isDevelopment: boolean    // Computed from nodeEnv
}
```

**Environment Variables:**
- `PORT` - Server port
- `HOST` - Server hostname
- `NODE_ENV` - Environment mode

### Database Configuration

```typescript
interface DatabaseConfig {
  url: string              // PostgreSQL connection URL (REQUIRED)
  maxConnections: number   // Pool size (default: 20)
  idleTimeout: number      // Idle timeout in seconds (default: 20)
  connectTimeout: number   // Connect timeout in seconds (default: 10)
  preparedStatements: boolean  // Use prepared statements (default: true)
}
```

**Environment Variables:**
- `DATABASE_URL` - **REQUIRED** PostgreSQL connection string
- `DB_MAX_CONNECTIONS` - Max connection pool size
- `DB_IDLE_TIMEOUT` - Idle connection timeout
- `DB_CONNECT_TIMEOUT` - Connection timeout
- `DB_PREPARED_STATEMENTS` - Enable prepared statements

### JWT Authentication

```typescript
interface JwtConfig {
  secret: string            // Access token secret (REQUIRED for production)
  refreshSecret: string     // Refresh token secret (REQUIRED for production)
  accessTokenExpiry: string // Access token TTL (default: 1h)
  refreshTokenExpiry: string // Refresh token TTL (default: 7d)
}
```

**Environment Variables:**
- `JWT_SECRET` - **REQUIRED** Access token signing secret
- `JWT_REFRESH_SECRET` - **REQUIRED** Refresh token signing secret
- `JWT_ACCESS_TOKEN_EXPIRY` - Token expiration (e.g., 15m, 1h, 2d)
- `JWT_REFRESH_TOKEN_EXPIRY` - Refresh token expiration

**Security:** Always generate strong secrets for production:
```bash
openssl rand -base64 32
```

### Logging Configuration

```typescript
interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error' | 'silent'
  format: 'json' | 'pretty'
  colors: boolean           // Enable colored output
}
```

**Environment Variables:**
- `LOG_LEVEL` - Log level (default: debug in dev, info in prod)
- `LOG_FORMAT` - Log format (default: pretty in dev, json in prod)
- `LOG_COLORS` - Enable colors (default: true in dev, false in prod)

### Rate Limiting

```typescript
interface RateLimitConfig {
  enabled: boolean          // Enable rate limiting
  duration: number          // Window duration in ms (default: 60000)
  max: number              // Max requests per window (default: 100)
}
```

**Environment Variables:**
- `RATE_LIMIT_ENABLED` - Enable/disable rate limiting
- `RATE_LIMIT_DURATION` - Time window in milliseconds
- `RATE_LIMIT_MAX` - Maximum requests per IP per window

### CORS Configuration

```typescript
interface CorsConfig {
  origin: boolean | string | string[]  // Allowed origins
  credentials: boolean                 // Allow credentials
}
```

**Environment Variables:**
- `CORS_ORIGIN` - Allowed origins (true for all, or comma-separated list)
- `CORS_CREDENTIALS` - Allow credentials in CORS requests

### Dictionary Configuration

```typescript
interface DictionaryConfig {
  path?: string            // Path to dictionary file
  allowAll: boolean        // Allow any word (testing only)
}
```

**Environment Variables:**
- `DICT_PATH` - Path to dictionary file (one word per line)
- `DICT_ALLOW_ALL` - Allow all words without validation

### Storage Configuration

```typescript
interface StorageConfig {
  gamesDir: string         // Directory for game data
}
```

**Environment Variables:**
- `STORAGE_DIR` - Directory for storing game files

### WebSocket Configuration

```typescript
interface WebSocketConfig {
  archiveDelayMs: number   // Archive delay for inactive games
}
```

**Environment Variables:**
- `WS_ARCHIVE_DELAY_MS` - Archive delay in milliseconds

### API Documentation (Swagger)

```typescript
interface SwaggerConfig {
  enabled: boolean         // Enable Swagger UI
  path: string            // Swagger UI path
}
```

**Environment Variables:**
- `SWAGGER_ENABLED` - Enable/disable Swagger UI
- `SWAGGER_PATH` - Swagger UI path (default: /swagger)

## Environment-Specific Configuration

### Using balda.config.ts

The `balda.config.ts` file supports environment-specific overrides:

```typescript
export default {
  // Base configuration
  server: {
    port: 3000,
    host: 'localhost'
  },

  // Development overrides
  $development: {
    logging: {
      level: 'debug',
      format: 'pretty'
    }
  },

  // Production overrides
  $production: {
    logging: {
      level: 'info',
      format: 'json'
    },
    swagger: {
      enabled: false  // Disable in production
    }
  },

  // Test overrides
  $test: {
    server: {
      port: 3001
    },
    logging: {
      level: 'silent'
    }
  }
}
```

The appropriate section is automatically selected based on `NODE_ENV`.

## Usage in Code

### Backend

```typescript
import { getConfig } from './config'

const config = getConfig()

// Access configuration
console.log(config.server.port)
console.log(config.database.url)
console.log(config.server.isProduction)
```

**Note:** Configuration must be loaded during server startup:
```typescript
import { loadConfig } from './config'

// Load config on startup
const config = await loadConfig()
```

### Frontend (Web)

```typescript
import { env, isDev, isProd } from './config/env'

// Access environment
console.log(env.apiBaseUrl)
console.log(env.wsBaseUrl)

// Environment checks
if (isDev) {
  // Development-only code
}
```

## Validation

Configuration is automatically validated on startup. Missing or invalid values will cause the application to exit with a clear error message:

```
Configuration validation failed:
  - database.url is required (set DATABASE_URL environment variable)
  - jwt.secret must be changed in production (set JWT_SECRET environment variable)
  - server.port must be between 1 and 65535
```

## Best Practices

### 1. Never Commit Secrets

- Add `.env` to `.gitignore` (already done)
- Only commit `.env.example` with placeholder values
- Use environment variables in production (CI/CD)

### 2. Generate Strong Secrets

```bash
# Generate JWT secrets
openssl rand -base64 32
```

### 3. Environment-Specific Configs

- Use `balda.config.ts` for non-sensitive defaults
- Use environment variables for secrets and environment-specific values
- Use `$development`, `$production`, `$test` sections for env-specific overrides

### 4. Configuration in CI/CD

Set environment variables in your deployment platform:

**Heroku:**
```bash
heroku config:set DATABASE_URL=postgresql://...
heroku config:set JWT_SECRET=your-secret
```

**Docker Compose:**
```yaml
services:
  app:
    environment:
      - DATABASE_URL=postgresql://...
      - JWT_SECRET=${JWT_SECRET}
```

**Kubernetes:**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: balda-config
data:
  PORT: "3000"
  NODE_ENV: "production"
---
apiVersion: v1
kind: Secret
metadata:
  name: balda-secrets
data:
  DATABASE_URL: <base64-encoded>
  JWT_SECRET: <base64-encoded>
```

## Troubleshooting

### Configuration Not Loading

1. Check file location: `balda.config.ts` must be in project root
2. Check syntax: Ensure valid TypeScript/JavaScript
3. Check environment variables: Use `printenv | grep BALDA` or similar

### Validation Errors

Read error messages carefully - they specify:
- What's missing
- Where to set it (environment variable name)
- Valid values/ranges

### Type Errors

Configuration is fully typed. If you get type errors:
1. Check `src/server/config/schema.ts` for valid types
2. Ensure environment variables are properly converted (number, boolean)
3. Use TypeScript's type checking: `bun run check`

## Migration from Old Config

If migrating from direct `process.env` access:

**Before:**
```typescript
const port = Number(process.env.PORT ?? 3000)
const isProduction = process.env.NODE_ENV === 'production'
```

**After:**
```typescript
import { getConfig } from './config'
const config = getConfig()

const port = config.server.port
const isProduction = config.server.isProduction
```

## Further Reading

- [c12 Documentation](https://github.com/unjs/c12)
- [Environment Variables Best Practices](https://12factor.net/config)
- [TypeScript Configuration Patterns](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
