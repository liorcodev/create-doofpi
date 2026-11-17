import { d } from './app/doofpi';
import appRoute from './app/routes/appRoute';

d.register(appRoute);

const server = Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  fetch: req => d.fetch(req)
});

console.log(`api-template listening on ${server.url}`);
