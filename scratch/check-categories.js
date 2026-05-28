const { MongoClient } = require('mongodb');
const fs = require('fs');

function loadEnv() {
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    }
  } catch (e) {
    console.error('Could not load .env file', e);
  }
}

async function run() {
  loadEnv();
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not found in environment');
    return;
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const dbName = process.env.MONGODB_DB;
    const db = client.db(dbName);
    const categories = await db.collection('categories').find({}).toArray();
    console.log(`Found ${categories.length} categories in db:`);
    categories.forEach(c => {
      console.log(JSON.stringify(c, null, 2));
    });
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
