import { NewTodo, Todo } from '../types';
import { db } from './db';

export class TodoService {
  static async getAll(): Promise<Todo[]> {
    return db.todos.toArray();
  }

  static async getByPortfolioGroupId(groupId: number): Promise<Todo[]> {
    return db.todos
      .where('portfolioGroupId')
      .equals(groupId)
      .toArray();
  }

  static async create(data: NewTodo): Promise<Todo> {
    const id = await db.todos.add(data as any);
    const todo = await db.todos.get(id);
    if (!todo) throw new Error('할 일 생성에 실패했습니다.');
    return todo;
  }

  static async update(id: number, data: Todo): Promise<Todo> {
    await db.todos.update(id, data);
    const todo = await db.todos.get(id);
    if (!todo) throw new Error('할 일 업데이트에 실패했습니다.');
    return todo;
  }

  static async delete(id: number): Promise<void> {
    await db.todos.delete(id);
  }

  static async toggleDone(id: number): Promise<void> {
    const todo = await this.getById(id);
    if (!todo) throw new Error('Todo not found');

    const updatedTodo = {
      ...todo,
      completed: !todo.completed,
      done: !todo.completed,
      completedAt: !todo.completed ? Date.now() : null
    };

    await this.update(id, updatedTodo);
  }

  static async getById(id: number): Promise<Todo | undefined> {
    return await db.todos.get(id);
  }
} 