import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedAdmin = await bcrypt.hash("admin123", 10);
  const hashedWorker = await bcrypt.hash("trabajo123", 10);

  await prisma.user.upsert({
    where: { username: "masss" },
    update: {},
    create: {
      username: "masss",
      password: hashedAdmin,
      name: "Administrador",
      role: "admin",
    },
  });

  await prisma.user.upsert({
    where: { username: "masss1" },
    update: {},
    create: {
      username: "masss1",
      password: hashedWorker,
      name: "Trabajador 1",
      role: "worker",
    },
  });

  console.log("Usuarios creados exitosamente:");
  console.log("  Admin:  masss / admin123");
  console.log("  Trabajador: masss1 / trabajo123");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
