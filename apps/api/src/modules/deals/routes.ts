import { FastifyInstance } from "fastify";
import { checkoutSchema, chatMessageSchema, dealTransitionSchema } from "@sellar/shared";
import { prisma } from "../../common/prisma";
import { moveDealState } from "./state-machine";
import { logAudit } from "../audit/audit.service";

export async function dealsRoutes(app: FastifyInstance) {
  app.post("/checkout", { preHandler: (app as any).authenticate }, async (request: any, reply) => {
    const input = checkoutSchema.parse(request.body);
    const listing = await prisma.listing.findUnique({ where: { id: input.listingId } });
    if (!listing) return reply.code(404).send({ message: "Listing not found" });
    if (!listing.shippingProviders.includes(input.shippingProvider as any)) return reply.code(400).send({ message: "Shipping provider unsupported" });
    if (listing.stock < input.quantity) return reply.code(409).send({ message: "Insufficient stock" });

    const deal = await prisma.$transaction(async (tx) => {
      const updated = await tx.listing.update({ where: { id: listing.id }, data: { stock: { decrement: input.quantity } } });
      if (updated.stock < 0) throw new Error("Race condition");
      const created = await tx.deal.create({
        data: {
          listingId: listing.id,
          buyerId: request.authUser.sub,
          sellerId: listing.sellerId,
          state: "CREATED",
          shippingProvider: input.shippingProvider,
          pickupPointId: input.pickupPointId,
          totalCents: input.quantity * listing.priceCents
        }
      });
      await tx.ledgerEntry.create({ data: { dealId: created.id, kind: "HELD", amountCents: created.totalCents, metadata: { reason: "escrow-hold" } } });
      await tx.message.create({
        data: {
          roomId: `deal:${created.id}`,
          userId: request.authUser.sub,
          dealId: created.id,
          content: `Deal created for listing ${listing.title}`,
          type: "SYSTEM"
        }
      });
      return created;
    });

    await logAudit({ actorId: request.authUser.sub, action: "DEAL_CREATE", entity: "Deal", entityId: deal.id, after: deal });
    return { dealId: deal.id, stripeClientSecret: `simulated_${deal.id}` };
  });

  app.get("/deals/:id", { preHandler: (app as any).authenticate }, async (request: any, reply) => {
    const deal = await prisma.deal.findUnique({
      where: { id: request.params.id },
      include: { listing: true, buyer: { select: { id: true, username: true } }, seller: { select: { id: true, username: true } }, ledgerEntries: true, evidenceItems: true, trackingEvents: true }
    });
    if (!deal) return reply.code(404).send({ message: "Deal not found" });
    if (![deal.buyerId, deal.sellerId].includes(request.authUser.sub) && request.authUser.role === "USER") {
      return reply.code(403).send({ message: "Forbidden" });
    }
    return deal;
  });

  app.get("/deals/:id/messages", { preHandler: (app as any).authenticate }, async (request: any, reply) => {
    const deal = await prisma.deal.findUnique({ where: { id: request.params.id } });
    if (!deal) return reply.code(404).send({ message: "Deal not found" });
    if (![deal.buyerId, deal.sellerId].includes(request.authUser.sub) && request.authUser.role === "USER") return reply.code(403).send({ message: "Forbidden" });

    return prisma.message.findMany({ where: { dealId: deal.id }, orderBy: { createdAt: "asc" } });
  });

  app.post("/deals/:id/messages", { preHandler: (app as any).authenticate }, async (request: any, reply) => {
    const deal = await prisma.deal.findUnique({ where: { id: request.params.id } });
    if (!deal) return reply.code(404).send({ message: "Deal not found" });
    if (![deal.buyerId, deal.sellerId].includes(request.authUser.sub) && request.authUser.role === "USER") return reply.code(403).send({ message: "Forbidden" });

    const input = chatMessageSchema.parse({ ...(request.body as any), roomId: `deal:${deal.id}` });
    const message = await prisma.message.create({
      data: { roomId: input.roomId, userId: request.authUser.sub, dealId: deal.id, content: input.content, type: input.type }
    });
    await logAudit({ actorId: request.authUser.sub, action: "DEAL_MESSAGE_SEND", entity: "Message", entityId: message.id, after: message });
    return message;
  });

  app.post("/deals/:id/transitions", { preHandler: (app as any).authenticate }, async (request: any) => {
    const input = dealTransitionSchema.parse(request.body);
    const deal = await prisma.deal.findUniqueOrThrow({ where: { id: request.params.id } });
    const nextState = moveDealState(deal.state, input.action);
    const updated = await prisma.deal.update({ where: { id: deal.id }, data: { state: nextState } });
    await prisma.ledgerEntry.create({
      data: {
        dealId: deal.id,
        kind: input.action === "DISPUTE_RESOLVE_REFUND" ? "REFUNDED" : input.action === "RELEASE" ? "RELEASED" : "STATE_EVENT",
        amountCents: deal.totalCents,
        metadata: { action: input.action, metadata: input.metadata ?? {} }
      }
    });
    await prisma.message.create({
      data: { roomId: `deal:${deal.id}`, userId: request.authUser.sub, dealId: deal.id, content: `Milestone updated: ${nextState}`, type: "SYSTEM" }
    });
    await logAudit({ actorId: request.authUser.sub, action: `DEAL_${input.action}`, entity: "Deal", entityId: deal.id, before: deal, after: updated });
    return updated;
  });

  app.post("/deals/:id/evidence", { preHandler: (app as any).authenticate }, async (request: any) => {
    const body = request.body as any;
    const evidence = await prisma.evidenceItem.create({
      data: { dealId: request.params.id, uploaderId: request.authUser.sub, url: body.url, note: body.note }
    });
    await logAudit({ actorId: request.authUser.sub, action: "DEAL_EVIDENCE_ADD", entity: "EvidenceItem", entityId: evidence.id, after: evidence });
    return evidence;
  });
}
