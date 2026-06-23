"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";

export async function deleteProduct(id: number) {
  await prisma.product.update({ where: { id }, data: { isActive: false } });
  revalidatePath("/products");
}

export async function deleteTreatmentPlan(id: number) {
  await prisma.treatmentPlan.delete({ where: { id } });
  revalidatePath("/treatment-plans");
}

export async function createTreatmentPlan(formData: FormData) {
  const clientIdStr = formData.get("clientId") as string;
  const clientName = formData.get("clientName") as string;
  const description = formData.get("description") as string;
  const totalSessions = parseInt(formData.get("totalSessions") as string) || 1;
  const price = parseFloat(formData.get("price") as string) || 0;
  const firstDate = formData.get("firstDate") as string;
  const firstTime = formData.get("firstTime") as string;

  let clientId: number;
  if (clientIdStr) {
    clientId = parseInt(clientIdStr);
  } else if (clientName) {
    let client = await prisma.client.findFirst({ where: { name: clientName } });
    if (!client) {
      client = await prisma.client.create({ data: { name: clientName } });
    }
    clientId = client.id;
  } else {
    throw new Error("Debes seleccionar un cliente o escribir un nombre");
  }

  const plan = await prisma.treatmentPlan.create({
    data: {
      clientId,
      description,
      totalSessions,
      remainingSessions: totalSessions - 1,
      price,
      status: "activo",
      appointments: {
        create: {
          clientId,
          date: new Date(firstDate),
          time: firstTime || "",
          type: "consulta",
          status: "pendiente",
          notes: `Sesión 1 de ${totalSessions} — ${description}`,
          sessionNumber: 1,
        },
      },
    },
  });
  revalidatePath("/treatment-plans");
  revalidatePath("/appointments");
}

export async function deleteClient(id: number) {
  await prisma.client.delete({ where: { id } });
  revalidatePath("/clients");
}

export async function deleteAppointment(id: number) {
  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) throw new Error("Cita no encontrada");
  await prisma.appointment.delete({ where: { id } });
  if (appointment.treatmentPlanId) {
    await prisma.treatmentPlan.update({
      where: { id: appointment.treatmentPlanId },
      data: { remainingSessions: { increment: 1 } },
    });
    revalidatePath(`/treatment-plans/${appointment.treatmentPlanId}`);
  }
  revalidatePath("/appointments");
}

export async function deleteSale(id: number) {
  await prisma.sale.delete({ where: { id } });
  revalidatePath("/sales");
}

export async function deleteNote(id: number) {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autorizado");
  if (user.role !== "admin") {
    const note = await prisma.note.findUnique({ where: { id }, select: { userId: true } });
    if (!note || note.userId !== user.id) throw new Error("No autorizado");
  }
  await prisma.note.delete({ where: { id } });
  revalidatePath("/notes");
}

export async function createNote(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autorizado");
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  await prisma.note.create({ data: { title, content, userId: user.id } });
  revalidatePath("/notes");
}

export async function updateNote(id: number, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autorizado");
  if (user.role !== "admin") {
    const note = await prisma.note.findUnique({ where: { id }, select: { userId: true } });
    if (!note || note.userId !== user.id) throw new Error("No autorizado");
  }
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  await prisma.note.update({ where: { id }, data: { title, content } });
  revalidatePath("/notes");
}

export async function deletePurchase(id: number) {
  await prisma.purchase.delete({ where: { id } });
  revalidatePath("/purchases");
}

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const price = parseFloat(formData.get("price") as string) || 0;
  const cost = parseFloat(formData.get("cost") as string) || 0;
  const stock = parseInt(formData.get("stock") as string) || 0;
  const minStock = parseInt(formData.get("minStock") as string) || 0;
  const image = formData.get("image") as string;

  await prisma.product.create({
    data: { name, description, category, price, cost, stock, minStock, image },
  });
  revalidatePath("/products");
}

export async function updateProduct(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const price = parseFloat(formData.get("price") as string) || 0;
  const cost = parseFloat(formData.get("cost") as string) || 0;
  const stock = parseInt(formData.get("stock") as string) || 0;
  const minStock = parseInt(formData.get("minStock") as string) || 0;
  const image = formData.get("image") as string;

  await prisma.product.update({
    where: { id },
    data: { name, description, category, price, cost, stock, minStock, image },
  });
  revalidatePath("/products");
}

export async function createClient(formData: FormData) {
  const name = formData.get("name") as string;
  const apodo = formData.get("apodo") as string;
  const direccion = formData.get("direccion") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const notes = formData.get("notes") as string;

  await prisma.client.create({ data: { name, apodo, direccion, phone, email, notes } });
  revalidatePath("/clients");
}

export async function updateClient(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const apodo = formData.get("apodo") as string;
  const direccion = formData.get("direccion") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const notes = formData.get("notes") as string;

  await prisma.client.update({
    where: { id },
    data: { name, apodo, direccion, phone, email, notes },
  });
  revalidatePath("/clients");
}

export async function createAppointment(formData: FormData) {
  const clientName = formData.get("clientName") as string;
  const date = new Date(formData.get("date") as string);
  const time = formData.get("time") as string;
  const type = formData.get("type") as string;
  const notes = formData.get("notes") as string;
  const treatmentPlanIdStr = formData.get("treatmentPlanId") as string;

  let clientId: number;
  let treatmentPlanId: number | null = null;
  let sessionNumber: number | null = null;

  if (treatmentPlanIdStr) {
    treatmentPlanId = parseInt(treatmentPlanIdStr);
    const plan = await prisma.treatmentPlan.findUnique({
      where: { id: treatmentPlanId },
      include: { appointments: true },
    });
    if (!plan) throw new Error("Plan no encontrado");
    if (plan.remainingSessions <= 0) throw new Error("El plan no tiene sesiones restantes");
    clientId = plan.clientId;
    sessionNumber = (plan.appointments.length + 1);
  } else {
    let client = await prisma.client.findFirst({ where: { name: clientName } });
    if (!client) {
      client = await prisma.client.create({ data: { name: clientName } });
    }
    clientId = client.id;
  }

  const appointment = await prisma.appointment.create({
    data: {
      clientId,
      date,
      time,
      type,
      notes,
      status: "pendiente",
      treatmentPlanId,
      sessionNumber,
    },
  });

  if (treatmentPlanId) {
    await prisma.treatmentPlan.update({
      where: { id: treatmentPlanId },
      data: { remainingSessions: { decrement: 1 } },
    });
  }

  revalidatePath("/appointments");
  if (treatmentPlanId) revalidatePath(`/treatment-plans/${treatmentPlanId}`);
}

export async function updateAppointment(id: number, formData: FormData) {
  const clientId = parseInt(formData.get("clientId") as string);
  const date = new Date(formData.get("date") as string);
  const time = formData.get("time") as string;
  const type = formData.get("type") as string;
  const status = formData.get("status") as string;
  const notes = formData.get("notes") as string;

  await prisma.appointment.update({
    where: { id },
    data: { clientId, date, time, type, status, notes },
  });
  revalidatePath("/appointments");
}

export async function completeAppointment(id: number) {
  const appointment = await prisma.appointment.update({
    where: { id },
    data: { status: "completada" },
  });
  revalidatePath("/appointments");
  if (appointment.treatmentPlanId) {
    revalidatePath(`/treatment-plans/${appointment.treatmentPlanId}`);
  }
  return { treatmentPlanId: appointment.treatmentPlanId };
}

export async function createSale(formData: FormData) {
  let clientIdStr = formData.get("clientId") as string;
  const clientName = formData.get("clientName") as string;
  let clientId: number | null = clientIdStr ? parseInt(clientIdStr) : null;

  if (!clientId && clientName) {
    let client = await prisma.client.findFirst({ where: { name: clientName } });
    if (!client) {
      client = await prisma.client.create({ data: { name: clientName } });
    }
    clientId = client.id;
  }

  const appointmentIdStr = formData.get("appointmentId") as string;
  const appointmentId = appointmentIdStr ? parseInt(appointmentIdStr) : null;

  const rawItems = JSON.parse(formData.get("items") as string) as Array<{
    type: "product" | "manual";
    productId?: number;
    customName?: string;
    customDescription?: string;
    customPrice?: number;
    quantity: number;
  }>;

  let total = 0;
  const saleItems: Array<{
    productId?: number | null;
    customName?: string;
    customDescription?: string;
    customPrice?: number;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }> = [];

  for (const item of rawItems) {
    if (item.type === "product") {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para ${product?.name || "producto"}`);
      }
      const unitPrice = product.price;
      const subtotal = unitPrice * item.quantity;
      total += subtotal;
      saleItems.push({ productId: item.productId, quantity: item.quantity, unitPrice, subtotal });
    } else {
      const unitPrice = item.customPrice ?? 0;
      const subtotal = unitPrice * item.quantity;
      total += subtotal;
      saleItems.push({ productId: null, customName: item.customName ?? "", customDescription: item.customDescription ?? "", customPrice: unitPrice, quantity: item.quantity, unitPrice, subtotal });
    }
  }

  const paid = parseFloat(formData.get("paid") as string) || 0;
  const change = paid > total ? paid - total : 0;

  const sale = await prisma.sale.create({
    data: {
      clientId,
      total,
      paid,
      change,
      items: { create: saleItems },
    },
  });

  if (appointmentId) {
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { saleId: sale.id },
    });
    revalidatePath("/appointments");
  }

  for (const item of rawItems) {
    if (item.type === "product") {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }
  }

  revalidatePath("/sales");
  return sale.id;
}

export async function createManufacture(formData: FormData) {
  const productId = parseInt(formData.get("productId") as string);
  const quantity = parseInt(formData.get("quantity") as string) || 0;
  const notes = (formData.get("notes") as string) || "";

  if (!productId || quantity <= 0) throw new Error("Datos inválidos");

  await prisma.$transaction([
    prisma.manufacture.create({
      data: { productId, quantity, notes },
    }),
    prisma.product.update({
      where: { id: productId },
      data: { stock: { increment: quantity } },
    }),
  ]);

  revalidatePath("/inventory");
  revalidatePath("/products");
}

export async function deleteManufacture(id: number) {
  const record = await prisma.manufacture.findUnique({ where: { id } });
  if (!record) throw new Error("Registro no encontrado");

  await prisma.$transaction([
    prisma.manufacture.delete({ where: { id } }),
    prisma.product.update({
      where: { id: record.productId },
      data: { stock: { decrement: record.quantity } },
    }),
  ]);

  revalidatePath("/inventory");
  revalidatePath("/products");
}

export async function updateManufacture(id: number, formData: FormData) {
  const quantity = parseInt(formData.get("quantity") as string) || 0;
  const notes = (formData.get("notes") as string) || "";

  if (quantity <= 0) throw new Error("Cantidad inválida");

  const record = await prisma.manufacture.findUnique({ where: { id } });
  if (!record) throw new Error("Registro no encontrado");

  const diff = quantity - record.quantity;

  await prisma.$transaction([
    prisma.manufacture.update({
      where: { id },
      data: { quantity, notes },
    }),
    prisma.product.update({
      where: { id: record.productId },
      data: { stock: { increment: diff } },
    }),
  ]);

  revalidatePath("/inventory");
  revalidatePath("/products");
}

export async function createPurchase(formData: FormData) {
  const concept = formData.get("concept") as string;
  const amount = parseFloat(formData.get("amount") as string) || 0;

  await prisma.purchase.create({
    data: { concept, total: amount },
  });

  revalidatePath("/purchases");
}
