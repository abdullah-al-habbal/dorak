---
codeanchors:
  - backend/modules/
---

Part 5 of 8 · [02 — Product Requirements Document (PRD)](02-prd.md) · [Previous](02-prd-part-4.md) · [Next](02-prd-part-6.md)

## 12. Client Intelligence Engine

> Migrated from the standalone `prd.md`. This section extends the MVP scope with a personalized grooming discovery platform. How the backend is laid out: `11-backend-architecture.md`.

### 12.1 Context & Scope

Dorak currently operates a transactional core: brands own branches, branches own chairs, clients book chairs/barbers, and reviews build trust. Discovery is powered by proximity and universe filtering.

This section introduces the **Client Intelligence Layer** — a system that transforms Dorak from a booking utility into a personalized grooming discovery platform. It comprises five subsystems:

1. **Canonical Service Catalog** — A platform-wide taxonomy of service types (haircut styles, treatments) that barbers reference instead of inventing free-text entries.
2. **Client Service History** — A durable journal of what was actually performed on the client, enabling repeat-style bookings and portfolio tracking.
3. **Face-Profile & AI Onboarding** — Clients upload face photos; an AI model (3rd-party or internal Python service) analyzes face shape and recommends compatible styles.
4. **Interaction Tracking & Feedback Loop** — Captures every discovery interaction (views, searches, favorites) to fuel adaptive ranking.
5. **Graph-Based Recommendation Engine** — Replaces pure proximity ranking with a composite score derived from client preferences, style affinities, and behavioral edges.

### 12.2 Gap Analysis

| ID | Gap | Business Impact |
|----|-----|-----------------|
| G1 | **No canonical service taxonomy.** | Clients cannot search for "Fade" or "Layered Bob" as a platform concept. Barbers duplicate naming inconsistently. |
| G2 | **No client service history journal.** | Cannot rebook "the same cut as last time." No data for personalization. |
| G3 | **No face-profile system.** | AI-driven style recommendations are impossible without a structured face-shape data model. |
| G4 | **No interaction tracking.** | Discovery is "blind" — we do not learn from what users view, skip, or favorite. |
| G5 | **No recommendation graph.** | Ranking is purely geographic. Cannot suggest "clients like you chose this barber/style." |
| G6 | **No favorite/bookmark system.** | Users cannot save shops, barbers, or styles for later. Low engagement signal. |

### 12.3 Storage Architecture Decision

**Migrate from MySQL to PostgreSQL with the `pgvector` extension. Single database, no MongoDB. Use normalized tables, `vector` columns for embeddings, `JSON` for flexible metadata, and `fullText` indexes for bilingual keyword search.**

| Concern | PostgreSQL + pgvector | MySQL + JSON (Previous) | MongoDB (Rejected) |
|---------|----------------------|------------------------|-------------------|
| **Vector Search** | Native `whereVectorSimilarTo()` + HNSW indexes. Directly in query builder. | JSON column + manual scoring only. | Second connection, fragile cross-db transactions. |
| **Full-Text Search** | `whereFullText()` with `to_tsvector`, relevance scoring, stemming. | FULLTEXT indexes only on plain text columns. | — |
| **AI SDK Integration** | `laravel/ai` package: `SimilaritySearch` tool, `rerank()`, `Embeddings::for()`, all first-party. | No native AI integration. | Requires separate SDK. |
| **Laravel 13 Native** | Vector + full-text search built into query builder. | Community packages only. | No Laravel-native driver. |
| **Team Velocity** | Same Eloquent ORM, migrations, transactions. | No learning curve (status quo). | Learning MongoDB + new ORM. |

**Why PostgreSQL now:** Laravel 12 had no native vector support. **Laravel 13 changes this** with `$table->vector()`, `$table->vectorIndex()`, `whereVectorSimilarTo()`, `whereFullText()`, `rerank()`, and `SimilaritySearch` tool — all first-party, zero-external-service.
