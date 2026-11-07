import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { ACCOUNT_TEXT, SIGN_IN_METHOD_TEXT } from "./messages";
import { UserAvatar } from "./user-avatar";

export type ProfileView = {
  name: string;
  username: string | null;
  email: string;
  avatarUrl: string | null;
  signInMethod: keyof typeof SIGN_IN_METHOD_TEXT;
};

type ProfileCardProps = {
  profile: ProfileView;
  /** Server action que cierra la sesión. */
  signOut: () => Promise<void>;
};

/** Tarjeta de "Mi perfil": celular → todo apilado; computadora → avatar a la izquierda y datos a la derecha. */
export function ProfileCard({ profile, signOut }: ProfileCardProps) {
  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">
        <div className="flex flex-col items-center text-center">
          <UserAvatar name={profile.name} avatarUrl={profile.avatarUrl} size="lg" className="ring-2 ring-brand/20" />
          <h2 className="mt-3 text-xl font-extrabold tracking-tight">{profile.name}</h2>
          {profile.username ? <p className="text-sm font-semibold text-brand-ink">@{profile.username}</p> : null}
        </div>

        <dl className="w-full flex-1 space-y-3 border-t border-line pt-6 md:border-t-0 md:pt-0">
          <ProfileField label={ACCOUNT_TEXT.emailLabel}>
            <span className="break-all">{profile.email}</span>
          </ProfileField>
          <ProfileField label={ACCOUNT_TEXT.signInMethodLabel}>
            <span className="inline-flex rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold">
              {SIGN_IN_METHOD_TEXT[profile.signInMethod]}
            </span>
          </ProfileField>
        </dl>
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-line pt-6 md:flex-row-reverse md:items-center md:justify-between">
        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl border-2 border-brand bg-white px-6 text-sm font-bold text-brand-ink transition-colors hover:bg-brand-soft md:w-auto"
          >
            <LogOut size={16} aria-hidden="true" />
            {ACCOUNT_TEXT.signOut}
          </button>
        </form>
        <p className="text-center text-xs text-ink-muted md:text-left">{ACCOUNT_TEXT.comingSoon}</p>
      </div>
    </section>
  );
}

function ProfileField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-cream p-3.5">
      <dt className="mb-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted">{label}</dt>
      <dd className="text-sm font-semibold">{children}</dd>
    </div>
  );
}
