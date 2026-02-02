"use client";

import { useEffect, useMemo, useState } from "react";

async function readJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

type Palette = {
  id: string;
  name: string;
  colors: string[];
  brandId: string;
};

type Brand = {
  id: string;
  name: string;
  handle: string | null;
  palettes: Palette[];
};

type AiPaletteSuggestion = {
  name: string;
  colors: string[];
};

type AiResult = {
  palette_suggestions: AiPaletteSuggestion[];
  mood_captions: string[];
};

function normalizeAiResult(input: unknown): AiResult | null {
  if (!input || typeof input !== "object") return null;
  const data = input as {
    palette_suggestions?: unknown;
    mood_captions?: unknown;
  };

  const palettes = Array.isArray(data.palette_suggestions)
    ? data.palette_suggestions
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const obj = item as { name?: unknown; colors?: unknown };
          const name = typeof obj.name === "string" ? obj.name : "Untitled";
          const colors = Array.isArray(obj.colors)
            ? obj.colors
                .map((color) => {
                  if (typeof color === "string") return color;
                  if (color && typeof color === "object") {
                    const c = color as { color?: unknown; hex?: unknown };
                    if (typeof c.color === "string") return c.color;
                    if (typeof c.hex === "string") return c.hex;
                  }
                  return null;
                })
                .filter(Boolean)
            : [];
          return { name, colors: colors as string[] };
        })
        .filter(Boolean)
    : [];

  const captions = Array.isArray(data.mood_captions)
    ? data.mood_captions.map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const obj = item as { caption?: unknown; text?: unknown };
          if (typeof obj.caption === "string") return obj.caption;
          if (typeof obj.text === "string") return obj.text;
          return JSON.stringify(item);
        }
        return String(item);
      })
    : [];

  return {
    palette_suggestions: palettes as AiPaletteSuggestion[],
    mood_captions: captions,
  };
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [brandName, setBrandName] = useState("");
  const [brandHandle, setBrandHandle] = useState("");
  const [paletteName, setPaletteName] = useState("");
  const [paletteColors, setPaletteColors] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [aiLoadingId, setAiLoadingId] = useState<string | null>(null);
  const [aiByBrandId, setAiByBrandId] = useState<Record<string, AiResult | null>>({});
  const [aiRawByBrandId, setAiRawByBrandId] = useState<Record<string, string | null>>({});

  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [editingBrandName, setEditingBrandName] = useState("");
  const [editingBrandHandle, setEditingBrandHandle] = useState("");

  const [editingPaletteId, setEditingPaletteId] = useState<string | null>(null);
  const [editingPaletteName, setEditingPaletteName] = useState("");
  const [editingPaletteColors, setEditingPaletteColors] = useState("");

  const sortedBrands = useMemo(
    () => [...brands].sort((a, b) => a.name.localeCompare(b.name)),
    [brands]
  );

  async function loadBrands() {
    setLoading(true);
    const res = await fetch("/api/brands");
    const data = await res.json();
    setBrands(data.brands ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadBrands();
  }, []);

  async function handleCreateBrand(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const res = await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: brandName,
        handle: brandHandle || null,
      }),
    });

    if (!res.ok) {
      const data = await readJsonSafe(res);
      setError(data?.error ?? "Failed to create brand.");
      return;
    }

    setBrandName("");
    setBrandHandle("");
    await loadBrands();
  }

  async function handleCreatePalette(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!selectedBrandId) {
      setError("Pick a brand before adding a palette.");
      return;
    }

    const colors = paletteColors
      .split(",")
      .map((color) => color.trim())
      .filter(Boolean);

    const res = await fetch("/api/palettes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brandId: selectedBrandId,
        name: paletteName,
        colors,
      }),
    });

    if (!res.ok) {
      const data = await readJsonSafe(res);
      setError(data?.error ?? "Failed to create palette.");
      return;
    }

    setPaletteName("");
    setPaletteColors("");
    await loadBrands();
  }

  function startEditBrand(brand: Brand) {
    setEditingBrandId(brand.id);
    setEditingBrandName(brand.name);
    setEditingBrandHandle(brand.handle ?? "");
  }

  function cancelEditBrand() {
    setEditingBrandId(null);
    setEditingBrandName("");
    setEditingBrandHandle("");
  }

  async function handleUpdateBrand(event: React.FormEvent) {
    event.preventDefault();
    if (!editingBrandId) return;

    const res = await fetch(`/api/brands/${editingBrandId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editingBrandName,
        handle: editingBrandHandle || null,
      }),
    });

    if (!res.ok) {
      const data = await readJsonSafe(res);
      setError(data?.error ?? "Failed to update brand.");
      return;
    }

    cancelEditBrand();
    await loadBrands();
  }

  function startEditPalette(palette: Palette) {
    setEditingPaletteId(palette.id);
    setEditingPaletteName(palette.name);
    setEditingPaletteColors(palette.colors.join(", "));
  }

  function cancelEditPalette() {
    setEditingPaletteId(null);
    setEditingPaletteName("");
    setEditingPaletteColors("");
  }

  async function handleUpdatePalette(event: React.FormEvent) {
    event.preventDefault();
    if (!editingPaletteId) return;

    const colors = editingPaletteColors
      .split(",")
      .map((color) => color.trim())
      .filter(Boolean);

    const res = await fetch(`/api/palettes/${editingPaletteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editingPaletteName,
        colors,
      }),
    });

    if (!res.ok) {
      const data = await readJsonSafe(res);
      setError(data?.error ?? "Failed to update palette.");
      return;
    }

    cancelEditPalette();
    await loadBrands();
  }

  async function handleGenerateAi(brand: Brand) {
    setError(null);
    setAiLoadingId(brand.id);

    const res = await fetch("/api/ai/brand", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId: brand.id }),
    });

    if (!res.ok) {
      const data = await readJsonSafe(res);
      const detail = typeof data?.detail === "string" ? ` ${data.detail}` : "";
      setError((data?.error ?? "Failed to generate AI suggestions.") + detail);
      setAiLoadingId(null);
      return;
    }

    const data = await readJsonSafe(res);
    const rawText = typeof data?.raw === "string" ? data.raw : null;
    const result = data?.result ?? (rawText ? safeJsonParse(rawText) : null);
    const normalized = normalizeAiResult(result);
    setAiByBrandId((prev) => ({ ...prev, [brand.id]: normalized }));
    setAiRawByBrandId((prev) => ({ ...prev, [brand.id]: rawText }));
    setAiLoadingId(null);
  }

  async function handleDeletePalette(id: string) {
    const res = await fetch(`/api/palettes/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await readJsonSafe(res);
      setError(data?.error ?? "Failed to delete palette.");
      return;
    }
    await loadBrands();
  }

  async function handleDeleteBrand(id: string) {
    const res = await fetch(`/api/brands/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await readJsonSafe(res);
      setError(data?.error ?? "Failed to delete brand.");
      return;
    }
    await loadBrands();
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Brand Workspace
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Create brands and palettes
          </h1>
          <p className="max-w-2xl text-base text-zinc-600">
            Keep your Instagram aesthetic consistent by defining brand palettes.
            Next we will connect this to AI captioning and image guidance.
          </p>
        </header>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-2">
          <form
            onSubmit={handleCreateBrand}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold">Create a brand</h2>
            <div className="mt-4 flex flex-col gap-3">
              <input
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                placeholder="Brand name"
                value={brandName}
                onChange={(event) => setBrandName(event.target.value)}
                required
              />
              <input
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                placeholder="Instagram handle (optional)"
                value={brandHandle}
                onChange={(event) => setBrandHandle(event.target.value)}
              />
            </div>
            <button
              type="submit"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
            >
              Save brand
            </button>
          </form>

          <form
            onSubmit={handleCreatePalette}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold">Add a palette</h2>
            <div className="mt-4 flex flex-col gap-3">
              <select
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                value={selectedBrandId}
                onChange={(event) => setSelectedBrandId(event.target.value)}
                required
              >
                <option value="">Select a brand</option>
                {sortedBrands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
              <input
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                placeholder="Palette name"
                value={paletteName}
                onChange={(event) => setPaletteName(event.target.value)}
                required
              />
              <input
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                placeholder="Comma-separated colors (#111111, #f5f5f5)"
                value={paletteColors}
                onChange={(event) => setPaletteColors(event.target.value)}
              />
            </div>
            <button
              type="submit"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
            >
              Save palette
            </button>
          </form>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your brands</h2>
            <button
              onClick={loadBrands}
              className="text-sm font-semibold text-zinc-600 hover:text-black"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-sm text-zinc-500">Loading brands...</div>
          ) : sortedBrands.length === 0 ? (
            <div className="text-sm text-zinc-500">
              No brands yet. Create your first one above.
            </div>
          ) : (
            <div className="grid gap-4">
              {sortedBrands.map((brand) => (
                <div
                  key={brand.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {editingBrandId === brand.id ? (
                        <form
                          onSubmit={handleUpdateBrand}
                          className="flex flex-col gap-2"
                        >
                          <input
                            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                            value={editingBrandName}
                            onChange={(event) =>
                              setEditingBrandName(event.target.value)
                            }
                            required
                          />
                          <input
                            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                            value={editingBrandHandle}
                            onChange={(event) =>
                              setEditingBrandHandle(event.target.value)
                            }
                            placeholder="Instagram handle"
                          />
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="submit"
                              className="inline-flex items-center justify-center rounded-full bg-black px-3 py-1 text-xs font-semibold text-white"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditBrand}
                              className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <h3 className="text-lg font-semibold">{brand.name}</h3>
                          {brand.handle ? (
                            <p className="text-sm text-zinc-500">
                              @{brand.handle}
                            </p>
                          ) : null}
                        </>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {editingBrandId === brand.id ? null : (
                        <button
                          onClick={() => startEditBrand(brand)}
                          className="text-xs font-semibold uppercase tracking-wide text-zinc-500 hover:text-black"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteBrand(brand.id)}
                        className="text-xs font-semibold uppercase tracking-wide text-zinc-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">AI suggestions</p>
                        <p className="text-xs text-zinc-500">
                          Generate palette ideas and mood captions for this brand.
                        </p>
                      </div>
                      <button
                        onClick={() => handleGenerateAi(brand)}
                        className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700"
                        disabled={aiLoadingId === brand.id}
                      >
                        {aiLoadingId === brand.id ? "Generating..." : "Generate"}
                      </button>
                    </div>

                    {aiByBrandId[brand.id] ? (
                      <div className="mt-4 grid gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            Palette suggestions
                          </p>
                          <div className="mt-2 grid gap-3">
                            {aiByBrandId[brand.id]?.palette_suggestions?.map((item, index) => (
                              <div
                                key={`${brand.id}-ai-palette-${index}`}
                                className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                              >
                                <p className="text-sm font-semibold">{item.name}</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {item.colors.map((color) => (
                                    <span
                                      key={`${brand.id}-ai-${item.name}-${color}`}
                                      className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs"
                                    >
                                      <span
                                        className="h-3 w-3 rounded-full border border-zinc-200"
                                        style={{ backgroundColor: color }}
                                      />
                                      {color}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            Mood captions
                          </p>
                          <ul className="mt-2 grid gap-2 text-sm text-zinc-700">
                            {aiByBrandId[brand.id]?.mood_captions?.length ? (
                              aiByBrandId[brand.id]?.mood_captions?.map((caption, index) => (
                                <li
                                  key={`${brand.id}-ai-caption-${index}`}
                                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
                                >
                                  {caption}
                                </li>
                              ))
                            ) : (
                              <li className="text-xs text-zinc-500">No captions returned.</li>
                            )}
                          </ul>
                        </div>
                        {aiRawByBrandId[brand.id] ? (
                          <div className="mt-3 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600">
                            {aiRawByBrandId[brand.id]}
                          </div>
                        ) : null}
                      </div>
                    ) : aiRawByBrandId[brand.id] ? (
                      <div className="mt-3 text-xs text-zinc-600">
                        {aiRawByBrandId[brand.id]}
                      </div>
                    ) : null}
                  </div>

                  {brand.palettes.length === 0 ? (
                    <p className="mt-4 text-sm text-zinc-500">
                      No palettes yet.
                    </p>
                  ) : (
                    <div className="mt-4 grid gap-3">
                      {brand.palettes.map((palette) => (
                        <div
                          key={palette.id}
                          className="rounded-xl border border-zinc-200 px-4 py-3"
                        >
                          {editingPaletteId === palette.id ? (
                            <form
                              onSubmit={handleUpdatePalette}
                              className="flex flex-col gap-2"
                            >
                              <input
                                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                                value={editingPaletteName}
                                onChange={(event) =>
                                  setEditingPaletteName(event.target.value)
                                }
                                required
                              />
                              <input
                                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                                value={editingPaletteColors}
                                onChange={(event) =>
                                  setEditingPaletteColors(event.target.value)
                                }
                              />
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="submit"
                                  className="inline-flex items-center justify-center rounded-full bg-black px-3 py-1 text-xs font-semibold text-white"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditPalette}
                                  className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-600"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold">
                                  {palette.name}
                                </p>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => startEditPalette(palette)}
                                    className="text-xs font-semibold uppercase tracking-wide text-zinc-500 hover:text-black"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeletePalette(palette.id)}
                                    className="text-xs font-semibold uppercase tracking-wide text-zinc-500 hover:text-red-600"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {palette.colors.length === 0 ? (
                                  <span className="text-xs text-zinc-500">
                                    No colors listed.
                                  </span>
                                ) : (
                                  palette.colors.map((color) => (
                                    <span
                                      key={`${palette.id}-${color}`}
                                      className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs"
                                    >
                                      <span
                                        className="h-3 w-3 rounded-full border border-zinc-200"
                                        style={{ backgroundColor: color }}
                                      />
                                      {color}
                                    </span>
                                  ))
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
