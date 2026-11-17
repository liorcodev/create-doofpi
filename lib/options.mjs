import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { detectPackageManager, PACKAGE_MANAGERS } from "./pm.mjs";
import { cancel, createPrompter } from "./ui.mjs";

export const TEMPLATES = {
  base: "minimal doofpi API served with Bun.serve",
  cloudflare:
    "Cloudflare Worker with D1, Drizzle and R2",
};

export const DEFAULT_NAME = "doofpi-app";

export const USAGE = `create-doofpi <project-name> [options]

Options:
  --template <name>   base (default) or cloudflare
  --pm <name>         bun, npm, pnpm or yarn (default: the one running create-doofpi)
                      bun gives a Bun-only project, the others a Node.js project
  --[no-]install      Install dependencies after scaffolding
  --[no-]git          Run git init
  --[no-]prettier     Include Prettier, the config and the format script (default: yes)
  --[no-]eslint       Include ESLint, the config and the lint script (default: yes)
  --yes               Skip the prompts and use the defaults
  --force             Write into the directory even if it is not empty

Without a TTY or with --yes, install and git only run when asked for.
The cloudflare template also generates binding types and the
local D1 database when dependencies are installed.

Examples:
  bun create doofpi my-api
  bun create doofpi my-api --template cloudflare
  bun create doofpi . --template base --yes`;

const STRING_FLAGS = ["template", "pm"];
const BOOLEAN_FLAGS = ["install", "git", "prettier", "eslint", "yes", "force", "help"];

export function parseArgs(argv) {
  const values = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "-h") values.help = true;
    else if (!arg.startsWith("--")) positional.push(arg);
    else {
      const eq = arg.indexOf("=");
      const flag = arg.slice(2, eq === -1 ? undefined : eq);
      const inline = eq === -1 ? undefined : arg.slice(eq + 1);
      if (STRING_FLAGS.includes(flag)) {
        const value = inline ?? argv[++i];
        if (value === undefined || value.startsWith("--"))
          throw new Error(`--${flag} needs a value`);
        values[flag] = value;
      } else if (BOOLEAN_FLAGS.includes(flag)) {
        values[flag] = inline === undefined ? true : inline !== "false";
      } else if (
        flag.startsWith("no-") &&
        BOOLEAN_FLAGS.includes(flag.slice(3))
      ) {
        values[flag.slice(3)] = false;
      } else {
        throw new Error(`Unknown option --${flag}`);
      }
    }
  }
  return { values, positional };
}

function oneOf(flag, value, allowed) {
  if (!Object.hasOwn(allowed, value))
    throw new Error(
      `--${flag} must be one of ${Object.keys(allowed).join(", ")} (got "${value}")`,
    );
  return value;
}

export function toPackageName(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^[._]+/, "")
    .replace(/[^a-z0-9._-]+/g, "-");
}

const TARGET_ACTIONS = {
  rename: "choose another project name",
  overwrite: "write into it, files with the same name are replaced",
  cancel: "stop without writing anything",
};

// Validates the project name and the target folder before any other question is asked
async function resolveTarget(initial, force, prompter) {
  let name = initial;
  for (;;) {
    const target = path.resolve(name);
    if (!/^[a-z0-9][a-z0-9._-]*$/.test(toPackageName(path.basename(target))))
      throw new Error(`"${path.basename(target)}" is not a valid project name.`);
    if (force || !existsSync(target) || !readdirSync(target).length)
      return { name, force };
    if (!prompter)
      throw new Error(
        `${target} is not empty. Pick another name or pass --force to write into it.`,
      );
    const action = await prompter.select(
      `${target} is not empty`,
      TARGET_ACTIONS,
      "rename",
    );
    if (action === "overwrite") return { name, force: true };
    if (action === "cancel") {
      prompter.close();
      cancel();
      process.exit(1);
    }
    name = await prompter.text("Project name", DEFAULT_NAME);
  }
}

export async function resolveOptions(values, positional) {
  const interactive =
    Boolean(process.stdin.isTTY && process.stdout.isTTY) && !values.yes;
  const prompter = interactive ? createPrompter() : null;
  // A flag wins, then the prompt (interactive), then the fallback
  const ask = async (key, fallback, prompt) =>
    values[key] ?? (prompter ? await prompt(prompter) : fallback);
  const confirm = (key, fallback, message, promptDefault = fallback) =>
    ask(key, fallback, (p) => p.confirm(message, promptDefault));

  try {
    const { name, force } = await resolveTarget(
      positional[0] ??
        (prompter
          ? await prompter.text("Project name", DEFAULT_NAME)
          : DEFAULT_NAME),
      Boolean(values.force),
      prompter,
    );

    const template = oneOf(
      "template",
      await ask("template", "base", (p) => p.select("Template", TEMPLATES, "base")),
      TEMPLATES,
    );
    const detected = detectPackageManager();
    const pm = oneOf(
      "pm",
      await ask("pm", detected, (p) =>
        p.select("Package manager", PACKAGE_MANAGERS, detected),
      ),
      PACKAGE_MANAGERS,
    );

    return {
      name,
      template,
      pm,
      prettier: await confirm("prettier", true, "Add Prettier?"),
      eslint: await confirm("eslint", true, "Add ESLint?"),
      install: await confirm("install", false, "Install dependencies now?", true),
      git: await confirm("git", false, "Initialize a git repository?", true),
      force,
    };
  } finally {
    prompter?.close();
  }
}
