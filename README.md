# Div2 Item Checker

Upload screenshots of The Division 2 items and get a verdict for each one:
**Keep**, **Library** (extract to the recalibration library), **Expertise** (donate for proficiency) or **Deconstruct**.

Verdicts are worked out in code against your own profile: your recalibration library values, unlocked talents, proficiency ranks and owned exotics. See [docs/design.md](docs/design.md) for the rules.

## Status

- [x] Verdict logic, with tests built from real item screenshots
- [x] Profile: library attributes and talents, proficiency, exotics owned, expertise level
- [x] Upload → review → verdict flow, scan history
- [ ] Reading screenshots automatically (OCR). For now you type in what the item shows.

## Run locally

```bash
cp .env.example .env.local   # then set APP_PASSWORD and SESSION_SECRET
npm install
npm run dev
```

## Deploy (VPS)

```bash
cp .env.example .env         # set APP_PASSWORD and a long random SESSION_SECRET
docker compose up -d --build
```

The SQLite database and uploaded screenshots live in `./data`. Put it behind HTTPS (e.g. Caddy or nginx), since the login cookie is marked secure in production.

## Game data

Talent tiers and attribute max rolls are researched in [docs/talents.md](docs/talents.md) and [docs/attributes.md](docs/attributes.md). After editing their JSON blocks, run `npm run data:extract` to update `src/data/`.

## Scripts

| Command | What it does |
|---|---|
| `npm test` | Run the verdict tests |
| `npm run lint` | Type-check |
| `npm run db:generate` | Create a migration after changing `src/db/schema.ts` |
