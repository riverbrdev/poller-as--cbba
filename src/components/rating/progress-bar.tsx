type ProgressBarProps = {
  done: number;
  total: number;
};

/** Avance del formulario: "3 de 4 criterios · 75%". */
export function ProgressBar({ done, total }: ProgressBarProps) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-ink">
          {done} de {total} criterios
        </span>
        <span className="font-extrabold text-brand">{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-label="Criterios calificados"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        aria-valuetext={`${done} de ${total} criterios`}
        className="h-2.5 overflow-hidden rounded-full bg-line"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand to-brand-dark transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
