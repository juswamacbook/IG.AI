import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3.1:8b";

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.brandId) {
    return NextResponse.json(
      { error: "brandId is required." },
      { status: 400 }
    );
  }

  const brand = await prisma.brand.findUnique({
    where: { id: body.brandId },
    include: { palettes: true },
  });

  if (!brand) {
    return NextResponse.json({ error: "Brand not found." }, { status: 404 });
  }

  const promptPayload = {
    brand: {
      name: brand.name,
      handle: brand.handle,
    },
    existing_palettes: brand.palettes.map((palette) => ({
      name: palette.name,
      colors: palette.colors,
    })),
    request: {
      palette_suggestions: {
        count: 3,
        colors_per_palette: "4-6",
        format: "hex",
      },
      mood_captions: {
        count: 5,
        length: "1-2 sentences",
      },
    },
  };

  const payload = {
    model: OLLAMA_MODEL,
    stream: false,
    format: "json",
    messages: [
      {
        role: "system",
        content:
          "You are an Instagram aesthetic strategist. Return ONLY valid JSON (no markdown). Provide exactly 3 palette_suggestions with 4-6 hex colors each, and exactly 5 mood_captions (1-2 sentences each). If brand context is sparse, invent reasonable aesthetic suggestions.",
      },
      {
        role: "user",
        content: JSON.stringify(promptPayload),
      },
    ],
  };

  let resultText = "";
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: "Ollama request failed.", detail: err },
        { status: 500 }
      );
    }

    const data = await res.json();
    resultText = data?.message?.content ?? data?.response ?? "";
    if (!resultText) {
      return NextResponse.json(
        { error: "Empty response from Ollama.", detail: JSON.stringify(data) },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to reach Ollama. Make sure it is running.",
        detail: String(error),
      },
      { status: 500 }
    );
  }

  const parsed = safeJsonParse(resultText.trim());

  return NextResponse.json({
    result: parsed ?? null,
    raw: resultText,
  });
}
