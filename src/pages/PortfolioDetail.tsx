import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PortfolioService } from '../services/portfolioService';
import { Portfolio, Position } from '../types';

export const PortfolioDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolio();
  }, [id]);

  const loadPortfolio = async () => {
    if (!id) return;
    try {
      const data = await PortfolioService.getById(Number(id));
      if (data) {
        setPortfolio(data);
      }
    } catch (error) {
      console.error('포트폴리오 로딩 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalValue = (positions: Position[]) => {
    return positions.reduce((sum, pos) => sum + pos.quantity * pos.currentPrice, 0);
  };

  const handleDeletePosition = async (positionId: number) => {
    if (!portfolio || !window.confirm('이 포지션을 삭제하시겠습니까?')) return;

    try {
      await PortfolioService.deletePosition(portfolio.id, positionId);
      await loadPortfolio();
    } catch (error) {
      console.error('포지션 삭제 중 오류:', error);
      alert('포지션 삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="p-4 text-center">
        <p>포트폴리오를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">{portfolio.accountName}</h1>
          <p className="text-gray-400">
            {portfolio.broker} ({portfolio.accountNumber})
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate(`/portfolios/${id}/config`)}
            className="flex items-center px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            <PencilIcon className="h-5 w-5 mr-1" />
            설정
          </button>
          <button
            onClick={() => navigate(`/portfolios/${id}/positions/new`)}
            className="flex items-center px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            포지션 추가
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-400">총 자산</p>
            <p className="text-2xl font-semibold">
              {new Intl.NumberFormat('ko-KR', {
                style: 'currency',
                currency: portfolio.currency
              }).format(portfolio.config?.totalCapital || 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">현재 가치</p>
            <p className="text-2xl font-semibold">
              {new Intl.NumberFormat('ko-KR', {
                style: 'currency',
                currency: portfolio.currency
              }).format(calculateTotalValue(portfolio.positions || []))}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">포지션 목록</h2>
        {(portfolio.positions || []).map((position) => (
          <div
            key={position.id}
            className="bg-gray-800 rounded-lg p-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{position.symbol}</h3>
                <p className="text-sm text-gray-400">{position.name}</p>
                <p className="text-sm mt-2">
                  {position.quantity} 주 × {new Intl.NumberFormat('ko-KR', {
                    style: 'currency',
                    currency: portfolio.currency
                  }).format(position.currentPrice)}
                </p>
                {position.strategyCategory && (
                  <div className="mt-2">
                    <span className="px-2 py-1 text-xs bg-gray-700 rounded">
                      {position.strategyCategory}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDeletePosition(position.id)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {(!portfolio.positions || portfolio.positions.length === 0) && (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">아직 포지션이 없습니다.</p>
            <button
              onClick={() => navigate(`/portfolios/${id}/positions/new`)}
              className="inline-flex items-center px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              첫 포지션 추가
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 