import { ChartBarIcon, ClipboardDocumentListIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { NewPortfolioModal } from '../components/NewPortfolioModal';
import { db } from '../services/db';
import { Portfolio, Position } from '../types';

export const MainPage: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalAssets, setTotalAssets] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [profitPercent, setProfitPercent] = useState(0);

  const loadData = async () => {
    try {
      const portfolios = await db.portfolios.toArray();
      setPortfolios(portfolios);

      const positions = await db.positions.toArray();
      setPositions(positions);

      // 총자산 계산
      const total = positions.reduce((sum, pos) => sum + (pos.quantity * pos.currentPrice), 0);
      setTotalAssets(total);

      // 총 수익 계산
      const invested = positions.reduce((sum, pos) => sum + (pos.quantity * pos.avgPrice), 0);
      const profit = total - invested;
      setTotalProfit(profit);
      setProfitPercent(invested > 0 ? (profit / invested) * 100 : 0);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 상단 대시보드 */}
      <div className="bg-gray-800 p-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4">내 자산</h1>
          <div className="space-y-4">
            <div>
              <div className="text-gray-400 text-sm">총자산</div>
              <div className="text-2xl font-bold">
                ₩{totalAssets.toLocaleString()}
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-gray-400 text-sm">총수익</div>
                <div className={`text-xl font-bold ${totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ₩{totalProfit.toLocaleString()}
                </div>
              </div>
              <div className={`text-xl font-bold ${profitPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {profitPercent.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메뉴 그리드 */}
      <div className="p-6">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-4">
          <Link
            to="/portfolio"
            className="bg-gray-800 p-6 rounded-lg flex flex-col items-center justify-center text-center"
          >
            <ChartBarIcon className="h-8 w-8 mb-2" />
            <div className="font-semibold">포트폴리오</div>
            <div className="text-sm text-gray-400">{portfolios.length}개</div>
          </Link>
          <Link
            to="/memo"
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
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gray-800 p-6 rounded-lg flex flex-col items-center justify-center text-center"
          >
            <div className="font-semibold">새 포트폴리오</div>
          </button>
        </div>
      </div>

      <NewPortfolioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}; 