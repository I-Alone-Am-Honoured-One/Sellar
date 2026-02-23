import { moveDealState } from "../deals/state-machine";
import { FastifyInstance } from "fastify";
import { prisma } from "../../common/prisma";
import { logAudit } from "../audit/audit.service";

export async function paymentRoutes(app: FastifyInstance) {
  app.post("/payments/intent", { preHandler: (app as any).authenticate }, async (request: any, reply) => {
    const deal = await prisma.deal.findUnique({ where: { id: (request.body as any).dealId } });
    if (!deal) return reply.code(404).send({ message: "Deal not found" });
    if (deal.buyerId !== request.authUser.sub) return reply.code(403).send({ message: "Only buyer can pay" });

    const paymentIntentId = `pi_${deal.id}_${Date.now()}`;
    const updated = await prisma.deal.update({ where: { id: deal.id }, data: { paymentIntentId } });
    await logAudit({ actorId: request.authUser.sub, action: "PAYMENT_INTENT_CREATE", entity: "Deal", entityId: deal.id, before: deal, after: updated });
    return { paymentIntentId, clientSecret: `secret_${paymentIntentId}` };
  });

  app.post("/payments/webhook", async (request: any, reply) => {
    const event = request.body as any;
    const dealId = event?.data?.dealId;
    if (!dealId) return reply.code(400).send({ message: "Invalid event" });

    const deal = await prisma.deal.findUnique({ where: { id: dealId } });
    if (!deal) return reply.code(404).send({ message: "Deal not found" });

    if (event.type === "payment_intent.succeeded") {
      const next = moveDealState(deal.state, "PAY");
      const updated = await prisma.deal.update({ where: { id: deal.id }, data: { state: next } });
      await prisma.ledgerEntry.create({
        data: { dealId: deal.id, kind: "HELD", amountCents: deal.totalCents, metadata: { webhookEvent: event.type } }
      });
      await logAudit({ actorId: deal.buyerId, action: "PAYMENT_SUCCEEDED_WEBHOOK", entity: "Deal", entityId: deal.id, before: deal, after: updated });
    }

    return { received: true };
  });
}
