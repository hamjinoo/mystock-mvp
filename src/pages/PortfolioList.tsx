import { TrashIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PortfolioService } from '../services/portfolioService';
import { Portfolio } from '../types';

interface PortfolioWithValue extends Portfolio {
  totalValue: number;
}

export const PortfolioList: React.FC = () => {
  const [portfolios, setPortfolios] = useState<PortfolioWithValue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const portfoliosData = await PortfolioService.getAll();
      const portfoliosWithValue = await Promise.all(
        portfoliosData.map(async (portfolio) => {
          const summary = await PortfolioService.getPortfolioSummary(portfolio.id);
          return { ...portfolio, totalValue: summary.totalValue };
        })
      );
      setPortfolios(portfoliosWithValue);
    } catch (error) {
      console.error('데이터 로딩 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePortfolio = async (id: number) => {
    if (!window.confirm('정말 이 포트폴리오를 삭제하시겠습니까?')) return;

    try {
      await PortfolioService.delete(id);
      setPortfolios(portfolios.filter(p => p.id !== id));
    } catch (error) {
      console.error('포트폴리오 삭제 중 오류:', error);
      alert('포트폴리오 삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">포트폴리오</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolios.map((portfolio) => (
              <div key={portfolio.id} className="bg-gray-800 rounded-lg p-4 relative">
                <button
                  onClick={() => handleDeletePortfolio(portfolio.id)}
                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-bold mb-2">{portfolio.name}</h2>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-400">
                    보유 종목 {portfolio.positions?.length || 0}개
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-400">총자산: </span>
                    {new Intl.NumberFormat('ko-KR', {
                      style: 'currency',
                      currency: portfolio.currency
                    }).format(portfolio.totalValue)}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-400">투자 기간: </span>
                    {portfolio.config?.period || '미설정'}
                  </p>
                </div>
                {portfolio.positions && portfolio.positions.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium text-gray-400">보유 종목:</p>
                    {portfolio.positions.map(position => {
                      const value = position.quantity * position.currentPrice;
                      const allocation = portfolio.totalValue > 0 
                        ? (value / portfolio.totalValue) * 100 
                        : 0;

                      return (
                        <div key={position.id} className="flex justify-between items-center p-2 hover:bg-gray-700 rounded">
                          <div className="text-sm">
                            <div>{position.name}</div>
                            <div className="text-gray-400">{position.symbol}</div>
                          </div>
                          <div className="text-sm text-right">
                            <div>
                              {new Intl.NumberFormat('ko-KR', {
                                style: 'currency',
                                currency: portfolio.currency
                              }).format(value)}
                            </div>
                            <div className="text-gray-400">
                              {allocation.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <Link
                  to={`/portfolios/${portfolio.id}`}
                  className="text-blue-500 hover:text-blue-400 text-sm"
                >
                  자세히 보기 →
                </Link>
              </div>
            ))}
            <Link
              to="/portfolios/new"
              className="bg-gray-800 rounded-lg p-4 flex items-center justify-center hover:bg-gray-700 border-2 border-dashed border-gray-600"
            >
              <span className="text-gray-400">+ 새 포트폴리오</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}; 