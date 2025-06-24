import { BanknotesIcon, ChartBarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { formatCurrency } from '../utils/currencyUtils';

interface CashBalanceData {
  totalBalance: number;
  cashBalance: number;
  investedAmount: number;
  currentValue: number;
  utilizationRate: number;
  profitLoss: number;
  profitLossRate: number;
}

interface Props {
  cashBalance: CashBalanceData;
  currency: 'KRW' | 'USD';
  className?: string;
}

export const CashBalanceCard: React.FC<Props> = ({ 
  cashBalance, 
  currency, 
  className = '' 
}) => {
  const {
    totalBalance,
    cashBalance: cash,
    investedAmount,
    currentValue,
    utilizationRate,
    profitLoss,
    profitLossRate,
  } = cashBalance;

  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">자금 현황</h3>
        <div className="flex items-center text-sm text-gray-400">
          <ChartBarIcon className="h-4 w-4 mr-1" />
          활용률 {utilizationRate.toFixed(1)}%
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* 총 잔고 */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <BanknotesIcon className="h-5 w-5 text-blue-400 mr-2" />
            <span className="text-sm text-gray-400">총 잔고</span>
          </div>
          <p className="text-xl font-bold text-white">
            {formatCurrency(totalBalance, currency)}
          </p>
        </div>

        {/* 현금 잔고 */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <CurrencyDollarIcon className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-sm text-gray-400">사용 가능 현금</span>
          </div>
          <p className="text-xl font-bold text-green-400">
            {formatCurrency(cash, currency)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {totalBalance > 0 ? ((cash / totalBalance) * 100).toFixed(1) : 0}%
          </p>
        </div>

        {/* 투자 중인 금액 */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <ChartBarIcon className="h-5 w-5 text-purple-400 mr-2" />
            <span className="text-sm text-gray-400">투자 중</span>
          </div>
          <p className="text-xl font-bold text-purple-400">
            {formatCurrency(investedAmount, currency)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {totalBalance > 0 ? ((investedAmount / totalBalance) * 100).toFixed(1) : 0}%
          </p>
        </div>
      </div>

      {/* 수익/손실 현황 */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">투자 성과</span>
          <span className={`text-sm font-medium ${
            profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {profitLoss >= 0 ? '+' : ''}{profitLossRate.toFixed(2)}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">평가 금액</p>
            <p className="text-lg font-bold text-white">
              {formatCurrency(currentValue, currency)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">손익</p>
            <p className={`text-lg font-bold ${
              profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss, currency)}
            </p>
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="mt-3">
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(utilizationRate, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>자금 활용률</span>
            <span>{utilizationRate.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* 경고 메시지 */}
      {cash < 0 && (
        <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm">
            ⚠️ 현금 잔고가 부족합니다. 계좌 잔고를 확인해주세요.
          </p>
        </div>
      )}

      {utilizationRate > 90 && (
        <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-500/50 rounded-lg">
          <p className="text-yellow-400 text-sm">
            💡 자금 활용률이 높습니다. 추가 투자 시 신중하게 검토해주세요.
          </p>
        </div>
      )}
    </div>
  );
}; 