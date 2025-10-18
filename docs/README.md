# Balda Documentation

This directory contains all project documentation organized for easy navigation.

## 📚 Documentation Structure

```
docs/
├── README.md (this file)
├── guides/           # Step-by-step setup and deployment guides
│   ├── DATABASE_MIGRATION_GUIDE.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── DICTIONARY_SETUP_POSTGRES.md
│   ├── DOCKER.md
│   ├── PRODUCTION_READY.md
│   └── QUICK_START_DICTIONARY.md
└── archived/         # Historical analysis and session documentation
    ├── AI_FIX.md
    ├── ARCHITECTURE_DIAGRAM.md
    ├── DEVELOPMENT_DOCKER.md
    ├── DOCKER_BUILD.md
    ├── DOCKER_SETUP.md
    ├── FIXES.md
    ├── FRONTEND_ANALYSIS.md
    ├── FRONTEND_SUMMARY.md
    ├── PROBLEMS.md
    ├── SESSION_SUMMARY.md
    ├── WEB_ARCHITECTURE.md
    └── WEB_FRONTEND.md
```

## 🚀 Quick Start Guides

### For Developers
1. **Getting Started**: See main [README.md](../README.md)
2. **Project Architecture**: See [CLAUDE.md](../CLAUDE.md) (project instructions)
3. **CLI Development**: See [CLI_GUIDE.md](../CLI_GUIDE.md)

### For DevOps/Deployment
1. **Docker Deployment**: [guides/DOCKER.md](guides/DOCKER.md)
2. **Production Deployment**: [guides/DEPLOYMENT_GUIDE.md](guides/DEPLOYMENT_GUIDE.md)
3. **Production Checklist**: [guides/PRODUCTION_READY.md](guides/PRODUCTION_READY.md)

### For Database Setup
1. **Database Migrations**: [guides/DATABASE_MIGRATION_GUIDE.md](guides/DATABASE_MIGRATION_GUIDE.md)
2. **Dictionary Setup**: [guides/DICTIONARY_SETUP_POSTGRES.md](guides/DICTIONARY_SETUP_POSTGRES.md)
3. **Quick Dictionary Import**: [guides/QUICK_START_DICTIONARY.md](guides/QUICK_START_DICTIONARY.md)

## 📂 Root-Level Documentation

The following docs remain in the project root for easy access:

- **README.md** - Main project overview and quick start
- **CLAUDE.md** - Project instructions for Claude Code (development reference)
- **CHANGELOG.md** - Version history and release notes
- **CONTRIBUTING.md** - Contribution guidelines
- **CLI_GUIDE.md** - CLI frontend documentation
- **ARCHITECT.md** - High-level architecture overview
- **CLEANUP_SUMMARY.md** - Recent codebase cleanup summary

## 🗄️ Archived Documentation

The `archived/` directory contains historical analysis documents and session summaries that provide context for past development decisions but are not needed for day-to-day development.

**Note**: These are kept for reference only. For current architecture information, see CLAUDE.md and ARCHITECT.md.

## 📝 Contributing to Documentation

When adding new documentation:
1. **Guides** (how-to, setup instructions) → `docs/guides/`
2. **Analysis** (one-time research, session notes) → `docs/archived/`
3. **Core project info** (architecture, contributing) → Project root

Keep documentation:
- **Concise** - Link to external resources rather than duplicating
- **Current** - Update when features change
- **Searchable** - Use clear headings and keywords
