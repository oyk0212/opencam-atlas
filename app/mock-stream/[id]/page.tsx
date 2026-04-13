export default async function MockStreamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const label = id.replaceAll("-", " ");

  return (
    <main className="grid min-h-screen place-items-center bg-[color:var(--background)] p-4">
      <section className="w-full max-w-5xl overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[rgba(250,249,245,0.04)]">
        <div className="relative aspect-[16/9] bg-[linear-gradient(135deg,rgba(201,100,66,0.28),rgba(106,197,139,0.12),rgba(15,17,17,0.92))]">
          <div className="absolute left-[8%] top-[10%] rounded-full border border-[rgba(217,106,106,0.38)] bg-[rgba(217,106,106,0.2)] px-3 py-1 text-[11px] uppercase tracking-[0.08em] text-[color:var(--text)]">
            Mock live preview
          </div>
          <div
            className="absolute left-[8%] top-[18%] text-[clamp(24px,5vw,56px)] text-[color:var(--text)]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Mock stream
          </div>
          <div className="absolute right-[10%] top-[16%] h-28 w-28 rounded-full bg-[rgba(201,100,66,0.85)] shadow-[0_0_0_16px_rgba(201,100,66,0.14)]" />
          <div className="absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(180deg,rgba(17,19,19,0),rgba(17,19,19,0.88))]" />
          <div className="absolute bottom-[14%] left-[8%] h-1 w-[32%] bg-[rgba(245,244,237,0.6)]" />
          <div className="absolute bottom-[10%] left-[8%] h-1 w-[46%] bg-[rgba(183,178,168,0.38)]" />
          <div className="absolute bottom-[10%] right-[8%] rounded-full bg-[rgba(17,19,19,0.55)] px-4 py-2 text-sm text-[color:var(--text)]">
            {label}
          </div>
        </div>
      </section>
    </main>
  );
}
