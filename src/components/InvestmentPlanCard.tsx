import {
    ChartBarIcon,
    CheckCircleIcon,
    ClockIcon,
    CurrencyDollarIcon,
    PlayIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import React from 'react';
import { Link } from 'react-router-dom';
import { InvestmentEntry, InvestmentPlan } from '../types';
import { formatCurrency } from '../utils/currencyUtils';

interface Props {
  plan: InvestmentPlan;
  currency: 'KRW' | 'USD';
  portfolioId: number;
  onExecuteEntry: (entry: InvestmentEntry) => void;
  onCancelPlan: (planId: number) => void;
}

export const InvestmentPlanCard: React.FC<Props> = ({
  plan,
  currency,
  portfolioId,
  onExecuteEntry,
  onCancelPlan,
}) => {
  const progressRate = (plan.executedEntries / plan.plannedEntries) * 100;
  const nextEntry = plan.entries
    .filter(entry => entry.status === 'PLANNED')
    .sort((a, b) => a.entryNumber - b.entryNumber)[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED': return 'text-blue-400';
      case 'IN_PROGRESS': return 'text-yellow-400';
      case 'COMPLETED': return 'text-green-400';
      case 'CANCELLED': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PLANNED': return <ClockIcon className="h-4 w-4" />;
      case 'IN_PROGRESS': return <PlayIcon className="h-4 w-4" />;
      case 'COMPLETED': return <CheckCircleIcon className="h-4 w-4" />;
      case 'CANCELLED': return <XCircleIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PLANNED': return '계획됨';
      case 'IN_PROGRESS': return '진행 중';
      case 'COMPLETED': return '완료';
      case 'CANCELLED': return '취소됨';
      default: return '알 수 없음';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-white">{plan.symbol}</h3>
          <p className="text-sm text-gray-400">{plan.name}</p>
        </div>
        <div className={`flex items-center ${getStatusColor(plan.status)}`}>
          {getStatusIcon(plan.status)}
          <span className="ml-1 text-xs font-medium">
            {getStatusText(plan.status)}
          </span>
        </div>
      </div>

      {/* 진행률 */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">진행률</span>
          <span className="text-white">{progressRate.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressRate}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{plan.executedEntries}/{plan.plannedEntries} 회차</span>
          <span>{formatCurrency(plan.totalBudget - plan.remainingBudget, currency)} / {formatCurrency(plan.totalBudget, currency)}</span>
        </div>
      </div>

      {/* 투자 정보 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-700 p-3 rounded">
          <div className="flex items-center mb-1">
            <CurrencyDollarIcon className="h-4 w-4 text-green-400 mr-1" />
            <span className="text-xs text-gray-400">총 예산</span>
          </div>
          <p className="text-sm font-medium text-white">
            {formatCurrency(plan.totalBudget, currency)}
          </p>
        </div>
        <div className="bg-gray-700 p-3 rounded">
          <div className="flex items-center mb-1">
            <ChartBarIcon className="h-4 w-4 text-blue-400 mr-1" />
            <span className="text-xs text-gray-400">남은 예산</span>
          </div>
          <p className="text-sm font-medium text-white">
            {formatCurrency(plan.remainingBudget, currency)}
          </p>
        </div>
      </div>

      {/* 다음 회차 정보 */}
      {nextEntry && plan.status !== 'CANCELLED' && (
        <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-400">
              다음 회차: {nextEntry.entryNumber}회차
            </span>
            <span className="text-sm text-blue-300">
              {formatCurrency(nextEntry.plannedAmount, currency)}
            </span>
          </div>
          <button
            onClick={() => onExecuteEntry(nextEntry)}
            className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
          >
            <PlayIcon className="h-4 w-4 inline mr-1" />
            {nextEntry.entryNumber}회차 매수 실행
          </button>
        </div>
      )}

      {/* 버튼들 */}
      <div className="flex gap-2">
        <Link
          to={`/portfolios/${portfolioId}/investment-plans/${plan.id}`}
          className="flex-1 px-3 py-2 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors text-center"
        >
          상세 보기
        </Link>
        {plan.status === 'PLANNED' && plan.executedEntries === 0 && (
          <button
            onClick={() => onCancelPlan(plan.id)}
            className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
          >
            취소
          </button>
        )}
      </div>

      {/* 회차별 상태 */}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-400">회차별 진행 상황</span>
        </div>
        <div className="flex gap-1">
          {plan.entries.map((entry) => (
            <div
              key={entry.id}
              className={`flex-1 h-2 rounded ${
                entry.status === 'EXECUTED' 
                  ? 'bg-green-500' 
                  : entry.status === 'CANCELLED'
                  ? 'bg-red-500'
                  : 'bg-gray-600'
              }`}
              title={`${entry.entryNumber}회차 - ${
                entry.status === 'EXECUTED' ? '실행됨' :
                entry.status === 'CANCELLED' ? '취소됨' : '대기 중'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}; 