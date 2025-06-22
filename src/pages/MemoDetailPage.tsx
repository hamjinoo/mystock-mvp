import { PencilIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { db } from "../services/db";
import { Memo, NewMemo } from "../types";

export const MemoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [memo, setMemo] = useState<Memo | null>(null);
  const [isEditing, setIsEditing] = useState(id === "new");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id === "new") {
      setIsLoading(false);
      return;
    }

    const loadMemo = async () => {
      try {
        // DB가 준비되었는지 확인
        if (!db.isOpen()) {
          await db.open();
        }
        const memo = await db.getMemoById(Number(id));
        if (memo) {
          setMemo(memo);
          setTitle(memo.title);
          setContent(memo.content);
        }
      } catch (error) {
        console.error("메모 로딩 중 오류:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMemo();
  }, [id]);

  const handleSave = async () => {
    try {
      if (!title.trim() || !content.trim()) {
        alert("제목과 내용을 모두 입력해주세요.");
        return;
      }

      // DB가 준비되었는지 확인
      if (!db.isOpen()) {
        await db.open();
      }

      if (id === "new") {
        const newMemo: NewMemo = {
          title: title.trim(),
          content: content.trim(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await db.addMemo(newMemo);
      } else if (memo) {
        await db.updateMemo({
          ...memo,
          title: title.trim(),
          content: content.trim(),
        });
      }
      navigate("/memos");
    } catch (error) {
      console.error("메모 저장 중 오류:", error);
      alert("메모 저장 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말로 이 메모를 삭제하시겠습니까?")) {
      return;
    }

    try {
      // DB가 준비되었는지 확인
      if (!db.isOpen()) {
        await db.open();
      }
      await db.deleteMemo(Number(id));
      navigate("/memos");
    } catch (error) {
      console.error("메모 삭제 중 오류:", error);
      alert("메모 삭제 중 오류가 발생했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700 bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center">
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                className="text-2xl font-bold bg-transparent border-b border-gray-600 focus:border-blue-500 focus:outline-none w-full"
              />
            ) : (
              <h1 className="text-2xl font-bold">{title}</h1>
            )}

            {!isEditing && id !== "new" && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-1 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <PencilIcon className="h-5 w-5 mr-1" />
                수정
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full p-4 overflow-auto">
          <div className="max-w-3xl mx-auto">
            {isEditing ? (
              <div className="space-y-4">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="내용을 입력하세요 (마크다운 사용 가능)&#10;# 제목 1&#10;## 제목 2&#10;- 목록&#10;1. 번호 목록&#10;**굵게** _기울임_&#10;```코드 블록```"
                  className="w-full h-[calc(100vh-240px)] p-4 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      if (id === "new") {
                        navigate("/memos");
                      } else {
                        setIsEditing(false);
                        setTitle(memo?.title || "");
                        setContent(memo?.content || "");
                      }
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    저장
                  </button>
                </div>
              </div>
            ) : (
              <div className="prose prose-invert prose-lg max-w-none">
                <div className="markdown-content">
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => (
                        <h1
                          className="text-3xl font-bold mt-8 mb-4"
                          {...props}
                        />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2
                          className="text-2xl font-bold mt-6 mb-3"
                          {...props}
                        />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3
                          className="text-xl font-bold mt-4 mb-2"
                          {...props}
                        />
                      ),
                      p: ({ node, ...props }) => (
                        <p className="my-4 leading-relaxed" {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul
                          className="list-disc list-inside my-4 space-y-2"
                          {...props}
                        />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol
                          className="list-decimal list-inside my-4 space-y-2"
                          {...props}
                        />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="ml-4" {...props} />
                      ),
                      code: ({ node, children, className, ...props }) => {
                        const match = /language-(\w+)/.exec(className || "");
                        const isInline = !className;
                        return isInline ? (
                          <code
                            className="bg-gray-700 rounded px-1 py-0.5 font-mono text-sm"
                            {...props}
                          >
                            {children}
                          </code>
                        ) : (
                          <code
                            className="block bg-gray-700 rounded p-4 font-mono text-sm my-4 overflow-x-auto"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                      blockquote: ({ node, ...props }) => (
                        <blockquote
                          className="border-l-4 border-gray-500 pl-4 my-4 italic"
                          {...props}
                        />
                      ),
                      a: ({ node, ...props }) => (
                        <a
                          className="text-blue-400 hover:text-blue-300 underline"
                          {...props}
                        />
                      ),
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {!isEditing && id !== "new" && (
        <div className="mt-10 p-4 bg-gray-900">
          <div className="max-w-3xl mx-auto text-center">
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-400 underline"
            >
              삭제하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
