import { FastifyInstance } from "fastify";
import { prisma } from "../../common/prisma";
import { logAudit } from "../audit/audit.service";

export async function profileRoutes(app: FastifyInstance) {
  app.get("/profiles/:userId", async (request: any, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: request.params.userId },
      include: { profile: true, listings: true }
    });
    if (!user) return reply.code(404).send({ message: "User not found" });
    return user;
  });

  app.post("/deals/:id/rating", { preHandler: (app as any).authenticate }, async (request: any, reply) => {
    const deal = await prisma.deal.findUnique({ where: { id: request.params.id } });
    if (!deal) return reply.code(404).send({ message: "Deal not found" });
    if (deal.state !== "RELEASED" && deal.state !== "REFUNDED") {
      return reply.code(400).send({ message: "Ratings allowed only on completed deals" });
    }
    if (![deal.buyerId, deal.sellerId].includes(request.authUser.sub)) {
      return reply.code(403).send({ message: "Not a deal participant" });
    }

    const stars = Number((request.body as any)?.stars ?? 0);
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      return reply.code(400).send({ message: "Stars must be integer 1-5" });
    }

    const ratedUserId = request.authUser.sub === deal.buyerId ? deal.sellerId : deal.buyerId;
    const before = await prisma.profile.findUnique({ where: { userId: ratedUserId } });
    const updated = await prisma.profile.upsert({
      where: { userId: ratedUserId },
      update: { reputation: { increment: stars } },
      create: { userId: ratedUserId, reputation: stars }
    });

    await logAudit({
      actorId: request.authUser.sub,
      action: "DEAL_RATING_CREATE",
      entity: "Profile",
      entityId: updated.id,
      before,
      after: updated
    });

    return { ok: true, reputation: updated.reputation };
  });
}
