export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-16">
        <header className="flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Instagram Aesthetic Agent
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Build and manage your brand aesthetic.
          </h1>
          <p className="max-w-2xl text-lg text-zinc-600">
            Start by creating a brand and adding color palettes that define its
            visual identity. We will build more AI features on top of this
            foundation.
          </p>
        </header>
        <div>
          <a
            className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
            href="/brands"
          >
            Open Brand Workspace
          </a>
        </div>
      </main>
    </div>
  );
}
