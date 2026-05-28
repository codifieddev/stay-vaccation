const { MongoClient } = require('mongodb');

async function run() {
  const uri = "mongodb+srv://cs530885_db_user:uhKijf1PLxANW4pv@cluster0.yctt4gm.mongodb.net/tours_travel?retryWrites=true&w=majority";
  const dbName = "tours_travel";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const pkg = await db.collection('packages').findOne({ title: "Bali Royal Escape" });
    console.log('--- Bali Royal Escape Full Document ---');
    console.log(JSON.stringify(pkg, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
