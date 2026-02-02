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
    return NextResponse.json({ error: "Missing palette id." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const colors = Array.isArray(body.colors)
    ? body.colors.filter((color: unknown) => typeof color === "string")
    : undefined;

  const palette = await prisma.palette.update({
    where: { id },
    data: {
      name: typeof body.name === "string" ? body.name.trim() : undefined,
      colors,
    },
  });

  return NextResponse.json({ palette });
}

export async function DELETE(request: NextRequest, context: { params?: { id?: string } }) {
  const id = getId(request, context);
  if (!id) {
    return NextResponse.json({ error: "Missing palette id." }, { status: 400 });
  }

  await prisma.palette.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
