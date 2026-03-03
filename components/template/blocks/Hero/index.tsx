import HeroV1 from './HeroV1';
import HeroV2 from './HeroV2';
import HeroV3 from './HeroV3';
import type { BlockProps } from '../../types';
import type { HeroData } from './types';

export default function Hero({ variant, ...rest }: BlockProps<HeroData> & { variant?: 1 | 2 | 3 }) {
  switch (variant) {
    case 2: return <HeroV2 {...rest} />;
    case 3: return <HeroV3 {...rest} />;
    default: return <HeroV1 {...rest} />;
  }
}

export type { HeroData } from './types';
