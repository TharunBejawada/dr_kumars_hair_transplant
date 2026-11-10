// Local DynamoDB emulator (dynalite) with the same tables as amplify/backend.ts. Dev/testing only.
import dynalite from "dynalite";
import { DynamoDBClient, CreateTableCommand } from "@aws-sdk/client-dynamodb";

const port = Number(process.env.PORT ?? 4567);
const server = dynalite({ createTableMs: 0 });
server.listen(port, async () => {
  const c = new DynamoDBClient({ region: "ap-south-1", endpoint: `http://localhost:${port}`, credentials: { accessKeyId: "local", secretAccessKey: "local" } });
  const S = (n) => ({ AttributeName: n, AttributeType: "S" });
  const make = (TableName, pk, extra = {}) => c.send(new CreateTableCommand({ TableName, BillingMode: "PAY_PER_REQUEST", KeySchema: [{ AttributeName: pk, KeyType: "HASH" }], AttributeDefinitions: [S(pk), ...(extra.attrs ?? [])], ...(extra.gsi ? { GlobalSecondaryIndexes: extra.gsi } : {}) }));
  await make("local-appointments", "id");
  await make("local-admin-users", "email");
  await make("local-blogs", "id", { attrs: [S("url")], gsi: [{ IndexName: "url-index", KeySchema: [{ AttributeName: "url", KeyType: "HASH" }], Projection: { ProjectionType: "ALL" } }] });
  console.log(`local DynamoDB ready on :${port} (tables: local-appointments, local-admin-users, local-blogs)`);
});
