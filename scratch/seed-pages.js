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

const PAGES_DATA = [
  {
    slug: "terms-of-service",
    title: "Terms of Service",
    description: "Read our Terms of Service to understand your rights and responsibilities when using StayVacation.",
    content: `
      <h2>1. Acceptance of Terms</h2>
      <p>By accessing and booking through StayVacation ("the Website", "we", "us", "our"), you agree to be bound by these Terms of Service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
      
      <h2>2. Booking & Payments</h2>
      <p>All bookings made through our platform are subject to availability and acceptance by us and our partner operators. Payments must be made in full or according to the payment schedule specified at the time of booking to secure your reservation.</p>
      <ul>
        <li>Payments are processed securely using our authorized payment gateways.</li>
        <li>Prices listed are dynamic and may change based on seasonality, availability, and promotional offers.</li>
      </ul>

      <h2>3. Cancellation & Refund Policy</h2>
      <p>Cancellation policies vary by package, hotel, and activity. Please review the specific cancellation terms provided during the booking process. If eligible, refunds will be processed back to the original method of payment within 7–14 business days.</p>

      <h2>4. User Responsibilities & Conduct</h2>
      <p>Users must provide accurate, current, and complete information during registration and booking. Any fraudulent, abusive, or illegal activity may be grounds for termination of your account and cancellation of bookings without refund.</p>

      <h2>5. Limitation of Liability</h2>
      <p>StayVacation acts as an agent facilitating travel bookings between travelers and service operators. We are not liable for any personal injury, property damage, delay, or other loss incurred due to actions of third-party service providers.</p>

      <h2>6. Modifications to Service & Terms</h2>
      <p>We reserve the right to modify or discontinue services, or update these terms at any time without prior notice. Continued use of the website following changes constitutes acceptance of the new terms.</p>
    `,
    updatedAt: new Date()
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    description: "Learn how StayVacation collects, uses, and protects your personal information.",
    content: `
      <h2>1. Information We Collect</h2>
      <p>We collect personal information that you provide to us directly when registering, booking a tour, subscribing to our newsletter, or contacting customer service. This may include:</p>
      <ul>
        <li>Full Name, Email Address, and Phone Number.</li>
        <li>Billing address and payment details (processed securely).</li>
        <li>Travel preferences, dietary requirements, and special requests.</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>We use the collected information for the following purposes:</p>
      <ul>
        <li>To process bookings, confirm itineraries, and issue travel tickets.</li>
        <li>To communicate updates, newsletters, and promotional offers (you can opt-out at any time).</li>
        <li>To improve our website functionality, customer service, and personalization.</li>
        <li>To comply with legal obligations and prevent fraudulent transactions.</li>
      </ul>

      <h2>3. Information Sharing & Disclosure</h2>
      <p>We do not sell, trade, or rent your personal information to third parties. We share information only with trusted third-party service providers (hotels, airlines, local operators) as necessary to complete your travel bookings.</p>

      <h2>4. Data Security</h2>
      <p>We implement a variety of security measures, including SSL encryption and secure firewalls, to maintain the safety of your personal information. However, no method of transmission over the Internet is 100% secure.</p>

      <h2>5. Cookies & Tracking Technologies</h2>
      <p>We use cookies to analyze web traffic, remember user preferences, and deliver targeted advertising. You can choose to disable cookies through your browser settings, though some website features may not function properly.</p>

      <h2>6. Your Rights</h2>
      <p>You have the right to access, correct, or request deletion of your personal information held by us. Please contact our support team at privacy@stayvacation.in to submit a request.</p>
    `,
    updatedAt: new Date()
  }
];

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
    const collection = db.collection("pages");

    console.log("Seeding CMS pages collection...");
    for (const page of PAGES_DATA) {
      await collection.updateOne(
        { slug: page.slug },
        { $set: page },
        { upsert: true }
      );
      console.log(`Successfully upserted page: ${page.slug}`);
    }
    console.log("Seeding completed successfully.");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await client.close();
  }
}

run();
