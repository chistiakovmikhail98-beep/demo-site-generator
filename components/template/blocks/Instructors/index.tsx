import InstructorsV1 from './InstructorsV1';
import InstructorsV2 from './InstructorsV2';
import InstructorsV3 from './InstructorsV3';
import type { BlockProps } from '../../types';
import type { InstructorsData } from './types';

export default function Instructors({ variant, ...rest }: BlockProps<InstructorsData> & { variant?: 1 | 2 | 3 }) {
  switch (variant) {
    case 2: return <InstructorsV2 {...rest} />;
    case 3: return <InstructorsV3 {...rest} />;
    default: return <InstructorsV1 {...rest} />;
  }
}

export type { InstructorsData } from './types';
