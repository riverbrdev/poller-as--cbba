import { NextResponse } from "next/server";
import { auth } from "@/composition/auth";
import { redirectFor } from "@/domain/user/access";

// Redirecciones rápidas. No es la autorización: cada caso de uso vuelve a verificar en el servidor.
export const proxy = auth((request) => {
  const target = redirectFor({
    pathname: request.nextUrl.pathname,
    hasSession: Boolean(request.auth),
    hasUsername: Boolean(request.auth?.user.username),
  });

  if (!target) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL(target, request.nextUrl));
});

export const config = {
  // Se omiten estáticos, las rutas de Auth.js y el resultado público del duelo (se consulta cada 30 s):
  // deben responder siempre, sin redirecciones.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth|api/versus).*)"],
};
