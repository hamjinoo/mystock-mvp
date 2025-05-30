import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportBackup, importBackup } from '../utils/backup';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      setError(null);
      setSuccess(null);
      const url = await exportBackup();
      
      // 다운로드 링크 생성
      const link = document.createElement('a');
      link.href = url;
      link.download = `mystock-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess('백업 파일이 다운로드되었습니다.');
    } catch (error) {
      setError(error instanceof Error ? error.message : '백업 생성 중 오류가 발생했습니다.');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null);
      setSuccess(null);
      
      const file = event.target.files?.[0];
      if (!file) return;

      await importBackup(file);
      setSuccess('백업이 성공적으로 복원되었습니다.');
      
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '백업 복원 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">설정</h1>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">데이터 백업</h2>
          <div className="space-y-4">
            <div>
              <button
                onClick={handleExport}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                데이터 내보내기
              </button>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                데이터 가져오기
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-900/50 text-red-400 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 p-4 bg-green-900/50 text-green-400 rounded">
              {success}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 