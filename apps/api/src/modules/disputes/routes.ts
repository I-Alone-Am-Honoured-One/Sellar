import { FastifyInstance } from "fastify";
import { prisma } from "../../common/prisma";
import { logAudit } from "../audit/audit.service";

export async function disputesRoutes(app: FastifyInstance) {
  app.post("/deals/:id/dispute", { preHandler: (app as any).authenticate }, async (request: any, reply) => {
    const deal = await prisma.deal.findUnique({ where: { id: request.params.id } });
    if (!deal) return reply.code(404).send({ message: "Deal not found" });
    if (![deal.buyerId, deal.sellerId].includes(request.authUser.sub)) return reply.code(403).send({ message: "Forbidden" });

    const before = deal;
    const updated = await prisma.deal.update({ where: { id: deal.id }, data: { state: "DISPUTED" } });
    await prisma.ledgerEntry.create({
      data: {
        dealId: deal.id,
        kind: "DISPUTE_OPEN",
        amountCents: 0,
        metadata: { reason: (request.body as any)?.reason ?? "UNSPECIFIED", openedBy: request.authUser.sub }
      }
    });

    await logAudit({
      actorId: request.authUser.sub,
      action: "DEAL_DISPUTE_OPEN",
      entity: "Deal",
      entityId: deal.id,
      before,
      after: updated
    });

    return updated;
  });

  app.post("/deals/:id/dispute/resolve", { preHandler: (app as any).authenticate }, async (request: any, reply) => {
    if (request.authUser.role !== "MODERATOR" && request.authUser.role !== "ADMIN") {
      return reply.code(403).send({ message: "Moderator or admin required" });
    }

    const deal = await prisma.deal.findUnique({ where: { id: request.params.id } });
    if (!deal) return reply.code(404).send({ message: "Deal not found" });

    const decision = (request.body as any)?.decision as "REFUND" | "RELEASE";
    const nextState = decision === "REFUND" ? "REFUNDED" : "RELEASED";

    const updated = await prisma.deal.update({ where: { id: deal.id }, data: { state: nextState } });
    await prisma.ledgerEntry.create({
      data: {
        dealId: deal.id,
        kind: decision === "REFUND" ? "REFUNDED" : "RELEASED",
        amountCents: deal.totalCents,
        metadata: { moderatorId: request.authUser.sub, decision }
      }
    });

    await logAudit({
      actorId: request.authUser.sub,
      action: `DEAL_DISPUTE_RESOLVE_${decision}`,
      entity: "Deal",
      entityId: deal.id,
      before: deal,
      after: updated
    });

    return updated;
  });
}
