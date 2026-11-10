import { Suspense } from "react";
import { ArrowDown, MapPin, UtensilsCrossed } from "lucide-react";
import { HeaderAccount } from "@/app/_components/header-account";
import { getActiveRestaurants } from "@/app/_data/restaurants";
import { MethodologySection } from "@/components/home/methodology-section";
import { RestaurantCatalog } from "@/components/home/restaurant-catalog";
import { ParticipateLink, SiteHeader } from "@/components/home/site-header";

export default async function Home() {
  const { restaurants, zones } = await getActiveRestaurants();

  return (
    <div className="comideli-home">
      <a href="#contenido" className="comideli-skip">Ir al contenido</a>
      <SiteHeader home account={<Suspense fallback={<ParticipateLink />}><HeaderAccount /></Suspense>} />

      <main id="contenido" tabIndex={-1}>
        <section className="comideli-hero" data-enter aria-labelledby="home-title">
          <div className="comideli-wrap">
            <div className="comideli-hero-grid">
              <div className="comideli-hero-copy">
                <p className="comideli-kicker"><MapPin size={15} aria-hidden="true" /> Cochabamba, Bolivia</p>
                <h1 id="home-title">El <span>pollo broaster</span> de Cochabamba</h1>
                <p className="comideli-hero-lead">
                  Encuentra pollerías por zona y califica las que ya probaste. Con tu voto, la comunidad arma el ranking.
                </p>
                <a className="comideli-button" href="#locales">
                  Explorar pollerías <ArrowDown size={18} aria-hidden="true" />
                </a>
                <dl className="comideli-stats">
                  <div><dt>Pollerías</dt><dd>{restaurants.length}</dd></div>
                  <div><dt>Zonas</dt><dd>{zones.length}</dd></div>
                </dl>
              </div>
              <div className="comideli-hero-media" data-enter-media aria-hidden="true">
                <div className="comideli-hero-poster">
                  <div className="comideli-poster-header">
                    <span>ComiDeli</span>
                    <UtensilsCrossed size={24} />
                  </div>
                  <p className="comideli-poster-title">Sabor de<br />Cocha.</p>
                  <p className="comideli-poster-footer">Guía local · Cochabamba</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* El podio vuelve cuando haya suficientes calificaciones para el ranking (SPEC §4). */}
        <RestaurantCatalog restaurants={restaurants} zones={zones} />
        <MethodologySection />
      </main>

      <footer className="comideli-footer">
        <div className="comideli-wrap">
          <p><strong className="text-ink">ComiDeli</strong> <span className="ml-1">· Cochabamba, Bolivia</span></p>
        </div>
      </footer>
    </div>
  );
}
