import { NewPortfolio, Portfolio, PortfolioSchema } from '../schemas';
import { db } from './db';

export class PortfolioService {
  static async getAll(): Promise<Portfolio[]> {
    return await db.portfolios.toArray();
  }

  static async getById(id: number): Promise<Portfolio | undefined> {
    return await db.portfolios.get(id);
  }

  static async create(portfolio: NewPortfolio): Promise<Portfolio> {
    const validatedData = PortfolioSchema.parse(portfolio);
    const id = await db.portfolios.add(validatedData);
    return { ...validatedData, id };
  }

  static async update(id: number, portfolio: Partial<Portfolio>): Promise<void> {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Portfolio not found');

    const validatedData = PortfolioSchema.parse({ ...existing, ...portfolio });
    await db.portfolios.update(id, validatedData);
  }

  static async delete(id: number): Promise<void> {
    await db.transaction('rw', [db.portfolios, db.positions, db.todos], async () => {
      await db.portfolios.delete(id);
      await db.positions.where('portfolioId').equals(id).delete();
      await db.todos.where('portfolioId').equals(id).delete();
    });
  }
} 