# System Architecture

## Technical Stack

```
Frontend:
- React + TypeScript
- TailwindCSS
- Dexie.js (IndexedDB wrapper)

State Management:
- React Hooks + Context
- Local state for UI
- IndexedDB for persistence

Build Tools:
- Vite
- PostCSS
- TypeScript compiler
```

## Data Layer

### 1. Database Schema
```typescript
tables: {
  portfolioGroups: '++id',
  portfolios: '++id, groupId',
  positions: '++id, portfolioId',
  todos: '++id, portfolioGroupId'
}
```

### 2. Service Layer
```typescript
interface IPortfolioService {
  getAll(): Promise<Portfolio[]>;
  getById(id: number): Promise<Portfolio>;
  create(data: NewPortfolio): Promise<number>;
  update(id: number, data: Portfolio): Promise<void>;
  delete(id: number): Promise<void>;
}

interface IPositionService {
  getByPortfolioId(portfolioId: number): Promise<Position[]>;
  create(data: NewPosition): Promise<number>;
  update(id: number, data: Position): Promise<void>;
  delete(id: number): Promise<void>;
  calculateMetrics(position: Position): PositionMetrics;
}
```

### 3. Data Flow
```
UI Action -> Hook -> Service -> Database
                 -> State Update -> UI Update
```

## Component Architecture

### 1. Layout Structure
```
App
├── Navigation
├── PortfolioGroups
│   ├── PortfolioList
│   └── PortfolioDetails
│       ├── PositionList
│       └── TodoList
└── Settings
```

### 2. Component Responsibilities
```typescript
// Smart Components (Container)
interface IPortfolioContainer {
  loadData(): void;
  handleCreate(): void;
  handleUpdate(): void;
  handleDelete(): void;
}

// Dumb Components (Presentation)
interface IPortfolioCard {
  portfolio: Portfolio;
  onEdit(): void;
  onDelete(): void;
}
```

## Business Logic Layer

### 1. Investment Rules Engine
```typescript
class InvestmentRulesEngine {
  validatePosition(position: Position, config: PortfolioConfig): ValidationResult;
  calculateAllowedInvestment(portfolio: Portfolio): AllowedInvestment;
  checkRebalancingNeeds(portfolio: Portfolio): RebalancingAction[];
}
```

### 2. Portfolio Analytics
```typescript
interface PortfolioAnalytics {
  totalValue: number;
  gainLoss: number;
  categoryAllocations: Record<PortfolioCategory, number>;
  riskMetrics: RiskMetrics;
  performanceMetrics: PerformanceMetrics;
}
```

## Security Considerations

### 1. Data Protection
```typescript
// Sensitive data encryption
interface EncryptionService {
  encrypt(data: string): Promise<string>;
  decrypt(encrypted: string): Promise<string>;
}

// Data backup
interface BackupService {
  export(): Promise<Blob>;
  import(data: Blob): Promise<void>;
}
```

### 2. Input Validation
```typescript
const validatePortfolioInput = (data: unknown): Portfolio => {
  // Type guards and validation
  if (!isValidPortfolio(data)) {
    throw new ValidationError('Invalid portfolio data');
  }
  return data as Portfolio;
};
```

## Performance Optimizations

### 1. Data Caching
```typescript
const cache = new Map<string, CacheEntry>();

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

function getCached<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < entry.ttl) {
    return Promise.resolve(entry.data);
  }
  return loader().then(data => {
    cache.set(key, { data, timestamp: Date.now(), ttl: 5 * 60 * 1000 });
    return data;
  });
}
```

### 2. Render Optimization
```typescript
const MemoizedPositionList = React.memo(PositionList, (prev, next) => {
  return (
    prev.positions.length === next.positions.length &&
    prev.positions.every((p, i) => p.id === next.positions[i].id)
  );
});
```

## Error Handling

### 1. Error Boundaries
```typescript
class AppErrorBoundary extends React.Component {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error reporting service
  }
}
```

### 2. Error Types
```typescript
class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
  }
}

class DatabaseError extends Error {
  constructor(message: string, public operation: string) {
    super(message);
  }
}
```

## Testing Strategy

### 1. Test Categories
```typescript
// Unit Tests
describe('PortfolioService', () => {
  it('calculates correct metrics');
  it('validates input data');
  it('handles errors appropriately');
});

// Integration Tests
describe('Portfolio Management', () => {
  it('creates and updates portfolios');
  it('manages positions correctly');
  it('calculates analytics accurately');
});

// E2E Tests
describe('Portfolio Workflow', () => {
  it('completes full investment cycle');
  it('handles rebalancing process');
});
```

### 2. Test Utilities
```typescript
const mockDB = {
  portfolios: {
    toArray: jest.fn(),
    get: jest.fn(),
    add: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
};

const mockPortfolio = (overrides?: Partial<Portfolio>): Portfolio => ({
  id: 1,
  groupId: 1,
  name: 'Test Portfolio',
  // ... default values
  ...overrides
});
``` 