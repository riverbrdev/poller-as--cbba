import { connection } from "next/server";
import { cache } from "react";
import { signOutAction } from "@/app/_actions/auth";
import { UserMenu, type MenuUser } from "@/components/account/user-menu";
import { ParticipateLink } from "@/components/home/site-header";
import { LoginTab } from "@/components/navigation/login-tab";
import { auth } from "@/composition/auth";
import { useCases } from "@/composition/container";

type ViewerAccount = { user: MenuUser; isAdmin: boolean } | null;

/**
 * La cuenta de quien mira la página. El header y la barra de abajo la piden en el mismo pedido:
 * cache() hace que la sesión y la comprobación de admin se consulten una sola vez.
 */
const getViewerAccount = cache(async (): Promise<ViewerAccount> => {
  await connection();
  const session = await auth();
  if (!session?.user.id) {
    return null;
  }
  const user = {
    name: session.user.name ?? session.user.username ?? session.user.email ?? "",
    username: session.user.username,
    avatarUrl: session.user.image ?? null,
  };
  // Misma comprobación que /admin (rol + correo en la lista ahora mismo): el botón al panel solo lo ve un admin.
  const access = await useCases.getAdminAccess(session.user.id);
  return { user, isAdmin: access.ok };
});

/**
 * Zona de la cuenta en el header: depende de la sesión (cookies), así que va dentro de un Suspense
 * y el resto de la página sigue prerenderizada.
 */
export async function HeaderAccount() {
  const account = await getViewerAccount();
  if (!account) {
    return <ParticipateLink />;
  }
  return <UserMenu user={account.user} isAdmin={account.isAdmin} signOut={signOutAction} />;
}

/** Pestaña de la cuenta en la barra de abajo (celular). También va dentro de un Suspense. */
export async function TabAccount() {
  const account = await getViewerAccount();
  if (!account) {
    return <LoginTab />;
  }
  return <UserMenu user={account.user} isAdmin={account.isAdmin} signOut={signOutAction} placement="tab" />;
}
