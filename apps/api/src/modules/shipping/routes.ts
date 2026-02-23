import { FastifyInstance } from "fastify";
import { lpExpressAdapter, omnivaAdapter } from "./providers";

export async function shippingRoutes(app: FastifyInstance) {
  app.get("/shipping/pickup-points", async (request: any, reply) => {
    const provider = String((request.query as any)?.provider ?? "OMNIVA");
    const q = String((request.query as any)?.q ?? "Central");

    if (provider !== "OMNIVA" && provider !== "LP_EXPRESS") {
      return reply.code(400).send({ message: "provider must be OMNIVA or LP_EXPRESS" });
    }

    const adapter = provider === "OMNIVA" ? omnivaAdapter : lpExpressAdapter;
    const points = await adapter.searchPickupPoints(q);
    return { provider, points };
  });
}
