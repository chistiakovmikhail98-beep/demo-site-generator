import FAQV1 from './FAQV1';
import FAQV2 from './FAQV2';
import FAQV3 from './FAQV3';
import type { BlockProps } from '../../types';
import type { FAQData } from './types';

export default function FAQ(props: BlockProps<FAQData> & { variant?: 1 | 2 | 3 }) {
  const { variant, ...rest } = props;
  switch (variant) {
    case 2: return <FAQV2 {...rest} />;
    case 3: return <FAQV3 {...rest} />;
    default: return <FAQV1 {...rest} />;
  }
}

export type { FAQData, FaqItemData } from './types';
