/** Puerto: lo implementa infrastructure/ (bcryptjs). */
export interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
}
