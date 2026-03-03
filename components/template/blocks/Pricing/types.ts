export interface PricingPlanItem {
  id: string;
  name: string;
  price: string;
  validity?: string;
  classes?: string;
  pricePerClass?: string;
  targetAudience?: string;
  isPopular?: boolean;
  features?: string[];
}

export interface PricingData {
  title?: string;
  subtitle?: string;
  plans: PricingPlanItem[];
}
