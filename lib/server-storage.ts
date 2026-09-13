import 'server-only';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import type { Session } from '@/lib/learning';

const region = process.env.AWS_REGION;
const tableName = process.env.DYNAMODB_TABLE_NAME;
const bucketName = process.env.S3_BUCKET_NAME;

function configured() {
  return Boolean(region && tableName && bucketName && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
}

let ddb: DynamoDBDocumentClient | null = null;
let s3: S3Client | null = null;

function getDdb() {
  if (!configured()) return null;
  if (!ddb) ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region }), { marshallOptions: { removeUndefinedValues: true } });
  return ddb;
}

function getS3() {
  if (!configured()) return null;
  if (!s3) s3 = new S3Client({ region });
  return s3;
}

export function storageStatus() {
  return { dynamo: Boolean(getDdb()), s3: Boolean(getS3()) };
}

export async function saveSession(userId: string, session: Session) {
  const client = getDdb();
  if (!client || !tableName) return false;
  await client.send(new PutCommand({
    TableName: tableName,
    Item: {
      PK: `USER#${userId}`,
      SK: `SESSION#${session.id}`,
      entity: 'SESSION',
      userId,
      sessionId: session.id,
      updatedAt: new Date().toISOString(),
      createdAt: session.createdAt,
      session,
    },
  }));
  return true;
}

export async function getSession(userId: string, sessionId: string) {
  const client = getDdb();
  if (!client || !tableName) return null;
  const result = await client.send(new GetCommand({ TableName: tableName, Key: { PK: `USER#${userId}`, SK: `SESSION#${sessionId}` } }));
  return (result.Item?.session as Session | undefined) ?? null;
}

export async function listSessions(userId: string) {
  const client = getDdb();
  if (!client || !tableName) return [] as Session[];
  const result = await client.send(new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: { ':pk': `USER#${userId}`, ':sk': 'SESSION#' },
    ScanIndexForward: false,
    Limit: 100,
  }));
  return (result.Items ?? []).map(item => item.session as Session).filter(Boolean);
}

export async function deleteSession(userId: string, sessionId: string, sourceFileKey?: string) {
  const client = getDdb();
  if (client && tableName) await client.send(new DeleteCommand({ TableName: tableName, Key: { PK: `USER#${userId}`, SK: `SESSION#${sessionId}` } }));
  const clientS3 = getS3();
  if (clientS3 && bucketName && sourceFileKey) await clientS3.send(new DeleteObjectCommand({ Bucket: bucketName, Key: sourceFileKey }));
}

export async function createUploadPost(userId: string, fileName: string, contentType: string, size: number) {
  const client = getS3();
  if (!client || !bucketName) return null;
  if (!Number.isFinite(size) || size < 1 || size > 50 * 1024 * 1024) throw new Error('Files must be between 1 byte and 50 MB.');
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-120);
  const key = `users/${userId}/uploads/${crypto.randomUUID()}-${safeName}`;
  const post = await createPresignedPost(client, {
    Bucket: bucketName,
    Key: key,
    Fields: { 'Content-Type': contentType },
    Conditions: [
      ['content-length-range', 1, 50 * 1024 * 1024],
      ['eq', '$Content-Type', contentType],
    ],
    Expires: 600,
  });
  return { ...post, key };
}
