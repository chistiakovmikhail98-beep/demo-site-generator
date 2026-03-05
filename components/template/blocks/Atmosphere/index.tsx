import AtmosphereV1 from './AtmosphereV1';
import AtmosphereV2 from './AtmosphereV2';
import AtmosphereV3 from './AtmosphereV3';
import type { BlockProps } from '../../types';
import type { AtmosphereData } from './types';

export default function Atmosphere(props: BlockProps<AtmosphereData> & { variant?: 1 | 2 | 3 }) {
  const { variant, ...rest } = props;
  switch (variant) {
    case 2: return <AtmosphereV2 {...rest} />;
    case 3: return <AtmosphereV3 {...rest} />;
    default: return <AtmosphereV1 {...rest} />;
  }
}

export type { AtmosphereData } from './types';
