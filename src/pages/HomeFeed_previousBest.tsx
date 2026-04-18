import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import {
  Search, Plus, Heart, MessageCircle, TrendingUp, Book, Film, Tv,
  Star, MoreHorizontal, Home, Compass, Bookmark, Settings, User,
  Calendar, ChevronRight, Flame, Sparkles, ArrowUpRight, Brain, Sun, Moon,GitBranch
} from "lucide-react";

const HomeFeed = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState("all");
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<number>>(new Set());

  const toggleLike = (id: number) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSave = (id: number) => {
    setSavedPosts(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const sidebarSuggestions = [
    { id: 1, name: "Alex Chen", handle: "@alexchen", initials: "AC", color: "#7c3aed" },
    { id: 2, name: "Sarah Miller", handle: "@sarahm", initials: "SM", color: "#059669" },
    { id: 3, name: "David Kim", handle: "@davidk", initials: "DK", color: "#dc2626" },
  ];

  const sidebarTasks = [
    { id: 1, title: "Calendar & Chat App", progress: 75, color: "#7c3aed", due: "Mar 20" },
    { id: 2, title: "Model Answer", progress: 100, color: "#059669", due: "Done" },
    { id: 3, title: "Figma Design System", progress: 60, color: "#f59e0b", due: "Mar 25" },
  ];

  const trending = [
    { title: "One Piece", emoji: "🏴‍☠️", type: "Manga" },
    { title: "The Witcher", emoji: "⚔️", type: "Series" },
    { title: "Naruto", emoji: "🍃", type: "Anime" },
    { title: "Harry Potter", emoji: "🧙", type: "Book" },
    { title: "Stranger Things", emoji: "🔦", type: "Series" },
  ];

  const mockPosts = [
    {
      id: 1, type: "book", title: "Dune", subtitle: "Frank Herbert · 1965",
      user: "BookLover42", handle: "@booklover42", initials: "BL", avatarColor: "#7c3aed",
      rating: 5,
      review: "A masterpiece of science fiction — the world-building is unmatched. Herbert weaves ecology, religion and power into something that feels genuinely alive. Required reading.",
      likes: 234, comments: 45, timestamp: "2h ago", cover: "🏜️",
      coverBg: "linear-gradient(135deg, #c4a35a 0%, #8b6914 50%, #3d2b0a 100%)",
      tag: "Sci-Fi Classic"
    },
    {
      id: 2, type: "anime", title: "Attack on Titan", subtitle: "MAPPA · 2013–2023",
      user: "AnimeFan99", handle: "@animefan99", initials: "AF", avatarColor: "#dc2626",
      rating: 5,
      review: "The character arcs hit harder than anything I've seen in animation. Every season raises the stakes and the finale lands with real weight. A generational series.",
      likes: 567, comments: 89, timestamp: "5h ago", cover: "⚔️",
      coverBg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      tag: "Anime · Action"
    },
    {
      id: 3, type: "series", title: "Breaking Bad", subtitle: "Vince Gilligan · AMC",
      user: "TVCritic", handle: "@tvcritic", initials: "TC", avatarColor: "#059669",
      rating: 5,
      review: "Walter White's arc is the gold standard. Sharp writing, impeccable pacing, and performances that don't miss a beat. TV storytelling at its ceiling.",
      likes: 892, comments: 156, timestamp: "1d ago", cover: "🎭",
      coverBg: "linear-gradient(135deg, #1c1c1c 0%, #2d4a1e 50%, #1a3a10 100%)",
      tag: "Drama · Crime"
    },
  ];

  const tabs = ["all", "books", "anime", "series"];

  const getTypeIcon = (type: string) => {
    const cls = "w-3.5 h-3.5";
    if (type === "book") return <Book className={cls} />;
    if (type === "anime") return <Film className={cls} />;
    return <Tv className={cls} />;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

        * { box-sizing: border-box; }

        :root {
          ${isDark ? `
          --white: #0a0a0a;
          --ink: #f5f5f5;
          --ink-secondary: #a0a0a0;
          --ink-muted: #6a6a6a;
          --ink-faint: #2a2a2a;
          --surface: #141414;
          --border: #222222;
          --shadow-xs: 0 1px 3px rgba(0,0,0,0.3);
          --shadow-sm: 0 2px 12px rgba(0,0,0,0.4);
          --shadow-md: 0 8px 30px rgba(0,0,0,0.5);
          --shadow-hover: 0 12px 40px rgba(99,44,255,0.15);
          ` : `
          --white: #ffffff;
          --ink: #0d0d0d;
          --ink-secondary: #4a4a4a;
          --ink-muted: #9a9a9a;
          --ink-faint: #e8e8e8;
          --surface: #fafafa;
          --border: #efefef;
          --shadow-xs: 0 1px 3px rgba(0,0,0,0.06);
          --shadow-sm: 0 2px 12px rgba(0,0,0,0.07);
          --shadow-md: 0 8px 30px rgba(0,0,0,0.09);
          --shadow-hover: 0 12px 40px rgba(109,40,217,0.12);
          `}
          --purple: #6d28d9;
          --purple-light: #ede9fe;
          --purple-mid: #8b5cf6;
          --radius-sm: 10px;
          --radius-md: 16px;
          --radius-lg: 22px;
          --radius-xl: 28px;
          --font-serif: 'Instrument Serif', Georgia, serif;
          --font-sans: 'DM Sans', system-ui, sans-serif;
        }

        .sv-root {
          font-family: var(--font-sans);
          background: var(--white);
          min-height: 100vh;
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
        }

        /* ── Sidebar ── */
        .sv-sidebar-left {
          width: 240px;
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border);
          padding: 28px 20px;
          flex-shrink: 0;
        }

        .sv-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 36px;
        }

        .sv-logo-mark {
          width: 34px;
          height: 34px;
          background: var(--purple);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sv-logo-mark span {
          color: white;
          font-family: var(--font-serif);
          font-size: 18px;
          font-style: italic;
          line-height: 1;
        }

        .sv-logo-text {
          font-family: var(--font-serif);
          font-size: 20px;
          letter-spacing: -0.02em;
          color: var(--ink);
        }

        .sv-nav { display: flex; flex-direction: column; gap: 2px; }

        .sv-nav-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 9px 12px;
          border-radius: var(--radius-sm);
          font-size: 14px;
          font-weight: 400;
          color: var(--ink-secondary);
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          width: 100%;
          transition: background 0.15s, color 0.15s;
          letter-spacing: -0.01em;
        }

        .sv-nav-item:hover { background: var(--surface); color: var(--ink); }

        .sv-nav-item.active {
          background: var(--purple);
          color: white;
          font-weight: 500;
        }

        .sv-nav-item.active svg { opacity: 1; }

        .sv-divider {
          height: 1px;
          background: var(--border);
          margin: 20px 0;
        }

        .sv-section-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--ink-muted);
          margin-bottom: 14px;
          padding: 0 4px;
        }

        .sv-suggestion {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .sv-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          color: white;
          flex-shrink: 0;
          letter-spacing: 0.02em;
        }

        .sv-suggestion-info { flex: 1; min-width: 0; }
        .sv-suggestion-name { font-size: 13px; font-weight: 500; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sv-suggestion-handle { font-size: 11px; color: var(--ink-muted); }

        .sv-add-btn {
          font-size: 12px;
          font-weight: 500;
          color: var(--purple);
          background: var(--purple-light);
          border: none;
          padding: 4px 10px;
          border-radius: 20px;
          cursor: pointer;
          transition: background 0.15s;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .sv-add-btn:hover { background: #ddd6fe; }

        /* ── Main ── */
        .sv-main {
          flex: 1;
          max-width: 640px;
          border-right: 1px solid var(--border);
          min-height: 100vh;
        }

        .sv-header {
          position: sticky;
          top: 0;
          background: ${isDark ? 'rgba(10,10,10,0.85)' : 'rgba(255,255,255,0.85)'};
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          z-index: 50;
          padding: 16px 28px;
        }

        .sv-header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sv-greeting {
          display: flex;
          flex-direction: column;
        }

        .sv-greeting-sub {
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--ink-muted);
        }

        .sv-greeting-main {
          font-family: var(--font-serif);
          font-size: 26px;
          letter-spacing: -0.02em;
          color: var(--ink);
          line-height: 1.1;
          margin-top: 1px;
        }

        .sv-header-actions { display: flex; align-items: center; gap: 10px; }

        .sv-search-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .sv-search-wrap svg {
          position: absolute;
          left: 12px;
          color: var(--ink-muted);
          pointer-events: none;
        }

        .sv-search {
          padding: 9px 16px 9px 36px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 100px;
          font-size: 15px;
          font-family: var(--font-sans);
          color: var(--ink);
          outline: none;
          width: 200px;
          transition: border-color 0.2s, box-shadow 0.2s, width 0.3s;
        }

        .sv-search:focus {
          border-color: var(--purple-mid);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.12);
          width: 240px;
        }

        .sv-plus-btn {
          width: 36px;
          height: 36px;
          background: var(--purple);
          color: white;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s, transform 0.15s;
          flex-shrink: 0;
        }

        .sv-plus-btn:hover { background: var(--purple-mid); transform: rotate(90deg); }

        /* ── Theme Toggle ── */
        .sv-theme-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 100px;
          background: var(--surface);
          border: 1px solid var(--border);
          cursor: pointer;
          transition: all 0.2s;
          font-size: 12px;
          font-weight: 500;
          color: var(--ink-secondary);
        }

        .sv-theme-btn:hover {
          border-color: var(--purple-mid);
          background: var(--purple-light);
          color: var(--purple);
        }

        /* ── Tabs ── */
        .sv-tabs {
          display: flex;
          gap: 4px;
          padding: 16px 28px 0;
          border-bottom: 1px solid var(--border);
        }

        .sv-tab {
          padding: 8px 16px;
          font-size: 15px;
          font-weight: 500;
          color: var(--ink-muted);
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s;
          text-transform: capitalize;
          letter-spacing: -0.01em;
        }

        .sv-tab:hover { color: var(--ink); }
        .sv-tab.active { color: var(--ink); border-bottom-color: var(--purple); font-weight: 600; }

        /* ── Trending ── */
        .sv-trending {
          padding: 24px 28px;
          border-bottom: 1px solid var(--border);
        }

        .sv-trending-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .sv-trending-title {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--ink-secondary);
        }

        .sv-trending-more {
          font-size: 12px;
          color: var(--purple);
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 3px;
          font-weight: 500;
          transition: gap 0.15s;
        }

        .sv-trending-more:hover { gap: 6px; }

        .sv-trending-scroll {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
        }

        .sv-trending-scroll::-webkit-scrollbar { display: none; }

        .sv-trending-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 100px;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .sv-trending-chip:hover {
          background: var(--purple);
          border-color: var(--purple);
          color: white;
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }

        .sv-trending-chip:hover .sv-chip-type { color: rgba(255,255,255,0.6); }

        .sv-chip-emoji { font-size: 15px; }
        .sv-chip-title { font-size: 15px; font-weight: 500; color: var(--ink); letter-spacing: -0.01em; }
        .sv-trending-chip:hover .sv-chip-title { color: white; }
        .sv-chip-type { font-size: 11px; color: var(--ink-muted); }

        /* ── Feed ── */
        .sv-feed { padding: 0; }

        .sv-post {
          border-bottom: 1px solid var(--border);
          transition: background 0.2s;
          cursor: pointer;
        }

        .sv-post:hover { background: ${isDark ? '#1a1a1a' : '#fdfdfd'}; }

        .sv-post-inner { padding: 24px 28px; }

        .sv-post-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .sv-post-user { display: flex; align-items: center; gap: 11px; }

        .sv-user-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--ink);
          letter-spacing: -0.01em;
        }

        .sv-user-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 2px;
        }

        .sv-user-handle { font-size: 12px; color: var(--ink-muted); }
        .sv-user-dot { width: 2px; height: 2px; background: var(--ink-muted); border-radius: 50%; }
        .sv-user-time { font-size: 12px; color: var(--ink-muted); }

        .sv-more-btn {
          background: none;
          border: none;
          color: var(--ink-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          display: flex;
          transition: background 0.15s, color 0.15s;
        }

        .sv-more-btn:hover { background: var(--surface); color: var(--ink); }

        .sv-post-cover {
          border-radius: var(--radius-lg);
          height: 200px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding: 16px;
          margin-bottom: 16px;
          position: relative;
          overflow: hidden;
        }

        .sv-cover-noise {
          position: absolute;
          inset: 0;
          opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          pointer-events: none;
        }

        .sv-cover-emoji {
          font-size: 52px;
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));
          line-height: 1;
        }

        .sv-cover-tag {
          background: rgba(255,255,255,0.18);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.25);
          color: white;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.05em;
          padding: 5px 11px;
          border-radius: 100px;
        }

        .sv-post-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .sv-post-title-group {}

        .sv-post-title {
          font-family: var(--font-serif);
          font-size: 24px;
          letter-spacing: -0.02em;
          color: var(--ink);
          line-height: 1.15;
        }

        .sv-post-subtitle {
          font-size: 12px;
          color: var(--ink-muted);
          margin-top: 2px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .sv-stars { display: flex; gap: 2px; }

        .sv-star { color: #f59e0b; }
        .sv-star-empty { color: var(--ink-faint); }

        .sv-review {
          font-size: 16px;
          line-height: 1.65;
          color: ${isDark ? '#c0c0c0' : '#3a3a3a'};
          margin-bottom: 18px;
          letter-spacing: -0.005em;
        }

        .sv-post-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          padding-top: 14px;
          border-top: 1px solid var(--border);
        }

        .sv-action-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 7px 12px;
          border-radius: var(--radius-sm);
          font-size: 15px;
          font-weight: 500;
          color: var(--ink-secondary);
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.15s;
          letter-spacing: -0.01em;
        }

        .sv-action-btn:hover { background: var(--surface); color: var(--ink); }

        .sv-action-btn.liked { color: #e11d48; }
        .sv-action-btn.liked:hover { background: ${isDark ? 'rgba(225,29,72,0.1)' : '#fff1f2'}; }
        .sv-action-btn.saved { color: var(--purple); }
        .sv-action-btn.saved:hover { background: var(--purple-light); }

        .sv-action-spacer { flex: 1; }

        /* ── Right Sidebar ── */
        .sv-sidebar-right {
          width: 300px;
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          padding: 28px 24px;
          flex-shrink: 0;
          overflow-y: auto;
          scrollbar-width: none;
        }

        .sv-sidebar-right::-webkit-scrollbar { display: none; }

        .sv-user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          margin-bottom: 24px;
          cursor: pointer;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .sv-user-profile:hover {
          border-color: var(--purple-mid);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.08);
        }

        .sv-profile-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--purple);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          color: white;
          flex-shrink: 0;
        }

        .sv-profile-name { font-size: 14px; font-weight: 600; color: var(--ink); }
        .sv-profile-handle { font-size: 12px; color: var(--ink-muted); }

        .sv-project-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 14px;
          margin-bottom: 10px;
          transition: border-color 0.15s, box-shadow 0.15s;
          cursor: pointer;
        }

        .sv-project-card:hover {
          border-color: rgba(109,40,217,0.25);
          box-shadow: var(--shadow-xs);
        }

        .sv-project-title {
          font-size: 13px;
          font-weight: 500;
          color: var(--ink);
          margin-bottom: 10px;
          letter-spacing: -0.01em;
          line-height: 1.3;
        }

        .sv-project-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .sv-project-due {
          font-size: 11px;
          font-weight: 500;
          color: var(--ink-muted);
          padding: 2px 8px;
          background: var(--border);
          border-radius: 100px;
        }

        .sv-project-pct { font-size: 11px; font-weight: 600; color: var(--ink-secondary); }

        .sv-progress-track {
          width: 100%;
          height: 3px;
          background: var(--border);
          border-radius: 100px;
          overflow: hidden;
        }

        .sv-progress-fill {
          height: 100%;
          border-radius: 100px;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sv-event-card {
          border-radius: var(--radius-lg);
          padding: 20px;
          background: var(--purple);
          color: white;
          position: relative;
          overflow: hidden;
          margin-top: 4px;
        }

        .sv-event-bg {
          position: absolute;
          top: -30px;
          right: -30px;
          width: 120px;
          height: 120px;
          background: rgba(255,255,255,0.04);
          border-radius: 50%;
        }

        .sv-event-bg2 {
          position: absolute;
          bottom: -20px;
          left: -20px;
          width: 80px;
          height: 80px;
          background: rgba(255,255,255,0.03);
          border-radius: 50%;
        }

        .sv-event-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.6);
          margin-bottom: 10px;
        }

        .sv-event-title {
          font-family: var(--font-serif);
          font-size: 20px;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
          line-height: 1.2;
        }

        .sv-event-desc {
          font-size: 12px;
          color: rgba(255,255,255,0.65);
          line-height: 1.5;
          margin-bottom: 16px;
        }

        .sv-event-btn {
          width: 100%;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.15);
          color: white;
          padding: 9px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
          font-family: var(--font-sans);
          letter-spacing: -0.01em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .sv-event-btn:hover { background: rgba(255,255,255,0.2); }

        .sv-layout {
          display: flex;
          max-width: 1280px;
          margin: 0 auto;
        }

        @keyframes sv-fadein {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .sv-post { animation: sv-fadein 0.4s ease both; }
        .sv-post:nth-child(1) { animation-delay: 0.05s; }
        .sv-post:nth-child(2) { animation-delay: 0.12s; }
        .sv-post:nth-child(3) { animation-delay: 0.19s; }
      `}</style>

      <div className="sv-root">
        <div className="sv-layout">

          {/* Left Sidebar */}
          <aside className="sv-sidebar-left" style={{ display: 'none' }} id="sv-left">
            <div className="sv-logo">
              <div className="sv-logo-mark"><span>S</span></div>
              <span className="sv-logo-text">StoryVerse</span>
            </div>

            <nav className="sv-nav">
              {[
                { icon: <Home size={16} />, label: "Home", active: true },
                { icon: <Compass size={16} />, label: "Explore" },
                { icon: <Bookmark size={16} />, label: "Saved" },
                { icon: <User size={16} />, label: "Profile" },
                { icon: <Settings size={16} />, label: "Settings" },
              ].map(item => (
                <button key={item.label} className={`sv-nav-item ${item.active ? 'active' : ''}`}>
                  {item.icon}
                  {item.label}
                </button>
              ))}
              <button 
                className="sv-nav-item" 
                onClick={() => navigate('/psychology')}
                style={{ marginTop: 8 }}
              >
                <Brain size={16} />
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  Psychology
                  <span style={{ 
                    fontSize: 9, 
                    fontWeight: 600, 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '2px 6px',
                    background: 'var(--purple)',
                    color: 'white',
                    borderRadius: 4
                  }}>AI</span>
                </span>
              </button>
  <button 
    className="sv-nav-item" 
    onClick={() => navigate('/narrative')}
    style={{ marginTop: 4 }}
  >
    <GitBranch size={16} />
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      Narrative
      <span style={{ 
        fontSize: 9, 
        fontWeight: 600, 
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        padding: '2px 6px',
        background: '#0090cc',
        color: 'white',
        borderRadius: 4
      }}>AI</span>
    </span>
  </button>

  <button 
    className="sv-nav-item" 
    onClick={() => navigate('/analytics')}
    style={{ marginTop: 8 }}
  >
    <TrendingUp size={16} />
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      Analytics
      <span style={{ 
        fontSize: 9, 
        fontWeight: 600, 
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        padding: '2px 6px',
        background: '#0090cc',
        color: 'white',
        borderRadius: 4
      }}>AI</span>
    </span>
  </button>

  <button 
    className="sv-nav-item" 
    onClick={() => navigate('/forum')}
    style={{ marginTop: 8 }}
  >
    <MessageCircle size={16} />
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      Forum
      <span style={{ 
        fontSize: 9, 
        fontWeight: 600, 
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        padding: '2px 6px',
        background: '#00cc7d',
        color: 'white',
        borderRadius: 4
      }}>AI</span>
    </span>
  </button>
</nav>

            <div className="sv-divider" />
          </aside>

          {/* Main Feed */}
          <main className="sv-main">
            {/* Header */}
            <header className="sv-header">
              <div className="sv-header-inner">
                <div className="sv-greeting">
                  <span className="sv-greeting-sub">Sunday, March 15</span>
                  <span className="sv-greeting-main">Welcome back</span>
                </div>
                <div className="sv-header-actions">
                  <button className="sv-theme-btn" onClick={toggleTheme}>
                    {isDark ? <Sun size={14} /> : <Moon size={14} />}
                    {isDark ? 'Light' : 'Dark'}
                  </button>
                  <div className="sv-search-wrap">
                    <Search size={14} />
                    <input className="sv-search" type="text" placeholder="Search anything…" />
                  </div>
                  <button className="sv-plus-btn"><Plus size={16} /></button>
                </div>
              </div>

              {/* Tabs */}
              <div className="sv-tabs">
                {tabs.map(tab => (
                  <button
                    key={tab}
                    className={`sv-tab ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === "all" ? "For You" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </header>

            {/* Trending */}
            <section className="sv-trending">
              <div className="sv-trending-header">
                <div className="sv-trending-title">
                  <Flame size={13} style={{ color: '#f59e0b' }} />
                  Trending
                </div>
                <button className="sv-trending-more">
                  See all <ChevronRight size={12} />
                </button>
              </div>
              <div className="sv-trending-scroll">
                {trending.map((t, i) => (
                  <div key={i} className="sv-trending-chip">
                    <span className="sv-chip-emoji">{t.emoji}</span>
                    <div>
                      <div className="sv-chip-title">{t.title}</div>
                      <div className="sv-chip-type">{t.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Posts */}
            <div className="sv-feed">
              {mockPosts.map((post) => (
                <article key={post.id} className="sv-post">
                  <div className="sv-post-inner">
                    {/* User Row */}
                    <div className="sv-post-header">
                      <div className="sv-post-user">
                        <div className="sv-avatar" style={{ background: post.avatarColor, width: 38, height: 38, fontSize: 12 }}>
                          {post.initials}
                        </div>
                        <div>
                          <div className="sv-user-name">{post.user}</div>
                          <div className="sv-user-meta">
                            <span className="sv-user-handle">{post.handle}</span>
                            <span className="sv-user-dot" />
                            <span className="sv-user-time">{post.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      <button className="sv-more-btn"><MoreHorizontal size={16} /></button>
                    </div>

                    {/* Cover */}
                    <div className="sv-post-cover" style={{ background: post.coverBg }}>
                      <div className="sv-cover-noise" />
                      <span className="sv-cover-emoji">{post.cover}</span>
                      <span className="sv-cover-tag">{post.tag}</span>
                    </div>

                    {/* Title + Stars */}
                    <div className="sv-post-meta-row">
                      <div className="sv-post-title-group">
                        <div className="sv-post-title">{post.title}</div>
                        <div className="sv-post-subtitle">
                          {getTypeIcon(post.type)}
                          {post.subtitle}
                        </div>
                      </div>
                      <div className="sv-stars">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={13}
                            className={i < post.rating ? "sv-star" : "sv-star-empty"}
                            fill={i < post.rating ? "#f59e0b" : "none"}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review */}
                    <p className="sv-review">{post.review}</p>

                    {/* Actions */}
                    <div className="sv-post-actions">
                      <button
                        className={`sv-action-btn ${likedPosts.has(post.id) ? 'liked' : ''}`}
                        onClick={() => toggleLike(post.id)}
                      >
                        <Heart
                          size={15}
                          fill={likedPosts.has(post.id) ? "#e11d48" : "none"}
                          stroke={likedPosts.has(post.id) ? "#e11d48" : "currentColor"}
                        />
                        {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                      </button>
                      <button className="sv-action-btn">
                        <MessageCircle size={15} />
                        {post.comments}
                      </button>
                      <div className="sv-action-spacer" />
                      <button
                        className={`sv-action-btn ${savedPosts.has(post.id) ? 'saved' : ''}`}
                        onClick={() => toggleSave(post.id)}
                      >
                        <Bookmark
                          size={15}
                          fill={savedPosts.has(post.id) ? "var(--purple)" : "none"}
                          stroke={savedPosts.has(post.id) ? "var(--purple)" : "currentColor"}
                        />
                        {savedPosts.has(post.id) ? "Saved" : "Save"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="sv-sidebar-right">
            {/* Profile */}
            <div className="sv-user-profile">
              <div className="sv-profile-avatar">ME</div>
              <div>
                <div className="sv-profile-name">Your Profile</div>
                <div className="sv-profile-handle">@yourusername</div>
              </div>
              <ArrowUpRight size={14} style={{ marginLeft: 'auto', color: 'var(--ink-muted)' }} />
            </div>



            {/* Suggestions */}
            <div className="sv-divider" style={{ margin: '20px 0 16px' }} />
            <p className="sv-section-label">People to follow</p>
            {sidebarSuggestions.map(s => (
              <div key={s.id} className="sv-suggestion" style={{ marginBottom: 14 }}>
                <div className="sv-avatar" style={{ background: s.color, width: 34, height: 34, fontSize: 11 }}>{s.initials}</div>
                <div className="sv-suggestion-info">
                  <div className="sv-suggestion-name">{s.name}</div>
                  <div className="sv-suggestion-handle">{s.handle}</div>
                </div>
                <button className="sv-add-btn">+Follow</button>
              </div>
            ))}

            {/* Event Card */}
            <div className="sv-divider" style={{ margin: '20px 0 16px' }} />
            <p className="sv-section-label" style={{ marginBottom: 12 }}>Featured Event</p>
            <div className="sv-event-card">
              <div className="sv-event-bg" />
              <div className="sv-event-bg2" />
              <div className="sv-event-badge"><Calendar size={10} /> Upcoming</div>
              <div className="sv-event-title">New Market Night</div>
              <p className="sv-event-desc">An evening of creativity, books, and storytelling with fellow enthusiasts.</p>
              <button className="sv-event-btn">
                <Sparkles size={13} /> Learn More
              </button>
            </div>
          </aside>

        </div>
      </div>

      {/* Show sidebars via JS (they're hidden by default for layout purposes in React) */}
      <style>{`
        @media (min-width: 1024px) {
          #sv-left { display: flex !important; }
        }
      `}</style>
    </>
  );
};

export default HomeFeed;