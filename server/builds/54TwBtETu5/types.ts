
import { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
}

export interface Advantage {
  id?: number; // Optional as index can be used
  title: string;
  text: string;
  icon?: LucideIcon; // Keeping optional for backward compatibility
  image: string;     // Added image
}

export interface Direction {
  id: string;
  title: string;
  image: string;
  description: string;
  tags: string[];
  level: string;
  duration: string;
  // Updated category type to include all possible values used in constants.tsx
  category: 'dance' | 'body' | 'beginner' | 'special' | 'wellness' | 'online';
  complexity?: number;
  calories?: string;
  buttonText?: string;
}

export interface Instructor {
  id: number;
  name: string;
  image: string;
  specialties: string[];
  experience: string;
  style: string;
}

export interface Story {
  id: number;
  beforeImg: string;
  afterImg: string;
  title: string;
  description: string;
}

export interface PricingPlan {
  id: number;
  name: string;
  price: string;
  validity: string;
  classes: number;
  pricePerClass: string;
  targetAudience: string;
  isPopular?: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
}
