import { GetCommand, PutCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { db, tableName } from "../dynamo";
import { hashPassword } from "../auth/password";

export interface AdminUser {
  email: string;
  passwordHash: string;
  role: "superadmin" | "admin";
  failedAttempts: number;
  lockedUntil?: number; // epoch ms
  createdAt: string;
  lastLoginAt?: string;
  /** Epoch seconds. Sessions issued before this are no longer valid. */
  passwordChangedAt?: number;
}

export const MAX_ATTEMPTS = 5;
export const LOCK_MS = 15 * 60_000;

export async function getUser(email: string) {
  const r = await db().send(new GetCommand({ TableName: tableName("ADMIN_USERS_TABLE"), Key: { email } }));
  return r.Item as AdminUser | undefined;
}

/**
 * First-run bootstrap: if SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD are set and the user doesn't exist yet,
 * create the superadmin. Conditional put => safe & idempotent (never overwrites an existing user).
 * Credentials live only in environment variables, never in the repository.
 */
export async function ensureSeedUser(email: string) {
  const seedEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const seedPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!seedEmail || !seedPassword || seedEmail !== email) return;
  try {
    await db().send(
      new PutCommand({
        TableName: tableName("ADMIN_USERS_TABLE"),
        Item: {
          email: seedEmail,
          passwordHash: await hashPassword(seedPassword),
          role: "superadmin",
          failedAttempts: 0,
          createdAt: new Date().toISOString(),
        } satisfies AdminUser,
        ConditionExpression: "attribute_not_exists(email)",
      }),
    );
  } catch (e) {
    if ((e as { name?: string }).name !== "ConditionalCheckFailedException") throw e;
  }
}

export async function recordFailure(email: string, attempts: number) {
  const lock = attempts + 1 >= MAX_ATTEMPTS;
  await db().send(
    new UpdateCommand({
      TableName: tableName("ADMIN_USERS_TABLE"),
      Key: { email },
      UpdateExpression: "SET failedAttempts = :n, lockedUntil = :l",
      ExpressionAttributeValues: { ":n": lock ? 0 : attempts + 1, ":l": lock ? Date.now() + LOCK_MS : 0 },
    }),
  );
}

export async function recordSuccess(email: string) {
  await db().send(
    new UpdateCommand({
      TableName: tableName("ADMIN_USERS_TABLE"),
      Key: { email },
      UpdateExpression: "SET failedAttempts = :z, lockedUntil = :z, lastLoginAt = :t",
      ExpressionAttributeValues: { ":z": 0, ":t": new Date().toISOString() },
    }),
  );
}

export async function countUsers() {
  const r = await db().send(new ScanCommand({ TableName: tableName("ADMIN_USERS_TABLE"), Select: "COUNT" }));
  return r.Count ?? 0;
}

/** A session is valid only if the user still exists and the password wasn't changed after the token was issued. */
export async function isSessionCurrent(s: { email: string; iat: number }) {
  const user = await getUser(s.email);
  return !!user && !(user.passwordChangedAt && s.iat < user.passwordChangedAt);
}

export async function setPassword(email: string, newPassword: string) {
  await db().send(
    new UpdateCommand({
      TableName: tableName("ADMIN_USERS_TABLE"),
      Key: { email },
      UpdateExpression: "SET passwordHash = :h, passwordChangedAt = :t, failedAttempts = :z, lockedUntil = :z",
      ExpressionAttributeValues: { ":h": await hashPassword(newPassword), ":t": Math.floor(Date.now() / 1000), ":z": 0 },
    }),
  );
}
