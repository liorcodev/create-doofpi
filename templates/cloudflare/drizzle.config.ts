import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

dotenv.config({ path: '.env.drizzle' });

const env = process.env;
const required = (name: keyof NodeJS.ProcessEnv): string => {
  const value = env[name];
  if (!value) throw new Error(`Missing ${name} in .env.drizzle`);
  return value;
};

const localDatabase = (): string => {
  if (env.LOCAL_DATABASE_PATH) return env.LOCAL_DATABASE_PATH;
  const directory = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
  const files = existsSync(directory)
    ? readdirSync(directory).filter(file => file.endsWith('.sqlite') && file !== 'metadata.sqlite')
    : [];
  if (files.length === 1) return join(directory, files[0]!);
  if (process.argv.includes('generate')) return ':memory:';
  throw new Error(
    'Run the db:init:local script with the local database name first, or set LOCAL_DATABASE_PATH in .env.drizzle.'
  );
};

const remoteDb = env.REMOTE_DB === 'preview' || env.REMOTE_DB === 'production';
const databaseId =
  env.REMOTE_DB === 'production'
    ? 'CLOUDFLARE_DATABASE_ID_PRODUCTION'
    : 'CLOUDFLARE_DATABASE_ID_PREVIEW';

export default defineConfig(
  remoteDb
    ? {
        out: './drizzle',
        schema: './db/schema.ts',
        dialect: 'sqlite',
        driver: 'd1-http',
        dbCredentials: {
          accountId: required('CLOUDFLARE_ACCOUNT_ID'),
          databaseId: required(databaseId),
          token: required('CLOUDFLARE_D1_TOKEN')
        }
      }
    : {
        out: './drizzle',
        schema: './db/schema.ts',
        dialect: 'sqlite',
        dbCredentials: {
          url: localDatabase()
        }
      }
);
