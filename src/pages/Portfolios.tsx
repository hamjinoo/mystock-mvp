import React from 'react';
import { Link } from 'react-router-dom';
import { usePortfolios } from '../hooks/usePortfolios';

export const Portfolios: React.FC = () => {
  const { portfolios, loading, error } = usePortfolios();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">에러: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">포트폴리오</h1>
        <Link
          to="/portfolios/new"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          새 포트폴리오
        </Link>
      </div>

      <div className="space-y-4">
        {portfolios.map((portfolio) => (
          <Link
            key={portfolio.id}
            to={`/portfolios/${portfolio.id}`}
            className="block bg-gray-800 p-4 rounded-lg hover:bg-gray-700"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-medium">{portfolio.name}</h2>
                <p className="text-sm text-gray-400">
                  {portfolio.currency}
                </p>
              </div>
              <div className="text-sm text-gray-400">
                {portfolio.config?.targetAllocation}%
              </div>
            </div>
          </Link>
        ))}

        {portfolios.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            등록된 포트폴리오가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}; 