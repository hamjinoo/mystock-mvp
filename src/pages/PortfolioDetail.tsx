import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PositionForm } from '../components/PositionForm';
import { PositionTable } from '../components/PositionTable';
import { StrategyAnalysis } from '../components/StrategyAnalysis';
import { db } from '../services/db';
import { Position } from '../types';

interface PortfolioWithPositions {
  id: number;
  name: string;
  positions: Position[];
  config?: any;
  positionOrder?: number[];
}

export const PortfolioDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<PortfolioWithPositions | null>(null);
  const [isAddingPosition, setIsAddingPosition] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);

  const portfolioId = id ? parseInt(id) : null;

  const handleReorderPositions = async (reorderedPositions: Position[]) => {
    if (!portfolio) return;

    try {
      // 새로운 순서를 저장
      const positionOrder = reorderedPositions.map(p => p.id);
      await db.portfolios.update(portfolio.id, {
        ...portfolio,
        positionOrder
      });

      // 포트폴리오 상태 업데이트
      setPortfolio({
        ...portfolio,
        positions: reorderedPositions,
        positionOrder
      });
    } catch (error) {
      console.error('Error reordering positions:', error);
    }
  };

  useEffect(() => {
    const loadPortfolio = async () => {
      if (!portfolioId) {
        navigate('/portfolio');
        return;
      }

      try {
        const portfolioData = await db.getPortfolioWithPositions(portfolioId);
        if (portfolioData) {
          // 저장된 순서가 있으면 그 순서대로 정렬
          if (portfolioData.positionOrder) {
            const orderedPositions = [...portfolioData.positions].sort((a, b) => {
              const aIndex = portfolioData.positionOrder!.indexOf(a.id);
              const bIndex = portfolioData.positionOrder!.indexOf(b.id);
              return aIndex - bIndex;
            });
            portfolioData.positions = orderedPositions;
          }
          setPortfolio(portfolioData);
        } else {
          navigate('/portfolio');
        }
      } catch (error) {
        console.error('Error loading portfolio:', error);
        navigate('/portfolio');
      }
    };
    loadPortfolio();
  }, [portfolioId, navigate]);

  const handleSavePosition = async (position: Position) => {
    if (!portfolio) return;

    try {
      if (editingPosition) {
        await db.updatePosition(position);
      } else {
        await db.addPosition(position);
      }

      const updatedPortfolio = await db.getPortfolioWithPositions(portfolio.id);
      if (updatedPortfolio) {
        setPortfolio(updatedPortfolio);
      }

      setIsAddingPosition(false);
      setEditingPosition(null);
    } catch (error) {
      console.error('Error saving position:', error);
    }
  };

  const handleDeletePosition = async (positionId: number) => {
    if (!portfolio) return;

    try {
      await db.positions.delete(positionId);
      const updatedPortfolio = await db.getPortfolioWithPositions(portfolio.id);
      if (updatedPortfolio) {
        setPortfolio(updatedPortfolio);
      }
    } catch (error) {
      console.error('Error deleting position:', error);
    }
  };

  if (!portfolio || !portfolioId) {
    return (
      <div className="p-4">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-800 rounded"></div>
              <div className="h-32 bg-gray-800 rounded"></div>
              <div className="h-32 bg-gray-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalValue = portfolio.positions.reduce(
    (sum, pos) => sum + pos.quantity * pos.currentPrice,
    0
  );

  const totalCost = portfolio.positions.reduce(
    (sum, pos) => sum + pos.quantity * pos.avgPrice,
    0
  );

  const totalReturn = totalCost === 0 ? 0 : ((totalValue - totalCost) / totalCost) * 100;

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{portfolio?.name}</h1>
          <div className="flex items-center space-x-4">
            <Link
              to={`/portfolio/${id}/config`}
              className="p-2 text-gray-400 hover:text-white"
              title="포트폴리오 설정"
            >
              <Cog6ToothIcon className="h-6 w-6" />
            </Link>
            <button
              onClick={() => setIsAddingPosition(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + 새 포지션
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-400">총 자산</div>
              <div className="text-base">₩{totalValue.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">총 수익률</div>
              <div className={`text-base ${totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {totalReturn.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {(isAddingPosition || editingPosition) && (
          <div className="mb-4">
            <PositionForm
              position={editingPosition || undefined}
              portfolioId={portfolioId}
              onSave={handleSavePosition}
              onCancel={() => {
                setIsAddingPosition(false);
                setEditingPosition(null);
              }}
            />
          </div>
        )}

        <PositionTable
          positions={portfolio.positions}
          onEdit={setEditingPosition}
          onDelete={handleDeletePosition}
          onReorder={handleReorderPositions}
        />

        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">전략 분석</h2>
          <StrategyAnalysis positions={portfolio.positions} />
        </div>
      </div>
    </div>
  );
}; 