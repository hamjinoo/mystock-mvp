import { ChartBarIcon, Cog6ToothIcon, DocumentTextIcon, HomeIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { MainPage } from './pages/MainPage';
import { MemoPage } from './pages/MemoPage';
import { PortfolioConfigPage } from './pages/PortfolioConfigPage';
import { PortfolioDetail } from './pages/PortfolioDetail';
import { PortfolioList } from './pages/PortfolioList';
import { SettingsPage } from './pages/SettingsPage';
import { TodoPage } from './pages/TodoPage';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <main className="flex-1 pb-16">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/portfolio" element={<PortfolioList />} />
          <Route path="/portfolio/:id" element={<PortfolioDetail />} />
          <Route path="/portfolio/:id/config" element={<PortfolioConfigPage />} />
          <Route path="/memo" element={<MemoPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/todo" element={<TodoPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* 하단 네비게이션 바 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
        <div className="max-w-md mx-auto px-4">
          <div className="flex justify-around py-2">
            <Link
              to="/"
              className="flex flex-col items-center p-2 text-gray-400 hover:text-white"
            >
              <HomeIcon className="h-6 w-6" />
              <span className="text-xs mt-1">홈</span>
            </Link>
            <Link
              to="/portfolio"
              className="flex flex-col items-center p-2 text-gray-400 hover:text-white"
            >
              <ChartBarIcon className="h-6 w-6" />
              <span className="text-xs mt-1">포트폴리오</span>
            </Link>
            <Link
              to="/memo"
              className="flex flex-col items-center p-2 text-gray-400 hover:text-white"
            >
              <DocumentTextIcon className="h-6 w-6" />
              <span className="text-xs mt-1">메모장</span>
            </Link>
            <Link
              to="/settings"
              className="flex flex-col items-center p-2 text-gray-400 hover:text-white"
            >
              <Cog6ToothIcon className="h-6 w-6" />
              <span className="text-xs mt-1">설정</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default App;
