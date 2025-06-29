import { useCallback, useEffect, useState } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * 비동기 데이터 로딩을 위한 커스텀 훅
 */
export function useAsyncState<T>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await asyncFunction();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setState({ data: null, loading: false, error: errorObj });
      throw errorObj;
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  return {
    ...state,
    refetch,
  };
}

/**
 * 여러 비동기 작업을 병렬로 실행하는 훅
 */
export function useMultipleAsyncState<T extends Record<string, any>>(
  asyncFunctions: { [K in keyof T]: () => Promise<T[K]> },
  dependencies: any[] = []
) {
  const [state, setState] = useState<{
    data: Partial<T>;
    loading: boolean;
    error: Error | null;
  }>({
    data: {},
    loading: true,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const keys = Object.keys(asyncFunctions) as (keyof T)[];
      const promises = keys.map(key => asyncFunctions[key]());
      const results = await Promise.all(promises);
      
      const data = keys.reduce((acc, key, index) => {
        acc[key] = results[index];
        return acc;
      }, {} as T);
      
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setState({ data: {}, loading: false, error: errorObj });
      throw errorObj;
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  return {
    ...state,
    refetch,
  };
} 