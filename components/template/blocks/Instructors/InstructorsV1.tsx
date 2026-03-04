import React, { useState } from 'react';
import { Check, Award, User, ChevronDown, ChevronRight, Calendar } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { InstructorsData, InstructorItem } from './types';
import EditableText from '../../ui/EditableText';
import EditableImage from '../../ui/EditableImage';
import EditableList from '../../ui/EditableList';
import Section from '../../Section';
import Button from '../../Button';
import { isPlaceholder } from '../../PlaceholderImg';

/**
 * InstructorsV1 — Dark Cards Grid + CTA
 *
 * Dark card grid with 3/4 aspect images, gradient overlays, founder badges,
 * specialty lists, and a white CTA card at the bottom.
 */
const InstructorsV1: React.FC<BlockProps<InstructorsData> & { variant?: never }> = ({
  data,
  editable = false,
  onDataChange,
  onCTAClick,
  className = '',
}) => {
  const [showAll, setShowAll] = useState(false);
  const update = (patch: Partial<InstructorsData>) => onDataChange?.({ ...data, ...patch });

  const updateInstructor = (index: number, patch: Partial<InstructorItem>) => {
    const updated = [...data.instructors];
    updated[index] = { ...updated[index], ...patch };
    update({ instructors: updated });
  };

  const visibleCount = 6;
  const hasMore = data.instructors.length > visibleCount;
  const displayed = showAll ? data.instructors : data.instructors.slice(0, visibleCount);

  const renderInstructorCard = (inst: InstructorItem, index: number) => (
    <div key={inst.id} className="group relative">
      {/* Image card */}
      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 mb-4">
        {isPlaceholder(inst.image) ? (
          <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
            <User className="w-12 h-12 sm:w-16 sm:h-16 text-zinc-700" />
          </div>
        ) : editable ? (
          <EditableImage
            src={inst.image}
            alt={inst.name}
            onImageChange={(v) => updateInstructor(index, { image: v })}
            editable={editable}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            containerClassName="w-full h-full"
          />
        ) : (
          <img
            src={inst.image}
            alt={inst.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

        {/* Founder badge */}
        {inst.isFounder && (
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/90 backdrop-blur-sm rounded-full text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider">
            <Award className="w-3 h-3" />
            <span>Основатель</span>
          </div>
        )}

        {/* Name at bottom */}
        <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
          <EditableText
            value={inst.name}
            onChange={(v) => updateInstructor(index, { name: v })}
            editable={editable}
            as="h3"
            className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-tight"
          />
        </div>
      </div>

      {/* Info below card */}
      <div className="space-y-2">
        {/* Specialties */}
        {inst.specialties.map((spec, sIdx) => (
          <div key={sIdx} className="flex items-start gap-2 sm:gap-3">
            <div className="w-5 h-5 bg-primary/20 rounded flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-primary" />
            </div>
            <EditableText
              value={spec}
              onChange={(v) => {
                const newSpecs = [...inst.specialties];
                newSpecs[sIdx] = v;
                updateInstructor(index, { specialties: newSpecs });
              }}
              editable={editable}
              as="p"
              className="text-zinc-400 text-sm leading-snug"
            />
          </div>
        ))}

        {/* Experience */}
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="w-5 h-5 bg-primary/20 rounded flex items-center justify-center shrink-0 mt-0.5">
            <Check className="w-3 h-3 text-primary" />
          </div>
          <EditableText
            value={`Опыт: ${inst.experience}`}
            onChange={(v) => updateInstructor(index, { experience: v.replace(/^Опыт:\s*/, '') })}
            editable={editable}
            as="p"
            className="text-zinc-400 text-sm leading-snug"
          />
        </div>
      </div>
    </div>
  );

  const createNewInstructor = (): InstructorItem => ({
    id: `instructor-${Date.now()}`,
    name: 'Новый тренер',
    image: 'https://placehold.co/400x533',
    specialties: ['Специализация'],
    experience: '1 год',
  });

  return (
    <Section id="instructors" className={`bg-[var(--color-background,#0c0c0e)] ${className}`}>
      {/* Header */}
      <div className="mb-8 sm:mb-12">
        <EditableText
          value={data.title || 'Тренеры'}
          onChange={(v) => update({ title: v })}
          editable={editable}
          as="h2"
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter uppercase"
        />
        {(data.subtitle || editable) && (
          <EditableText
            value={data.subtitle || ''}
            onChange={(v) => update({ subtitle: v })}
            editable={editable}
            as="p"
            className="mt-2 sm:mt-3 text-sm sm:text-base md:text-lg text-zinc-400 max-w-2xl"
            placeholder="Описание команды..."
          />
        )}
      </div>

      {/* Cards grid */}
      {editable ? (
        <EditableList
          items={data.instructors}
          onItemsChange={(items) => update({ instructors: items })}
          editable={editable}
          createNewItem={createNewInstructor}
          minItems={1}
          maxItems={12}
          addButtonText="Добавить тренера"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 sm:mb-16 md:mb-20"
          renderItem={(inst, index, onChange) => renderInstructorCard(inst, index)}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 sm:mb-16 md:mb-20">
            {displayed.map((inst, index) => renderInstructorCard(inst, index))}
          </div>

          {/* Show all button */}
          {hasMore && !showAll && (
            <div className="flex justify-center mb-12 sm:mb-16 md:mb-20 -mt-6 sm:-mt-8">
              <button
                onClick={() => setShowAll(true)}
                className="inline-flex items-center gap-2 px-6 h-11 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-300 text-sm font-medium hover:bg-zinc-800 hover:text-white transition-colors"
              >
                Показать всех ({data.instructors.length})
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* CTA card */}
      <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 text-center md:text-left shadow-2xl">
        <div className="max-w-xl">
          <EditableText
            value={data.ctaTitle || 'Приходите на пробный урок!'}
            onChange={(v) => update({ ctaTitle: v })}
            editable={editable}
            as="h3"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 mb-3 sm:mb-4"
          />
          <EditableText
            value={data.ctaDescription || 'Познакомьтесь с нашими тренерами лично и найдите своего наставника.'}
            onChange={(v) => update({ ctaDescription: v })}
            editable={editable}
            as="p"
            multiline
            className="text-zinc-600 text-base sm:text-lg leading-relaxed"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto">
          <Button
            size="lg"
            onClick={() => onCTAClick?.('quiz')}
            className="w-full sm:w-auto"
          >
            Записаться на урок
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => onCTAClick?.('pricing')}
            className="w-full sm:w-auto text-zinc-900 border-zinc-300 hover:bg-zinc-100"
          >
            <Calendar className="w-5 h-5 mr-1" />
            Расписание
          </Button>
        </div>
      </div>
    </Section>
  );
};

export default InstructorsV1;
