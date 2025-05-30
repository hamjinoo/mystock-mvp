import { useCallback, useEffect, useState } from 'react';
import { db } from '../services/db';
import { Portfolio, Position, Todo } from '../types';

export function usePortfolio(id: number) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPortfolioData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const portfolioData = await db.getPortfolioWithPositions(id);
      const todos = await db.todos.where('portfolioId').equals(id).toArray();

      if (portfolioData) {
        setPortfolio(portfolioData);
        setPositions(portfolioData.positions || []);
        setTodos(todos);
      } else {
        setError('포트폴리오를 찾을 수 없습니다.');
      }
    } catch (err) {
      console.error('포트폴리오 데이터 로딩 중 오류:', err);
      setError(err instanceof Error ? err.message : '데이터 로딩 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPortfolioData();
  }, [loadPortfolioData]);

  const updatePortfolio = useCallback(async (updatedPortfolio: Portfolio) => {
    try {
      await db.portfolios.update(updatedPortfolio.id, updatedPortfolio);
      await loadPortfolioData();
    } catch (err) {
      throw err instanceof Error ? err : new Error('포트폴리오 업데이트 중 오류가 발생했습니다.');
    }
  }, [loadPortfolioData]);

  const addPosition = useCallback(async (position: Omit<Position, 'id'>) => {
    try {
      await db.positions.add({
        ...position,
        name: position.name || position.symbol,
        strategyCategory: position.category || 'UNCATEGORIZED',
        strategyTags: position.strategyTags || [],
        entryCount: position.entryCount || 1,
        maxEntries: position.maxEntries || 1,
        targetQuantity: position.targetQuantity || position.quantity,
        order: positions.length
      } as Position);
      await loadPortfolioData();
    } catch (err) {
      throw err instanceof Error ? err : new Error('포지션 추가 중 오류가 발생했습니다.');
    }
  }, [loadPortfolioData, positions]);

  const updatePosition = useCallback(async (position: Position) => {
    try {
      const { id, ...updateData } = position;
      await db.positions.update(id, updateData);
      await loadPortfolioData();
    } catch (err) {
      throw err instanceof Error ? err : new Error('포지션 수정 중 오류가 발생했습니다.');
    }
  }, [loadPortfolioData]);

  const deletePosition = useCallback(async (positionId: number) => {
    try {
      await db.positions.delete(positionId);
      await loadPortfolioData();
    } catch (err) {
      throw err instanceof Error ? err : new Error('포지션 삭제 중 오류가 발생했습니다.');
    }
  }, [loadPortfolioData]);

  const addTodo = useCallback(async (content: string) => {
    try {
      await db.todos.add({
        portfolioId: id,
        content,
        completed: false,
        createdAt: Date.now()
      } as Todo);
      await loadPortfolioData();
    } catch (err) {
      throw err instanceof Error ? err : new Error('할 일 추가 중 오류가 발생했습니다.');
    }
  }, [id, loadPortfolioData]);

  const toggleTodo = useCallback(async (todoId: number) => {
    try {
      const todo = await db.todos.get(todoId);
      if (todo) {
        await db.todos.update(todoId, { completed: !todo.completed });
        await loadPortfolioData();
      }
    } catch (err) {
      throw err instanceof Error ? err : new Error('할 일 상태 변경 중 오류가 발생했습니다.');
    }
  }, [loadPortfolioData]);

  return {
    portfolio,
    positions,
    todos,
    loading,
    error,
    updatePortfolio,
    addPosition,
    updatePosition,
    deletePosition,
    addTodo,
    toggleTodo,
    refresh: loadPortfolioData
  };
} 