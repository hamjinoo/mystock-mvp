import React from 'react';

export const Settings: React.FC = () => {
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">설정</h1>

      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">테마</h2>
        <p className="text-gray-400 mb-4">
          MyStockMVP는 다크 모드 전용 앱입니다.
          사용자의 눈의 피로를 줄이고 집중력을 높이기 위해 다크 모드만 지원합니다.
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">앱 정보</h2>
        <div className="space-y-2 text-gray-400">
          <p>버전: 1.0.0</p>
          <p>개발자: MyStockMVP Team</p>
          <p>
            이 앱은 개인 투자자를 위한 포트폴리오 관리 도구입니다.
            모든 데이터는 사용자의 브라우저에 안전하게 저장됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}; 