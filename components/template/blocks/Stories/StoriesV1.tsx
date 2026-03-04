import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { BlockProps } from '../../types';
import type { StoriesData, StoryItem } from './types';
import EditableText from '../../ui/EditableText';
import EditableImage from '../../ui/EditableImage';
import EditableList from '../../ui/EditableList';
import Section from '../../Section';
import Button from '../../Button';
import { isPlaceholder } from '../../PlaceholderImg';

/**
 * StoriesV1 — Side-by-Side Cards
 *
 * Two-column grid of dark cards. Each card contains a before/after image
 * pair (before in grayscale, after in color), labels, title, description,
 * and a CTA button.
 */
const StoriesV1: React.FC<BlockProps<StoriesData> & { variant?: never }> = ({
  data,
  editable = false,
  onDataChange,
  onCTAClick,
  className = '',
}) => {
  const update = (patch: Partial<StoriesData>) => onDataChange?.({ ...data, ...patch });

  const updateStory = (index: number, patch: Partial<StoryItem>) => {
    const updated = [...data.stories];
    updated[index] = { ...updated[index], ...patch };
    update({ stories: updated });
  };

  const renderStoryCard = (story: StoryItem, index: number) => (
    <div
      key={story.id}
      className="bg-[#121215] border border-zinc-700/50 rounded-2xl sm:rounded-[2.5rem] p-2 flex flex-col"
    >
      {/* Before / After image pair */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {/* Before */}
        <div className="relative aspect-[3/4] rounded-xl sm:rounded-[2rem] overflow-hidden">
          {isPlaceholder(story.beforeImg) ? (
            <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800" />
          ) : editable ? (
            <EditableImage
              src={story.beforeImg}
              alt="До"
              onImageChange={(v) => updateStory(index, { beforeImg: v })}
              editable={editable}
              className="w-full h-full object-cover grayscale"
              containerClassName="w-full h-full"
            />
          ) : (
            <img
              src={story.beforeImg}
              alt="До"
              className="w-full h-full object-cover grayscale"
              loading="lazy"
            />
          )}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-black/50 backdrop-blur-sm px-2.5 py-1 text-[10px] sm:text-xs text-zinc-200 rounded-full font-medium">
            До
          </div>
        </div>

        {/* After */}
        <div className="relative aspect-[3/4] rounded-xl sm:rounded-[2rem] overflow-hidden">
          {isPlaceholder(story.afterImg) ? (
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
          ) : editable ? (
            <EditableImage
              src={story.afterImg}
              alt="После"
              onImageChange={(v) => updateStory(index, { afterImg: v })}
              editable={editable}
              className="w-full h-full object-cover"
              containerClassName="w-full h-full"
            />
          ) : (
            <img
              src={story.afterImg}
              alt="После"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-primary/90 backdrop-blur-sm px-2.5 py-1 text-[10px] sm:text-xs text-white rounded-full font-medium">
            После
          </div>
        </div>
      </div>

      {/* Text content */}
      <div className="p-4 sm:p-6 md:p-8 flex flex-col flex-grow">
        <EditableText
          value={story.title}
          onChange={(v) => updateStory(index, { title: v })}
          editable={editable}
          as="h3"
          className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3"
        />
        <EditableText
          value={story.description}
          onChange={(v) => updateStory(index, { description: v })}
          editable={editable}
          as="p"
          multiline
          className="text-zinc-300 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed flex-grow"
        />

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => onCTAClick?.('quiz')}
            className="w-full sm:w-auto"
          >
            Хочу также
          </Button>
          <button
            className="text-sm font-medium text-zinc-300 hover:text-white flex items-center gap-2 transition-colors bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-700/50 px-5 min-h-[44px] rounded-full w-full sm:w-auto justify-center"
          >
            Читать полностью <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const createNewStory = (): StoryItem => ({
    id: `story-${Date.now()}`,
    beforeImg: 'https://placehold.co/400x533',
    afterImg: 'https://placehold.co/400x533',
    title: 'Новая история',
    description: 'Описание результата...',
  });

  return (
    <Section id="stories" className={`bg-[var(--color-background,#0c0c0e)] ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8 sm:mb-10 md:mb-12">
        <div>
          <EditableText
            value={data.title || 'Истории успеха'}
            onChange={(v) => update({ title: v })}
            editable={editable}
            as="h2"
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white"
          />
          {(data.subtitle || editable) && (
            <EditableText
              value={data.subtitle || ''}
              onChange={(v) => update({ subtitle: v })}
              editable={editable}
              as="p"
              className="mt-2 text-sm sm:text-base text-zinc-300 max-w-xl"
              placeholder="Описание секции..."
            />
          )}
        </div>
      </div>

      {/* Cards grid */}
      {editable ? (
        <EditableList
          items={data.stories}
          onItemsChange={(items) => update({ stories: items })}
          editable={editable}
          createNewItem={createNewStory}
          minItems={1}
          maxItems={8}
          addButtonText="Добавить историю"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8"
          renderItem={(story, index, onChange) => renderStoryCard(story, index)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {data.stories.map((story, index) => renderStoryCard(story, index))}
        </div>
      )}
    </Section>
  );
};

export default StoriesV1;
