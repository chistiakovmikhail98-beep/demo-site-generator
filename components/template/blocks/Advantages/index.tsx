import AdvantagesV1 from './AdvantagesV1';
import AdvantagesV2 from './AdvantagesV2';
import AdvantagesV3 from './AdvantagesV3';
import type { BlockProps } from '../../types';
import type { AdvantagesData } from './types';

export default function Advantages(props: BlockProps<AdvantagesData> & { variant?: 1 | 2 | 3 }) {
  const { variant, ...rest } = props;
  switch (variant) {
    case 2: return <AdvantagesV2 {...rest} />;
    case 3: return <AdvantagesV3 {...rest} />;
    default: return <AdvantagesV1 {...rest} />;
  }
}

export type { AdvantagesData } from './types';
