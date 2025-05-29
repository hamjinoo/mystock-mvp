import { ChartBarIcon, Cog6ToothIcon, DocumentTextIcon, HomeIcon } from '@heroicons/react/24/outline';
import React, { Suspense } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { MainPage } from './pages/MainPage';
import { MemoDetailPage } from './pages/MemoDetailPage';
import { MemoListPage } from './pages/MemoListPage';
import { NewPortfolioPage } from './pages/NewPortfolio';
import { NewPortfolioGroupPage } from './pages/NewPortfolioGroup';
import { NewPositionPage } from './pages/NewPosition';
import { PortfolioConfigPage } from './pages/PortfolioConfigPage';
import { PortfolioDetail } from './pages/PortfolioDetail';
import { PortfolioList } from './pages/PortfolioList';
import { SettingsPage } from './pages/SettingsPage';
import { TodoPage } from './pages/TodoPage';

export const App: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <main className="flex-1 pb-16">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/portfolio-groups" element={<PortfolioList />} />
            <Route path="/portfolio-groups/new" element={<NewPortfolioGroupPage />} />
            <Route path="/portfolio-groups/:groupId/portfolios/new" element={<NewPortfolioPage />} />
            <Route path="/portfolios/:id" element={<PortfolioDetail />} />
            <Route path="/portfolios/:id/config" element={<PortfolioConfigPage />} />
            <Route path="/portfolios/:id/positions/new" element={<NewPositionPage />} />
            <Route path="/memos" element={<MemoListPage />} />
            <Route path="/memos/:id" element={<MemoDetailPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/todo" element={<TodoPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

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
                to="/portfolio-groups"
                className="flex flex-col items-center p-2 text-gray-400 hover:text-white"
              >
                <ChartBarIcon className="h-6 w-6" />
                <span className="text-xs mt-1">포트폴리오</span>
              </Link>
              <Link
                to="/memos"
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
    </Suspense>
  );
};

export default App;
