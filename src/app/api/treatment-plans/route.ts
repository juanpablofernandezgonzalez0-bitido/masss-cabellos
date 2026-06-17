import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return Response.json({ error: "id is required" }, { status: 400 });
  }
  const plan = await prisma.treatmentPlan.findUnique({
    where: { id: parseInt(id) },
    include: { client: true },
  });
  if (!plan) {
    return Response.json({ error: "Plan not found" }, { status: 404 });
  }
  return Response.json(plan);
}
