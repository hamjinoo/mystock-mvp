import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PortfolioGroupService } from '../services/portfolioGroupService';
import { PortfolioCategory } from '../types';

export const NewPortfolioGroupPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [targetAllocation, setTargetAllocation] = useState(0);
  const [riskLevel, setRiskLevel] = useState(3);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await PortfolioGroupService.create({
        name: name.trim(),
        config: {
          targetAllocation,
          riskLevel,
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
        }
      });
      navigate('/portfolio-groups');
    } catch (error) {
      console.error('포트폴리오 그룹 생성 중 오류:', error);
      alert('포트폴리오 그룹 생성에 실패했습니다.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">새 포트폴리오 그룹</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              그룹 이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 장기 투자, 성장주 투자 등"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              목표 비중 (%)
            </label>
            <input
              type="number"
              value={targetAllocation}
              onChange={(e) => setTargetAllocation(Number(e.target.value))}
              className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              max="100"
              step="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              위험 수준 (1-5)
            </label>
            <input
              type="range"
              value={riskLevel}
              onChange={(e) => setRiskLevel(Number(e.target.value))}
              className="w-full"
              min="1"
              max="5"
              step="1"
            />
            <div className="flex justify-between text-sm text-gray-400">
              <span>안전</span>
              <span>중립</span>
              <span>공격</span>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/portfolio-groups')}
              className="px-6 py-2 text-gray-400 hover:text-gray-300"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={!name.trim()}
            >
              생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 