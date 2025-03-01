import React, { useRef, useEffect, useState } from 'react';
import { DetectedObject } from '../types/api';
import { useFrameSelection } from '../hooks/useFrameSelection';

interface BoundingBoxCanvasProps {
  objects: DetectedObject[];
  imageWidth: number;
  imageHeight: number;
  onObjectSelect?: (objects: DetectedObject[]) => void;
  selectedObjects?: DetectedObject[];
  image: string | null;
  showBackground: boolean;
}

export const BoundingBoxCanvas: React.FC<BoundingBoxCanvasProps> = ({
  objects,
  imageWidth,
  imageHeight,
  onObjectSelect,
  selectedObjects = [],
  image,
  showBackground
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredObjects, setHoveredObjects] = useState<DetectedObject[]>([]);
  const [activeHoverIndex, setActiveHoverIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const {
    isSelecting,
    selectionRect,
    startSelection,
    updateSelection,
    endSelection,
    cancelSelection,
    hasMovedWhileSelecting
  } = useFrameSelection(scale, offset);

  // Calculate relative mouse position
  const getMousePos = (canvas: HTMLCanvasElement, event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: ((event.clientX - rect.left) * scaleX - offset.x) / scale,
      y: ((event.clientY - rect.top) * scaleY - offset.y) / scale
    };
  };

  // Check if mouse is inside bounding box
  const isInsideBox = (mouseX: number, mouseY: number, bbox: number[]) => {
    const [x, y, width, height] = bbox;
    return mouseX >= x && mouseX <= width && mouseY >= y && mouseY <= height;
  };

  const drawCanvas = (
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    scale: number
  ) => {
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Set background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Save the current transformation matrix
    ctx.save();

    // Apply scaling and translation
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Draw background image if enabled
    if (showBackground && image) {
      const img = new Image();
      img.src = image;
      if (img.complete) {
        ctx.drawImage(img, 0, 0, imageWidth, imageHeight);
      } else {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, imageWidth, imageHeight);
        };
      }
    }

    // Draw grid
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 0.5;
    const gridSize = 20;
    
    for (let x = 0; x < imageWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, imageHeight);
      ctx.stroke();
    }
    
    for (let y = 0; y < imageHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(imageWidth, y);
      ctx.stroke();
    }

    // Draw bounding boxes
    objects.forEach((obj) => {
      const [x, y, width, height] = obj.bbox;
      const isSelected = selectedObjects.includes(obj);
      const isHovered = hoveredObjects.includes(obj);
      const isActiveHover = isHovered && hoveredObjects[activeHoverIndex] === obj;

      // Draw rectangle
      ctx.strokeStyle = isSelected ? '#ff0000' : isActiveHover ? '#ffff00' : isHovered ? '#ffa500' : '#00ff00';
      ctx.lineWidth = isSelected || isHovered ? 6 : 4;
      ctx.strokeRect(x, y, width - x, height - y);

      // Fill with semi-transparent color
      ctx.fillStyle = isSelected 
        ? 'rgba(255, 0, 0, 0.1)' 
        : isActiveHover 
          ? 'rgba(255, 255, 0, 0.1)'
          : isHovered
            ? 'rgba(255, 165, 0, 0.1)'
            : 'rgba(0, 255, 0, 0.1)';
      ctx.fillRect(x, y, width - x, height - y);

      // Draw label
      ctx.font = 'bold 48px Arial';
      const label = `${obj.category} (${(obj.score * 100).toFixed(1)}%)`;
      const padding = 12;
      const textWidth = ctx.measureText(label).width;
      const textHeight = 72;

      // Background for text
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(x, y - textHeight, textWidth + padding * 2, textHeight);

      // Text
      ctx.fillStyle = isSelected ? '#ff9999' : isActiveHover ? '#ffff99' : isHovered ? '#ffd700' : '#ffffff';
      ctx.fillText(label, x + padding, y - 18);
    });

    // Draw selection rectangle if selecting
    if (isSelecting && selectionRect && hasMovedWhileSelecting) {
      ctx.strokeStyle = '#0066ff';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.strokeRect(
        selectionRect.startX,
        selectionRect.startY,
        selectionRect.width,
        selectionRect.height
      );
      ctx.fillStyle = 'rgba(0, 102, 255, 0.1)';
      ctx.fillRect(
        selectionRect.startX,
        selectionRect.startY,
        selectionRect.width,
        selectionRect.height
      );
      ctx.setLineDash([]);
    }

    // Restore the transformation matrix
    ctx.restore();
  };

  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container || !imageWidth || !imageHeight) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      // Set canvas size to match container
      canvas.width = containerWidth;
      canvas.height = containerHeight;

      // Calculate scale to fit the image while maintaining aspect ratio
      const imageAspectRatio = imageWidth / imageHeight;
      const containerAspectRatio = containerWidth / containerHeight;
      
      let newScale: number;
      let newOffsetX: number;
      let newOffsetY: number;

      if (containerAspectRatio > imageAspectRatio) {
        // Container is wider than image
        newScale = containerHeight / imageHeight;
        newOffsetX = (containerWidth - (imageWidth * newScale)) / 2;
        newOffsetY = 0;
      } else {
        // Container is taller than image
        newScale = containerWidth / imageWidth;
        newOffsetX = 0;
        newOffsetY = (containerHeight - (imageHeight * newScale)) / 2;
      }
      
      setScale(newScale);
      setOffset({ x: newOffsetX, y: newOffsetY });
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      drawCanvas(ctx, containerWidth, containerHeight, newScale);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [objects, hoveredObjects, activeHoverIndex, selectedObjects, imageWidth, imageHeight, isSelecting, selectionRect, hasMovedWhileSelecting, showBackground, image]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (isSelecting) {
        updateSelection(canvas, event);
        return;
      }

      const mousePos = getMousePos(canvas, event);
      const foundObjects: DetectedObject[] = [];

      // Find all objects under the cursor (in reverse order to handle overlapping)
      for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        if (isInsideBox(mousePos.x, mousePos.y, obj.bbox)) {
          foundObjects.push(obj);
        }
      }

      setHoveredObjects(foundObjects);
      setActiveHoverIndex(0);
      canvas.style.cursor = foundObjects.length > 0 ? 'pointer' : 'crosshair';
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) { // Left click only
        if (hoveredObjects.length === 0) {
          startSelection(canvas, event);
        }
      }
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 0) { // Left click only
        if (isSelecting) {
          const newSelectedObjects = endSelection(objects);
          if (hasMovedWhileSelecting) {
            const updatedSelection = event.shiftKey
              ? [...selectedObjects, ...newSelectedObjects.filter(obj => !selectedObjects.includes(obj))]
              : newSelectedObjects;
            onObjectSelect?.(updatedSelection);
          } else {
            // Clear selection when clicking on empty space without dragging
            onObjectSelect?.([]);
          }
          cancelSelection();
        } else if (hoveredObjects.length > 0) {
          const clickedObject = hoveredObjects[activeHoverIndex];
          let updatedSelection: DetectedObject[];

          if (event.shiftKey) {
            // Toggle selection with Shift key
            updatedSelection = selectedObjects.includes(clickedObject)
              ? selectedObjects.filter(obj => obj !== clickedObject)
              : [...selectedObjects, clickedObject];
          } else {
            // Single select without Shift key
            updatedSelection = [clickedObject];
          }

          onObjectSelect?.(updatedSelection);
          setActiveHoverIndex((activeHoverIndex + 1) % hoveredObjects.length);
        } else {
          // Clear selection when clicking empty space
          onObjectSelect?.([]);
        }
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', cancelSelection);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', cancelSelection);
    };
  }, [
    objects,
    scale,
    offset,
    hoveredObjects,
    activeHoverIndex,
    selectedObjects,
    onObjectSelect,
    isSelecting,
    startSelection,
    updateSelection,
    endSelection,
    cancelSelection,
    hasMovedWhileSelecting
  ]);

  return (
    <div ref={containerRef} className="h-full w-full overflow-hidden bg-gray-50 rounded-lg flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  );
};