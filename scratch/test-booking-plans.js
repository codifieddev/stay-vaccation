const { MongoClient, ObjectId } = require('mongodb');
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
  const dbName = process.env.MONGODB_DB;

  if (!uri) {
    console.error('MONGODB_URI not found in environment');
    return;
  }

  console.log('Connecting to MongoDB...');
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected successfully!');
    const db = client.db(dbName);
    const collection = db.collection('booking_plans');

    // 1. Insert Mock Plan
    const mockPlan = {
      fullName: 'John Doe Test',
      email: 'john.doe@example.com',
      destination: 'Switzerland Alps Escape',
      status: 'pending',
      createdAt: new Date(),
    };

    console.log('1. Inserting mock plan...');
    const insertResult = await collection.insertOne(mockPlan);
    console.log('Inserted ID:', insertResult.insertedId.toString());

    // 2. Fetch all plans
    console.log('2. Fetching all plans...');
    const plans = await collection.find({}).toArray();
    console.log(`Found ${plans.length} plan(s) in collection.`);
    console.log('Plans:', plans);

    // 3. Update status
    console.log('3. Updating status to contacted...');
    const updateResult = await collection.updateOne(
      { _id: insertResult.insertedId },
      { $set: { status: 'contacted', updatedAt: new Date() } }
    );
    console.log('Modified count:', updateResult.modifiedCount);

    const updatedPlan = await collection.findOne({ _id: insertResult.insertedId });
    console.log('Updated plan in DB:', updatedPlan);

    // 4. Delete mock plan
    console.log('4. Deleting mock plan...');
    const deleteResult = await collection.deleteOne({ _id: insertResult.insertedId });
    console.log('Deleted count:', deleteResult.deletedCount);

  } catch (err) {
    console.error('Database error:', err);
  } finally {
    await client.close();
    console.log('Connection closed.');
  }
}

run();
