import { FastifyInstance } from "fastify";
import argon2 from "argon2";
import { authenticator } from "otplib";
import { loginSchema, registerSchema } from "@sellar/shared";
import { prisma } from "../../common/prisma";
import { logAudit } from "../audit/audit.service";

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", async (request, reply) => {
    const input = registerSchema.parse(request.body);
    const exists = await prisma.user.findFirst({ where: { OR: [{ email: input.email }, { username: input.username }] } });
    if (exists) return reply.code(409).send({ message: "Email or username already exists" });

    const passwordHash = await argon2.hash(input.password);
    const user = await prisma.user.create({
      data: { email: input.email, username: input.username, passwordHash, profile: { create: { bio: "New Sellar member" } } }
    });
    await logAudit({ actorId: user.id, action: "REGISTER", entity: "User", entityId: user.id, after: user });
    return { id: user.id, email: user.email, username: user.username };
  });

  app.post("/auth/login", async (request, reply) => {
    const input = loginSchema.parse(request.body);
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !(await argon2.verify(user.passwordHash, input.password))) {
      return reply.code(401).send({ message: "Invalid credentials" });
    }
    if (user.twoFactorSecret) {
      const valid = input.totpCode && authenticator.verify({ token: input.totpCode, secret: user.twoFactorSecret });
      if (!valid) return reply.code(401).send({ message: "2FA required" });
    }

    const access = app.jwt.sign({ sub: user.id, role: user.role }, { expiresIn: "15m" });
    const refresh = app.jwt.sign({ sub: user.id, role: user.role, type: "refresh" }, { expiresIn: "7d" });
    reply.setCookie("access_token", access, { httpOnly: true, sameSite: "lax", path: "/" });
    reply.setCookie("refresh_token", refresh, { httpOnly: true, sameSite: "lax", path: "/auth/refresh" });
    await logAudit({ actorId: user.id, action: "LOGIN", entity: "User", entityId: user.id });
    return { access, user: { id: user.id, username: user.username, role: user.role } };
  });

  app.post("/auth/logout", async (request: any, reply) => {
    const token = request.cookies.access_token;
    if (token) {
      try {
        const payload = app.jwt.verify(token) as any;
        await logAudit({ actorId: payload.sub, action: "LOGOUT", entity: "User", entityId: payload.sub });
      } catch {
        // no-op
      }
    }
    reply.clearCookie("access_token", { path: "/" });
    reply.clearCookie("refresh_token", { path: "/auth/refresh" });
    return { ok: true };
  });

  app.post("/auth/refresh", async (request, reply) => {
    const token = (request as any).cookies.refresh_token;
    const payload = app.jwt.verify(token) as any;
    const access = app.jwt.sign({ sub: payload.sub, role: payload.role }, { expiresIn: "15m" });
    reply.setCookie("access_token", access, { httpOnly: true, sameSite: "lax", path: "/" });
    return { access };
  });

  app.get("/auth/me", { preHandler: (app as any).authenticate }, async (request: any) => {
    const user = await prisma.user.findUnique({
      where: { id: request.authUser.sub },
      select: { id: true, email: true, username: true, role: true, profile: true }
    });
    return user;
  });

  app.post("/auth/2fa/setup", { preHandler: (app as any).authenticate }, async (request: any) => {
    const secret = authenticator.generateSecret();
    await prisma.user.update({ where: { id: request.authUser.sub }, data: { twoFactorSecret: secret } });
    await logAudit({ actorId: request.authUser.sub, action: "2FA_SETUP", entity: "User", entityId: request.authUser.sub });
    return { secret, otpauth: authenticator.keyuri(request.authUser.sub, "Sellar", secret) };
  });
}
