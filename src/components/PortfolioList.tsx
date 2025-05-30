import { TrashIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/db';
import { Portfolio } from '../types';

interface PortfolioWithStats extends Portfolio {
  totalValue: number;
  returnRate: number;
}

export const PortfolioList: React.FC = () => {
  const [portfolios, setPortfolios] = useState<PortfolioWithStats[]>([]);

  const loadPortfolios = async () => {
    const portfoliosData = await db.portfolios.toArray();
    const portfoliosWithStats = await Promise.all(
      portfoliosData.map(async (p) => {
        const positions = await db.positions.where('portfolioId').equals(p.id).toArray();
        
        const totalValue = positions.reduce((sum, pos) => 
          sum + (pos.quantity * pos.currentPrice), 0);
        
        const totalCost = positions.reduce((sum, pos) => 
          sum + (pos.quantity * pos.avgPrice), 0);
        
        const returnRate = totalCost > 0 
          ? ((totalValue - totalCost) / totalCost) * 100 
          : 0;

        return {
          ...p,
          totalValue,
          returnRate
        };
      })
    );

    setPortfolios(portfoliosWithStats);
  };

  const handleDelete = async (portfolioId: number) => {
    if (!window.confirm('정말 이 포트폴리오를 삭제하시겠습니까?')) return;

    await db.transaction('rw', [db.portfolios, db.positions, db.todos], async () => {
      await db.portfolios.delete(portfolioId);
      await db.positions.where('portfolioId').equals(portfolioId).delete();
      await db.todos.where('portfolioId').equals(portfolioId).delete();
    });

    setPortfolios(portfolios.filter(p => p.id !== portfolioId));
  };

  useEffect(() => {
    loadPortfolios();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {portfolios.map((portfolio) => (
          <div key={portfolio.id} className="relative">
            <Link
              to={`/portfolio-groups/${portfolio.id}`}
              className="block p-6 bg-gray-800 rounded-lg shadow hover:bg-gray-700 transition-colors"
            >
              <h3 className="text-xl font-bold text-white mb-2">{portfolio.name}</h3>
              <div className="text-gray-300">
                <p>총자산: {formatCurrency(portfolio.totalValue)}</p>
                <p className={portfolio.returnRate >= 0 ? 'text-green-400' : 'text-red-400'}>
                  수익률: {portfolio.returnRate.toFixed(2)}%
                </p>
              </div>
            </Link>
            <button
              onClick={() => handleDelete(portfolio.id)}
              className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}; 