import { PortfolioGroup } from '../types';
import { db } from './db';

export class PortfolioGroupService {
  static async getAll(): Promise<PortfolioGroup[]> {
    return db.portfolioGroups.toArray();
  }

  static async getById(id: number): Promise<PortfolioGroup | undefined> {
    return db.portfolioGroups.get(id);
  }

  static async create(data: Omit<PortfolioGroup, 'id'>): Promise<PortfolioGroup> {
    const id = await db.portfolioGroups.add(data as any);
    const group = await db.portfolioGroups.get(id);
    if (!group) throw new Error('포트폴리오 그룹 생성에 실패했습니다.');
    return group;
  }

  static async update(id: number, data: PortfolioGroup): Promise<void> {
    await db.portfolioGroups.update(id, data);
  }

  static async delete(id: number): Promise<void> {
    await db.transaction('rw', [db.portfolioGroups, db.portfolios, db.positions, db.todos], async () => {
      const portfolios = await db.portfolios.where('groupId').equals(id).toArray();
      const portfolioIds = portfolios.map(p => p.id);

      await Promise.all([
        db.portfolioGroups.delete(id),
        db.portfolios.where('groupId').equals(id).delete(),
        ...portfolioIds.map(portfolioId =>
          db.positions.where('portfolioId').equals(portfolioId).delete()
        ),
        db.todos.where('portfolioGroupId').equals(id).delete()
      ]);
    });
  }

  static async getWithPortfolios(id: number) {
    const group = await this.getById(id);
    if (!group) return null;

    const portfolios = await db.portfolios.where('groupId').equals(id).toArray();
    return {
      ...group,
      portfolios
    };
  }

  static async getAllWithPortfolios() {
    const groups = await this.getAll();
    const portfolios = await db.portfolios.toArray();

    return groups.map(group => ({
      ...group,
      portfolios: portfolios.filter(p => p.groupId === group.id)
    }));
  }
} 