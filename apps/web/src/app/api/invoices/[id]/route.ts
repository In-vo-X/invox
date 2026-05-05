import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, context: RouteContext<"/api/invoices/[id]">) {
  const { id } = await context.params;
  const invoice = await prisma.invoiceMetadata.findUnique({ where: { id } });

  if (!invoice) {
    return Response.json({ message: "Not found" }, { status: 404 });
  }

  return Response.json(invoice);
}
