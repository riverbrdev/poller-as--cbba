// Raíz de composición: une los casos de uso de application/ con sus implementaciones de infrastructure/.
// app/ y components/ nunca importan de aquí los detalles de infraestructura, solo los casos de uso.
import { createAuthenticateWithPassword } from "@/application/user/authenticate-with-password";
import { createCheckUsernameAvailability } from "@/application/user/check-username-availability";
import { createChooseUsername } from "@/application/user/choose-username";
import { createGetMyRating } from "@/application/rating/get-my-rating";
import { createRateRestaurant } from "@/application/rating/rate-restaurant";
import { createGetRestaurantBySlug } from "@/application/restaurant/get-restaurant-by-slug";
import { createListActiveRestaurants } from "@/application/restaurant/list-active-restaurants";
import { createGetMyProfile } from "@/application/user/get-my-profile";
import { createGetUserById } from "@/application/user/get-user-by-id";
import { createRegisterWithPassword } from "@/application/user/register-with-password";
import { createSignInWithGoogle } from "@/application/user/sign-in-with-google";
import { bcryptPasswordHasher } from "@/infrastructure/auth/bcrypt-password-hasher";
import { createDb } from "@/infrastructure/db/client";
import { createDrizzleRatingRepository } from "@/infrastructure/db/rating-repository";
import { createDrizzleRestaurantRepository } from "@/infrastructure/db/restaurant-repository";
import { createDrizzleUserRepository } from "@/infrastructure/db/user-repository";
import { RATE_LIMIT_RULES, createIpRateLimiter } from "@/infrastructure/ratelimit/upstash";

const db = createDb();
const users = createDrizzleUserRepository(db);
const restaurants = createDrizzleRestaurantRepository(db);
const ratings = createDrizzleRatingRepository(db);
const hasher = bcryptPasswordHasher;

export const useCases = {
  registerWithPassword: createRegisterWithPassword({ users, hasher }),
  authenticateWithPassword: createAuthenticateWithPassword({ users, hasher }),
  signInWithGoogle: createSignInWithGoogle({ users }),
  chooseUsername: createChooseUsername({ users }),
  checkUsernameAvailability: createCheckUsernameAvailability({ users }),
  getUserById: createGetUserById({ users }),
  getMyProfile: createGetMyProfile({ users }),
  listActiveRestaurants: createListActiveRestaurants({ restaurants }),
  getRestaurantBySlug: createGetRestaurantBySlug({ restaurants }),
  rateRestaurant: createRateRestaurant({ users, restaurants, ratings }),
  getMyRating: createGetMyRating({ ratings }),
};

// Helper de petición: app/ lo toma de aquí porque no puede importar infrastructure/ directamente.
export { clientIpFromHeaders } from "@/infrastructure/ratelimit/client-ip";

export const rateLimiters = {
  login: createIpRateLimiter(RATE_LIMIT_RULES.login),
  register: createIpRateLimiter(RATE_LIMIT_RULES.register),
  // Se usa con la clave `user:<id>`, no con la IP.
  rating: createIpRateLimiter(RATE_LIMIT_RULES.rating),
};
