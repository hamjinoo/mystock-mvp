import React, { useEffect, useState } from "react";
import {
  createBackup,
  deleteBackup,
  getBackupList,
  restoreBackup,
} from "../utils/backup";
import { db } from "../services/db";
import { syncService } from "../services/syncService";

export const SettingsPage: React.FC = () => {
  const [backupName, setBackupName] = useState("");
  const [backupList, setBackupList] = useState<
    Array<{ timestamp: number; name: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 동기화 관련 상태
  const [githubToken, setGithubToken] = useState("");
  const [syncStatus, setSyncStatus] = useState<{
    isConfigured: boolean;
    lastSync?: string;
    autoSyncEnabled: boolean;
  }>({ isConfigured: false, autoSyncEnabled: false });
  const [syncInterval, setSyncInterval] = useState(30);

  useEffect(() => {
    loadBackupList();
    loadSyncStatus();

    // 동기화 완료 이벤트 리스너 추가
    const handleSyncComplete = () => {
      loadSyncStatus();
    };

    window.addEventListener("syncComplete", handleSyncComplete);

    return () => {
      window.removeEventListener("syncComplete", handleSyncComplete);
    };
  }, []);

  const loadSyncStatus = async () => {
    try {
      const status = await syncService.checkSyncStatus();
      setSyncStatus(status);

      const config = syncService.getConfig();
      setSyncInterval(config.syncInterval);
    } catch (error) {
      console.error("동기화 상태 로딩 실패:", error);
    }
  };

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
      setSuccess("백업이 복원되었습니다.");
      // 새로고침 대신 상태 업데이트 이벤트 발생
      window.dispatchEvent(new CustomEvent("syncComplete"));
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

  // 동기화 관련 함수들
  const handleSetupSync = async () => {
    if (!githubToken.trim()) {
      setError("GitHub 토큰을 입력해주세요.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      await syncService.setupGitHubSync(githubToken.trim());
      await loadSyncStatus();
      setGithubToken("");
      setSuccess("동기화가 설정되었습니다.");
    } catch (err) {
      console.error("동기화 설정 실패:", err);
      setError("동기화 설정 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSync = async (type: "upload" | "download") => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      if (type === "upload") {
        await syncService.uploadData();
        setSuccess("데이터가 클라우드에 업로드되었습니다.");
      } else {
        await syncService.downloadData();
        setSuccess("클라우드에서 데이터를 다운로드했습니다.");
      }

      await loadSyncStatus();
    } catch (err) {
      console.error("수동 동기화 실패:", err);
      setError(
        `${type === "upload" ? "업로드" : "다운로드"} 중 오류가 발생했습니다.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAutoSync = () => {
    const newConfig = {
      autoSync: !syncStatus.autoSyncEnabled,
      syncInterval: syncInterval,
    };

    syncService.updateConfig(newConfig);
    setSyncStatus((prev) => ({ ...prev, autoSyncEnabled: newConfig.autoSync }));
    setSuccess(
      `자동 동기화가 ${newConfig.autoSync ? "활성화" : "비활성화"}되었습니다.`
    );
  };

  const handleUpdateSyncInterval = () => {
    syncService.updateConfig({ syncInterval });
    setSuccess(`동기화 간격이 ${syncInterval}분으로 설정되었습니다.`);
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

      {/* 클라우드 동기화 섹션 */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">클라우드 동기화</h2>
        <p className="text-gray-400 mb-6">
          PC와 모바일 간 데이터 동기화를 위해 GitHub Gist를 사용합니다.
        </p>

        {!syncStatus.isConfigured ? (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">동기화 설정</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  GitHub Personal Access Token
                </label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  GitHub Settings → Developer settings → Personal access
                  tokens에서 생성 (gist 권한 필요)
                </p>
              </div>
              <button
                onClick={handleSetupSync}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? "설정 중..." : "동기화 설정"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 동기화 상태 */}
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="text-lg font-medium mb-2">동기화 상태</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>설정 상태:</span>
                  <span className="text-green-400">✅ 설정됨</span>
                </div>
                <div className="flex justify-between">
                  <span>자동 동기화:</span>
                  <span
                    className={
                      syncStatus.autoSyncEnabled
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {syncStatus.autoSyncEnabled ? "✅ 활성화" : "❌ 비활성화"}
                  </span>
                </div>
                {syncStatus.lastSync && (
                  <div className="flex justify-between">
                    <span>마지막 동기화:</span>
                    <span className="text-gray-300">
                      {new Date(syncStatus.lastSync).toLocaleString("ko-KR")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 수동 동기화 */}
            <div>
              <h3 className="text-lg font-medium mb-4">수동 동기화</h3>
              <div className="flex gap-4">
                <button
                  onClick={() => handleManualSync("upload")}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {isLoading ? "처리 중..." : "클라우드에 업로드"}
                </button>
                <button
                  onClick={() => handleManualSync("download")}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? "처리 중..." : "클라우드에서 다운로드"}
                </button>
              </div>
            </div>

            {/* 자동 동기화 설정 */}
            <div>
              <h3 className="text-lg font-medium mb-4">자동 동기화 설정</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleToggleAutoSync}
                    className={`px-4 py-2 rounded ${
                      syncStatus.autoSyncEnabled
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    } text-white`}
                  >
                    {syncStatus.autoSyncEnabled
                      ? "자동 동기화 끄기"
                      : "자동 동기화 켜기"}
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">동기화 간격:</label>
                  <input
                    type="number"
                    value={syncInterval}
                    onChange={(e) => setSyncInterval(Number(e.target.value))}
                    min="5"
                    max="1440"
                    className="w-20 px-2 py-1 bg-gray-700 rounded text-center"
                  />
                  <span className="text-sm text-gray-400">분</span>
                  <button
                    onClick={handleUpdateSyncInterval}
                    className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    적용
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
