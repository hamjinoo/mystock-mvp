import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ErrorMessage } from "../components/ErrorMessage";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { AccountService } from "../services/accountService";
import { PortfolioService } from "../services/portfolioService";
import { Account, Portfolio } from "../types";
import { formatCurrency } from "../utils/currencyUtils";

interface PortfolioWithStats extends Portfolio {
  account?: Account;
  positionCount: number;
  totalValue: number;
  totalCost: number;
  returnRate: number;
}

export const PortfolioList: React.FC = () => {
  const [portfolios, setPortfolios] = useState<PortfolioWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadPortfoliosWithStats();
  }, []);

  const loadPortfoliosWithStats = async () => {
    try {
      const [portfoliosData, accounts] = await Promise.all([
        PortfolioService.getAll(),
        AccountService.getAll(),
      ]);

      const portfoliosWithStats: PortfolioWithStats[] = await Promise.all(
        portfoliosData.map(async (portfolio) => {
          const account = accounts.find((a) => a.id === portfolio.accountId);
          const summary = await PortfolioService.getPortfolioSummary(
            portfolio.id!
          );

          return {
            ...portfolio,
            account,
            positionCount: summary.positions.length,
            totalValue: summary.totalValue,
            totalCost: summary.totalCost,
            returnRate: summary.returnRate,
          };
        })
      );

      setPortfolios(portfoliosWithStats);
    } catch (err) {
      console.error("포트폴리오 데이터 로딩 중 오류:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage
          message={error.message}
          onRetry={loadPortfoliosWithStats}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">포트폴리오</h1>
          <Link
            to="/portfolios/new"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            새 포트폴리오
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {portfolios.map((portfolio) => (
            <Link
              key={portfolio.id}
              to={`/portfolios/${portfolio.id}`}
              className="block bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h2 className="text-lg font-medium mb-2">
                    {portfolio.name || "이름 없음"}
                  </h2>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p className="flex items-center">
                      <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      {portfolio.config?.period === "LONG_TERM" && "장기 투자"}
                      {portfolio.config?.period === "MID_TERM" && "중기 투자"}
                      {portfolio.config?.period === "SHORT_TERM" && "단기 투자"}
                      {portfolio.config?.period === "UNCATEGORIZED" && "미분류"}
                    </p>
                    <p>{portfolio.account?.accountName || "계좌 정보 없음"}</p>
                    <p className="text-xs">
                      {portfolio.account?.broker} •{" "}
                      {portfolio.currency === "KRW" ? "원화" : "달러"} 계좌
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {portfolio.totalValue > 0 ? (
                    <>
                      <div className="text-lg font-bold text-blue-400">
                        ₩{formatCurrency(portfolio.totalValue, "KRW")}
                      </div>
                      <div
                        className={`text-sm font-medium ${
                          portfolio.returnRate >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {portfolio.returnRate >= 0 ? "+" : ""}
                        {portfolio.returnRate.toFixed(2)}%
                      </div>
                      <div className="text-xs text-gray-400">
                        {portfolio.positionCount}개 종목
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-400">포지션 없음</div>
                  )}
                </div>
              </div>

              {/* 간단한 통계 */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                <div className="text-center">
                  <div className="text-sm font-medium text-white">
                    {portfolio.positionCount}
                  </div>
                  <div className="text-xs text-gray-400">종목 수</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-white">
                    ₩{formatCurrency(portfolio.totalCost, "KRW")}
                  </div>
                  <div className="text-xs text-gray-400">투자금액</div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-sm font-medium ${
                      portfolio.returnRate >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {portfolio.totalValue > 0 ? (
                      <>
                        {portfolio.returnRate >= 0 ? "+" : ""}₩
                        {formatCurrency(
                          Math.abs(portfolio.totalValue - portfolio.totalCost),
                          "KRW"
                        )}
                      </>
                    ) : (
                      "-"
                    )}
                  </div>
                  <div className="text-xs text-gray-400">평가손익</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {portfolios.length === 0 && (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <p className="text-gray-400 mb-4">등록된 포트폴리오가 없습니다.</p>
            <Link
              to="/portfolios/new"
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              첫 포트폴리오 만들기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
