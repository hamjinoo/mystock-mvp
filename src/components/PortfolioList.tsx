import { TrashIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Portfolio } from '../schemas';
import { db } from '../services/db';
import { NewPortfolioModal } from './NewPortfolioModal';

export const PortfolioList: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadPortfolios = async () => {
    const portfolios = await db.portfolios.toArray();
    setPortfolios(portfolios);
  };

  const handleDelete = async (portfolioId: number) => {
    if (!window.confirm('정말 이 포트폴리오를 삭제하시겠습니까?')) return;

    await db.transaction('rw', [db.portfolios, db.positions, db.todos], async () => {
      // 포트폴리오 삭제
      await db.portfolios.delete(portfolioId);

      // 연관된 포지션들 삭제
      await db.positions.where('portfolioId').equals(portfolioId).delete();

      // 연관된 할 일들 삭제
      await db.todos.where('portfolioId').equals(portfolioId).delete();
    });

    setPortfolios(portfolios.filter(p => p.id !== portfolioId));
  };

  useEffect(() => {
    loadPortfolios();
  }, []);

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {portfolios.map((portfolio) => (
          <div key={portfolio.id} className="relative">
            <Link
              to={`/portfolio/${portfolio.id}`}
              className="block p-6 bg-gray-800 rounded-lg shadow hover:bg-gray-700 transition-colors"
            >
              <h3 className="text-xl font-bold text-white mb-2">{portfolio.name}</h3>
              {/* 총자산과 수익률은 나중에 계산하여 표시 */}
              <div className="text-gray-300">
                <p>총자산: 계산 중...</p>
                <p>수익률: 계산 중...</p>
              </div>
            </Link>
            <button
              onClick={() => handleDelete(portfolio.id)}
              className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500"
              data-testid={`delete-portfolio-${portfolio.id}`}
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        ))}
        <button
          className="block p-6 bg-gray-800 rounded-lg shadow hover:bg-gray-700 transition-colors border-2 border-dashed border-gray-600"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="flex items-center justify-center h-full">
            <span className="text-gray-400 text-lg">+ 새 포트폴리오</span>
          </div>
        </button>
      </div>

      <NewPortfolioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadPortfolios}
      />
    </div>
  );
}; 