import {
    ArrowLeftIcon,
    CalendarDaysIcon,
    ChartBarIcon,
    CheckCircleIcon,
    ClockIcon,
    CurrencyDollarIcon,
    ExclamationTriangleIcon,
    PlayIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ExecuteEntryModal } from '../components/ExecuteEntryModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { InvestmentPlanService } from '../services/investmentPlanService';
import { PortfolioService } from '../services/portfolioService';
import { InvestmentEntry, InvestmentPlan, Portfolio } from '../types';
import { formatCurrency } from '../utils/currencyUtils';

export const InvestmentPlanDetailPage: React.FC = () => {
  const { portfolioId, planId } = useParams<{ portfolioId: string; planId: string }>();
  const navigate = useNavigate();
  
  const [plan, setPlan] = useState<InvestmentPlan | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [planSummary, setPlanSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // 모달 상태
  const [showExecuteModal, setShowExecuteModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<InvestmentEntry | null>(null);

  useEffect(() => {
    if (planId && portfolioId) {
      loadData();
    }
  }, [planId, portfolioId]);

  const loadData = async () => {
    if (!planId || !portfolioId) return;

    try {
      const [planData, portfolioData, summaryData] = await Promise.all([
        InvestmentPlanService.getById(Number(planId)),
        PortfolioService.getById(Number(portfolioId)),
        InvestmentPlanService.getPlanSummary(Number(planId)),
      ]);

      setPlan(planData || null);
      setPortfolio(portfolioData || null);
      setPlanSummary(summaryData);
    } catch (error) {
      console.error('데이터 로딩 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteEntry = (entry: InvestmentEntry) => {
    setSelectedEntry(entry);
    setShowExecuteModal(true);
  };

  const handleExecuteSubmit = async (executionData: { quantity: number; price: number }) => {
    if (!selectedEntry) return;

    try {
      await InvestmentPlanService.executeEntry(selectedEntry.id, executionData);
      loadData(); // 데이터 새로고침
      setShowExecuteModal(false);
      setSelectedEntry(null);
    } catch (error) {
      console.error('투자 실행 중 오류:', error);
      throw error;
    }
  };

  const handleCancelPlan = async () => {
    if (!plan) return;
    
    const confirmMessage = '정말 이 투자 계획을 취소하시겠습니까?';
    if (!window.confirm(confirmMessage)) return;

    try {
      await InvestmentPlanService.cancelPlan(plan.id);
      navigate(`/portfolios/${portfolioId}/investment-plans`);
    } catch (error) {
      console.error('투자 계획 취소 중 오류:', error);
      alert('투자 계획 취소에 실패했습니다.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED': return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
      case 'IN_PROGRESS': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      case 'COMPLETED': return 'text-green-400 bg-green-900/20 border-green-500/30';
      case 'CANCELLED': return 'text-red-400 bg-red-900/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
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

  const getEntryStatusIcon = (status: string) => {
    switch (status) {
      case 'EXECUTED': return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'CANCELLED': return <XCircleIcon className="h-5 w-5 text-red-400" />;
      default: return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!plan || !portfolio) {
    return (
      <div className="p-4">
        <div className="text-center">
          <p className="text-gray-400">투자 계획을 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate(`/portfolios/${portfolioId}/investment-plans`)}
            className="mt-4 text-blue-500 hover:text-blue-400"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const progressRate = (plan.executedEntries / plan.plannedEntries) * 100;
  const nextEntry = plan.entries
    .filter(entry => entry.status === 'PLANNED')
    .sort((a, b) => a.entryNumber - b.entryNumber)[0];

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(`/portfolios/${portfolioId}/investment-plans`)}
            className="text-sm text-gray-400 hover:text-white flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            투자 계획 목록
          </button>
        </div>

        {/* 기본 정보 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{plan.symbol}</h1>
              <p className="text-gray-400">{plan.name}</p>
              <p className="text-sm text-gray-500 mt-1">{portfolio.name}</p>
            </div>
            <div className={`px-3 py-1 rounded border ${getStatusColor(plan.status)}`}>
              <span className="text-sm font-medium">
                {getStatusText(plan.status)}
              </span>
            </div>
          </div>

          {/* 진행률 */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">전체 진행률</span>
              <span className="text-white">{progressRate.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressRate}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{plan.executedEntries}/{plan.plannedEntries} 회차 완료</span>
              <span>
                {formatCurrency(plan.totalBudget - plan.remainingBudget, portfolio.currency)} / 
                {formatCurrency(plan.totalBudget, portfolio.currency)}
              </span>
            </div>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <CurrencyDollarIcon className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-xs text-gray-400">총 예산</span>
              </div>
              <p className="text-lg font-bold text-white">
                {formatCurrency(plan.totalBudget, portfolio.currency)}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <ChartBarIcon className="h-4 w-4 text-blue-400 mr-1" />
                <span className="text-xs text-gray-400">실행 금액</span>
              </div>
              <p className="text-lg font-bold text-white">
                {formatCurrency(plan.totalBudget - plan.remainingBudget, portfolio.currency)}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <CalendarDaysIcon className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="text-xs text-gray-400">계획 회차</span>
              </div>
              <p className="text-lg font-bold text-white">{plan.plannedEntries}회</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <CheckCircleIcon className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-xs text-gray-400">완료 회차</span>
              </div>
              <p className="text-lg font-bold text-white">{plan.executedEntries}회</p>
            </div>
          </div>
        </div>

        {/* 다음 실행 가능한 회차 */}
        {nextEntry && plan.status !== 'CANCELLED' && (
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-blue-400">다음 실행 회차</h3>
              <span className="text-sm text-blue-300">
                {nextEntry.entryNumber}회차 / {plan.plannedEntries}회차
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-400">계획 금액:</span>
                <span className="ml-2 text-white font-medium">
                  {formatCurrency(nextEntry.plannedAmount, portfolio.currency)}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-400">예상 수량:</span>
                <span className="ml-2 text-white font-medium">
                  시장가 기준 계산
                </span>
              </div>
            </div>
            <button
              onClick={() => handleExecuteEntry(nextEntry)}
              className="w-full px-4 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
              <PlayIcon className="h-5 w-5 mr-2" />
              {nextEntry.entryNumber}회차 매수 실행
            </button>
          </div>
        )}

        {/* 실행 내역 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-white mb-4">실행 내역</h3>
          <div className="space-y-3">
            {plan.entries
              .sort((a, b) => a.entryNumber - b.entryNumber)
              .map((entry) => (
                <div
                  key={entry.id}
                  className={`p-4 rounded-lg border ${
                    entry.status === 'EXECUTED' 
                      ? 'bg-green-900/10 border-green-500/30' 
                      : entry.status === 'CANCELLED'
                      ? 'bg-red-900/10 border-red-500/30'
                      : 'bg-gray-700 border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {getEntryStatusIcon(entry.status)}
                      <span className="ml-2 font-medium text-white">
                        {entry.entryNumber}회차
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-400">계획 금액</span>
                      <p className="font-medium text-white">
                        {formatCurrency(entry.plannedAmount, portfolio.currency)}
                      </p>
                    </div>
                  </div>

                  {entry.status === 'EXECUTED' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 pt-3 border-t border-gray-600">
                      <div>
                        <span className="text-xs text-gray-400">실행 금액</span>
                        <p className="text-sm font-medium text-white">
                          {formatCurrency(entry.executedAmount || 0, portfolio.currency)}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400">매수 수량</span>
                        <p className="text-sm font-medium text-white">
                          {entry.quantity?.toLocaleString() || 0}주
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400">매수 단가</span>
                        <p className="text-sm font-medium text-white">
                          {formatCurrency(entry.price || 0, portfolio.currency)}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400">실행 일시</span>
                        <p className="text-sm font-medium text-white">
                          {entry.executedAt ? new Date(entry.executedAt).toLocaleDateString() : '-'}
                        </p>
                      </div>
                    </div>
                  )}

                  {entry.status === 'PLANNED' && entry === nextEntry && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <button
                        onClick={() => handleExecuteEntry(entry)}
                        className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                      >
                        <PlayIcon className="h-4 w-4 inline mr-1" />
                        실행하기
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* 투자 요약 (planSummary가 있는 경우) */}
        {planSummary && planSummary.executedAmount > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4">투자 요약</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-gray-400">총 실행 금액</span>
                <p className="text-lg font-bold text-white">
                  {formatCurrency(planSummary.executedAmount, portfolio.currency)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-400">총 보유 수량</span>
                <p className="text-lg font-bold text-white">
                  {planSummary.totalQuantity.toLocaleString()}주
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-400">평균 매수가</span>
                <p className="text-lg font-bold text-white">
                  {formatCurrency(planSummary.averagePrice, portfolio.currency)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 액션 버튼들 */}
        <div className="flex gap-3">
          {plan.status === 'PLANNED' && plan.executedEntries === 0 && (
            <button
              onClick={handleCancelPlan}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              <ExclamationTriangleIcon className="h-5 w-5 mr-1" />
              계획 취소
            </button>
          )}
        </div>

        {/* 실행 모달 */}
        <ExecuteEntryModal
          isOpen={showExecuteModal}
          onClose={() => {
            setShowExecuteModal(false);
            setSelectedEntry(null);
          }}
          onSubmit={handleExecuteSubmit}
          entry={selectedEntry}
          plan={plan}
          currency={portfolio.currency}
        />
      </div>
    </div>
  );
}; 