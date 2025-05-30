import React from 'react';

export const Home: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">마이스톡 MVP</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">포트폴리오</h2>
          <p className="text-gray-400">
            포트폴리오를 관리하고 투자 전략을 수립하세요.
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">계좌</h2>
          <p className="text-gray-400">
            증권사 계좌를 등록하고 자산을 관리하세요.
          </p>
        </div>
      </div>
    </div>
  );
}; 