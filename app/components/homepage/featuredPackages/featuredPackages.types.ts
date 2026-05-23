export interface PriceInfo {
  amount: number;
  currency: string;
  originalAmount?: number;
}

export interface Package {
  id: string;
  packageId: string;
  title: string;
  slug: string;
  image: string;
  rating: number;
  duration: string;
  price: PriceInfo;
  maxGuests: number;
  displayOrder?: number;
}

export interface FeaturedData {
  sectionTitle: string;
  sectionSubtitle: string;
  isActive: boolean;
  displayOrder: number;
  packages: Package[];
}
