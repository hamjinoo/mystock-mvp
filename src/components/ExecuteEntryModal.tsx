import { CurrencyDollarIcon, PlayIcon, ScaleIcon, ShieldCheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { AccountService } from '../services/accountService';
import { RiskManagementService } from '../services/riskManagementService';
import { InvestmentChecklist, InvestmentEntry, InvestmentPlan } from '../types';
import { formatCurrency } from '../utils/currencyUtils';
import { InvestmentWarningModal } from './InvestmentWarningModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (executionData: { quantity: number; price: number }, overrideReason?: string) => void;
  entry: InvestmentEntry | null;
  plan: InvestmentPlan | null;
  currency: 'KRW' | 'USD';
}

export const ExecuteEntryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  entry,
  plan,
  currency,
}) => {
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [cashBalance, setCashBalance] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checklist, setChecklist] = useState<InvestmentChecklist | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [checkingRisk, setCheckingRisk] = useState(false);

  useEffect(() => {
    if (isOpen && plan) {
      loadCashBalance();
      // 기본값 설정
      if (entry && price === 0) {
        const suggestedQuantity = Math.floor(entry.plannedAmount / (price || 1));
        setQuantity(suggestedQuantity);
      }
    }
  }, [isOpen, plan, entry, price]);

  const loadCashBalance = async () => {
    if (!plan) return;
    
    try {
      const balance = await AccountService.getCashBalance(plan.portfolioId);
      setCashBalance(balance);
    } catch (error) {
      console.error('현금 잔고 조회 중 오류:', error);
    }
  };

  const checkInvestmentRisk = async () => {
    if (!plan || !entry || quantity <= 0 || price <= 0) return;

    setCheckingRisk(true);
    try {
      const totalAmount = quantity * price;
      const checklistResult = await RiskManagementService.createInvestmentChecklist(
        plan.portfolioId,
        plan.symbol,
        totalAmount
      );
      
      setChecklist(checklistResult);
      
      // 위험이 있거나 경고가 있으면 경고 모달 표시
      if (!checklistResult.canProceed || checklistResult.warnings.length > 0) {
        setShowWarningModal(true);
      } else {
        // 안전하면 바로 실행
        handleDirectSubmit();
      }
    } catch (error) {
      console.error('위험 분석 중 오류:', error);
      // 위험 분석 실패 시에도 실행 허용 (fallback)
      handleDirectSubmit();
    } finally {
      setCheckingRisk(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry || !plan || quantity <= 0 || price <= 0) {
      alert('수량과 가격을 올바르게 입력해주세요.');
      return;
    }

    const totalAmount = quantity * price;
    
    if (cashBalance && totalAmount > cashBalance.cashBalance) {
      const confirmMessage = `현금 잔고(${formatCurrency(cashBalance.cashBalance, currency)})가 부족합니다. 계속하시겠습니까?`;
      if (!window.confirm(confirmMessage)) {
        return;
      }
    }

    // 위험 관리 체크 실행
    await checkInvestmentRisk();
  };

  const handleDirectSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit({ quantity, price });
      onClose();
      
      // 폼 초기화
      setQuantity(0);
      setPrice(0);
      setChecklist(null);
    } catch (error) {
      console.error('투자 실행 중 오류:', error);
      alert('투자 실행에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleWarningProceed = async (overrideReason?: string) => {
    setLoading(true);
    try {
      await onSubmit({ quantity, price }, overrideReason);
      setShowWarningModal(false);
      onClose();
      
      // 폼 초기화
      setQuantity(0);
      setPrice(0);
      setChecklist(null);
    } catch (error) {
      console.error('투자 실행 중 오류:', error);
      alert('투자 실행에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 현재 입력된 값들로 계산
  const totalAmount = quantity * price;
  const canAfford = cashBalance ? totalAmount <= cashBalance.cashBalance : false;
  const suggestedQuantity = entry && price > 0 ? Math.floor(entry.plannedAmount / price) : 0;
  const amountDifference = entry ? totalAmount - entry.plannedAmount : 0;

  if (!isOpen || !entry || !plan) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">
              {entry.entryNumber}회차 매수 실행
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300"
              disabled={loading || checkingRisk}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* 종목 정보 */}
          <div className="bg-gray-700 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-white">{plan.symbol}</h4>
              <span className="text-sm text-gray-400">{plan.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">계획 금액:</span>
                <span className="ml-2 text-white">
                  {formatCurrency(entry.plannedAmount, currency)}
                </span>
              </div>
              <div>
                <span className="text-gray-400">회차:</span>
                <span className="ml-2 text-white">
                  {entry.entryNumber}/{plan.plannedEntries}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 매수 가격 */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                매수 가격 ({currency})
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
                placeholder="매수할 가격"
                required
              />
            </div>

            {/* 매수 수량 */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                매수 수량
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="1"
                placeholder="매수할 수량"
                required
              />
              {price > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  권장 수량: {suggestedQuantity}주 (계획 금액 기준)
                </p>
              )}
            </div>

            {/* 계산 결과 */}
            {quantity > 0 && price > 0 && (
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-3 text-gray-300 flex items-center">
                  <ScaleIcon className="h-4 w-4 mr-1" />
                  매수 정보
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">총 매수 금액:</span>
                    <span className={`font-medium ${canAfford ? 'text-white' : 'text-red-400'}`}>
                      {formatCurrency(totalAmount, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">계획 금액 대비:</span>
                    <span className={`font-medium ${
                      amountDifference > 0 ? 'text-red-400' : 
                      amountDifference < 0 ? 'text-green-400' : 'text-white'
                    }`}>
                      {amountDifference > 0 ? '+' : ''}{formatCurrency(amountDifference, currency)}
                    </span>
                  </div>
                  {cashBalance && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">매수 후 현금:</span>
                      <span className={`font-medium ${
                        cashBalance.cashBalance - totalAmount >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatCurrency(cashBalance.cashBalance - totalAmount, currency)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 현금 잔고 정보 */}
            {cashBalance && (
              <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <CurrencyDollarIcon className="h-4 w-4 mr-1 text-blue-400" />
                  <span className="text-sm font-medium text-blue-400">현금 현황</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400">사용 가능:</span>
                    <span className="ml-1 text-white">
                      {formatCurrency(cashBalance.cashBalance, currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">활용률:</span>
                    <span className="ml-1 text-white">
                      {cashBalance.utilizationRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 경고 메시지 */}
            {!canAfford && totalAmount > 0 && (
              <div className="bg-red-900/30 border border-red-500/50 p-3 rounded-lg">
                <p className="text-red-400 text-sm">
                  ⚠️ 현금 잔고가 부족합니다. 매수 금액을 확인해주세요.
                </p>
              </div>
            )}

            {Math.abs(amountDifference) > entry.plannedAmount * 0.1 && (
              <div className="bg-yellow-900/30 border border-yellow-500/50 p-3 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  💡 계획 금액과 {Math.abs(amountDifference) > 0 ? '10% 이상' : ''} 차이가 있습니다.
                </p>
              </div>
            )}

            {/* 위험 관리 안내 */}
            <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-lg">
              <div className="flex items-center mb-1">
                <ShieldCheckIcon className="h-4 w-4 mr-1 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">스마트 위험 관리</span>
              </div>
              <p className="text-xs text-blue-300">
                매수 실행 전 포트폴리오 위험도를 자동으로 분석하여 안전한 투자를 도와드립니다.
              </p>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-gray-300"
                disabled={loading || checkingRisk}
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading || checkingRisk || quantity <= 0 || price <= 0}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {checkingRisk ? (
                  <>
                    <ShieldCheckIcon className="h-4 w-4 mr-1 animate-spin" />
                    위험 분석 중...
                  </>
                ) : loading ? (
                  <>
                    <PlayIcon className="h-4 w-4 mr-1" />
                    실행 중...
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4 mr-1" />
                    안전 점검 후 매수
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 위험 경고 모달 */}
      <InvestmentWarningModal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        onProceed={handleWarningProceed}
        checklist={checklist}
        currency={currency}
      />
    </>
  );
}; 