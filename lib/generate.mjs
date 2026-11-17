import {
  cpSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { variantOf } from "./pm.mjs";

const packageRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

// Placeholder project name used inside the template files
const PLACEHOLDER = "api-template";
const TEXT_FILE = /\.(json|jsonc|ts|md|example)$|^\.env/;

// Native or binary packages that pnpm only builds when they are allow-listed
const PNPM_BUILT = ["better-sqlite3", "esbuild", "sharp", "workerd"];

function replaceName(directory, name) {
  for (const entry of readdirSync(directory)) {
    const full = path.join(directory, entry);
    if (statSync(full).isDirectory()) replaceName(full, name);
    else if (TEXT_FILE.test(entry)) {
      const content = readFileSync(full, "utf-8");
      if (content.includes(PLACEHOLDER))
        writeFileSync(full, content.replaceAll(PLACEHOLDER, name));
    }
  }
}

// Node variant READMEs are written for npm, adapt the commands for pnpm and yarn
function adaptNodeReadme(target, pm) {
  const file = path.join(target, "README.md");
  const exec = pm === "pnpm" ? "pnpm exec" : "yarn";
  writeFileSync(
    file,
    readFileSync(file, "utf-8")
      .replaceAll("npm run ", `${pm} run `)
      .replaceAll(`${pm} run db:init:local -- `, `${pm} run db:init:local `)
      .replaceAll("npm install", `${pm} install`)
      .replaceAll("npm exec -- ", `${exec} `),
  );
}

export function generateProject(options, target) {
  const { template, pm } = options;
  const variant = variantOf(pm);
  cpSync(path.join(packageRoot, "templates", template), target, { recursive: true });
  cpSync(path.join(packageRoot, "variants", template, variant), target, {
    recursive: true,
  });
  // npm strips .gitignore from published packages, so the templates ship it as _gitignore
  renameSync(path.join(target, "_gitignore"), path.join(target, ".gitignore"));
  replaceName(target, options.name);

  const packageFile = path.join(target, "package.json");
  const pkg = JSON.parse(readFileSync(packageFile, "utf-8"));
  if (!options.prettier) {
    rmSync(path.join(target, ".prettierrc"), { force: true });
    delete pkg.scripts.format;
    delete pkg.devDependencies.prettier;
  }
  if (!options.eslint) {
    rmSync(path.join(target, "eslint.config.mjs"), { force: true });
    delete pkg.scripts.lint;
    for (const dep of ["eslint", "@eslint/js", "typescript-eslint"])
      delete pkg.devDependencies[dep];
  }
  if (variant === "node") {
    if (pm !== "npm") adaptNodeReadme(target, pm);
    if (pm === "pnpm" && template === "cloudflare")
      pkg.pnpm = { onlyBuiltDependencies: PNPM_BUILT };
  }
  writeFileSync(packageFile, JSON.stringify(pkg, null, 2) + "\n");
}

export function localDatabaseName(name) {
  return `${name}-local-db`;
}
