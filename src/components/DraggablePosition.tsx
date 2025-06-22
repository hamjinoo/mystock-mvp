import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { Position } from "../types";
import { formatCurrency } from "../utils/currencyUtils";

interface Props {
  position: Position;
  index: number;
  portfolioId: number;
  onEdit: (position: Position) => void;
  onDelete: (positionId: number) => void;
}

export const DraggablePosition: React.FC<Props> = ({
  position,
  index,
  portfolioId,
  onEdit,
  onDelete,
}) => {
  return (
    <Draggable draggableId={`position-${position.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-gray-800 rounded-lg p-4 ${
            snapshot.isDragging ? "shadow-lg ring-2 ring-blue-500" : ""
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{position.symbol}</h3>
              <p className="text-sm text-gray-400">{position.name}</p>
              <div className="mt-2 space-y-1">
                <p className="text-sm">
                  보유: {position.quantity.toLocaleString()} 주
                </p>
                <p className="text-sm">
                  현재가: {formatCurrency(position.currentPrice, "KRW")}
                </p>
                <p className="text-sm">
                  평균단가: {formatCurrency(position.avgPrice, "KRW")}
                </p>
                <p className="text-sm">
                  평가금액:{" "}
                  {formatCurrency(
                    position.quantity * position.currentPrice,
                    "KRW"
                  )}
                </p>
              </div>
              {position.strategyCategory && (
                <div className="mt-2">
                  <span className="px-2 py-1 text-xs bg-gray-700 rounded">
                    {position.strategyCategory}
                  </span>
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(position)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(position.id)}
                className="p-1 text-gray-400 hover:text-red-400"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
