import { TrashIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable, DroppableProps, DropResult } from 'react-beautiful-dnd';
import { Link } from 'react-router-dom';
import { NewPortfolioModal } from '../components/NewPortfolioModal';
import { db } from '../services/db';
import { Portfolio, Position } from '../types';

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

export const PortfolioList: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const portfolios = await db.portfolios.toArray();
      // 순서대로 정렬
      const sortedPortfolios = [...portfolios].sort((a, b) => {
        if (a.order === undefined && b.order === undefined) return 0;
        if (a.order === undefined) return 1;
        if (b.order === undefined) return -1;
        return a.order - b.order;
      });
      setPortfolios(sortedPortfolios);

      const positions = await db.positions.toArray();
      setPositions(positions);
    } catch (error) {
      console.error('Error loading portfolios:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (portfolioId: number) => {
    if (!window.confirm('정말 이 포트폴리오를 삭제하시겠습니까?')) return;

    try {
      await db.transaction('rw', [db.portfolios, db.positions, db.todos], async () => {
        await db.portfolios.delete(portfolioId);
        await db.positions.where('portfolioId').equals(portfolioId).delete();
        await db.todos.where('portfolioId').equals(portfolioId).delete();
      });

      await loadData();
    } catch (error) {
      console.error('Error deleting portfolio:', error);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(portfolios);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // 순서 업데이트
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    try {
      // DB에 새로운 순서 저장
      await Promise.all(
        updatedItems.map(portfolio =>
          db.portfolios.update(portfolio.id, { order: portfolio.order })
        )
      );

      setPortfolios(updatedItems);
    } catch (error) {
      console.error('Error updating portfolio order:', error);
    }
  };

  const calculatePortfolioStats = (portfolioId: number) => {
    const portfolioPositions = positions.filter(p => p.portfolioId === portfolioId);
    const totalAssets = portfolioPositions.reduce((sum, pos) => sum + (pos.quantity * pos.currentPrice), 0);
    const invested = portfolioPositions.reduce((sum, pos) => sum + (pos.quantity * pos.avgPrice), 0);
    const profit = totalAssets - invested;
    const profitPercent = invested > 0 ? (profit / invested) * 100 : 0;

    return {
      totalAssets,
      profit,
      profitPercent,
    };
  };

  return (
    <div className="p-4">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">포트폴리오</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + 새 포트폴리오
          </button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <StrictModeDroppable droppableId="portfolios">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-4"
              >
                {portfolios.map((portfolio, index) => {
                  const stats = calculatePortfolioStats(portfolio.id);
                  return (
                    <Draggable
                      key={portfolio.id}
                      draggableId={String(portfolio.id)}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="relative cursor-move hover:ring-2 hover:ring-blue-500 transition-all"
                        >
                          <Link
                            to={`/portfolio/${portfolio.id}`}
                            className="block p-6 bg-gray-800 rounded-lg shadow hover:bg-gray-700 transition-colors"
                          >
                            <h3 className="text-xl font-bold text-white mb-2">{portfolio.name}</h3>
                            <div className="text-gray-300">
                              <div className="flex justify-between items-baseline">
                                <div>총자산</div>
                                <div className="text-lg">₩{stats.totalAssets.toLocaleString()}</div>
                              </div>
                              <div className="flex justify-between items-baseline">
                                <div>수익률</div>
                                <div className={`text-lg ${stats.profitPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {stats.profitPercent.toFixed(2)}%
                                </div>
                              </div>
                            </div>
                          </Link>
                          <button
                            onClick={() => handleDelete(portfolio.id)}
                            className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
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
      </div>

      <NewPortfolioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}; 