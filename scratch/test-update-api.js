const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const { SignJWT } = require('jose');

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

async function verifyInDb() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    
    // Check both string and ObjectId
    let cat = await db.collection('categories').findOne({ _id: '69e9d030946c97748d163056' });
    if (cat) {
      console.log('Found category via STRING ID query.');
    } else {
      cat = await db.collection('categories').findOne({ _id: new ObjectId('69e9d030946c97748d163056') });
      if (cat) {
        console.log('Found category via OBJECTID query.');
      }
    }

    console.log('\n--- Category in DB after test update ---');
    console.log(JSON.stringify(cat, null, 2));
    
    if (cat && cat.image === 'https://res.cloudinary.com/dpq1lw5zb/image/upload/v1777551696/test_heritage.jpg') {
      console.log('\nSUCCESS: Image was successfully saved to MongoDB database!');
    } else {
      console.log('\nFAILURE: Image was not saved correctly.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

async function testApi() {
  loadEnv();
  
  // Sign admin JWT
  console.log('Generating valid Admin JWT...');
  const jwtSecret = process.env.JWT_SECRET || 'hello_stayvacation';
  const encodedSecret = new TextEncoder().encode(jwtSecret);
  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('2h')
    .sign(encodedSecret);
  
  console.log('JWT generated successfully.');

  console.log('Sending PUT request to update Category (Heritage & Culture)...');
  try {
    const response = await fetch('http://localhost:3000/api/categories/69e9d030946c97748d163056', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        _id: '69e9d030946c97748d163056',
        name: 'Heritage & Culture',
        slug: 'heritage-culture',
        icon: '🏛️',
        color: 'from-amber-500 to-blue-700',
        link: '/packages?type=Heritage',
        order: 2,
        shortLocationList: 'Rajasthan · Rome · Istanbul · Kyoto',
        description: 'Step back in time through ancient palaces, magnificent temples, and living heritage sites.',
        isActive: true,
        image: 'https://res.cloudinary.com/dpq1lw5zb/image/upload/v1777551696/test_heritage.jpg'
      }),
    });

    const result = await response.json();
    console.log('\n--- API PUT Response ---');
    console.log(JSON.stringify(result, null, 2));
    
    // Now verify directly in DB
    await verifyInDb();
  } catch (err) {
    console.error('Error during test:', err);
  }
}

testApi();
