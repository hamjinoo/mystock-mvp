import {
  BanknotesIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { AccountService } from "../services/accountService";
import { PortfolioService } from "../services/portfolioService";
import { Account, Portfolio } from "../types";

export const MainPage: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [portfoliosData, accountsData] = await Promise.all([
        PortfolioService.getAll(),
        AccountService.getAll(),
      ]);
      setPortfolios(portfoliosData);
      setAccounts(accountsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <div className="p-6">
        <div className="max-w-md mx-auto space-y-4">
          <Link
            to="/portfolios"
            className="bg-gray-800 p-6 rounded-lg flex flex-col items-center justify-center text-center"
          >
            <ChartBarIcon className="h-8 w-8 mb-2" />
            <div className="font-semibold">포트폴리오</div>
            <div className="text-sm text-gray-400">{portfolios.length}개</div>
          </Link>
          <Link
            to="/accounts"
            className="bg-gray-800 p-6 rounded-lg flex flex-col items-center justify-center text-center"
          >
            <BanknotesIcon className="h-8 w-8 mb-2" />
            <div className="font-semibold">계좌 관리</div>
            <div className="text-sm text-gray-400">{accounts.length}개</div>
          </Link>
          <Link
            to="/memos"
            className="bg-gray-800 p-6 rounded-lg flex flex-col items-center justify-center text-center"
          >
            <DocumentTextIcon className="h-8 w-8 mb-2" />
            <div className="font-semibold">메모장</div>
          </Link>
          <Link
            to="/todo"
            className="bg-gray-800 p-6 rounded-lg flex flex-col items-center justify-center text-center"
          >
            <ClipboardDocumentListIcon className="h-8 w-8 mb-2" />
            <div className="font-semibold">할 일</div>
          </Link>
        </div>
      </div>
    </div>
  );
};
