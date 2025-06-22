import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { AccountService } from "../services/accountService";
import { AccountWithPortfolios } from "../types";

export const AccountList: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountWithPortfolios[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await AccountService.getAllWithPortfolios();
      setAccounts(data);
    } catch (error) {
      console.error("계좌 목록 로딩 중 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("정말 이 계좌를 삭제하시겠습니까?")) return;

    try {
      await AccountService.delete(id);
      setAccounts(accounts.filter((a) => a.id !== id));
      window.location.reload();
    } catch (error) {
      console.error("계좌 삭제 중 오류:", error);
      alert("계좌 삭제에 실패했습니다.");
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

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">계좌 목록</h1>
          <Link
            to="/accounts/new"
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <PlusIcon className="h-5 w-5 mr-1" />새 계좌
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="bg-gray-800 rounded-lg p-4 relative"
            >
              <button
                onClick={() => handleDelete(account.id)}
                className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
              <Link to={`/accounts/${account.id}`}>
                <h2 className="text-xl font-bold mb-2">
                  {account.accountName}
                </h2>
                <p className="text-sm text-gray-400 mb-4">{account.broker}</p>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="text-gray-400">계좌번호: </span>
                    {account.accountNumber}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-400">총자산: </span>
                    {new Intl.NumberFormat("ko-KR", {
                      style: "currency",
                      currency: account.currency,
                    }).format(account.totalValue)}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-400">포트폴리오: </span>
                    {account.portfolios.length}개
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {accounts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">등록된 계좌가 없습니다.</p>
            <Link
              to="/accounts/new"
              className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              새 계좌 등록하기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
