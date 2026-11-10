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
