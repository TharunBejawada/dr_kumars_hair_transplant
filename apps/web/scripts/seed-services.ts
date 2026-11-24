import fs from "fs";
import path from "path";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { DEFAULT_SERVICE_PAGES } from "../src/lib/db/services";

// Read .env.local
const envFile = path.resolve(process.cwd(), ".env.local");
const lines = fs.readFileSync(envFile, "utf-8").split("\n");
const env: Record<string, string> = {};
for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq > 0) env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
}

const client = new DynamoDBClient({
  region: env.APP_AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});
const ddb = DynamoDBDocumentClient.from(client);

async function seed() {
  const tableName = env.SERVICES_TABLE;
  console.log("Seeding SERVICES_TABLE:", tableName);

  for (const page of DEFAULT_SERVICE_PAGES) {
    console.log(`Writing service page ${page.slug} (${page.id})...`);
    await ddb.send(new PutCommand({
      TableName: tableName,
      Item: page,
    }));
    console.log(`Successfully wrote ${page.slug}`);
  }

  const res = await ddb.send(new ScanCommand({ TableName: tableName }));
  console.log("Total items now in SERVICES_TABLE:", res.Count);
  for (const item of res.Items || []) {
    console.log(`- ID: ${item.id} | Slug: ${item.slug} | Category: ${item.serviceCategory} | Title: ${item.title?.slice(0, 35)}`);
  }
}

seed().catch(console.error);
