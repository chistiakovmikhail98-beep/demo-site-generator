import ProgressTimelineV1 from './ProgressTimelineV1';
import type { BlockProps } from '../../types';
import type { ProgressTimelineData } from './types';

export default function ProgressTimeline(props: BlockProps<ProgressTimelineData> & { variant?: 1 | 2 | 3 }) {
  const { variant, ...rest } = props;
  return <ProgressTimelineV1 {...rest} />;
}

export type { ProgressTimelineData };
