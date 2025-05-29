import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PortfolioGroupService } from '../services/portfolioGroupService';
import { PortfolioService } from '../services/portfolioService';
import { PortfolioCategory, PortfolioGroup } from '../types';

export const NewPortfolioPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<PortfolioGroup | null>(null);
  const [accountName, setAccountName] = useState('');
  const [broker, setBroker] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [totalCapital, setTotalCapital] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroup();
  }, [groupId]);

  const loadGroup = async () => {
    if (!groupId) return;
    try {
      const data = await PortfolioGroupService.getById(Number(groupId));
      if (data) {
        setGroup(data);
      }
    } catch (error) {
      console.error('포트폴리오 그룹 로딩 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group) return;

    try {
      await PortfolioService.create({
        groupId: group.id,
        accountName: accountName.trim(),
        broker: broker.trim(),
        accountNumber: accountNumber.trim(),
        currency: 'KRW',
        config: {
          totalCapital,
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
      navigate(`/portfolio-groups/${groupId}`);
    } catch (error) {
      console.error('포트폴리오 생성 중 오류:', error);
      alert('포트폴리오 생성에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="p-4 text-center">
        <p>포트폴리오 그룹을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">새 계좌 추가</h1>
        <p className="text-gray-400 mb-8">
          {group.name} 그룹에 새 계좌를 추가합니다.
        </p>

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

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/portfolio-groups/${groupId}`)}
              className="px-6 py-2 text-gray-400 hover:text-gray-300"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={!accountName.trim() || !broker.trim() || !accountNumber.trim()}
            >
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 