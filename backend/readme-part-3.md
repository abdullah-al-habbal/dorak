---
nodeid: backend.readme.part-3
parentnode: backend.readme
childnodes: []
codeanchors:
  - backend/modules/
---

Part 3 of 3 · [Dorak Backend (دورك)](README.md) · [Previous](readme-part-2.md)

## AI Agent Guidance

AI coding agents (like Claude Code, OpenCode) should read:

- `AGENTS.md` – concise overview and conventions.
- `.claude/skills/` – detailed skill files for architecture, coding standards, CQRS, testing, naming, etc.
- `docs/` – product requirements, C4 diagrams, house rules, and more (see `docs/README.md`).

These files are the **source of truth** for any future development.

## Testing

Tests live in the root `tests/` directory under `Unit`, `Integration`, and `Feature` subdirectories.  
Integration and feature tests use a real MySQL database (defined in `.env.testing`) and the `RefreshDatabase` trait.

```bash
php artisan test                 # all tests
php artisan test --filter Core   # only Core-related tests
```

## Deployment

- The application is ready for shared hosting (Hostinger, etc.) or any PHP‑capable server.
- Run `php artisan optimize` before deploying.
- Ensure all `.env` variables are set in production, especially `APP_KEY`, database credentials, and social login secrets.

## Contributing

1. Read `AGENTS.md` and the `.claude/skills/` files.
2. Create a new branch per feature.
3. Follow the established naming conventions and code rules.
4. Write tests in the `tests/` directory.
5. Ensure `composer test` passes before pushing.

## License

Proprietary – all rights reserved.
