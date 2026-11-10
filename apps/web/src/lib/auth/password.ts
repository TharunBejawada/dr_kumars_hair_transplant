import bcrypt from "bcryptjs";

const ROUNDS = 12;
export const hashPassword = (p: string) => bcrypt.hash(p, ROUNDS);
export const verifyPassword = (p: string, hash: string) => bcrypt.compare(p, hash);
let dummy: Promise<string> | undefined;
/** Burns equal bcrypt time when the email doesn't exist (prevents user enumeration by timing). */
export const dummyHash = () => (dummy ??= bcrypt.hash("not-a-real-password", ROUNDS));
