#!/usr/bin/env node
import path from "node:path";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { generateProject, localDatabaseName } from "../lib/generate.mjs";
import { parseArgs, resolveOptions, toPackageName, USAGE } from "../lib/options.mjs";
import { runArgs, runCommand } from "../lib/pm.mjs";
import { dim, green, intro, note, outro, step } from "../lib/ui.mjs";

// Windows needs a shell to run the npm, pnpm and yarn .cmd shims, which Node warns about
process.noDeprecation = true;

function fail(message) {
  console.error(message);
  process.exit(1);
}

let options;
try {
  const { values, positional } = parseArgs(process.argv.slice(2));
  if (values.help) {
    console.log(USAGE);
    process.exit(0);
  }
  intro(version());
  options = await resolveOptions(values, positional);
} catch (error) {
  fail(error.message);
}

const target = path.resolve(options.name);
const packageName = toPackageName(path.basename(target));
options.name = packageName;

generateProject(options, target);

const relative = path.relative(process.cwd(), target);
step(`Created ${green(packageName)} ${dim(`in ${target}`)}`);

const pm = options.pm;
const pmRun = (args, stdio) =>
  spawnSync(pm, args, {
    cwd: target,
    stdio,
    encoding: "utf-8",
    shell: process.platform === "win32" && pm !== "bun",
  });

let installed = false;
if (options.install) {
  step(`Installing dependencies with ${pm}`);
  installed = pmRun(["install"], "inherit").status === 0;
  if (!installed) console.error(`${pm} install failed, run it yourself.`);
}

const cloudflare = options.template === "cloudflare";
const setup = cloudflare
  ? [
      ["Generating binding types with wrangler", "types", []],
      [
        "Creating the local D1 database",
        "db:init:local",
        [localDatabaseName(packageName)],
      ],
    ]
  : [];

// Stops at the first failing step, later ones depend on the earlier output
let completed = 0;
if (installed) {
  for (const [message, name, args] of setup) {
    step(message);
    const result = pmRun(runArgs(pm, name, args), "pipe");
    if (result.status !== 0) {
      console.error(`${result.stdout ?? ""}${result.stderr ?? ""}`.trim());
      console.error(`${runCommand(pm, name, args)} failed, run the remaining steps yourself.`);
      break;
    }
    completed++;
  }
}

if (options.git && !insideGitRepo(target)) {
  spawnSync("git", ["init"], { cwd: target, stdio: "ignore" });
}

const steps = [
  ...(relative ? [`cd ${relative}`] : []),
  ...(installed ? [] : [`${pm} install`]),
  ...setup.slice(completed).map(([, name, args]) => runCommand(pm, name, args)),
  runCommand(pm, "dev"),
];
note("Next steps", steps);
if (cloudflare)
  console.log(
    `${dim("│")}  ${dim("Copy .env.drizzle.example to .env.drizzle for remote migrations.")}`,
  );
outro(green("Happy hacking!"));

function insideGitRepo(cwd) {
  return (
    spawnSync("git", ["rev-parse", "--is-inside-work-tree"], {
      cwd,
      stdio: "ignore",
    }).status === 0
  );
}

function version() {
  try {
    const url = new URL("../package.json", import.meta.url);
    return JSON.parse(readFileSync(url, "utf-8")).version;
  } catch {
    return "";
  }
}
