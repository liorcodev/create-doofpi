# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-11-17

### Added

- Initial release of `create-doofpi`.
- `base` template: a minimal doofpi API with one `hello.greet` route.
- `cloudflare` template: a Cloudflare Worker with D1, Drizzle and R2, and a `health.check` route.
- Bun and Node.js variants, picked from the package manager (`bun`, `npm`, `pnpm`, `yarn`).
- Interactive prompts, with flags to skip them: `--template`, `--pm`, `--[no-]install`, `--[no-]git`,
  `--[no-]prettier`, `--[no-]eslint`, `--yes` and `--force`.
- Optional Prettier and ESLint setup.
- Cloudflare: binding types and the local D1 database are generated after install.

[1.0.0]: https://github.com/liorcodev/create-doofpi/releases/tag/v1.0.0
