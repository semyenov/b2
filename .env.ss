# Balda Game Server - Environment Variables
# Copy this file to .env and update values for your environment
# Configuration uses c12 (smart config loader) - see balda.config.ts for defaults

# ============================================================================
# SERVER CONFIGURATION
# ============================================================================

# Server port (default: 3000)
PORT=80

# Server hostname (default: localhost)
HOST=localhost

# Node environment: development, production, or test (default: development)
NODE_ENV=production

# Request timeout in milliseconds (default: 30000 = 30 seconds)
REQUEST_TIMEOUT=30000

# Request body size limit in bytes (default: 10485760 = 10 MB)
BODY_LIMIT=10485760

# Graceful shutdown timeout in milliseconds (default: 10000 = 10 seconds)
SHUTDOWN_TIMEOUT=10000

# Trust proxy headers (X-Forwarded-*) - set to true when behind Nginx/HAProxy (default: false)
TRUST_PROXY=false

# ============================================================================
# DATABASE CONFIGURATION
# ============================================================================

# PostgreSQL connection URL (REQUIRED)
# Format: postgresql://username:password@host:port/database
DATABASE_URL=postgresql://balda:balda@localhost:5432/balda

# Maximum number of database connections in the pool (default: 20)
DB_MAX_CONNECTIONS=20

# Idle connection timeout in seconds (default: 20)
DB_IDLE_TIMEOUT=20

# Connection timeout in seconds (default: 10)
DB_CONNECT_TIMEOUT=10

# Use prepared statements for performance (default: true)
DB_PREPARED_STATEMENTS=true

# ============================================================================
# JWT AUTHENTICATION
# ============================================================================

# JWT secret for signing access tokens (REQUIRED FOR PRODUCTION)
# Generate with: openssl rand -base64 32
JWT_SECRET=868534c9baab1e5a394f19cc2bddd8b7b8ee107abc8ad3ef29e7df9b156f9651

# JWT secret for signing refresh tokens (REQUIRED FOR PRODUCTION)
# Generate with: openssl rand -base64 32
JWT_REFRESH_SECRET=bc38dcde8329e3972ed7f6e64432c1846d0305b2120f0187ede57c7c8bf91cd8

# Access token expiration time (default: 1h)
# Examples: 15m, 1h, 2d
JWT_ACCESS_TOKEN_EXPIRY=1h

# Refresh token expiration time (default: 7d)
# Examples: 7d, 30d, 90d
JWT_REFRESH_TOKEN_EXPIRY=7d

# ============================================================================
# LOGGING CONFIGURATION
# ============================================================================

# Log level: debug, info, warn, error, silent (default: info in production, debug in development)
LOG_LEVEL=debug

# Log format: json or pretty (default: json in production, pretty in development)
LOG_FORMAT=pretty

# Enable colored output (default: true in development, false in production)
LOG_COLORS=true

# ============================================================================
# RATE LIMITING
# ============================================================================

# Enable rate limiting (default: true)
RATE_LIMIT_ENABLED=true

# Rate limit window duration in milliseconds (default: 60000 = 1 minute)
RATE_LIMIT_DURATION=60000

# Maximum requests per window per IP (default: 100)
RATE_LIMIT_MAX=100

# ============================================================================
# CORS CONFIGURATION
# ============================================================================

# CORS allowed origins (default: true for all origins)
# Use "true" for all origins, or comma-separated list of domains
# Examples: "true", "http://localhost:5173,https://balda.example.com"
CORS_ORIGIN=true

# Allow credentials in CORS requests (default: true)
CORS_CREDENTIALS=true

# ============================================================================
# DICTIONARY CONFIGURATION
# ============================================================================

# Path to dictionary file (one word per line, optional)
# Included: 50,910 Russian words in ./data/dictionaries/russian.txt
DICT_PATH=./data/dictionaries/russian.txt

# Allow all words (testing only, default: false)
DICT_ALLOW_ALL=false

# ============================================================================
# STORAGE CONFIGURATION
# ============================================================================

# Directory for storing game data (default: ./data/games)
STORAGE_DIR=./data/games

# ============================================================================
# WEBSOCKET CONFIGURATION
# ============================================================================

# Archive delay for inactive games in milliseconds (default: 300000 = 5 minutes)
WS_ARCHIVE_DELAY_MS=300000

# Maximum concurrent WebSocket connections per server instance (default: 1000)
WS_MAX_CONNECTIONS=1000

# Keep-alive ping interval in milliseconds (default: 30000 = 30 seconds)
WS_PING_INTERVAL=30000

# Timeout waiting for pong response in milliseconds (default: 10000 = 10 seconds)
WS_PONG_TIMEOUT=10000

# ============================================================================
# API DOCUMENTATION (SWAGGER)
# ============================================================================

# Enable Swagger UI (default: true in development, false in production)
SWAGGER_ENABLED=true

# Swagger UI path (default: /swagger)
SWAGGER_PATH=/swagger

# ============================================================================
# SECURITY HEADERS (OWASP Compliance)
# ============================================================================

# Enable security headers (default: false in dev, true in prod)
SECURITY_ENABLED=true

# HTTP Strict Transport Security (HSTS)
HSTS_ENABLED=true
HSTS_MAX_AGE=31536000
HSTS_INCLUDE_SUBDOMAINS=true
HSTS_PRELOAD=true

# Content Security Policy (CSP) - configured in balda.config.ts
CSP_ENABLED=true

# X-Frame-Options header (default: DENY)
FRAME_OPTIONS=DENY

# X-Content-Type-Options (default: nosniff)
CONTENT_TYPE_OPTIONS=true

# X-XSS-Protection (default: enabled)
XSS_PROTECTION=true

# ============================================================================
# COMPRESSION
# ============================================================================

# Enable response compression (default: true)
COMPRESSION_ENABLED=true

# Compression level 0-9, higher = better compression but slower (default: 6)
COMPRESSION_LEVEL=6

# Minimum response size to compress in bytes (default: 1024 = 1 KB)
COMPRESSION_THRESHOLD=1024

# ============================================================================
# HEALTH CHECK
# ============================================================================

# Enable health check endpoint (default: true)
HEALTH_CHECK_ENABLED=true

# Health check endpoint path (default: /health)
HEALTH_CHECK_PATH=/health

# Health check timeout in milliseconds (default: 5000 = 5 seconds)
HEALTH_CHECK_TIMEOUT=5000

# Include detailed system metrics (default: false in prod, true in dev)
HEALTH_CHECK_DETAILED=false

# ============================================================================
# MONITORING & APM (Application Performance Monitoring)
# ============================================================================

# Enable monitoring (default: false in dev, true in prod)
MONITORING_ENABLED=false

# Sentry DSN for backend error tracking
# Generate DSN at https://sentry.io after creating a project
# SENTRY_DSN=

# Sentry environment name (default: same as NODE_ENV)
SENTRY_ENVIRONMENT=production

# Sentry sample rate 0.0-1.0, 1.0 = 100% of errors sent (default: 1.0)
SENTRY_SAMPLE_RATE=1.0

# Enable Prometheus metrics endpoint (default: false)
PROMETHEUS_ENABLED=false

# Prometheus metrics path (default: /metrics)
PROMETHEUS_PATH=/metrics

# Enable request correlation IDs for tracing (default: true)
CORRELATION_ENABLED=true

# ============================================================================
# CACHE (Redis)
# ============================================================================

# Enable caching (default: false)
# Requires Redis connection - significantly improves performance
CACHE_ENABLED=false

# Redis connection URL
# Examples:
#   Local: redis://localhost:6379
#   Auth:  redis://:password@localhost:6379
#   TLS:   rediss://user:password@host:6380
# REDIS_URL=

# Redis key prefix for namespacing (default: balda:)
REDIS_KEY_PREFIX=balda:

# Default cache TTL in seconds (default: 3600 = 1 hour)
REDIS_DEFAULT_TTL=3600

# Max memory eviction policy (default: allkeys-lru)
# Options: allkeys-lru, allkeys-lfu, volatile-lru, volatile-lfu, volatile-ttl
REDIS_MAX_MEMORY_POLICY=allkeys-lru

# ============================================================================
# GAME CONFIGURATION
# ============================================================================

# Allowed board sizes (comma-separated, default: 3,4,5,6,7)
GAME_ALLOWED_BOARD_SIZES=3,4,5,6,7

# Default board size (default: 5)
GAME_DEFAULT_BOARD_SIZE=5

# Turn timeout in seconds, 0 = no limit (default: 0)
GAME_TURN_TIMEOUT=0

# Maximum concurrent games per user (default: 10)
GAME_MAX_CONCURRENT=10

# Auto-archive inactive games after N hours (default: 24)
GAME_AUTO_ARCHIVE_HOURS=24

# Maximum players per game (default: 4)
GAME_MAX_PLAYERS=4

# ============================================================================
# AI PLAYER CONFIGURATION
# ============================================================================

# AI thinking delay in milliseconds for more natural feel (default: 1500)
AI_THINKING_DELAY=0

# AI difficulty level: easy, medium, hard (default: medium)
AI_DIFFICULTY=medium

# Maximum suggestions AI considers (default: 100)
AI_MAX_SUGGESTIONS=100

# Use occasional random moves for easy difficulty (default: true)
AI_RANDOMIZE_EASY=true

# ============================================================================
# FEATURE FLAGS
# ============================================================================

# Enable AI players (default: true)
FEATURE_AI_PLAYERS=true

# Enable multiplayer mode (default: true)
FEATURE_MULTIPLAYER=true

# Enable game suggestions (default: true)
FEATURE_SUGGESTIONS=true

# Enable user authentication (default: false, future feature)
FEATURE_AUTHENTICATION=false

# Enable leaderboards (default: false, future feature)
FEATURE_LEADERBOARDS=false

# ============================================================================
# MAINTENANCE MODE
# ============================================================================

# Enable maintenance mode (default: false)
# When enabled, only allowed IPs can access the server
MAINTENANCE_ENABLED=false

# Maintenance message to display
MAINTENANCE_MESSAGE=System is under maintenance. Please try again in a few minutes.

# IP addresses allowed during maintenance (comma-separated, default: empty)
# Example: 127.0.0.1,192.168.1.100
# MAINTENANCE_ALLOWED_IPS=

# Estimated completion time (ISO 8601 datetime, optional)
# Example: 2025-10-18T12:00:00Z
# MAINTENANCE_ESTIMATED_END=

# ============================================================================
# WEB FRONTEND CONFIGURATION (for Vite)
# ============================================================================

# Backend API URL for web frontend (default: http://localhost:3000)
VITE_API_URL=http://localhost:3000

# Sentry DSN for frontend error tracking
# VITE_SENTRY_DSN=

# ============================================================================
# DEVELOPMENT TOOLS
# ============================================================================

# Enable Drizzle Studio for database management (default: false)
# ENABLE_DRIZZLE_STUDIO=false

# Drizzle Studio port (default: 4983)
# DRIZZLE_STUDIO_PORT=4983
