import React, { useState } from 'react';
import { Camera } from 'lucide-react';

interface EditableImageProps {
  src: string;
  alt?: string;
  onImageChange?: (newSrc: string) => void;
  editable?: boolean;
  className?: string;
  containerClassName?: string;
  overlayText?: string;
}

const EditableImage: React.FC<EditableImageProps> = ({
  src,
  alt = '',
  onImageChange,
  editable = false,
  className = '',
  containerClassName = '',
  overlayText = 'Заменить фото',
}) => {
  const [showModal, setShowModal] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleSubmit = () => {
    if (urlInput.trim() && onImageChange) {
      onImageChange(urlInput.trim());
    }
    setShowModal(false);
    setUrlInput('');
  };

  if (!editable) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
      />
    );
  }

  return (
    <>
      <div
        className={`relative cursor-pointer group/img ${containerClassName}`}
        onClick={() => setShowModal(true)}
      >
        <img
          src={src}
          alt={alt}
          className={`${className} group-hover/img:brightness-75 transition-all duration-300`}
          loading="lazy"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-300">
          <Camera className="w-8 h-8 text-white mb-2" />
          <span className="text-white text-sm font-medium">{overlayText}</span>
        </div>
        <span className="absolute top-2 right-2 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full opacity-70">
          ✎
        </span>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md border border-zinc-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white font-bold text-lg mb-4">Замена изображения</h3>
            <div className="mb-4">
              <img
                src={src}
                alt="Текущее изображение"
                className="w-full h-40 object-cover rounded-xl mb-3"
              />
            </div>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Вставьте URL нового изображения"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-primary mb-4"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-400 font-medium text-sm hover:bg-zinc-800 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSubmit}
                disabled={!urlInput.trim()}
                className="flex-1 py-3 rounded-xl bg-primary text-white font-medium text-sm hover:bg-accent transition-colors disabled:opacity-50"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditableImage;
