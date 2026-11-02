// Raíz de composición: une los casos de uso de application/ con sus implementaciones de infrastructure/.
// app/ y components/ nunca importan de aquí los detalles de infraestructura, solo los casos de uso.
import { createAuthenticateWithPassword } from "@/application/user/authenticate-with-password";
import { createCheckUsernameAvailability } from "@/application/user/check-username-availability";
import { createChooseUsername } from "@/application/user/choose-username";
import { createGetUserById } from "@/application/user/get-user-by-id";
import { createRegisterWithPassword } from "@/application/user/register-with-password";
import { createSignInWithGoogle } from "@/application/user/sign-in-with-google";
import { bcryptPasswordHasher } from "@/infrastructure/auth/bcrypt-password-hasher";
import { createDb } from "@/infrastructure/db/client";
import { createDrizzleUserRepository } from "@/infrastructure/db/user-repository";
import { RATE_LIMIT_RULES, createIpRateLimiter } from "@/infrastructure/ratelimit/upstash";

const users = createDrizzleUserRepository(createDb());
const hasher = bcryptPasswordHasher;

export const useCases = {
  registerWithPassword: createRegisterWithPassword({ users, hasher }),
  authenticateWithPassword: createAuthenticateWithPassword({ users, hasher }),
  signInWithGoogle: createSignInWithGoogle({ users }),
  chooseUsername: createChooseUsername({ users }),
  checkUsernameAvailability: createCheckUsernameAvailability({ users }),
  getUserById: createGetUserById({ users }),
};

// Helper de petición: app/ lo toma de aquí porque no puede importar infrastructure/ directamente.
export { clientIpFromHeaders } from "@/infrastructure/ratelimit/client-ip";

export const rateLimiters = {
  login: createIpRateLimiter(RATE_LIMIT_RULES.login),
  register: createIpRateLimiter(RATE_LIMIT_RULES.register),
};
