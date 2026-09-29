import { randomBytes, scryptSync } from "node:crypto";
import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.STATCOURT_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.STATCOURT_ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Set STATCOURT_ADMIN_EMAIL and STATCOURT_ADMIN_PASSWORD");
  if (password.length < 12 || password.length > 128) throw new Error("Admin password must contain 12–128 characters");
  const count = await prisma.user.count({ where: { role: "ADMIN" } });
  if (count !== 0) throw new Error("An admin already exists; use the access management flow");
  const salt = randomBytes(16).toString("hex");
  const passwordHash = `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
  await prisma.user.create({ data: {
    email, role: "ADMIN", displayName: "StatCourt Administrator",
    passwordHash, accountStatus: "ACTIVE",
  } });
  console.log("Initial administrator account created");
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
