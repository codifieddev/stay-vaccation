const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://cs530885_db_user:uhKijf1PLxANW4pv@cluster0.yctt4gm.mongodb.net/tours_travel?retryWrites=true&w=majority";
const DB_NAME = "tours_travel";

const SWITZ_PAGE = {
  slug: "things-to-do-in-switzerland",
  city: "Switzerland",
  heroImages: [
    "https://images.unsplash.com/photo-1531219432768-9f540ce91ef3?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?q=80&w=2070&auto=format&fit=crop"
  ],
  description: {
    short: "Discover the best things to do in Switzerland with our curated list of activities.",
    full: "Explore the majestic Swiss Alps, crystal-clear lakes, and vibrant cities. From world-famous train rides to high-altitude adventures, Switzerland offers unforgettable experiences for every traveler."
  },
  activities: [
    {
      title: "Glacier Express Train Ride",
      image: "https://images.unsplash.com/photo-1549466600-82cfec243e91?q=80&w=2070&auto=format&fit=crop",
      duration: "8 Hours",
      price: "2000",
      rating: 5,
      slug: "glacier-express-train-ride"
    },
    {
      title: "Jungfraujoch – Top of Europe",
      image: "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?q=80&w=2070&auto=format&fit=crop",
      duration: "1 day or multi-day",
      price: "₹4,000–12,000",
      rating: 5,
      slug: "jungfraujoch-top-of-europe"
    }
  ],
  faqs: [],
  reviews: [],
  createdAt: new Date(),
  updatedAt: new Date()
};

async function restore() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db(DB_NAME);
    const collection = db.collection("activity_pages");
    
    await collection.deleteOne({ slug: "things-to-do-in-switzerland" });
    await collection.insertOne(SWITZ_PAGE);
    
    console.log("Successfully restored Switzerland activity page.");
  } catch (error) {
    console.error("Restoration failed:", error);
  } finally {
    await client.close();
  }
}

restore();
