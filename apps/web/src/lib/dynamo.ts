import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Silence AWS SDK v3 future deprecation notice for Node 20 so it doesn't trigger the Next.js dev error overlay
if (typeof process !== "undefined" && typeof process.emitWarning === "function") {
  const orig = process.emitWarning;
  process.emitWarning = (w: any, ...args: any[]) => {
    if (typeof w === "string" && w.includes("NodeVersionSupportWarning")) return;
    if (w && (w.name === "NodeVersionSupportWarning" || String(w.message).includes("NodeVersionSupportWarning"))) return;
    return (orig as any).call(process, w, ...args);
  };
}

/** Singleton DynamoDB document client. In AWS, credentials come from the Amplify compute role (no keys in code). */
let doc: DynamoDBDocumentClient | undefined;
export function db() {
  doc ??= DynamoDBDocumentClient.from(
    new DynamoDBClient({
      region: process.env.APP_AWS_REGION ?? process.env.AWS_REGION ?? "ap-south-1",
      // Local development only (dynalite / DynamoDB Local).
      ...(process.env.DYNAMODB_ENDPOINT
        ? { endpoint: process.env.DYNAMODB_ENDPOINT, credentials: { accessKeyId: "local", secretAccessKey: "local" } }
        : process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? { credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY } }
        : {}),
    }),
    { marshallOptions: { removeUndefinedValues: true } },
  );
  return doc;
}

export function tableName(envVar: "APPOINTMENTS_TABLE" | "ADMIN_USERS_TABLE" | "BLOGS_TABLE" | "SERVICES_TABLE") {
  const name = process.env[envVar];
  if (!name) throw new Error(`${envVar} is not configured`);
  return name;
}
