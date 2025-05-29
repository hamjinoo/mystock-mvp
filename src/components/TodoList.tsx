import { TrashIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { Todo } from '../types';

interface TodoListProps {
  todos: Todo[];
  portfolioId?: number;
  onToggle: (id: number) => void;
  onAdd: (content: string) => void;
  onDelete: (id: number) => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  onToggle,
  onAdd,
  onDelete,
}) => {
  const [newTodo, setNewTodo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      onAdd(newTodo.trim());
      setNewTodo('');
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="새로운 할 일을 입력하세요"
          className="flex-1 px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          추가
        </button>
      </form>

      <div className="space-y-2">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center justify-between p-3 bg-gray-700 rounded group"
          >
            <div className="flex items-center gap-3 flex-1">
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => todo.id && onToggle(todo.id)}
                className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <div className="flex-1">
                <p className={`text-white ${todo.done ? 'line-through text-gray-400' : ''}`}>
                  {todo.content}
                </p>
                <div className="text-sm text-gray-400 mt-1">
                  생성: {formatDate(todo.createdAt)}
                  {todo.done && todo.completedAt && (
                    <span className="ml-3">완료: {formatDate(todo.completedAt)}</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => todo.id && onDelete(todo.id)}
              className="px-2 py-1 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}; 