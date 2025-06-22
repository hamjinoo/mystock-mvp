import {
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  HomeIcon,
  PresentationChartLineIcon,
} from "@heroicons/react/24/outline";
import React, { Suspense, lazy, useEffect } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { checkAndCreateAutoBackup } from "./utils/backup";

// Lazy-loaded components
const MainPage = lazy(() =>
  import("./pages/MainPage").then((module) => ({ default: module.MainPage }))
);
const PortfolioList = lazy(() =>
  import("./pages/PortfolioList").then((module) => ({
    default: module.PortfolioList,
  }))
);
const NewPortfolioPage = lazy(() =>
  import("./pages/NewPortfolio").then((module) => ({
    default: module.NewPortfolioPage,
  }))
);
const PortfolioDetail = lazy(() =>
  import("./pages/PortfolioDetail").then((module) => ({
    default: module.PortfolioDetail,
  }))
);
const PortfolioConfigPage = lazy(() =>
  import("./pages/PortfolioConfigPage").then((module) => ({
    default: module.PortfolioConfigPage,
  }))
);
const AccountList = lazy(() =>
  import("./pages/AccountList").then((module) => ({
    default: module.AccountList,
  }))
);
const NewAccount = lazy(() =>
  import("./pages/NewAccount").then((module) => ({
    default: module.NewAccount,
  }))
);
const AccountDetailPage = lazy(() =>
  import("./pages/AccountDetail").then((module) => ({
    default: module.AccountDetailPage,
  }))
);
const EditAccountPage = lazy(() =>
  import("./pages/EditAccount").then((module) => ({
    default: module.EditAccountPage,
  }))
);
const NewPositionPage = lazy(() =>
  import("./pages/NewPosition").then((module) => ({
    default: module.NewPositionPage,
  }))
);
const EditPositionPage = lazy(() =>
  import("./pages/EditPosition").then((module) => ({
    default: module.EditPosition,
  }))
);
const ConsolidatedView = lazy(() =>
  import("./pages/ConsolidatedView").then((module) => ({
    default: module.ConsolidatedView,
  }))
);
const MemoListPage = lazy(() =>
  import("./pages/MemoListPage").then((module) => ({
    default: module.MemoListPage,
  }))
);
const MemoDetailPage = lazy(() =>
  import("./pages/MemoDetailPage").then((module) => ({
    default: module.MemoDetailPage,
  }))
);
const SettingsPage = lazy(() =>
  import("./pages/SettingsPage").then((module) => ({
    default: module.SettingsPage,
  }))
);
const TodoPage = lazy(() =>
  import("./pages/TodoPage").then((module) => ({ default: module.TodoPage }))
);

export const App: React.FC = () => {
  useEffect(() => {
    // 앱 시작 시 자동 백업 체크
    checkAndCreateAutoBackup();

    // 주기적으로 자동 백업 체크 (1시간마다)
    const interval = setInterval(() => {
      checkAndCreateAutoBackup();
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <main className="flex-1 pb-16">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/portfolios" element={<PortfolioList />} />
            <Route path="/portfolios/new" element={<NewPortfolioPage />} />
            <Route
              path="/portfolios/:portfolioId"
              element={<PortfolioDetail />}
            />
            <Route
              path="/portfolios/:portfolioId/config"
              element={<PortfolioConfigPage />}
            />
            <Route path="/accounts" element={<AccountList />} />
            <Route path="/accounts/new" element={<NewAccount />} />
            <Route
              path="/accounts/:accountId"
              element={<AccountDetailPage />}
            />
            <Route
              path="/accounts/:accountId/edit"
              element={<EditAccountPage />}
            />
            <Route
              path="/accounts/:accountId/positions/new"
              element={<NewPositionPage />}
            />
            <Route
              path="/accounts/:accountId/positions/:positionId/edit"
              element={<EditPositionPage />}
            />
            <Route path="/consolidated" element={<ConsolidatedView />} />
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
                to="/portfolios"
                className="flex flex-col items-center p-2 text-gray-400 hover:text-white"
              >
                <ChartBarIcon className="h-6 w-6" />
                <span className="text-xs mt-1">포트폴리오</span>
              </Link>
              <Link
                to="/consolidated"
                className="flex flex-col items-center p-2 text-gray-400 hover:text-white"
              >
                <PresentationChartLineIcon className="h-6 w-6" />
                <span className="text-xs mt-1">전체보기</span>
              </Link>
              <Link
                to="/memos"
                className="flex flex-col items-center p-2 text-gray-400 hover:text-white"
              >
                <DocumentTextIcon className="h-6 w-6" />
                <span className="text-xs mt-1">메모</span>
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
