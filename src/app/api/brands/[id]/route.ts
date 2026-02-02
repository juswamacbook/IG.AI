import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getId(request: NextRequest, context: { params?: { id?: string } }) {
  const direct = context?.params?.id;
  if (direct) return direct;

  const pathname = new URL(request.url).pathname;
  const parts = pathname.split("/").filter(Boolean);
  return parts[parts.length - 1] || null;
}

export async function PUT(request: NextRequest, context: { params?: { id?: string } }) {
  const id = getId(request, context);
  if (!id) {
    return NextResponse.json({ error: "Missing brand id." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const brand = await prisma.brand.update({
    where: { id },
    data: {
      name: typeof body.name === "string" ? body.name.trim() : undefined,
      handle: typeof body.handle === "string" ? body.handle.trim() : undefined,
    },
  });

  return NextResponse.json({ brand });
}

export async function DELETE(request: NextRequest, context: { params?: { id?: string } }) {
  const id = getId(request, context);
  if (!id) {
    return NextResponse.json({ error: "Missing brand id." }, { status: 400 });
  }

  try {
    await prisma.palette.deleteMany({ where: { brandId: id } });
    await prisma.asset.deleteMany({ where: { brandId: id } });
    await prisma.post.deleteMany({ where: { brandId: id } });
    await prisma.brand.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete brand", error);
    return NextResponse.json(
      { error: "Failed to delete brand." },
      { status: 500 }
    );
  }
}
