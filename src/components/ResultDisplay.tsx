import React, { useState, useRef, useEffect, useMemo } from 'react';
import { DetectedObject } from '../types/api';
import { BoundingBoxCanvas } from './BoundingBoxCanvas';
import { Maximize2, Minimize2, Image as ImageIcon, Download, MessageSquare } from 'lucide-react';
import { FilterBar } from './FilterBar';
import { LayerSelector } from './LayerSelector';
import { exportToSVG, downloadSVG } from '../utils/svgExport';
import { useGPT4V } from '../hooks/useGPT4V';
import { env } from '../config/env';
import toast from 'react-hot-toast';
import { parseCategoryLayers, getCategoriesForLayer } from '../utils/categoryLayers';

interface ResultDisplayProps {
  objects: DetectedObject[];
  error?: string;
  image: string | null;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ objects, error, image }) => {
  const [selectedObjects, setSelectedObjects] = useState<DetectedObject[]>([]);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showBackground, setShowBackground] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);
  const [gptPrompt, setGptPrompt] = useState(`Assign hierarchical orders to the categories.
The hierarchical relationships should be like the: Container of (Container of objects)... > Container of objects > objects > Components of objects > Components of (Components of objects) > ...
So the min is the 0 and is assigned to the most parent one. and the max number is assigned to the most child one.
Make the output list as a JSON.
The max should not be larger than 5.

Example output format:
{
  "0": ["...", "...", "...", "..."],
  "1": ["...", "...", "...", "..."],
  "2": ["...", "...", "...", "..."],
  "3": ["...", "...", "...", "..."],
  "4": ["...", "...", "...", "..."]
}`);
  const { loading: gptLoading, error: gptError, result: gptResult, analyze: analyzeWithGPT } = useGPT4V();

  // Get unique categories and update GPT prompt
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(objects.map(obj => obj.category))].sort();
    if (uniqueCategories.length > 0) {
      setGptPrompt(`Assign hierarchical orders to these categories: ${uniqueCategories.join(', ')}.
The hierarchical relationships should be like the: Container of (Container of objects)... > Container of objects > objects > Components of objects > Components of (Components of objects) > ...
So the min is the 0 and is assigned to the most parent one. and the max number is assigned to the most child one.
Make the output list as a JSON.
The max should not be larger than 5.

Example output format:
{
  "0": ["...", "...", "...", "..."],
  "1": ["...", "...", "...", "..."],
  "2": ["...", "...", "...", "..."],
  "3": ["...", "...", "...", "..."],
  "4": ["...", "...", "...", "..."]
}`);
    }
    return uniqueCategories;
  }, [objects]);

  // Parse category layers from GPT result
  const categoryLayers = useMemo(() => {
    return parseCategoryLayers(gptResult?.explanation || null);
  }, [gptResult]);

  // Handle layer selection
  const handleLayerSelect = (layer: number | null) => {
    setSelectedLayer(layer);
    if (layer === null) {
      setSelectedCategories([]);
    } else {
      const layerCategories = getCategoriesForLayer(categoryLayers, layer);
      setSelectedCategories(layerCategories);
    }
    setSelectedObjects([]); // Clear object selection when changing layers
  };

  // Filter objects based on selected categories
  const filteredObjects = useMemo(() => {
    if (selectedCategories.length === 0) return objects;
    return objects.filter(obj => selectedCategories.includes(obj.category));
  }, [objects, selectedCategories]);

  useEffect(() => {
    if (image) {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({
          width: img.width,
          height: img.height
        });
      };
      img.src = image;
    }
  }, [image]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      }
      return [...prev, category];
    });
    setSelectedObjects([]); // Clear selection when changing filters
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedLayer(null);
    setSelectedObjects([]); // Clear selection when clearing filters
  };

  const handleExportSVG = () => {
    if (!imageDimensions.width || !imageDimensions.height) return;
    
    const svgContent = exportToSVG(
      filteredObjects,
      imageDimensions.width,
      imageDimensions.height,
      selectedObjects,
      showBackground,
      image
    );
    downloadSVG(svgContent);
  };

  const handleGPT4VAnalysis = async () => {
    if (!image) return;
    if (!env.OPENAI_API_KEY) {
      toast.error('Please set your OpenAI API key in the .env file');
      return;
    }
    await analyzeWithGPT(image, env.OPENAI_API_KEY, gptPrompt);
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Detection Results</h3>
      
      {image && (
        <div>
          <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4' : 'relative'}`}>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700">Reality Proxies</h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGPT4VAnalysis}
                  disabled={gptLoading}
                  className={`p-1 rounded-full transition-colors ${
                    gptLoading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  title="Analyze with GPT-4V"
                >
                  <MessageSquare className="h-5 w-5" />
                </button>
                <button
                  onClick={handleExportSVG}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  title="Export as SVG"
                >
                  <Download className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={() => setShowBackground(!showBackground)}
                  className={`p-1 rounded-full transition-colors ${
                    showBackground ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  title={showBackground ? 'Hide background image' : 'Show background image'}
                >
                  <ImageIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-5 w-5 text-gray-600" />
                  ) : (
                    <Maximize2 className="h-5 w-5 text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {gptResult && (
              <LayerSelector
                selectedLayer={selectedLayer}
                onLayerSelect={handleLayerSelect}
              />
            )}

            <FilterBar
              categories={categories}
              selectedCategories={selectedCategories}
              onCategoryToggle={handleCategoryToggle}
              onClearFilters={handleClearFilters}
            />

            <div className={`${isFullscreen ? 'h-[calc(100vh-8rem)]' : 'h-[600px]'}`}>
              <BoundingBoxCanvas
                objects={filteredObjects}
                imageWidth={imageDimensions.width}
                imageHeight={imageDimensions.height}
                onObjectSelect={setSelectedObjects}
                selectedObjects={selectedObjects}
                image={image}
                showBackground={showBackground}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Hover over boxes to highlight, click to select. Hold Shift to multi-select.
            </p>

            <div className="mt-4">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={gptPrompt}
                  onChange={(e) => setGptPrompt(e.target.value)}
                  placeholder="Enter prompt for GPT-4V analysis..."
                  className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={gptLoading}
                />
                <button
                  onClick={handleGPT4VAnalysis}
                  disabled={gptLoading}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    gptLoading
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {gptLoading ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>

              {gptResult && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">GPT-4V Analysis</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{gptResult.explanation}</p>
                </div>
              )}
              {gptError && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">{gptError}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={isFullscreen ? 'hidden' : 'space-y-4 mt-4'}>
        {filteredObjects.length === 0 ? (
          <p className="text-gray-500">No objects detected</p>
        ) : (
          <div className="space-y-4">
            {filteredObjects.map((obj, index) => (
              <div
                key={index}
                className={`border rounded p-3 cursor-pointer transition-colors ${
                  selectedObjects.includes(obj)
                    ? 'border-red-500 bg-red-50'
                    : 'hover:border-yellow-500'
                }`}
                onClick={(e) => {
                  if (e.shiftKey) {
                    setSelectedObjects(prev => 
                      prev.includes(obj) 
                        ? prev.filter(o => o !== obj)
                        : [...prev, obj]
                    );
                  } else {
                    setSelectedObjects([obj]);
                  }
                }}
              >
                <div className="flex justify-between items-start">
                  <span className="font-medium text-gray-800">{obj.category}</span>
                  <span className="text-sm text-gray-500">
                    Score: {(obj.score * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>BBox: [{obj.bbox.map(n => n.toFixed(2)).join(', ')}]</p>
                  {obj.pose && <p>Pose keypoints detected</p>}
                  {obj.hand && <p>Hand keypoints detected</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};