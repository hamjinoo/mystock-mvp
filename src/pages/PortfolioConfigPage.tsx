import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PortfolioService } from '../services/portfolioService';
import { Portfolio } from '../types';

export const PortfolioConfigPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [accountName, setAccountName] = useState('');
  const [broker, setBroker] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [totalCapital, setTotalCapital] = useState(0);
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
        setAccountName(data.accountName);
        setBroker(data.broker);
        setAccountNumber(data.accountNumber);
        setTotalCapital(data.config?.totalCapital || 0);
      }
    } catch (error) {
      console.error('포트폴리오 로딩 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolio) return;

    try {
      await PortfolioService.update(portfolio.id, {
        ...portfolio,
        accountName: accountName.trim(),
        broker: broker.trim(),
        accountNumber: accountNumber.trim(),
        config: {
          ...portfolio.config,
          totalCapital,
          categoryAllocations: portfolio.config?.categoryAllocations || {
            'LONG_TERM': {
              targetPercentage: 50,
              maxStockPercentage: 10,
              maxEntries: 3
            },
            'MID_TERM': {
              targetPercentage: 30,
              maxStockPercentage: 7.5,
              maxEntries: 2
            },
            'SHORT_TERM': {
              targetPercentage: 5,
              maxStockPercentage: 5,
              maxEntries: 1
            },
            'UNCATEGORIZED': {
              targetPercentage: 15,
              maxStockPercentage: 100,
              maxEntries: 1
            }
          }
        }
      });
      navigate(`/portfolios/${id}`);
    } catch (error) {
      console.error('포트폴리오 업데이트 중 오류:', error);
      alert('포트폴리오 설정 저장에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!portfolio || !window.confirm('이 포트폴리오를 삭제하시겠습니까?')) return;

    try {
      await PortfolioService.delete(portfolio.id);
      navigate(`/portfolio-groups/${portfolio.groupId}`);
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

  if (!portfolio) {
    return (
      <div className="p-4 text-center">
        <p>포트폴리오를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">포트폴리오 설정</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              계좌 이름
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 장기투자 계좌, 미국주식 계좌"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              증권사
            </label>
            <input
              type="text"
              value={broker}
              onChange={(e) => setBroker(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 미래에셋, NH투자증권"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              계좌번호
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="계좌번호를 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              총 자산 규모
            </label>
            <input
              type="number"
              value={totalCapital}
              onChange={(e) => setTotalCapital(Number(e.target.value))}
              className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="1000"
            />
          </div>

          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={handleDelete}
              className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              삭제
            </button>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate(`/portfolios/${id}`)}
                className="px-6 py-2 text-gray-400 hover:text-gray-300"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                저장
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}; 