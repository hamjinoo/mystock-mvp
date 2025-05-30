import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { PortfolioService } from '../services/portfolioService';
import { Portfolio, Position } from '../types';

interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  returnRate: number;
  positions: Position[];
}

interface ChartData {
  name: string;
  symbol: string;
  value: number;
  percentage: number;
}

const COLORS = [
  '#00C49F', '#0088FE', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'
];

export const PortfolioDetail: React.FC = () => {
  const { portfolioId } = useParams<{ portfolioId: string }>();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<Portfolio>();
  const [summary, setSummary] = useState<PortfolioSummary>();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    loadData();
  }, [portfolioId]);

  const loadData = async () => {
    if (!portfolioId) return;

    try {
      const [portfolioData, summaryData] = await Promise.all([
        PortfolioService.getById(Number(portfolioId)),
        PortfolioService.getPortfolioSummary(Number(portfolioId))
      ]);

      if (!portfolioData) {
        throw new Error('포트폴리오를 찾을 수 없습니다.');
      }

      setPortfolio(portfolioData);
      setSummary(summaryData);

      // 차트 데이터 생성
      if (summaryData.positions.length > 0) {
        const chartData = summaryData.positions.map((position: Position) => {
          const value = position.quantity * position.currentPrice;
          return {
            name: position.name,
            symbol: position.symbol,
            value,
            percentage: summaryData.totalValue > 0 ? (value / summaryData.totalValue) * 100 : 0
          };
        }).sort((a: ChartData, b: ChartData) => b.value - a.value);

        setChartData(chartData);
      }
    } catch (error) {
      console.error('포트폴리오 정보 로딩 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: portfolio?.currency || 'KRW'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
      </div>
    );
  }

  if (!portfolio || !summary) {
    return (
      <div className="p-4">
        <div className="text-center">
          <p className="text-gray-400">포트폴리오를 찾을 수 없습니다.</p>
          <Link
            to="/portfolios"
            className="inline-block mt-4 text-blue-500 hover:text-blue-400"
          >
            포트폴리오 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/portfolios')}
            className="text-sm text-gray-400 hover:text-white flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            뒤로
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">{portfolio.name}</h1>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-400">총자산</p>
              <p className="font-medium">{formatCurrency(summary.totalValue)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">수익률</p>
              <p className={`font-medium ${summary.returnRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {summary.returnRate.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">투자 기간</p>
              <p className="font-medium">{portfolio.config?.period || '미설정'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">자산 구성</h2>
            <div className="h-[400px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="symbol"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [
                        formatCurrency(value),
                        '평가금액'
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400">보유 종목이 없습니다.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">보유 종목</h2>
            <div className="space-y-4">
              {summary.positions.map((position, index) => {
                const value = position.quantity * position.currentPrice;
                const allocation = summary.totalValue > 0 ? (value / summary.totalValue) * 100 : 0;
                const returnRate = ((position.currentPrice - position.avgPrice) / position.avgPrice) * 100;

                return (
                  <div key={position.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div>
                        <p className="font-medium">{position.name}</p>
                        <p className="text-sm text-gray-400">{position.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(value)}</p>
                      <p className="text-sm text-gray-400">{allocation.toFixed(1)}%</p>
                      <p className={`text-sm ${returnRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {returnRate.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 