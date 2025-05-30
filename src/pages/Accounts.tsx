import React from 'react';
import { Link } from 'react-router-dom';
import { useAccounts } from '../hooks/useAccounts';

export const Accounts: React.FC = () => {
  const { accounts, loading, error } = useAccounts();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">에러: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">계좌 목록</h1>
        <Link
          to="/accounts/new"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          새 계좌
        </Link>
      </div>

      <div className="space-y-4">
        {accounts.map((account) => (
          <Link
            key={account.id}
            to={`/accounts/${account.id}`}
            className="block bg-gray-800 p-4 rounded-lg hover:bg-gray-700"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-medium">{account.accountName}</h2>
                <p className="text-sm text-gray-400">
                  {account.broker} - {account.accountNumber}
                </p>
              </div>
              <div className="text-sm text-gray-400">
                {account.currency}
              </div>
            </div>
          </Link>
        ))}

        {accounts.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            등록된 계좌가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}; 