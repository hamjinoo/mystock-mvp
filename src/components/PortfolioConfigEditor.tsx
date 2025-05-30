import React from 'react';
import { CategoryConfig, PortfolioCategory, PortfolioConfig } from '../types';

interface Props {
  config: PortfolioConfig;
  onChange: (config: PortfolioConfig) => void;
}

const DEFAULT_CONFIG: PortfolioConfig = {
  targetAllocation: 0,
  period: 'UNCATEGORIZED',
  description: '',
  categoryAllocations: {
    LONG_TERM: {
      targetPercentage: 50,
      maxStockPercentage: 10,
      maxEntries: 3
    },
    MID_TERM: {
      targetPercentage: 30,
      maxStockPercentage: 7.5,
      maxEntries: 2
    },
    SHORT_TERM: {
      targetPercentage: 5,
      maxStockPercentage: 5,
      maxEntries: 1
    },
    UNCATEGORIZED: {
      targetPercentage: 15,
      maxStockPercentage: 100,
      maxEntries: 1
    }
  }
};

const CATEGORY_LABELS: Record<PortfolioCategory, string> = {
  LONG_TERM: '장기 투자',
  MID_TERM: '중기 투자',
  SHORT_TERM: '단기 투자',
  UNCATEGORIZED: '미분류'
};

export const PortfolioConfigEditor: React.FC<Props> = ({ config, onChange }) => {
  const handleCategoryChange = (
    category: PortfolioCategory,
    field: keyof CategoryConfig,
    value: number
  ) => {
    onChange({
      ...config,
      categoryAllocations: {
        ...config.categoryAllocations,
        [category]: {
          ...config.categoryAllocations?.[category],
          [field]: value
        }
      }
    });
  };

  const totalPercentage = Object.values(config.categoryAllocations || {}).reduce(
    (sum, allocation) => sum + (allocation?.targetPercentage || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          목표 배분율
        </label>
        <input
          type="number"
          value={config.targetAllocation}
          onChange={(e) => onChange({ ...config, targetAllocation: Number(e.target.value) })}
          className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
          max="100"
          step="1"
        />
        <p className="mt-1 text-sm text-gray-400">
          전체 자산 중 이 포트폴리오의 목표 비중 (%)
        </p>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">카테고리별 설정</h3>
        {Object.entries(config.categoryAllocations || {}).map(([category, allocation]) => (
          <div key={category} className="mb-6">
            <h4 className="font-medium mb-2">
              {CATEGORY_LABELS[category as PortfolioCategory]}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  목표 비중 (%)
                </label>
                <input
                  type="number"
                  value={allocation?.targetPercentage || 0}
                  onChange={(e) =>
                    handleCategoryChange(
                      category as PortfolioCategory,
                      'targetPercentage',
                      Number(e.target.value)
                    )
                  }
                  className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                  step="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  최대 종목 비중 (%)
                </label>
                <input
                  type="number"
                  value={allocation?.maxStockPercentage || 0}
                  onChange={(e) =>
                    handleCategoryChange(
                      category as PortfolioCategory,
                      'maxStockPercentage',
                      Number(e.target.value)
                    )
                  }
                  className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  최대 종목 수
                </label>
                <input
                  type="number"
                  value={allocation?.maxEntries || 0}
                  onChange={(e) =>
                    handleCategoryChange(
                      category as PortfolioCategory,
                      'maxEntries',
                      Number(e.target.value)
                    )
                  }
                  className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  step="1"
                />
              </div>
            </div>
          </div>
        ))}
        <div className="mt-2 text-sm">
          <span className={totalPercentage === 100 ? 'text-green-500' : 'text-yellow-500'}>
            전체 비중: {totalPercentage}%
          </span>
        </div>
      </div>
    </div>
  );
}; 