---
nodeid: backend.readme
parentnode: backend.guide
childnodes:
  - backend.readme.part-2
  - backend.readme.part-3
codeanchors:
  - backend/modules/
---

# Dorak Backend (دورك)

A modular, multi‑tenant Laravel backend for the **Dorak** salon and barber shop community platform in Syria.  
Built for a dual‑universe consumer app (Men's Grooming & Women's Beauty), with an interactive floor‑plan booking system, B2B job marketplace, and offline‑resilient architecture.

## Tech Stack

- **PHP** 8.3+ & **Laravel** 13.x
- **MySQL** 8.0 (primary database)
- **Flutter** (client app, API consumed via Sanctum)
- **Spatie** packages: Translatable, Laravel Permission
- **Laravel** Pennant (feature flags), Sanctum (API tokens), Socialite (social login)
- **Pest** / PHPUnit for testing

## Getting Started

### 1. Clone & Install

```bash
git clone git@github-dbnkalhbalbgmail:abdullah-al-habbal/dorak.git
cd dorak/backend
composer install
```

### 2. Environment

Copy `.env.example` to `.env` and fill in your database, mail, and social provider credentials.  
All `env()` calls in config have **no defaults**, so every key must be present in your `.env` file.

```bash
cp .env.example .env
php artisan key:generate
```

### 3. Database

Create a MySQL database and set credentials in `.env`.  
Then run migrations and seeders:

```bash
php artisan migrate
php artisan db:seed
```

### Tests and current state

```bash
composer test:db:up   # MySQL 8.4 test server on 127.0.0.1:3307, database dorak_test
composer test         # Pest, sequential only (never --parallel)
vendor/bin/pint --test
```

Dev URLs, the latest verified results and what is released versus only local are recorded, with dates, in [dev environment status](../docs/deployment/dev-environment-status.md). Arabic wording rules (barber key, المصفف label) are in [localization of machine keys](../docs/architecture/localization-of-machine-keys.md).

## Continued in

- [Part 2: 4. Development](readme-part-2.md)
- [Part 3: AI Agent Guidance](readme-part-3.md)
