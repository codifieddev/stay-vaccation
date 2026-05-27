export interface LocationsHeroData {
  badge: string;
  image: string;
  titles: {
    india: string;
    international: string;
    default: string;
  };
  subtitle: string;
}

export const locationsHeroData: LocationsHeroData = {
  badge: "Discovery",
  image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1800&auto=format&fit=crop&q=80",
  titles: {
    india: "Destinations in India",
    international: "International Destinations",
    default: "Explore the World",
  },
  subtitle: "Discover breathtaking landscapes, vibrant cultures, and hidden gems across the globe.",
};
