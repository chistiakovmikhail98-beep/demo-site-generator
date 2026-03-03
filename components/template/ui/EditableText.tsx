import React, { useState, useRef, useEffect } from 'react';

interface EditableTextProps {
  value: string;
  onChange?: (value: string) => void;
  editable?: boolean;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  className?: string;
  multiline?: boolean;
  placeholder?: string;
}

const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  editable = false,
  as: Tag = 'span',
  className = '',
  multiline = false,
  placeholder = 'Введите текст...',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    if (editValue !== value && onChange) {
      onChange(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      handleSave();
    }
    if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  if (!editable) {
    return <Tag className={className}>{value}</Tag>;
  }

  if (isEditing) {
    const inputClass = `w-full bg-transparent border-2 border-primary/50 rounded-lg px-2 py-1 outline-none focus:border-primary ${className}`;

    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className={`${inputClass} min-h-[80px] resize-y`}
          placeholder={placeholder}
        />
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={inputClass}
        placeholder={placeholder}
      />
    );
  }

  return (
    <Tag
      className={`${className} cursor-pointer relative group/edit`}
      onClick={() => setIsEditing(true)}
    >
      {value || placeholder}
      <span className="absolute -top-1 -right-1 opacity-0 group-hover/edit:opacity-100 transition-opacity bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full pointer-events-none">
        ✎
      </span>
    </Tag>
  );
};

export default EditableText;
