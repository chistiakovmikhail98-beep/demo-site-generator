import QuizV1 from './QuizV1';
import type { BlockProps, QuizData } from '../../types';

interface QuizBlockProps extends BlockProps<QuizData> {
  onAnswersUpdate?: (answers: Record<string, string>) => void;
}

export default function Quiz({ variant, ...rest }: QuizBlockProps & { variant?: 1 | 2 | 3 }) {
  return <QuizV1 {...rest} />;
}

export type { QuizData };
