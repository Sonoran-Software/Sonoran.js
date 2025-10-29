# Codex Review Instructions

## Context
- Branch naming: feat/*, fix/*, tweak/*
- Target: merge to `staging` after preview validation

## What to prioritize
1. Security pitfalls (injection, authz, secret handling)
2. Reliability & edge cases
3. Breaking changes / migration notes
4. Performance hotspots (N+1, O(n^2), heavy I/O)
5. Code style & maintainability (prefer actionable diffs)
6. Any new English words, phrases, or sentences should be added as an i18n key

## Project-specific rules
- Backend: Prefer async handlers for network I/O.
- Frontend: Avoid blocking renders; use Suspense on data boundaries.
- Infra: Terraform modules must be idempotent and tagged.

## Test expectations
- New endpoints/components: at least 1 direct test.
- Bug fixes: a regression test.

> If you recommend changes, include concrete diffs.
