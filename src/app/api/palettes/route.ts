import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const brandId = searchParams.get("brandId");

  const palettes = await prisma.palette.findMany({
    where: brandId ? { brandId } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ palettes });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || !body.brandId || !body.name) {
    return NextResponse.json(
      { error: "brandId and name are required." },
      { status: 400 }
    );
  }

  const colors = Array.isArray(body.colors)
    ? body.colors.filter((color: unknown) => typeof color === "string")
    : [];

  const palette = await prisma.palette.create({
    data: {
      brandId: body.brandId,
      name: String(body.name).trim(),
      colors,
    },
  });

  return NextResponse.json({ palette }, { status: 201 });
}
