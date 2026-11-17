// Usage: tsx scripts/init-local-db.ts <db name>
// Creates the local D1 database file on first run (any query makes wrangler create it).
import { spawnSync } from 'node:child_process';

const [dbName] = process.argv.slice(2);
if (!dbName) {
  console.error('Usage: tsx scripts/init-local-db.ts <db name>');
  process.exit(1);
}

const result = spawnSync(
  'node',
  [
    './node_modules/wrangler/bin/wrangler.js',
    'd1',
    'execute',
    dbName,
    '--local',
    '--env',
    'dev',
    '--command',
    'SELECT name FROM sqlite_master'
  ],
  { stdio: 'inherit' }
);
process.exit(result.status ?? 1);
