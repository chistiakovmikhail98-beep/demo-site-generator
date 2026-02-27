import React from 'react';
import type { BlockConfig, BlockProps } from '../types';
import { VARIANT_NAMES } from './admin/BlockManager';

// Migrated blocks (variant system)
import Hero from './blocks/Hero';
import Directions from './blocks/Directions';
import Gallery from './blocks/Gallery';
import Instructors from './blocks/Instructors';
import Stories from './blocks/Stories';
import Reviews from './blocks/Reviews';
import Director from './blocks/Director';
import Pricing from './blocks/Pricing';
import FAQ from './blocks/FAQ';
import Objections from './blocks/Objections';
import Requests from './blocks/Requests';
import Advantages from './blocks/Advantages';
import Atmosphere from './blocks/Atmosphere';
import Quiz from './blocks/Quiz';
import Calculator from './blocks/Calculator';
import ProgressTimeline from './blocks/ProgressTimeline';

const BLOCK_LABELS: Record<string, string> = {
  hero: 'Главная',
  gallery: 'Галерея',
  quiz: 'Квиз',
  requests: 'Запросы',
  progressTimeline: 'Прогресс',
  directions: 'Направления',
  director: 'Руководитель',
  atmosphere: 'Атмосфера',
  instructors: 'Тренеры',
  stories: 'Истории',
  reviews: 'Отзывы',
  calculator: 'Калькулятор',
  advantages: 'Преимущества',
  pricing: 'Тарифы',
  objections: 'Возражения',
  faq: 'FAQ',
};

const SINGLE_VARIANT_BLOCKS = ['quiz', 'calculator', 'progressTimeline'];

interface BlockRendererProps {
  config: BlockConfig;
  data: any;
  editable?: boolean;
  onDataChange?: (data: any) => void;
  onCTAClick?: (action: string) => void;
  onVariantChange?: (variant: 1 | 2 | 3) => void;
  quizAnswersUpdate?: (answers: Record<string, string>) => void;
}

const BlockRenderer: React.FC<BlockRendererProps> = ({
  config,
  data,
  editable,
  onDataChange,
  onCTAClick,
  onVariantChange,
  quizAnswersUpdate,
}) => {
  if (config.visible === false) return null;

  const props: BlockProps<any> = {
    data,
    editable,
    onDataChange,
    onCTAClick,
  };

  let blockContent: React.ReactNode;

  switch (config.type) {
    case 'hero':
      blockContent = <Hero {...props} variant={config.variant} />;
      break;
    case 'directions':
      blockContent = <Directions {...props} variant={config.variant} />;
      break;
    case 'gallery':
      blockContent = <Gallery {...props} variant={config.variant} />;
      break;
    case 'instructors':
      blockContent = <Instructors {...props} variant={config.variant} />;
      break;
    case 'stories':
      blockContent = <Stories {...props} variant={config.variant} />;
      break;
    case 'reviews':
      blockContent = <Reviews {...props} variant={config.variant} />;
      break;
    case 'director':
      blockContent = <Director {...props} variant={config.variant} />;
      break;
    case 'pricing':
      blockContent = <Pricing {...props} variant={config.variant} />;
      break;
    case 'faq':
      blockContent = <FAQ {...props} variant={config.variant} />;
      break;
    case 'objections':
      blockContent = <Objections {...props} variant={config.variant} />;
      break;
    case 'requests':
      blockContent = <Requests {...props} variant={config.variant} />;
      break;
    case 'advantages':
      blockContent = <Advantages {...props} variant={config.variant} />;
      break;
    case 'atmosphere':
      blockContent = <Atmosphere {...props} variant={config.variant} />;
      break;
    case 'quiz':
      blockContent = <Quiz {...props} onAnswersUpdate={quizAnswersUpdate} />;
      break;
    case 'calculator':
      blockContent = <Calculator {...props} />;
      break;
    case 'progressTimeline':
      blockContent = <ProgressTimeline {...props} />;
      break;
    default:
      return null;
  }

  // data-block attribute for scroll-to from sidebar
  const blockAttr = { 'data-block': config.type };

  // Edit mode: minimal label bar (variant controls are in the sidebar)
  if (editable) {
    const variantNames = VARIANT_NAMES[config.type];
    const currentName = variantNames ? variantNames[config.variant - 1] : null;
    const hasManyVariants = !SINGLE_VARIANT_BLOCKS.includes(config.type);

    return (
      <div className="relative group/block" {...blockAttr}>
        {/* Minimal edit label */}
        <div className="sticky top-0 z-40 bg-zinc-900/80 backdrop-blur-sm px-4 py-1 flex items-center gap-2 border-b border-zinc-700/40">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            {BLOCK_LABELS[config.type] || config.type}
          </span>
          {hasManyVariants && currentName && (
            <span className="text-[10px] text-zinc-600">
              — {currentName}
            </span>
          )}
        </div>

        {blockContent}
      </div>
    );
  }

  return <div {...blockAttr}>{blockContent}</div>;
};

export default BlockRenderer;
