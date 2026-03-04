import React from 'react';
import type { BlockProps } from '../../types';
import type { StoriesData, StoryItem } from './types';
import EditableText from '../../ui/EditableText';
import EditableImage from '../../ui/EditableImage';
import EditableList from '../../ui/EditableList';
import Section from '../../Section';
import Button from '../../Button';
import { isPlaceholder } from '../../PlaceholderImg';

/**
 * StoriesV3 — Vertical Timeline
 *
 * Vertical line on the left (center on lg) with timeline nodes.
 * Each story shows a before/after image pair and text content.
 * Alternating left/right layout on lg, connected by a line with dots.
 */
const StoriesV3: React.FC<BlockProps<StoriesData> & { variant?: never }> = ({
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

  const renderImagePair = (story: StoryItem, index: number) => (
    <div className="grid grid-cols-2 gap-2 sm:gap-3">
      {/* Before */}
      <div className="relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden">
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
        <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-0.5 text-[10px] sm:text-xs text-zinc-200 rounded-full font-medium">
          До
        </div>
      </div>

      {/* After */}
      <div className="relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden">
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
        <div className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm px-2 py-0.5 text-[10px] sm:text-xs text-white rounded-full font-medium">
          После
        </div>
      </div>
    </div>
  );

  const renderTextContent = (story: StoryItem, index: number) => (
    <div>
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
        className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-4 sm:mb-5"
      />
      <Button
        size="sm"
        onClick={() => onCTAClick?.('quiz')}
        className="w-full sm:w-auto"
      >
        Хочу также
      </Button>
    </div>
  );

  const renderTimelineNode = (story: StoryItem, index: number) => {
    const isEven = index % 2 === 0;

    return (
      <div key={story.id} className="relative">
        {/* --- Mobile / Tablet layout (line on left) --- */}
        <div className="lg:hidden flex gap-4 sm:gap-6">
          {/* Timeline line + dot */}
          <div className="flex flex-col items-center shrink-0">
            <div className="w-4 h-4 rounded-full bg-primary shadow-[0_0_12px_var(--color-primary)] shrink-0 z-10" />
            {index < data.stories.length - 1 && (
              <div className="w-0.5 flex-1 bg-zinc-800 mt-1" />
            )}
          </div>

          {/* Content */}
          <div className="pb-8 sm:pb-10 flex-1 min-w-0">
            <div className="mb-4">
              {renderImagePair(story, index)}
            </div>
            {renderTextContent(story, index)}
          </div>
        </div>

        {/* --- Desktop layout (line in center, alternating) --- */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-8 pb-12">
          {/* Left column */}
          <div className={`flex flex-col justify-center ${isEven ? '' : 'order-3'}`}>
            {isEven ? (
              <>
                <div className="mb-4">{renderImagePair(story, index)}</div>
                {renderTextContent(story, index)}
              </>
            ) : (
              <div />
            )}
          </div>

          {/* Center: line + dot */}
          <div className="flex flex-col items-center order-2">
            <div className="w-5 h-5 rounded-full bg-primary shadow-[0_0_16px_var(--color-primary)] shrink-0 z-10" />
            {index < data.stories.length - 1 && (
              <div className="w-0.5 flex-1 bg-zinc-800 mt-1" />
            )}
          </div>

          {/* Right column */}
          <div className={`flex flex-col justify-center ${isEven ? 'order-3' : 'order-1'}`}>
            {!isEven ? (
              <>
                <div className="mb-4">{renderImagePair(story, index)}</div>
                {renderTextContent(story, index)}
              </>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    );
  };

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
      <div className="text-center mb-8 sm:mb-10 md:mb-14">
        <EditableText
          value={data.title || 'Истории успеха'}
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
            className="text-zinc-300 text-base sm:text-lg max-w-2xl mx-auto"
            placeholder="Описание секции..."
          />
        )}
      </div>

      {/* Timeline */}
      {editable ? (
        <EditableList
          items={data.stories}
          onItemsChange={(items) => update({ stories: items })}
          editable={editable}
          createNewItem={createNewStory}
          minItems={1}
          maxItems={10}
          addButtonText="Добавить историю"
          className="space-y-0"
          renderItem={(story, index, onChange) => renderTimelineNode(story, index)}
        />
      ) : (
        <div>
          {data.stories.map((story, index) => renderTimelineNode(story, index))}
        </div>
      )}
    </Section>
  );
};

export default StoriesV3;
