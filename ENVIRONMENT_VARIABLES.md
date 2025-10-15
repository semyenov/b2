# Environment Variables

This document lists all the environment variables used by the Balda game application.

## Required Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (Optional - if not set, uses file-based storage)
# For local development with Docker Compose:
# DATABASE_URL=postgresql://balda:balda@localhost:5432/balda

# Storage Configuration
STORAGE_DIR=./data/games

# Dictionary Configuration
DICT_PATH=./data/dictionaries/russian.txt

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# Logging Configuration
LOG_LEVEL=debug
LOG_FORMAT=pretty
```

## Environment Variable Descriptions

### Server Configuration
- **PORT**: Port number for the server (default: 3000)
- **NODE_ENV**: Environment mode - 'development' or 'production'

### Database Configuration
- **DATABASE_URL**: PostgreSQL connection string. If not set, the application uses file-based storage.
  - For local development with Docker Compose: `postgresql://balda:balda@localhost:5432/balda`
  - Database credentials from docker-compose.yml: username=`balda`, password=`balda`, database=`balda`

### Storage Configuration
- **STORAGE_DIR**: Directory for storing game data files (default: ./data/games)

### Dictionary Configuration
- **DICT_PATH**: Path to the dictionary file (default: ./data/dictionaries/russian.txt)

### JWT Authentication
- **JWT_SECRET**: Secret key for JWT token signing
- **JWT_REFRESH_SECRET**: Secret key for refresh token signing

### Logging Configuration
- **LOG_LEVEL**: Logging level - 'debug', 'info', 'warn', 'error' (default: 'debug' in development, 'info' in production)
- **LOG_FORMAT**: Log format - 'pretty' or 'json' (default: 'pretty' in development, 'json' in production)

## Local Development Setup

For local development with Docker Compose:

1. Start the PostgreSQL database: `docker-compose up -d postgres`
2. Set `DATABASE_URL=postgresql://balda:balda@localhost:5432/balda` in your `.env` file
3. The database will be automatically initialized with migrations from `./src/server/db/migrations`

## Production Setup

For production deployment:

1. Set `NODE_ENV=production`
2. Configure a PostgreSQL database and set `DATABASE_URL`
3. Use strong, unique values for `JWT_SECRET` and `JWT_REFRESH_SECRET`
4. Set appropriate logging levels for production monitoring
