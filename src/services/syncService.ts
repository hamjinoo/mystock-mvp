import { db } from "./db";
import { exportAllData, importAllData } from "../utils/backup";

interface SyncConfig {
  githubToken?: string;
  gistId?: string;
  autoSync: boolean;
  syncInterval: number; // 분 단위
}

class SyncService {
  private config: SyncConfig;
  private syncTimer?: NodeJS.Timeout;

  constructor() {
    this.config = this.loadConfig();
    if (this.config.autoSync) {
      this.startAutoSync();
    }
  }

  private loadConfig(): SyncConfig {
    const saved = localStorage.getItem("mystock-sync-config");
    return saved
      ? JSON.parse(saved)
      : {
          autoSync: false,
          syncInterval: 30, // 30분마다
        };
  }

  private saveConfig() {
    localStorage.setItem("mystock-sync-config", JSON.stringify(this.config));
  }

  // GitHub Gist를 사용한 동기화
  async setupGitHubSync(token: string, gistId?: string) {
    this.config.githubToken = token;
    this.config.gistId = gistId;
    this.saveConfig();

    if (!gistId) {
      // 새 Gist 생성
      const newGistId = await this.createGist();
      this.config.gistId = newGistId;
      this.saveConfig();
    }

    return this.config.gistId;
  }

  private async createGist(): Promise<string> {
    const response = await fetch("https://api.github.com/gists", {
      method: "POST",
      headers: {
        Authorization: `token ${this.config.githubToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: "MyStock MVP Data Sync",
        public: false,
        files: {
          "mystock-data.json": {
            content: JSON.stringify({ version: 1, data: {} }),
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Gist 생성 실패");
    }

    const gist = await response.json();
    return gist.id;
  }

  // 클라우드에 데이터 업로드
  async uploadData(): Promise<void> {
    if (!this.config.githubToken || !this.config.gistId) {
      throw new Error("GitHub 동기화가 설정되지 않았습니다");
    }

    try {
      const data = await exportAllData();
      const syncData = {
        version: 1,
        timestamp: new Date().toISOString(),
        data: data,
      };

      const response = await fetch(
        `https://api.github.com/gists/${this.config.gistId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `token ${this.config.githubToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            files: {
              "mystock-data.json": {
                content: JSON.stringify(syncData, null, 2),
              },
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("데이터 업로드 실패");
      }

      console.log("✅ 클라우드 동기화 완료");
      localStorage.setItem("mystock-last-sync", syncData.timestamp);
    } catch (error) {
      console.error("❌ 업로드 실패:", error);
      throw error;
    }
  }

  // 클라우드에서 데이터 다운로드
  async downloadData(): Promise<void> {
    if (!this.config.githubToken || !this.config.gistId) {
      throw new Error("GitHub 동기화가 설정되지 않았습니다");
    }

    try {
      const response = await fetch(
        `https://api.github.com/gists/${this.config.gistId}`,
        {
          headers: {
            Authorization: `token ${this.config.githubToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("데이터 다운로드 실패");
      }

      const gist = await response.json();
      const fileContent = gist.files["mystock-data.json"]?.content;

      if (!fileContent) {
        throw new Error("동기화 파일을 찾을 수 없습니다");
      }

      const syncData = JSON.parse(fileContent);

      // 로컬 데이터와 타임스탬프 비교
      const localTimestamp = localStorage.getItem("mystock-last-sync");
      if (
        localTimestamp &&
        new Date(syncData.timestamp) <= new Date(localTimestamp)
      ) {
        console.log("🔄 로컬 데이터가 더 최신입니다");
        return;
      }

      // 데이터 복원
      await importAllData(syncData.data);
      localStorage.setItem("mystock-last-sync", syncData.timestamp);

      console.log("✅ 클라우드에서 데이터 동기화 완료");

      // 페이지 새로고침 없이 상태 업데이트를 위한 이벤트 발생
      window.dispatchEvent(new CustomEvent("syncComplete"));
    } catch (error) {
      console.error("❌ 다운로드 실패:", error);
      throw error;
    }
  }

  // 자동 동기화 시작
  startAutoSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.config.autoSync = true;
    this.saveConfig();

    this.syncTimer = setInterval(async () => {
      try {
        await this.uploadData();
      } catch (error) {
        console.error("자동 동기화 실패:", error);
      }
    }, this.config.syncInterval * 60 * 1000);

    console.log(`🔄 자동 동기화 시작 (${this.config.syncInterval}분 간격)`);
  }

  // 자동 동기화 중지
  stopAutoSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
    }

    this.config.autoSync = false;
    this.saveConfig();

    console.log("⏹️ 자동 동기화 중지");
  }

  // 동기화 설정 업데이트
  updateConfig(newConfig: Partial<SyncConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();

    if (this.config.autoSync) {
      this.startAutoSync();
    } else {
      this.stopAutoSync();
    }
  }

  getConfig(): SyncConfig {
    return { ...this.config };
  }

  // 동기화 상태 확인
  async checkSyncStatus(): Promise<{
    isConfigured: boolean;
    lastSync?: string;
    autoSyncEnabled: boolean;
  }> {
    const lastSync = localStorage.getItem("mystock-last-sync");

    return {
      isConfigured: !!(this.config.githubToken && this.config.gistId),
      lastSync: lastSync || undefined,
      autoSyncEnabled: this.config.autoSync,
    };
  }
}

export const syncService = new SyncService();
export default syncService;
