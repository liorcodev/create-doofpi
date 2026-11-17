# API Template

A TypeScript API base for Cloudflare Workers, using Doofpi, Drizzle, D1, Zod, and Node.js.
R2 is bound for file storage. No authentication, users, or application-specific features are included.

## Routes

The API root is `/doofpi`. Only `health.check` is registered. Add your own route groups in `app/routes/`.

## Local Setup

1. Run `npm install`.
2. Run `npm run types`.
3. Run `npm run db:init:local -- api-template-local-db`.
4. Add tables to `db/schema.ts`, then run `npm run db:generate` and `npm run db:migrate`.
5. Run `npm run dev`.

The local Drizzle configuration discovers the database created by Wrangler. If multiple SQLite
files exist, set `LOCAL_DATABASE_PATH` in `.env.drizzle` to the intended file.

## Deployment

Rename the Worker, databases, and buckets for each new project. Create separate D1 and
R2 resources for preview and production, then replace the placeholder IDs in `wrangler.jsonc`.
No live resource IDs or credentials are included.

Copy `.env.drizzle.example` to `.env.drizzle` and configure D1 credentials for remote migrations.
Apply migrations with `npm run db:migrate:preview` or `npm run db:migrate:production`.

Validate with `npm exec -- tsc --noEmit` and `npm exec -- wrangler deploy --dry-run --env dev`.
