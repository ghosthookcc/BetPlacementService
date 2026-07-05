# BetPlacementService

A fullstack bet placement service built to explore idempotent
request handling and an event-driven settlement lifecycle.

**Stack:** PostgreSQL 18 · Spring Boot 4 (Java 21) · Astro + Qwik frontend · Docker Compose.

---

## What it does

A user places a bet on an event. Placement is **idempotent** (a retried request
never creates a duplicate). Bets move through a lifecycle:

```
PENDING  ->  CONSUMED  ->  SETTLED
   |
   +------>  EXPIRED   (reaped if never consumed in time)
```

- **PENDING** - placed, awaiting the client's acknowledgment (checksum).
- **CONSUMED** - client acknowledged; a settlement row is created, awaiting the event result.
- **SETTLED** - the event finished (or was cancelled); payout resolved.
- **EXPIRED** - never consumed before its timeout; marked EXPIRED, then deleted by a scheduled reaper.

Settlement is **event-driven**: when an event transitions to `FINISHED` (with a
result) or `CANCELLED`, all of its consumed bets are settled in one transaction —
won bets pay `stake × odds`, cancelled events void bets (stake returned), losers pay nothing.

---

## Running the service

You need **Docker** and **Docker Compose** installed.

From the project root:

```bash
docker compose build --no-cache
docker compose up
```

That builds and starts three containers:

| Service      | Port (host) | What it is                          |
|--------------|-------------|-------------------------------------|
| `postgresql` | 5433        | PostgreSQL 18 (schema auto-created) |
| `api`        | 8080        | Spring Boot REST API                |
| `www`        | 4321        | Astro + Qwik frontend               |

Once it's up:

- **Frontend:** http://localhost:4321
- **API:** http://localhost:8080

To stop: `Ctrl+C`, then `docker compose down`.

### Resetting the database

The schema and seed data are created only when the database volume is empty.
To wipe everything and start fresh (re-seeding users, categories, and events):

```bash
docker compose down -v
docker compose up
```

The `-v` removes the volume, so the next start re-runs the schema and seed
scripts. Do this if you've finished/cancelled all the seeded events and want
bettable (UPCOMING) events back.

---

## The API

Base URL: `http://localhost:8080`

### Reads

| Method | Path                               | Description                                             |
|--------|------------------------------------|---------------------------------------------------------|
| GET    | `/api/ping`                        | Health check.                                           |
| GET    | `/api/users`                       | All users.                                              |
| GET    | `/api/categories`                  | All categories.                                         |
| GET    | `/api/categories/{id}/events`      | **UPCOMING** (bettable) events in a category.           |
| GET    | `/api/events`                      | All events. `?actionable=true` → only UPCOMING/LIVE.    |
| GET    | `/api/bets/latest?limit=20`        | Latest bets (global feed).                              |
| GET    | `/api/bets?userId={id}`            | Bets, optionally filtered by user (omit for all).       |
| GET    | `/api/settlements?userId={id}`     | Settlements, optionally filtered by user.               |

### Writes -the bet lifecycle

| Method | Path                          | Description                                                              |
|--------|-------------------------------|--------------------------------------------------------------------------|
| POST   | `/api/bets`                   | Place a bet. Returns the bet incl. its **checksum**. Idempotent on `requestId`. |
| POST   | `/api/bets/consume`           | Acknowledge receipt (body: `{ "checksum": "..." }`). Moves PENDING → CONSUMED, creates settlement. |
| POST   | `/api/events/{id}/state`      | Transition an event (body: `{ "target": "...", "result": "..." }`). Cascades settlement. |

**Placement body** (`POST /api/bets`):

```json
{
  "userId": 1,
  "eventId": "c40ed8c8-420a-4f38-a495-30cfa842dd43",
  "selection": "TEAM_A_WIN",
  "stake": 25.00,
  "requestId": "any-unique-string"
}
```

`selection` is one of `TEAM_A_WIN`, `TEAM_B_WIN`, `DRAW`. The `requestId` is the
**idempotency key**: sending the same `requestId` again returns the existing bet
instead of creating a new one.

**Event transition body** (`POST /api/events/{id}/state`):

```json
{ "target": "FINISHED", "result": "TEAM_A_WIN" }
```

`target` is `LIVE`, `FINISHED`, or `CANCELLED`. `result` is required only when
finishing. Legal transitions: `UPCOMING → LIVE | FINISHED | CANCELLED`,
`LIVE → FINISHED | CANCELLED`. Finished and cancelled events are terminal.

---

## Exercising the full lifecycle by hand (curl)

```bash
# 1. Find an UPCOMING event (category 1). Copy an event "id" (a UUID).
curl http://localhost:8080/api/categories/1/events

# 2. Place a bet -> returns a bet with a "checksum". Copy it.
curl -X POST http://localhost:8080/api/bets \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"eventId":"<EVENT_UUID>","selection":"TEAM_A_WIN","stake":25.00,"requestId":"demo-1"}'

# 3. Prove idempotency: run step 2 again with the SAME requestId.
#    You get the SAME bet back (same id, same checksum) -no duplicate.

# 4. Consume (acknowledge) using the checksum -> bet becomes CONSUMED.
curl -X POST http://localhost:8080/api/bets/consume \
  -H "Content-Type: application/json" \
  -d '{"checksum":"<CHECKSUM>"}'

# 5. Finish the event with a result -> settles the bet.
curl -X POST http://localhost:8080/api/events/<EVENT_UUID>/state \
  -H "Content-Type: application/json" \
  -d '{"target":"FINISHED","result":"TEAM_A_WIN"}'

# 6. See the settlement (WON, payout = stake * odds).
curl "http://localhost:8080/api/settlements?userId=1"
```

You can also drive the whole thing from the UI: place a bet on the **Index**
page (pick a "betting as" user first, top-left), then use the **Admin** page to
finish or cancel events and watch the settlements resolve on the **History** page.

---

## Proving it works with Postman

A Postman collection in `postman-test/` runs the full lifecycle automatically and
**proves the idempotency requirement**, it places the same request twice and
asserts the same bet is returned, with no duplicate created.

### 1. Install Postman

- **Windows / macOS:** download from https://www.postman.com/downloads/ and run the installer.
- **Linux:** download the tarball from the same page, or install the Snap:
  ```bash
  sudo snap install postman
  ```

You can use Postman without creating an account, on the launch screen, choose
**"Skip and go to the app"** (or similar) to use it locally.

### 2. Import the collection

1. Open Postman.
2. Click **Import** (top-left).
3. Select the file `postman-test/BetPlacementService.postman_collection.json`
   (drag it into the window, or use **Choose Files**).
4. The collection **"BetPlacementService - Idempotency & Lifecycle"** appears in
   the left sidebar.

### 3. Check the base URL (only if needed)

The collection targets `http://localhost:8080` by default. If your API runs
elsewhere, click the collection → **Variables** tab → edit `baseUrl`.

### 4. Run it

Make sure the service is running (`docker compose up`) and the database has
seed data with at least one **UPCOMING** event.

1. Click the collection **"BetPlacementService - Idempotency & Lifecycle"**.
2. Click **Run** (opens the Collection Runner).
3. Click **Run BetPlacementService...**.

The runner executes all requests in order and shows green/red for every
assertion. It chains values automatically (it picks a user, a category, an
UPCOMING event, places a bet, and carries the checksum through).

### What it proves

The steps marked **★** are the key proofs:

- **★ Place bet AGAIN, same request_id:** the second placement returns the
  **same bet id and checksum** as the first. This is the idempotency proof, a
  duplicate request produced no duplicate bet.
- **★ Consume AGAIN, same checksum:** consuming twice is a safe no-op
  (`alreadyConsumed: true`), no second settlement.
- **★ Illegal transition rejected:** finishing an already-finished event returns
  `400`, the state machine holds.
- **★ Settlement verified:** the finished bet settles as **WON** with
  **payout**.

All assertions green = idempotency holds and the lifecycle is correct.

### Note on re-running

Each run generates a fresh `requestId`, so runs don't collide. But each run also
**finishes one UPCOMING event** (to prove settlement), turning it terminal. After
enough runs you may run out of UPCOMING events, and the "Get an UPCOMING event"
step will fail with a clear message. To reset the seed data:

```bash
docker compose down -v
docker compose up
```

---

## Project layout

```
BetPlacementService/
├── api/                 Spring Boot REST API (Java 21)
├── www/                 Astro + Qwik frontend
├── postgresql/init/     Schema + seed SQL (runs on first DB start)
├── postman-test/        Postman collection (idempotency + lifecycle proof)
├── docker-compose.yml
└── README.md
```
