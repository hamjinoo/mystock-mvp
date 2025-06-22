import React from "react";
import { SPINNER_SIZES } from "../constants/ui";

interface LoadingSpinnerProps {
  message?: string;
  size?: keyof typeof SPINNER_SIZES;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "로딩 중...",
  size = "md",
  className = "",
}) => {
  return (
    <div className={`flex flex-col justify-center items-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-b-2 border-gray-300 ${SPINNER_SIZES[size]}`}
      ></div>
      {message && <p className="text-gray-400 text-sm mt-2">{message}</p>}
    </div>
  );
};
