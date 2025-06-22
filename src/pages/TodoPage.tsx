import { PlusIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { PortfolioService } from "../services/portfolioService";
import { TodoService } from "../services/todoService";
import { Portfolio, Todo } from "../types";

export const TodoPage: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<number | null>(
    null
  );
  const [newTodoText, setNewTodoText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [portfoliosData, todosData] = await Promise.all([
        PortfolioService.getAll(),
        TodoService.getAll(),
      ]);
      setPortfolios(portfoliosData);
      setTodos(todosData);
    } catch (error) {
      console.error("데이터 로딩 중 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim() || !selectedPortfolio) return;

    try {
      const newTodo = await TodoService.create({
        portfolioId: selectedPortfolio,
        text: newTodoText.trim(),
        completed: false,
        createdAt: Date.now(),
        completedAt: null,
      });
      setTodos([...todos, newTodo]);
      setNewTodoText("");
    } catch (error) {
      console.error("할 일 추가 중 오류:", error);
      alert("할 일 추가에 실패했습니다.");
    }
  };

  const handleToggleTodo = async (todo: Todo) => {
    try {
      const updatedTodo = await TodoService.update(todo.id, {
        ...todo,
        completed: !todo.completed,
        completedAt: !todo.completed ? Date.now() : null,
      });
      setTodos(todos.map((t) => (t.id === todo.id ? updatedTodo : t)));
    } catch (error) {
      console.error("할 일 상태 변경 중 오류:", error);
      alert("할 일 상태 변경에 실패했습니다.");
    }
  };

  const handleDeleteTodo = async (todoId: number) => {
    if (!window.confirm("이 할 일을 삭제하시겠습니까?")) return;

    try {
      await TodoService.delete(todoId);
      setTodos(todos.filter((t) => t.id !== todoId));
    } catch (error) {
      console.error("할 일 삭제 중 오류:", error);
      alert("할 일 삭제에 실패했습니다.");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">할 일 목록</h1>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">포트폴리오</label>
          <select
            value={selectedPortfolio || ""}
            onChange={(e) =>
              setSelectedPortfolio(
                e.target.value ? Number(e.target.value) : null
              )
            }
            className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">포트폴리오 선택</option>
            {portfolios.map((portfolio) => (
              <option key={portfolio.id} value={portfolio.id}>
                {portfolio.name}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleAddTodo} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="새 할 일 추가"
              disabled={!selectedPortfolio}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedPortfolio || !newTodoText.trim()}
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {todos
            .filter(
              (todo) =>
                !selectedPortfolio || todo.portfolioId === selectedPortfolio
            )
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((todo) => (
              <div key={todo.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggleTodo(todo)}
                      className="h-5 w-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                    />
                    <span
                      className={
                        todo.completed ? "line-through text-gray-400" : ""
                      }
                    >
                      {todo.text}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
                <div className="pl-9 space-y-1">
                  <p className="text-sm text-gray-400">
                    등록: {formatDate(todo.createdAt)}
                  </p>
                  {todo.completedAt && (
                    <p className="text-sm text-gray-400">
                      완료: {formatDate(todo.completedAt)}
                    </p>
                  )}
                </div>
              </div>
            ))}
        </div>

        {(!todos.length ||
          (selectedPortfolio &&
            !todos.some((t) => t.portfolioId === selectedPortfolio))) && (
          <div className="text-center py-8">
            <p className="text-gray-400">아직 할 일이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};
