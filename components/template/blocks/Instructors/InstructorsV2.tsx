import React from 'react';
import { Instagram, ArrowRight, User } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { InstructorsData, InstructorItem } from './types';
import EditableText from '../../ui/EditableText';
import EditableImage from '../../ui/EditableImage';
import EditableList from '../../ui/EditableList';
import Section from '../../Section';
import Button from '../../Button';
import { isPlaceholder } from '../../PlaceholderImg';

/**
 * InstructorsV2 — Light Grid + Instagram
 *
 * Light background, square images with rounded corners, Instagram hover
 * overlay, bullet-separated specialties, and bottom CTA button.
 */
const InstructorsV2: React.FC<BlockProps<InstructorsData> & { variant?: never }> = ({
  data,
  editable = false,
  onDataChange,
  onCTAClick,
  className = '',
}) => {
  const update = (patch: Partial<InstructorsData>) => onDataChange?.({ ...data, ...patch });

  const updateInstructor = (index: number, patch: Partial<InstructorItem>) => {
    const updated = [...data.instructors];
    updated[index] = { ...updated[index], ...patch };
    update({ instructors: updated });
  };

  const renderInstructorCard = (inst: InstructorItem, index: number) => (
    <div key={inst.id} className="group">
      {/* Image */}
      <div className="relative aspect-square rounded-3xl overflow-hidden bg-zinc-800 mb-4 sm:mb-5">
        {isPlaceholder(inst.image) ? (
          <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
            <User className="w-12 h-12 sm:w-16 sm:h-16 text-zinc-600" />
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

        {/* Instagram hover overlay */}
        {inst.instagram && !editable && (
          <a
            href={inst.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Instagram className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
          </a>
        )}

        {/* Founder badge */}
        {inst.isFounder && (
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 px-3 py-1 bg-primary text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full">
            Основатель
          </div>
        )}
      </div>

      {/* Text content */}
      <div>
        <EditableText
          value={inst.name}
          onChange={(v) => updateInstructor(index, { name: v })}
          editable={editable}
          as="h3"
          className="text-xl sm:text-2xl font-bold text-white mb-1.5"
        />

        {/* Specialties: bullet-separated */}
        <p className="text-primary text-sm sm:text-base font-medium mb-2">
          {editable ? (
            inst.specialties.map((spec, sIdx) => (
              <React.Fragment key={sIdx}>
                {sIdx > 0 && <span className="mx-1.5 text-primary/50">&bull;</span>}
                <EditableText
                  value={spec}
                  onChange={(v) => {
                    const newSpecs = [...inst.specialties];
                    newSpecs[sIdx] = v;
                    updateInstructor(index, { specialties: newSpecs });
                  }}
                  editable={editable}
                  as="span"
                  className="inline text-primary"
                />
              </React.Fragment>
            ))
          ) : (
            inst.specialties.join(' \u2022 ')
          )}
        </p>

        {/* Experience */}
        <EditableText
          value={inst.experience}
          onChange={(v) => updateInstructor(index, { experience: v })}
          editable={editable}
          as="p"
          className="text-zinc-400 text-sm sm:text-base"
        />
      </div>
    </div>
  );

  const createNewInstructor = (): InstructorItem => ({
    id: `instructor-${Date.now()}`,
    name: 'Новый тренер',
    image: 'https://placehold.co/400x400',
    specialties: ['Специализация'],
    experience: '1 год',
  });

  return (
    <Section id="instructors" className={`bg-[#0c0c0e] ${className}`}>
      {/* Header */}
      <div className="text-center mb-8 sm:mb-10 md:mb-12">
        <EditableText
          value={data.title || 'Наша команда'}
          onChange={(v) => update({ title: v })}
          editable={editable}
          as="h2"
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4"
        />
        {(data.subtitle || editable) && (
          <EditableText
            value={data.subtitle || ''}
            onChange={(v) => update({ subtitle: v })}
            editable={editable}
            as="p"
            className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto"
            placeholder="Описание команды..."
          />
        )}
      </div>

      {/* Grid */}
      {editable ? (
        <EditableList
          items={data.instructors}
          onItemsChange={(items) => update({ instructors: items })}
          editable={editable}
          createNewItem={createNewInstructor}
          minItems={1}
          maxItems={12}
          addButtonText="Добавить тренера"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8"
          renderItem={(inst, index, onChange) => renderInstructorCard(inst, index)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {data.instructors.map((inst, index) => renderInstructorCard(inst, index))}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="flex justify-center mt-8 sm:mt-10 md:mt-12">
        <Button
          size="lg"
          onClick={() => onCTAClick?.('quiz')}
          className="w-full sm:w-auto"
        >
          Записаться к тренеру
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </Section>
  );
};

export default InstructorsV2;
