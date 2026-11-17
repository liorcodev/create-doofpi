// Usage: bun scripts/init-local-db.ts <db name>
// Creates the local D1 database file on first run (any query makes wrangler create it).
const [dbName] = process.argv.slice(2);
if (!dbName) {
  console.error('Usage: bun scripts/init-local-db.ts <db name>');
  process.exit(1);
}

const proc = Bun.spawn(
  [
    'bun',
    'x',
    'wrangler',
    'd1',
    'execute',
    dbName,
    '--local',
    '--env',
    'dev',
    '--command',
    'SELECT name FROM sqlite_master'
  ],
  { stdout: 'inherit', stderr: 'inherit' }
);
process.exit(await proc.exited);
