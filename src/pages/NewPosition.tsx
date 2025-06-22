import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CurrencyInput } from "../components/CurrencyInput";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { AccountService } from "../services/accountService";
import { PortfolioService } from "../services/portfolioService";
import { Account, NewPosition, Portfolio } from "../types";

export const NewPositionPage: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account>();
  const [allPortfolios, setAllPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [avgPrice, setAvgPrice] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [portfolioId, setPortfolioId] = useState<number>();

  useEffect(() => {
    loadData();
  }, [accountId]);

  const loadData = async () => {
    if (!accountId) return;

    try {
      console.log("데이터 로딩 시작... accountId:", accountId);

      // 포트폴리오 데이터 수정
      await PortfolioService.fixPortfolioData();

      // 계좌 정보 로드
      const accountData = await AccountService.getById(Number(accountId));
      console.log("계좌 정보:", accountData);

      if (!accountData) {
        throw new Error("계좌를 찾을 수 없습니다.");
      }

      setAccount(accountData);

      // 모든 포트폴리오 로드 (계좌 제한 없음)
      const portfolios = await PortfolioService.getAll();
      console.log("전체 포트폴리오 목록:", portfolios);

      setAllPortfolios(portfolios);

      if (portfolios.length > 0) {
        // 현재 계좌의 포트폴리오가 있으면 우선 선택, 없으면 첫 번째 포트폴리오 선택
        const accountPortfolios = portfolios.filter(
          (p) => p.accountId === Number(accountId)
        );
        const defaultPortfolio =
          accountPortfolios.length > 0 ? accountPortfolios[0] : portfolios[0];
        console.log("기본 선택 포트폴리오:", defaultPortfolio);
        setPortfolioId(defaultPortfolio.id);
      }
    } catch (error) {
      console.error("데이터 로딩 중 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId || !portfolioId) return;

    try {
      const selectedPortfolio = allPortfolios.find((p) => p.id === portfolioId);
      if (!selectedPortfolio) {
        throw new Error("선택한 포트폴리오를 찾을 수 없습니다.");
      }

      const position: NewPosition = {
        portfolioId,
        symbol: symbol.trim().toUpperCase(),
        name: name.trim() || symbol.trim().toUpperCase(),
        quantity,
        avgPrice,
        currentPrice,
        tradeDate: Date.now(),
        strategyCategory: selectedPortfolio.config?.period || "UNCATEGORIZED",
        strategyTags: [],
      };

      await PortfolioService.createPosition(position);

      // 선택한 포트폴리오가 속한 계좌로 리다이렉트
      const targetAccountId = selectedPortfolio.accountId;
      navigate(`/accounts/${targetAccountId}`);
    } catch (error) {
      console.error("포지션 생성 중 오류:", error);
      alert("포지션 생성에 실패했습니다.");
    }
  };

  // 선택된 포트폴리오의 통화 가져오기
  const selectedPortfolio = allPortfolios.find((p) => p.id === portfolioId);
  const currency = selectedPortfolio?.currency || account?.currency || "KRW";

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="p-4">
        <div className="text-center">
          <p className="text-gray-400">계좌를 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate("/accounts")}
            className="mt-4 text-blue-500 hover:text-blue-400"
          >
            계좌 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (allPortfolios.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">새 종목</h1>
          <p className="text-gray-400 mb-4">포트폴리오가 없습니다.</p>
          <button
            onClick={() => navigate("/portfolios/new")}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            새 포트폴리오 만들기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">새 종목</h1>
        <div className="mb-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-400">
            💡 <strong>팁:</strong> 이제 모든 포트폴리오에서 선택할 수 있습니다.
            동일한 종목을 여러 포트폴리오에 나누어 관리하여 리밸런싱을 더 쉽게
            할 수 있습니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              포트폴리오 선택
            </label>
            <select
              value={portfolioId}
              onChange={(e) => setPortfolioId(Number(e.target.value))}
              className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {allPortfolios.map((portfolio) => (
                <option key={portfolio.id} value={portfolio.id}>
                  {portfolio.name} ({portfolio.config?.period || "미분류"}) -{" "}
                  {portfolio.currency}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              현재 계좌: {account.accountName} ({account.broker})
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">종목 코드</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: AAPL, 005930"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">종목명</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: Apple Inc., 삼성전자"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">수량</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="1"
                placeholder="예: 10"
                required
              />
            </div>

            <CurrencyInput
              label="평균단가"
              value={avgPrice}
              onChange={setAvgPrice}
              currency={currency}
              required
              type="price"
            />

            <CurrencyInput
              label="현재가"
              value={currentPrice}
              onChange={setCurrentPrice}
              currency={currency}
              required
              type="price"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                // 선택된 포트폴리오가 있으면 해당 계좌로, 없으면 원래 계좌로
                const selectedPortfolio = allPortfolios.find(
                  (p) => p.id === portfolioId
                );
                const targetAccountId = selectedPortfolio
                  ? selectedPortfolio.accountId
                  : accountId;
                navigate(`/accounts/${targetAccountId}`);
              }}
              className="px-6 py-2 text-gray-400 hover:text-gray-300"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={
                !portfolioId ||
                !symbol.trim() ||
                quantity <= 0 ||
                avgPrice <= 0 ||
                currentPrice <= 0
              }
            >
              생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPositionPage;
