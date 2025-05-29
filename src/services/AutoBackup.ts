import { db } from './db';

class AutoBackupService {
  private backupInterval: number = 5 * 60 * 1000; // 5분
  private timer: NodeJS.Timeout | null = null;

  start() {
    if (this.timer) return;
    
    this.timer = setInterval(async () => {
      try {
        const data = await db.exportData();
        await this.uploadToServer(data);
      } catch (error) {
        console.warn('자동 백업 실패:', error);
      }
    }, this.backupInterval);

    // 페이지 언로드 시 마지막 백업 시도
    window.addEventListener('beforeunload', this.handleBeforeUnload);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  }

  private handleBeforeUnload = async () => {
    try {
      const data = await db.exportData();
      await this.uploadToServer(data);
    } catch (error) {
      console.warn('최종 백업 실패:', error);
    }
  };

  private async uploadToServer(data: any) {
    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('백업 업로드 실패');
      }
    } catch (error) {
      console.error('서버 백업 실패:', error);
      throw error;
    }
  }
}

export const autoBackup = new AutoBackupService(); 