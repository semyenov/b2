import { Elysia } from "elysia";
import { consola } from "consola";
import { registerRoutes } from "./routes";

const port = Number(process.env.PORT ?? 3000);

const app = new Elysia()
  .onRequest(({ request }) => {
    consola.info(`${request.method} ${new URL(request.url).pathname}`);
  })
  .onError(({ code, error }) => {
    consola.error(`[${code}]`, error);
  })
  .get("/favicon.ico", () => new Response("", { status: 204 }))
  .get("/", () => ({ status: "ok" }))
  .use(registerRoutes)
  .listen(port);

consola.box(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
