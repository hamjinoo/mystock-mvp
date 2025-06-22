import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../services/db";
import { Portfolio } from "../types";
import { formatCurrency } from "../utils/currencyUtils";

interface PortfolioWithStats extends Portfolio {
  totalValue: number;
  returnRate: number;
}

export const PortfolioList: React.FC = () => {
  const [portfolios, setPortfolios] = useState<PortfolioWithStats[]>([]);

  const loadPortfolios = async () => {
    const portfoliosData = await db.portfolios.toArray();
    const portfoliosWithStats = await Promise.all(
      portfoliosData.map(async (p) => {
        const positions = await db.positions
          .where("portfolioId")
          .equals(p.id)
          .toArray();

        const totalValue = positions.reduce(
          (sum, pos) => sum + pos.quantity * pos.currentPrice,
          0
        );

        const totalCost = positions.reduce(
          (sum, pos) => sum + pos.quantity * pos.avgPrice,
          0
        );

        const returnRate =
          totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

        return {
          ...p,
          totalValue,
          returnRate,
        };
      })
    );

    setPortfolios(portfoliosWithStats);
  };

  const handleDelete = async (portfolioId: number) => {
    if (!window.confirm("정말 이 포트폴리오를 삭제하시겠습니까?")) return;

    await db.transaction(
      "rw",
      [db.portfolios, db.positions, db.todos],
      async () => {
        await db.portfolios.delete(portfolioId);
        await db.positions.where("portfolioId").equals(portfolioId).delete();
        await db.todos.where("portfolioId").equals(portfolioId).delete();
      }
    );

    setPortfolios(portfolios.filter((p) => p.id !== portfolioId));
  };

  useEffect(() => {
    loadPortfolios();
  }, []);

  return (
    <div className="space-y-4">
      {portfolios.map((portfolio) => (
        <div key={portfolio.id} className="bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <Link
                to={`/portfolios/${portfolio.id}`}
                className="text-lg font-medium hover:text-blue-400"
              >
                {portfolio.name}
              </Link>
              <div className="mt-2 space-y-1 text-sm text-gray-400">
                <p>총 자산: {formatCurrency(portfolio.totalValue, "KRW")}</p>
                <p
                  className={
                    portfolio.returnRate >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  수익률: {portfolio.returnRate.toFixed(2)}%
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDelete(portfolio.id)}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              삭제
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
