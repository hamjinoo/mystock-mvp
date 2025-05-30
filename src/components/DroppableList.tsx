import React, { useEffect, useState } from 'react';
import { Droppable, DroppableProps } from 'react-beautiful-dnd';

// StrictMode 호환성을 위한 wrapper 컴포넌트
const StrictModeDroppable = ({ children, ...props }: DroppableProps) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return <Droppable {...props}>{children}</Droppable>;
};

interface Props {
  droppableId: string;
  type: string;
  children: React.ReactNode;
  className?: string;
}

export const DroppableList = React.memo(({
  droppableId,
  type,
  children,
  className = ''
}: Props) => {
  return (
    <StrictModeDroppable droppableId={droppableId} type={type}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`space-y-4 ${
            snapshot.isDraggingOver ? 'bg-gray-700/50 rounded-lg p-4' : ''
          } ${className}`}
        >
          {children}
          {provided.placeholder}
        </div>
      )}
    </StrictModeDroppable>
  );
}); 