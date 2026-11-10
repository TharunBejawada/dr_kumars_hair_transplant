import { defineBackend } from "@aws-amplify/backend";
import { RemovalPolicy } from "aws-cdk-lib";
import { AttributeType, BillingMode, Table, TableEncryption } from "aws-cdk-lib/aws-dynamodb";

/**
 * Infrastructure for Dr. Kumar's site (Amplify Gen 2 / CDK).
 * Tables are on-demand, encrypted, with point-in-time recovery and retained on stack deletion.
 * The Next.js SSR compute role must be granted read/write on these tables (see README → Deployment).
 */
const backend = defineBackend({});
const stack = backend.createStack("data");

const common = {
  billingMode: BillingMode.PAY_PER_REQUEST,
  encryption: TableEncryption.AWS_MANAGED,
  pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
  removalPolicy: RemovalPolicy.RETAIN,
} as const;

export const appointments = new Table(stack, "Appointments", {
  ...common,
  partitionKey: { name: "id", type: AttributeType.STRING },
});

// Admin users for the upcoming Blogs admin (custom JWT auth). Email is the unique login key.
export const adminUsers = new Table(stack, "AdminUsers", {
  ...common,
  partitionKey: { name: "email", type: AttributeType.STRING },
});

backend.addOutput({
  custom: { appointmentsTable: appointments.tableName, adminUsersTable: adminUsers.tableName },
});
