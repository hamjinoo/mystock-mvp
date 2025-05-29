import { z } from 'zod';

// Portfolio 스키마 및 타입 정의
export const NewPortfolioSchema = z.object({
  name: z.string().min(1, '포트폴리오 이름은 필수입니다'),
});

export const PortfolioSchema = z.object({
  id: z.number(),
  name: z.string().min(1, '포트폴리오 이름은 필수입니다'),
});

export type Portfolio = z.infer<typeof PortfolioSchema>;
export type NewPortfolio = z.infer<typeof NewPortfolioSchema>;

// Position 스키마 및 타입 정의
export const NewPositionSchema = z.object({
  portfolioId: z.number(),
  symbol: z.string().min(1, '종목 코드는 필수입니다'),
  quantity: z.number().min(0, '수량은 0보다 커야 합니다'),
  avgPrice: z.number().min(0, '평균 매수가는 0보다 커야 합니다'),
  currentPrice: z.number().min(0, '현재가는 0보다 커야 합니다'),
  strategy: z.string().optional(),
  tradeDate: z.number(), // timestamp
});

export const PositionSchema = z.object({
  id: z.number(),
  portfolioId: z.number(),
  symbol: z.string().min(1, '종목 코드는 필수입니다'),
  quantity: z.number().min(0, '수량은 0보다 커야 합니다'),
  avgPrice: z.number().min(0, '평균 매수가는 0보다 커야 합니다'),
  currentPrice: z.number().min(0, '현재가는 0보다 커야 합니다'),
  strategy: z.string().optional(),
  tradeDate: z.number(), // timestamp
});

export type Position = z.infer<typeof PositionSchema>;
export type NewPosition = z.infer<typeof NewPositionSchema>;

// Todo 스키마 및 타입 정의
export const NewTodoSchema = z.object({
  portfolioId: z.number(),
  content: z.string().min(1, '할 일 내용은 필수입니다'),
  done: z.boolean().default(false),
  createdAt: z.number(), // timestamp
});

export const TodoSchema = z.object({
  id: z.number(),
  portfolioId: z.number(),
  content: z.string().min(1, '할 일 내용은 필수입니다'),
  done: z.boolean().default(false),
  createdAt: z.number(), // timestamp
});

export type Todo = z.infer<typeof TodoSchema>;
export type NewTodo = z.infer<typeof NewTodoSchema>; 