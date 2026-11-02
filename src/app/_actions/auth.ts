"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { FormState } from "@/components/auth/form-state";
import { auth, signIn, signOut, unstable_update } from "@/composition/auth";
import { clientIpFromHeaders, rateLimiters, useCases } from "@/composition/container";
import {
  chooseUsernameSchema,
  loginSchema,
  registerSchema,
} from "@/app/_lib/auth-schemas";

// Los errores se devuelven como códigos. El texto visible vive en components/auth/messages.ts.
const firstIssue = (issues: { message: string }[], fallback: string) => issues[0]?.message ?? fallback;

export async function loginWithPasswordAction(_state: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "invalid_credentials" };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    // Auth.js lanza CredentialsSignin aunque se pida redirect: false. El code distingue el motivo.
    if (isCredentialsSignin(error)) {
      return { error: error.code === "rate_limited" ? "rate_limited" : "invalid_credentials" };
    }
    throw error;
  }
  redirect("/");
}

// Auth.js serializa su error como objeto plano en la acción: se reconoce por `type`, no por instanceof.
function isCredentialsSignin(error: unknown): error is { type: "CredentialsSignin"; code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { type?: unknown }).type === "CredentialsSignin" &&
    typeof (error as { code?: unknown }).code === "string"
  );
}

export async function loginWithGoogleAction(): Promise<void> {
  await signIn("google", { redirectTo: "/" });
}

export async function registerAction(_state: FormState, formData: FormData): Promise<FormState> {
  const limit = await rateLimiters.register.limit(clientIpFromHeaders(await headers()));
  if (!limit.success) {
    return { error: "rate_limited" };
  }

  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: firstIssue(parsed.error.issues, "invalid_username") };
  }

  const result = await useCases.registerWithPassword({
    username: parsed.data.username,
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (!result.ok) {
    return { error: result.error };
  }

  // Entra enseguida con la cuenta recién creada. Este signIn redirige.
  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: "/",
  });
  return { error: null };
}

export async function chooseUsernameAction(_state: FormState, formData: FormData): Promise<FormState> {
  const session = await auth();
  if (!session?.user.id) {
    redirect("/login");
  }

  const parsed = chooseUsernameSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: firstIssue(parsed.error.issues, "invalid_username") };
  }

  const result = await useCases.chooseUsername(session.user.id, parsed.data.username);
  if (!result.ok) {
    return { error: result.error };
  }

  // Refresca el token para que el proxy deje pasar sin volver a pedir username.
  await unstable_update({});
  redirect("/");
}

/** Para el aviso "disponible" mientras la persona escribe. `available` es null si el formato es inválido. */
export async function checkUsernameAction(username: string): Promise<{ available: boolean | null }> {
  const result = await useCases.checkUsernameAvailability(username);
  return { available: result.ok ? result.available : null };
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
