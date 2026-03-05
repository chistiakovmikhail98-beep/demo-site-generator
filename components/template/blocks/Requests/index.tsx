import RequestsV1 from './RequestsV1';
import RequestsV2 from './RequestsV2';
import RequestsV3 from './RequestsV3';
import type { BlockProps } from '../../types';
import type { RequestsData } from './types';

export default function Requests(props: BlockProps<RequestsData> & { variant?: 1 | 2 | 3 }) {
  const { variant, ...rest } = props;
  switch (variant) {
    case 2: return <RequestsV2 {...rest} />;
    case 3: return <RequestsV3 {...rest} />;
    default: return <RequestsV1 {...rest} />;
  }
}

export type { RequestsData } from './types';
