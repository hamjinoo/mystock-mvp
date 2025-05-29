import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders portfolio page', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const newPortfolioButton = screen.getByText(/새 포트폴리오/i);
  expect(newPortfolioButton).toBeInTheDocument();
});
