# Legacy Migration Scripts

This directory contains one-time migration utilities that have already been run and are kept for historical reference.

## Archived Scripts

- **migrate-colors.ts** - Semantic color migration for Tailwind (completed)
- **migrate-imports.ts** - Import path migration to path aliases (completed)
- **migrate-to-postgres.ts** - File-based storage → PostgreSQL migration (completed)
- **migrate-users-to-postgres.ts** - User authentication migration (completed)

These scripts should **NOT** be run again on production data unless you know exactly what you're doing.

For active migration scripts, see the parent `/scripts` directory.
