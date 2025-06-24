import {
    ArrowLeftIcon,
    ChartBarSquareIcon,
    CheckCircleIcon,
    ClockIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ExecuteEntryModal } from '../components/ExecuteEntryModal';
import { InvestmentPlanCard } from '../components/InvestmentPlanCard';
import { InvestmentPlanModal } from '../components/InvestmentPlanModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { InvestmentPlanService } from '../services/investmentPlanService';
import { PortfolioService } from '../services/portfolioService';
import { InvestmentEntry, InvestmentPlan, NewInvestmentPlan, Portfolio } from '../types';
import { formatCurrency } from '../utils/currencyUtils';

export const InvestmentPlansPage: React.FC = () => {
  const { portfolioId } = useParams<{ portfolioId: string }>();
  const navigate = useNavigate();
  
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // 모달 상태
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExecuteModal, setShowExecuteModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<InvestmentEntry | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);

  useEffect(() => {
    if (portfolioId) {
      loadData();
    }
  }, [portfolioId]);

  const loadData = async () => {
    if (!portfolioId) return;

    try {
      const [portfolioData, plansData, statsData] = await Promise.all([
        PortfolioService.getById(Number(portfolioId)),
        InvestmentPlanService.getByPortfolioId(Number(portfolioId)),
        InvestmentPlanService.getPlanStats(Number(portfolioId)),
      ]);

      setPortfolio(portfolioData || null);
      setPlans(plansData);
      setStats(statsData);
    } catch (error) {
      console.error('데이터 로딩 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (planData: NewInvestmentPlan) => {
    try {
      await InvestmentPlanService.create(planData);
      loadData(); // 데이터 새로고침
    } catch (error) {
      console.error('투자 계획 생성 중 오류:', error);
      throw error;
    }
  };

  const handleExecuteEntry = (entry: InvestmentEntry) => {
    const plan = plans.find(p => p.id === entry.planId);
    if (plan) {
      setSelectedEntry(entry);
      setSelectedPlan(plan);
      setShowExecuteModal(true);
    }
  };

  const handleExecuteSubmit = async (executionData: { quantity: number; price: number }) => {
    if (!selectedEntry) return;

    try {
      await InvestmentPlanService.executeEntry(selectedEntry.id, executionData);
      loadData(); // 데이터 새로고침
      setShowExecuteModal(false);
      setSelectedEntry(null);
      setSelectedPlan(null);
    } catch (error) {
      console.error('투자 실행 중 오류:', error);
      throw error;
    }
  };

  const handleCancelPlan = async (planId: number) => {
    const confirmMessage = '정말 이 투자 계획을 취소하시겠습니까?';
    if (!window.confirm(confirmMessage)) return;

    try {
      await InvestmentPlanService.cancelPlan(planId);
      loadData(); // 데이터 새로고침
    } catch (error) {
      console.error('투자 계획 취소 중 오류:', error);
      alert('투자 계획 취소에 실패했습니다.');
    }
  };

  const handleViewDetails = (planId: number) => {
    // 상세 페이지로 이동 (나중에 구현)
    console.log('View plan details:', planId);
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

  if (!portfolio) {
    return (
      <div className="p-4">
        <div className="text-center">
          <p className="text-gray-400">포트폴리오를 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate('/portfolios')}
            className="mt-4 text-blue-500 hover:text-blue-400"
          >
            포트폴리오 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate(`/portfolios/${portfolio.id}`)}
              className="text-sm text-gray-400 hover:text-white flex items-center mr-4"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              뒤로
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">투자 계획</h1>
              <p className="text-gray-400">{portfolio.name}</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            새 계획
          </button>
        </div>

        {/* 통계 카드들 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <ChartBarSquareIcon className="h-5 w-5 text-blue-400 mr-2" />
                <span className="text-sm text-gray-400">총 계획</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.totalPlans}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <ClockIcon className="h-5 w-5 text-yellow-400 mr-2" />
                <span className="text-sm text-gray-400">진행 중</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.activePlans}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-sm text-gray-400">완료</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.completedPlans}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="text-sm text-gray-400">총 예산</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(stats.totalBudget, portfolio.currency)}
              </p>
              <p className="text-xs text-gray-500">
                실행: {formatCurrency(stats.executedBudget, portfolio.currency)}
              </p>
            </div>
          </div>
        )}

        {/* 투자 계획 목록 */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">투자 계획 목록</h2>
          
          {plans.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-lg">
              <p className="text-gray-400 mb-4">등록된 투자 계획이 없습니다.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <PlusIcon className="h-5 w-5 mr-1" />
                첫 번째 계획 만들기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <InvestmentPlanCard
                  key={plan.id}
                  plan={plan}
                  currency={portfolio.currency}
                  portfolioId={portfolio.id}
                  onExecuteEntry={handleExecuteEntry}
                  onCancelPlan={handleCancelPlan}
                />
              ))}
            </div>
          )}
        </div>

        {/* 모달들 */}
        <InvestmentPlanModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePlan}
          portfolio={portfolio}
        />

        <ExecuteEntryModal
          isOpen={showExecuteModal}
          onClose={() => {
            setShowExecuteModal(false);
            setSelectedEntry(null);
            setSelectedPlan(null);
          }}
          onSubmit={handleExecuteSubmit}
          entry={selectedEntry}
          plan={selectedPlan}
          currency={portfolio.currency}
        />
      </div>
    </div>
  );
}; 