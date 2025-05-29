import { PlusIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PortfolioGroupService } from '../services/portfolioGroupService';
import { PortfolioGroup } from '../types';

export const PortfolioList: React.FC = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<PortfolioGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const data = await PortfolioGroupService.getAll();
      setGroups(data);
    } catch (error) {
      console.error('포트폴리오 그룹 로딩 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (groupId: number) => {
    if (!window.confirm('이 포트폴리오 그룹을 삭제하시겠습니까?')) return;

    try {
      await PortfolioGroupService.delete(groupId);
      await loadGroups();
    } catch (error) {
      console.error('포트폴리오 그룹 삭제 중 오류:', error);
      alert('포트폴리오 그룹 삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">포트폴리오 그룹</h1>
        <Link
          to="/portfolio-groups/new"
          className="flex items-center px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          새 그룹 추가
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <div
            key={group.id}
            className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">{group.name}</h2>
              <button
                onClick={() => handleDelete(group.id)}
                className="text-gray-400 hover:text-red-500"
          >
                ×
          </button>
        </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">
                목표 비중: {group.config?.targetAllocation || 0}%
              </p>
              <p className="text-sm text-gray-400">
                위험 수준: {group.config?.riskLevel || 0}
              </p>
                    </div>
            <div className="mt-4 flex justify-end">
                <button
                onClick={() => navigate(`/portfolio-groups/${group.id}/portfolios/new`)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                계좌 추가
                </button>
              </div>
          </div>
        ))}

        {groups.length === 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-400 mb-4">아직 포트폴리오 그룹이 없습니다.</p>
            <Link
              to="/portfolio-groups/new"
              className="inline-flex items-center px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              첫 그룹 추가
            </Link>
        </div>
        )}
      </div>
    </div>
  );
}; 