"use client";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  ExternalLink,
  Search,
  LogOut,
  LayoutGrid,
  List,
  Bookmark,
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [avatarError, setAvatarError] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const broadcastRef = useRef(null);
  const tabIdRef = useRef(null);

  const postBroadcast = (message) => {
    try {
      broadcastRef.current?.postMessage(message);
    } catch (error) {
      console.warn("BroadcastChannel postMessage failed:", error);
    }
  };

  useEffect(() => {
    // Check authentication
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }
      setUser(session.user);
      fetchBookmarks(session.user.id);
    };
    checkUser();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    setAvatarError(false);
  }, [user?.id]);

  const getDisplayName = (authUser) => {
    const meta = authUser?.user_metadata || {};
    const nameCandidate =
      meta.full_name ||
      meta.name ||
      meta.user_name ||
      meta.preferred_username ||
      meta.nickname ||
      authUser?.identities?.[0]?.identity_data?.full_name ||
      authUser?.identities?.[0]?.identity_data?.name;

    if (typeof nameCandidate === "string" && nameCandidate.trim()) {
      return nameCandidate.trim();
    }

    const email = authUser?.email;
    if (typeof email === "string" && email.includes("@")) {
      return email.split("@")[0];
    }

    return "";
  };

  const getAvatarUrl = (authUser) => {
    const meta = authUser?.user_metadata || {};
    const candidate =
      meta.avatar_url ||
      meta.picture ||
      meta.avatar ||
      authUser?.identities?.[0]?.identity_data?.avatar_url ||
      authUser?.identities?.[0]?.identity_data?.picture;
    return typeof candidate === "string" && candidate.trim() ? candidate.trim() : "";
  };

  const getInitials = (value) => {
    if (!value) return "U";
    const parts = String(value)
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  // Same-browser multi-tab sync (works even if Supabase Realtime isn't configured).
  useEffect(() => {
    tabIdRef.current =
      tabIdRef.current ||
      (globalThis.crypto?.randomUUID?.() ??
        `tab-${Date.now()}-${Math.random()}`);

    if (typeof window === "undefined") return;
    if (typeof window.BroadcastChannel === "undefined") {
      console.warn(
        "BroadcastChannel not supported in this browser; multi-tab sync disabled",
      );
      return;
    }

    const channel = new BroadcastChannel("smart-bookmarks");
    broadcastRef.current = channel;

    channel.onmessage = (event) => {
      const message = event?.data;
      if (!message || typeof message !== "object") return;
      if (message.tabId && message.tabId === tabIdRef.current) return;

      // Only apply messages for the same signed-in user.
      if (!user?.id || message.userId !== user.id) return;

      if (message.type === "bookmark_add_optimistic") {
        const incoming = message.bookmark;
        if (!incoming) return;
        setBookmarks((current) => {
          if (
            current.some(
              (b) =>
                b.client_mutation_id &&
                b.client_mutation_id === incoming.client_mutation_id,
            )
          ) {
            return current;
          }
          if (current.some((b) => b.id === incoming.id)) {
            return current;
          }
          return [incoming, ...current];
        });
      }

      if (message.type === "bookmark_add_confirmed") {
        const incoming = message.bookmark;
        if (!incoming) return;
        const mutationId = message.mutationId;
        setBookmarks((current) => {
          const withoutOptimistic = mutationId
            ? current.filter((b) => b.client_mutation_id !== mutationId)
            : current;
          if (withoutOptimistic.some((b) => b.id === incoming.id))
            return withoutOptimistic;
          return [incoming, ...withoutOptimistic];
        });
      }

      if (message.type === "bookmark_add_failed") {
        const mutationId = message.mutationId;
        if (!mutationId) return;
        setBookmarks((current) =>
          current.filter((b) => b.client_mutation_id !== mutationId),
        );
      }

      if (message.type === "bookmark_delete") {
        const id = message.id;
        if (!id) return;
        setBookmarks((current) => current.filter((b) => b.id !== id));
      }

      if (message.type === "bookmark_delete_rollback") {
        const bookmark = message.bookmark;
        if (!bookmark) return;
        setBookmarks((current) => {
          if (current.some((b) => b.id === bookmark.id)) return current;
          return [bookmark, ...current];
        });
      }
    };

    return () => {
      try {
        channel.close();
      } catch {
        // ignore
      }
      if (broadcastRef.current === channel) broadcastRef.current = null;
    };
  }, [user]);

  const fetchBookmarks = async (userId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bookmarks:", error);
    } else {
      setBookmarks(data || []);
    }
    setLoading(false);
  };

  // Set up realtime subscription
  useEffect(() => {
    if (!user) {
      return;
    }

    const channel = supabase
      .channel("bookmarks-channel", {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setBookmarks((current) => {
            // Check if bookmark already exists to avoid duplicates
            if (current.some((b) => b.id === payload.new.id)) {
              return current;
            }
            return [payload.new, ...current];
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setBookmarks((current) => {
            const filtered = current.filter((b) => b.id !== payload.old.id);
            return filtered;
          });
        },
      )
      .subscribe((status, err) => {
        if (err) {
          console.error("❌ Realtime subscription error:", err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleAddBookmark = async (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    if (!user) return;

    setAdding(true);

    // Add https:// if no protocol specified
    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = "https://" + finalUrl;
    }

    const trimmedTitle = title.trim();
    const mutationId =
      globalThis.crypto?.randomUUID?.() ?? `mut-${Date.now()}-${Math.random()}`;
    const optimisticId = `optimistic-${mutationId}`;
    const optimisticBookmark = {
      id: optimisticId,
      user_id: user.id,
      title: trimmedTitle,
      url: finalUrl,
      created_at: new Date().toISOString(),
      client_mutation_id: mutationId,
    };

    // Optimistic UI update so the bookmark shows instantly.
    setBookmarks((current) => [optimisticBookmark, ...current]);
    postBroadcast({
      type: "bookmark_add_optimistic",
      tabId: tabIdRef.current,
      userId: user.id,
      mutationId,
      bookmark: optimisticBookmark,
    });

    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .insert([{ user_id: user.id, title: trimmedTitle, url: finalUrl }])
        .select()
        .single();

      if (error) throw error;

      postBroadcast({
        type: "bookmark_add_confirmed",
        tabId: tabIdRef.current,
        userId: user.id,
        mutationId,
        bookmark: data,
      });

      // Replace the optimistic row with the real row (and avoid duplicates if realtime also inserted it).
      setBookmarks((current) => {
        const withoutOptimistic = current.filter((b) => b.id !== optimisticId);
        if (withoutOptimistic.some((b) => b.id === data.id))
          return withoutOptimistic;
        return [data, ...withoutOptimistic];
      });

      setTitle("");
      setUrl("");
    } catch (error) {
      console.error("Error adding bookmark:", error);
      setBookmarks((current) => current.filter((b) => b.id !== optimisticId));
      postBroadcast({
        type: "bookmark_add_failed",
        tabId: tabIdRef.current,
        userId: user.id,
        mutationId,
      });
      alert("Error adding bookmark: " + (error?.message || "Unknown error"));
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteBookmark = async (id) => {
    // Optimistic UI update so the bookmark disappears instantly.
    const deletedBookmark = bookmarks.find((b) => b.id === id);
    const previousBookmarks = bookmarks;
    setBookmarks((current) => current.filter((b) => b.id !== id));
    postBroadcast({
      type: "bookmark_delete",
      tabId: tabIdRef.current,
      userId: user?.id,
      id,
    });

    const { error } = await supabase.from("bookmarks").delete().eq("id", id);

    if (error) {
      console.error("Error deleting bookmark:", error);
      setBookmarks(previousBookmarks);
      if (deletedBookmark) {
        postBroadcast({
          type: "bookmark_delete_rollback",
          tabId: tabIdRef.current,
          userId: user?.id,
          bookmark: deletedBookmark,
        });
      }
      alert("Error deleting bookmark: " + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const formatBookmarkDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(date);
  };

  const filteredBookmarks = bookmarks.filter(b =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && !user) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin"></div>
      </div>
    );
  }

return (
  <div className="min-h-screen bg-black text-white py-10">
    <div className="mx-auto max-w-6xl px-6">

      {/* HEADER */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              <span className="text-neon-blue">Smart</span>{" "}
              <span className="text-neon-purple">Bookmarks</span>
            </h1>
            <p className="text-white/50 mt-2 text-sm">
              Welcome back, {getDisplayName(user) || user?.email}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-neon-blue/60 focus:ring-1 focus:ring-neon-blue/40 transition"
              />
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* ADD BOOKMARK CARD */}
      <div className="mb-12">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-[0_0_30px_rgba(0,243,255,0.15)]">
          <h2 className="text-lg font-semibold mb-6 text-neon-purple">
            Add New Bookmark
          </h2>

          <form
            onSubmit={handleAddBookmark}
            className="grid md:grid-cols-3 gap-4"
          >
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-purple/60 focus:ring-1 focus:ring-neon-purple/40 transition"
              required
            />

            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-purple/60 focus:ring-1 focus:ring-neon-purple/40 transition"
              required
            />

            <button
              type="submit"
              disabled={adding}
              className="rounded-xl bg-gradient-to-r from-neon-purple to-pink-600 px-6 py-3 font-medium text-white hover:opacity-90 transition disabled:opacity-50"
            >
              {adding ? "Saving..." : "Save"}
            </button>
          </form>
        </div>
      </div>

      {/* BOOKMARK GRID */}
      {loading ? (
        <div className="text-center py-20 text-white/40 animate-pulse">
          Loading bookmarks...
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-16 text-center">
          <h3 className="text-lg font-medium text-white mb-2">
            No bookmarks yet
          </h3>
          <p className="text-white/50 text-sm">
            Start building your digital knowledge hub.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="group bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:border-neon-blue/40 hover:shadow-[0_0_25px_rgba(0,243,255,0.2)] transition-all"
            >
              <h3 className="font-semibold text-lg mb-2 group-hover:text-neon-blue transition">
                {bookmark.title}
              </h3>

              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/50 break-all hover:text-white transition"
              >
                {bookmark.url}
              </a>

              {formatBookmarkDate(bookmark.created_at) && (
                <p className="text-xs text-white/30 mt-2">
                  Saved {formatBookmarkDate(bookmark.created_at)}
                </p>
              )}

              <div className="flex justify-between items-center mt-6">
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neon-blue text-sm hover:underline"
                >
                  Open
                </a>

                <button
                  onClick={() => handleDeleteBookmark(bookmark.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

}

