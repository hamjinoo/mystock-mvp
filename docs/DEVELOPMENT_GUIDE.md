# Development Guide

## Core Implementation Patterns

### 1. Database Operations
```typescript
// Always use transactions for related operations
async function updatePortfolioAndPositions() {
  await db.transaction('rw', [db.portfolios, db.positions], async () => {
    await db.portfolios.update(id, portfolioChanges);
    await db.positions.where('portfolioId').equals(id).modify(positionChanges);
  });
}
```

### 2. Position Updates
```typescript
// Standard position update pattern
const updatePosition = async (position: Position) => {
  // 1. Validate against portfolio config
  const portfolio = await db.portfolios.get(position.portfolioId);
  const allocation = portfolio.config.categoryAllocations[position.category];
  
  // 2. Check investment limits
  const currentValue = position.quantity * position.currentPrice;
  const maxInvestment = portfolio.config.totalCapital * (allocation.maxStockPercentage / 100);
  
  // 3. Validate entry count
  if (position.entryCount > allocation.maxEntries) {
    throw new Error('Exceeds maximum entries');
  }
  
  // 4. Update position
  await db.positions.update(position.id, {
    ...position,
    updatedAt: Date.now()
  });
}
```

### 3. Category Allocation Management
```typescript
interface AllocationCheck {
  isValid: boolean;
  currentAllocation: number;
  maxAllocation: number;
}

function checkCategoryAllocation(
  positions: Position[],
  config: PortfolioConfig,
  category: PortfolioCategory
): AllocationCheck {
  const categoryPositions = positions.filter(p => p.category === category);
  const totalValue = categoryPositions.reduce((sum, p) => 
    sum + (p.quantity * p.currentPrice), 0);
  
  const allocation = config.categoryAllocations[category];
  const maxAllocation = config.totalCapital * (allocation.targetPercentage / 100);
  
  return {
    isValid: totalValue <= maxAllocation,
    currentAllocation: totalValue,
    maxAllocation
  };
}
```

### 4. Investment Planning
```typescript
interface InvestmentPlan {
  maxInvestment: number;
  currentInvestment: number;
  availableAmount: number;
  suggestedEntries: number[];
}

function calculateInvestmentPlan(
  position: Position,
  config: PortfolioConfig
): InvestmentPlan {
  const allocation = config.categoryAllocations[position.category];
  const maxInvestment = config.totalCapital * (allocation.maxStockPercentage / 100);
  const currentInvestment = position.quantity * position.avgPrice;
  
  const remainingEntries = allocation.maxEntries - (position.entryCount || 0);
  const availableAmount = maxInvestment - currentInvestment;
  
  const suggestedEntries = Array(remainingEntries)
    .fill(availableAmount / remainingEntries);
    
  return {
    maxInvestment,
    currentInvestment,
    availableAmount,
    suggestedEntries
  };
}
```

## Error Handling Patterns

### 1. Database Operations
```typescript
try {
  await db.transaction('rw', [db.portfolios], async () => {
    // Operations
  });
} catch (error) {
  if (error.name === 'ConstraintError') {
    // Handle constraint violations
  } else if (error.name === 'QuotaExceededError') {
    // Handle storage limits
  } else {
    // Handle other errors
  }
}
```

### 2. Business Logic Validation
```typescript
function validatePortfolioOperation(portfolio: Portfolio): void {
  // 1. Check total allocation
  const totalAllocation = Object.values(portfolio.config.categoryAllocations)
    .reduce((sum, cat) => sum + cat.targetPercentage, 0);
  if (totalAllocation !== 100) {
    throw new Error('Category allocations must sum to 100%');
  }
  
  // 2. Check position limits
  portfolio.positions?.forEach(position => {
    const allocation = portfolio.config.categoryAllocations[position.category];
    if (!allocation) {
      throw new Error(`Invalid category: ${position.category}`);
    }
    // Additional checks...
  });
}
```

## Component Patterns

### 1. Form Handling
```typescript
function useFormState<T>(initialState: T) {
  const [state, setState] = useState<T>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  
  const validate = useCallback((data: T): boolean => {
    // Validation logic
    return true;
  }, []);
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate(state)) {
      try {
        await submitData(state);
      } catch (error) {
        setErrors(error.validationErrors);
      }
    }
  }, [state, validate]);
  
  return { state, setState, errors, handleSubmit };
}
```

### 2. Data Loading
```typescript
function useDataLoader<T>(
  loadFn: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let mounted = true;
    
    const load = async () => {
      try {
        const result = await loadFn();
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (e) {
        if (mounted) {
          setError(e);
          setData(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    load();
    return () => { mounted = false; };
  }, dependencies);
  
  return { data, loading, error, reload: load };
}
```

## Testing Patterns

### 1. Component Tests
```typescript
describe('PositionModal', () => {
  it('validates entry count against max entries', async () => {
    const position = mockPosition({
      entryCount: 4,
      maxEntries: 3
    });
    
    render(<PositionModal position={position} />);
    
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    
    expect(screen.getByText(/exceeds maximum entries/i)).toBeInTheDocument();
  });
});
```

### 2. Service Tests
```typescript
describe('PortfolioService', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });
  
  it('enforces category allocation limits', async () => {
    const portfolio = await createTestPortfolio();
    const position = mockPosition({
      category: PortfolioCategory.LONG_TERM,
      quantity: 100,
      currentPrice: 1000
    });
    
    await expect(
      PortfolioService.addPosition(portfolio.id, position)
    ).rejects.toThrow(/exceeds category allocation/i);
  });
}); 