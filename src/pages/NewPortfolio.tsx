import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountService } from '../services/accountService';
import { PortfolioService } from '../services/portfolioService';
import { Account, NewPortfolio } from '../types';

type InvestmentPeriod = keyof typeof PERIOD_CONFIGS;

interface PeriodConfig {
  name: string;
  description: string;
}

const PERIOD_CONFIGS = {
  LONG_TERM: {
    name: '장기 투자',
    description: '3년 이상의 장기 투자 포트폴리오'
  },
  MID_TERM: {
    name: '중기 투자',
    description: '1~3년의 중기 투자 포트폴리오'
  },
  SHORT_TERM: {
    name: '단기 투자',
    description: '1년 미만의 단기 투자 포트폴리오'
  },
  UNCATEGORIZED: {
    name: '미분류',
    description: '투자 기간이 정해지지 않은 포트폴리오'
  },
  CUSTOM: {
    name: '직접 입력',
    description: '투자 기간을 직접 설정'
  }
} as const;

export const NewPortfolioPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<InvestmentPeriod>('LONG_TERM');
  const [customDescription, setCustomDescription] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await AccountService.getAll();
      setAccounts(data);
      if (data.length > 0) {
        setSelectedAccountId(data[0].id);
      }
    } catch (error) {
      console.error('계좌 목록 로딩 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId) return;

    try {
      const account = accounts.find(a => a.id === selectedAccountId);
      if (!account) throw new Error('선택한 계좌를 찾을 수 없습니다.');

      const portfolio: NewPortfolio = {
        name: name.trim(),
        accountId: selectedAccountId,
        currency: account.currency,
        config: {
          targetAllocation: 0,
          period: selectedPeriod === 'CUSTOM' ? 'UNCATEGORIZED' : selectedPeriod,
          description: selectedPeriod === 'CUSTOM' ? customDescription : PERIOD_CONFIGS[selectedPeriod].description,
          totalCapital: 0
        }
      };

      await PortfolioService.create(portfolio);
      navigate('/portfolios');
    } catch (error) {
      console.error('포트폴리오 생성 중 오류:', error);
      alert('포트폴리오 생성에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">새 포트폴리오</h1>
          <p className="text-gray-400 mb-4">등록된 계좌가 없습니다.</p>
          <button
            onClick={() => navigate('/accounts/new')}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            새 계좌 등록하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">새 포트폴리오</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              계좌 선택
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(Number(e.target.value))}
              className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.accountName} ({account.broker})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              포트폴리오명
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-4">투자 기간</label>
            <div className="space-y-4">
              {(Object.keys(PERIOD_CONFIGS) as InvestmentPeriod[]).map((period) => {
                const config = PERIOD_CONFIGS[period];
                return (
                  <div
                    key={period}
                    className={`p-4 rounded cursor-pointer border-2 ${
                      selectedPeriod === period
                        ? 'border-blue-500 bg-gray-800'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedPeriod(period)}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="period"
                        checked={selectedPeriod === period}
                        onChange={() => setSelectedPeriod(period)}
                        className="mr-2"
                      />
                      <div>
                        <h3 className="font-medium">{config.name}</h3>
                        <p className="text-sm text-gray-400">{config.description}</p>
                      </div>
                    </div>
                    {period === 'CUSTOM' && selectedPeriod === 'CUSTOM' && (
                      <div className="mt-3">
                        <label className="block text-sm text-gray-400 mb-1">설명</label>
                        <input
                          type="text"
                          value={customDescription}
                          onChange={(e) => setCustomDescription(e.target.value)}
                          className="w-full px-3 py-1 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="투자 전략에 대한 설명을 입력하세요"
                          required={selectedPeriod === 'CUSTOM'}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/portfolios')}
              className="px-6 py-2 text-gray-400 hover:text-gray-300"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={!name.trim() || !selectedAccountId || (selectedPeriod === 'CUSTOM' && !customDescription)}
            >
              생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 