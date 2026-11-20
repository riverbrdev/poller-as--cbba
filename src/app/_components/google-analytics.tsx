import Script from "next/script";
import { getAnalyticsId } from "@/app/_lib/analytics";

/** GA4 usa la medición mejorada del historial para las navegaciones de Next.js. */
export function GoogleAnalytics() {
  const id = getAnalyticsId(
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    process.env.NODE_ENV,
    process.env.VERCEL_ENV,
  );
  if (!id) return null;

  return (
    <>
      <Script id="comideli-ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}', {
  allow_google_signals: false,
  allow_ad_personalization_signals: false
});`}
      </Script>
      <Script
        id="comideli-ga4-loader"
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
    </>
  );
}
