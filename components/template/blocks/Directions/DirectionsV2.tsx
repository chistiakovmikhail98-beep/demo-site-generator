import React from 'react';
import Section from '../../Section';
import EditableText from '../../ui/EditableText';
import EditableImage from '../../ui/EditableImage';
import EditableList from '../../ui/EditableList';
import { isPlaceholder } from '../../PlaceholderImg';
import { Clock, ArrowRight } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { DirectionsData, DirectionItem } from './types';

export default function DirectionsV2({ data, editable, onDataChange, onCTAClick }: BlockProps<DirectionsData>) {
  return (
    <Section id="directions" className="bg-[var(--color-background,#0c0c0e)]">
      {/* Header */}
      <div className="text-center mb-10 sm:mb-16">
        <EditableText
          value={data.title}
          onChange={v => onDataChange?.({ ...data, title: v })}
          editable={editable}
          as="h2"
          className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-[0.95] mb-3 sm:mb-4"
        />
        {data.subtitle && (
          <EditableText
            value={data.subtitle}
            onChange={v => onDataChange?.({ ...data, subtitle: v })}
            editable={editable}
            as="p"
            className="text-sm sm:text-base md:text-lg text-zinc-500 max-w-2xl mx-auto"
          />
        )}
      </div>

      {/* Direction Rows */}
      <EditableList
        items={data.directions}
        onItemsChange={editable ? (dirs) => onDataChange?.({ ...data, directions: dirs }) : undefined}
        editable={editable}
        renderItem={(dir, index, onChange) => (
          <DirectionRow
            key={dir.id}
            item={dir}
            index={index}
            editable={editable}
            onChange={onChange}
            onCTAClick={onCTAClick}
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
        className="divide-y divide-zinc-800/60"
      />
    </Section>
  );
}


/* ---- Direction Row ---- */
interface RowProps {
  item: DirectionItem;
  index: number;
  editable?: boolean;
  onChange: (updated: DirectionItem) => void;
  onCTAClick?: (action: string) => void;
}

function DirectionRow({ item, index, editable, onChange, onCTAClick }: RowProps) {
  const placeholder = isPlaceholder(item.image);
  const num = String(index + 1).padStart(2, '0');

  return (
    <div
      className="group flex items-center gap-3 sm:gap-6 py-5 sm:py-6 px-2 sm:px-4 -mx-2 sm:-mx-4 rounded-xl hover:bg-zinc-900/50 transition-colors duration-300 cursor-pointer"
      onClick={() => onCTAClick?.('direction-signup')}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') onCTAClick?.('direction-signup'); }}
    >
      {/* Number Badge -- hidden on mobile */}
      <span className="hidden sm:flex w-10 h-10 sm:w-12 sm:h-12 items-center justify-center rounded-full bg-zinc-800 text-zinc-500 text-xs sm:text-sm font-bold flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
        {num}
      </span>

      {/* Thumbnail */}
      <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0">
        {editable ? (
          <EditableImage
            src={item.image || ''}
            alt={item.title}
            onImageChange={src => onChange({ ...item, image: src })}
            editable
            className="w-full h-full object-cover"
          />
        ) : placeholder ? (
          <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
            <span className="text-zinc-500 font-bold text-[8px] sm:text-[10px] uppercase tracking-wider text-center leading-tight px-1">
              {item.title.slice(0, 12)}
            </span>
          </div>
        ) : (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        )}
      </div>

      {/* Title + Tags (mobile: stacked) */}
      <div className="flex-grow min-w-0">
        <EditableText
          value={item.title}
          onChange={v => onChange({ ...item, title: v })}
          editable={editable}
          as="h3"
          className="text-base sm:text-xl font-bold text-white group-hover:text-primary transition-colors duration-300 truncate"
        />
        {/* Tags -- visible on mobile as subtitle */}
        <p className="text-xs sm:text-sm text-zinc-500 mt-0.5 sm:mt-1 truncate">
          {item.tags.join(' \u00b7 ')}
        </p>
      </div>

      {/* Duration -- hidden on mobile */}
      <div className="hidden sm:flex items-center gap-2 text-zinc-500 flex-shrink-0">
        <Clock className="w-4 h-4" />
        <EditableText
          value={item.duration}
          onChange={v => onChange({ ...item, duration: v })}
          editable={editable}
          as="span"
          className="text-sm font-medium whitespace-nowrap"
        />
      </div>

      {/* Arrow Button */}
      <button
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors duration-300"
        onClick={e => {
          e.stopPropagation();
          onCTAClick?.('direction-signup');
        }}
        aria-label={`Подробнее: ${item.title}`}
      >
        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 group-hover:text-white transition-colors duration-300 group-hover:translate-x-0.5 transform" />
      </button>
    </div>
  );
}
