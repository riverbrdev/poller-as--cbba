import NextAuth, { CredentialsSignin, type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";
import type { GoogleProfile } from "@/application/user/sign-in-with-google";
import { clientIpFromHeaders } from "@/infrastructure/ratelimit/client-ip";
import { rateLimiters, useCases } from "./container";

// Campos extra que guardamos en la sesión y el token (ver jwt y session abajo).
declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & { id: string; username: string | null };
  }
  interface User {
    username?: string | null;
  }
}

const credentialsSchema = z.object({
  email: z.email(),
  // La política de contraseña se valida al registrarse. Aquí solo confirmamos que llegó algo.
  password: z.string().min(1),
});

// Lo que Google entrega. email_verified debe ser true: sin eso alguien podría entrar con un correo ajeno.
const googleProfileSchema = z.object({
  sub: z.string().min(1),
  email: z.email(),
  email_verified: z.literal(true),
  name: z.string().optional(),
  picture: z.string().optional(),
});

class RateLimitedSignin extends CredentialsSignin {
  code = "rate_limited";
}

function parseGoogleProfile(profile: unknown): GoogleProfile | null {
  const parsed = googleProfileSchema.safeParse(profile);
  if (!parsed.success) {
    return null;
  }
  return {
    googleId: parsed.data.sub,
    email: parsed.data.email,
    name: parsed.data.name ?? parsed.data.email,
    avatarUrl: parsed.data.picture ?? null,
  };
}

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Google,
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials, request) => {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const limit = await rateLimiters.login.limit(clientIpFromHeaders(request.headers));
        if (!limit.success) {
          throw new RateLimitedSignin();
        }

        const result = await useCases.authenticateWithPassword(parsed.data.email, parsed.data.password);
        if (!result.ok) {
          return null;
        }
        return {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          username: result.user.username,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      // El login con contraseña ya se validó en authorize.
      if (account?.provider !== "google") {
        return true;
      }
      const googleProfile = parseGoogleProfile(profile);
      if (!googleProfile) {
        return false;
      }
      const result = await useCases.signInWithGoogle(googleProfile);
      return result.ok ? true : `/login?error=${result.error}`;
    },

    async jwt({ token, user, account, profile, trigger }) {
      // Guardamos el id de nuestra base, no el id de Google.
      if (account?.provider === "google") {
        const googleProfile = parseGoogleProfile(profile);
        const result = googleProfile ? await useCases.signInWithGoogle(googleProfile) : null;
        if (result?.ok) {
          token.userId = result.user.id;
          token.username = result.user.username;
        }
        return token;
      }

      if (user?.id) {
        token.userId = user.id;
        token.username = user.username ?? null;
        return token;
      }

      // Después de elegir username, la sesión se refresca con el dato nuevo.
      if (trigger === "update" && typeof token.userId === "string") {
        const current = await useCases.getUserById(token.userId);
        token.username = current?.username ?? null;
      }
      return token;
    },

    session({ session, token }) {
      // El token es un Record<string, unknown>: leemos cada campo con su tipo antes de usarlo.
      session.user.id = typeof token.userId === "string" ? token.userId : "";
      session.user.username = typeof token.username === "string" ? token.username : null;
      return session;
    },
  },
});
