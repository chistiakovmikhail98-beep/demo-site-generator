// ============================================================
// Block System Types — mobile-first, variant-based, editable
// ============================================================

import { LucideIcon } from 'lucide-react';

// --- Legacy types (compat with old constants.tsx) ---

export interface NavItem {
  label: string;
  href: string;
}

export interface Advantage {
  id?: number;
  title: string;
  text: string;
  icon?: LucideIcon;
  image: string;
}

export interface Direction {
  id: string;
  title: string;
  image: string;
  description: string;
  tags: string[];
  level: string;
  duration: string;
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
  features?: string[];
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

// --- New Block System Types ---

export interface BlockProps<T = Record<string, unknown>> {
  data: T;
  editable?: boolean;
  onDataChange?: (data: T) => void;
  onCTAClick?: (action: string) => void;
  className?: string;
}

export type BlockType =
  | 'hero' | 'directions' | 'gallery' | 'instructors' | 'pricing'
  | 'stories' | 'director' | 'advantages' | 'atmosphere' | 'reviews'
  | 'faq' | 'objections' | 'requests' | 'progressTimeline' | 'calculator'
  | 'quiz';

export interface BlockConfig {
  type: BlockType;
  variant: 1 | 2 | 3;
  visible: boolean;
  order: number;
}

// --- Block-specific Data Interfaces ---

export interface HeroData {
  brandName: string;
  city?: string;
  heroTitle: string;
  heroSubtitle?: string;
  heroDescription?: string;
  heroImage: string;
  heroQuote?: string;
  advantages: string[];
  niche: string;
  buttonText?: string;
}

export interface DirectionItem {
  id: string;
  title: string;
  image: string;
  description: string;
  tags: string[];
  level?: string;
  duration: string;
  category: string;
  complexity: number;
  calories?: string;
  buttonText?: string;
}

export interface DirectionTab {
  key: string;
  label: string;
  category?: string;
}

export interface DirectionsData {
  title: string;
  subtitle?: string;
  directions: DirectionItem[];
  tabs?: DirectionTab[];
}

export interface GalleryData {
  images: string[];
  title?: string;
  subtitle?: string;
}

export interface InstructorData {
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
  instructors: InstructorData[];
  ctaTitle?: string;
  ctaDescription?: string;
}

export interface PricingData {
  title?: string;
  subtitle?: string;
  plans: PricingPlan[];
}

export interface StoryData {
  id: string;
  beforeImg: string;
  afterImg: string;
  title: string;
  description: string;
}

export interface StoriesData {
  title?: string;
  subtitle?: string;
  stories: StoryData[];
}

export interface DirectorData {
  name: string;
  title: string;
  description: string;
  image: string;
  achievements: string[];
}

export interface AdvantagesData {
  title?: string;
  subtitle?: string;
  advantages: Advantage[];
}

export interface AtmosphereItem {
  id: string;
  image: string;
  title: string;
  description: string;
}

export interface AtmosphereData {
  title?: string;
  subtitle?: string;
  items: AtmosphereItem[];
}

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

export interface FAQData {
  title?: string;
  subtitle?: string;
  items: FaqItem[];
}

export interface ObjectionPair {
  myth: string;
  answer: string;
}

export interface ObjectionsData {
  title?: string;
  subtitle?: string;
  pairs: ObjectionPair[];
}

export interface RequestItem {
  text: string;
  image?: string;
}

export interface RequestsData {
  title?: string;
  subtitle?: string;
  rows: RequestItem[][];
  buttonText?: string;
}

export interface CalculatorStage {
  id: string;
  title: string;
  description: string;
  tags: string[];
  achievements: string[];
  progress: number;
}

export interface CalculatorData {
  title?: string;
  subtitle?: string;
  stages: CalculatorStage[];
}

export interface QuizData {
  managerName: string;
  managerImage: string;
  tips: string[];
  steps: QuizQuestion[];
}

export interface TimelineStage {
  id: string;
  title: string;
  description: string;
  tags: string[];
  achievements: string[];
  stats: Record<string, number>;
}

export interface ProgressTimelineData {
  title?: string;
  subtitle?: string;
  stages: TimelineStage[];
}

export interface FooterData {
  phone?: string;
  email?: string;
  address?: string;
  addressDetails?: string;
  telegram?: string;
  vk?: string;
  instagram?: string;
  mapUrl?: string;
  mapCoords?: string;
  brandName: string;
}

export interface HeaderData {
  brandName: string;
  logo?: string;
  navItems: NavItem[];
}

// --- Site Data (single source of truth, replaces constants.tsx) ---

export interface SiteData {
  brand: {
    name: string;
    tagline?: string;
    niche: string;
    city?: string;
    logo?: string;
  };
  hero: HeroData;
  directions: DirectionsData;
  gallery: GalleryData;
  instructors: InstructorsData;
  pricing: PricingData;
  stories: StoriesData;
  director: DirectorData;
  advantages: AdvantagesData;
  atmosphere: AtmosphereData;
  reviews: ReviewsData;
  faq: FAQData;
  objections: ObjectionsData;
  requests: RequestsData;
  calculator: CalculatorData;
  quiz: QuizData;
  progressTimeline: ProgressTimelineData;
  footer: FooterData;
  header: HeaderData;
  layout: BlockConfig[];
}
