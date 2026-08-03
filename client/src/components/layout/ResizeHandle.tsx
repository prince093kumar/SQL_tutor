import React from 'react';

interface ResizeHandleProps {
  id: string;
  direction?: 'horizontal' | 'vertical';
  onPointerDown: (e: React.PointerEvent, id: string) => void;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({ 
  id, 
  direction = 'horizontal', 
  onPointerDown 
}) => {
  const isHorizontal = direction === 'horizontal';
  
  return (
    <div
      className={`group relative z-10 flex items-center justify-center bg-vscode-border transition-colors hover:bg-vscode-accent ${
        isHorizontal 
          ? 'w-1 cursor-col-resize flex-col' 
          : 'h-1 cursor-row-resize flex-row'
      }`}
      onPointerDown={(e) => onPointerDown(e, id)}
    >
      <div 
        className={`absolute bg-transparent ${
          isHorizontal 
            ? 'inset-y-0 -inset-x-1.5' // wider hit area horizontally
            : 'inset-x-0 -inset-y-1.5' // wider hit area vertically
        }`} 
      />
    </div>
  );
};
