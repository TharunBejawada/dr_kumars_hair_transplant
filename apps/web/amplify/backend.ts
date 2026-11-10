import { defineBackend } from "@aws-amplify/backend";
import { RemovalPolicy } from "aws-cdk-lib";
import { AttributeType, BillingMode, ProjectionType, Table, TableEncryption } from "aws-cdk-lib/aws-dynamodb";
import { BlockPublicAccess, Bucket, BucketEncryption, HttpMethods } from "aws-cdk-lib/aws-s3";

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

// Admin users (custom JWT auth). Email is the unique login key.
export const adminUsers = new Table(stack, "AdminUsers", {
  ...common,
  partitionKey: { name: "email", type: AttributeType.STRING },
});

export const blogs = new Table(stack, "Blogs", {
  ...common,
  partitionKey: { name: "id", type: AttributeType.STRING },
});
// Slug lookup for the public blog pages + uniqueness check.
blogs.addGlobalSecondaryIndex({
  indexName: "url-index",
  partitionKey: { name: "url", type: AttributeType.STRING },
  projectionType: ProjectionType.ALL,
});

// Private bucket for blog images. Reads go through /api/media (never public); writes use presigned POSTs.
export const media = new Bucket(stack, "Media", {
  blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
  encryption: BucketEncryption.S3_MANAGED,
  enforceSSL: true,
  removalPolicy: RemovalPolicy.RETAIN,
  cors: [{ allowedMethods: [HttpMethods.POST], allowedOrigins: ["*"], allowedHeaders: ["*"], maxAge: 3000 }],
});

backend.addOutput({
  custom: {
    appointmentsTable: appointments.tableName,
    adminUsersTable: adminUsers.tableName,
    blogsTable: blogs.tableName,
    mediaBucket: media.bucketName,
  },
});
