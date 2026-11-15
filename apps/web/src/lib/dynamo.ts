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

function resolveCredentials() {
  // In AWS Lambda (Amplify compute runtime), never override credentials.
  // The AWS SDK automatically resolves credentials from the compute execution role
  // (including temporary STS session tokens: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN).
  if (process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.AWS_EXECUTION_ENV) {
    return undefined;
  }
  // Local development with static IAM keys in .env.local
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    return {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      ...(process.env.AWS_SESSION_TOKEN ? { sessionToken: process.env.AWS_SESSION_TOKEN } : {}),
    };
  }
  return undefined;
}

/** Singleton DynamoDB document client. In AWS, credentials come from the Amplify compute role (no keys in code). */
let doc: DynamoDBDocumentClient | undefined;
export function db() {
  const credentials = resolveCredentials();
  doc ??= DynamoDBDocumentClient.from(
    new DynamoDBClient({
      region: process.env.APP_AWS_REGION ?? process.env.AWS_REGION ?? "ap-south-1",
      // Local development only (dynalite / DynamoDB Local).
      ...(process.env.DYNAMODB_ENDPOINT
        ? { endpoint: process.env.DYNAMODB_ENDPOINT, credentials: { accessKeyId: "local", secretAccessKey: "local" } }
        : credentials
        ? { credentials }
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
