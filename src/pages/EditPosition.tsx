import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AccountService } from '../services/accountService';
import { PortfolioService } from '../services/portfolioService';
import { Account, Portfolio, Position } from '../types';

export const EditPosition: React.FC = () => {
  const { accountId, positionId } = useParams<{ accountId: string; positionId: string }>();
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account>();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [position, setPosition] = useState<Position>();
  const [loading, setLoading] = useState(true);

  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [avgPrice, setAvgPrice] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [portfolioId, setPortfolioId] = useState<number>();
  const [category, setCategory] = useState<'LONG_TERM' | 'MID_TERM' | 'SHORT_TERM' | 'UNCATEGORIZED'>('UNCATEGORIZED');

  useEffect(() => {
    loadData();
  }, [accountId, positionId]);

  const loadData = async () => {
    if (!accountId || !positionId) return;

    try {
      const [accountData, portfoliosData, positionData] = await Promise.all([
        AccountService.getById(Number(accountId)),
        PortfolioService.getAll(),
        PortfolioService.getPositionById(Number(positionId))
      ]);

      if (!accountData || !positionData) throw new Error('데이터를 찾을 수 없습니다.');

      setAccount(accountData);
      setPortfolios(portfoliosData);
      setPosition(positionData);

      // 포지션 데이터로 폼 초기화
      setSymbol(positionData.symbol);
      setName(positionData.name);
      setQuantity(positionData.quantity);
      setAvgPrice(positionData.avgPrice);
      setCurrentPrice(positionData.currentPrice);
      setPortfolioId(positionData.portfolioId);
      setCategory(positionData.strategyCategory);
    } catch (error) {
      console.error('데이터 로딩 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId || !positionId || !portfolioId) return;

    try {
      await PortfolioService.updatePosition(Number(positionId), {
        portfolioId,
        symbol: symbol.trim().toUpperCase(),
        name: name.trim() || symbol.trim().toUpperCase(),
        quantity,
        avgPrice,
        currentPrice,
        strategyCategory: category
      });
      navigate(`/accounts/${accountId}`);
    } catch (error) {
      console.error('포지션 수정 중 오류:', error);
      alert('포지션 수정에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
      </div>
    );
  }

  if (!account || !position) {
    return (
      <div className="p-4">
        <div className="text-center">
          <p className="text-gray-400">데이터를 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate('/accounts')}
            className="mt-4 text-blue-500 hover:text-blue-400"
          >
            계좌 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">포지션 수정</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              종목 코드
            </label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: AAPL, 005930"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              종목명
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: Apple Inc., 삼성전자"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              포트폴리오
            </label>
            <select
              value={portfolioId}
              onChange={(e) => setPortfolioId(Number(e.target.value))}
              className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {portfolios.map((portfolio) => (
                <option key={portfolio.id} value={portfolio.id}>
                  {portfolio.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              카테고리
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as 'LONG_TERM' | 'MID_TERM' | 'SHORT_TERM' | 'UNCATEGORIZED')}
              className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {['LONG_TERM', 'MID_TERM', 'SHORT_TERM', 'UNCATEGORIZED'].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                수량
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                평균단가
              </label>
              <input
                type="number"
                value={avgPrice}
                onChange={(e) => setAvgPrice(Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                현재가
              </label>
              <input
                type="number"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/accounts/${accountId}`)}
              className="px-4 py-2 text-gray-400 hover:text-gray-300"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 