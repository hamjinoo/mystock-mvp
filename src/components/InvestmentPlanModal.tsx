import { CalendarDaysIcon, CurrencyDollarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { AccountService } from '../services/accountService';
import { NewInvestmentPlan, Portfolio } from '../types';
import { formatCurrency } from '../utils/currencyUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (plan: NewInvestmentPlan) => void;
  portfolio: Portfolio;
  initialSymbol?: string;
  initialName?: string;
}

export const InvestmentPlanModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  portfolio,
  initialSymbol = '',
  initialName = '',
}) => {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [name, setName] = useState(initialName);
  const [totalBudget, setTotalBudget] = useState(0);
  const [plannedEntries, setPlannedEntries] = useState(3);
  const [cashBalance, setCashBalance] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCashBalance();
      setSymbol(initialSymbol);
      setName(initialName);
    }
  }, [isOpen, portfolio.accountId, initialSymbol, initialName]);

  const loadCashBalance = async () => {
    try {
      const balance = await AccountService.getCashBalance(portfolio.accountId);
      setCashBalance(balance);
    } catch (error) {
      console.error('현금 잔고 조회 중 오류:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim() || !name.trim() || totalBudget <= 0 || plannedEntries <= 0) {
      alert('모든 필드를 올바르게 입력해주세요.');
      return;
    }

    if (cashBalance && totalBudget > cashBalance.cashBalance) {
      const confirmMessage = `현금 잔고(${formatCurrency(cashBalance.cashBalance, portfolio.currency)})를 초과하는 계획입니다. 계속하시겠습니까?`;
      if (!window.confirm(confirmMessage)) {
        return;
      }
    }

    setLoading(true);

    try {
      const plan: NewInvestmentPlan = {
        portfolioId: portfolio.id,
        symbol: symbol.trim().toUpperCase(),
        name: name.trim(),
        totalBudget,
        plannedEntries,
        executedEntries: 0,
        remainingBudget: totalBudget,
        status: 'PLANNED' as const,
      };

      await onSubmit(plan);
      onClose();
      
      // 폼 초기화
      setSymbol('');
      setName('');
      setTotalBudget(0);
      setPlannedEntries(3);
    } catch (error) {
      console.error('투자 계획 생성 중 오류:', error);
      alert('투자 계획 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const amountPerEntry = plannedEntries > 0 ? totalBudget / plannedEntries : 0;
  const canAfford = cashBalance ? totalBudget <= cashBalance.cashBalance : false;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">투자 계획 생성</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300"
            disabled={loading}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 종목 정보 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                종목 코드
              </label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: AAPL, 005930"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                종목명
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: Apple Inc."
                required
              />
            </div>
          </div>

          {/* 투자 금액 */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              총 투자 금액 ({portfolio.currency})
            </label>
            <input
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(Number(e.target.value))}
              className={`w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 ${
                canAfford ? 'focus:ring-blue-500' : 'focus:ring-red-500 border border-red-500'
              }`}
              min="0"
              step="10000"
              required
            />
            {cashBalance && (
              <p className={`text-xs mt-1 ${canAfford ? 'text-gray-400' : 'text-red-400'}`}>
                사용 가능 현금: {formatCurrency(cashBalance.cashBalance, portfolio.currency)}
                {!canAfford && ' (부족)'}
              </p>
            )}
          </div>

          {/* 분할 횟수 */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              분할 매수 횟수
            </label>
            <select
              value={plannedEntries}
              onChange={(e) => setPlannedEntries(Number(e.target.value))}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>1회 (일괄 매수)</option>
              <option value={2}>2회 분할</option>
              <option value={3}>3회 분할</option>
              <option value={4}>4회 분할</option>
              <option value={5}>5회 분할</option>
            </select>
          </div>

          {/* 회차별 예상 금액 */}
          {plannedEntries > 1 && (
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-2 text-gray-300 flex items-center">
                <CalendarDaysIcon className="h-4 w-4 mr-1" />
                회차별 예상 투자 금액
              </h4>
              <div className="space-y-1">
                {Array.from({ length: plannedEntries }, (_, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-400">{i + 1}회차:</span>
                    <span className="text-white">
                      {formatCurrency(
                        i === plannedEntries - 1 
                          ? totalBudget - (amountPerEntry * (plannedEntries - 1)) // 마지막 회차에서 반올림 오차 조정
                          : amountPerEntry,
                        portfolio.currency
                      )}
                    </span>
                  </div>
                ))}
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
                    {formatCurrency(cashBalance.cashBalance, portfolio.currency)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">사용 후:</span>
                  <span className={`ml-1 ${
                    cashBalance.cashBalance - totalBudget >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatCurrency(cashBalance.cashBalance - totalBudget, portfolio.currency)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-gray-300"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading || !symbol.trim() || !name.trim() || totalBudget <= 0}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '생성 중...' : '계획 생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 