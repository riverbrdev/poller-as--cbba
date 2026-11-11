import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { submitRatingAction } from "@/app/_actions/rating";
import { getActiveRestaurants, getRestaurantBySlug } from "@/app/_data/restaurants";
import { RatingForm } from "@/components/rating/rating-form";
import { RatingFormSkeleton } from "@/components/rating/rating-form-skeleton";
import { RatingHero, type RatingRestaurant } from "@/components/rating/rating-hero";
import type { RatingHeroSlots } from "@/components/rating/rating-layout";
import { auth } from "@/composition/auth";
import { useCases } from "@/composition/container";

type RatePageProps = {
  params: Promise<{ slug: string }>;
};

/** Prerenderiza la foto y el nombre de cada pollería conocida; las nuevas se generan en su primera visita. */
export async function generateStaticParams() {
  const { restaurants } = await getActiveRestaurants();
  return restaurants.map((restaurant) => ({ slug: restaurant.slug }));
}

export async function generateMetadata({ params }: RatePageProps): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) {
    return { title: "Pollería no encontrada · ComiDeli", robots: { index: false, follow: false } };
  }

  const title = `Califica ${restaurant.name} · ComiDeli`;
  const description = `Califica sabor, porción, atención y local de ${restaurant.name} en Cochabamba.`;
  return {
    title,
    description,
    // Requiere sesión: se puede compartir, pero no se indexa.
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      type: "website",
      ...(restaurant.photoUrl ? { images: [restaurant.photoUrl] } : {}),
    },
  };
}

// La página no espera `params`: así la navegación muestra al instante un esqueleto (App Shell) y el resto
// llega por partes. La foto y el nombre salen de caché; solo la verificación de sesión espera la petición.
export default function RatePage({ params }: RatePageProps) {
  return (
    <Suspense fallback={<RatingFormSkeleton />}>
      <RestaurantRating params={params} />
    </Suspense>
  );
}

async function RestaurantRating({ params }: RatePageProps) {
  const { slug } = await params;
  const record = await getRestaurantBySlug(slug);
  if (!record) {
    notFound();
  }

  const restaurant: RatingRestaurant = {
    slug: record.slug,
    name: record.name,
    zone: record.zone,
    address: record.address,
    photoUrl: record.photoUrl,
  };
  // La foto y el nombre quedan fuera del Suspense de la sesión: se ven mientras se verifica (research R10).
  const hero: RatingHeroSlots = {
    banner: <RatingHero restaurant={restaurant} variant="banner" />,
    card: <RatingHero restaurant={restaurant} variant="card" />,
  };

  return (
    <Suspense fallback={<RatingFormSkeleton hero={hero} />}>
      <RatingGate restaurantId={record.id} restaurant={restaurant} hero={hero} />
    </Suspense>
  );
}

/** Lo que depende de la sesión. Es la segunda verificación: el proxy solo redirige, no autoriza. */
async function RatingGate({
  restaurantId,
  restaurant,
  hero,
}: {
  restaurantId: string;
  restaurant: RatingRestaurant;
  hero: RatingHeroSlots;
}) {
  await connection();
  const session = await auth();
  const callbackUrl = encodeURIComponent(`/calificar/${restaurant.slug}`);
  if (!session?.user.id) {
    redirect(`/login?callbackUrl=${callbackUrl}`);
  }
  if (!session.user.username) {
    redirect(`/onboarding/username?callbackUrl=${callbackUrl}`);
  }

  // Los votos no se editan: quien ya votó ve sus notas en vez del formulario (FR-019a).
  // Siempre se renderiza RatingForm: él decide, así conserva su estado "guardado" al re-renderizar tras votar.
  const mine = await useCases.getMyRating(session.user.id, restaurantId);
  const alreadyRated = mine ? { scores: mine.scores, comment: mine.comment } : null;

  return <RatingForm restaurant={restaurant} hero={hero} action={submitRatingAction} alreadyRated={alreadyRated} />;
}
