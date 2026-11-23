"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Swords, Trophy, type LucideIcon } from "lucide-react";
import { cn } from "@/components/lib/utils";
import { PROFILE_HREF } from "@/components/account/routes";
import { LiveDot } from "./live-dot";
import { TAB_BAR_TEXT } from "./messages";
import { LOGIN_HREF, RANKING_HREF, VERSUS_HREF } from "./routes";
import { TAB_ICON_CLASS, TAB_ITEM_CLASS } from "./tab-style";

type Tab = {
  href: string;
  label: string;
  ariaLabel?: string;
  icon: LucideIcon;
  /** Muestra el puntito "en vivo" (el duelo). */
  live?: boolean;
};

// El Mapa (spec 004) se suma aquí cuando exista, entre Ranking y Versus:
// { href: MAP_HREF, label: TAB_BAR_TEXT.map, icon: MapPinned },
const TABS: Tab[] = [
  { href: RANKING_HREF, label: TAB_BAR_TEXT.ranking, icon: Trophy },
  { href: VERSUS_HREF, label: TAB_BAR_TEXT.versus, ariaLabel: TAB_BAR_TEXT.versusLabel, icon: Swords, live: true },
];

/** Rutas que marcan la pestaña de la cuenta como activa. */
const ACCOUNT_PATHS = [PROFILE_HREF, LOGIN_HREF];

const isWithin = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

type BottomTabBarProps = {
  /** Pestaña de la cuenta: "Ingresar" o el menú del usuario. Llega del servidor porque depende de la sesión. */
  account: ReactNode;
};

/**
 * Barra de pestañas fija abajo, solo en celular (en computadora la navegación está en el header).
 * Queda al alcance del pulgar y siempre visible, salvo cuando el teclado está abierto.
 * No se monta en calificar, login, registro ni onboarding: ahí el botón de enviar es lo único abajo.
 */
export function BottomTabBar({ account }: BottomTabBarProps) {
  const pathname = usePathname();
  const isTyping = useIsTyping();

  return (
    <>
      {/* Reserva el alto de la barra al final de la página, para que no tape el pie ni la última tarjeta. */}
      <div aria-hidden="true" className="h-[calc(4.5rem+env(safe-area-inset-bottom))] md:hidden" />
      <nav
        aria-label={TAB_BAR_TEXT.label}
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgb(27_25_23/0.06)] backdrop-blur-md md:hidden",
          isTyping && "hidden",
        )}
      >
        <ul className="mx-auto flex max-w-md items-stretch gap-1 px-2 py-1">
          {TABS.map((tab) => {
            const active = isWithin(pathname, tab.href);
            const Icon = tab.icon;
            return (
              <li key={tab.href} data-active={active} className="flex flex-1">
                <Link
                  href={tab.href}
                  aria-label={tab.ariaLabel}
                  aria-current={active ? "page" : undefined}
                  className={TAB_ITEM_CLASS}
                >
                  <span className="relative">
                    <Icon aria-hidden="true" className={TAB_ICON_CLASS} />
                    {tab.live ? <LiveDot className="absolute -right-1.5 -top-0.5 text-brand" /> : null}
                  </span>
                  {tab.label}
                </Link>
              </li>
            );
          })}
          <li data-active={ACCOUNT_PATHS.some((href) => isWithin(pathname, href))} className="flex flex-1">
            {account}
          </li>
        </ul>
      </nav>
    </>
  );
}

const TEXT_INPUT_TYPES = new Set(["text", "search", "email", "password", "tel", "url", "number"]);

function opensKeyboard(target: EventTarget | null): boolean {
  if (target instanceof HTMLTextAreaElement) return true;
  if (target instanceof HTMLInputElement) return TEXT_INPUT_TYPES.has(target.type);
  return target instanceof HTMLElement && target.isContentEditable;
}

/** true mientras hay un campo de texto con el foco: en celular eso abre el teclado y la barra estorbaría. */
function useIsTyping(): boolean {
  const [isTyping, setIsTyping] = useState(false);
  useEffect(() => {
    const onFocusIn = (event: FocusEvent) => setIsTyping(opensKeyboard(event.target));
    const onFocusOut = () => setIsTyping(false);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);
  return isTyping;
}
