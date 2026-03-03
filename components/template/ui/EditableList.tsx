import React from 'react';
import { Plus, X } from 'lucide-react';

interface EditableListProps<T> {
  items: T[];
  onItemsChange?: (items: T[]) => void;
  editable?: boolean;
  renderItem: (item: T, index: number, onChange: (updated: T) => void) => React.ReactNode;
  createNewItem: () => T;
  minItems?: number;
  maxItems?: number;
  addButtonText?: string;
  className?: string;
}

function EditableList<T>({
  items,
  onItemsChange,
  editable = false,
  renderItem,
  createNewItem,
  minItems = 1,
  maxItems = 10,
  addButtonText = 'Добавить',
  className = '',
}: EditableListProps<T>) {
  const handleItemChange = (index: number, updated: T) => {
    if (!onItemsChange) return;
    const newItems = [...items];
    newItems[index] = updated;
    onItemsChange(newItems);
  };

  const handleAdd = () => {
    if (!onItemsChange || items.length >= maxItems) return;
    onItemsChange([...items, createNewItem()]);
  };

  const handleRemove = (index: number) => {
    if (!onItemsChange || items.length <= minItems) return;
    onItemsChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className={className}>
      {items.map((item, index) => (
        <div key={index} className="relative group/item">
          {renderItem(item, index, (updated) => handleItemChange(index, updated))}

          {editable && items.length > minItems && (
            <button
              onClick={() => handleRemove(index)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity z-10"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}

      {editable && items.length < maxItems && (
        <button
          onClick={handleAdd}
          className="w-full py-3 border-2 border-dashed border-zinc-700 rounded-2xl text-zinc-500 text-sm font-medium flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors mt-3"
        >
          <Plus className="w-4 h-4" />
          {addButtonText}
        </button>
      )}
    </div>
  );
}

export default EditableList;
