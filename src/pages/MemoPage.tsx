import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { Memo } from '../types';

export const MemoPage: React.FC = () => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const loadMemos = async () => {
    const memos = await db.memos.orderBy('createdAt').reverse().toArray();
    setMemos(memos);
  };

  useEffect(() => {
    loadMemos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingMemo) {
        await db.memos.update(editingMemo.id, {
          title: title.trim(),
          content: content.trim(),
          updatedAt: Date.now(),
        });
      } else {
        await db.addMemo({
          title: title.trim(),
          content: content.trim(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      setTitle('');
      setContent('');
      setIsEditing(false);
      setEditingMemo(null);
      await loadMemos();
    } catch (error) {
      console.error('Error saving memo:', error);
    }
  };

  const handleEdit = (memo: Memo) => {
    setEditingMemo(memo);
    setTitle(memo.title);
    setContent(memo.content);
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('정말 이 메모를 삭제하시겠습니까?')) return;

    try {
      await db.memos.delete(id);
      await loadMemos();
    } catch (error) {
      console.error('Error deleting memo:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">메모장</h1>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목"
                className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용"
                className="w-full h-32 px-4 py-2 bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                required
              />
            </div>
            <div className="flex justify-end">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingMemo(null);
                    setTitle('');
                    setContent('');
                  }}
                  className="px-4 py-2 mr-2 text-gray-400 hover:text-white"
                >
                  취소
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {isEditing ? '수정' : '저장'}
              </button>
            </div>
          </div>
        </form>

        <div className="space-y-4">
          {memos.map((memo) => (
            <div key={memo.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{memo.title}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(memo)}
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(memo.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap">{memo.content}</p>
              <div className="mt-2 text-sm text-gray-500">
                {new Date(memo.updatedAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 