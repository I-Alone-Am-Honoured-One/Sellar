import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import cookie from "@fastify/cookie";
import { config } from "../common/config";

declare module "fastify" {
  interface FastifyRequest {
    authUser?: { sub: string; role: string };
  }
}

export default fp(async (app) => {
  await app.register(cookie);
  await app.register(jwt, { secret: config.jwtSecret, cookie: { cookieName: "access_token", signed: false } });

  app.decorate("authenticate", async function (request: any, reply: any) {
    try {
      const token = request.cookies.access_token || request.headers.authorization?.replace("Bearer ", "");
      const payload = app.jwt.verify(token);
      request.authUser = payload as any;
    } catch {
      reply.code(401).send({ message: "Unauthorized" });
    }
  });
});
