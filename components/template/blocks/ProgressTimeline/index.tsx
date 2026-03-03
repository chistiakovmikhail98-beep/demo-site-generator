import ProgressTimelineV1 from './ProgressTimelineV1';
import type { BlockProps } from '../../types';
import type { ProgressTimelineData } from './types';

export default function ProgressTimeline({ variant, ...rest }: BlockProps<ProgressTimelineData> & { variant?: 1 | 2 | 3 }) {
  return <ProgressTimelineV1 {...rest} />;
}

export type { ProgressTimelineData };
