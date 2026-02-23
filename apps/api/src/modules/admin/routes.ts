import { FastifyInstance } from "fastify";
import { prisma } from "../../common/prisma";
import { logAudit } from "../audit/audit.service";

function requireAdmin(request: any, reply: any) {
  if (request.authUser.role !== "ADMIN") {
    reply.code(403).send({ message: "Admin required" });
    return false;
  }
  return true;
}

export async function adminRoutes(app: FastifyInstance) {
  app.get("/admin/users", { preHandler: (app as any).authenticate }, async (request: any, reply) => {
    if (!requireAdmin(request, reply)) return;
    return prisma.user.findMany({ select: { id: true, email: true, username: true, role: true, createdAt: true } });
  });

  app.post("/admin/users/:id/ban", { preHandler: (app as any).authenticate }, async (request: any, reply) => {
    if (!requireAdmin(request, reply)) return;
    const user = await prisma.user.findUnique({ where: { id: request.params.id } });
    if (!user) return reply.code(404).send({ message: "User not found" });

    const updated = await prisma.user.update({ where: { id: user.id }, data: { role: "MODERATOR" } });
    await logAudit({
      actorId: request.authUser.sub,
      action: "ADMIN_USER_BAN_SIMULATED",
      entity: "User",
      entityId: user.id,
      before: user,
      after: updated
    });

    return { ok: true };
  });

  app.get("/admin/audit", { preHandler: (app as any).authenticate }, async (request: any, reply) => {
    if (!requireAdmin(request, reply)) return;
    return prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  });
}
