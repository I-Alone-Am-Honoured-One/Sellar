import { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { prisma } from "../common/prisma";

export function setupSockets(server: HttpServer) {
  const io = new Server(server, { cors: { origin: true, credentials: true } });

  io.use(async (socket, next) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) return next(new Error("Unauthorized"));
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return next(new Error("Unauthorized"));
    (socket.data as any).userId = userId;
    next();
  });

  io.of("/presence").on("connection", (socket) => {
    socket.broadcast.emit("presence:online", { userId: socket.data.userId });
  });

  io.of("/deal").on("connection", (socket) => {
    socket.on("deal:join", async (dealId: string) => {
      const deal = await prisma.deal.findUnique({ where: { id: dealId } });
      if (!deal) return;
      if (![deal.buyerId, deal.sellerId].includes(socket.data.userId)) return;
      socket.join(`deal:${dealId}`);
    });
  });

  io.of("/guild").on("connection", (socket) => {
    socket.on("guild:join", async (guildId: string) => {
      const member = await prisma.guildMembership.findFirst({ where: { guildId, userId: socket.data.userId } });
      if (!member) return;
      socket.join(`guild:${guildId}`);
    });
  });

  return io;
}
