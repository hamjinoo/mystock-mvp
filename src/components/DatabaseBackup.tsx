import React from 'react';
import { db } from '../services/db';

export const DatabaseBackup: React.FC = () => {
  const handleExport = async () => {
    try {
      const data = await db.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mystock-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('백업 중 오류 발생:', error);
      alert('백업 중 오류가 발생했습니다.');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const importData = JSON.parse(content);
          await db.importData(importData);
          alert('데이터 복원이 완료되었습니다. 페이지를 새로고침합니다.');
          window.location.reload();
        } catch (error) {
          console.error('데이터 복원 중 오류 발생:', error);
          alert('데이터 복원 중 오류가 발생했습니다.');
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('파일 읽기 중 오류 발생:', error);
      alert('파일 읽기 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="flex gap-4 items-center">
      <button
        onClick={handleExport}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        데이터 백업
      </button>
      
      <label className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors cursor-pointer">
        데이터 복원
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </label>
    </div>
  );
}; 