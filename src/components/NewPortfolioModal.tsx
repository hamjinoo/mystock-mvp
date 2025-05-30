import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { AccountService } from '../services/accountService';
import { db } from '../services/db';
import { Account, NewPortfolio } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewPortfolioModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [accountId, setAccountId] = useState<number>();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await AccountService.getAll();
      setAccounts(data);
      if (data.length > 0) {
        setAccountId(data[0].id);
      }
    } catch (error) {
      console.error('계좌 목록 로딩 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) return;

    try {
      const account = accounts.find(a => a.id === accountId);
      if (!account) throw new Error('선택한 계좌를 찾을 수 없습니다.');

      const portfolio: NewPortfolio = {
        name: name.trim(),
        accountId,
        currency: account.currency,
        config: {
          targetAllocation: 0,
          period: 'UNCATEGORIZED',
          description: '새 포트폴리오',
          totalCapital: 0
        }
      };

      await db.addPortfolio(portfolio);
      onSuccess();
      onClose();
      setName('');
      setAccountId(accounts[0]?.id);
    } catch (error) {
      console.error('포트폴리오 생성 중 오류:', error);
      alert('포트폴리오 생성에 실패했습니다.');
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-white mb-4"
                >
                  새 포트폴리오
                </Dialog.Title>

                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
                  </div>
                ) : accounts.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-400 mb-4">등록된 계좌가 없습니다.</p>
                    <a
                      href="/accounts/new"
                      className="text-blue-500 hover:text-blue-400"
                    >
                      새 계좌 등록하기
                    </a>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        포트폴리오 이름
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="예: 장기 투자, 단기 매매 등"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        계좌 선택
                      </label>
                      <select
                        value={accountId}
                        onChange={(e) => setAccountId(Number(e.target.value))}
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

                    <div className="flex justify-end space-x-4 mt-6">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-400 hover:text-gray-300"
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                        disabled={!name.trim() || !accountId}
                      >
                        생성
                      </button>
                    </div>
                  </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}; 