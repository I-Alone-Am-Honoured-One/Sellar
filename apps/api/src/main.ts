import Fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import authPlugin from "./plugins/auth";
import rateLimitPlugin from "./plugins/rate-limit";
import { config } from "./common/config";
import { authRoutes } from "./modules/auth/routes";
import { listingsRoutes } from "./modules/listings/routes";
import { dealsRoutes } from "./modules/deals/routes";
import { guildRoutes } from "./modules/guilds/routes";
import { chessRoutes } from "./modules/chess/routes";
import { disputesRoutes } from "./modules/disputes/routes";
import { adminRoutes } from "./modules/admin/routes";
import { profileRoutes } from "./modules/profiles/routes";
import { shippingRoutes } from "./modules/shipping/routes";
import { notificationRoutes } from "./modules/notifications/routes";
import { paymentRoutes } from "./modules/payments/routes";
import { setupSockets } from "./sockets";

const app = Fastify({ logger: true });

await app.register(cors, { origin: true, credentials: true });
await app.register(swagger, { openapi: { info: { title: "Sellar API", version: "0.1.0" } } });
await app.register(swaggerUI, { routePrefix: "/docs" });
await app.register(authPlugin);
await app.register(rateLimitPlugin);

app.get("/health", async () => ({ ok: true }));
await authRoutes(app);
await listingsRoutes(app);
await dealsRoutes(app);
await guildRoutes(app);
await chessRoutes(app);
await disputesRoutes(app);
await adminRoutes(app);
await profileRoutes(app);
await shippingRoutes(app);
await paymentRoutes(app);
await notificationRoutes(app);

const server = app.server;
setupSockets(server);

app.listen({ port: config.port, host: "0.0.0.0" }).then(() => {
  app.log.info(`API running at :${config.port}`);
});
