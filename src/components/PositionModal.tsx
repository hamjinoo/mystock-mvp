import React, { useEffect, useState } from 'react';
import { usePositionPlan } from '../hooks/usePositionPlan';
import { db } from '../services/db';
import { NewPosition, PortfolioCategory, PortfolioConfig, Position } from '../types';

interface PositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  portfolioId: number;
  position?: Position;
}

export const PositionModal: React.FC<PositionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  portfolioId,
  position,
}) => {
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [avgPrice, setAvgPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [strategy, setStrategy] = useState('');
  const [tradeDate, setTradeDate] = useState('');
  const [category, setCategory] = useState<PortfolioCategory>(PortfolioCategory.UNCATEGORIZED);
  const [entryCount, setEntryCount] = useState('1');
  const [maxEntries, setMaxEntries] = useState('1');
  const [targetQuantity, setTargetQuantity] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 포트폴리오 설정 로드
  const [portfolioConfig, setPortfolioConfig] = useState<PortfolioConfig>();
  useEffect(() => {
    const loadConfig = async () => {
      const portfolio = await db.portfolios.get(portfolioId);
      if (portfolio?.config) {
        setPortfolioConfig(portfolio.config);
      }
    };
    loadConfig();
  }, [portfolioId]);

  // 투자 계획 계산
  const plan = usePositionPlan(
    {
      ...position,
      id: position?.id || 0,
      portfolioId,
      symbol: symbol || '',
      quantity: Number(quantity) || 0,
      avgPrice: Number(avgPrice) || 0,
      currentPrice: Number(currentPrice) || 0,
      tradeDate: new Date(tradeDate || Date.now()).getTime(),
      category,
      entryCount: Number(entryCount),
      maxEntries: Number(maxEntries),
      targetQuantity: Number(targetQuantity) || undefined,
    } as Position,
    portfolioConfig
  );

  useEffect(() => {
    if (position) {
      setSymbol(position.symbol);
      setQuantity(position.quantity.toString());
      setAvgPrice(position.avgPrice.toString());
      setCurrentPrice(position.currentPrice.toString());
      setStrategy(position.strategy || '');
      setTradeDate(new Date(position.tradeDate).toISOString().split('T')[0]);
      setCategory(position.category || PortfolioCategory.UNCATEGORIZED);
      setEntryCount(position.entryCount?.toString() || '1');
      setMaxEntries(position.maxEntries?.toString() || '1');
      setTargetQuantity(position.targetQuantity?.toString() || '');
    } else {
      setSymbol('');
      setQuantity('');
      setAvgPrice('');
      setCurrentPrice('');
      setStrategy('');
      setTradeDate('');
      setCategory(PortfolioCategory.UNCATEGORIZED);
      setEntryCount('1');
      setMaxEntries('1');
      setTargetQuantity('');
    }
  }, [position]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 분할매수 횟수 검증
    if (Number(entryCount) > Number(maxEntries)) {
      setError('현재 매수 횟수가 최대 매수 횟수를 초과할 수 없습니다.');
      return;
    }

    try {
      const positionData: NewPosition = {
        portfolioId,
        symbol: symbol.trim().toUpperCase(),
        name: symbol.trim().toUpperCase(),
        quantity: Number(quantity),
        avgPrice: Number(avgPrice),
        currentPrice: Number(currentPrice),
        strategy: strategy.trim() || undefined,
        tradeDate: new Date(tradeDate).getTime(),
        category: PortfolioCategory.UNCATEGORIZED,
        entryCount: Number(entryCount),
        maxEntries: Number(maxEntries),
        targetQuantity: Number(targetQuantity),
      };

      if (position) {
        await db.positions.update(position.id, {
          ...positionData,
          id: position.id,
        });
      } else {
        await db.addPosition(positionData);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '포지션 저장 중 오류가 발생했습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {position ? '포지션 수정' : '새 포지션'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="symbol" className="block text-sm font-medium mb-2">
                종목 코드
              </label>
              <input
                type="text"
                id="symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="예: AAPL"
                required
              />
            </div>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium mb-2">
                수량
              </label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                min="0"
                step="1"
                required
              />
            </div>
            <div>
              <label htmlFor="avgPrice" className="block text-sm font-medium mb-2">
                평균 매수가
              </label>
              <input
                type="number"
                id="avgPrice"
                value={avgPrice}
                onChange={(e) => setAvgPrice(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label htmlFor="currentPrice" className="block text-sm font-medium mb-2">
                현재가
              </label>
              <input
                type="number"
                id="currentPrice"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label htmlFor="strategy" className="block text-sm font-medium mb-2">
                투자 전략
              </label>
              <input
                type="text"
                id="strategy"
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="예: 가치투자"
              />
            </div>
            <div>
              <label htmlFor="tradeDate" className="block text-sm font-medium mb-2">
                거래일
              </label>
              <input
                type="date"
                id="tradeDate"
                value={tradeDate}
                onChange={(e) => setTradeDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-2">
                투자 카테고리
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as PortfolioCategory)}
                className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              >
                {Object.values(PortfolioCategory).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === PortfolioCategory.LONG_TERM && '장기 Core'}
                    {cat === PortfolioCategory.GROWTH && '성장 Satellite'}
                    {cat === PortfolioCategory.SHORT_TERM && '단기 기회'}
                    {cat === PortfolioCategory.CASH && '안전자산'}
                    {cat === PortfolioCategory.UNCATEGORIZED && '미분류'}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="entryCount" className="block text-sm font-medium mb-2">
                  현재 매수 횟수
                </label>
                <input
                  type="number"
                  id="entryCount"
                  value={entryCount}
                  onChange={(e) => setEntryCount(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  min="1"
                  required
                />
              </div>
              <div>
                <label htmlFor="maxEntries" className="block text-sm font-medium mb-2">
                  최대 매수 횟수
                </label>
                <input
                  type="number"
                  id="maxEntries"
                  value={maxEntries}
                  onChange={(e) => setMaxEntries(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  min="1"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="targetQuantity" className="block text-sm font-medium mb-2">
                목표 수량 (선택사항)
              </label>
              <input
                type="number"
                id="targetQuantity"
                value={targetQuantity}
                onChange={(e) => setTargetQuantity(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                min={Number(quantity)}
                step="1"
              />
            </div>
            {plan && (
              <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">투자 계획</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>최대 투자 가능:</span>
                    <span>₩{plan.maxInvestment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>현재 투자금:</span>
                    <span>₩{plan.investedAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>회차당 투자금:</span>
                    <span>₩{plan.perEntry.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>다음 매수 금액:</span>
                    <span>₩{plan.nextEntryAmount.toLocaleString()}</span>
                  </div>
                  {plan.nextTargetQuantity > 0 && (
                    <div className="flex justify-between">
                      <span>다음 매수 수량:</span>
                      <span>{plan.nextTargetQuantity}주</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>남은 매수 횟수:</span>
                    <span>{plan.remainingEntries}회</span>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>투자 진행률</span>
                      <span>{Math.round(plan.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, plan.progress)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {error && <p className="text-red-500 mt-4">{error}</p>}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white"
            >
              취소
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded-lg ${
                plan?.isOverLimit
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={plan?.isOverLimit}
            >
              {position ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 