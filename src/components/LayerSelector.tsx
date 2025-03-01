import React from 'react';

interface LayerSelectorProps {
  selectedLayer: number | null;
  onLayerSelect: (layer: number | null) => void;
}

export const LayerSelector: React.FC<LayerSelectorProps> = ({
  selectedLayer,
  onLayerSelect,
}) => {
  const layers = [0, 1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm font-medium text-gray-700">Layer:</span>
      <div className="flex gap-1">
        <button
          onClick={() => onLayerSelect(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
            ${selectedLayer === null
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          All
        </button>
        {layers.map((layer) => (
          <button
            key={layer}
            onClick={() => onLayerSelect(layer)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
              ${selectedLayer === layer
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {layer}
          </button>
        ))}
      </div>
    </div>
  );
};