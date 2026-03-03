export interface ReviewItem {
  id: string;
  name: string;
  text: string;
  rating: number;
  source?: string;
  date?: string;
}

export interface ReviewsData {
  title?: string;
  subtitle?: string;
  reviews: ReviewItem[];
}
