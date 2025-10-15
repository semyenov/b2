# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for the Balda word game project.

## What are ADRs?

An Architecture Decision Record (ADR) is a document that captures an important architectural decision made along with its context and consequences.

Each ADR describes:
- **Status**: Proposed, accepted, deprecated, superseded
- **Context**: The situation that led to the decision
- **Decision**: What was decided
- **Rationale**: Why this decision was made
- **Consequences**: The positive and negative outcomes

## Index

1. [ADR-001: Use Bun Runtime](./001-use-bun-runtime.md)
2. [ADR-002: Immutable Game State](./002-immutable-game-state.md)
3. [ADR-003: File-Based Storage with PostgreSQL Migration Path](./003-file-based-storage.md)
4. [ADR-004: TypeBox for Runtime Validation](./004-typebox-validation.md)

## Creating a New ADR

When making a significant architectural decision:

1. Copy the template below
2. Name it `00X-short-title.md` (increment number)
3. Fill in all sections
4. Submit as part of your PR

### ADR Template

```markdown
# ADR-XXX: [Title]

## Status

[Proposed | Accepted | Deprecated | Superseded by ADR-YYY]

## Context

Describe the situation and the problem we're trying to solve.
Include:
- What prompted this decision?
- What constraints exist?
- What alternatives were considered?

## Decision

We will [decision statement].

## Rationale

Explain why this decision was made:
- What are the key benefits?
- How does it solve the problem?
- What makes it better than alternatives?

## Consequences

### Positive

- List the positive outcomes
- Include both immediate and long-term benefits

### Negative

- List the negative outcomes or tradeoffs
- Be honest about limitations

## Alternatives Considered

### Alternative 1: [Name]

- Description
- Pros
- Cons
- Why it wasn't chosen

### Alternative 2: [Name]

- Description
- Pros
- Cons
- Why it wasn't chosen
```

## References

- [ADR GitHub Organization](https://adr.github.io/)
- [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
