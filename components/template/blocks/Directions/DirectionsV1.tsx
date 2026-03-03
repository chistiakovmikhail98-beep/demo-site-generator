import React, { useState, useMemo } from 'react';
import Section from '../../Section';
import Button from '../../Button';
import EditableText from '../../ui/EditableText';
import EditableImage from '../../ui/EditableImage';
import EditableList from '../../ui/EditableList';
import { isPlaceholder } from '../../PlaceholderImg';
import { Clock, Zap, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { DirectionsData, DirectionItem, DirectionTab } from './types';

const DEFAULT_TABS: DirectionTab[] = [
  { key: 'all', label: 'Все' },
];

const INITIAL_VISIBLE = 6;

export default function DirectionsV1({ data, editable, onDataChange, onCTAClick }: BlockProps<DirectionsData>) {
  const [activeTabKey, setActiveTabKey] = useState('all');
  const [showAll, setShowAll] = useState(false);

  const tabs = useMemo(() => {
    const base: DirectionTab[] = data.tabs && data.tabs.length > 0
      ? data.tabs
      : DEFAULT_TABS;

    // Only show tabs that have matching directions (except "all")
    return base.filter(tab => {
      if (tab.key === 'all') return true;
      return data.directions.some(d => d.category === tab.category);
    });
  }, [data.tabs, data.directions]);

  const activeTab = tabs.find(t => t.key === activeTabKey) || tabs[0];

  const filtered = useMemo(() => {
    if (activeTabKey === 'all') return data.directions;
    return data.directions.filter(d => d.category === activeTab?.category);
  }, [activeTabKey, activeTab, data.directions]);

  const displayed = showAll ? filtered : filtered.slice(0, INITIAL_VISIBLE);
  const hasMore = filtered.length > INITIAL_VISIBLE;

  const updateDirection = (index: number, updated: DirectionItem) => {
    if (!onDataChange) return;
    const dirs = [...data.directions];
    // Find actual index in full array
    const realIndex = data.directions.indexOf(filtered[index]);
    if (realIndex >= 0) {
      dirs[realIndex] = updated;
      onDataChange({ ...data, directions: dirs });
    }
  };

  return (
    <Section id="directions" className="bg-zinc-900/50">
      {/* Header */}
      <div className="mb-8 sm:mb-12">
        <EditableText
          value={data.title}
          onChange={v => onDataChange?.({ ...data, title: v })}
          editable={editable}
          as="h2"
          className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white mb-2 sm:mb-3 uppercase tracking-tight leading-[0.95]"
        />
        {data.subtitle && (
          <EditableText
            value={data.subtitle}
            onChange={v => onDataChange?.({ ...data, subtitle: v })}
            editable={editable}
            as="p"
            className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-zinc-400 uppercase tracking-tight leading-[0.95]"
          />
        )}

        {/* Filter Tabs */}
        {tabs.length > 1 && (
          <div className="flex flex-wrap gap-2 sm:gap-3 mt-6 sm:mt-8">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTabKey(tab.key);
                  setShowAll(false);
                }}
                className={`
                  px-4 py-2.5 sm:px-5 sm:py-3 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide
                  transition-all duration-200 border-2 min-h-[44px]
                  ${activeTabKey === tab.key
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                    : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-400 hover:text-white'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Card Grid */}
      <EditableList
        items={displayed}
        onItemsChange={editable ? (items) => {
          // Reconstruct the full directions array with modified filtered items
          const newDirections = [...data.directions];
          items.forEach((item, i) => {
            const realIndex = data.directions.indexOf(filtered[i]);
            if (realIndex >= 0) newDirections[realIndex] = item;
          });
          onDataChange?.({ ...data, directions: newDirections });
        } : undefined}
        editable={editable}
        renderItem={(dir, index, onChange) => (
          <DirectionCard
            key={dir.id}
            item={dir}
            editable={editable}
            onChange={onChange}
            onCTAClick={onCTAClick}
            isPopular={index === 0}
          />
        )}
        createNewItem={() => ({
          id: `dir-${Date.now()}`,
          title: 'Новое направление',
          image: '',
          description: 'Описание направления',
          tags: ['Тег'],
          duration: '60 мин',
          category: 'dance',
          complexity: 3,
        })}
        maxItems={12}
        addButtonText="Добавить направление"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      />

      {/* Show All Toggle */}
      {hasMore && !editable && (
        <div className="mt-8 sm:mt-12 flex justify-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-zinc-800 border border-zinc-700 rounded-full text-white font-bold uppercase tracking-widest text-xs hover:border-primary hover:text-primary transition-all shadow-sm min-h-[44px]"
          >
            {showAll ? (
              <>Скрыть часть <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>Посмотреть все ({filtered.length}) <ChevronDown className="w-4 h-4" /></>
            )}
          </button>
        </div>
      )}
    </Section>
  );
}


/* ---- Direction Card ---- */
interface CardProps {
  item: DirectionItem;
  editable?: boolean;
  onChange: (updated: DirectionItem) => void;
  onCTAClick?: (action: string) => void;
  isPopular?: boolean;
}

function DirectionCard({ item, editable, onChange, onCTAClick, isPopular }: CardProps) {
  const placeholder = isPlaceholder(item.image);

  return (
    <div className="group flex flex-col bg-zinc-800/80 border border-zinc-700/50 rounded-2xl overflow-hidden hover:border-zinc-600 transition-all duration-300">
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden relative m-2 rounded-t-[1.4rem] rounded-b-xl">
        {isPopular && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-amber-400 text-zinc-900 text-[10px] sm:text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full shadow-lg">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            Популярное
          </div>
        )}

        {editable ? (
          <EditableImage
            src={item.image || ''}
            alt={item.title}
            onImageChange={src => onChange({ ...item, image: src })}
            editable
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : placeholder ? (
          <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
            <span className="text-zinc-500 font-bold text-sm uppercase tracking-wider text-center px-4">
              {item.title}
            </span>
          </div>
        ) : (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 pt-2 flex flex-col flex-grow">
        {/* Meta Pills */}
        <div className="flex gap-2 mb-3 sm:mb-4">
          {/* Duration */}
          <div className="bg-zinc-700/50 rounded-xl px-3 py-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-500 flex-shrink-0" />
            <EditableText
              value={item.duration}
              onChange={v => onChange({ ...item, duration: v })}
              editable={editable}
              as="span"
              className="text-xs font-semibold text-zinc-400 whitespace-nowrap"
            />
          </div>

          {/* Complexity */}
          <div className="bg-zinc-700/50 rounded-xl px-3 py-2 flex items-center gap-2 flex-grow">
            <Zap className="w-3 h-3 text-orange-400 flex-shrink-0" />
            <span className="text-[10px] text-zinc-500 font-medium hidden sm:inline">Интенсивность</span>
            <div className="flex gap-0.5 ml-auto">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i < (item.complexity || 0)
                      ? 'bg-zinc-300'
                      : 'border border-zinc-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="mb-2 sm:mb-3 text-xs text-zinc-400 leading-relaxed">
            {item.tags.join(' \u00b7 ')}
          </div>
        )}

        {/* Title */}
        <EditableText
          value={item.title}
          onChange={v => onChange({ ...item, title: v })}
          editable={editable}
          as="h3"
          className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 leading-tight"
        />

        {/* Description */}
        <EditableText
          value={item.description}
          onChange={v => onChange({ ...item, description: v })}
          editable={editable}
          as="p"
          multiline
          className="text-zinc-400 text-sm leading-relaxed mb-6 sm:mb-8 line-clamp-3 flex-grow"
        />

        {/* CTA */}
        <Button
          variant="primary"
          fullWidth
          className="rounded-2xl uppercase tracking-wide text-sm font-bold shadow-lg shadow-primary/20"
          onClick={() => onCTAClick?.('direction-signup')}
        >
          {item.buttonText || 'Записаться'}
        </Button>
      </div>
    </div>
  );
}
