import {
    CheckCircleIcon,
    ExclamationCircleIcon,
    ExclamationTriangleIcon,
    ShieldCheckIcon,
    XCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { ChecklistItem, InvestmentChecklist, RiskWarning } from '../types';
import { formatCurrency } from '../utils/currencyUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onProceed: (overrideReason?: string) => void;
  checklist: InvestmentChecklist | null;
  currency: 'KRW' | 'USD';
}

export const InvestmentWarningModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onProceed,
  checklist,
  currency,
}) => {
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');

  if (!isOpen || !checklist) return null;

  const handleProceed = () => {
    if (checklist.canProceed) {
      onProceed();
    } else {
      setShowOverrideForm(true);
    }
  };

  const handleOverride = () => {
    if (overrideReason.trim()) {
      onProceed(overrideReason);
      setShowOverrideForm(false);
      setOverrideReason('');
    }
  };

  const getStatusIcon = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'PASS':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'WARNING':
        return <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" />;
      case 'FAIL':
        return <XCircleIcon className="h-5 w-5 text-red-400" />;
    }
  };

  const getStatusColor = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'PASS':
        return 'border-green-500/30 bg-green-900/10';
      case 'WARNING':
        return 'border-yellow-500/30 bg-yellow-900/10';
      case 'FAIL':
        return 'border-red-500/30 bg-red-900/10';
    }
  };

  const getRiskColor = (risk: 'HIGH' | 'MEDIUM' | 'LOW') => {
    switch (risk) {
      case 'HIGH':
        return 'text-red-400 bg-red-900/20 border-red-500/30';
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      case 'LOW':
        return 'text-green-400 bg-green-900/20 border-green-500/30';
    }
  };

  const getWarningTypeIcon = (type: RiskWarning['type']) => {
    switch (type) {
      case 'HIGH':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />;
      case 'MEDIUM':
        return <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" />;
      case 'LOW':
        return <ExclamationCircleIcon className="h-5 w-5 text-blue-400" />;
    }
  };

  const passedChecks = checklist.checks.filter(check => check.status === 'PASS').length;
  const totalChecks = checklist.checks.length;
  const warningChecks = checklist.checks.filter(check => check.status === 'WARNING').length;
  const failedChecks = checklist.checks.filter(check => check.status === 'FAIL').length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-6 w-6 mr-2 text-blue-400" />
            <h3 className="text-xl font-bold text-white">투자 전 안전 점검</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* 투자 정보 요약 */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400">종목:</span>
              <span className="ml-2 font-medium text-white">{checklist.symbol}</span>
            </div>
            <div>
              <span className="text-gray-400">투자 금액:</span>
              <span className="ml-2 font-medium text-white">
                {formatCurrency(checklist.plannedAmount, currency)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">전체 위험도:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs font-medium border ${getRiskColor(checklist.overallRisk)}`}>
                {checklist.overallRisk === 'HIGH' ? '높음' : 
                 checklist.overallRisk === 'MEDIUM' ? '보통' : '낮음'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">진행 가능:</span>
              <span className={`ml-2 font-medium ${checklist.canProceed ? 'text-green-400' : 'text-red-400'}`}>
                {checklist.canProceed ? '예' : '아니오'}
              </span>
            </div>
          </div>
        </div>

        {/* 점검 결과 요약 */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-white mb-3">점검 결과 요약</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-400 mb-1" />
              <span className="text-2xl font-bold text-green-400">{passedChecks}</span>
              <span className="text-xs text-gray-400">통과</span>
            </div>
            <div className="flex flex-col items-center">
              <ExclamationCircleIcon className="h-8 w-8 text-yellow-400 mb-1" />
              <span className="text-2xl font-bold text-yellow-400">{warningChecks}</span>
              <span className="text-xs text-gray-400">경고</span>
            </div>
            <div className="flex flex-col items-center">
              <XCircleIcon className="h-8 w-8 text-red-400 mb-1" />
              <span className="text-2xl font-bold text-red-400">{failedChecks}</span>
              <span className="text-xs text-gray-400">실패</span>
            </div>
          </div>
          <div className="mt-3 text-center text-sm text-gray-400">
            총 {totalChecks}개 항목 중 {passedChecks}개 통과
          </div>
        </div>

        {/* 상세 체크리스트 */}
        <div className="mb-6">
          <h4 className="font-medium text-white mb-4">상세 점검 항목</h4>
          <div className="space-y-3">
            {checklist.checks.map((check) => (
              <div
                key={check.id}
                className={`p-4 rounded-lg border ${getStatusColor(check.status)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    {getStatusIcon(check.status)}
                    <span className="ml-2 font-medium text-white">{check.title}</span>
                    {check.isBlocking && check.status === 'FAIL' && (
                      <span className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded">
                        차단
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 capitalize">
                    {check.category.toLowerCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-2">{check.message}</p>
                {check.recommendation && (
                  <p className="text-xs text-gray-400 italic">
                    💡 {check.recommendation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 위험 경고 */}
        {checklist.warnings.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-white mb-4 flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-yellow-400" />
              위험 경고
            </h4>
            <div className="space-y-3">
              {checklist.warnings.map((warning) => (
                <div
                  key={warning.id}
                  className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-900/10"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      {getWarningTypeIcon(warning.type)}
                      <span className="ml-2 font-medium text-white">{warning.title}</span>
                    </div>
                    <span className="text-xs text-gray-400 capitalize">
                      {warning.category.toLowerCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{warning.message}</p>
                  <p className="text-xs text-gray-400 italic">
                    💡 {warning.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 강제 진행 폼 */}
        {showOverrideForm && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <h4 className="font-medium text-red-400 mb-3 flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
              위험 경고 무시하고 진행
            </h4>
            <p className="text-sm text-gray-300 mb-4">
              안전 점검에서 실패한 항목이 있습니다. 그래도 진행하시려면 이유를 입력해주세요.
            </p>
            <textarea
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={3}
              placeholder="위험을 감수하고 진행하는 이유를 입력하세요..."
              required
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setShowOverrideForm(false)}
                className="px-4 py-2 text-gray-400 hover:text-gray-300"
              >
                취소
              </button>
              <button
                onClick={handleOverride}
                disabled={!overrideReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                강제 진행
              </button>
            </div>
          </div>
        )}

        {/* 액션 버튼들 */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-400 hover:text-gray-300"
          >
            취소
          </button>
          
          {checklist.canProceed ? (
            <button
              onClick={handleProceed}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
            >
              <CheckCircleIcon className="h-5 w-5 mr-1" />
              안전하게 진행
            </button>
          ) : (
            <button
              onClick={handleProceed}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
            >
              <ExclamationTriangleIcon className="h-5 w-5 mr-1" />
              위험 감수하고 진행
            </button>
          )}
        </div>

        {/* 안전 팁 */}
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-300">
            💡 <strong>안전 투자 팁:</strong> 위험 경고가 있을 때는 투자 금액을 줄이거나 시기를 조정하는 것이 좋습니다. 
            감정적인 결정보다는 체계적인 접근을 권장합니다.
          </p>
        </div>
      </div>
    </div>
  );
}; 