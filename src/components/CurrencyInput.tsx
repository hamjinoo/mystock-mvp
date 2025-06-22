import React, { useEffect, useState } from "react";
import {
  Currency,
  formatCurrency,
  getCurrencyPlaceholder,
  getCurrencyStep,
  getCurrencySymbol,
  parseNumberFromInput,
} from "../utils/currencyUtils";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  currency: Currency;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
  type?: "price" | "amount";
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  currency,
  placeholder,
  label,
  required = false,
  className = "",
  type = "price",
}) => {
  const [displayValue, setDisplayValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // value가 변경될 때 displayValue 업데이트
  useEffect(() => {
    setDisplayValue(value > 0 ? formatCurrency(value, currency) : "");
  }, [value, currency]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // 숫자와 콤마, 소수점만 허용
    const cleanedValue = inputValue.replace(/[^\d,.]/g, "");
    const numericValue = parseNumberFromInput(cleanedValue);

    // 실시간 포맷팅 적용
    if (cleanedValue === "" || numericValue === 0) {
      setDisplayValue("");
      onChange(0);
    } else {
      const formatted = formatCurrency(numericValue, currency);
      setDisplayValue(formatted);
      onChange(numericValue);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // 포커스 해제 시에도 포맷팅 유지
    if (value > 0) {
      setDisplayValue(formatCurrency(value, currency));
    }
  };

  const currencySymbol = getCurrencySymbol(currency);
  const step = getCurrencyStep(currency);
  const defaultPlaceholder =
    placeholder || getCurrencyPlaceholder(currency, type);

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium mb-2">{label}</label>
      )}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
          {currencySymbol}
        </div>
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={defaultPlaceholder}
          required={required}
          className={`w-full pl-8 pr-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        />
      </div>
    </div>
  );
};
