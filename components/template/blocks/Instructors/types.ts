export interface InstructorItem {
  id: string;
  name: string;
  image: string;
  specialties: string[];
  experience: string;
  style?: string;
  quote?: string;
  instagram?: string;
  isFounder?: boolean;
}

export interface InstructorsData {
  title?: string;
  subtitle?: string;
  instructors: InstructorItem[];
  ctaTitle?: string;
  ctaDescription?: string;
}
