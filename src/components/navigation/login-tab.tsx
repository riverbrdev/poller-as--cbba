import Link from "next/link";
import { UserRound } from "lucide-react";
import { TAB_BAR_TEXT } from "./messages";
import { LOGIN_HREF } from "./routes";
import { TAB_ICON_CLASS, TAB_ITEM_CLASS } from "./tab-style";

/** Pestaña de la cuenta para quien no ingresó (y mientras se verifica la sesión). */
export function LoginTab() {
  return (
    <Link href={LOGIN_HREF} className={TAB_ITEM_CLASS}>
      <UserRound aria-hidden="true" className={TAB_ICON_CLASS} />
      {TAB_BAR_TEXT.signIn}
    </Link>
  );
}
