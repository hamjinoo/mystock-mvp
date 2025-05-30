import { useEffect, useState } from 'react';
import { AccountService } from '../services/accountService';
import { Account } from '../types';

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await AccountService.getAll();
      setAccounts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('계좌 목록 로딩 중 오류가 발생했습니다.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const createAccount = async (account: Omit<Account, 'id'>) => {
    try {
      await AccountService.create(account);
      await loadAccounts();
    } catch (err) {
      throw err instanceof Error ? err : new Error('계좌 생성 중 오류가 발생했습니다.');
    }
  };

  const deleteAccount = async (id: number) => {
    try {
      await AccountService.delete(id);
      await loadAccounts();
    } catch (err) {
      throw err instanceof Error ? err : new Error('계좌 삭제 중 오류가 발생했습니다.');
    }
  };

  return {
    accounts,
    loading,
    error,
    createAccount,
    deleteAccount,
    refresh: loadAccounts,
  };
} 