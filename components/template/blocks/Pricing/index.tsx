import PricingV1 from './PricingV1';
import PricingV2 from './PricingV2';
import PricingV3 from './PricingV3';
import type { BlockProps } from '../../types';
import type { PricingData } from './types';

export default function Pricing(props: BlockProps<PricingData> & { variant?: 1 | 2 | 3 }) {
  const { variant, ...rest } = props;
  switch (variant) {
    case 2: return <PricingV2 {...rest} />;
    case 3: return <PricingV3 {...rest} />;
    default: return <PricingV1 {...rest} />;
  }
}

export type { PricingData, PricingPlanItem } from './types';
