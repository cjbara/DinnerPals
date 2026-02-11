"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  supabase,
  getSessionToken,
  setSessionToken,
  generateSessionToken,
} from "@/lib/supabase";
import type { Dinner, Category, Guest, Item } from "@/lib/types";
import { DIETARY_TAG_COLORS } from "@/lib/constants";
import ShareButton from "@/components/ShareButton";
import RsvpModal from "@/components/RsvpModal";
import ItemFormModal from "@/components/ItemFormModal";
import EditDinnerModal from "@/components/EditDinnerModal";
import ManageCategoriesModal from "@/components/ManageCategoriesModal";

export default function DinnerPage() {
  const params = useParams();
  const shareCode = params.shareCode as string;

  // Data state
  const [dinner, setDinner] = useState<Dinner | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  // User state
  const [currentGuest, setCurrentGuest] = useState<Guest | null>(null);
  const [isHost, setIsHost] = useState(false);

  // UI state
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showRsvp, setShowRsvp] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [showEditDinner, setShowEditDinner] = useState(false);
  const [showManageCategories, setShowManageCategories] = useState(false);

  // =============================================
  // DATA FETCHING
  // =============================================

  const fetchDinnerData = useCallback(async () => {
    // Fetch dinner
    const { data: dinnerData, error: dinnerError } = await supabase
      .from("dinners")
      .select("*")
      .eq("share_code", shareCode)
      .single();

    if (dinnerError || !dinnerData) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setDinner(dinnerData);

    // Fetch categories, guests, items in parallel
    const [categoriesRes, guestsRes, itemsRes] = await Promise.all([
      supabase
        .from("categories")
        .select("*")
        .eq("dinner_id", dinnerData.id)
        .order("sort_order"),
      supabase
        .from("guests")
        .select("*")
        .eq("dinner_id", dinnerData.id)
        .order("rsvp_at"),
      supabase
        .from("items")
        .select("*, item_dietary_tags(tag)")
        .eq("dinner_id", dinnerData.id)
        .order("created_at"),
    ]);

    setCategories(categoriesRes.data || []);
    setGuests(guestsRes.data || []);
    setItems(itemsRes.data || []);

    // Check session
    const sessionToken = getSessionToken(shareCode);
    if (sessionToken && guestsRes.data) {
      const matchedGuest = guestsRes.data.find(
        (g: Guest) => g.session_token === sessionToken
      );
      if (matchedGuest) {
        setCurrentGuest(matchedGuest);
        setIsHost(matchedGuest.is_host);
      }
    }

    setLoading(false);
  }, [shareCode]);

  // Initial fetch
  useEffect(() => {
    fetchDinnerData();
  }, [fetchDinnerData]);

  // =============================================
  // REALTIME SUBSCRIPTIONS
  // =============================================

  useEffect(() => {
    if (!dinner) return;

    const channel = supabase
      .channel(`dinner-${dinner.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "guests",
          filter: `dinner_id=eq.${dinner.id}`,
        },
        () => {
          // Re-fetch guests
          supabase
            .from("guests")
            .select("*")
            .eq("dinner_id", dinner.id)
            .order("rsvp_at")
            .then(({ data }) => {
              if (data) setGuests(data);
            });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "items",
          filter: `dinner_id=eq.${dinner.id}`,
        },
        () => {
          // Re-fetch items with tags
          supabase
            .from("items")
            .select("*, item_dietary_tags(tag)")
            .eq("dinner_id", dinner.id)
            .order("created_at")
            .then(({ data }) => {
              if (data) setItems(data);
            });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "categories",
          filter: `dinner_id=eq.${dinner.id}`,
        },
        () => {
          // Re-fetch categories
          supabase
            .from("categories")
            .select("*")
            .eq("dinner_id", dinner.id)
            .order("sort_order")
            .then(({ data }) => {
              if (data) setCategories(data);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dinner]);

  // =============================================
  // ACTIONS
  // =============================================

  async function handleRsvp(name: string, phone: string) {
    if (!dinner) return;

    const sessionToken = generateSessionToken();

    const { data: guest, error } = await supabase
      .from("guests")
      .insert({
        dinner_id: dinner.id,
        name,
        phone,
        is_host: false,
        session_token: sessionToken,
      })
      .select()
      .single();

    if (error) throw error;

    setSessionToken(shareCode, sessionToken);
    setCurrentGuest(guest);
    setIsHost(false);
    setShowRsvp(false);
  }

  async function handleAddItem(data: {
    name: string;
    categoryId: string;
    description: string;
    dietaryTags: string[];
  }) {
    if (!dinner || !currentGuest) return;

    // Insert item
    const { data: newItem, error: itemError } = await supabase
      .from("items")
      .insert({
        dinner_id: dinner.id,
        guest_id: currentGuest.id,
        category_id: data.categoryId || null,
        name: data.name,
        description: data.description || null,
      })
      .select()
      .single();

    if (itemError) throw itemError;

    // Insert dietary tags
    if (data.dietaryTags.length > 0) {
      const tagInserts = data.dietaryTags.map((tag) => ({
        item_id: newItem.id,
        tag,
      }));
      await supabase.from("item_dietary_tags").insert(tagInserts);
    }

    // Re-fetch items to get full data with tags
    const { data: updatedItems } = await supabase
      .from("items")
      .select("*, item_dietary_tags(tag)")
      .eq("dinner_id", dinner.id)
      .order("created_at");

    if (updatedItems) setItems(updatedItems);
  }

  async function handleEditItem(data: {
    name: string;
    categoryId: string;
    description: string;
    dietaryTags: string[];
  }) {
    if (!editingItem) return;

    // Update item
    const { error: itemError } = await supabase
      .from("items")
      .update({
        name: data.name,
        category_id: data.categoryId || null,
        description: data.description || null,
      })
      .eq("id", editingItem.id);

    if (itemError) throw itemError;

    // Delete old tags and insert new ones
    await supabase
      .from("item_dietary_tags")
      .delete()
      .eq("item_id", editingItem.id);

    if (data.dietaryTags.length > 0) {
      const tagInserts = data.dietaryTags.map((tag) => ({
        item_id: editingItem.id,
        tag,
      }));
      await supabase.from("item_dietary_tags").insert(tagInserts);
    }

    // Re-fetch items
    const { data: updatedItems } = await supabase
      .from("items")
      .select("*, item_dietary_tags(tag)")
      .eq("dinner_id", dinner!.id)
      .order("created_at");

    if (updatedItems) setItems(updatedItems);
    setEditingItem(null);
  }

  async function handleDeleteItem(itemId: string) {
    await supabase.from("items").delete().eq("id", itemId);

    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }

  async function handleEditDinner(data: {
    title: string;
    dateTime: string;
    location: string;
    description: string;
  }) {
    if (!dinner) return;

    const { error } = await supabase
      .from("dinners")
      .update({
        title: data.title,
        date_time: new Date(data.dateTime).toISOString(),
        location: data.location,
        description: data.description || null,
      })
      .eq("id", dinner.id);

    if (error) throw error;

    setDinner((prev) =>
      prev
        ? {
            ...prev,
            title: data.title,
            date_time: new Date(data.dateTime).toISOString(),
            location: data.location,
            description: data.description || null,
          }
        : null
    );
  }

  async function handleUpdateCategory(
    categoryId: string,
    desiredCount: number | null
  ) {
    await supabase
      .from("categories")
      .update({ desired_count: desiredCount })
      .eq("id", categoryId);

    setCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId ? { ...c, desired_count: desiredCount } : c
      )
    );
  }

  async function handleAddCategory(name: string) {
    if (!dinner) return;

    const maxSort = Math.max(...categories.map((c) => c.sort_order), -1);

    const { data, error } = await supabase
      .from("categories")
      .insert({
        dinner_id: dinner.id,
        name,
        sort_order: maxSort + 1,
        desired_count: null,
      })
      .select()
      .single();

    if (error) throw error;
    if (data) setCategories((prev) => [...prev, data]);
  }

  async function handleDeleteCategory(categoryId: string) {
    await supabase.from("categories").delete().eq("id", categoryId);

    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
  }

  // =============================================
  // HELPERS
  // =============================================

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function getItemsForCategory(categoryId: string) {
    return items.filter((i) => i.category_id === categoryId);
  }

  function getGuestName(guestId: string) {
    return guests.find((g) => g.id === guestId)?.name || "Unknown";
  }

  // =============================================
  // RENDER
  // =============================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-500">Loading dinner...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <span className="text-5xl mb-4 block">🍽️</span>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Dinner Not Found
          </h1>
          <p className="text-slate-500 mb-6">
            This dinner link doesn&apos;t exist or may have been removed.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium px-6 py-3 rounded-full"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (!dinner) return null;

  const uncategorizedItems = items.filter((i) => !i.category_id);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link href="/" className="text-amber-500 hover:text-amber-600">
                  <span className="text-xl">🍽️</span>
                </Link>
                {isHost && (
                  <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    Host
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 truncate">
                {dinner.title}
              </h1>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <svg
                    className="w-4 h-4 text-slate-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>
                    {formatDate(dinner.date_time)} at{" "}
                    {formatTime(dinner.date_time)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <svg
                    className="w-4 h-4 text-slate-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>{dinner.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <svg
                    className="w-4 h-4 text-slate-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Hosted by {dinner.host_name}</span>
                </div>
              </div>
              {dinner.description && (
                <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                  {dinner.description}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <ShareButton shareCode={shareCode} />
              {isHost && (
                <button
                  onClick={() => setShowEditDinner(true)}
                  className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                  Edit details
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* RSVP Banner (if not RSVP'd) */}
        {!currentGuest && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 text-center">
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              You&apos;re invited!
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              RSVP to join this dinner and sign up to bring something.
            </p>
            <button
              onClick={() => setShowRsvp(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-full shadow-md"
            >
              RSVP Now
            </button>
          </div>
        )}

        {/* Guest List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
              Guest List
            </h2>
            <span className="text-sm text-slate-400">
              {guests.length} {guests.length === 1 ? "guest" : "guests"}
            </span>
          </div>

          {guests.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">
              No guests yet. Be the first to RSVP!
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {guests.map((guest) => (
                <div
                  key={guest.id}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${
                    guest.is_host
                      ? "bg-amber-100 text-amber-800 font-medium"
                      : guest.id === currentGuest?.id
                        ? "bg-blue-100 text-blue-800 font-medium"
                        : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {guest.is_host && (
                    <svg
                      className="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  )}
                  <span>{guest.name}</span>
                  {isHost && !guest.is_host && (
                    <span className="text-xs text-slate-400 ml-1">
                      {guest.phone}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Menu Board */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
              Menu
            </h2>
            {isHost && (
              <button
                onClick={() => setShowManageCategories(true)}
                className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Manage Menu
              </button>
            )}
          </div>

          <div className="space-y-4">
            {categories.map((category) => {
              const categoryItems = getItemsForCategory(category.id);
              const isFilled =
                category.desired_count !== null &&
                categoryItems.length >= category.desired_count;

              return (
                <div
                  key={category.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
                >
                  {/* Category Header */}
                  <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-800">
                        {category.name}
                      </h3>
                      {category.desired_count !== null && (
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            isFilled
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {isFilled ? (
                            <span className="flex items-center gap-1">
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {categoryItems.length} / {category.desired_count}
                            </span>
                          ) : (
                            `${categoryItems.length} / ${category.desired_count}`
                          )}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {categoryItems.length}{" "}
                      {categoryItems.length === 1 ? "item" : "items"}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-slate-50">
                    {categoryItems.length === 0 ? (
                      <div className="px-5 py-6 text-center">
                        <p className="text-sm text-slate-400">
                          {category.desired_count
                            ? `Need ${category.desired_count} — be the first to sign up!`
                            : "No items yet"}
                        </p>
                      </div>
                    ) : (
                      categoryItems.map((item) => (
                        <div
                          key={item.id}
                          className="px-5 py-3.5 flex items-start justify-between gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-slate-900 text-sm">
                                {item.name}
                              </span>
                              {item.item_dietary_tags &&
                                item.item_dietary_tags.length > 0 &&
                                item.item_dietary_tags.map((t) => (
                                  <span
                                    key={t.tag}
                                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                                      DIETARY_TAG_COLORS[t.tag] ||
                                      "bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    {t.tag}
                                  </span>
                                ))}
                            </div>
                            {item.description && (
                              <p className="text-xs text-slate-400 mt-0.5">
                                {item.description}
                              </p>
                            )}
                            <p className="text-xs text-slate-500 mt-1">
                              Brought by{" "}
                              <span className="font-medium">
                                {getGuestName(item.guest_id)}
                              </span>
                            </p>
                          </div>
                          {currentGuest &&
                            item.guest_id === currentGuest.id && (
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  onClick={() => setEditingItem(item)}
                                  className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50"
                                  title="Edit"
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
                                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                                  title="Remove"
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
                            )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}

            {/* Uncategorized items */}
            {uncategorizedItems.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-800">Other</h3>
                </div>
                <div className="divide-y divide-slate-50">
                  {uncategorizedItems.map((item) => (
                    <div
                      key={item.id}
                      className="px-5 py-3.5 flex items-start justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-slate-900 text-sm">
                            {item.name}
                          </span>
                          {item.item_dietary_tags?.map((t) => (
                            <span
                              key={t.tag}
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                                DIETARY_TAG_COLORS[t.tag] ||
                                "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {t.tag}
                            </span>
                          ))}
                        </div>
                        {item.description && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            {item.description}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                          Brought by{" "}
                          <span className="font-medium">
                            {getGuestName(item.guest_id)}
                          </span>
                        </p>
                      </div>
                      {currentGuest && item.guest_id === currentGuest.id && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50"
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
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
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
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Empty state */}
          {items.length === 0 &&
            categories.every(
              (c) => getItemsForCategory(c.id).length === 0
            ) && (
              <div className="text-center py-8">
                <span className="text-4xl block mb-3">🍕</span>
                <p className="text-slate-500 text-sm">
                  The menu is empty. Be the first to sign up to bring something!
                </p>
              </div>
            )}
        </div>
      </div>

      {/* Floating Add Item Button */}
      {currentGuest && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-40 pointer-events-none">
          <button
            onClick={() => setShowAddItem(true)}
            className="pointer-events-auto inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3.5 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            I&apos;m Bringing Something
          </button>
        </div>
      )}

      {/* Modals */}
      <RsvpModal
        isOpen={showRsvp}
        onClose={() => setShowRsvp(false)}
        onSubmit={handleRsvp}
        dinnerTitle={dinner.title}
      />

      <ItemFormModal
        isOpen={showAddItem}
        onClose={() => setShowAddItem(false)}
        onSubmit={handleAddItem}
        categories={categories}
      />

      <ItemFormModal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSubmit={handleEditItem}
        categories={categories}
        editingItem={editingItem}
      />

      {dinner && (
        <EditDinnerModal
          isOpen={showEditDinner}
          onClose={() => setShowEditDinner(false)}
          onSubmit={handleEditDinner}
          dinner={dinner}
        />
      )}

      <ManageCategoriesModal
        isOpen={showManageCategories}
        onClose={() => setShowManageCategories(false)}
        categories={categories}
        onUpdateCategory={handleUpdateCategory}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </div>
  );
}
