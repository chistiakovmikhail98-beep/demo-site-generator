import StoriesV1 from './StoriesV1';
import StoriesV2 from './StoriesV2';
import StoriesV3 from './StoriesV3';
import type { BlockProps } from '../../types';
import type { StoriesData } from './types';

export default function Stories(props: BlockProps<StoriesData> & { variant?: 1 | 2 | 3 }) {
  const { variant, ...rest } = props;
  switch (variant) {
    case 2: return <StoriesV2 {...rest} />;
    case 3: return <StoriesV3 {...rest} />;
    default: return <StoriesV1 {...rest} />;
  }
}

export type { StoriesData } from './types';
