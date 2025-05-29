import React, { useEffect, useState } from 'react';
import { TodoList } from '../components/TodoList';
import { db } from '../services/db';
import { NewTodo, Todo } from '../types';

export const TodoPage: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  const loadTodos = async () => {
    try {
      const todos = await db.todos.orderBy('createdAt').reverse().toArray();
      setTodos(todos);
    } catch (error) {
      console.error('Error loading todos:', error);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const handleAddTodo = async (content: string) => {
    try {
      const newTodo: NewTodo = {
        portfolioId: null,
        content,
        done: false,
        createdAt: Date.now(),
      };

      await db.addTodo(newTodo);
      await loadTodos();
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const handleToggleTodo = async (todoId: number) => {
    try {
      const todo = await db.todos.get(todoId);
      if (todo) {
        await db.todos.update(todoId, { done: !todo.done });
        await loadTodos();
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const handleDeleteTodo = async (todoId: number) => {
    try {
      await db.todos.delete(todoId);
      await loadTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">할 일 목록</h1>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <TodoList
            todos={todos}
            onToggle={handleToggleTodo}
            onAdd={handleAddTodo}
            onDelete={handleDeleteTodo}
          />
        </div>
      </div>
    </div>
  );
}; 