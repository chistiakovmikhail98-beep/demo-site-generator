export type { QuizData, QuizQuestion } from '../../types';

/** Internal step representation used by the Quiz component */
export interface QuizStep {
  id: number;
  key: string;
  title: string;
  subtitle?: string;
  options: string[];
}
