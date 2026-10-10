# Div2 Item Checker

Upload screenshots of The Division 2 items and get a verdict for each one:
**Keep**, **Library** (extract to the recalibration library), **Expertise** (donate for proficiency) or **Deconstruct**.

Verdicts are worked out in code against your own profile: your recalibration library values, unlocked talents, proficiency ranks and owned exotics. See [docs/design.md](docs/design.md) for the rules.

## Status

- [x] Verdict logic, with tests built from real item screenshots
- [x] Profile: library attributes and talents, proficiency, exotics owned, expertise level
- [x] Upload → review → verdict flow, scan history
- [x] Reading PS5 screenshots automatically (OCR, no AI); doubtful values are highlighted for checking
- [x] Item names matched against a list of every weapon and gear piece in the game

## Test it on your PC (same setup as the VPS)

Needs Docker Desktop.

```bash
cp .env.example .env         # first time only (it overwrites your settings): set APP_PASSWORD, a long random SESSION_SECRET, and HOST_PORT=3100 if 3000 is taken
npm run local                # build and start in the background
```

- On this PC: http://localhost:3100 (or whatever `HOST_PORT` is).
- From your phone on the same Wi-Fi: `http://<your PC's Wi-Fi IP>:3100`. If the phone can't connect, allow the port through Windows Firewall.
- `npm run local:logs` shows the server output; `npm run local:stop` stops it.
- The first scan downloads the OCR language data (about 10 MB), so it needs internet once.

## Develop

```bash
cp .env.example .env.local   # first time only: set APP_PASSWORD and SESSION_SECRET
npm install
npm run dev
```

## Deploy (VPS)

```bash
cp .env.example .env         # first time only: set APP_PASSWORD and a long random SESSION_SECRET
docker compose up -d --build
```

The SQLite database and uploaded screenshots live in `./data`. Put it behind HTTPS (e.g. Caddy or nginx): the login cookie is HTTPS-only whenever the proxy reports HTTPS.

## Game data

Talent tiers, attribute max rolls and item names are researched in [docs/talents.md](docs/talents.md), [docs/attributes.md](docs/attributes.md) and [docs/items.md](docs/items.md). After editing their JSON blocks, run `npm run data:extract` to update `src/data/`.

## Scripts

| Command | What it does |
|---|---|
| `npm run local` | Build and start the Docker app on this PC |
| `npm run local:stop` / `local:logs` | Stop it / follow its output |
| `npm test` | Run the tests (OCR sample tests run when `samples/ps5` is present) |
| `npm run lint` | Type-check |
| `npm run db:generate` | Create a migration after changing `src/db/schema.ts` |
