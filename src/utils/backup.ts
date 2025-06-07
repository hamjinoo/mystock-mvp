import { db } from "../services/db";
import { Memo, Portfolio, Position, Todo } from "../types";

interface BackupData {
  timestamp: number;
  name: string;
  dbVersion: number;
  data: {
    portfolios: Portfolio[];
    positions: Position[];
    todos: Todo[];
    memos: Memo[];
    accounts: any[];
  };
}

// 자동 백업 간격 (1일)
const AUTO_BACKUP_INTERVAL = 24 * 60 * 60 * 1000;
const MAX_AUTO_BACKUPS = 5;

// 마지막 자동 백업 시간 확인
const getLastAutoBackupTime = (): number => {
  const time = localStorage.getItem("last_auto_backup_time");
  return time ? parseInt(time) : 0;
};

// 자동 백업 시간 업데이트
const updateLastAutoBackupTime = () => {
  localStorage.setItem("last_auto_backup_time", Date.now().toString());
};

// 자동 백업 필요 여부 확인
const needsAutoBackup = (): boolean => {
  const lastBackupTime = getLastAutoBackupTime();
  return Date.now() - lastBackupTime >= AUTO_BACKUP_INTERVAL;
};

// 오래된 자동 백업 정리
const cleanupOldAutoBackups = () => {
  const backupList = getBackupList();
  const autoBackups = backupList.filter((b) => b.name.startsWith("자동백업_"));
  if (autoBackups.length > MAX_AUTO_BACKUPS) {
    // 가장 오래된 자동 백업들 삭제
    autoBackups
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(MAX_AUTO_BACKUPS)
      .forEach((backup) => deleteBackup(backup.timestamp));
  }
};

export const checkAndCreateAutoBackup = async () => {
  if (needsAutoBackup()) {
    try {
      const timestamp = Date.now();
      const date = new Date().toLocaleDateString("ko-KR");
      await createBackup(`자동백업_${date}`);
      updateLastAutoBackupTime();
      cleanupOldAutoBackups();
    } catch (error) {
      console.error("자동 백업 생성 중 오류:", error);
    }
  }
};

export const createBackup = async (name: string): Promise<BackupData> => {
  try {
    // DB가 열려있는지 확인
    if (!db.isOpen()) {
      await db.open();
    }

    const [portfolios, positions, todos, memos, accounts] = await Promise.all([
      db.portfolios?.toArray() || [],
      db.positions?.toArray() || [],
      db.todos?.toArray() || [],
      db.memos?.toArray() || [],
      db.accounts?.toArray() || [],
    ]);

    const backup: BackupData = {
      timestamp: Date.now(),
      name,
      dbVersion: db.verno,
      data: {
        portfolios,
        positions,
        todos,
        memos,
        accounts,
      },
    };

    // 백업 데이터 유효성 검사
    if (!validateBackupData(backup)) {
      throw new Error("백업 데이터 유효성 검사 실패");
    }

    // 로컬 스토리지에 백업 목록 저장
    const backupList = getBackupList();
    backupList.push({
      timestamp: backup.timestamp,
      name: backup.name,
    });
    localStorage.setItem("db_backups", JSON.stringify(backupList));

    // 백업 데이터 저장
    localStorage.setItem(
      `db_backup_${backup.timestamp}`,
      JSON.stringify(backup)
    );

    return backup;
  } catch (error) {
    console.error("백업 생성 중 오류:", error);
    throw new Error("백업 생성 중 오류가 발생했습니다.");
  }
};

const validateBackupData = (backup: BackupData): boolean => {
  try {
    // 필수 필드 존재 확인
    if (!backup.timestamp || !backup.name || !backup.data) {
      return false;
    }

    // 데이터 형식 확인
    if (
      !Array.isArray(backup.data.portfolios) ||
      !Array.isArray(backup.data.positions) ||
      !Array.isArray(backup.data.todos) ||
      !Array.isArray(backup.data.memos) ||
      !Array.isArray(backup.data.accounts)
    ) {
      return false;
    }

    // 데이터 무결성 확인
    const portfolioIds = new Set(backup.data.portfolios.map((p) => p.id));
    const validPositions = backup.data.positions.every((p) =>
      portfolioIds.has(p.portfolioId)
    );

    if (!validPositions) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("백업 데이터 유효성 검사 중 오류:", error);
    return false;
  }
};

export const restoreBackup = async (timestamp: number): Promise<void> => {
  try {
    const backupJson = localStorage.getItem(`db_backup_${timestamp}`);
    if (!backupJson) {
      throw new Error("백업을 찾을 수 없습니다.");
    }

    const backup: BackupData = JSON.parse(backupJson);

    // 백업 데이터 유효성 검사
    if (!validateBackupData(backup)) {
      throw new Error("유효하지 않은 백업 데이터입니다.");
    }

    // DB 버전 확인
    if (backup.dbVersion && backup.dbVersion !== db.verno) {
      console.warn(
        `백업 DB 버전(${backup.dbVersion})이 현재 DB 버전(${db.verno})과 다릅니다.`
      );
    }

    // 현재 데이터 임시 백업 생성
    const tempBackup = await createBackup(
      `복원_전_백업_${new Date().toLocaleString("ko-KR")}`
    );

    try {
      // DB 초기화
      await db.delete();
      await db.open();

      // 데이터 복원
      await Promise.all(
        [
          db.portfolios?.bulkAdd(backup.data.portfolios || []),
          db.positions?.bulkAdd(backup.data.positions || []),
          db.todos?.bulkAdd(backup.data.todos || []),
          db.memos?.bulkAdd(backup.data.memos || []),
          db.accounts?.bulkAdd(backup.data.accounts || []),
        ].filter(Boolean)
      );
    } catch (error) {
      // 복원 실패 시 임시 백업에서 복구
      console.error("복원 실패, 이전 상태로 복구 중:", error);
      await restoreFromTempBackup(tempBackup);
      throw new Error("백업 복원 실패. 이전 상태로 복구되었습니다.");
    }
  } catch (error) {
    console.error("백업 복원 중 오류:", error);
    throw error;
  }
};

const restoreFromTempBackup = async (tempBackup: BackupData) => {
  try {
    await db.delete();
    await db.open();

    await Promise.all(
      [
        db.portfolios?.bulkAdd(tempBackup.data.portfolios || []),
        db.positions?.bulkAdd(tempBackup.data.positions || []),
        db.todos?.bulkAdd(tempBackup.data.todos || []),
        db.memos?.bulkAdd(tempBackup.data.memos || []),
        db.accounts?.bulkAdd(tempBackup.data.accounts || []),
      ].filter(Boolean)
    );
  } catch (error) {
    console.error("임시 백업 복구 중 오류:", error);
    throw new Error("임시 백업 복구 실패");
  }
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
    const [portfolios, positions, todos, memos, accounts] = await Promise.all([
      db.portfolios?.toArray() || [],
      db.positions?.toArray() || [],
      db.todos?.toArray() || [],
      db.memos?.toArray() || [],
      db.accounts?.toArray() || [],
    ]);

    const backupData: BackupData = {
      timestamp: Date.now(),
      name: `export_${new Date().toISOString()}`,
      data: {
        portfolios,
        positions,
        todos,
        memos,
        accounts,
      },
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
    if (!backupData.data) {
      throw new Error("유효하지 않은 백업 파일입니다.");
    }

    // 기존 데이터 삭제
    await Promise.all(
      [
        db.portfolios?.clear(),
        db.positions?.clear(),
        db.todos?.clear(),
        db.memos?.clear(),
        db.accounts?.clear(),
      ].filter(Boolean)
    );

    // 백업 데이터 복원
    await Promise.all(
      [
        db.portfolios?.bulkAdd(backupData.data.portfolios || []),
        db.positions?.bulkAdd(backupData.data.positions || []),
        db.todos?.bulkAdd(backupData.data.todos || []),
        db.memos?.bulkAdd(backupData.data.memos || []),
        db.accounts?.bulkAdd(backupData.data.accounts || []),
      ].filter(Boolean)
    );
  } catch (error) {
    console.error("Error importing backup:", error);
    throw new Error("백업 복원 중 오류가 발생했습니다.");
  }
};
