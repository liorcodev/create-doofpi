import Doofpi from 'doofpi';
import type { Meta } from './types';
import { drizzle } from 'drizzle-orm/d1';

export const d = new Doofpi({ root: '/doofpi' })
  .defineEnv<Cloudflare.Env>()
  .createContext(({ req: { headers }, env }) => ({
    db: drizzle(env.DB),
    ip: headers.get('CF-Connecting-IP') ?? headers.get('X-Client-IP') ?? 'unknown',
    userAgent: headers.get('X-Client-User-Agent') ?? headers.get('User-Agent'),
    origin: headers.get('X-Client-Origin') ?? headers.get('Origin'),
    client: headers.get('X-App-Client')
  }))
  .defineMeta<Meta>()
  .onError(({ error }) => {
    console.error('onError: ', error.status + ' | ' + error.message);
    if (error.status >= 500 && error.error) console.error('onError cause:', error.error);
    return { message: error.message, status: error.status, issues: error.issues };
  });

export const publicEndpointBuilder = d.endpointBuilder;
export default d;
export const routes = d.routes.bind(d);