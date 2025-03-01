import { DetectedObject } from '../types/api';

export const exportToSVG = (
  objects: DetectedObject[],
  imageWidth: number,
  imageHeight: number,
  selectedObjects: DetectedObject[],
  showBackground: boolean,
  backgroundImage: string | null
): string => {
  // Create SVG content
  let svg = `<svg width="${imageWidth}" height="${imageHeight}" xmlns="http://www.w3.org/2000/svg">`;

  // Add background if enabled
  if (showBackground && backgroundImage) {
    svg += `<image href="${backgroundImage}" width="${imageWidth}" height="${imageHeight}"/>`;
  }

  // Add bounding boxes
  objects.forEach((obj) => {
    const [x, y, width, height] = obj.bbox;
    const isSelected = selectedObjects.includes(obj);
    const boxWidth = width - x;
    const boxHeight = height - y;

    // Rectangle
    const strokeColor = isSelected ? '#ff0000' : '#00ff00';
    const fillColor = isSelected ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 255, 0, 0.1)';
    const strokeWidth = isSelected ? 6 : 4;

    svg += `
      <rect
        x="${x}"
        y="${y}"
        width="${boxWidth}"
        height="${boxHeight}"
        stroke="${strokeColor}"
        stroke-width="${strokeWidth}"
        fill="${fillColor}"
      />`;

    // Label background
    const label = `${obj.category} (${(obj.score * 100).toFixed(1)}%)`;
    const padding = 12;
    const textHeight = 72;
    
    svg += `
      <rect
        x="${x}"
        y="${y - textHeight}"
        width="500"
        height="${textHeight}"
        fill="rgba(0, 0, 0, 0.8)"
      />`;

    // Label text
    const textColor = isSelected ? '#ff9999' : '#ffffff';
    svg += `
      <text
        x="${x + padding}"
        y="${y - 18}"
        fill="${textColor}"
        font-family="Arial"
        font-size="48px"
        font-weight="bold"
      >${label}</text>`;
  });

  svg += '</svg>';
  return svg;
};

export const downloadSVG = (svgContent: string, filename: string = 'reality-proxies.svg') => {
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};