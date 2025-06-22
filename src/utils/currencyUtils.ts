/**
 * 통화별 포맷팅 유틸리티
 */

export type Currency = "KRW" | "USD";

/**
 * 숫자를 통화별로 포맷팅합니다.
 */
export const formatCurrency = (value: number, currency: Currency): string => {
  if (currency === "KRW") {
    return new Intl.NumberFormat("ko-KR").format(Math.round(value));
  } else {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
};

/**
 * 입력값에서 숫자만 추출합니다.
 */
export const parseNumberFromInput = (value: string): number => {
  const cleaned = value.replace(/[^\d.]/g, "");
  return parseFloat(cleaned) || 0;
};

/**
 * 통화별로 적절한 소수점 자릿수를 반환합니다.
 */
export const getCurrencyDecimals = (currency: Currency): number => {
  return currency === "KRW" ? 0 : 2;
};

/**
 * 통화별로 적절한 step 값을 반환합니다.
 */
export const getCurrencyStep = (currency: Currency): string => {
  return currency === "KRW" ? "1" : "0.01";
};

/**
 * 입력 중인 값을 실시간으로 포맷팅합니다.
 */
export const formatInputValue = (value: string, currency: Currency): string => {
  const numericValue = parseNumberFromInput(value);
  if (isNaN(numericValue) || numericValue === 0) return "";

  return formatCurrency(numericValue, currency);
};

/**
 * 포맷된 문자열에서 숫자값을 추출합니다.
 */
export const extractNumericValue = (formattedValue: string): number => {
  if (!formattedValue) return 0;
  const cleaned = formattedValue.replace(/[^\d.]/g, "");
  return parseFloat(cleaned) || 0;
};

/**
 * 통화 기호를 반환합니다.
 */
export const getCurrencySymbol = (currency: Currency): string => {
  return currency === "KRW" ? "₩" : "$";
};

/**
 * 통화별 플레이스홀더를 반환합니다.
 */
export const getCurrencyPlaceholder = (
  currency: Currency,
  type: "price" | "amount" = "price"
): string => {
  if (currency === "KRW") {
    return type === "price" ? "예: 50,000" : "예: 1,000,000";
  } else {
    return type === "price" ? "예: 150.50" : "예: 10,000.00";
  }
};
