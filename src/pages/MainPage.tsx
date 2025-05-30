import { ChartBarIcon, ClipboardDocumentListIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PortfolioService } from '../services/portfolioService';
import { Portfolio } from '../types';

export const MainPage: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const portfolios = await PortfolioService.getAll();
      setPortfolios(portfolios);
    } catch (error) {
      console.error('Error loading portfolios:', error);
    } finally {
      setLoading(false);
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
    <div>
      <div className="p-6">
        <div className="max-w-md mx-auto space-y-4">
          <Link
            to="/portfolios"
            className="bg-gray-800 p-6 rounded-lg flex flex-col items-center justify-center text-center"
          >
            <ChartBarIcon className="h-8 w-8 mb-2" />
            <div className="font-semibold">포트폴리오</div>
            <div className="text-sm text-gray-400">{portfolios.length}개</div>
          </Link>
          <Link
            to="/memos"
            className="bg-gray-800 p-6 rounded-lg flex flex-col items-center justify-center text-center"
          >
            <DocumentTextIcon className="h-8 w-8 mb-2" />
            <div className="font-semibold">메모장</div>
          </Link>
          <Link
            to="/todo"
            className="bg-gray-800 p-6 rounded-lg flex flex-col items-center justify-center text-center"
          >
            <ClipboardDocumentListIcon className="h-8 w-8 mb-2" />
            <div className="font-semibold">할 일</div>
          </Link>
        </div>
      </div>
    </div>
  );
}; 