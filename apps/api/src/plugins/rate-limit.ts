import fp from "fastify-plugin";
import Redis from "ioredis";
import { config } from "../common/config";

export default fp(async (app) => {
  const redis = new Redis(config.redisUrl, { lazyConnect: true });
  await redis.connect().catch(() => undefined);

  app.addHook("onRequest", async (request: any, reply) => {
    const key = `rl:${request.ip}:${request.method}:${request.routerPath ?? request.url}`;
    const current = await redis.incr(key).catch(() => 0);
    if (current === 1) await redis.expire(key, 60).catch(() => undefined);
    if (current > 120) {
      return reply.code(429).send({ message: "Rate limit exceeded" });
    }
  });
});
