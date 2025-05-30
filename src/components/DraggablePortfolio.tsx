import { Draggable } from '@hello-pangea/dnd';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Portfolio } from '../types';

interface Props {
  portfolio: Portfolio;
  index: number;
}

export const DraggablePortfolio: React.FC<Props> = ({ portfolio, index }) => {
  const navigate = useNavigate();

  return (
    <Draggable draggableId={`portfolio-${portfolio.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => navigate(`/portfolios/${portfolio.id}`)}
          className={`p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''
          }`}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">{portfolio.name}</h3>
              <p className="text-sm text-gray-400">{portfolio.currency}</p>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}; 