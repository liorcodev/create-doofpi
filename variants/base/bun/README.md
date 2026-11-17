# api-template

A [doofpi](https://www.npmjs.com/package/doofpi) API served with Bun.

```sh
bun install
bun run dev
```

The API root is `/doofpi` and routes are dot-separated, try
`http://localhost:3000/doofpi.hello.greet?input={"name":"doofpi"}`.
Set `PORT` to change the port.

## Structure

- `index.ts`: registers the routes and starts `Bun.serve`.
- `app/doofpi.ts`: the doofpi instance and shared endpoint builder.
- `app/routes`: route groups, each with a `*Route.ts` and a `*Model.ts` (zod input and output).

Export `AppRoute` from `app/routes/appRoute.ts` to get a fully typed client with `createClient`.
