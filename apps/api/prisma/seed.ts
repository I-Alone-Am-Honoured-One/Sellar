import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash("Password1234!");
  const admin = await prisma.user.upsert({
    where: { email: "admin@sellar.local" },
    update: {},
    create: {
      email: "admin@sellar.local",
      username: "admin",
      passwordHash,
      role: "ADMIN",
      profile: { create: { bio: "Marketplace operator" } }
    }
  });

  await prisma.guild.upsert({
    where: { id: "seed-guild" },
    update: {},
    create: {
      id: "seed-guild",
      name: "Sellar Hub",
      channels: { create: [{ name: "general", type: "CHAT" }, { name: "market", type: "MARKET" }] },
      memberships: { create: { userId: admin.id } }
    }
  });
}

main().finally(() => prisma.$disconnect());
