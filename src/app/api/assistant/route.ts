import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const groq = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY ?? "",
});

async function buildContext() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86_400_000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [
    todaySales,
    monthSales,
    todayAppointments,
    allProducts,
    activePlans,
    totalClients,
    recentSales,
  ] = await Promise.all([
    prisma.sale.findMany({ where: { createdAt: { gte: todayStart, lte: todayEnd } }, include: { items: true } }),
    prisma.sale.findMany({ where: { createdAt: { gte: monthStart, lte: monthEnd } }, include: { items: true } }),
    prisma.appointment.findMany({ where: { date: { gte: todayStart, lte: todayEnd } }, include: { client: { select: { name: true } } } }),
    prisma.product.findMany({ where: { isActive: true } }),
    prisma.treatmentPlan.findMany({ where: { status: "activo" }, include: { client: { select: { name: true } } } }),
    prisma.client.count(),
    prisma.sale.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { client: { select: { name: true } }, items: true } }),
  ]);

  const lowStockProducts = allProducts.filter((p) => p.stock < p.minStock);
  const totalProducts = allProducts.length;

  const todayRevenue = todaySales.reduce((s, x) => s + x.total, 0);
  const monthRevenue = monthSales.reduce((s, x) => s + x.total, 0);
  const todayProductsSold = todaySales.reduce((s, x) => s + x.items.reduce((si, i) => si + i.quantity, 0), 0);

  const productsStr = lowStockProducts.map((p) => `"${p.name}" (stock: ${p.stock}, mínimo: ${p.minStock})`).join("\n");

  return `FECHA ACTUAL: ${now.toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}

RESUMEN DE HOY:
- Ventas del día: ${todaySales.length} ventas por $${todayRevenue.toLocaleString("es-CO")}
- Productos vendidos hoy: ${todayProductsSold} unidades
- Citas de hoy: ${todayAppointments.length} citas

RESUMEN DEL MES:
- Ventas del mes: ${monthSales.length} ventas por $${monthRevenue.toLocaleString("es-CO")}

INVENTARIO:
- Total productos activos: ${totalProducts}
- Productos por debajo del stock mínimo:
${productsStr || "Ninguno"}

CLIENTES:
- Total clientes registrados: ${totalClients}
- Planes activos: ${activePlans.length}

CITAS DE HOY:
${todayAppointments.map((a) => `- ${a.client.name} a las ${a.time} (${a.type})`).join("\n") || "Ninguna"}

ÚLTIMAS 5 VENTAS:
${recentSales.map((s) => `- $${s.total.toLocaleString("es-CO")} - ${s.client?.name ?? "Sin cliente"} (${s.createdAt.toLocaleDateString("es-CO")})`).join("\n") || "Ninguna"}

PLANES ACTIVOS:
${activePlans.map((p) => `- ${p.description} - Cliente: ${p.client.name} (${p.remainingSessions}/${p.totalSessions} sesiones restantes)`).join("\n") || "Ninguno"}`;
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mensaje inválido" }, { status: 400 });
    }

    const context = await buildContext();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Eres un asistente interno de "Masss Cabellos". Responde ÚNICAMENTE lo que te preguntan, sin explicaciones adicionales, sin recitar el contexto, sin saludar. Máximo 2 oraciones directas. Usa el contexto solo si es necesario.

CONTEXTO ACTUAL DEL NEGOCIO:
${context}`,
        },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content ?? "No pude generar una respuesta. Intenta de nuevo.";

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Assistant error:", error);
    const msg = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: `Error: ${msg}` }, { status: 500 });
  }
}
