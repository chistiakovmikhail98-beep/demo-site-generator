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
