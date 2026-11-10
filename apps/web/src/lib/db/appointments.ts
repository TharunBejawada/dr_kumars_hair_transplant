import { DeleteCommand, GetCommand, PutCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "node:crypto";
import type { Appointment, AppointmentInput, AppointmentStatus } from "@drkumar/shared";
import { db, tableName } from "../dynamo";

export async function createAppointment(data: Omit<AppointmentInput, "website">) {
  const item: Appointment = { id: randomUUID(), ...data, message: data.message ?? "", status: "new", createdAt: new Date().toISOString() };
  await db().send(new PutCommand({ TableName: tableName("APPOINTMENTS_TABLE"), Item: item }));
  return item;
}

export async function listAppointments(): Promise<Appointment[]> {
  const items: Appointment[] = [];
  let key: Record<string, unknown> | undefined;
  do {
    const r = await db().send(new ScanCommand({ TableName: tableName("APPOINTMENTS_TABLE"), ExclusiveStartKey: key }));
    items.push(...((r.Items ?? []) as Appointment[]));
    key = r.LastEvaluatedKey;
  } while (key);
  // Existing rows created before statuses existed default to "new".
  return items.map((i) => ({ ...i, status: i.status ?? "new" })).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function updateAppointment(id: string, patch: { status?: AppointmentStatus; notes?: string }) {
  const sets: string[] = ["modifiedAt = :m"];
  const values: Record<string, unknown> = { ":m": new Date().toISOString() };
  const names: Record<string, string> = {};
  if (patch.status) { sets.push("#s = :s"); names["#s"] = "status"; values[":s"] = patch.status; }
  if (patch.notes !== undefined) { sets.push("notes = :n"); values[":n"] = patch.notes; }
  const r = await db().send(
    new UpdateCommand({
      TableName: tableName("APPOINTMENTS_TABLE"),
      Key: { id },
      UpdateExpression: `SET ${sets.join(", ")}`,
      ConditionExpression: "attribute_exists(id)",
      ExpressionAttributeValues: values,
      ...(Object.keys(names).length ? { ExpressionAttributeNames: names } : {}),
      ReturnValues: "ALL_NEW",
    }),
  );
  return r.Attributes as Appointment;
}

export async function deleteAppointment(id: string) {
  await db().send(new DeleteCommand({ TableName: tableName("APPOINTMENTS_TABLE"), Key: { id } }));
}

export const getAppointment = async (id: string) =>
  (await db().send(new GetCommand({ TableName: tableName("APPOINTMENTS_TABLE"), Key: { id } }))).Item as Appointment | undefined;
