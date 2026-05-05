import { prisma } from "@/lib/prisma";

export async function GET() {
  const invoices = await prisma.invoiceMetadata.findMany({
    orderBy: { createdAt: "desc" },
  });

  return Response.json(invoices);
}

export async function POST(request: Request) {
  const body = await request.json();
  const created = await prisma.invoiceMetadata.create({ data: body });
  return Response.json(created, { status: 201 });
}
