import React from 'react';

export const Settings: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">설정</h1>
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">앱 정보</h2>
        <div className="space-y-2">
          <p className="text-gray-400">
            버전: 0.5.0
          </p>
          <p className="text-gray-400">
            마지막 업데이트: 2024-03-XX
          </p>
        </div>
      </div>
    </div>
  );
}; 