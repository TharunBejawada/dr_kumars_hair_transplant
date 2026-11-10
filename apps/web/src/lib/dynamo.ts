import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

/** Singleton DynamoDB document client. In AWS, credentials come from the Amplify compute role (no keys in code). */
let doc: DynamoDBDocumentClient | undefined;
export function db() {
  doc ??= DynamoDBDocumentClient.from(
    new DynamoDBClient({
      region: process.env.APP_AWS_REGION ?? process.env.AWS_REGION ?? "ap-south-1",
      // Local development only (dynalite / DynamoDB Local).
      ...(process.env.DYNAMODB_ENDPOINT
        ? { endpoint: process.env.DYNAMODB_ENDPOINT, credentials: { accessKeyId: "local", secretAccessKey: "local" } }
        : {}),
    }),
    { marshallOptions: { removeUndefinedValues: true } },
  );
  return doc;
}

export function tableName(envVar: "APPOINTMENTS_TABLE" | "ADMIN_USERS_TABLE" | "BLOGS_TABLE") {
  const name = process.env[envVar];
  if (!name) throw new Error(`${envVar} is not configured`);
  return name;
}
