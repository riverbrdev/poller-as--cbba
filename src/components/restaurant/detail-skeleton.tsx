/** Lo que se ve mientras llegan los datos de la pollería. Sin datos: solo bloques grises. */
export function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 py-6 motion-reduce:animate-none sm:px-8" aria-hidden="true">
      <div className="h-5 w-36 rounded bg-line" />
      <div className="mt-6 flex gap-4">
        <div className="aspect-square w-28 rounded-2xl bg-line sm:w-36" />
        <div className="flex flex-1 flex-col gap-3">
          <div className="h-6 w-32 rounded-full bg-line" />
          <div className="h-8 w-3/4 rounded bg-line" />
        </div>
      </div>
      <div className="mt-6 h-64 rounded-2xl bg-line" />
    </div>
  );
}
