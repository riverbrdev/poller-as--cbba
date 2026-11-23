import { Suspense } from "react";
import { TabAccount } from "@/app/_components/header-account";
import { BottomTabBar } from "@/components/navigation/bottom-tab-bar";
import { LoginTab } from "@/components/navigation/login-tab";

/** Barra de pestañas de celular con la cuenta de quien mira. Va al final de cada página que lleva el header. */
export function AppTabBar() {
  return <BottomTabBar account={<Suspense fallback={<LoginTab />}><TabAccount /></Suspense>} />;
}
