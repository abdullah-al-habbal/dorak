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
- **Filament** 3.x (admin & client panels)
- **Spatie** packages: Translatable, Laravel Permission
- **Laravel** Pennant (feature flags), Sanctum (API tokens), Socialite (social login)
- **Pest** / PHPUnit for testing, **Larastan** for static analysis

## Getting Started

### 1. Clone & Install

```bash
git clone git@github-dbnkalhbalbgmail:abdullah-al-habbal/dorak-backend.git
cd backend
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

## Continued in

- [Part 2: 4. Development](readme-part-2.md)
- [Part 3: AI Agent Guidance](readme-part-3.md)
