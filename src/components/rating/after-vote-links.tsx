import { BackHomeLink } from "@/components/ui/back-home-link";
import Link from "next/link";
import { MessageSquareText } from "lucide-react";


/** Después de votar (o si ya votó): ver su reseña en el perfil de la pollería, o volver al catálogo. */
export function AfterVoteLinks({ slug }: { slug: string }) {
  return (
    <div className="mt-6 flex flex-col gap-3">
      <Link
        href={`/polleria/${slug}#mi-resena`}
        className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-brand-dark px-5 text-base font-bold text-white transition-colors hover:bg-brand-ink active:scale-[0.98]"
      >
        <MessageSquareText size={18} aria-hidden="true" />
        Ver tu reseña
      </Link>
      <BackHomeLink href="/#locales" label="Volver al catálogo" className="w-full" />
    </div>
  );
}
