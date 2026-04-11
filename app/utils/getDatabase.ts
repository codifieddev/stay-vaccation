import { MongoClient, Db, ObjectId } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add MONGODB_URI to your environment variables!');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export { clientPromise };

export async function getDatabase(): Promise<Db> {
  const dbName = process.env.MONGODB_DB;
  const client = await clientPromise;
  
  // Explicitly passing undefined to client.db() will use the default db from URI
  // but it's better to be explicit if MONGODB_DB is provided.
  return client.db(dbName);
}

export async function getTestDatabase(dbname: string): Promise<Db> {
  const client = await clientPromise;
  if (!dbname) {
    throw new Error("No DB Name Found");
  }
  return client.db(dbname);
}

// Backward-compatible alias for older imports
export const getDb = getDatabase;

export function toObjectId(id: string): ObjectId {
  return new ObjectId(id);
}

export function fromObjectId(id: ObjectId): string {
  return id.toString();
}