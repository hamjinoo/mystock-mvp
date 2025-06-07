import React from "react";
import { Link } from "react-router-dom";
import { usePortfolios } from "../hooks/usePortfolios";

export const PortfolioList: React.FC = () => {
  const { portfolios, loading, error } = usePortfolios();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-900/50 text-red-400 p-4 rounded">
          에러: {error.message}
        </div>
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
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-medium mb-2">
                    {portfolio.name || "이름 없음"}
                  </h2>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>
                      {portfolio.broker} - {portfolio.accountNumber}
                    </p>
                    <p>{portfolio.accountName}</p>
                    <p className="text-sm font-medium text-gray-300">
                      {portfolio.currency === "KRW" ? "원화" : "달러"} 계좌
                    </p>
                  </div>
                </div>
                {portfolio.config?.totalCapital > 0 && (
                  <div className="text-right">
                    <div className="text-lg font-medium">
                      {new Intl.NumberFormat("ko-KR", {
                        style: "currency",
                        currency: portfolio.currency,
                        maximumFractionDigits: 0,
                      }).format(portfolio.config.totalCapital)}
                    </div>
                    <div className="text-sm text-gray-400">총 자본금</div>
                  </div>
                )}
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
