// ============================================================
// Shared types for the Next.js app (SiteConfig from Supabase)
// Migrated from server/types.ts
// ============================================================

export type Niche = 'fitness' | 'dance' | 'stretching' | 'yoga' | 'wellness';
export type DirectionCategory = 'dance' | 'body' | 'beginner' | 'special' | 'wellness' | 'online';

export interface SiteConfig {
  meta: {
    projectId: string;
    slug: string;
    createdAt: string;
  };

  brand: {
    name: string;
    tagline: string;
    niche: Niche;
    city?: string;
    logo?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    heroDescription?: string;
    heroImage?: string;
    heroQuote?: string;
  };

  sections: {
    heroAdvantages: string[];
    directions: Direction[];
    instructors: Instructor[];
    stories: Story[];
    faq: FaqItem[];
    requests: RequestItem[];
    objections: Objection[];
    advantages: Advantage[];
    director: Director;
    contacts: Contacts;
    pricing: PricingPlan[];
    reviews: Review[];
    gallery: string[];
    quiz: QuizConfig;
    atmosphere: AtmosphereStep[];
    calculatorStages?: CalculatorStage[];
    sectionTitles?: SectionTitles;
    directionsTabs?: DirectionTab[];
    colorScheme?: ColorScheme;
    blockVariants?: Record<string, 1 | 2 | 3>;
  };
}

export interface Direction {
  id: string;
  title: string;
  image: string;
  description: string;
  tags: string[];
  level: string;
  duration: string;
  category: DirectionCategory;
  complexity?: number;
  buttonText?: string;
}

export interface Instructor {
  name: string;
  image: string;
  specialties: string[];
  experience: string;
  style: string;
}

export interface Story {
  beforeImg: string;
  afterImg: string;
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface RequestItem {
  image: string;
  text: string;
}

export interface Objection {
  myth: string;
  answer: string;
}

export interface Advantage {
  title: string;
  text: string;
  image: string;
}

export interface Director {
  name: string;
  title: string;
  description: string;
  achievements: string[];
  image: string;
}

export interface Contacts {
  phone?: string;
  email?: string;
  address?: string;
  addressDetails?: string;
  telegram?: string;
  whatsapp?: string;
  vk?: string;
  instagram?: string;
  mapUrl?: string;
  mapCoords?: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  features: string[];
  highlighted?: boolean;
  category?: string;
}

export interface Review {
  name: string;
  text: string;
  source?: string;
  rating?: number;
  date?: string;
}

export interface QuizStep {
  question: string;
  options: string[];
}

export interface QuizConfig {
  managerName: string;
  managerImage: string;
  tips: string[];
  steps: QuizStep[];
}

export interface AtmosphereStep {
  title: string;
  description: string;
  image: string;
}

export interface CalculatorStage {
  status: string;
  description: string;
  tags: string[];
  achievement: string;
}

// Flexible section titles — AI or builder can set any section's titles
export interface SectionTitles {
  calculator?: { title?: string; subtitle?: string; buttonText?: string };
  directions?: { title?: string; subtitle?: string };
  pricing?: { title?: string; subtitle?: string };
  instructors?: { title?: string; ctaTitle?: string; ctaDescription?: string };
  stories?: { title?: string; subtitle?: string };
  atmosphere?: { title?: string; subtitle?: string };
  reviews?: { title?: string; subtitle?: string };
  faq?: { title?: string; subtitle?: string };
  requests?: { title?: string; buttonText?: string };
}

export interface DirectionTab {
  key: string;
  label: string;
  category?: string;
}

export interface ColorScheme {
  primary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
}

// Project record from Supabase
export interface Project {
  id: string;
  name: string;
  slug?: string;
  niche: Niche;
  status: 'pending' | 'processing' | 'building' | 'deploying' | 'completed' | 'failed';
  site_config?: SiteConfig;
  deployed_url?: string;
  error?: string;
  edit_password_hash?: string;
  edit_password_plain?: string;
  theme?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Admin config injected into client-side
export interface AdminConfig {
  apiUrl: string;
  projectId: string;
  slug: string;
}
