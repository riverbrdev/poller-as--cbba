import { Banknote, Clock3, Drumstick, Heart, UtensilsCrossed } from "lucide-react";

const criteria = [
  { title: "Precio justo", description: "Compara lo que pagas con la experiencia y el plato que recibes.", icon: Banknote },
  { title: "Sabor", description: "Valora el sabor del pollo, su preparación y sus acompañamientos.", icon: Drumstick },
  { title: "Cantidad", description: "Evalúa el tamaño de la porción y si alcanza para quedar satisfecho.", icon: UtensilsCrossed },
  { title: "Atención", description: "Ten en cuenta el trato, el servicio y el tiempo de espera.", icon: Clock3 },
] as const;

export function MethodologySection() {
  return (
    <section id="metodologia" className="border-t border-line bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <p className="text-xs font-extrabold uppercase tracking-widest text-brand">Metodología cochabambina</p>
        <h2 className="mt-2 max-w-2xl text-3xl font-black leading-tight tracking-tight sm:text-4xl">¿Cómo evaluaremos el broaster de Cochabamba?</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-muted">Cada persona podrá valorar una pollería del 1 al 10 en cuatro criterios. La nota final de su voto será el promedio de esas cuatro notas.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {criteria.map(({ title, description, icon: Icon }, index) => (
            <article key={title} className="rounded-2xl border border-line bg-cream p-6">
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand"><Icon size={22} aria-hidden="true" /></span>
              <h3 className="mt-5 text-base font-black">{index + 1}. {title}</h3>
              <p className="mt-3 text-sm leading-6 text-ink-muted">{description}</p>
              <p className="mt-5 border-t border-line pt-4 text-xs font-bold text-brand-ink">Calificación de 1 a 10</p>
            </article>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-5 rounded-2xl bg-gradient-to-r from-brand to-brand-dark p-7 text-white shadow-lg sm:p-9 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="inline-flex rounded-full bg-white/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide">Comunidad broaster cochabambina</p>
            <h3 className="mt-3 max-w-xl text-2xl font-black leading-tight sm:text-3xl">¿Falta tu broastería favorita?</h3>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/90">Pronto podrás sugerir nuevos locales para que se sumen al roster después de una revisión.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white/15 px-4 text-sm font-bold"><Heart size={16} aria-hidden="true" /> Postulaciones próximamente</span>
            <a href="#metodologia" className="inline-flex min-h-11 items-center rounded-xl bg-ink/25 px-4 text-sm font-bold hover:bg-ink/40">Cómo funciona</a>
          </div>
        </div>
      </div>
    </section>
  );
}
