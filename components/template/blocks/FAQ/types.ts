export interface FaqItemData {
  question: string;
  answer: string;
}

export interface FAQData {
  title?: string;
  subtitle?: string;
  items: FaqItemData[];
}
