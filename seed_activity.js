const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = "mongodb+srv://cs530885_db_user:uhKijf1PLxANW4pv@cluster0.yctt4gm.mongodb.net/tours_travel?retryWrites=true&w=majority";
const DB_NAME = "tours_travel";

const SWISS_ACTIVITIES = [
  {
    activity: {
      id: "glacier-express-train-ride",
      title: "Glacier Express Train Ride",
      slug: "glacier-express-train-ride",
      location: "Switzerland",
      rating: 5.0,
      total_reviews: 1250,
      category: ["Scenery", "Luxury", "Train"],
      tags: ["Panoramic", "Alps", "UNESCO", "Experience"],
      pricing: {
        currency: "INR",
        original_price: 2500,
        discounted_price: 2000,
        discount_percent: 20,
        price_per: "Adult",
        offer_label: "BEST SELLER"
      },
      ticket_types: [
        {
          id: "standard-2nd-class",
          name: "Standard 2nd Class Ticket",
          duration: "8 Hours",
          original_price: 2500,
          discounted_price: 2000,
          price_per: "Adult",
          voucher_type: "Mobile Voucher"
        }
      ],
      highlights: [
        "Journey through the 'Window to the Alps' on the world's slowest express train.",
        "Cross 291 bridges and pass through 91 tunnels across the stunning Swiss landscape.",
        "Uninterrupted views of the Matterhorn and Oberalp Pass through panoramic windows.",
        "Exquisite on-board dining with freshly prepared regional specialties."
      ],
      overview: {
        about: "The Glacier Express is one of the most famous train journeys in the world. Connecting the mountain resorts of Zermatt and St. Moritz, the train traverses the heart of the Swiss Alps, offering breathtaking views that are impossible to see by car. Known as the 'slowest express train,' it allows travelers to fully immerse themselves in the pristine beauty of the Swiss mountains over an 8-hour journey.",
        know_before_you_go: [
          "Seat reservations are mandatory and must be booked in addition to the ticket.",
          "Boarding is available at Zermatt, Brig, Chur, and St. Moritz.",
          "Kindly carry a valid passport for ID verification."
        ],
        things_to_carry: ["Valid ID proof", "Camera", "Sunscreen"],
        accessibility: ["Wheelchair Accessible", "Stroller Accessible"]
      },
      policies: {
        confirmation: {
          booking_window_1: { time_range: "Instant", voucher_delivery: "Within 15 minutes" }
        },
        cancellation: [{ days_before: "7+", charge_percent: 0 }, { days_before: "0-7", charge_percent: 100 }],
        force_majeure: "Subject to weather conditions and rail service availability."
      },
      faqs: [{ question: "Is food included?", answer: "Meals can be pre-booked or ordered a la carte on board." }],
      reviews: [{ reviewer: "John Smith", rating: 5, label: "Amazing!", comment: "Best train ride ever." }],
      contact: { phone: "+41 27 927 77 77", support_hours: "8:00 AM - 6:00 PM CET" },
      nearby_attractions: [{ name: "Matterhorn", description: "Iconic peak", slug: "matterhorn" }],
      meta: { platform: "Stay Vacation Exclusive" }
    }
  },
  {
    activity: {
      id: "jungfraujoch-top-of-europe",
      title: "Jungfraujoch – Top of Europe",
      slug: "jungfraujoch-top-of-europe",
      location: "Switzerland",
      rating: 5.0,
      total_reviews: 3200,
      category: ["Adventure", "Mountain", "Snow"],
      tags: ["High Altitude", "Ice Palace", "Sphinx Observatory"],
      pricing: {
        currency: "INR",
        original_price: 15000,
        discounted_price: 12000,
        discount_percent: 20,
        price_per: "Adult",
        offer_label: "BUCKET LIST"
      },
      ticket_types: [
        {
          id: "eiger-express-transfer",
          name: "Eiger Express Round Trip",
          duration: "1 Day",
          original_price: 15000,
          discounted_price: 12000,
          price_per: "Adult",
          voucher_type: "Mobile Voucher"
        }
      ],
      highlights: [
        "Reach the highest railway station in Europe at 3,454 meters.",
        "Experience the Ice Palace with sculptures carved directly into the glacier.",
        "Enjoy 360-degree views from the Sphinx Observatory.",
        "Step out onto the Aletsch Glacier, a UNESCO World Heritage site."
      ],
      overview: {
        about: "Jungfraujoch, famously known as the 'Top of Europe,' is a high-altitude col between the Jungfrau and Mönch peaks. The journey to the top is an engineering marvel, involving a cogwheel train that tunnels through the mountains. At the summit, visitors find a world of permanent ice and snow, with attractions like the Ice Palace, Lindt Home of Chocolate, and various snow-based activities.",
        know_before_you_go: [
          "Temperatures at the top are always around or below freezing.",
          "The journey takes about 1.5 - 2 hours from Interlaken.",
          "Stay hydrated to minimize altitude sickness."
        ],
        things_to_carry: ["Warm Clothing", "Sunglasses", "Powerbank"],
        accessibility: ["Partially Accessible"]
      },
      policies: {
        confirmation: {
          booking_window_1: { time_range: "Instant", voucher_delivery: "Within 30 minutes" }
        },
        cancellation: [{ days_before: "3+", charge_percent: 0 }, { days_before: "0-3", charge_percent: 100 }],
        force_majeure: "High winds or severe weather may affect operation."
      },
      faqs: [{ question: "Is there oxygen available?", answer: "Yes, medical assistance and oxygen are available at the summit if needed." }],
      reviews: [{ reviewer: "Sarah L.", rating: 5, label: "Breathtaking!", comment: "Worth every penny." }],
      contact: { phone: "+41 33 828 72 33", support_hours: "8:00 AM - 5:00 PM CET" },
      nearby_attractions: [{ name: "Trummelbach Falls", description: "Glacier waterfalls", slug: "trummelbach" }],
      meta: { platform: "Stay Vacation Exclusive" }
    }
  }
];

async function runSeed() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db(DB_NAME);
    const detailCollection = db.collection("activity_details");
    const cityPagesCollection = db.collection("activity_pages");

    // 1. Seed Abu Dhabi (Qasr Al Watan) from JSON
    const jsonPath = path.join(__dirname, 'activity_data.json');
    if (fs.existsSync(jsonPath)) {
        const rawData = fs.readFileSync(jsonPath, 'utf8');
        const activityData = JSON.parse(rawData);
        const activitySlug = activityData.activity.slug;
        await detailCollection.deleteOne({ "activity.slug": activitySlug });
        await detailCollection.insertOne(activityData);
        console.log(`Seeded: ${activityData.activity.title}`);

        // Update AD City Page
        const adSlug = "things-to-do-in-abu-dhabi";
        await cityPagesCollection.updateOne(
            { slug: adSlug },
            { $set: { "activities.0.slug": activitySlug } }
        );
        console.log("Updated Abu Dhabi city page.");
    }

    // 2. Seed Swiss Activities
    for (const data of SWISS_ACTIVITIES) {
        await detailCollection.deleteOne({ "activity.slug": data.activity.slug });
        await detailCollection.insertOne(data);
        console.log(`Seeded: ${data.activity.title}`);
    }

    // 3. Update Switzerland City Page Slugs
    const switzSlug = "things-to-do-in-switzerland";
    const switzPage = await cityPagesCollection.findOne({ slug: switzSlug });
    if (switzPage) {
        const updated = switzPage.activities.map(act => {
            if (act.title.toLowerCase().includes("glacier express")) return { ...act, slug: "glacier-express-train-ride" };
            if (act.title.toLowerCase().includes("jungfraujoch")) return { ...act, slug: "jungfraujoch-top-of-europe" };
            return act;
        });
        await cityPagesCollection.updateOne({ slug: switzSlug }, { $set: { activities: updated } });
        console.log(`Updated Switzerland city page with ${updated.filter(a => a.slug).length} slugs.`);
    }

  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await client.close();
  }
}

runSeed();
