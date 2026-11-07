import type { UserRecord, UserRepository } from "@/application/ports/user-repository";

export type SignInMethod = "google" | "password";

/** Lo que la pantalla "Mi perfil" puede mostrar. Nunca incluye el hash de la contraseña ni el id de Google. */
export type MyProfile = {
  name: string;
  username: string | null;
  email: string;
  avatarUrl: string | null;
  signInMethod: SignInMethod;
};

// Una cuenta creada con Google guarda su googleId; una de correo y contraseña, no.
const signInMethodOf = (user: UserRecord): SignInMethod => (user.googleId ? "google" : "password");

export function createGetMyProfile(deps: { users: UserRepository }) {
  return async function getMyProfile(userId: string): Promise<MyProfile | null> {
    const user = await deps.users.findById(userId);
    if (!user) {
      return null;
    }
    return {
      name: user.name,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      signInMethod: signInMethodOf(user),
    };
  };
}
