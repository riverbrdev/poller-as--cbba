"use client";
export default function VersusError({ reset }: { reset: () => void }) {
  return <div className="mx-auto max-w-lg p-8 text-center"><h2 className="text-xl font-bold">No pudimos cargar el duelo</h2><p className="mt-3 text-sm">Inténtalo de nuevo en un momento.</p><button onClick={reset} className="mt-5 min-h-12 rounded-xl bg-brand-ink px-6 text-white">Reintentar</button></div>;
}
