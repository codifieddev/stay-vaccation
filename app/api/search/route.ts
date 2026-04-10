import { NextRequest, NextResponse } from "next/server";

// ── Comprehensive destination dataset ─────────────────────────────────────────
const DESTINATIONS = [
  // ─ Bali ─
  { name: "Bali", type: "destination", country: "Indonesia", slug: "bali", emoji: "🌴", tags: ["beach", "island", "culture"] },
  { name: "Seminyak", type: "city", state: "Bali", country: "Indonesia", slug: "seminyak-bali", emoji: "🏖️", tags: ["beach", "nightlife"] },
  { name: "Ubud", type: "city", state: "Bali", country: "Indonesia", slug: "ubud-bali", emoji: "🌿", tags: ["culture", "rice terraces", "wellness"] },
  { name: "Nusa Penida", type: "city", state: "Bali", country: "Indonesia", slug: "nusa-penida", emoji: "🌊", tags: ["island", "snorkeling"] },
  { name: "Kuta", type: "city", state: "Bali", country: "Indonesia", slug: "kuta-bali", emoji: "🏄", tags: ["surfing", "beach"] },

  // ─ Rajasthan ─
  { name: "Rajasthan", type: "state", country: "India", slug: "rajasthan", emoji: "🏰", tags: ["heritage", "desert", "culture"] },
  { name: "Jaipur", type: "city", state: "Rajasthan", country: "India", slug: "jaipur", emoji: "🏯", tags: ["pink city", "heritage", "forts"] },
  { name: "Udaipur", type: "city", state: "Rajasthan", country: "India", slug: "udaipur", emoji: "🕌", tags: ["lakes", "romance", "palace"] },
  { name: "Jodhpur", type: "city", state: "Rajasthan", country: "India", slug: "jodhpur", emoji: "🔵", tags: ["blue city", "fort"] },
  { name: "Jaisalmer", type: "city", state: "Rajasthan", country: "India", slug: "jaisalmer", emoji: "🏜️", tags: ["desert", "camel safari"] },
  { name: "Pushkar", type: "city", state: "Rajasthan", country: "India", slug: "pushkar", emoji: "🐪", tags: ["pilgrimage", "fair"] },

  // ─ Jammu & Kashmir ─
  { name: "Jammu and Kashmir", type: "state", country: "India", slug: "jammu-kashmir", emoji: "❄️", tags: ["mountains", "winter", "paradise"] },
  { name: "Jammu", type: "city", state: "Jammu and Kashmir", country: "India", slug: "jammu", emoji: "🏔️", tags: ["temple", "gateway"] },
  { name: "Srinagar", type: "city", state: "Jammu and Kashmir", country: "India", slug: "srinagar", emoji: "🛶", tags: ["dal lake", "houseboat", "gardens"] },
  { name: "Gulmarg", type: "city", state: "Jammu and Kashmir", country: "India", slug: "gulmarg", emoji: "⛷️", tags: ["skiing", "snow", "meadow"] },
  { name: "Pahalgam", type: "city", state: "Jammu and Kashmir", country: "India", slug: "pahalgam", emoji: "🌄", tags: ["valley", "nature"] },
  { name: "Leh", type: "city", state: "Ladakh", country: "India", slug: "leh", emoji: "🏔️", tags: ["adventure", "mountains", "buddhism"] },
  { name: "Ladakh", type: "state", country: "India", slug: "ladakh", emoji: "🏔️", tags: ["mountains", "adventure", "monastery"] },
  { name: "Kashmir Valley", type: "destination", state: "Jammu and Kashmir", country: "India", slug: "kashmir-valley", emoji: "🌷", tags: ["paradise", "valley", "tulips"] },

  // ─ Himachal Pradesh ─
  { name: "Himachal Pradesh", type: "state", country: "India", slug: "himachal-pradesh", emoji: "🏔️", tags: ["mountains", "hills", "nature"] },
  { name: "Manali", type: "city", state: "Himachal Pradesh", country: "India", slug: "manali", emoji: "🎿", tags: ["snow", "adventure", "honeymoon"] },
  { name: "Shimla", type: "city", state: "Himachal Pradesh", country: "India", slug: "shimla", emoji: "🚂", tags: ["hills", "british", "toy train"] },
  { name: "Dharamshala", type: "city", state: "Himachal Pradesh", country: "India", slug: "dharamshala", emoji: "🙏", tags: ["buddhism", "trekking"] },
  { name: "Spiti Valley", type: "destination", state: "Himachal Pradesh", country: "India", slug: "spiti-valley", emoji: "🏜️", tags: ["offbeat", "desert", "monastery"] },
  { name: "Kasol", type: "city", state: "Himachal Pradesh", country: "India", slug: "kasol", emoji: "🌲", tags: ["backpacking", "nature", "camping"] },

  // ─ Goa ─
  { name: "Goa", type: "state", country: "India", slug: "goa", emoji: "🍹", tags: ["beach", "party", "nightlife", "water sports"] },
  { name: "North Goa", type: "destination", state: "Goa", country: "India", slug: "north-goa", emoji: "🏖️", tags: ["beaches", "nightlife"] },
  { name: "South Goa", type: "destination", state: "Goa", country: "India", slug: "south-goa", emoji: "🌅", tags: ["peaceful", "beaches"] },
  { name: "Panaji", type: "city", state: "Goa", country: "India", slug: "panaji", emoji: "⛪", tags: ["capital", "old goa", "heritage"] },

  // ─ Kerala ─
  { name: "Kerala", type: "state", country: "India", slug: "kerala", emoji: "🌴", tags: ["backwaters", "ayurveda", "wildlife"] },
  { name: "Munnar", type: "city", state: "Kerala", country: "India", slug: "munnar", emoji: "🍃", tags: ["tea gardens", "hills", "nature"] },
  { name: "Alleppey", type: "city", state: "Kerala", country: "India", slug: "alleppey", emoji: "🛶", tags: ["backwaters", "houseboat"] },
  { name: "Kovalam", type: "city", state: "Kerala", country: "India", slug: "kovalam", emoji: "🏖️", tags: ["beach", "lighthouse"] },
  { name: "Wayanad", type: "city", state: "Kerala", country: "India", slug: "wayanad", emoji: "🌳", tags: ["wildlife", "nature", "tribe"] },
  { name: "Thekkady", type: "city", state: "Kerala", country: "India", slug: "thekkady", emoji: "🐘", tags: ["wildlife", "elephant"] },

  // ─ Maharashtra ─
  { name: "Mumbai", type: "city", state: "Maharashtra", country: "India", slug: "mumbai", emoji: "🏙️", tags: ["city", "bollywood", "gateway"] },
  { name: "Pune", type: "city", state: "Maharashtra", country: "India", slug: "pune", emoji: "🏯", tags: ["city", "forts"] },
  { name: "Lonavala", type: "city", state: "Maharashtra", country: "India", slug: "lonavala", emoji: "⛰️", tags: ["hill station", "monsoon"] },
  { name: "Mahabaleshwar", type: "city", state: "Maharashtra", country: "India", slug: "mahabaleshwar", emoji: "🍓", tags: ["strawberry", "hill station"] },

  // ─ Uttarakhand ─
  { name: "Uttarakhand", type: "state", country: "India", slug: "uttarakhand", emoji: "🏔️", tags: ["char dham", "mountains", "yoga"] },
  { name: "Rishikesh", type: "city", state: "Uttarakhand", country: "India", slug: "rishikesh", emoji: "🧘", tags: ["yoga", "rafting", "spirituality"] },
  { name: "Haridwar", type: "city", state: "Uttarakhand", country: "India", slug: "haridwar", emoji: "🙏", tags: ["pilgrimage", "ganga aarti"] },
  { name: "Nainital", type: "city", state: "Uttarakhand", country: "India", slug: "nainital", emoji: "🌊", tags: ["lake", "hill station"] },
  { name: "Mussoorie", type: "city", state: "Uttarakhand", country: "India", slug: "mussoorie", emoji: "🌁", tags: ["queen of hills", "hill station"] },
  { name: "Jim Corbett", type: "destination", state: "Uttarakhand", country: "India", slug: "jim-corbett", emoji: "🐯", tags: ["wildlife", "tiger", "safari"] },
  { name: "Auli", type: "city", state: "Uttarakhand", country: "India", slug: "auli", emoji: "⛷️", tags: ["skiing", "snow"] },

  // ─ Tamil Nadu ─
  { name: "Tamil Nadu", type: "state", country: "India", slug: "tamil-nadu", emoji: "🛕", tags: ["temples", "culture"] },
  { name: "Chennai", type: "city", state: "Tamil Nadu", country: "India", slug: "chennai", emoji: "🏙️", tags: ["gateway", "city", "marina beach"] },
  { name: "Ooty", type: "city", state: "Tamil Nadu", country: "India", slug: "ooty", emoji: "🌿", tags: ["hills", "tea gardens"] },
  { name: "Madurai", type: "city", state: "Tamil Nadu", country: "India", slug: "madurai", emoji: "🛕", tags: ["meenakshi temple", "heritage"] },
  { name: "Kodaikanal", type: "city", state: "Tamil Nadu", country: "India", slug: "kodaikanal", emoji: "⛰️", tags: ["princess of hills", "lakes"] },

  // ─ North East ─
  { name: "Sikkim", type: "state", country: "India", slug: "sikkim", emoji: "🌺", tags: ["mountains", "monastery", "flowers"] },
  { name: "Gangtok", type: "city", state: "Sikkim", country: "India", slug: "gangtok", emoji: "🏔️", tags: ["capital", "monasteries"] },
  { name: "Darjeeling", type: "city", state: "West Bengal", country: "India", slug: "darjeeling", emoji: "☕", tags: ["tea", "toy train", "kanchenjunga"] },
  { name: "Shillong", type: "city", state: "Meghalaya", country: "India", slug: "shillong", emoji: "🌧️", tags: ["scotland of east", "hills"] },
  { name: "Meghalaya", type: "state", country: "India", slug: "meghalaya", emoji: "🌧️", tags: ["living root bridges", "caves", "waterfalls"] },
  { name: "Kaziranga", type: "destination", state: "Assam", country: "India", slug: "kaziranga", emoji: "🦏", tags: ["one-horned rhino", "national park"] },

  // ─ International ─
  { name: "Maldives", type: "destination", country: "Maldives", slug: "maldives", emoji: "🏝️", tags: ["luxury", "overwater bungalow", "coral"] },
  { name: "Dubai", type: "city", country: "UAE", slug: "dubai", emoji: "🌆", tags: ["luxury", "shopping", "burj khalifa"] },
  { name: "Abu Dhabi", type: "city", country: "UAE", slug: "abu-dhabi", emoji: "🕌", tags: ["grand mosque", "formula 1"] },
  { name: "Singapore", type: "destination", country: "Singapore", slug: "singapore", emoji: "🦁", tags: ["garden city", "hawker", "marina bay"] },
  { name: "Thailand", type: "destination", country: "Thailand", slug: "thailand", emoji: "🏯", tags: ["temples", "beach", "street food"] },
  { name: "Bangkok", type: "city", country: "Thailand", slug: "bangkok", emoji: "🛺", tags: ["temples", "street food", "nightlife"] },
  { name: "Phuket", type: "city", country: "Thailand", slug: "phuket", emoji: "🏖️", tags: ["beach", "island", "diving"] },
  { name: "Krabi", type: "city", country: "Thailand", slug: "krabi", emoji: "🧗", tags: ["rock climbing", "beach"] },
  { name: "Paris", type: "city", country: "France", slug: "paris", emoji: "🗼", tags: ["eiffel", "romance", "fashion"] },
  { name: "London", type: "city", country: "UK", slug: "london", emoji: "☁️", tags: ["history", "buckingham", "thames"] },
  { name: "Switzerland", type: "destination", country: "Switzerland", slug: "switzerland", emoji: "🏔️", tags: ["alps", "chocolate", "skiing"] },
  { name: "Sri Lanka", type: "destination", country: "Sri Lanka", slug: "sri-lanka", emoji: "🦁", tags: ["culture", "tea", "beaches"] },
  { name: "Nepal", type: "destination", country: "Nepal", slug: "nepal", emoji: "🏔️", tags: ["everest", "trekking", "buddhism"] },
  { name: "Kathmandu", type: "city", country: "Nepal", slug: "kathmandu", emoji: "🛕", tags: ["temples", "culture"] },
  { name: "Vietnam", type: "destination", country: "Vietnam", slug: "vietnam", emoji: "🌾", tags: ["ha long bay", "culture", "street food"] },
  { name: "Japan", type: "destination", country: "Japan", slug: "japan", emoji: "⛩️", tags: ["sakura", "culture", "mt fuji"] },
  { name: "Tokyo", type: "city", country: "Japan", slug: "tokyo", emoji: "🗾", tags: ["anime", "technology", "food"] },
  { name: "Kyoto", type: "city", country: "Japan", slug: "kyoto", emoji: "⛩️", tags: ["temples", "geisha", "bamboo"] },
  { name: "Australia", type: "destination", country: "Australia", slug: "australia", emoji: "🦘", tags: ["opera house", "great barrier reef"] },
  { name: "Sydney", type: "city", country: "Australia", slug: "sydney", emoji: "🌉", tags: ["harbour bridge", "opera house"] },
  { name: "New Zealand", type: "destination", country: "New Zealand", slug: "new-zealand", emoji: "🥝", tags: ["fjords", "adventure", "lotr"] },
];

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  if (!q || q.length < 1) {
    // Return popular destinations when empty
    const popular = DESTINATIONS.filter((d) =>
      ["Bali", "Goa", "Rajasthan", "Maldives", "Manali", "Kerala"].includes(d.name)
    ).slice(0, 6);
    return NextResponse.json({ success: true, query: q, results: popular, popular: true });
  }

  const lower = q.toLowerCase();
  const words = lower.split(/\s+/);

  function score(dest: typeof DESTINATIONS[0]): number {
    const name = dest.name.toLowerCase();
    const state = ("state" in dest ? dest.state || "" : "").toLowerCase();
    const country = dest.country.toLowerCase();
    const tags = dest.tags.join(" ").toLowerCase();

    // Exact name match
    if (name === lower) return 100;
    // Starts with query
    if (name.startsWith(lower)) return 90;
    // All words match in name
    if (words.every((w) => name.includes(w))) return 80;
    // Any word matches name
    if (words.some((w) => name.includes(w))) return 70;
    // State match
    if (state.includes(lower)) return 60;
    if (words.some((w) => state.includes(w))) return 50;
    // Country match
    if (country.includes(lower)) return 40;
    // Tags match
    if (tags.includes(lower)) return 35;
    if (words.some((w) => tags.includes(w))) return 25;
    return 0;
  }

  const scored = DESTINATIONS
    .map((d) => ({ ...d, _score: score(d) }))
    .filter((d) => d._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 8);

  return NextResponse.json({ success: true, query: q, results: scored });
}
