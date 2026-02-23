import { FastifyInstance } from "fastify";
import { prisma } from "../../common/prisma";

export async function notificationRoutes(app: FastifyInstance) {
  app.get("/notifications", { preHandler: (app as any).authenticate }, async (request: any) => {
    const deals = await prisma.deal.findMany({
      where: { OR: [{ buyerId: request.authUser.sub }, { sellerId: request.authUser.sub }] },
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: { listing: true }
    });

    return deals.map((deal) => ({
      id: `deal-${deal.id}`,
      title: `Deal ${deal.state}`,
      body: `Listing ${deal.listing.title} is now ${deal.state}`,
      createdAt: deal.updatedAt
    }));
  });
}
