import { ChartBarIcon, ClipboardDocumentListIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PortfolioGroupService } from '../services/portfolioGroupService';
import { PortfolioGroup } from '../types';

export const MainPage: React.FC = () => {
  const [groups, setGroups] = useState<PortfolioGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const groups = await PortfolioGroupService.getAll();
      setGroups(groups);
    } catch (error) {
      console.error('Error loading portfolio groups:', error);
    } finally {
      setLoading(false);
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
    <div>
      <div className="p-6">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-4">
          <Link
            to="/portfolio-groups"
            className="bg-gray-800 p-6 rounded-lg flex flex-col items-center justify-center text-center"
          >
            <ChartBarIcon className="h-8 w-8 mb-2" />
            <div className="font-semibold">포트폴리오</div>
            <div className="text-sm text-gray-400">{groups.length}개 그룹</div>
          </Link>
          <Link
            to="/memos"
            className="bg-gray-800 p-6 rounded-lg flex flex-col items-center justify-center text-center"
          >
            <DocumentTextIcon className="h-8 w-8 mb-2" />
            <div className="font-semibold">메모장</div>
          </Link>
          <Link
            to="/todo"
            className="bg-gray-800 p-6 rounded-lg flex flex-col items-center justify-center text-center"
          >
            <ClipboardDocumentListIcon className="h-8 w-8 mb-2" />
            <div className="font-semibold">할 일</div>
          </Link>
          <Link
            to="/portfolio-groups/new"
            className="bg-gray-800 p-6 rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-700"
          >
            <div className="font-semibold">새 포트폴리오 그룹</div>
          </Link>
        </div>
      </div>
    </div>
  );
}; 