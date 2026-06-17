import { PrismaClient } from "../src/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import * as fs from "fs";
import * as path from "path";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL!.replace('-pooler', '');
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const dataPath = path.resolve(import.meta.dirname ?? __dirname, "..", "data", "backup.json");
  if (!fs.existsSync(dataPath)) {
    console.error("No se encontró data/backup.json. Ejecuta primero npx tsx prisma/export-data.ts");
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  console.log("Limpiando datos existentes...");
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "PurchaseItem", "Purchase", "SaleItem", "Sale", "Appointment", "TreatmentPlan", "Product", "Client", "User" RESTART IDENTITY CASCADE');
  console.log("Datos limpios.\n");

  // Import Users
  for (const u of data.users) {
    const { id, createdAt, updatedAt, ...userData } = u;
    await prisma.user.create({
      data: {
        ...userData,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
      },
    });
  }
  console.log(`  Usuarios: ${data.users.length}`);

  // Import Clients
  for (const c of data.clients) {
    const { id, createdAt, updatedAt, ...clientData } = c;
    await prisma.client.create({
      data: {
        ...clientData,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
      },
    });
  }
  console.log(`  Clientes: ${data.clients.length}`);

  // Import Products
  for (const p of data.products) {
    const { id, createdAt, updatedAt, ...productData } = p;
    await prisma.product.create({
      data: {
        ...productData,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
      },
    });
  }
  console.log(`  Productos: ${data.products.length}`);

  // Import TreatmentPlans
  for (const p of data.treatmentPlans) {
    const { appointments, id, createdAt, updatedAt, ...planData } = p;
    await prisma.treatmentPlan.create({
      data: {
        ...planData,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
      },
    });
  }
  console.log(`  Planes: ${data.treatmentPlans.length}`);

  // Import Appointments
  for (const a of data.appointments) {
    const { id, createdAt, updatedAt, ...appointmentData } = a;
    await prisma.appointment.create({
      data: {
        ...appointmentData,
        date: new Date(appointmentData.date),
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
      },
    });
  }
  console.log(`  Citas: ${data.appointments.length}`);

  // Import Sales + Items
  for (const s of data.sales) {
    const { id, items, createdAt, updatedAt, ...saleData } = s;
    await prisma.sale.create({
      data: {
        ...saleData,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
        items: {
          create: items.map((item: Record<string, unknown>) => {
            const { id: itemId, saleId, ...itemData } = item;
            return itemData;
          }),
        },
      },
    });
  }
  console.log(`  Ventas: ${data.sales.length}`);

  // Import Purchases + Items
  for (const p of data.purchases) {
    const { id, items, createdAt, updatedAt, ...purchaseData } = p;
    await prisma.purchase.create({
      data: {
        ...purchaseData,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
        items: {
          create: items.map((item: Record<string, unknown>) => {
            const { id: itemId, purchaseId, ...itemData } = item;
            return itemData;
          }),
        },
      },
    });
  }
  console.log(`  Compras: ${data.purchases.length}`);

  console.log("\n✅ Datos importados correctamente");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
