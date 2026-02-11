"use client";

import { useState, useEffect } from "react";
import type { Dinner } from "@/lib/types";

interface EditDinnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    dateTime: string;
    location: string;
    description: string;
  }) => Promise<void>;
  dinner: Dinner;
}

export default function EditDinnerModal({
  isOpen,
  onClose,
  onSubmit,
  dinner,
}: EditDinnerModalProps) {
  const [title, setTitle] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dinner) {
      setTitle(dinner.title);
      // Convert ISO to datetime-local format
      const dt = new Date(dinner.date_time);
      const localDateTime = new Date(
        dt.getTime() - dt.getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 16);
      setDateTime(localDateTime);
      setLocation(dinner.location);
      setDescription(dinner.description || "");
    }
  }, [dinner, isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit({
        title,
        dateTime,
        location,
        description,
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
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            Edit Dinner Details
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
          <div>
            <label
              htmlFor="editTitle"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Dinner Name *
            </label>
            <input
              id="editTitle"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 bg-white"
            />
          </div>
          <div>
            <label
              htmlFor="editDateTime"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Date & Time *
            </label>
            <input
              id="editDateTime"
              type="datetime-local"
              required
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 bg-white"
            />
          </div>
          <div>
            <label
              htmlFor="editLocation"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Location *
            </label>
            <input
              id="editLocation"
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 bg-white"
            />
          </div>
          <div>
            <label
              htmlFor="editDescription"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="editDescription"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 bg-white resize-none"
            />
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
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
