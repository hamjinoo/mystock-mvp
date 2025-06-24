import {
    ArrowLeftIcon,
    CogIcon,
    PencilIcon,
    PlusIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CashBalanceCard } from "../components/CashBalanceCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { AccountService } from "../services/accountService";
import { PortfolioService } from "../services/portfolioService";
import { Account, Portfolio, Position } from "../types";
import { formatCurrency } from "../utils/currencyUtils";

interface AccountSummary {
  account: Account;
  portfolios: (Portfolio & { positions: Position[] })[];
  totalValue: number;
  totalCost: number;
  returnRate: number;
}

export const AccountDetailPage: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const [account, setAccount] = useState<
    Account & { portfolios: (Portfolio & { positions: Position[] })[] }
  >();
  const [summary, setSummary] = useState<AccountSummary>();
  const [cashBalance, setCashBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [newBalance, setNewBalance] = useState(0);

  useEffect(() => {
    loadData();
  }, [accountId]);

  const loadData = async () => {
    if (!accountId) return;

    try {
      const [accountData, summaryData, cashData] = await Promise.all([
        AccountService.getWithPortfolios(Number(accountId)),
        AccountService.getAccountSummary(Number(accountId)),
        AccountService.getCashBalance(Number(accountId)),
      ]);

      setAccount(accountData);
      setSummary(summaryData);
      setCashBalance(cashData);
      setNewBalance(accountData.totalBalance || 0);
    } catch (error) {
      console.error("계좌 정보 로딩 중 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePosition = async (positionId: number) => {
    if (!window.confirm("정말 이 포지션을 삭제하시겠습니까?")) return;

    try {
      await PortfolioService.deletePosition(positionId);
      loadData(); // 데이터 새로고침
    } catch (error) {
      console.error("포지션 삭제 중 오류:", error);
      alert("포지션 삭제에 실패했습니다.");
    }
  };

  const handleUpdateBalance = async () => {
    if (!accountId) return;

    try {
      await AccountService.updateAccountBalance(Number(accountId), newBalance);
      setShowBalanceModal(false);
      loadData(); // 데이터 새로고침
    } catch (error) {
      console.error("계좌 잔고 업데이트 중 오류:", error);
      alert("계좌 잔고 업데이트에 실패했습니다.");
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

  if (!account || !summary) {
    return (
      <div className="p-4">
        <div className="text-center">
          <p className="text-gray-400">계좌를 찾을 수 없습니다.</p>
          <Link
            to="/accounts"
            className="inline-block mt-4 text-blue-500 hover:text-blue-400"
          >
            계좌 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // 모든 포지션을 하나의 배열로 합치기
  const allPositions = summary.portfolios.flatMap((portfolio) =>
    portfolio.positions.map((position) => ({
      ...position,
      portfolioId: portfolio.id,
    }))
  );

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/accounts")}
            className="text-sm text-gray-400 hover:text-white flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            뒤로
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowBalanceModal(true)}
              className="text-sm text-gray-400 hover:text-white flex items-center"
            >
              <CogIcon className="h-4 w-4 mr-1" />
              잔고 설정
            </button>
            <Link
              to={`/accounts/${accountId}/edit`}
              className="text-sm text-gray-400 hover:text-white flex items-center"
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              수정
            </Link>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">
            {summary.account.accountName}
          </h1>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">증권사</p>
              <p className="font-medium">{summary.account.broker}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">계좌번호</p>
              <p className="font-medium">{summary.account.accountNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">총자산</p>
              <p className="font-medium">
                {formatCurrency(summary.totalValue, summary.account.currency)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">수익률</p>
              <p
                className={`font-medium ${
                  summary.returnRate >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {summary.returnRate.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        {/* 현금 잔고 카드 */}
        {cashBalance && (
          <CashBalanceCard 
            cashBalance={cashBalance}
            currency={summary.account.currency}
            className="mb-6"
          />
        )}

        {/* 잔고 설정 모달 */}
        {showBalanceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">계좌 잔고 설정</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  총 계좌 잔고 ({summary.account.currency})
                </label>
                <input
                  type="number"
                  value={newBalance}
                  onChange={(e) => setNewBalance(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="1000"
                />
                <p className="text-xs text-gray-400 mt-1">
                  현재 투자 중인 금액: {formatCurrency(summary.totalCost, summary.account.currency)}
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowBalanceModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  취소
                </button>
                <button
                  onClick={handleUpdateBalance}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <div className="overflow-x-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">보유 종목</h2>
                <Link
                  to={`/accounts/${accountId}/positions/new`}
                  className="inline-flex items-center px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />새 종목 추가
                </Link>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-400">
                    <th className="p-2">종목</th>
                    <th className="p-2">포트폴리오</th>
                    <th className="p-2 text-right">수량</th>
                    <th className="p-2 text-right">평균단가</th>
                    <th className="p-2 text-right">현재가</th>
                    <th className="p-2 text-right">평가금액</th>
                    <th className="p-2 text-right">비중</th>
                    <th className="p-2 text-right">수익률</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {allPositions.map((position) => {
                    const returnRate =
                      ((position.currentPrice - position.avgPrice) /
                        position.avgPrice) *
                      100;
                    const totalValue =
                      position.quantity * position.currentPrice;
                    const percentage = (totalValue / summary.totalValue) * 100;
                    const portfolio = summary.portfolios.find(
                      (p) => p.id === position.portfolioId
                    );

                    return (
                      <tr
                        key={position.id}
                        className="border-t border-gray-700"
                      >
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{position.symbol}</div>
                            <div className="text-sm text-gray-400">
                              {position.name}
                            </div>
                          </div>
                        </td>
                        <td className="p-2">
                          {portfolio && (
                            <Link
                              to={`/portfolios/${portfolio.id}`}
                              className="text-blue-500 hover:text-blue-400"
                            >
                              <div className="text-sm">
                                <div>{portfolio.name}</div>
                                <div className="text-xs text-gray-400">
                                  {portfolio.config?.period || "미분류"}
                                </div>
                              </div>
                            </Link>
                          )}
                        </td>
                        <td className="p-2 text-right">
                          {position.quantity.toLocaleString()}
                        </td>
                        <td className="p-2 text-right">
                          {formatCurrency(
                            position.avgPrice,
                            summary.account.currency
                          )}
                        </td>
                        <td className="p-2 text-right">
                          {formatCurrency(
                            position.currentPrice,
                            summary.account.currency
                          )}
                        </td>
                        <td className="p-2 text-right">
                          {formatCurrency(totalValue, summary.account.currency)}
                        </td>
                        <td className="p-2 text-right">
                          {percentage.toFixed(2)}%
                        </td>
                        <td className="p-2 text-right">
                          <span
                            className={
                              returnRate >= 0
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {returnRate.toFixed(2)}%
                          </span>
                        </td>
                        <td className="p-2 text-right">
                          <div className="flex justify-end space-x-2">
                            <Link
                              to={`/accounts/${accountId}/positions/${position.id}/edit`}
                              className="text-gray-400 hover:text-white"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDeletePosition(position.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              ×
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
