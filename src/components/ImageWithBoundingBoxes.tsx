import React, { useRef, useEffect } from 'react';
import { DetectedObject } from '../types/api';

interface ImageWithBoundingBoxesProps {
  image: string;
  objects: DetectedObject[];
}

export const ImageWithBoundingBoxes: React.FC<ImageWithBoundingBoxesProps> = ({ image, objects }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !img.complete) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawBoundingBoxes = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw bounding boxes
      objects.forEach((obj) => {
        const [x, y, width, height] = obj.bbox;
        
        // Draw rectangle
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 4; // Increased line width
        ctx.strokeRect(x, y, width - x, height - y);

        // Draw label
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 48px Arial'; // Increased font size 3x
        const label = `${obj.category} (${(obj.score * 100).toFixed(1)}%)`;
        const padding = 12; // Increased padding 3x
        const textWidth = ctx.measureText(label).width;
        const textHeight = 72; // Increased height 3x
        
        // Background for text
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'; // Increased opacity for better contrast
        ctx.fillRect(x, y - textHeight, textWidth + padding * 2, textHeight);
        
        // Text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, x + padding, y - 18); // Adjusted y-position for new height
      });
    };

    drawBoundingBoxes();
  }, [image, objects]);

  return (
    <div className="relative inline-block">
      <img
        ref={imageRef}
        src={image}
        alt="Analyzed"
        className="max-w-full h-auto"
        onLoad={() => {
          // Redraw when image loads
          if (canvasRef.current && imageRef.current) {
            const event = new Event('resize');
            window.dispatchEvent(event);
          }
        }}
        style={{ display: 'none' }}
      />
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto rounded-lg"
      />
    </div>
  );
};