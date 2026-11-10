import { DeleteCommand, GetCommand, PutCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "node:crypto";
import { isBlogLive, type Blog, type BlogInput } from "@drkumar/shared";
import { db, tableName } from "../dynamo";
import { cleanHtml } from "../sanitize";

const T = () => tableName("BLOGS_TABLE");

/** Sanitise all rich text and normalise publishAt according to status. */
function normalise(input: BlogInput): Omit<Blog, "id" | "createdAt" | "modifiedAt"> {
  const now = new Date().toISOString();
  let publishAt = input.publishAt ?? null;
  if (input.status === "published" && !publishAt) publishAt = now; // "publish now"
  if (input.status === "draft" || input.status === "inactive") publishAt = publishAt ?? null;
  return {
    ...input,
    publishAt,
    extraFields: input.extraFields.map((f) => ({ heading: f.heading, description: cleanHtml(f.description) })),
    faqs: input.faqs.map((f) => ({ question: f.question, answer: cleanHtml(f.answer) })),
  };
}

export async function getBlogByUrl(url: string) {
  const r = await db().send(
    new QueryCommand({ TableName: T(), IndexName: "url-index", KeyConditionExpression: "#u = :u", ExpressionAttributeNames: { "#u": "url" }, ExpressionAttributeValues: { ":u": url }, Limit: 1 }),
  );
  return r.Items?.[0] as Blog | undefined;
}

export async function getBlog(id: string) {
  return (await db().send(new GetCommand({ TableName: T(), Key: { id } }))).Item as Blog | undefined;
}

export async function listBlogs(): Promise<Blog[]> {
  const items: Blog[] = [];
  let key: Record<string, unknown> | undefined;
  do {
    const r = await db().send(new ScanCommand({ TableName: T(), ExclusiveStartKey: key }));
    items.push(...((r.Items ?? []) as Blog[]));
    key = r.LastEvaluatedKey;
  } while (key);
  return items.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
}

/** Blogs visible to the public right now (published/scheduled and due), newest first. */
export async function listLiveBlogs(now = new Date()) {
  return (await listBlogs())
    .filter((b) => isBlogLive(b, now))
    .sort((a, b) => (b.publishAt ?? "").localeCompare(a.publishAt ?? ""));
}

export class SlugTakenError extends Error {}

export async function createBlog(input: BlogInput) {
  const data = normalise(input);
  const existing = await getBlogByUrl(data.url);
  if (existing) throw new SlugTakenError();
  const now = new Date().toISOString();
  const blog: Blog = { id: randomUUID(), ...data, createdAt: now, modifiedAt: now };
  await db().send(new PutCommand({ TableName: T(), Item: blog, ConditionExpression: "attribute_not_exists(id)" }));
  return blog;
}

export async function updateBlog(id: string, input: BlogInput) {
  const current = await getBlog(id);
  if (!current) return null;
  const data = normalise(input);
  const clash = await getBlogByUrl(data.url);
  if (clash && clash.id !== id) throw new SlugTakenError();
  const blog: Blog = { id, ...data, createdAt: current.createdAt, modifiedAt: new Date().toISOString() };
  await db().send(new PutCommand({ TableName: T(), Item: blog }));
  return blog;
}

export const deleteBlog = (id: string) => db().send(new DeleteCommand({ TableName: T(), Key: { id } }));
