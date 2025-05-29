import React, { useState } from 'react';
import { PortfolioCategory, Position } from '../types';

interface PositionFormProps {
  position?: Position;
  portfolioId: number;
  onSave: (position: Position) => void;
  onCancel: () => void;
}

const DEFAULT_POSITION: Partial<Position> = {
  symbol: '',
  name: '',
  quantity: 0,
  avgPrice: 0,
  currentPrice: 0,
  category: PortfolioCategory.UNCATEGORIZED,
  entryCount: 1,
  maxEntries: 1,
};

const getCategoryLabel = (category: PortfolioCategory) => {
  switch (category) {
    case PortfolioCategory.LONG_TERM:
      return '장기 Core';
    case PortfolioCategory.GROWTH:
      return '성장 Satellite';
    case PortfolioCategory.SHORT_TERM:
      return '단기 기회';
    case PortfolioCategory.CASH:
      return '안전자산';
    default:
      return '미분류';
  }
};

export const PositionForm: React.FC<PositionFormProps> = ({
  position,
  portfolioId,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Partial<Position>>({
    ...DEFAULT_POSITION,
    ...position,
    portfolioId,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.symbol || !formData.quantity || !formData.avgPrice || !formData.currentPrice) {
      return;
    }

    onSave({
      id: position?.id || Date.now(),
      portfolioId,
      symbol: formData.symbol,
      name: formData.name || formData.symbol,
      quantity: Number(formData.quantity),
      avgPrice: Number(formData.avgPrice),
      currentPrice: Number(formData.currentPrice),
      tradeDate: position?.tradeDate || Date.now(),
      category: formData.category || PortfolioCategory.UNCATEGORIZED,
      strategy: formData.strategy,
      entryCount: Number(formData.entryCount) || 1,
      maxEntries: Number(formData.maxEntries) || 1,
      targetQuantity: Number(formData.targetQuantity) || Number(formData.quantity),
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">종목 코드</label>
          <input
            type="text"
            name="symbol"
            value={formData.symbol}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">종목명</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">수량</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            min="0"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">목표 수량</label>
          <input
            type="number"
            name="targetQuantity"
            value={formData.targetQuantity}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            min={formData.quantity}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">평균단가</label>
          <input
            type="number"
            name="avgPrice"
            value={formData.avgPrice}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            min="0"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">현재가</label>
          <input
            type="number"
            name="currentPrice"
            value={formData.currentPrice}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            min="0"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">카테고리</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {Object.values(PortfolioCategory).map((category) => (
              <option key={category} value={category}>
                {getCategoryLabel(category)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">전략</label>
          <input
            type="text"
            name="strategy"
            value={formData.strategy}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="예: 가치투자, 모멘텀 등"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">현재 매수 횟수</label>
          <input
            type="number"
            name="entryCount"
            value={formData.entryCount}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            min="1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">총 매수 횟수</label>
          <input
            type="number"
            name="maxEntries"
            value={formData.maxEntries}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            min={formData.entryCount}
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-400 hover:text-white"
        >
          취소
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          저장
        </button>
      </div>
    </form>
  );
}; 