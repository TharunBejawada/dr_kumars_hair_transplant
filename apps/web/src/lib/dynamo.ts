import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

/** Singleton DynamoDB document client. Credentials come from the Amplify SSR compute role (no keys in code). */
let doc: DynamoDBDocumentClient | undefined;
export function db() {
  doc ??= DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: process.env.APP_AWS_REGION ?? process.env.AWS_REGION ?? "ap-south-1" }),
    { marshallOptions: { removeUndefinedValues: true } },
  );
  return doc;
}
