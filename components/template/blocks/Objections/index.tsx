import ObjectionsV1 from './ObjectionsV1';
import ObjectionsV2 from './ObjectionsV2';
import ObjectionsV3 from './ObjectionsV3';
import type { BlockProps } from '../../types';
import type { ObjectionsData } from './types';

export default function Objections(props: BlockProps<ObjectionsData> & { variant?: 1 | 2 | 3 }) {
  const { variant, ...rest } = props;
  switch (variant) {
    case 2: return <ObjectionsV2 {...rest} />;
    case 3: return <ObjectionsV3 {...rest} />;
    default: return <ObjectionsV1 {...rest} />;
  }
}

export type { ObjectionsData, ObjectionPairData } from './types';
