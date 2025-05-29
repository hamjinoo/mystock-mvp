import { NewTodo, Todo } from '../types';
import { db } from './db';

export class TodoService {
  static async getByPortfolioId(portfolioId: number): Promise<Todo[]> {
    return await db.todos.where('portfolioId').equals(portfolioId).toArray() as Todo[];
  }

  static async getById(id: number): Promise<Todo | undefined> {
    return await db.todos.get(id) as Todo | undefined;
  }

  static async create(todo: NewTodo): Promise<Todo> {
    const id = await db.todos.add(todo as any);
    const createdTodo = await this.getById(id);
    if (!createdTodo) {
      throw new Error('Failed to create todo');
    }
    return createdTodo;
  }

  static async update(todo: Todo): Promise<void> {
    await db.todos.update(todo.id, todo);
  }

  static async delete(id: number): Promise<void> {
    await db.todos.delete(id);
  }

  static async toggleDone(id: number): Promise<void> {
    const todo = await this.getById(id);
    if (!todo) throw new Error('Todo not found');

    await this.update(todo);
  }

  static async getAll(): Promise<Todo[]> {
    return await db.todos.toArray() as Todo[];
  }
} 