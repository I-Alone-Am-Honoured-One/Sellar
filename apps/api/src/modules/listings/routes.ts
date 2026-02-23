import { FastifyInstance } from "fastify";
import { createListingSchema } from "@sellar/shared";
import { prisma } from "../../common/prisma";
import { logAudit } from "../audit/audit.service";

export async function listingsRoutes(app: FastifyInstance) {
  app.get("/listings", async (request: any) => {
    const { category, q, minPrice, maxPrice, sort = "newest" } = request.query as any;
    return prisma.listing.findMany({
      where: {
        category: category || undefined,
        title: q ? { contains: q, mode: "insensitive" } : undefined,
        priceCents: { gte: minPrice ? Number(minPrice) : undefined, lte: maxPrice ? Number(maxPrice) : undefined }
      },
      orderBy: sort === "price" ? { priceCents: "asc" } : { publishedAt: "desc" },
      include: { seller: { select: { id: true, username: true, profile: true } } }
    });
  });

  app.post("/listings", { preHandler: (app as any).authenticate }, async (request: any) => {
    const input = createListingSchema.parse(request.body);
    const listing = await prisma.listing.create({ data: { ...input, sellerId: request.authUser.sub } });
    await logAudit({ actorId: request.authUser.sub, action: "LISTING_CREATE", entity: "Listing", entityId: listing.id, after: listing });
    return listing;
  });

  app.patch("/listings/:id", { preHandler: (app as any).authenticate }, async (request: any, reply) => {
    const listing = await prisma.listing.findUnique({ where: { id: request.params.id } });
    if (!listing) return reply.code(404).send({ message: "Not found" });
    if (listing.sellerId !== request.authUser.sub) return reply.code(403).send({ message: "Forbidden" });

    const before = listing;
    const updated = await prisma.listing.update({
      where: { id: listing.id },
      data: {
        title: (request.body as any).title ?? listing.title,
        description: (request.body as any).description ?? listing.description,
        priceCents: (request.body as any).priceCents ?? listing.priceCents,
        stock: (request.body as any).stock ?? listing.stock
      }
    });
    await logAudit({ actorId: request.authUser.sub, action: "LISTING_UPDATE", entity: "Listing", entityId: listing.id, before, after: updated });
    return updated;
  });

  app.get("/listings/:id", async (request: any, reply) => {
    const listing = await prisma.listing.findUnique({ where: { id: request.params.id }, include: { seller: { include: { profile: true } } } });
    if (!listing) return reply.code(404).send({ message: "Not found" });
    return listing;
  });
}
