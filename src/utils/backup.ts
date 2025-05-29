import { db } from '../services/db';
import { Memo, Portfolio, Position, Todo } from '../types';

interface BackupData {
  portfolios: Portfolio[];
  positions: Position[];
  todos: Todo[];
  memos: Memo[];
  timestamp: number;
}

export const exportBackup = async (): Promise<string> => {
  try {
    const [portfolios, positions, todos, memos] = await Promise.all([
      db.portfolios.toArray(),
      db.positions.toArray(),
      db.todos.toArray(),
      db.memos.toArray(),
    ]);

    const backupData: BackupData = {
      portfolios,
      positions,
      todos,
      memos,
      timestamp: Date.now(),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });

    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error creating backup:', error);
    throw new Error('백업 생성 중 오류가 발생했습니다.');
  }
};

export const importBackup = async (file: File): Promise<void> => {
  try {
    const text = await file.text();
    const backupData: BackupData = JSON.parse(text);

    // 데이터 유효성 검사
    if (!backupData.portfolios || !backupData.positions || !backupData.todos || !backupData.memos) {
      throw new Error('유효하지 않은 백업 파일입니다.');
    }

    // 기존 데이터 삭제
    await Promise.all([
      db.portfolios.clear(),
      db.positions.clear(),
      db.todos.clear(),
      db.memos.clear(),
    ]);

    // 백업 데이터 복원
    await Promise.all([
      db.portfolios.bulkAdd(backupData.portfolios),
      db.positions.bulkAdd(backupData.positions),
      db.todos.bulkAdd(backupData.todos),
      db.memos.bulkAdd(backupData.memos),
    ]);
  } catch (error) {
    console.error('Error importing backup:', error);
    throw new Error('백업 복원 중 오류가 발생했습니다.');
  }
}; 