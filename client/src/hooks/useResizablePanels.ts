import { useState, useEffect, useCallback, useRef } from 'react';

export type PanelConfig = {
  id: string;
  defaultSize: number;
  minSize: number;
  maxSize?: number;
  collapsible?: boolean;
};

export function useResizablePanels(
  storageKey: string,
  configs: PanelConfig[],
  direction: 'horizontal' | 'vertical' = 'horizontal',
  containerRef?: React.RefObject<HTMLDivElement>
) {
  const [sizes, setSizes] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse layout from localStorage', e);
    }
    const initial: Record<string, number> = {};
    configs.forEach(c => initial[c.id] = c.defaultSize);
    return initial;
  });

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const isResizingRef = useRef(false);
  
  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(sizes));
  }, [sizes, storageKey]);

  // Clamp sizes on window resize
  useEffect(() => {
    if (!containerRef || !containerRef.current || direction !== 'horizontal') return;

    const observer = new ResizeObserver((entries) => {
      if (isResizingRef.current) return; // Don't clamp while dragging
      
      const containerWidth = entries[0].contentRect.width;
      
      setSizes(currentSizes => {
        let totalCurrentSize = 0;
        let flexiblePanels = 0;
        
        configs.forEach((config, idx) => {
           if (idx < configs.length - 1) { // The last panel typically flexes in our UI
             const size = currentSizes[config.id] || config.defaultSize;
             const isCol = collapsed[config.id];
             totalCurrentSize += isCol ? 0 : size;
           } else {
             flexiblePanels++;
           }
        });

        // If the fixed panels take up more than the container, we need to clamp them down
        if (totalCurrentSize > containerWidth - 200 && flexiblePanels > 0) { // 200px min for last panel
          // This is a complex logic depending on how we distribute the squeeze.
          // For simplicity, we just reset to defaults if it gets too squeezed, 
          // or we could reduce them proportionally.
          // In a full implementation, we'd distribute the negative delta.
        }
        return currentSizes;
      });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [configs, containerRef, direction, collapsed]);

  const startResize = useCallback((
    e: React.PointerEvent,
    leftPanelId: string,
    _rightPanelId: string, // or bottom if vertical
    _index: number
  ) => {
    e.preventDefault();
    isResizingRef.current = true;
    
    const startPos = direction === 'horizontal' ? e.clientX : e.clientY;
    const startLeftSize = sizes[leftPanelId];
    
    const onPointerMove = (moveEvent: PointerEvent) => {
      const currentPos = direction === 'horizontal' ? moveEvent.clientX : moveEvent.clientY;
      const delta = currentPos - startPos;
      
      setSizes(current => {
        const leftConfig = configs.find(c => c.id === leftPanelId)!;
        let newLeftSize = startLeftSize + delta;
        
        // Clamp min size
        if (newLeftSize < leftConfig.minSize) {
          newLeftSize = leftConfig.minSize;
        }
        
        // Clamp max size if defined
        if (leftConfig.maxSize && newLeftSize > leftConfig.maxSize) {
          newLeftSize = leftConfig.maxSize;
        }
        
        return {
          ...current,
          [leftPanelId]: newLeftSize,
        };
      });
    };

    const onPointerUp = () => {
      isResizingRef.current = false;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  }, [configs, direction, sizes]);

  const resetLayout = useCallback(() => {
    const initial: Record<string, number> = {};
    configs.forEach(c => initial[c.id] = c.defaultSize);
    setSizes(initial);
    setCollapsed({});
  }, [configs]);

  const toggleCollapse = useCallback((id: string) => {
    setCollapsed(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }, []);

  return { sizes, collapsed, startResize, resetLayout, toggleCollapse };
}
