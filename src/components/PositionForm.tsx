import React, { useEffect, useState } from 'react';
import { Position } from '../types';

interface Props {
  initialData?: Partial<Position>;
  onSubmit: (data: Partial<Position>) => void;
  onCancel: () => void;
  portfolioId?: number;
}

const defaultFormData: Partial<Position> = {
  symbol: '',
  name: '',
  quantity: 0,
  avgPrice: 0,
  currentPrice: 0,
  strategyCategory: 'UNCATEGORIZED',
  strategyTags: []
};

export const PositionForm: React.FC<Props> = ({
  initialData,
  onSubmit,
  onCancel,
  portfolioId
}) => {
  const [formData, setFormData] = useState<Partial<Position>>({
    ...defaultFormData,
    ...initialData,
    portfolioId,
  });

  useEffect(() => {
    if (portfolioId) {
      setFormData(prev => ({ ...prev, portfolioId }));
    }
  }, [portfolioId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.portfolioId) return;

    const submitData: Partial<Position> = {
      ...formData,
      symbol: formData.symbol?.trim().toUpperCase(),
      name: formData.name?.trim() || formData.symbol?.trim().toUpperCase(),
      strategyCategory: formData.strategyCategory || 'UNCATEGORIZED',
      strategyTags: formData.strategyTags || []
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          종목 코드
        </label>
        <input
          type="text"
          value={formData.symbol || ''}
          onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
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
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="예: Apple Inc., 삼성전자"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            수량
          </label>
          <input
            type="number"
            value={formData.quantity || 0}
            onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
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
            value={formData.avgPrice || 0}
            onChange={(e) => setFormData({ ...formData, avgPrice: Number(e.target.value) })}
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
            value={formData.currentPrice || 0}
            onChange={(e) => setFormData({ ...formData, currentPrice: Number(e.target.value) })}
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
          onClick={onCancel}
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
    </form>
  );
}; 