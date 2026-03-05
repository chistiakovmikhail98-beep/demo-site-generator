import CalculatorV1 from './CalculatorV1';
import type { BlockProps } from '../../types';
import type { CalculatorData } from './types';

export default function Calculator(props: BlockProps<CalculatorData> & { variant?: 1 | 2 | 3 }) {
  const { variant, ...rest } = props;
  return <CalculatorV1 {...rest} />;
}

export type { CalculatorData };
