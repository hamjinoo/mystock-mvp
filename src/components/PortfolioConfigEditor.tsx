import React, { useState } from 'react';
import { PortfolioCategory, PortfolioConfig } from '../types';

interface PortfolioConfigEditorProps {
  initialConfig?: PortfolioConfig;
  onSave: (config: PortfolioConfig) => void;
  onCancel: () => void;
}

const DEFAULT_CONFIG: PortfolioConfig = {
  totalCapital: 10000000, // 1000만원
  categoryAllocations: {
    [PortfolioCategory.LONG_TERM]: {
      targetPercentage: 50,
      maxStockPercentage: 10,
      maxEntries: 3
    },
    [PortfolioCategory.GROWTH]: {
      targetPercentage: 30,
      maxStockPercentage: 7.5,
      maxEntries: 2
    },
    [PortfolioCategory.SHORT_TERM]: {
      targetPercentage: 5,
      maxStockPercentage: 5,
      maxEntries: 1
    },
    [PortfolioCategory.CASH]: {
      targetPercentage: 15,
      maxStockPercentage: 100,
      maxEntries: 1
    },
    [PortfolioCategory.UNCATEGORIZED]: {
      targetPercentage: 0,
      maxStockPercentage: 0,
      maxEntries: 1
    }
  }
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

export const PortfolioConfigEditor: React.FC<PortfolioConfigEditorProps> = ({
  initialConfig,
  onSave,
  onCancel
}) => {
  const [config, setConfig] = useState<PortfolioConfig>(initialConfig || DEFAULT_CONFIG);
  const [error, setError] = useState<string | null>(null);

  const handleTotalCapitalChange = (value: string) => {
    setConfig(prev => ({
      ...prev,
      totalCapital: Number(value)
    }));
  };

  const handleCategoryChange = (
    category: PortfolioCategory,
    field: keyof typeof config.categoryAllocations[PortfolioCategory],
    value: string
  ) => {
    setConfig(prev => ({
      ...prev,
      categoryAllocations: {
        ...prev.categoryAllocations,
        [category]: {
          ...prev.categoryAllocations[category],
          [field]: Number(value)
        }
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 카테고리별 목표 비중 합계가 100%인지 검증
    const totalPercentage = Object.values(config.categoryAllocations)
      .reduce((sum, cat) => sum + cat.targetPercentage, 0);
    
    if (Math.abs(totalPercentage - 100) > 0.1) {
      setError('카테고리별 목표 비중의 합이 100%여야 합니다.');
      return;
    }

    onSave(config);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          총 자산 규모
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={config.totalCapital}
            onChange={(e) => handleTotalCapitalChange(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            min="0"
            step="1000000"
            required
          />
          <span className="text-gray-400">원</span>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(config.categoryAllocations).map(([category, allocation]) => (
          <div key={category} className="p-4 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-medium mb-4">
              {getCategoryLabel(category as PortfolioCategory)}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  목표 비중 (%)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    value={allocation.targetPercentage}
                    onChange={(e) => handleCategoryChange(
                      category as PortfolioCategory,
                      'targetPercentage',
                      e.target.value
                    )}
                    className="flex-1"
                    min="0"
                    max="100"
                    step="5"
                  />
                  <span className="w-16 text-right">
                    {allocation.targetPercentage}%
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  종목당 최대 비중 (%)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    value={allocation.maxStockPercentage}
                    onChange={(e) => handleCategoryChange(
                      category as PortfolioCategory,
                      'maxStockPercentage',
                      e.target.value
                    )}
                    className="flex-1"
                    min="0"
                    max="100"
                    step="0.5"
                  />
                  <span className="w-16 text-right">
                    {allocation.maxStockPercentage}%
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  최대 분할 매수 횟수
                </label>
                <input
                  type="number"
                  value={allocation.maxEntries}
                  onChange={(e) => handleCategoryChange(
                    category as PortfolioCategory,
                    'maxEntries',
                    e.target.value
                  )}
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  min="1"
                  max="10"
                  required
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-900 bg-opacity-50 text-red-300 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-3">
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