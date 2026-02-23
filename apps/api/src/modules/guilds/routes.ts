import { FastifyInstance } from "fastify";
import { prisma } from "../../common/prisma";
import { logAudit } from "../audit/audit.service";
import { guardGuildPermission } from "./rbac";

async function getMemberPermissions(guildId: string, userId: string) {
  const membership = await prisma.guildMembership.findFirst({ where: { guildId, userId } });
  if (!membership) return [] as string[];
  if (!membership.roleId) return ["POST", "LIST"];
  const role = await prisma.guildRole.findUnique({ where: { id: membership.roleId } });
  return role?.permissions ?? [];
}

export async function guildRoutes(app: FastifyInstance) {
  app.get("/guilds", async () => prisma.guild.findMany({ include: { channels: true, roles: true } }));

  app.post("/guilds", { preHandler: (app as any).authenticate }, async (request: any) => {
    const body = request.body as any;
    const guild = await prisma.guild.create({
      data: {
        name: body.name,
        channels: { create: [{ name: "general", type: "CHAT" }, { name: "market", type: "MARKET" }] },
        roles: { create: [{ name: "Owner", permissions: ["MANAGE", "MOD", "POST", "LIST"] }, { name: "Member", permissions: ["POST", "LIST"] }] },
        memberships: { create: { userId: request.authUser.sub } }
      }
    });
    await logAudit({ actorId: request.authUser.sub, action: "GUILD_CREATE", entity: "Guild", entityId: guild.id, after: guild });
    return guild;
  });

  app.post("/guilds/:guildId/channels", { preHandler: (app as any).authenticate }, async (request: any, reply) => {
    const perms = await getMemberPermissions(request.params.guildId, request.authUser.sub);
    try { guardGuildPermission(perms, "MANAGE"); } catch { return reply.code(403).send({ message: "Missing MANAGE permission" }); }

    const channel = await prisma.channel.create({
      data: { guildId: request.params.guildId, name: (request.body as any).name, type: (request.body as any).type ?? "CHAT" }
    });
    await logAudit({ actorId: request.authUser.sub, action: "GUILD_CHANNEL_CREATE", entity: "Channel", entityId: channel.id, after: channel });
    return channel;
  });

  app.get("/guilds/:guildId/channels/:channelId/messages", { preHandler: (app as any).authenticate }, async (request: any, reply) => {
    const perms = await getMemberPermissions(request.params.guildId, request.authUser.sub);
    try { guardGuildPermission(perms, "LIST"); } catch { return reply.code(403).send({ message: "Missing LIST permission" }); }

    return prisma.message.findMany({ where: { roomId: `guild:${request.params.guildId}:channel:${request.params.channelId}` }, orderBy: { createdAt: "asc" } });
  });

  app.post("/guilds/:guildId/channels/:channelId/messages", { preHandler: (app as any).authenticate }, async (request: any, reply) => {
    const perms = await getMemberPermissions(request.params.guildId, request.authUser.sub);
    try { guardGuildPermission(perms, "POST"); } catch { return reply.code(403).send({ message: "Missing POST permission" }); }

    const message = await prisma.message.create({
      data: {
        roomId: `guild:${request.params.guildId}:channel:${request.params.channelId}`,
        userId: request.authUser.sub,
        content: (request.body as any).content,
        type: "TEXT"
      }
    });
    await logAudit({ actorId: request.authUser.sub, action: "GUILD_MESSAGE_SEND", entity: "Message", entityId: message.id, after: message });
    return message;
  });
}
