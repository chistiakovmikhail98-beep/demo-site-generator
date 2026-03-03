export interface RequestItemData {
  text: string;
  image?: string;
}

export interface RequestsData {
  title?: string;
  subtitle?: string;
  rows: RequestItemData[][];
  buttonText?: string;
}
