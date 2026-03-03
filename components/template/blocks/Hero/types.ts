export interface HeroStat {
  value: string;
  label: string;
}

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
  heroStats?: HeroStat[];
}
