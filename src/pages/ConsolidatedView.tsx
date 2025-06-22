import React, { useEffect, useState } from "react";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { AccountService } from "../services/accountService";
import { PortfolioService } from "../services/portfolioService";
import { Position } from "../types";
import { formatCurrency } from "../utils/currencyUtils";

interface ConsolidatedPosition {
  symbol: string;
  name: string;
  totalQuantity: number;
  weightedAvgPrice: number;
  currentPrice: number;
  totalValue: number;
  totalCost: number;
  unrealizedPnL: number;
  returnRate: number;
  positions: (Position & {
    portfolioName: string;
    accountName: string;
    currency: string;
  })[];
}

export const ConsolidatedView: React.FC = () => {
  const [consolidatedPositions, setConsolidatedPositions] = useState<
    ConsolidatedPosition[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"symbol" | "value" | "return">("value");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    loadConsolidatedData();
  }, []);

  // 정렬 변경 시 데이터 재정렬
  useEffect(() => {
    if (consolidatedPositions.length > 0) {
      const sortedPositions = [...consolidatedPositions].sort((a, b) => {
        let compareValue = 0;
        switch (sortBy) {
          case "symbol":
            compareValue = a.symbol.localeCompare(b.symbol);
            break;
          case "value":
            compareValue = a.totalValue - b.totalValue;
            break;
          case "return":
            compareValue = a.returnRate - b.returnRate;
            break;
        }
        return sortOrder === "asc" ? compareValue : -compareValue;
      });
      setConsolidatedPositions(sortedPositions);
    }
  }, [sortBy, sortOrder]);

  const loadConsolidatedData = async () => {
    try {
      // 모든 포트폴리오와 계좌 정보 가져오기
      const [portfolios, accounts] = await Promise.all([
        PortfolioService.getAll(),
        AccountService.getAll(),
      ]);

      // 모든 포지션 가져오기
      const allPositions: (Position & {
        portfolioName: string;
        accountName: string;
        currency: string;
      })[] = [];

      for (const portfolio of portfolios) {
        const portfolioWithPositions = await PortfolioService.getWithPositions(
          portfolio.id!
        );
        const account = accounts.find((a) => a.id === portfolio.accountId);

        portfolioWithPositions.positions.forEach((position) => {
          allPositions.push({
            ...position,
            portfolioName: portfolio.name,
            accountName: account?.accountName || "알 수 없음",
            currency: portfolio.currency,
          });
        });
      }

      // 티커별로 통합
      const consolidatedMap = new Map<string, ConsolidatedPosition>();

      allPositions.forEach((position) => {
        const key = position.symbol;

        if (!consolidatedMap.has(key)) {
          consolidatedMap.set(key, {
            symbol: position.symbol,
            name: position.name,
            totalQuantity: 0,
            weightedAvgPrice: 0,
            currentPrice: position.currentPrice,
            totalValue: 0,
            totalCost: 0,
            unrealizedPnL: 0,
            returnRate: 0,
            positions: [],
          });
        }

        const consolidated = consolidatedMap.get(key)!;
        const positionCost = position.quantity * position.avgPrice;
        const positionValue = position.quantity * position.currentPrice;

        // 가중평균 계산
        consolidated.totalCost += positionCost;
        consolidated.totalQuantity += position.quantity;
        consolidated.weightedAvgPrice =
          consolidated.totalCost / consolidated.totalQuantity;

        consolidated.totalValue += positionValue;
        consolidated.currentPrice = position.currentPrice; // 최신 현재가 사용
        consolidated.unrealizedPnL =
          consolidated.totalValue - consolidated.totalCost;
        consolidated.returnRate =
          consolidated.totalCost > 0
            ? (consolidated.unrealizedPnL / consolidated.totalCost) * 100
            : 0;

        consolidated.positions.push(position);
      });

      // 초기 정렬 적용
      const initialPositions = Array.from(consolidatedMap.values()).sort(
        (a, b) => {
          let compareValue = 0;
          switch (sortBy) {
            case "symbol":
              compareValue = a.symbol.localeCompare(b.symbol);
              break;
            case "value":
              compareValue = a.totalValue - b.totalValue;
              break;
            case "return":
              compareValue = a.returnRate - b.returnRate;
              break;
          }
          return sortOrder === "asc" ? compareValue : -compareValue;
        }
      );

      setConsolidatedPositions(initialPositions);
    } catch (error) {
      console.error("통합 데이터 로딩 중 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (newSortBy: "symbol" | "value" | "return") => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  };

  const getTotalPortfolioValue = () => {
    return consolidatedPositions.reduce((sum, pos) => sum + pos.totalValue, 0);
  };

  const getTotalUnrealizedPnL = () => {
    return consolidatedPositions.reduce(
      (sum, pos) => sum + pos.unrealizedPnL,
      0
    );
  };

  const getOverallReturnRate = () => {
    const totalCost = consolidatedPositions.reduce(
      (sum, pos) => sum + pos.totalCost,
      0
    );
    const totalPnL = getTotalUnrealizedPnL();
    return totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">전체 포지션 통합 보기</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-sm text-gray-400 mb-1">총 포트폴리오 가치</h3>
            <p className="text-2xl font-bold text-blue-400">
              ₩{formatCurrency(getTotalPortfolioValue(), "KRW")}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-sm text-gray-400 mb-1">총 평가손익</h3>
            <p
              className={`text-2xl font-bold ${
                getTotalUnrealizedPnL() >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {getTotalUnrealizedPnL() >= 0 ? "+" : ""}₩
              {formatCurrency(Math.abs(getTotalUnrealizedPnL()), "KRW")}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-sm text-gray-400 mb-1">총 수익률</h3>
            <p
              className={`text-2xl font-bold ${
                getOverallReturnRate() >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {getOverallReturnRate() >= 0 ? "+" : ""}
              {getOverallReturnRate().toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 왼쪽: 자산 구성 차트 */}
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">자산 구성</h2>
            {consolidatedPositions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                등록된 포지션이 없습니다.
              </div>
            ) : (
              <div className="space-y-4">
                {consolidatedPositions.map((position, index) => {
                  const percentage =
                    (position.totalValue / getTotalPortfolioValue()) * 100;
                  const colors = [
                    "bg-blue-500",
                    "bg-green-500",
                    "bg-yellow-500",
                    "bg-red-500",
                    "bg-purple-500",
                    "bg-pink-500",
                    "bg-indigo-500",
                    "bg-orange-500",
                  ];
                  const color = colors[index % colors.length];

                  return (
                    <div
                      key={position.symbol}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center flex-1">
                        <div className={`w-4 h-4 rounded ${color} mr-3`}></div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-white">
                              {position.symbol}
                            </span>
                            <span className="text-sm text-gray-400">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className={`${color} h-2 rounded-full`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-sm font-medium">
                          ₩{formatCurrency(position.totalValue, "KRW")}
                        </div>
                        <div
                          className={`text-xs ${
                            position.returnRate >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {position.returnRate >= 0 ? "+" : ""}
                          {position.returnRate.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽: 포지션 목록 */}
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">통합 포지션 목록</h2>

              {/* 정렬 버튼 */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleSort("symbol")}
                  className={`px-3 py-1 rounded text-xs ${
                    sortBy === "symbol"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  티커{" "}
                  {sortBy === "symbol" && (sortOrder === "asc" ? "↑" : "↓")}
                </button>
                <button
                  onClick={() => handleSort("value")}
                  className={`px-3 py-1 rounded text-xs ${
                    sortBy === "value"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  금액 {sortBy === "value" && (sortOrder === "asc" ? "↑" : "↓")}
                </button>
                <button
                  onClick={() => handleSort("return")}
                  className={`px-3 py-1 rounded text-xs ${
                    sortBy === "return"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  수익률{" "}
                  {sortBy === "return" && (sortOrder === "asc" ? "↑" : "↓")}
                </button>
              </div>
            </div>

            {/* 포지션 목록 */}
            <div className="space-y-3">
              {consolidatedPositions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  등록된 포지션이 없습니다.
                </div>
              ) : (
                consolidatedPositions.map((position) => (
                  <div
                    key={position.symbol}
                    className="bg-gray-700 rounded-lg p-4"
                  >
                    {/* 메인 정보 */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {position.symbol}
                        </h3>
                        <p className="text-sm text-gray-400">{position.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-400">
                          ₩{formatCurrency(position.totalValue, "KRW")}
                        </p>
                        <p
                          className={`text-sm font-semibold ${
                            position.returnRate >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {position.returnRate >= 0 ? "+" : ""}
                          {position.returnRate.toFixed(2)}%
                        </p>
                      </div>
                    </div>

                    {/* 상세 정보 */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-300 mb-3">
                      <div>
                        수량: {position.totalQuantity.toLocaleString()}주
                      </div>
                      <div>
                        평균단가: ₩
                        {formatCurrency(position.weightedAvgPrice, "KRW")}
                      </div>
                      <div>
                        현재가: ₩{formatCurrency(position.currentPrice, "KRW")}
                      </div>
                      <div>
                        투자금액: ₩{formatCurrency(position.totalCost, "KRW")}
                      </div>
                    </div>

                    {/* 포트폴리오별 분산 */}
                    <div className="mb-3">
                      <h4 className="text-xs font-medium text-gray-400 mb-2">
                        포트폴리오별 분산
                      </h4>
                      <div className="space-y-1">
                        {position.positions.map((pos, idx) => {
                          const positionValue = pos.quantity * pos.currentPrice;
                          const percentage =
                            (positionValue / position.totalValue) * 100;
                          return (
                            <div
                              key={idx}
                              className="flex items-center text-xs"
                            >
                              <div className="w-20 text-gray-400 truncate">
                                {pos.portfolioName}
                              </div>
                              <div className="flex-1 mx-2">
                                <div className="w-full bg-gray-600 rounded-full h-1">
                                  <div
                                    className="bg-blue-400 h-1 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div className="w-12 text-right text-gray-300">
                                {percentage.toFixed(0)}%
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 세부 포지션 목록 */}
                    <details className="text-xs">
                      <summary className="cursor-pointer text-blue-400 hover:text-blue-300">
                        세부 포지션 ({position.positions.length}개)
                      </summary>
                      <div className="mt-2 space-y-1">
                        {position.positions.map((pos, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center py-1 px-2 bg-gray-600 rounded"
                          >
                            <div>
                              <span className="font-medium">
                                {pos.portfolioName}
                              </span>
                              <span className="text-gray-400 ml-1">
                                ({pos.accountName})
                              </span>
                            </div>
                            <div className="text-right">
                              <div>
                                {pos.quantity}주 × ₩
                                {formatCurrency(pos.avgPrice, "KRW")}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
