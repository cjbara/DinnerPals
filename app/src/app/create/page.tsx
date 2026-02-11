"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, generateSessionToken, setSessionToken } from "@/lib/supabase";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { nanoid } from "nanoid";

export default function CreateDinnerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    hostName: "",
    hostPhone: "",
    title: "",
    dateTime: "",
    location: "",
    description: "",
  });

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const shareCode = nanoid(8);
      const sessionToken = generateSessionToken();

      // 1. Create the dinner
      const { data: dinner, error: dinnerError } = await supabase
        .from("dinners")
        .insert({
          title: form.title,
          description: form.description || null,
          date_time: new Date(form.dateTime).toISOString(),
          location: form.location,
          host_name: form.hostName,
          host_phone: form.hostPhone,
          share_code: shareCode,
        })
        .select()
        .single();

      if (dinnerError) throw dinnerError;

      // 2. Create default categories
      const categoryInserts = DEFAULT_CATEGORIES.map((cat) => ({
        dinner_id: dinner.id,
        name: cat.name,
        sort_order: cat.sortOrder,
        desired_count: null,
      }));

      const { error: catError } = await supabase
        .from("categories")
        .insert(categoryInserts);

      if (catError) throw catError;

      // 3. Create host as a guest
      const { error: guestError } = await supabase.from("guests").insert({
        dinner_id: dinner.id,
        name: form.hostName,
        phone: form.hostPhone,
        is_host: true,
        session_token: sessionToken,
      });

      if (guestError) throw guestError;

      // 4. Store session in localStorage
      setSessionToken(shareCode, sessionToken);

      // 5. Redirect to dinner page
      router.push(`/dinner/${shareCode}`);
    } catch (err) {
      console.error("Error creating dinner:", err);
      setError("Something went wrong creating your dinner. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-lg mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-8"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Create a Dinner
          </h1>
          <p className="text-slate-500">
            Set up your event and share the link with your guests.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Host Info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
              About You
            </h2>
            <div>
              <label
                htmlFor="hostName"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Your Name *
              </label>
              <input
                id="hostName"
                type="text"
                required
                value={form.hostName}
                onChange={(e) => updateForm("hostName", e.target.value)}
                placeholder="e.g., Cory"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 bg-white"
              />
            </div>
            <div>
              <label
                htmlFor="hostPhone"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Your Phone Number *
              </label>
              <input
                id="hostPhone"
                type="tel"
                required
                value={form.hostPhone}
                onChange={(e) => updateForm("hostPhone", e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 bg-white"
              />
            </div>
          </div>

          {/* Dinner Info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
              Dinner Details
            </h2>
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Dinner Name *
              </label>
              <input
                id="title"
                type="text"
                required
                value={form.title}
                onChange={(e) => updateForm("title", e.target.value)}
                placeholder='e.g., "Super Bowl Watch Party"'
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 bg-white"
              />
            </div>
            <div>
              <label
                htmlFor="dateTime"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Date & Time *
              </label>
              <input
                id="dateTime"
                type="datetime-local"
                required
                value={form.dateTime}
                onChange={(e) => updateForm("dateTime", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 bg-white"
              />
            </div>
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Location *
              </label>
              <input
                id="location"
                type="text"
                required
                value={form.location}
                onChange={(e) => updateForm("location", e.target.value)}
                placeholder="e.g., 123 Main St, Apt 4B"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 bg-white"
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Description{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                placeholder="Theme, notes, or instructions for guests..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 bg-white resize-none"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold text-lg py-4 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 disabled:transform-none disabled:shadow-none"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="animate-spin w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Creating...
              </span>
            ) : (
              "Create Dinner"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
