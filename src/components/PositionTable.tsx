import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { DragDropContext, Draggable, DropResult, Droppable, DroppableProps } from 'react-beautiful-dnd';
import { Position } from '../types';
import { PositionProgress } from './PositionProgress';

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

interface PositionTableProps {
  positions: Position[];
  onEdit: (position: Position) => void;
  onDelete: (positionId: number) => void;
  onReorder: (positions: Position[]) => void;
}

export const PositionTable: React.FC<PositionTableProps> = ({
  positions,
  onEdit,
  onDelete,
  onReorder,
}) => {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(positions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onReorder(items);
  };

  if (positions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        포지션이 없습니다.
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <StrictModeDroppable droppableId="positions" direction="horizontal">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {positions.map((position, index) => {
              const returnRate =
                ((position.currentPrice - position.avgPrice) / position.avgPrice) * 100;

              return (
                <Draggable key={position.id} draggableId={String(position.id)} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="bg-gray-800 rounded-lg p-4 flex flex-col cursor-move hover:ring-2 hover:ring-blue-500 transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium">{position.symbol}</h3>
                          <div className="text-sm text-gray-400">{position.name}</div>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => onEdit(position)}
                            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onDelete(position.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-400">보유 수량</span>
                          <span>{position.quantity.toLocaleString()}주</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">평균단가</span>
                          <span>₩{position.avgPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">현재가</span>
                          <span>₩{position.currentPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">평가금액</span>
                          <span>₩{(position.quantity * position.currentPrice).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">수익률</span>
                          <span className={returnRate >= 0 ? 'text-green-500' : 'text-red-500'}>
                            {returnRate.toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto">
                        <div className="text-xs font-medium text-gray-400 mb-2">진행 상황</div>
                        <PositionProgress position={position} />
                      </div>
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </StrictModeDroppable>
    </DragDropContext>
  );
}; 