import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { NewPortfolio, NewPosition, Portfolio } from '../types';
import { addPortfolio, addPosition, getDB } from '../utils/db';

// 테스트 데이터
const TEST_PORTFOLIO: NewPortfolio = {
  name: '테스트 포트폴리오',
};

const createTestPosition = (portfolioId: number): NewPosition => ({
  portfolioId,
  ticker: 'AAPL',
  quantity: 10,
  avgPrice: 150.0,
  currentPrice: 170.0,
  currency: 'USD',
  fee: 0.5,
  tradeDate: '2024-03-20',
  strategy: '장기 투자',
});

describe('Portfolio Management Scenarios', () => {
  beforeEach(async () => {
    // IndexedDB 초기화
    const db = await getDB();
    await db.clear('portfolios');
    await db.clear('positions');
  });

  test('포트폴리오 생성 및 조회', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // 새 포트폴리오 버튼 클릭
    const newPortfolioButton = screen.getByText(/새 포트폴리오/i);
    fireEvent.click(newPortfolioButton);

    // 포트폴리오 이름 입력
    const nameInput = screen.getByLabelText(/포트폴리오 이름/i);
    await userEvent.type(nameInput, TEST_PORTFOLIO.name);

    // 생성 버튼 클릭
    const submitButton = screen.getByText('생성');
    fireEvent.click(submitButton);

    // 포트폴리오가 목록에 표시되는지 확인
    await waitFor(() => {
      expect(screen.getByText(TEST_PORTFOLIO.name)).toBeInTheDocument();
    });
  });

  test('포트폴리오 삭제', async () => {
    // 테스트용 포트폴리오 생성
    const testPortfolio = await addPortfolio(TEST_PORTFOLIO);

    // 확인 다이얼로그 모킹
    window.confirm = jest.fn(() => true);

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // 삭제 버튼 클릭
    await waitFor(() => {
      const deleteButton = screen.getByTestId(`delete-portfolio-${testPortfolio.id}`);
      fireEvent.click(deleteButton);
    });

    // 포트폴리오가 삭제되었는지 확인
    await waitFor(() => {
      expect(screen.queryByText(testPortfolio.name)).not.toBeInTheDocument();
    });
  });
});

describe('Position Management Scenarios', () => {
  let testPortfolio: Portfolio;

  beforeEach(async () => {
    const db = await getDB();
    await db.clear('portfolios');
    await db.clear('positions');
    
    // 테스트용 포트폴리오 생성
    testPortfolio = await addPortfolio(TEST_PORTFOLIO);
  });

  test('새 포지션 추가', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // 포트폴리오 클릭
    const portfolioLink = await screen.findByText(TEST_PORTFOLIO.name);
    fireEvent.click(portfolioLink);

    // 새 포지션 버튼 클릭
    await waitFor(() => {
      const newPositionButton = screen.getByRole('button', { name: /포지션 추가/i });
      fireEvent.click(newPositionButton);
    });

    // 포지션 정보 입력
    const tickerInput = screen.getByLabelText(/종목 코드/i);
    const quantityInput = screen.getByLabelText(/수량/i);
    const avgPriceInput = screen.getByLabelText(/평균단가/i);
    const currentPriceInput = screen.getByLabelText(/현재가/i);

    const testPosition = createTestPosition(testPortfolio.id);

    await userEvent.type(tickerInput, testPosition.ticker);
    await userEvent.type(quantityInput, testPosition.quantity.toString());
    await userEvent.type(avgPriceInput, testPosition.avgPrice.toString());
    await userEvent.type(currentPriceInput, testPosition.currentPrice.toString());

    // 추가 버튼 클릭
    const submitButton = screen.getByRole('button', { name: '추가' });
    fireEvent.click(submitButton);

    // 포지션이 목록에 표시되는지 확인
    await waitFor(() => {
      expect(screen.getByText(testPosition.ticker)).toBeInTheDocument();
    });
  });

  test('포지션 수정', async () => {
    // 테스트용 포지션 생성
    const testPosition = await addPosition(createTestPosition(testPortfolio.id));

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // 포트폴리오 클릭
    const portfolioLink = await screen.findByText(TEST_PORTFOLIO.name);
    fireEvent.click(portfolioLink);

    // 수정 버튼 클릭
    await waitFor(() => {
      const editButton = screen.getByTestId(`edit-position-${testPosition.id}`);
      fireEvent.click(editButton);
    });

    // 수량 수정
    const quantityInput = screen.getByLabelText(/수량/i);
    await userEvent.clear(quantityInput);
    await userEvent.type(quantityInput, '20');

    // 현재가 수정
    const currentPriceInput = screen.getByLabelText(/현재가/i);
    await userEvent.clear(currentPriceInput);
    await userEvent.type(currentPriceInput, '180');

    // 저장 버튼 클릭
    const saveButton = screen.getByRole('button', { name: '저장' });
    fireEvent.click(saveButton);

    // 수정된 정보가 표시되는지 확인
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      const cells = rows[1].querySelectorAll('td');
      expect(cells[1].textContent).toBe('20');
      expect(cells[3].textContent).toContain('180');
    });
  });

  test('포지션 삭제', async () => {
    // 테스트용 포지션 생성
    const testPosition = await addPosition(createTestPosition(testPortfolio.id));

    // 확인 다이얼로그 모킹
    window.confirm = jest.fn(() => true);

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // 포트폴리오 클릭
    const portfolioLink = await screen.findByText(TEST_PORTFOLIO.name);
    fireEvent.click(portfolioLink);

    // 삭제 버튼 클릭
    await waitFor(() => {
      const deleteButton = screen.getByTestId(`delete-position-${testPosition.id}`);
      fireEvent.click(deleteButton);
    });

    // 포지션이 삭제되었는지 확인
    await waitFor(() => {
      expect(screen.queryByText(testPosition.ticker)).not.toBeInTheDocument();
    });
  });
});

describe('Investment Performance Scenarios', () => {
  let testPortfolio: Portfolio;

  beforeEach(async () => {
    const db = await getDB();
    await db.clear('portfolios');
    await db.clear('positions');
    
    // 테스트용 데이터 설정
    testPortfolio = await addPortfolio(TEST_PORTFOLIO);
    await addPosition(createTestPosition(testPortfolio.id));
  });

  test('포트폴리오 수익률 확인', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // 포트폴리오 클릭
    const portfolioLink = await screen.findByText(TEST_PORTFOLIO.name);
    fireEvent.click(portfolioLink);

    // 수익률 정보가 표시되는지 확인
    await waitFor(() => {
      const profitPercentage = screen.getAllByText('13.33%')[0];
      expect(profitPercentage).toBeInTheDocument();
    });
  });
}); 