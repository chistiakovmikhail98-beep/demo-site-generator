import ReviewsV1 from './ReviewsV1';
import ReviewsV2 from './ReviewsV2';
import ReviewsV3 from './ReviewsV3';
import type { BlockProps } from '../../types';
import type { ReviewsData } from './types';

export default function Reviews(props: BlockProps<ReviewsData> & { variant?: 1 | 2 | 3 }) {
  const { variant, ...rest } = props;
  switch (variant) {
    case 2: return <ReviewsV2 {...rest} />;
    case 3: return <ReviewsV3 {...rest} />;
    default: return <ReviewsV1 {...rest} />;
  }
}

export type { ReviewsData } from './types';
