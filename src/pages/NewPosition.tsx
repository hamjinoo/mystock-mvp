import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PortfolioService } from '../services/portfolioService';
import { NewPosition, Portfolio, PortfolioCategory } from '../types';

export const NewPositionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [avgPrice, setAvgPrice] = useState(0);
  const [strategyCategory, setStrategyCategory] = useState<PortfolioCategory>(PortfolioCategory.UNCATEGORIZED);
  const [strategyTags, setStrategyTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
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
      const newPosition: NewPosition = {
        portfolioId: portfolio.id,
        symbol: symbol.trim().toUpperCase(),
        name: name.trim(),
        quantity,
        currentPrice,
        avgPrice,
        tradeDate: Date.now(),
        strategyCategory,
        strategyTags
      };

      await PortfolioService.createPosition(newPosition);
      navigate(`/portfolios/${id}`);
    } catch (error) {
      console.error('포지션 추가 중 오류:', error);
      alert('포지션 추가에 실패했습니다.');
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !strategyTags.includes(newTag.trim())) {
      setStrategyTags([...strategyTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setStrategyTags(strategyTags.filter(t => t !== tag));
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
        <h1 className="text-2xl font-bold mb-8">새 포지션 추가</h1>

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
              수량
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="1"
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              평균 매수가
            </label>
            <input
              type="number"
              value={avgPrice}
              onChange={(e) => setAvgPrice(Number(e.target.value))}
              className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              투자 전략
            </label>
            <select
              value={strategyCategory}
              onChange={(e) => setStrategyCategory(e.target.value as PortfolioCategory)}
              className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(PortfolioCategory).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              태그
            </label>
            <div className="flex gap-2 flex-wrap mb-2">
              {strategyTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-700 rounded-full text-sm flex items-center"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-gray-400 hover:text-gray-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="새 태그 추가"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >
                추가
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
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
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 