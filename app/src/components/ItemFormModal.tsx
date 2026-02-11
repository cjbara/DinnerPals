"use client";

import { useState, useEffect } from "react";
import type { Category, Item } from "@/lib/types";
import { DIETARY_TAGS, DIETARY_TAG_COLORS } from "@/lib/constants";

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    categoryId: string;
    description: string;
    dietaryTags: string[];
  }) => Promise<void>;
  categories: Category[];
  editingItem?: Item | null;
}

export default function ItemFormModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  editingItem,
}: ItemFormModalProps) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!editingItem;

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setCategoryId(editingItem.category_id || "");
      setDescription(editingItem.description || "");
      setSelectedTags(
        editingItem.item_dietary_tags?.map((t) => t.tag) || []
      );
    } else {
      setName("");
      setCategoryId(categories[0]?.id || "");
      setDescription("");
      setSelectedTags([]);
    }
  }, [editingItem, categories, isOpen]);

  if (!isOpen) return null;

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit({
        name,
        categoryId,
        description,
        dietaryTags: selectedTags,
      });
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            {isEditing ? "Edit Item" : "Add an Item"}
          </h2>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item Name */}
          <div>
            <label
              htmlFor="itemName"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              What are you bringing? *
            </label>
            <input
              id="itemName"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='e.g., "Buffalo Chicken Dip"'
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 bg-white"
              autoFocus
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="itemCategory"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Category *
            </label>
            <select
              id="itemCategory"
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 bg-white appearance-none"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="itemDescription"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Description{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="itemDescription"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Grandma's recipe, serves 8"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 bg-white resize-none"
            />
          </div>

          {/* Dietary Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Dietary Tags{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                const colorClass =
                  DIETARY_TAG_COLORS[tag] || "bg-slate-100 text-slate-700";
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 ${
                      isSelected
                        ? `${colorClass} border-current`
                        : "bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold py-3 rounded-full shadow-md"
          >
            {loading
              ? "Saving..."
              : isEditing
                ? "Save Changes"
                : "Add to Menu"}
          </button>
        </form>
      </div>
    </div>
  );
}
