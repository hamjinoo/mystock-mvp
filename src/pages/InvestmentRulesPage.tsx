import {
    ArrowLeftIcon,
    ChartBarIcon,
    CheckCircleIcon,
    ClockIcon,
    CurrencyDollarIcon,
    ExclamationTriangleIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PortfolioService } from '../services/portfolioService';
import { RiskManagementService } from '../services/riskManagementService';
import { InvestmentRules, NewInvestmentRules, Portfolio } from '../types';
import { formatCurrency } from '../utils/currencyUtils';

export const InvestmentRulesPage: React.FC = () => {
  const { portfolioId } = useParams<{ portfolioId: string }>();
  const navigate = useNavigate();
  
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [rules, setRules] = useState<InvestmentRules | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  // 폼 상태
  const [formData, setFormData] = useState<Partial<NewInvestmentRules>>({});

  useEffect(() => {
    if (portfolioId) {
      loadData();
    }
  }, [portfolioId]);

  const loadData = async () => {
    if (!portfolioId) return;

    try {
      const [portfolioData, rulesData] = await Promise.all([
        PortfolioService.getById(Number(portfolioId)),
        RiskManagementService.getOrCreateRules(Number(portfolioId)),
      ]);

      setPortfolio(portfolioData || null);
      setRules(rulesData);
      
      // 폼 데이터 초기화
      if (rulesData) {
        setFormData({
          maxPositionSize: rulesData.maxPositionSize,
          maxPositionAmount: rulesData.maxPositionAmount,
          maxDailyInvestment: rulesData.maxDailyInvestment,
          maxMonthlyInvestment: rulesData.maxMonthlyInvestment,
          minCashReserve: rulesData.minCashReserve,
          maxPortfolioRisk: rulesData.maxPortfolioRisk,
          maxSectorConcentration: rulesData.maxSectorConcentration,
          requireConfirmationAbove: rulesData.requireConfirmationAbove,
          cooldownPeriod: rulesData.cooldownPeriod,
          maxConsecutiveLosses: rulesData.maxConsecutiveLosses,
          autoStopLoss: rulesData.autoStopLoss,
          stopLossPercentage: rulesData.stopLossPercentage,
          autoTakeProfit: rulesData.autoTakeProfit,
          takeProfitPercentage: rulesData.takeProfitPercentage,
          enableWarnings: rulesData.enableWarnings,
          warningThreshold: rulesData.warningThreshold,
        });
      }
    } catch (error) {
      console.error('데이터 로딩 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!portfolioId || !formData.portfolioId) return;

    setSaving(true);
    try {
      await RiskManagementService.updateRules(Number(portfolioId), formData);
      setSavedMessage('투자 규칙이 성공적으로 저장되었습니다.');
      setTimeout(() => setSavedMessage(''), 3000);
      loadData(); // 데이터 새로고침
    } catch (error) {
      console.error('저장 중 오류:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof NewInvestmentRules, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      portfolioId: Number(portfolioId),
    }));
  };

  const resetToDefaults = () => {
    const defaultRules: Partial<NewInvestmentRules> = {
      maxPositionSize: 20,
      maxPositionAmount: 1000000,
      maxDailyInvestment: 500000,
      maxMonthlyInvestment: 2000000,
      minCashReserve: 10,
      maxPortfolioRisk: 6,
      maxSectorConcentration: 40,
      requireConfirmationAbove: 300000,
      cooldownPeriod: 24,
      maxConsecutiveLosses: 3,
      autoStopLoss: false,
      stopLossPercentage: 10,
      autoTakeProfit: false,
      takeProfitPercentage: 20,
      enableWarnings: true,
      warningThreshold: 15,
    };
    
    setFormData(defaultRules);
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
      <div className="max-w-4xl mx-auto">
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
              <h1 className="text-2xl font-bold text-white flex items-center">
                <ShieldCheckIcon className="h-6 w-6 mr-2 text-blue-400" />
                투자 규칙 설정
              </h1>
              <p className="text-gray-400">{portfolio.name}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={resetToDefaults}
              className="px-4 py-2 text-gray-400 hover:text-white border border-gray-600 rounded"
            >
              기본값으로 재설정
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>

        {/* 저장 완료 메시지 */}
        {savedMessage && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-green-400">{savedMessage}</span>
          </div>
        )}

        {/* 폼 섹션들 */}
        <div className="space-y-6">
          {/* 포지션 규칙 */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-blue-400" />
              포지션 관리 규칙
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  단일 종목 최대 비중 (%)
                </label>
                <input
                  type="number"
                  value={formData.maxPositionSize || ''}
                  onChange={(e) => handleInputChange('maxPositionSize', Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="100"
                />
                <p className="text-xs text-gray-400 mt-1">
                  권장: 10-20% (분산 투자를 위해)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  단일 종목 최대 금액 ({portfolio.currency})
                </label>
                <input
                  type="number"
                  value={formData.maxPositionAmount || ''}
                  onChange={(e) => handleInputChange('maxPositionAmount', Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="10000"
                  step="10000"
                />
                <p className="text-xs text-gray-400 mt-1">
                  현재 설정: {formatCurrency(formData.maxPositionAmount || 0, portfolio.currency)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  일일 최대 투자 금액 ({portfolio.currency})
                </label>
                <input
                  type="number"
                  value={formData.maxDailyInvestment || ''}
                  onChange={(e) => handleInputChange('maxDailyInvestment', Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="10000"
                  step="10000"
                />
                <p className="text-xs text-gray-400 mt-1">
                  충동적인 대량 매수를 방지합니다
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  월간 최대 투자 금액 ({portfolio.currency})
                </label>
                <input
                  type="number"
                  value={formData.maxMonthlyInvestment || ''}
                  onChange={(e) => handleInputChange('maxMonthlyInvestment', Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="50000"
                  step="50000"
                />
                <p className="text-xs text-gray-400 mt-1">
                  월간 투자 예산을 관리합니다
                </p>
              </div>
            </div>
          </div>

          {/* 포트폴리오 규칙 */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 mr-2 text-green-400" />
              포트폴리오 관리 규칙
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  최소 현금 보유율 (%)
                </label>
                <input
                  type="number"
                  value={formData.minCashReserve || ''}
                  onChange={(e) => handleInputChange('minCashReserve', Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="50"
                />
                <p className="text-xs text-gray-400 mt-1">
                  비상 자금 확보를 위해
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  최대 포트폴리오 위험도 (1-10)
                </label>
                <input
                  type="range"
                  value={formData.maxPortfolioRisk || 5}
                  onChange={(e) => handleInputChange('maxPortfolioRisk', Number(e.target.value))}
                  className="w-full"
                  min="1"
                  max="10"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>안전 (1)</span>
                  <span className="font-medium text-white">{formData.maxPortfolioRisk}</span>
                  <span>위험 (10)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  섹터별 최대 집중도 (%)
                </label>
                <input
                  type="number"
                  value={formData.maxSectorConcentration || ''}
                  onChange={(e) => handleInputChange('maxSectorConcentration', Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="10"
                  max="100"
                />
                <p className="text-xs text-gray-400 mt-1">
                  섹터 분산을 위한 제한
                </p>
              </div>
            </div>
          </div>

          {/* 매수 규칙 */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-yellow-400" />
              매수 실행 규칙
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  확인 필요 금액 ({portfolio.currency})
                </label>
                <input
                  type="number"
                  value={formData.requireConfirmationAbove || ''}
                  onChange={(e) => handleInputChange('requireConfirmationAbove', Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="10000"
                  step="10000"
                />
                <p className="text-xs text-gray-400 mt-1">
                  이 금액 이상 매수 시 추가 확인
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  재매수 대기 시간 (시간)
                </label>
                <input
                  type="number"
                  value={formData.cooldownPeriod || ''}
                  onChange={(e) => handleInputChange('cooldownPeriod', Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="168"
                />
                <p className="text-xs text-gray-400 mt-1">
                  동일 종목 재매수 대기 시간
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  연속 손실 허용 횟수
                </label>
                <input
                  type="number"
                  value={formData.maxConsecutiveLosses || ''}
                  onChange={(e) => handleInputChange('maxConsecutiveLosses', Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="10"
                />
                <p className="text-xs text-gray-400 mt-1">
                  이 횟수 초과 시 매수 중단 경고
                </p>
              </div>
            </div>
          </div>

          {/* 손절/익절 규칙 */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-400" />
              손절/익절 규칙
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.autoStopLoss || false}
                      onChange={(e) => handleInputChange('autoStopLoss', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-gray-300">자동 손절 활성화</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    손절 기준 (%)
                  </label>
                  <input
                    type="number"
                    value={formData.stopLossPercentage || ''}
                    onChange={(e) => handleInputChange('stopLossPercentage', Number(e.target.value))}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="50"
                    disabled={!formData.autoStopLoss}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    이 비율 이상 손실 시 자동 매도
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.autoTakeProfit || false}
                      onChange={(e) => handleInputChange('autoTakeProfit', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-gray-300">자동 익절 활성화</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    익절 기준 (%)
                  </label>
                  <input
                    type="number"
                    value={formData.takeProfitPercentage || ''}
                    onChange={(e) => handleInputChange('takeProfitPercentage', Number(e.target.value))}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="200"
                    disabled={!formData.autoTakeProfit}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    이 비율 이상 수익 시 자동 매도
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 경고 설정 */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-yellow-400" />
              경고 시스템 설정
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={formData.enableWarnings || false}
                    onChange={(e) => handleInputChange('enableWarnings', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-gray-300">위험 경고 시스템 활성화</span>
                </label>
                <p className="text-xs text-gray-400">
                  투자 전 위험 분석 및 경고 메시지를 표시합니다
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  경고 임계값 (%)
                </label>
                <input
                  type="number"
                  value={formData.warningThreshold || ''}
                  onChange={(e) => handleInputChange('warningThreshold', Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="5"
                  max="50"
                  disabled={!formData.enableWarnings}
                />
                <p className="text-xs text-gray-400 mt-1">
                  이 비율 이상 위험 시 경고 표시
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 안전 가이드 */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <h4 className="font-medium text-blue-400 mb-2">💡 안전 투자 가이드</h4>
          <ul className="text-sm text-blue-300 space-y-1">
            <li>• <strong>분산 투자:</strong> 단일 종목 비중을 20% 이하로 유지하세요</li>
            <li>• <strong>현금 관리:</strong> 최소 10-20%의 현금을 보유하세요</li>
            <li>• <strong>감정 제어:</strong> 일일 투자 한도로 충동적 매수를 방지하세요</li>
            <li>• <strong>손절 원칙:</strong> 미리 정한 손절 기준을 지키세요</li>
            <li>• <strong>재매수 대기:</strong> 동일 종목 재매수 시 충분한 시간을 두세요</li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 