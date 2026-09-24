question samples: when a card is dimissed, and there arent new ones (so we less than 50), what do?
want warning and render buffer - face gate!
""
• Your project already aligns well with several Waymark requirements:

  - React and TypeScript
  - PostgreSQL
  - Dockerized local development
  - API/backend work
  - background workers and asynchronous events
  - automated tests and CI

  The biggest opportunity is to make it demonstrate maintainability, reliability, and product thinking—not add more
  technologies.

  ### 1. Add a messaging-like workflow

  The current discovery feed is event-driven, but it does not feel like a product workflow. Add an “activity inbox” or
  notification system:

  - Store lifecycle events in PostgreSQL.
  - Generate notifications when tokens are discovered, promoted, or expire.
  - Add read/unread state.
  - Add filtering and pagination.
  - Expose the workflow through tested API endpoints.
  - Render it in React.

  This would map naturally to Waymark’s messaging-platform work while staying honest about the project’s domain.

  ### 2. Make worker recovery durable

  Replace the in-memory graduation watch with persisted state or reconstruct it from PostgreSQL on startup.

  That gives you a strong engineering story:

  > “The worker can restart without losing pending lifecycle work.”

  This is more valuable for the job than adding another UI feature.

  ### 3. Strengthen the testing story

  Add and document:

  - backend unit tests for classification and lifecycle rules
  - PostgreSQL integration tests
  - frontend component and API tests
  - one Compose-based smoke test
  - TypeScript, lint, test, and build checks in CI

  Also update CI to run on development or all pull requests, not only main.

  ### 4. Consider a small Elixir/Phoenix companion

  Waymark explicitly says Elixir experience is not required, so do not rewrite the project just to use Elixir. A better
  option would be a small bounded experiment:

  - Phoenix endpoint accepting notification events
  - pattern matching and validation
  - PostgreSQL persistence
  - a few ExUnit tests
  - short README explaining why it is separate

  This demonstrates curiosity and functional-programming interest without making the main project harder to understand.

  ### 5. Add collaboration artifacts

  Create a few realistic GitHub issues and document decisions such as:

  - Why polling instead of WebSockets?
  - What happens when the listener restarts?
  - How are duplicate events handled?
  - How would this scale?
  - What are the production limitations?

  Include a quick-start guide, architecture diagram, test commands, screenshots, and a short demo video.

  ### Recommended order

  1. Normalize the line endings and make Compose reproducible.
  2. Fix the frontend dependency-volume workflow.
  3. Add durable worker recovery.
  4. Expand tests and CI.
  5. Add the notification/activity workflow.
  6. Explore a small Phoenix service only if time remains.

  I would not force healthcare functionality into this project. For Waymark, present it as evidence that you can build
  reliable, tested, containerized products with React, PostgreSQL, APIs, and asynchronous workflows.
 ### 1. Add real tests

  This is the biggest gap relative to “clean, maintainable, and well-tested code.”

  At minimum, add backend tests for:

  - Solana versus non-Solana filtering
  - Pump.fun, PumpSwap, and Raydium classification
  - discovery upsert behavior
  - preventing graduated tokens from being downgraded
  - API response shape
  - health-check behavior
  - graduation expiry and promotion logic

  Use pytest and FastAPI’s test client. A small PostgreSQL integration test suite would be even better.

  For the frontend, at least ensure:

  npm run lint
  npm run build

  run successfully in CI.

  ### 2. Make worker recovery durable

  The graduation watch is currently an in-memory dictionary:

  graduation_watch: dict[str, dict] = {}

  If the listener restarts, it forgets which Pump.fun tokens were being monitored. That is a meaningful reliability
  weakness.

  Persist watch state in PostgreSQL, or rebuild the watch list on startup from discoveries with status = "watching".

  This would give you a strong production-engineering story:

  > “The worker is stateless with respect to recovery; pending lifecycle work is reconstructed from PostgreSQL.”

  ### 3. Improve configuration and deployment behavior

  The worker currently hard-codes:

  API_URL = "http://api:8000"

  Move service URLs, polling intervals, and external API URLs into settings/environment variables.

  Also make startup safer:

  - run migrations through an explicit deployment command or entrypoint
  - add database readiness checks
  - distinguish liveness from readiness health endpoints
  - make API and worker configuration consistent

  ### 4. Add CI

  A GitHub Actions workflow should run:

  - Python formatting/linting
  - pytest
  - frontend linting
  - frontend TypeScript/build checks
  - Docker image builds

  This directly demonstrates maintainability, collaboration readiness, and production discipline.

  ### 5. Tighten the documentation

  The README is extensive, which is good, but it currently overstates some functionality and has a few mismatches:

  - It documents /health, while the implementation exposes /health/api.
  - It says migrations are part of the system, but Compose does not apply them automatically.
  - Trading is clearly UI-only and should remain labeled that way.
  - Add a concise “Quick Start,” architecture diagram, API examples, testing instructions, and known limitations.

  A reviewer should be able to clone the repository and understand it in five minutes.

  ## Strong optional improvements

  These would make the project stand out, but are not required before applying:

  - Add structured logging.
  - Add retry/backoff handling for DexScreener REST calls.
  - Add rate-limit handling.
  - Add a small event model or audit table for lifecycle transitions.
  - Add Docker Compose integration testing.
  - Deploy a demo API/frontend somewhere accessible.
  - Add a short architecture walkthrough video or screenshots.
  - Add an issue tracker with a few well-written feature and bug issues.

  I would not spend time implementing real crypto trading or wallet integration for this application. It introduces
  security and blockchain complexity without helping much with the role’s core evaluation criteria.

  ## How I would position it

  Present it as an event-driven data platform, not primarily as a trading app:

  > Built a containerized Python/FastAPI system that consumes live external WebSocket events, hydrates records through
  > REST APIs, classifies token lifecycle states, persists idempotently to PostgreSQL, and serves a React dashboard with
  > health monitoring and polling-based updates.

  That description maps directly to Voltus’s work with APIs, data pipelines, distributed services, and production
  systems.

  ## Practical threshold before applying

  I would apply once you have:

  - meaningful automated backend tests
  - a working frontend build
  - durable worker recovery
  - CI passing
  - corrected documentation
  - a clear README and architecture diagram
  - no misleading claims about unfinished trading features

  At that point, the project would be a credible portfolio demonstration for this entry-level role. The current stack
  match is already strong; the next step is demonstrating engineering quality and reliability rather than adding more
  technologies.
  ""

# TerMEMEal

TerMEMEal is a containerized Solana token discovery dashboard. It consumes token-profile events from DexScreener, enriches them with pair data, tracks a small token lifecycle, stores discoveries in PostgreSQL, and presents them in a React dashboard.

The trade panel is currently a paper-mode UI. It collects no wallet information and does not execute trades.

## Current scope

Implemented:

- Solana token-profile ingestion from DexScreener
- REST hydration of token pair data
- support for Pump.fun, PumpSwap, and Raydium classification
- Pump.fun graduation monitoring
- PostgreSQL-backed discovery records with conflict-safe upserts
- FastAPI discovery and health endpoints
- React discovery feed with five-second polling
- service-status display and custom feed scrolling
- Docker Compose development and isolated PostgreSQL integration tests
- GitHub Actions checks for backend tests, frontend tests, lint, and build

Not implemented:

- real trading or wallet integration
- authentication or multi-user state
- token images or market charts
- a browser-based full-stack test
- durable recovery of the listener's in-memory graduation watch
- production deployment configuration

## Architecture

```text
DexScreener WebSocket
          │ token profiles
          ▼
  backend listener ── REST hydration ──► DexScreener API
          │
          │ upsert discoveries / heartbeat
          ▼
      PostgreSQL ◄────────────── FastAPI API
          ▲                              │
          └──────────── React frontend ◄─┘
                 polling every 5 seconds
```

The API and listener are separate processes that share the backend code and database. The frontend talks only to the API; it never connects directly to DexScreener or PostgreSQL.

## Technology stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, TanStack Query, Bootstrap, CSS |
| Backend | Python 3.12, FastAPI, Pydantic Settings, SQLAlchemy, psycopg, aiohttp, websockets |
| Database | PostgreSQL, Alembic migrations |
| Tooling | Docker, Docker Compose, pytest, Vitest, Testing Library, oxlint, GitHub Actions |

## Runtime components

### Frontend

The Vite-served React application is composed of:

- `Header`: branding, wallet-disconnected indicator, and service health status
- `DiscoveryFeed`: queries discoveries, renders loading/error/empty states, and reverses the API result for display
- `TokenCard`: displays a token's name, symbol, shortened address, source, time, and lifecycle status
- `DiscoveryScroll`: keyboard and pointer controls for the horizontal feed
- `TradePanel`: static paper-mode form for a future trading workflow

TanStack Query owns server state. The discovery feed and header each refetch on a five-second interval.

### FastAPI API

The API creates database sessions through SQLAlchemy, delegates discovery queries to a service/repository layer, and serializes database fields into the frontend's camelCase contract.

### Listener

`backend/app/workers/listener.py` runs as a separate long-lived process:

1. Connect to DexScreener's token-profile WebSocket.
2. Ignore non-Solana profiles and profiles without a token address.
3. Hydrate each accepted address through DexScreener's token REST endpoint.
4. Classify supported pairs by `dexId`.
5. Persist PumpSwap/Raydium discoveries as `new`.
6. Persist Pump.fun discoveries as `watching` and keep them in an in-memory graduation watch.
7. Poll watched tokens every 60 seconds. A token that later has a PumpSwap pair becomes `graduated`; watches older than three hours expire.
8. Send a heartbeat to the API every five seconds and reconnect with exponential backoff when the WebSocket fails.

The listener uses `asyncio` for network work and moves synchronous database persistence to a worker thread.

## Discovery data model

The `discoveries` table contains:

| Field | Purpose |
| --- | --- |
| `id` | Primary key |
| `token_address` | Unique Solana token address |
| `pair_address` | Pair address, when available |
| `name`, `symbol` | Display metadata from the hydrated pair |
| `source` | Current source label, `DexScreener` |
| `exchange` | Normalized DEX identifier |
| `status` | `new`, `watching`, or `graduated` |
| `discovered_at` | Database creation time |
| `graduated_at` | Time of PumpSwap promotion, when applicable |
| `dismissed_at` | Reserved for future dismissal behavior |

Upserts are keyed by `token_address`, so repeated events update one record instead of creating duplicates. A graduated record cannot be downgraded by a later event. The API currently returns up to 50 non-dismissed discoveries, newest first.

## API

Local API URL: `http://localhost:8000`

Interactive documentation: `http://localhost:8000/docs`

### `GET /api/discoveries`

Returns the active discovery feed:

```json
[
  {
    "id": 12,
    "name": "Example Token",
    "symbol": "EXAMPLE",
    "tokenAddress": "ExampleSolanaAddress",
    "pairAddress": "ExamplePairAddress",
    "source": "DexScreener",
    "exchange": "pumpswap",
    "discoveredAt": "2026-08-31T17:00:00Z",
    "status": "watching",
    "graduatedAt": null,
    "tokenProfile": {
      "chainId": "solana",
      "tokenAddress": "ExampleSolanaAddress",
      "icon": "https://example.com/icon.png"
    },
    "pairs": [
      {
        "chainId": "solana",
        "dexId": "pumpswap",
        "pairAddress": "ExamplePairAddress",
        "priceUsd": "1.25",
        "liquidity": {"usd": 1000}
      }
    ]
  }
]
```

`tokenProfile` preserves the original DexScreener profile event, and `pairs` preserves every pair returned by hydration so the frontend can use the full upstream payload without another DexScreener request.

### `GET /health/api`

Returns `true` when the FastAPI process responds.

### `GET /health/services`

Reports the API's view of the listener, database, and trade service:

```json
{
  "discovery": {"status": "up"},
  "trade": {"status": "down"},
  "database": {"status": "up"}
}
```

The trade service is intentionally reported as down because no trade backend exists. The listener's status is based on its most recent in-memory heartbeat.

### `POST /health/discovery/heartbeat`

Internal listener endpoint. It records the latest heartbeat and returns `{"ok": true}`.

## Repository layout

```text
.
├── backend/
│   ├── app/
│   │   ├── api/             FastAPI routes
│   │   ├── database/        engine, models, and repository
│   │   ├── schemas/         Pydantic API schemas
│   │   ├── services/        application-level operations
│   │   └── workers/         DexScreener listener
│   ├── alembic/             database migration files
│   ├── tests/               unit, API, and PostgreSQL integration tests
│   ├── Dockerfile           API/listener runtime image
│   └── Dockerfile.test      backend test image
├── frontend/
│   ├── src/api/             API clients and tests
│   ├── src/Components/      React components and component tests
│   ├── Dockerfile            Vite development image
│   └── Dockerfile.test       frontend test/lint/build image
├── .github/workflows/       GitHub Actions workflow
├── compose.yml               development and test services
└── .env.example              local configuration template
```

## Docker Compose

Compose defines these services:

| Service | Role | Default port |
| --- | --- | --- |
| `frontend` | Vite development server with source mounting and HMR | `5173` |
| `api` | FastAPI/Uvicorn application | `8000` |
| `listener` | DexScreener background worker | none |
| `db` | Application PostgreSQL database | internal only |

The `test` and `db-test` services are enabled only by the `test` profile. `db-test` uses a separate `${POSTGRES_DB}_test` database and `postgres_test_data` volume, protecting the application database from integration tests. `frontend-test` is also available in that profile, although CI currently invokes the frontend test image directly.

Runtime services mount source code for development. The frontend's dependencies are kept in the Docker-managed `frontend_node_modules` volume. Test images copy the source into the image and do not mount the host project directory.

## Configuration

Create a local environment file:

```bash
cp .env.example .env
```

The template defines:

```env
APP_NAME=TerMEMEal API
APP_VERSION=0.1.0
FRONTEND_ORIGIN=http://localhost:5173
POSTGRES_DB=meme_trade
POSTGRES_USER=meme_trade
POSTGRES_PASSWORD=change-me
DATABASE_URL=postgresql+psycopg://meme_trade:change-me@db:5432/meme_trade
```

`.env` is local configuration and must not contain credentials intended for source control. The listener's DexScreener URLs and polling intervals are currently constants in `backend/app/workers/listener.py`.

## Quick start

Requirements: Docker Desktop with Compose and Git.

From the repository root:

```bash
cp .env.example .env
docker compose up --build -d
docker compose exec api python -m alembic upgrade head
```

Open:

- Frontend: `http://localhost:5173`
- API docs: `http://localhost:8000/docs`
- API health: `http://localhost:8000/health/api`

The migration step is explicit; the API image does not run migrations automatically. Database records persist in the `postgres_data` volume across `docker compose down` and subsequent starts.

Useful commands:

```bash
docker compose ps
docker compose logs -f listener
docker compose logs -f api
docker compose down
```

To remove the development database as well as the containers, use `docker compose down -v`. This also removes the Compose-managed volumes, so use it only when resetting local state is intended.

## Tests and checks

All project checks can be run through Docker; no host Node or Python installation is required.

### Backend unit and API tests

```bash
docker build -f backend/Dockerfile.test -t turmemeal-backend-test backend
docker run --rm turmemeal-backend-test
```

The default test image runs tests that do not need PostgreSQL. Integration tests are marked with `integration` and are excluded from this command.

### Backend PostgreSQL integration tests

```bash
docker compose --profile test run --build --rm test pytest -m integration
```

These tests use `db-test`, never the application `db`. The migration test rebuilds the test schema, and repository tests clean up their inserted rows.

### Frontend tests, lint, and production build

```bash
docker build -f frontend/Dockerfile.test -t turmemeal-frontend-test frontend
docker run --rm turmemeal-frontend-test
docker run --rm turmemeal-frontend-test npm run lint
docker run --rm turmemeal-frontend-test npm run build
```

Frontend tests use Vitest, `jsdom`, and Testing Library. Current tests cover the API clients, discovery feed states, and token-card rendering. There is not yet a browser test that runs the frontend against live Compose services.

### GitHub Actions

`.github/workflows/gh-actions-tests.yml` runs on pushes to `main` and pull requests targeting `main`. It builds and runs the backend unit image, runs backend PostgreSQL integration tests against the isolated test database, then runs frontend tests, oxlint, and the Vite build in a separate job.

## Database migrations

Alembic tracks schema changes in `backend/alembic/versions/`. After changing a SQLAlchemy model:

```bash
docker compose exec api python -m alembic revision --autogenerate -m "describe change"
docker compose exec api python -m alembic upgrade head
```

Review autogenerated migrations before committing them. Migrations change schema only; they do not provide a data backup.

## Known limitations

- The listener's graduation watch is an in-memory dictionary. A listener restart loses pending watches, although persisted discovery rows remain.
- The listener uses simple console logging and does not yet implement provider retry/rate-limit policy beyond WebSocket reconnect backoff.
- Service health is process-local: listener heartbeats are stored in API memory and disappear when the API restarts.
- The frontend polls instead of receiving a push stream.
- The trade form is presentational only; the wallet indicator is always disconnected.
- Configuration is suitable for local Compose development, not production deployment.

## Direction

The next high-value improvements are durable listener recovery, stronger provider error handling, configuration of worker constants, and a browser-level full-stack test. Real trading should remain a separate security-sensitive feature rather than being implied by the current UI.
