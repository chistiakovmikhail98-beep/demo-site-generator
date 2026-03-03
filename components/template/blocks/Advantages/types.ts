export interface AdvantageItemData {
  id?: string;
  title: string;
  text: string;
  icon?: string;
  image?: string;
}

export interface AdvantagesData {
  title?: string;
  subtitle?: string;
  advantages: AdvantageItemData[];
}
