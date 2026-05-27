export interface Category {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  color?: string;
  gradient?: string;
  image?: string;
  link?: string;
  order?: number;
  displayOrder?: number;
  shortLocationList?: string;
}

export interface CategoriesState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}
