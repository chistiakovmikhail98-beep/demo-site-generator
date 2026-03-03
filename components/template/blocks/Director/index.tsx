import DirectorV1 from './DirectorV1';
import DirectorV2 from './DirectorV2';
import DirectorV3 from './DirectorV3';
import type { BlockProps } from '../../types';
import type { DirectorData } from './types';

export default function Director({ variant, ...rest }: BlockProps<DirectorData> & { variant?: 1 | 2 | 3 }) {
  switch (variant) {
    case 2: return <DirectorV2 {...rest} />;
    case 3: return <DirectorV3 {...rest} />;
    default: return <DirectorV1 {...rest} />;
  }
}

export type { DirectorData } from './types';
