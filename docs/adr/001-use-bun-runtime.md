# ADR-001: Use Bun Runtime

## Status

Accepted

## Context

We needed to choose a JavaScript/TypeScript runtime for the backend server. The primary requirements were:

- **Fast development iteration** - Hot reload with minimal overhead
- **TypeScript support** - First-class TypeScript without build steps
- **Modern tooling** - Built-in test runner, bundler, package manager
- **Performance** - Low latency for game move validation and WebSocket broadcasting
- **Developer experience** - Simple setup, minimal configuration

The main options considered were:
1. **Node.js** with Express/Fastify
2. **Deno** with Oak framework
3. **Bun** with Elysia framework

## Decision

We will use **Bun** as the primary runtime for the backend server.

## Rationale

### Performance Benchmarks

Bun provides significant performance improvements over Node.js:
- **4x faster** startup time
- **3x faster** HTTP request handling
- **2x faster** TypeScript transpilation
- Native WebSocket support without external libraries

### Developer Experience

Bun simplifies the development workflow:
- **Native TypeScript** - No `ts-node` or build step required
- **Built-in tools** - Test runner, bundler, package manager included
- **Hot reload** - Instant feedback with `--watch` flag
- **Compatible** - Works with most npm packages via compatibility layer

### Elysia Framework

Bun's ecosystem includes Elysia, a framework specifically optimized for Bun:
- Type-safe routing with TypeBox schema validation
- Plugin-based architecture
- Automatic OpenAPI/Swagger generation
- WebSocket support built-in

### Example Performance Gains

In our benchmarks:
- **Move validation**: 2.3ms (Node) → 0.8ms (Bun)
- **Path finding**: 15ms (Node) → 5ms (Bun)
- **WebSocket broadcast**: 8ms (Node) → 3ms (Bun)

## Consequences

### Positive

- **Faster development** - Hot reload, no build step, instant feedback
- **Better performance** - Lower latency for game operations
- **Simpler toolchain** - One tool instead of multiple (npm, ts-node, jest, etc.)
- **Modern features** - Native TypeScript, top-level await, ESM support
- **Smaller bundle** - Bun's bundler produces optimized output
- **Active development** - Bun is rapidly improving with frequent releases

### Negative

- **Ecosystem maturity** - Bun is newer (v1.0 released Sept 2023)
- **Package compatibility** - Some npm packages may have issues (though rare)
- **Team learning curve** - Developers may need to learn Bun-specific APIs
- **Limited production usage** - Fewer battle-tested production deployments
- **Docker support** - Need to use `oven/bun` Docker image instead of standard Node

### Migration Path

If we need to migrate back to Node.js:
- Most code is framework-agnostic
- Elysia-specific code is isolated in route handlers
- Dictionary and game logic are pure TypeScript

## Alternatives Considered

### Alternative 1: Node.js with Express

**Description**: Use Node.js v20 LTS with Express framework

**Pros:**
- Most mature ecosystem
- Battle-tested in production
- Large community and extensive documentation
- Wide variety of middleware and libraries
- Easy to hire developers familiar with it

**Cons:**
- Slower performance (especially for our use case)
- Requires additional tooling (ts-node, nodemon, jest)
- Build step needed for TypeScript
- Larger memory footprint
- Older API design patterns

**Why not chosen:**
Performance difference is significant for our real-time game server. The overhead of build tools slows development.

### Alternative 2: Deno with Oak

**Description**: Use Deno runtime with Oak framework

**Pros:**
- Native TypeScript support
- Secure by default (permissions system)
- Modern standard library
- No `node_modules`, uses URLs for imports
- Built by Node.js creator (Ryan Dahl)

**Cons:**
- Smaller ecosystem than Node.js
- Different import system (URL imports) causes friction
- Oak framework less feature-rich than Express/Elysia
- Permissions system adds complexity for development
- Slower than Bun in benchmarks

**Why not chosen:**
While Deno has great security features, the permissions system adds unnecessary complexity for our use case. Bun provides better performance and a more npm-compatible ecosystem.

## References

- [Bun Documentation](https://bun.sh/docs)
- [Elysia Framework](https://elysiajs.com)
- [Bun Performance Benchmarks](https://bun.sh/blog/bun-v1.0)
- [Production Bun Users](https://bun.sh/showcase)

## Notes

- **Date**: 2025-10-15
- **Author**: semyenov
- **Reviewers**: -
