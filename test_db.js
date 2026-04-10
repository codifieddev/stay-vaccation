const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("tours_travel");
    const pkgs = await db.collection("packages").find({}, { projection: { title: 1, slug: 1, _id: 1, tripDuration: 1, id: 1 } }).toArray();
    console.log(JSON.stringify(pkgs, null, 2));
  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
main();
