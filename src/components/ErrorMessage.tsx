import React from "react";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  className = "",
}) => {
  return (
    <div className={`bg-red-900/50 text-red-400 p-4 rounded ${className}`}>
      <p className="mb-2">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
        >
          다시 시도
        </button>
      )}
    </div>
  );
};
