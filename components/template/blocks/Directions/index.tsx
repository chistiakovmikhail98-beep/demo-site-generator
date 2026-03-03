import React from 'react';
import DirectionsV1 from './DirectionsV1';
import DirectionsV2 from './DirectionsV2';
import DirectionsV3 from './DirectionsV3';
import type { BlockProps } from '../../types';
import type { DirectionsData } from './types';

export default function Directions({ variant, ...rest }: BlockProps<DirectionsData> & { variant?: 1 | 2 | 3 }) {
  switch (variant) {
    case 2: return <DirectionsV2 {...rest} />;
    case 3: return <DirectionsV3 {...rest} />;
    default: return <DirectionsV1 {...rest} />;
  }
}

export type { DirectionsData, DirectionItem } from './types';
