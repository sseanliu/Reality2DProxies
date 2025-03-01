import { useState, useCallback } from 'react';
import { DetectedObject } from '../types/api';

interface SelectionRect {
  startX: number;
  startY: number;
  width: number;
  height: number;
}

export const useFrameSelection = (scale: number, offset: { x: number, y: number }) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [hasMovedWhileSelecting, setHasMovedWhileSelecting] = useState(false);

  const getScaledMousePos = useCallback((canvas: HTMLCanvasElement, event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: ((event.clientX - rect.left) * scaleX - offset.x) / scale,
      y: ((event.clientY - rect.top) * scaleY - offset.y) / scale
    };
  }, [offset, scale]);

  const startSelection = useCallback((canvas: HTMLCanvasElement, event: MouseEvent) => {
    const pos = getScaledMousePos(canvas, event);
    setStartPos(pos);
    setIsSelecting(true);
    setHasMovedWhileSelecting(false);
    setSelectionRect({
      startX: pos.x,
      startY: pos.y,
      width: 0,
      height: 0
    });
  }, [getScaledMousePos]);

  const updateSelection = useCallback((canvas: HTMLCanvasElement, event: MouseEvent) => {
    if (!isSelecting) return;

    const pos = getScaledMousePos(canvas, event);
    const dx = Math.abs(pos.x - startPos.x);
    const dy = Math.abs(pos.y - startPos.y);
    
    // Consider selection has moved if dragged more than 5 pixels
    if (dx > 5 || dy > 5) {
      setHasMovedWhileSelecting(true);
    }

    setSelectionRect({
      startX: Math.min(startPos.x, pos.x),
      startY: Math.min(startPos.y, pos.y),
      width: Math.abs(pos.x - startPos.x),
      height: Math.abs(pos.y - startPos.y)
    });
  }, [isSelecting, startPos, getScaledMousePos]);

  const endSelection = useCallback((objects: DetectedObject[]) => {
    if (!hasMovedWhileSelecting) {
      // If we haven't moved while selecting, return empty array to trigger deselection
      return [];
    }

    if (selectionRect) {
      const selectedObjects = objects.filter(obj => {
        const [x, y, width, height] = obj.bbox;
        return (
          // Check if any corner of the bounding box is inside the selection
          (x >= selectionRect.startX && x <= selectionRect.startX + selectionRect.width &&
           y >= selectionRect.startY && y <= selectionRect.startY + selectionRect.height) ||
          (width >= selectionRect.startX && width <= selectionRect.startX + selectionRect.width &&
           y >= selectionRect.startY && y <= selectionRect.startY + selectionRect.height) ||
          (x >= selectionRect.startX && x <= selectionRect.startX + selectionRect.width &&
           height >= selectionRect.startY && height <= selectionRect.startY + selectionRect.height) ||
          (width >= selectionRect.startX && width <= selectionRect.startX + selectionRect.width &&
           height >= selectionRect.startY && height <= selectionRect.startY + selectionRect.height) ||
          // Check if selection rectangle is completely inside the bounding box
          (selectionRect.startX >= x && selectionRect.startX + selectionRect.width <= width &&
           selectionRect.startY >= y && selectionRect.startY + selectionRect.height <= height)
        );
      });
      return selectedObjects;
    }
    return [];
  }, [selectionRect, hasMovedWhileSelecting]);

  const cancelSelection = useCallback(() => {
    setIsSelecting(false);
    setSelectionRect(null);
    setHasMovedWhileSelecting(false);
  }, []);

  return {
    isSelecting,
    selectionRect,
    startSelection,
    updateSelection,
    endSelection,
    cancelSelection,
    hasMovedWhileSelecting
  };
};