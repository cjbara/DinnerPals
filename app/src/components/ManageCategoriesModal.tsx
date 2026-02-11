"use client";

import { useState, useEffect } from "react";
import type { Category } from "@/lib/types";

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onUpdateCategory: (
    categoryId: string,
    desiredCount: number | null
  ) => Promise<void>;
  onAddCategory: (name: string) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
}

export default function ManageCategoriesModal({
  isOpen,
  onClose,
  categories,
  onUpdateCategory,
  onAddCategory,
  onDeleteCategory,
}: ManageCategoriesModalProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [localCategories, setLocalCategories] = useState<
    { id: string; name: string; desired_count: number | null }[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLocalCategories(
      categories.map((c) => ({
        id: c.id,
        name: c.name,
        desired_count: c.desired_count,
      }))
    );
  }, [categories, isOpen]);

  if (!isOpen) return null;

  async function handleUpdateCount(id: string, value: string) {
    const count = value === "" ? null : parseInt(value, 10);
    setLocalCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, desired_count: count } : c))
    );
    await onUpdateCategory(id, count);
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setLoading(true);
    try {
      await onAddCategory(newCategoryName.trim());
      setNewCategoryName("");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    await onDeleteCategory(id);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Manage Menu</h2>
            <p className="text-sm text-slate-500 mt-1">
              Set how many items you need in each category.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Category List */}
        <div className="space-y-3 mb-6">
          {localCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3"
            >
              <span className="flex-1 font-medium text-slate-800 text-sm">
                {cat.name}
              </span>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400">Need:</label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={cat.desired_count ?? ""}
                  onChange={(e) => handleUpdateCount(cat.id, e.target.value)}
                  placeholder="Any"
                  className="w-16 px-2 py-1.5 rounded-lg border border-slate-200 text-sm text-center text-slate-900 bg-white"
                />
              </div>
              <button
                onClick={() => handleDelete(cat.id)}
                className="text-slate-300 hover:text-red-500 p-1"
                title="Remove category"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Add Category */}
        <form onSubmit={handleAddCategory} className="flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder='Add category (e.g., "Snacks")'
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 bg-white"
          />
          <button
            type="submit"
            disabled={loading || !newCategoryName.trim()}
            className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium px-4 py-2.5 rounded-xl text-sm"
          >
            Add
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-full border border-slate-200 text-slate-600 font-medium hover:bg-slate-50"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
