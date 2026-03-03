export interface ObjectionPairData {
  myth: string;
  answer: string;
}

export interface ObjectionsData {
  title?: string;
  subtitle?: string;
  pairs: ObjectionPairData[];
}
