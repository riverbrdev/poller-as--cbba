import type { ReactNode } from "react";
import { CalendarDays, KeyRound, LogOut, Mail, Star } from "lucide-react";
import type { MyProfile } from "@/application/user/get-my-profile";
import { ACCOUNT_TEXT, SIGN_IN_METHOD_TEXT } from "./messages";
import { UserAvatar } from "./user-avatar";

const reviewDate = new Intl.DateTimeFormat("es-BO", { dateStyle: "medium", timeZone: "America/La_Paz" });

type ProfileCardProps = {
  profile: MyProfile;
  /** Server action que cierra la sesión. */
  signOut: () => Promise<void>;
};

export function ProfileCard({ profile, signOut }: ProfileCardProps) {
  return (
    <div>
      <section aria-label="Datos del perfil" className="rounded-2xl border border-brand/20 bg-linear-to-br from-brand-soft via-white to-white p-5 shadow-card sm:p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-5">
          <UserAvatar name={profile.name} avatarUrl={profile.avatarUrl} size="lg" className="size-20 rounded-2xl bg-linear-to-br from-brand to-brand-dark text-white ring-4 ring-white shadow-card md:size-24" />
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl leading-tight font-extrabold tracking-tight wrap-anywhere md:text-3xl">{profile.name}</h2>
            {profile.username ? <p className="mt-2 text-sm font-semibold text-brand-ink wrap-anywhere">@{profile.username}</p> : null}
            <p className="mt-2 text-xs text-ink-muted">Comunidad ComiDeli</p>
          </div>
          <div className="w-full rounded-xl border border-brand/20 bg-white px-5 py-4 text-center shadow-soft sm:w-auto sm:min-w-36">
            <span className="block text-3xl font-extrabold text-brand-ink tabular-nums">{profile.reviews.length}</span>
            <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-ink-muted">Reseñas realizadas</span>
          </div>
        </div>

        <dl className="mt-6 grid gap-3 border-t border-brand/10 pt-5 sm:grid-cols-2">
          <ProfileField label={ACCOUNT_TEXT.emailLabel} icon={<Mail size={18} aria-hidden="true" />}>
            <span className="wrap-anywhere">{profile.email}</span>
          </ProfileField>
          <ProfileField label={ACCOUNT_TEXT.signInMethodLabel} icon={<KeyRound size={18} aria-hidden="true" />}>
            {SIGN_IN_METHOD_TEXT[profile.signInMethod]}
          </ProfileField>
        </dl>
      </section>

      <section aria-labelledby="my-reviews-title" className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="my-reviews-title" className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
            {ACCOUNT_TEXT.myReviews}
            <span className="rounded-full bg-brand-soft px-2 py-1 text-xs font-bold text-brand-ink tabular-nums">{profile.reviews.length}</span>
          </h2>
          <p className="text-xs text-ink-muted">Historial de opiniones y calificaciones</p>
        </div>
        {profile.reviews.length === 0 ? (
          <p className="mt-5 rounded-xl border border-line bg-white p-5 text-sm text-ink-muted">{ACCOUNT_TEXT.noReviews}</p>
        ) : (
          <ul className="mt-5 space-y-4">
            {profile.reviews.map((review) => (
              <li key={review.id} className="overflow-hidden rounded-2xl border border-brand/20 bg-white">
                <div className="flex items-center justify-between gap-4 border-l-4 border-brand bg-brand-soft p-5 sm:p-6">
                  <div className="min-w-0">
                    <h3 className="text-lg leading-snug font-extrabold tracking-tight wrap-anywhere sm:text-xl">{review.restaurantName}</h3>
                    <time dateTime={review.createdAt} className="mt-3 flex items-center gap-1.5 text-xs text-ink-muted">
                      <CalendarDays size={14} className="shrink-0 text-brand-ink" aria-hidden="true" />
                      {reviewDate.format(new Date(review.createdAt))}
                    </time>
                  </div>
                  <div className="shrink-0 rounded-xl bg-brand-ink px-3 py-3 text-center text-white sm:px-4">
                    <span className="mb-1 flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                      <Star size={12} className="fill-current" aria-hidden="true" />
                      Tu nota
                    </span>
                    <span className="text-2xl leading-none font-extrabold tabular-nums sm:text-3xl">{review.overall.toFixed(1)}<span className="text-xs font-semibold">/10</span></span>
                  </div>
                </div>
                {review.comment && (
                  <div className="border-t border-brand/10 p-5 sm:p-6">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-brand-ink">Tu comentario</p>
                    <p className="text-base leading-7 wrap-anywhere whitespace-pre-wrap">{review.comment}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-8 flex flex-col border-t border-line pt-5 sm:items-end">
        <form action={signOut}>
          <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-brand/30 bg-white px-6 text-sm font-bold text-brand-ink transition-colors hover:bg-brand-soft sm:w-auto">
            <LogOut size={16} aria-hidden="true" />
            {ACCOUNT_TEXT.signOut}
          </button>
        </form>
      </div>
    </div>
  );
}

function ProfileField({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-brand/10 bg-white p-4 shadow-soft">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-ink">{icon}</span>
      <div className="min-w-0">
        <dt className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">{label}</dt>
        <dd className="text-sm font-semibold">{children}</dd>
      </div>
    </div>
  );
}
