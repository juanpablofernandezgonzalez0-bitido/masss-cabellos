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
  const yesterdayStart = new Date(todayStart.getTime() - 86_400_000);
  const yesterdayEnd = new Date(todayStart.getTime());
  const weekAgo = new Date(todayStart.getTime() - 7 * 86_400_000);

  const [
    todaySales,
    yesterdaySales,
    weekSales,
    monthSales,
    allSales,
    todayAppointments,
    weekAppointments,
    allProducts,
    activePlans,
    totalClients,
    allClients,
    recentPurchases,
  ] = await Promise.all([
    prisma.sale.findMany({ where: { createdAt: { gte: todayStart, lte: todayEnd } }, include: { items: true } }),
    prisma.sale.findMany({ where: { createdAt: { gte: yesterdayStart, lte: yesterdayEnd } }, include: { items: true } }),
    prisma.sale.findMany({ where: { createdAt: { gte: weekAgo } }, include: { items: true, client: { select: { name: true } } } }),
    prisma.sale.findMany({ where: { createdAt: { gte: monthStart, lte: monthEnd } }, include: { items: true } }),
    prisma.sale.findMany({ take: 20, orderBy: { createdAt: "desc" }, include: { client: { select: { name: true } }, items: { include: { product: { select: { name: true } } } } } }),
    prisma.appointment.findMany({ where: { date: { gte: todayStart, lte: todayEnd } }, include: { client: { select: { name: true } } }, orderBy: { time: "asc" } }),
    prisma.appointment.findMany({ where: { date: { gte: todayStart, lte: new Date(todayStart.getTime() + 7 * 86_400_000) } }, include: { client: { select: { name: true } } }, orderBy: { date: "asc" } }),
    prisma.product.findMany({ where: { isActive: true } }),
    prisma.treatmentPlan.findMany({ where: { status: "activo" }, include: { client: { select: { name: true } } } }),
    prisma.client.count(),
    prisma.client.findMany({ include: { sales: { select: { total: true } } } }),
    prisma.purchase.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
  ]);

  const lowStock = allProducts.filter((p) => p.stock < p.minStock);

  const fmt = (d: Date) => d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });

  const salesByDay = new Map<string, { count: number; total: number }>();
  for (const s of weekSales) {
    const key = s.createdAt.toLocaleDateString("es-CO");
    const e = salesByDay.get(key) ?? { count: 0, total: 0 };
    e.count++; e.total += s.total;
    salesByDay.set(key, e);
  }

  const clientsWithSpending = allClients
    .map((c) => ({ name: c.name, spent: c.sales.reduce((s, x) => s + x.total, 0) }))
    .sort((a, b) => b.spent - a.spent);

  return `HOY: ${fmt(now)}
AYER: ${fmt(yesterdayStart)}

VENTAS POR DÍA (ÚLTIMOS 7 DÍAS):
${[...salesByDay.entries()].map(([d, v]) => `- ${d}: ${v.count} ventas, $${v.total.toLocaleString("es-CO")}`).join("\n")}

HOY:
- Ventas: ${todaySales.length} ventas, $${todaySales.reduce((s, x) => s + x.total, 0).toLocaleString("es-CO")}
- Productos vendidos: ${todaySales.reduce((s, x) => s + x.items.reduce((si, i) => si + i.quantity, 0), 0)} unidades
- Citas: ${todayAppointments.length} citas

AYER:
- Ventas: ${yesterdaySales.length} ventas, $${yesterdaySales.reduce((s, x) => s + x.total, 0).toLocaleString("es-CO")}
- Productos vendidos: ${yesterdaySales.reduce((s, x) => s + x.items.reduce((si, i) => si + i.quantity, 0), 0)} unidades

ESTE MES:
- Ventas: ${monthSales.length} ventas, $${monthSales.reduce((s, x) => s + x.total, 0).toLocaleString("es-CO")}

PRÓXIMAS CITAS (7 DÍAS):
${weekAppointments.map((a) => `- ${a.client.name} - ${a.date.toLocaleDateString("es-CO")} a las ${a.time} (${a.type})`).join("\n") || "Ninguna"}

INVENTARIO BAJO:
${lowStock.map((p) => `- ${p.name}: ${p.stock} uni. (mín: ${p.minStock})`).join("\n") || "Todo en stock normal"}

TOP CLIENTES POR GASTO TOTAL:
${clientsWithSpending.slice(0, 5).map((c) => `- ${c.name}: $${c.spent.toLocaleString("es-CO")}`).join("\n")}

PLANES ACTIVOS:
${activePlans.map((p) => `- ${p.client.name}: ${p.description} (${p.remainingSessions}/${p.totalSessions} sesiones)`).join("\n") || "Ninguno"}

COMPRAS RECIENTES:
${recentPurchases.map((p) => `- $${p.total.toLocaleString("es-CO")} (${p.concept}) - ${p.createdAt.toLocaleDateString("es-CO")}`).join("\n") || "Ninguna"}

ÚLTIMAS 20 VENTAS (con productos):
${allSales.map((s) => `- $${s.total.toLocaleString("es-CO")} ${s.client?.name ? "- "+s.client.name : ""} (${s.createdAt.toLocaleDateString("es-CO")})`).join("\n")}`;
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
