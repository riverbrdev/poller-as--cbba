import { connection } from "next/server";
import { signOutAction } from "@/app/_actions/auth";
import { UserMenu } from "@/components/account/user-menu";
import { ParticipateLink } from "@/components/home/site-header";
import { auth } from "@/composition/auth";

/**
 * Zona de la cuenta en el header: depende de la sesión (cookies), así que va dentro de un Suspense
 * y el resto de la página sigue prerenderizada.
 */
export async function HeaderAccount() {
  await connection();
  const session = await auth();
  if (!session?.user.id) {
    return <ParticipateLink />;
  }

  const user = {
    name: session.user.name ?? session.user.username ?? session.user.email ?? "",
    username: session.user.username,
    avatarUrl: session.user.image ?? null,
  };
  return <UserMenu user={user} signOut={signOutAction} />;
}
