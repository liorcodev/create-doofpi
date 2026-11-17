# create-doofpi

Scaffold a new [doofpi](https://www.npmjs.com/package/doofpi) project.

```sh
bun create doofpi my-api
```

Run it without flags for interactive prompts, or pass options to skip them.

## Options

```
create-doofpi <project-name> [options]

--template <name>   base (default) or cloudflare
--pm <name>         bun, npm, pnpm or yarn (default: the one running create-doofpi)
--[no-]install      Install dependencies after scaffolding
--[no-]git          Run git init
--[no-]prettier     Include Prettier, the config and the format script (default: yes)
--[no-]eslint       Include ESLint, the config and the lint script (default: yes)
--yes               Skip the prompts and use the defaults
--force             Write into the directory even if it is not empty
```

Without a TTY or with `--yes`, install and git only run when asked for. Prettier and ESLint are
included unless `--no-prettier` or `--no-eslint` is passed.

## Package managers

- `bun`: a Bun-only project, scripts run with Bun and `base` is served with `Bun.serve`.
- `npm`, `pnpm`, `yarn`: a Node.js project, scripts run with `tsx` and `base` is served with `srvx`.

The two variants live in `variants/<template>/<bun|node>` and never share runtime-specific files.

## Templates

- `base`: a minimal doofpi API with one `hello.greet` route.
- `cloudflare`: a Cloudflare Worker with D1, Drizzle and R2, with a `health.check`
  route. No auth, users or admin routes, and the Drizzle schema is empty.

With `cloudflare` and dependencies installed, the CLI also generates binding types and creates the
local D1 database.
Add tables to `db/schema.ts`, then run the `db:generate` and `db:migrate` scripts and the `dev` script.
