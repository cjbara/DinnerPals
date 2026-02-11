"use client";

import { useState } from "react";

interface RsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, phone: string) => Promise<void>;
  dinnerTitle: string;
}

export default function RsvpModal({
  isOpen,
  onClose,
  onSubmit,
  dinnerTitle,
}: RsvpModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit(name, phone);
      setName("");
      setPhone("");
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
          <div>
            <h2 className="text-xl font-bold text-slate-900">RSVP</h2>
            <p className="text-sm text-slate-500 mt-1">
              Join &ldquo;{dinnerTitle}&rdquo;
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="rsvpName"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Your Name *
            </label>
            <input
              id="rsvpName"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sarah"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 bg-white"
              autoFocus
            />
          </div>
          <div>
            <label
              htmlFor="rsvpPhone"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Phone Number *
            </label>
            <input
              id="rsvpPhone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 bg-white"
            />
            <p className="text-xs text-slate-400 mt-1">
              Only visible to the host for coordination.
            </p>
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
            {loading ? "Joining..." : "Count Me In!"}
          </button>
        </form>
      </div>
    </div>
  );
}
