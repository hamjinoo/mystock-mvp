import { PlusIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../services/db";
import { Memo } from "../types";

export const MemoListPage: React.FC = () => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadMemos = async () => {
    try {
      setIsLoading(true);
      // DB가 준비되었는지 확인
      if (!db.isOpen()) {
        await db.open();
      }
      const memos = await db.getMemos();
      setMemos(memos);
    } catch (error) {
      console.error("메모 로딩 중 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMemos();
  }, []);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  return (
    <div className="p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">메모장</h1>
          <button
            onClick={() => navigate("/memos/new")}
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-1" />새 메모
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-2">
            {memos.map((memo) => (
              <Link
                key={memo.id}
                to={`/memos/${memo.id}`}
                className="block p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-medium text-white">
                    {memo.title}
                  </h2>
                  <span className="text-sm text-gray-400">
                    {formatDate(memo.updatedAt)}
                  </span>
                </div>
              </Link>
            ))}
            {memos.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                저장된 메모가 없습니다.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
