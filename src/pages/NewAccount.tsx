import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountService } from '../services/accountService';

export const NewAccount: React.FC = () => {
  const navigate = useNavigate();
  const [broker, setBroker] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [currency, setCurrency] = useState<"KRW" | "USD">('KRW');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await AccountService.create({
        broker: broker.trim(),
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
        currency,
        createdAt: Date.now()
      });
      navigate('/accounts');
    } catch (error) {
      console.error('계좌 생성 중 오류:', error);
      alert('계좌 생성에 실패했습니다.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">새 계좌 추가</h1>
      <form onSubmit={handleSubmit} className="max-w-md space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            증권사
          </label>
          <input
            type="text"
            value={broker}
            onChange={(e) => setBroker(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="예: 키움증권, 미래에셋"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            계좌번호
          </label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="예: 123-45-6789"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            계좌명
          </label>
          <input
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="예: 주식 계좌, 해외주식"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            통화
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as "KRW" | "USD")}
            className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="KRW">KRW (원)</option>
            <option value="USD">USD (달러)</option>
          </select>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/accounts')}
            className="px-6 py-2 text-gray-400 hover:text-gray-300"
          >
            취소
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            저장
          </button>
        </div>
      </form>
    </div>
  );
}; 