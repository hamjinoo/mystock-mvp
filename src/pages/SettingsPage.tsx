import React, { useEffect, useState } from "react";
import {
  createBackup,
  deleteBackup,
  getBackupList,
  restoreBackup,
} from "../utils/backup";
import { db } from "../services/db";

export const SettingsPage: React.FC = () => {
  const [backupName, setBackupName] = useState("");
  const [backupList, setBackupList] = useState<
    Array<{ timestamp: number; name: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadBackupList();
  }, []);

  const loadBackupList = () => {
    const list = getBackupList();
    setBackupList(list);
  };

  const handleCreateBackup = async () => {
    if (!backupName.trim()) {
      setError("백업 이름을 입력해주세요.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // DB가 준비되었는지 확인
      if (!db.isOpen()) {
        await db.open();
      }

      await createBackup(backupName.trim());
      setBackupName("");
      loadBackupList();
      setSuccess("백업이 생성되었습니다.");
    } catch (err) {
      console.error("백업 생성 중 오류:", err);
      setError("백업 생성 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreBackup = async (timestamp: number) => {
    if (
      !window.confirm(
        "정말로 이 백업을 복원하시겠습니까? 현재 데이터는 모두 삭제됩니다."
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // DB가 준비되었는지 확인
      if (!db.isOpen()) {
        await db.open();
      }

      await restoreBackup(timestamp);
      setSuccess("백업이 복원되었습니다. 페이지를 새로고침합니다.");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error("백업 복원 중 오류:", err);
      setError("백업 복원 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBackup = async (timestamp: number) => {
    if (!window.confirm("이 백업을 삭제하시겠습니까?")) {
      return;
    }

    try {
      deleteBackup(timestamp);
      loadBackupList();
      setSuccess("백업이 삭제되었습니다.");
    } catch (err) {
      console.error("백업 삭제 중 오류:", err);
      setError("백업 삭제 중 오류가 발생했습니다.");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">설정</h1>

      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">데이터베이스 백업</h2>

        <div className="mb-6">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={backupName}
              onChange={(e) => setBackupName(e.target.value)}
              placeholder="백업 이름 입력"
              className="flex-1 px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleCreateBackup}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? "처리 중..." : "백업 생성"}
            </button>
          </div>

          {error && <div className="text-red-500 mb-4">{error}</div>}
          {success && <div className="text-green-500 mb-4">{success}</div>}

          <div className="space-y-4">
            {backupList.map((backup) => (
              <div
                key={backup.timestamp}
                className="flex items-center justify-between bg-gray-700 p-4 rounded"
              >
                <div>
                  <div className="font-medium">{backup.name}</div>
                  <div className="text-sm text-gray-400">
                    {formatDate(backup.timestamp)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRestoreBackup(backup.timestamp)}
                    disabled={isLoading}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    복원
                  </button>
                  <button
                    onClick={() => handleDeleteBackup(backup.timestamp)}
                    disabled={isLoading}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}

            {backupList.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                저장된 백업이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
