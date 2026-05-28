export const CATEGORY_ICON_MAP: Record<string, string> = {
  "Beach & Islands": "Waves",
  "Heritage & Culture": "Landmark",
  "Adventure Sports": "Mountain",
  "Wildlife & Nature": "Leaf",
  "Honeymoon": "Heart",
  "Family Tours": "Users",
  "Relaxation & Wellness": "Wind",
  "Religious & Spiritual": "Compass",
};

export const CATEGORY_FALLBACK_IMAGE_MAP: Record<string, string> = {
  "Beach & Islands": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
  "Heritage & Culture": "https://images.unsplash.com/photo-1590050752117-238cb0612b1b?w=800&auto=format&fit=crop&q=80",
  "Adventure Sports": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80",
  "Wildlife & Nature": "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&auto=format&fit=crop&q=80",
  "Honeymoon": "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
  "Family Tours": "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&auto=format&fit=crop&q=80",
  "Relaxation & Wellness": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",
  "Religious & Spiritual": "https://images.unsplash.com/photo-1609137144813-2d2c161ab728?w=800&auto=format&fit=crop&q=80",
};

export const EMOJI_ICON_MAP: Record<string, string> = {
  "🏖️": "Waves",
  "🏛️": "Landmark",
  "🧗": "Mountain",
  "🦁": "Leaf",
  "💑": "Heart",
  "👨‍👩‍👧": "Users",
  "🧘": "Wind",
  "🕌": "Compass",
};

export function getCategoryIcon(name: string, fallback: string = "Map"): string {
  // If the fallback (stored icon) is a known emoji, map it to a Lucide icon
  if (fallback && EMOJI_ICON_MAP[fallback]) {
    return EMOJI_ICON_MAP[fallback];
  }

  // If the fallback starts with uppercase and is alphanumeric, it is likely a custom Lucide name
  if (fallback && /^[A-Z][a-zA-Z0-9]*$/.test(fallback)) {
    return fallback;
  }

  if (!name) return fallback || "Map";
  
  // Try exact match first
  if (CATEGORY_ICON_MAP[name]) return CATEGORY_ICON_MAP[name];

  // Try partial matches (case-insensitive)
  const lowerName = name.toLowerCase();
  if (lowerName.includes("beach")) return "Waves";
  if (lowerName.includes("culture") || lowerName.includes("heritage")) return "Landmark";
  if (lowerName.includes("adventure")) return "Mountain";
  if (lowerName.includes("wildlife") || lowerName.includes("nature")) return "Leaf";
  if (lowerName.includes("honeymoon")) return "Heart";
  if (lowerName.includes("family")) return "Users";
  if (lowerName.includes("wellness") || lowerName.includes("relaxation")) return "Wind";
  if (lowerName.includes("religious") || lowerName.includes("spiritual")) return "Compass";

  return "Map";
}

export function getCategoryFallbackImage(name: string, fallback: string = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80"): string {
  if (!name) return fallback;
  
  // Try exact match first
  if (CATEGORY_FALLBACK_IMAGE_MAP[name]) return CATEGORY_FALLBACK_IMAGE_MAP[name];

  // Try partial matches (case-insensitive)
  const lowerName = name.toLowerCase();
  if (lowerName.includes("beach")) return CATEGORY_FALLBACK_IMAGE_MAP["Beach & Islands"];
  if (lowerName.includes("culture") || lowerName.includes("heritage")) return CATEGORY_FALLBACK_IMAGE_MAP["Heritage & Culture"];
  if (lowerName.includes("adventure")) return CATEGORY_FALLBACK_IMAGE_MAP["Adventure Sports"];
  if (lowerName.includes("wildlife") || lowerName.includes("nature")) return CATEGORY_FALLBACK_IMAGE_MAP["Wildlife & Nature"];
  if (lowerName.includes("honeymoon")) return CATEGORY_FALLBACK_IMAGE_MAP["Honeymoon"];
  if (lowerName.includes("family")) return CATEGORY_FALLBACK_IMAGE_MAP["Family Tours"];
  if (lowerName.includes("wellness") || lowerName.includes("relaxation")) return CATEGORY_FALLBACK_IMAGE_MAP["Relaxation & Wellness"];
  if (lowerName.includes("religious") || lowerName.includes("spiritual")) return CATEGORY_FALLBACK_IMAGE_MAP["Religious & Spiritual"];

  return fallback;
}
