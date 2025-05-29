import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PortfolioConfigEditor } from '../components/PortfolioConfigEditor';
import { db } from '../services/db';
import { Portfolio, PortfolioConfig } from '../types';

export const PortfolioConfigPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPortfolio = async () => {
      if (!id) return;
      
      try {
        const portfolio = await db.portfolios.get(Number(id));
        if (portfolio) {
          setPortfolio(portfolio);
        } else {
          setError('포트폴리오를 찾을 수 없습니다.');
        }
      } catch (err) {
        setError('포트폴리오 로딩 중 오류가 발생했습니다.');
      }
    };

    loadPortfolio();
  }, [id]);

  const handleSave = async (config: PortfolioConfig) => {
    if (!id || !portfolio) return;

    try {
      const updatedPortfolio = {
        ...portfolio,
        config,
      };
      await db.updatePortfolio(updatedPortfolio);
      navigate(`/portfolio/${id}`);
    } catch (err) {
      setError('설정 저장 중 오류가 발생했습니다.');
    }
  };

  if (error) {
    return (
      <div className="p-4">
        <div className="max-w-2xl mx-auto">
          <div className="p-4 bg-red-900 bg-opacity-50 text-red-300 rounded-lg">
            {error}
          </div>
          <button
            onClick={() => navigate(`/portfolio/${id}`)}
            className="mt-4 text-blue-500 hover:text-blue-400"
          >
            포트폴리오로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!portfolio) {
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

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">포트폴리오 설정</h1>
          <div className="text-sm text-gray-400">
            {portfolio.name}
          </div>
        </div>

        <PortfolioConfigEditor
          initialConfig={portfolio.config}
          onSave={handleSave}
          onCancel={() => navigate(`/portfolio/${id}`)}
        />
      </div>
    </div>
  );
}; 