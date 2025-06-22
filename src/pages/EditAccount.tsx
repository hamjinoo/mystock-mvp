import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { AccountService } from "../services/accountService";
import { Account } from "../types";

export const EditAccountPage: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccount();
  }, [accountId]);

  const loadAccount = async () => {
    if (!accountId) return;

    try {
      const data = await AccountService.getById(Number(accountId));
      if (data) {
        setAccount(data);
      }
    } catch (error) {
      console.error("계좌 정보 로딩 중 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !accountId) return;

    try {
      await AccountService.update(Number(accountId), {
        broker: account.broker.trim(),
        accountNumber: account.accountNumber.trim(),
        accountName: account.accountName.trim(),
        currency: account.currency,
      });
      navigate(`/accounts/${accountId}`);
    } catch (error) {
      console.error("계좌 수정 중 오류:", error);
      alert("계좌 수정에 실패했습니다.");
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

  if (!account) {
    return (
      <div className="p-4">
        <div className="text-center">
          <p className="text-gray-400">계좌를 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate("/accounts")}
            className="inline-block mt-4 text-blue-500 hover:text-blue-400"
          >
            계좌 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">계좌 수정</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">증권사</label>
            <input
              type="text"
              value={account.broker}
              onChange={(e) =>
                setAccount({ ...account, broker: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 키움증권, 미래에셋 등"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">계좌번호</label>
            <input
              type="text"
              value={account.accountNumber}
              onChange={(e) =>
                setAccount({ ...account, accountNumber: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 123-456789-01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">계좌명</label>
            <input
              type="text"
              value={account.accountName}
              onChange={(e) =>
                setAccount({ ...account, accountName: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 주식 계좌, 해외주식 계좌 등"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">통화</label>
            <select
              value={account.currency}
              onChange={(e) =>
                setAccount({
                  ...account,
                  currency: e.target.value as "KRW" | "USD",
                })
              }
              className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="KRW">KRW (원)</option>
              <option value="USD">USD (달러)</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/accounts/${accountId}`)}
              className="px-6 py-2 text-gray-400 hover:text-gray-300"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={
                !account.broker.trim() ||
                !account.accountNumber.trim() ||
                !account.accountName.trim()
              }
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
