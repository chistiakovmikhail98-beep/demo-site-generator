import QuizV1 from './QuizV1';
import type { BlockProps, QuizData } from '../../types';

interface QuizBlockProps extends BlockProps<QuizData> {
  onAnswersUpdate?: (answers: Record<string, string>) => void;
}

export default function Quiz(props: QuizBlockProps & { variant?: 1 | 2 | 3 }) {
  const { variant, ...rest } = props;
  return <QuizV1 {...rest} />;
}

export type { QuizData };
