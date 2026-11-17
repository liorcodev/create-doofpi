import { d } from './app/doofpi';
import appRoute from './app/routes/appRoute';

d.register(appRoute);

export default {
  async fetch(req: Request, env: Cloudflare.Env, ctx: ExecutionContext) {
    return d.fetch(req, env, ctx);
  }
};
