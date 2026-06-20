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
    workers,
    monthPayroll,
    todayPayroll,
    planPaymentsAgg,
    allWorkers,
    recentClients,
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
    prisma.worker.findMany({ where: { isActive: true } }),
    prisma.payroll.aggregate({ where: { paidAt: { gte: monthStart, lte: monthEnd } }, _sum: { amount: true }, _count: true }),
    prisma.payroll.aggregate({ where: { paidAt: { gte: todayStart, lte: todayEnd } }, _sum: { amount: true }, _count: true }),
    prisma.treatmentPlan.aggregate({ where: { status: "activo" }, _sum: { paidAmount: true, price: true }, _count: true }),
    prisma.worker.findMany({ where: { isActive: true }, select: { name: true } }),
    prisma.client.findMany({ take: 15, orderBy: { createdAt: "desc" }, select: { name: true, phone: true } }),
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

  const catCount = new Map<string, number>();
  for (const p of allProducts) {
    catCount.set(p.category, (catCount.get(p.category) || 0) + 1);
  }
  const categories = [...catCount.entries()].map(([c, n]) => `${c} (${n})`).join(", ");

  const totalProducts = allProducts.length;
  const totalStock = allProducts.reduce((s, p) => s + p.stock, 0);
  const totalValue = allProducts.reduce((s, p) => s + p.price * p.stock, 0);

  const productList = allProducts
    .sort((a, b) => b.stock - a.stock)
    .map((p) => `- ${p.name}: $${p.price.toLocaleString("es-CO")}, stock ${p.stock}, categoría ${p.category}`)
    .join("\n");

  const apptTypes = new Set(weekAppointments.map((a) => a.type));
  const services = [...apptTypes].join(", ");

  const bestSellers = allSales
    .flatMap((s) => s.items.map((i) => i.product?.name || i.customDescription))
    .filter(Boolean)
    .reduce<Record<string, number>>((acc, name) => {
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});
  const topSold = Object.entries(bestSellers)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => `${name} (${count} veces)`)
    .join(", ");

  return `INFORMACIÓN DEL NEGOCIO:
- Nombre: MASSS CABELLOS (con 3 S)
- Tipo: Estética y Bienestar (salón de belleza y cuidado capilar)
- Servicios ofrecidos: ${services || "revisión, tratamiento, consulta, seguimiento"}
- Productos en inventario: ${totalProducts} productos en ${catCount.size} categorías (${categories})
- Valor total del inventario: $${totalValue.toLocaleString("es-CO")}
- Total clientes registrados: ${totalClients}
- Trabajadoras activas: ${workers.length} (${allWorkers.map((w) => w.name).join(", ")})

FECHA Y HORA ACTUAL:
HOY: ${fmt(now)}
AYER: ${fmt(yesterdayStart)}

VENTAS POR DÍA (ÚLTIMOS 7 DÍAS):
${[...salesByDay.entries()].map(([d, v]) => `- ${d}: ${v.count} ventas, $${v.total.toLocaleString("es-CO")}`).join("\n")}

HOY:
- Ventas: ${todaySales.length} ventas, $${todaySales.reduce((s, x) => s + x.total, 0).toLocaleString("es-CO")}
- Productos vendidos: ${todaySales.reduce((s, x) => s + x.items.reduce((si, i) => si + i.quantity, 0), 0)} unidades
- Citas hoy: ${todayAppointments.length} citas

AYER:
- Ventas: ${yesterdaySales.length} ventas, $${yesterdaySales.reduce((s, x) => s + x.total, 0).toLocaleString("es-CO")}

ESTE MES:
- Ventas totales: ${monthSales.length} ventas, $${monthSales.reduce((s, x) => s + x.total, 0).toLocaleString("es-CO")}

PRODUCTOS MÁS VENDIDOS (histórico):
${topSold || "Aún no hay datos suficientes"}

PRODUCTOS CON STOCK BAJO:
${lowStock.map((p) => `- ${p.name}: ${p.stock} uni. (mín: ${p.minStock})`).join("\n") || "Ninguno, todo en stock normal"}

CLIENTES RECIENTES:
${recentClients.map((c) => `- ${c.name}${c.phone ? ` (${c.phone})` : ""}`).join("\n")}

TOP 5 CLIENTES POR GASTO:
${clientsWithSpending.slice(0, 5).map((c) => `- ${c.name}: $${c.spent.toLocaleString("es-CO")}`).join("\n")}

PRÓXIMAS CITAS (7 DÍAS):
${weekAppointments.map((a) => `- ${a.client.name} - ${a.date.toLocaleDateString("es-CO")} a las ${a.time} (${a.type})`).join("\n") || "Ninguna"}

PLANES DE TRATAMIENTO ACTIVOS:
${activePlans.map((p) => `- ${p.client.name}: ${p.description} (${p.remainingSessions}/${p.totalSessions} sesiones, pagado $${p.paidAmount.toLocaleString("es-CO")} de $${p.price.toLocaleString("es-CO")})`).join("\n") || "Ninguno"}

COMPRAS / GASTOS RECIENTES:
${recentPurchases.map((p) => `- $${p.total.toLocaleString("es-CO")} (${p.concept}) - ${p.createdAt.toLocaleDateString("es-CO")}`).join("\n") || "Ninguna"}

NÓMINA:
- Trabajadoras: ${workers.length} (${allWorkers.map((w) => w.name).join(", ")})
- Pagado hoy: $${todayPayroll._sum.amount?.toLocaleString("es-CO") || "0"} (${todayPayroll._count} pago${todayPayroll._count !== 1 ? "s" : ""})
- Pagado este mes: $${monthPayroll._sum.amount?.toLocaleString("es-CO") || "0"} (${monthPayroll._count} pago${monthPayroll._count !== 1 ? "s" : ""})

LISTA COMPLETA DE PRODUCTOS:
${productList}

ÚLTIMAS 20 VENTAS:
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
          content: `Eres "Asistente MASSS Cabellos", un asistente amable y servicial del salón de estética y cuidado capilar MASSS Cabellos. Trabajas junto al equipo del salón y tienes acceso en tiempo real a los datos del negocio.

INSTRUCCIONES:
- Responde en español colombiano, natural y conversacional, como si fueras una recepcionista del salón.
- Usa los datos del contexto para responder preguntas sobre ventas, clientes, citas, productos, inventario, nómina, planes, etc.
- Si algo no está en el contexto dilo con honestidad pero amablemente: "En este momento no tengo ese dato, pero puedo ayudarte con [tema relacionado]".
- No inventes datos ni números. Si no sabes, dilo claro.
- Responde de forma útil pero concisa (máximo 4-5 oraciones a menos que te pidan más detalle).
- Puedes saludar si te saludan, despedirte si se despiden, y hacer preguntas si necesitas aclarar algo.
- Cuando la pregunta es vaga (ej: "cómo vamos hoy"), da un resumen general útil.
- Si te preguntan por algo que requiere acceder al sistema (como crear registros), indica qué módulo deben usar o guíalos al lugar correcto.
- Puedes sugerir acciones basadas en los datos (ej: "veo que tienes stock bajo de X, ¿quieres que te recuerde pedir más?").

CONTEXTO ACTUAL DEL NEGOCIO:
${context}`,
        },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const response = completion.choices[0]?.message?.content ?? "Lo siento, no pude generar una respuesta en este momento. ¿Puedes intentarlo de nuevo?";

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Assistant error:", error);
    const msg = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: `Error: ${msg}` }, { status: 500 });
  }
}
