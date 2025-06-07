import { db } from "../services/db";
import { Memo, Portfolio, Position, Todo } from "../types";

interface BackupData {
  timestamp: number;
  name: string;
  data: {
    portfolios: any[];
    positions: any[];
    accounts: any[];
    todos: any[];
  };
}

export const createBackup = async (name: string): Promise<BackupData> => {
  const portfolios = await db.portfolios.toArray();
  const positions = await db.positions.toArray();
  const accounts = await db.accounts.toArray();
  const todos = await db.todos.toArray();

  const backup: BackupData = {
    timestamp: Date.now(),
    name,
    data: {
      portfolios,
      positions,
      accounts,
      todos,
    },
  };

  // 로컬 스토리지에 백업 목록 저장
  const backupList = getBackupList();
  backupList.push({
    timestamp: backup.timestamp,
    name: backup.name,
  });
  localStorage.setItem("db_backups", JSON.stringify(backupList));

  // 백업 데이터 저장
  localStorage.setItem(`db_backup_${backup.timestamp}`, JSON.stringify(backup));

  return backup;
};

export const restoreBackup = async (timestamp: number): Promise<void> => {
  const backupJson = localStorage.getItem(`db_backup_${timestamp}`);
  if (!backupJson) {
    throw new Error("백업을 찾을 수 없습니다.");
  }

  const backup: BackupData = JSON.parse(backupJson);

  // DB 초기화
  await db.delete();
  await db.open();

  // 데이터 복원
  await db.portfolios.bulkAdd(backup.data.portfolios);
  await db.positions.bulkAdd(backup.data.positions);
  await db.accounts.bulkAdd(backup.data.accounts);
  await db.todos.bulkAdd(backup.data.todos);
};

export const getBackupList = (): Array<{ timestamp: number; name: string }> => {
  const backupListJson = localStorage.getItem("db_backups");
  return backupListJson ? JSON.parse(backupListJson) : [];
};

export const deleteBackup = (timestamp: number): void => {
  // 백업 목록에서 제거
  const backupList = getBackupList().filter(
    (backup) => backup.timestamp !== timestamp
  );
  localStorage.setItem("db_backups", JSON.stringify(backupList));

  // 백업 데이터 삭제
  localStorage.removeItem(`db_backup_${timestamp}`);
};

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
      type: "application/json",
    });

    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error creating backup:", error);
    throw new Error("백업 생성 중 오류가 발생했습니다.");
  }
};

export const importBackup = async (file: File): Promise<void> => {
  try {
    const text = await file.text();
    const backupData: BackupData = JSON.parse(text);

    // 데이터 유효성 검사
    if (
      !backupData.portfolios ||
      !backupData.positions ||
      !backupData.todos ||
      !backupData.memos
    ) {
      throw new Error("유효하지 않은 백업 파일입니다.");
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
    console.error("Error importing backup:", error);
    throw new Error("백업 복원 중 오류가 발생했습니다.");
  }
};
