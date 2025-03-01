interface CategoryLayers {
  [key: string]: string[];
}

export const parseCategoryLayers = (gptResult: string | null): CategoryLayers => {
  if (!gptResult) return {};

  try {
    // Find the JSON object in the GPT response
    const jsonMatch = gptResult.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return {};

    const layers = JSON.parse(jsonMatch[0]);
    return layers;
  } catch (error) {
    console.error('Failed to parse category layers:', error);
    return {};
  }
};

export const getCategoriesForLayer = (
  layers: CategoryLayers,
  selectedLayer: number | null
): string[] => {
  if (selectedLayer === null) return [];

  const categories: string[] = [];
  for (let i = 0; i <= selectedLayer; i++) {
    if (layers[i]) {
      categories.push(...layers[i]);
    }
  }
  return categories;
};