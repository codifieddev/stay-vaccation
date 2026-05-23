export interface Package {
  id: string;
  _id?: string;
  slug?: string;
  title: string;
  destination: string;
  destinationId?: string;
  destinationSlug?: string;
  categoryId?: string;
  categorySlug?: string;
  tripDuration: string;
  travelStyle: string;
  tourType?: string;
  price: {
    currency: string;
    amount: number | string;
    originalAmount?: number;
  };
  rating?: number;
  shortDescription: string;
  images?: string[];
  maxTravelersLimit?: number;
  availableSeats?: number;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SortOption {
  value: string;
  label: string;
}
