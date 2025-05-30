import React from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
}

export const Layout: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <main className="flex-1 pb-16">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
        <div className="max-w-md mx-auto px-4">
          <div className="flex justify-around py-2">
            <Link
              to="/"
              className="flex flex-col items-center p-2 text-gray-400 hover:text-white"
            >
              <span className="text-xs mt-1">홈</span>
            </Link>
            <Link
              to="/portfolios"
              className="flex flex-col items-center p-2 text-gray-400 hover:text-white"
            >
              <span className="text-xs mt-1">포트폴리오</span>
            </Link>
            <Link
              to="/accounts"
              className="flex flex-col items-center p-2 text-gray-400 hover:text-white"
            >
              <span className="text-xs mt-1">계좌</span>
            </Link>
            <Link
              to="/settings"
              className="flex flex-col items-center p-2 text-gray-400 hover:text-white"
            >
              <span className="text-xs mt-1">설정</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}; 