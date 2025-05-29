import { ArrowLeftIcon } from '@heroicons/react/24/outline';
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
    <div className="max-w-lg mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/')}
          className="text-sm text-gray-400 hover:text-white flex items-center"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          뒤로
        </button>
        <h1 className="text-lg font-bold">설정</h1>
        <div className="w-10" />
      </div>

      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-base font-bold mb-4">데이터 백업</h2>
          <div className="space-y-4">
            <div>
              <button
                onClick={handleExport}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700"
              >
                백업 파일 다운로드
              </button>
              <p className="text-xs text-gray-400 mt-1">
                현재 데이터를 JSON 파일로 내보냅니다.
              </p>
            </div>

            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept=".json"
                className="hidden"
                id="backup-file"
              />
              <label
                htmlFor="backup-file"
                className="block w-full bg-gray-700 text-white py-2 px-4 rounded text-sm text-center cursor-pointer hover:bg-gray-600"
              >
                백업 파일 불러오기
              </label>
              <p className="text-xs text-gray-400 mt-1">
                백업 파일에서 데이터를 복원합니다.
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-500/10 p-3 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="text-sm text-green-500 bg-green-500/10 p-3 rounded">
                {success}
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-base font-bold mb-4">앱 정보</h2>
          <div className="text-sm text-gray-400">
            <p>MyStock MVP</p>
            <p>Version 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 