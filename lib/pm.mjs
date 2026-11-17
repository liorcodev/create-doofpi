export const PACKAGE_MANAGERS = {
  bun: "Bun runtime and tooling only",
  npm: "Node.js with npm",
  pnpm: "Node.js with pnpm",
  yarn: "Node.js with Yarn",
};

// Bun projects contain no Node.js tooling, every other package manager gets a Node.js project
export const variantOf = (pm) => (pm === "bun" ? "bun" : "node");

export function detectPackageManager() {
  const agent = process.env.npm_config_user_agent ?? "";
  for (const pm of Object.keys(PACKAGE_MANAGERS)) {
    if (agent.startsWith(pm)) return pm;
  }
  return "bun";
}

// Arguments for `<pm> ...` that run a package.json script, npm needs -- before extra arguments
export function runArgs(pm, name, args = []) {
  const extra = args.length ? (pm === "npm" ? ["--", ...args] : args) : [];
  return ["run", name, ...extra];
}

export const runCommand = (pm, name, args = []) =>
  `${pm} ${runArgs(pm, name, args).join(" ")}`;
