import { useCallback, useEffect, useState } from 'react';
import { db } from '../services/db';
import { PortfolioService } from '../services/portfolioService';
import { PositionService } from '../services/positionService';
import { TodoService } from '../services/todoService';
import { Portfolio, PortfolioCategory, Position, Todo } from '../types';

interface PortfolioWithPositions extends Portfolio {
  positions: Position[];
}

export function usePortfolio(id: number) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPortfolioData();
  }, [id]);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [portfolio, positions, todos] = await Promise.all([
        PortfolioService.getById(id),
        PositionService.getByPortfolioId(id),
        TodoService.getByPortfolioId(id),
      ]);

      setPortfolio(portfolio || null);
      setPositions(positions);
      setTodos(todos);
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터 로딩 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const addPosition = async (position: Omit<Position, 'id'>) => {
    try {
      await PositionService.create(position);
      await loadPortfolioData();
    } catch (err) {
      throw err instanceof Error ? err : new Error('포지션 추가 중 오류가 발생했습니다.');
    }
  };

  const updatePosition = async (position: Position) => {
    try {
      await PositionService.update(position);
      await loadPortfolioData();
    } catch (err) {
      throw err instanceof Error ? err : new Error('포지션 수정 중 오류가 발생했습니다.');
    }
  };

  const deletePosition = async (positionId: number) => {
    try {
      await PositionService.delete(positionId);
      await loadPortfolioData();
    } catch (err) {
      throw err instanceof Error ? err : new Error('포지션 삭제 중 오류가 발생했습니다.');
    }
  };

  const addTodo = async (content: string) => {
    try {
      await TodoService.create({
        portfolioId: id,
        content,
        done: false,
        createdAt: Date.now(),
      });
      await loadPortfolioData();
    } catch (err) {
      throw err instanceof Error ? err : new Error('할 일 추가 중 오류가 발생했습니다.');
    }
  };

  const toggleTodo = async (todoId: number) => {
    try {
      await TodoService.toggleDone(todoId);
      await loadPortfolioData();
    } catch (err) {
      throw err instanceof Error ? err : new Error('할 일 상태 변경 중 오류가 발생했습니다.');
    }
  };

  const getPortfolio = useCallback(async (id: number): Promise<PortfolioWithPositions> => {
    const portfolio = await db.portfolios.get(id);
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }
    const positions = await db.positions.where('portfolioId').equals(id).toArray();
    return {
      ...portfolio,
      positions: positions.map(position => ({
        ...position,
        name: position.name || position.symbol,
        category: position.category || PortfolioCategory.UNCATEGORIZED,
      })),
    };
  }, []);

  const updatePortfolio = useCallback(async (portfolio: PortfolioWithPositions): Promise<PortfolioWithPositions> => {
    await db.portfolios.put({
      id: portfolio.id,
      name: portfolio.name,
    });

    // 기존 포지션 삭제
    await db.positions.where('portfolioId').equals(portfolio.id).delete();

    // 새 포지션 추가
    await db.positions.bulkPut(
      portfolio.positions.map((position: Position) => ({
        ...position,
        portfolioId: portfolio.id,
        name: position.name || position.symbol,
        category: position.category || PortfolioCategory.UNCATEGORIZED,
      }))
    );

    return portfolio;
  }, []);

  return {
    portfolio,
    positions,
    todos,
    loading,
    error,
    addPosition,
    updatePosition,
    deletePosition,
    addTodo,
    toggleTodo,
    refresh: loadPortfolioData,
    getPortfolio,
    updatePortfolio,
  };
} 