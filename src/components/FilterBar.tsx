import React from 'react';
import { X } from 'lucide-react';

interface FilterBarProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
  onClearFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  selectedCategories,
  onCategoryToggle,
  onClearFilters
}) => {
  return (
    <div className="flex flex-wrap gap-2 items-center mb-4">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryToggle(category)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
            ${selectedCategories.includes(category)
              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          {category}
        </button>
      ))}
      {selectedCategories.length > 0 && (
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium
            bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
        >
          <X className="h-3 w-3" />
          Clear filters
        </button>
      )}
    </div>
  );
};