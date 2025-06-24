import { useCallback, useState } from 'react';

/**
 * 복잡한 폼 상태를 효율적으로 관리하는 커스텀 훅
 */
export function useFormState<T extends Record<string, any>>(initialState: T) {
  const [formData, setFormData] = useState<T>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 필드 터치 표시
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // 에러 클리어
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const updateMultipleFields = useCallback((updates: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    
    // 업데이트된 필드들을 터치로 표시
    const touchedFields = Object.keys(updates).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Partial<Record<keyof T, boolean>>);
    
    setTouched(prev => ({ ...prev, ...touchedFields }));
  }, []);

  const setFieldError = useCallback(<K extends keyof T>(field: K, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const resetForm = useCallback((newInitialState?: T) => {
    setFormData(newInitialState || initialState);
    setErrors({});
    setTouched({});
  }, [initialState]);

  const isFieldTouched = useCallback(<K extends keyof T>(field: K) => {
    return !!touched[field];
  }, [touched]);

  const hasErrors = Object.keys(errors).some(key => errors[key as keyof T]);

  return {
    formData,
    errors,
    touched,
    updateField,
    updateMultipleFields,
    setFieldError,
    clearErrors,
    resetForm,
    isFieldTouched,
    hasErrors,
  };
} 