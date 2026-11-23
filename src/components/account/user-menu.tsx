"use client";

import Link from "next/link";
import { useTransition } from "react";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TAB_BAR_TEXT } from "@/components/navigation/messages";
import { TAB_ITEM_CLASS } from "@/components/navigation/tab-style";
import { ACCOUNT_TEXT } from "./messages";
import { ADMIN_HREF, PROFILE_HREF } from "./routes";
import { UserAvatar } from "./user-avatar";

export type MenuUser = {
  name: string;
  username: string | null;
  avatarUrl: string | null;
};

type UserMenuProps = {
  user: MenuUser;
  /** Lo decide el servidor en cada pedido (getAdminAccess). Solo entonces aparece "Panel de administración". */
  isAdmin: boolean;
  /** Server action que cierra la sesión. Llega por props: components/ no importa de app/. */
  signOut: () => Promise<void>;
  /** "header": el avatar arriba a la derecha (computadora). "tab": la pestaña "Perfil" de la barra de abajo (celular). */
  placement?: "header" | "tab";
};

const ITEM_CLASS = "min-h-11 gap-3 rounded-xl px-3 text-sm font-semibold";
const ICON_BOX_CLASS = "flex size-8 items-center justify-center rounded-lg";

/** Menú de la cuenta: avatar del header o pestaña "Perfil". Abre "Mi perfil" y "Cerrar sesión" (diseño Stitch "Mi perfil - ComiDeli"). */
export function UserMenu({ user, isAdmin, signOut, placement = "header" }: UserMenuProps) {
  const [isSigningOut, startSignOut] = useTransition();
  const inTabBar = placement === "tab";

  return (
    <DropdownMenu>
      {inTabBar ? (
        <DropdownMenuTrigger aria-label={ACCOUNT_TEXT.menuLabel} className={TAB_ITEM_CLASS}>
          <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="xs" className="ring-2 ring-transparent in-data-[active=true]:ring-brand" />
          {TAB_BAR_TEXT.profile}
        </DropdownMenuTrigger>
      ) : (
        <DropdownMenuTrigger
          aria-label={ACCOUNT_TEXT.menuLabel}
          className="flex size-11 items-center justify-center rounded-full ring-2 ring-brand ring-offset-2 ring-offset-white transition-transform outline-none focus-visible:ring-brand-dark active:scale-95"
        >
          <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="sm" />
        </DropdownMenuTrigger>
      )}

      {/* Desde la barra de abajo el menú se abre hacia arriba. */}
      <DropdownMenuContent side={inTabBar ? "top" : "bottom"} align="end" sideOffset={8} className="w-60 rounded-2xl border border-line bg-white p-1 text-ink shadow-xl">
        <div className="px-3 py-2.5">
          <p className="truncate text-sm font-bold">{user.name}</p>
          {user.username ? <p className="truncate text-xs text-ink-muted">@{user.username}</p> : null}
        </div>
        <DropdownMenuSeparator className="bg-line" />
        <DropdownMenuItem render={<Link href={PROFILE_HREF} />} className={`${ITEM_CLASS} focus:bg-brand-soft`}>
          <span className={`${ICON_BOX_CLASS} border border-line bg-white text-brand-ink`}>
            <UserRound aria-hidden="true" />
          </span>
          {ACCOUNT_TEXT.myProfile}
        </DropdownMenuItem>
        {isAdmin ? (
          <DropdownMenuItem render={<Link href={ADMIN_HREF} />} className={`${ITEM_CLASS} focus:bg-brand-soft`}>
            <span className={`${ICON_BOX_CLASS} border border-line bg-white text-brand-ink`}>
              <ShieldCheck aria-hidden="true" />
            </span>
            {ACCOUNT_TEXT.adminPanel}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          disabled={isSigningOut}
          onClick={() => startSignOut(() => signOut())}
          className={`${ITEM_CLASS} text-brand-ink focus:bg-brand-soft focus:text-brand-ink`}
        >
          <span className={`${ICON_BOX_CLASS} bg-brand-soft text-brand-ink`}>
            <LogOut aria-hidden="true" />
          </span>
          {isSigningOut ? ACCOUNT_TEXT.signingOut : ACCOUNT_TEXT.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
