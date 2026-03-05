import GalleryV1 from './GalleryV1';
import GalleryV2 from './GalleryV2';
import GalleryV3 from './GalleryV3';
import type { BlockProps } from '../../types';
import type { GalleryData } from './types';

export default function Gallery(props: BlockProps<GalleryData> & { variant?: 1 | 2 | 3 }) {
  const { variant, ...rest } = props;
  switch (variant) {
    case 2: return <GalleryV2 {...rest} />;
    case 3: return <GalleryV3 {...rest} />;
    default: return <GalleryV1 {...rest} />;
  }
}

export type { GalleryData } from './types';
