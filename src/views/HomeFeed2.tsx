import { useState } from "react";
import {
  Search, Plus, Heart, MessageCircle, Book, Film, Tv,
  Star, MoreHorizontal, Home, Compass, Bookmark, Settings, User,
  Calendar, Sparkles, ArrowRight, Flame
} from "lucide-react";

const HomeFeed = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<number>>(new Set());

  const toggleLike = (id: number) => {
    setLikedPosts(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleSave = (id: number) => {
    setSavedPosts(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const suggestions = [
    { id: 1, name: "Alex Chen", handle: "@alexchen", initials: "AC", color: "#5b21b6" },
    { id: 2, name: "Sarah Miller", handle: "@sarahm", initials: "SM", color: "#065f46" },
    { id: 3, name: "David Kim", handle: "@davidk", initials: "DK", color: "#92400e" },
  ];

  const trending = [
    { title: "One Piece", emoji: "🏴‍☠️", vol: "Vol. 106" },
    { title: "The Witcher", emoji: "⚔️", vol: "S3" },
    { title: "Naruto", emoji: "🍃", vol: "Finale" },
    { title: "Harry Potter", emoji: "🧙", vol: "Book 7" },
    { title: "Stranger Things", emoji: "🔦", vol: "S4" },
  ];

  const mockPosts = [
    {
      id: 1, type: "book",
      title: "Dune",
      subtitle: "Frank Herbert",
      year: "1965",
      user: "BookLover42", handle: "@booklover42", initials: "BL", avatarColor: "#5b21b6",
      rating: 5,
      pullQuote: "The politics of ecology played out on a desert world.",
      review: "Herbert weaves ecology, religion and power into something that feels genuinely alive. The world-building is unmatched — every detail serves the whole. Required reading.",
      likes: 234, comments: 45, timestamp: "2h ago",
      cover: "🏜️",
      coverBg: "linear-gradient(160deg, #c4a35a 0%, #8b6914 45%, #2d1a05 100%)",
      label: "SCI-FI",
      issue: "Issue 41"
    },
    {
      id: 2, type: "anime",
      title: "Attack on Titan",
      subtitle: "MAPPA Studio",
      year: "2013",
      user: "AnimeFan99", handle: "@animefan99", initials: "AF", avatarColor: "#dc2626",
      rating: 5,
      pullQuote: "Freedom costs everything. Pay it anyway.",
      review: "Every season raises the stakes. The finale lands with real weight — rare for a series this long. A generational piece of animation that earns its reputation.",
      likes: 567, comments: 89, timestamp: "5h ago",
      cover: "⚔️",
      coverBg: "linear-gradient(160deg, #1a1a2e 0%, #16213e 45%, #533483 100%)",
      label: "ANIME",
      issue: "Issue 39"
    },
    {
      id: 3, type: "series",
      title: "Breaking Bad",
      subtitle: "Vince Gilligan",
      year: "2008",
      user: "TVCritic", handle: "@tvcritic", initials: "TC", avatarColor: "#065f46",
      rating: 5,
      pullQuote: "I am the danger. I am the one who knocks.",
      review: "Walter White's arc is the gold standard of prestige TV. Sharp writing, impeccable pacing, and performances that never miss. TV storytelling at its absolute ceiling.",
      likes: 892, comments: 156, timestamp: "1d ago",
      cover: "🎭",
      coverBg: "linear-gradient(160deg, #111 0%, #1a2e1a 45%, #2d4a1e 100%)",
      label: "SERIES",
      issue: "Issue 33"
    },
  ];

  const tabs = [
    { key: "all", label: "For You" },
    { key: "books", label: "Books" },
    { key: "anime", label: "Anime" },
    { key: "series", label: "Series" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&family=Syne:wght@400;500;600;700;800&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --white: #ffffff;
          --paper: #faf9f7;
          --ink: #111010;
          --ink-2: #3a3a38;
          --ink-3: #7a7a76;
          --ink-4: #c8c8c2;
          --rule: #e4e3de;
          --purple: #5b21b6;
          --purple-soft: #ede9fe;
          --purple-mid: #7c3aed;
          --ff-display: 'Playfair Display', Georgia, serif;
          --ff-sans: 'Syne', system-ui, sans-serif;
          --ff-body: 'Lora', Georgia, serif;
        }

        .sv { font-family: var(--ff-sans); background: var(--paper); min-height: 100vh; color: var(--ink); -webkit-font-smoothing: antialiased; }

        .sv-wrap { display: flex; max-width: 1300px; margin: 0 auto; }

        /* LEFT NAV — book spine */
        .sv-nav {
          width: 220px;
          flex-shrink: 0;
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          padding: 32px 0 32px 24px;
          border-right: 2px solid var(--ink);
        }

        .sv-logo { display: flex; align-items: flex-start; gap: 0; margin-bottom: 48px; padding-right: 20px; }
        .sv-logo-rule { width: 4px; height: 52px; background: var(--purple); border-radius: 2px; flex-shrink: 0; margin-right: 12px; margin-top: 2px; }
        .sv-logo-text { font-family: var(--ff-display); font-size: 26px; font-weight: 900; line-height: 1; letter-spacing: -0.03em; color: var(--ink); }
        .sv-logo-tagline { font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); margin-top: 4px; }

        .sv-nav-items { display: flex; flex-direction: column; gap: 0; }

        .sv-nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 16px 11px 0;
          font-size: 13px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase;
          color: var(--ink-3); background: none; border: none; cursor: pointer; text-align: left;
          border-bottom: 1px solid var(--rule); transition: color 0.15s; width: 100%;
        }
        .sv-nav-item:first-child { border-top: 1px solid var(--rule); }
        .sv-nav-item:hover { color: var(--ink); }
        .sv-nav-item.active { color: var(--ink); }
        .sv-nav-item.active .sv-nav-icon { color: var(--purple); }
        .sv-nav-icon { display: flex; align-items: center; }

        .sv-nav-bottom { margin-top: auto; padding-right: 20px; }
        .sv-nav-profile { display: flex; align-items: center; gap: 10px; padding: 12px 0; border-top: 2px solid var(--ink); cursor: pointer; }
        .sv-profile-chip { width: 34px; height: 34px; background: var(--ink); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: white; flex-shrink: 0; }
        .sv-profile-name { font-size: 13px; font-weight: 700; color: var(--ink); }
        .sv-profile-handle { font-size: 11px; color: var(--ink-3); margin-top: 1px; }

        /* MAIN */
        .sv-main { flex: 1; min-width: 0; border-right: 2px solid var(--ink); }

        .sv-header {
          position: sticky; top: 0; z-index: 50;
          background: rgba(250,249,247,0.94); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border-bottom: 2px solid var(--ink); padding: 0 32px;
        }

        .sv-header-top { display: flex; align-items: center; justify-content: space-between; padding: 16px 0 14px; border-bottom: 1px solid var(--rule); }

        .sv-masthead { display: flex; align-items: baseline; gap: 16px; }
        .sv-masthead-title { font-family: var(--ff-display); font-size: 28px; font-weight: 900; letter-spacing: -0.04em; color: var(--ink); line-height: 1; }
        .sv-masthead-edition { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); border-left: 2px solid var(--rule); padding-left: 14px; }

        .sv-header-right { display: flex; align-items: center; gap: 10px; }

        .sv-search-pill { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: var(--white); border: 1.5px solid var(--ink-4); border-radius: 100px; transition: border-color 0.2s, box-shadow 0.2s; }
        .sv-search-pill:focus-within { border-color: var(--purple); box-shadow: 0 0 0 3px rgba(91,33,182,0.1); }
        .sv-search-pill input { border: none; background: none; outline: none; font-family: var(--ff-sans); font-size: 13px; color: var(--ink); width: 160px; }
        .sv-search-pill input::placeholder { color: var(--ink-3); }

        .sv-compose { display: flex; align-items: center; gap: 7px; padding: 8px 16px; background: var(--ink); color: white; border: none; border-radius: 100px; font-family: var(--ff-sans); font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; transition: background 0.15s, transform 0.15s; }
        .sv-compose:hover { background: var(--purple); transform: translateY(-1px); }

        .sv-tabs { display: flex; gap: 0; overflow-x: auto; scrollbar-width: none; }
        .sv-tabs::-webkit-scrollbar { display: none; }
        .sv-tab { padding: 12px 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); background: none; border: none; border-right: 1px solid var(--rule); cursor: pointer; transition: color 0.15s, background 0.15s; white-space: nowrap; }
        .sv-tab:hover { color: var(--ink); background: rgba(0,0,0,0.02); }
        .sv-tab.active { color: var(--white); background: var(--ink); }

        /* Trending ticker */
        .sv-ticker { border-bottom: 2px solid var(--ink); display: flex; align-items: stretch; overflow: hidden; }
        .sv-ticker-label { flex-shrink: 0; display: flex; align-items: center; gap: 7px; padding: 9px 16px; background: var(--purple); color: white; font-size: 10px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; border-right: 2px solid var(--ink); }
        .sv-ticker-scroll { display: flex; gap: 0; overflow-x: auto; scrollbar-width: none; flex: 1; }
        .sv-ticker-scroll::-webkit-scrollbar { display: none; }
        .sv-ticker-item { display: flex; align-items: center; gap: 8px; padding: 9px 20px; font-size: 12px; font-weight: 600; color: var(--ink-2); border-right: 1px solid var(--rule); white-space: nowrap; cursor: pointer; transition: background 0.15s; flex-shrink: 0; }
        .sv-ticker-item:hover { background: var(--white); color: var(--ink); }
        .sv-ticker-vol { font-size: 10px; font-weight: 700; letter-spacing: 0.06em; color: var(--ink-3); padding: 2px 7px; border: 1px solid var(--rule); border-radius: 3px; }

        /* POST CARDS */
        .sv-feed { }
        .sv-post { border-bottom: 2px solid var(--ink); transition: background 0.2s; }
        .sv-post:hover { background: var(--white); }

        .sv-post-grid { display: grid; grid-template-columns: 1fr 240px; min-height: 280px; }
        .sv-post-left { padding: 28px 28px 24px; display: flex; flex-direction: column; }

        .sv-post-label { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .sv-label-stamp { font-size: 10px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; padding: 4px 10px; border: 1.5px solid var(--purple); border-radius: 3px; color: var(--purple); background: none; }
        .sv-label-issue { font-size: 11px; color: var(--ink-3); font-weight: 500; }

        .sv-post-user { display: flex; align-items: center; gap: 9px; margin-bottom: 20px; }
        .sv-avatar-ring { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: white; flex-shrink: 0; border: 2px solid var(--ink); }
        .sv-user-name { font-size: 13px; font-weight: 700; color: var(--ink); }
        .sv-user-meta { display: flex; gap: 8px; margin-top: 1px; }
        .sv-user-handle { font-size: 11px; color: var(--ink-3); }
        .sv-user-time { font-size: 11px; color: var(--ink-3); }

        .sv-more { margin-left: auto; background: none; border: none; color: var(--ink-3); cursor: pointer; padding: 4px; display: flex; border-radius: 4px; transition: color 0.15s; }
        .sv-more:hover { color: var(--ink); }

        .sv-pull-quote { font-family: var(--ff-display); font-size: 22px; font-style: italic; font-weight: 700; line-height: 1.25; letter-spacing: -0.02em; color: var(--ink); border-left: 4px solid var(--purple); padding-left: 16px; margin-bottom: 14px; flex: 1; }
        .sv-review-text { font-family: var(--ff-body); font-size: 13.5px; line-height: 1.7; color: var(--ink-2); margin-bottom: 20px; }

        .sv-post-actions { display: flex; align-items: center; gap: 4px; padding-top: 16px; border-top: 1px solid var(--rule); }
        .sv-act { display: flex; align-items: center; gap: 6px; padding: 6px 12px; font-size: 12px; font-weight: 700; letter-spacing: 0.04em; color: var(--ink-3); background: none; border: 1.5px solid transparent; border-radius: 100px; cursor: pointer; transition: all 0.15s; font-family: var(--ff-sans); }
        .sv-act:hover { border-color: var(--ink-4); color: var(--ink); background: var(--white); }
        .sv-act.liked { color: #dc2626; border-color: #fecaca; background: #fff5f5; }
        .sv-act.saved { color: var(--purple); border-color: #ddd6fe; background: var(--purple-soft); }
        .sv-act-spacer { flex: 1; }
        .sv-stars { display: flex; gap: 2px; }

        /* Cover panel */
        .sv-post-right { border-left: 2px solid var(--ink); position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; padding: 20px; }
        .sv-cover-bg { position: absolute; inset: 0; }
        .sv-cover-noise { position: absolute; inset: 0; opacity: 0.06; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
        .sv-cover-year { position: relative; z-index: 2; font-family: var(--ff-display); font-size: 72px; font-weight: 900; color: rgba(255,255,255,0.12); line-height: 1; letter-spacing: -0.04em; align-self: flex-start; }
        .sv-cover-bottom { position: relative; z-index: 2; text-align: right; }
        .sv-cover-emoji { font-size: 56px; display: block; margin-bottom: 8px; filter: drop-shadow(0 6px 16px rgba(0,0,0,0.4)); }
        .sv-cover-title { font-family: var(--ff-display); font-size: 17px; font-weight: 700; color: white; line-height: 1.2; text-shadow: 0 1px 4px rgba(0,0,0,0.4); }
        .sv-cover-author { font-size: 11px; color: rgba(255,255,255,0.65); margin-top: 3px; }

        /* RIGHT SIDEBAR */
        .sv-aside { width: 280px; flex-shrink: 0; height: 100vh; position: sticky; top: 0; overflow-y: auto; scrollbar-width: none; }
        .sv-aside::-webkit-scrollbar { display: none; }

        .sv-aside-header { padding: 20px 20px 16px; border-bottom: 2px solid var(--ink); position: sticky; top: 0; background: var(--paper); z-index: 10; }
        .sv-aside-title { font-size: 10px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-3); margin-bottom: 12px; }
        .sv-search-aside { display: flex; align-items: center; gap: 8px; padding: 9px 13px; background: var(--white); border: 1.5px solid var(--ink); border-radius: 4px; transition: border-color 0.2s; }
        .sv-search-aside:focus-within { border-color: var(--purple); }
        .sv-search-aside input { border: none; background: none; outline: none; font-family: var(--ff-sans); font-size: 12px; color: var(--ink); width: 100%; }
        .sv-search-aside input::placeholder { color: var(--ink-3); }

        .sv-aside-section { padding: 20px; border-bottom: 1px solid var(--rule); }
        .sv-aside-section-label { font-size: 10px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .sv-aside-section-label::after { content: ''; flex: 1; height: 1px; background: var(--rule); }

        .sv-suggest { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .sv-suggest:last-child { margin-bottom: 0; }
        .sv-suggest-avatar { width: 36px; height: 36px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: white; flex-shrink: 0; }
        .sv-suggest-name { font-size: 13px; font-weight: 700; color: var(--ink); }
        .sv-suggest-handle { font-size: 11px; color: var(--ink-3); margin-top: 1px; }
        .sv-follow-btn { margin-left: auto; padding: 5px 12px; font-size: 11px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: var(--purple); background: var(--purple-soft); border: 1.5px solid var(--purple); border-radius: 3px; cursor: pointer; transition: all 0.15s; flex-shrink: 0; font-family: var(--ff-sans); }
        .sv-follow-btn:hover { background: var(--purple); color: white; }

        .sv-event { margin: 20px; border: 2px solid var(--ink); border-radius: 4px; overflow: hidden; }
        .sv-event-head { background: var(--ink); padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; }
        .sv-event-label { font-size: 10px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.6); display: flex; align-items: center; gap: 6px; }
        .sv-event-date { font-size: 11px; font-weight: 700; color: var(--purple-soft); padding: 2px 8px; background: var(--purple); border-radius: 2px; }
        .sv-event-body { padding: 16px; }
        .sv-event-title { font-family: var(--ff-display); font-size: 20px; font-weight: 900; letter-spacing: -0.02em; color: var(--ink); line-height: 1.15; margin-bottom: 8px; }
        .sv-event-desc { font-family: var(--ff-body); font-size: 13px; color: var(--ink-2); line-height: 1.55; margin-bottom: 14px; }
        .sv-event-btn { display: flex; align-items: center; gap: 8px; padding: 9px 14px; background: var(--ink); color: white; border: none; border-radius: 3px; font-family: var(--ff-sans); font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; width: 100%; justify-content: center; transition: background 0.15s; }
        .sv-event-btn:hover { background: var(--purple); }

        @keyframes sv-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .sv-post { animation: sv-in 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .sv-post:nth-child(1) { animation-delay: 0.06s; }
        .sv-post:nth-child(2) { animation-delay: 0.14s; }
        .sv-post:nth-child(3) { animation-delay: 0.22s; }

        @media (max-width: 1100px) { .sv-nav { display: none; } .sv-aside { display: none; } }
      `}</style>

      <div className="sv">
        <div className="sv-wrap">

          {/* Left Nav */}
          <nav className="sv-nav">
            <div className="sv-logo">
              <div className="sv-logo-rule" />
              <div>
                <div className="sv-logo-text">Story<br/>Verse</div>
                <div className="sv-logo-tagline">Culture Feed</div>
              </div>
            </div>
            <div className="sv-nav-items">
              {[
                { icon: <Home size={15} />, label: "Home", active: true },
                { icon: <Compass size={15} />, label: "Explore" },
                { icon: <Bookmark size={15} />, label: "Saved" },
                { icon: <User size={15} />, label: "Profile" },
                { icon: <Settings size={15} />, label: "Settings" },
              ].map(item => (
                <button key={item.label} className={`sv-nav-item ${item.active ? 'active' : ''}`}>
                  <span className="sv-nav-icon">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
            <div className="sv-nav-bottom">
              <div className="sv-nav-profile">
                <div className="sv-profile-chip">ME</div>
                <div>
                  <div className="sv-profile-name">Your Name</div>
                  <div className="sv-profile-handle">@handle</div>
                </div>
              </div>
            </div>
          </nav>

          {/* Main */}
          <main className="sv-main">
            <header className="sv-header">
              <div className="sv-header-top">
                <div className="sv-masthead">
                  <h1 className="sv-masthead-title">The Daily Feed</h1>
                  <span className="sv-masthead-edition">Sunday · March 15, 2026</span>
                </div>
                <div className="sv-header-right">
                  <div className="sv-search-pill">
                    <Search size={13} color="var(--ink-3)" />
                    <input type="text" placeholder="Search reviews…" />
                  </div>
                  <button className="sv-compose">
                    <Plus size={13} /> Review
                  </button>
                </div>
              </div>
              <div className="sv-tabs">
                {tabs.map(t => (
                  <button key={t.key} className={`sv-tab ${activeTab === t.key ? 'active' : ''}`}
                    onClick={() => setActiveTab(t.key)}>{t.label}</button>
                ))}
              </div>
            </header>

            {/* Ticker */}
            <div className="sv-ticker">
              <div className="sv-ticker-label"><Flame size={11} /> Trending</div>
              <div className="sv-ticker-scroll">
                {trending.map((t, i) => (
                  <div key={i} className="sv-ticker-item">
                    {t.emoji} {t.title}
                    <span className="sv-ticker-vol">{t.vol}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feed */}
            <div className="sv-feed">
              {mockPosts.map((post) => (
                <article key={post.id} className="sv-post">
                  <div className="sv-post-grid">
                    <div className="sv-post-left">
                      <div className="sv-post-label">
                        <span className="sv-label-stamp">{post.label}</span>
                        <span className="sv-label-issue">{post.issue}</span>
                        <button className="sv-more"><MoreHorizontal size={15} /></button>
                      </div>
                      <div className="sv-post-user">
                        <div className="sv-avatar-ring" style={{ background: post.avatarColor }}>{post.initials}</div>
                        <div>
                          <div className="sv-user-name">{post.user}</div>
                          <div className="sv-user-meta">
                            <span className="sv-user-handle">{post.handle}</span>
                            <span className="sv-user-time">· {post.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      <p className="sv-pull-quote">"{post.pullQuote}"</p>
                      <p className="sv-review-text">{post.review}</p>
                      <div className="sv-post-actions">
                        <button className={`sv-act ${likedPosts.has(post.id) ? 'liked' : ''}`} onClick={() => toggleLike(post.id)}>
                          <Heart size={13} fill={likedPosts.has(post.id) ? "#dc2626" : "none"} stroke={likedPosts.has(post.id) ? "#dc2626" : "currentColor"} />
                          {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                        </button>
                        <button className="sv-act"><MessageCircle size={13} /> {post.comments}</button>
                        <button className={`sv-act ${savedPosts.has(post.id) ? 'saved' : ''}`} onClick={() => toggleSave(post.id)}>
                          <Bookmark size={13} fill={savedPosts.has(post.id) ? "var(--purple)" : "none"} stroke={savedPosts.has(post.id) ? "var(--purple)" : "currentColor"} />
                          {savedPosts.has(post.id) ? "Saved" : "Save"}
                        </button>
                        <div className="sv-act-spacer" />
                        <div className="sv-stars">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} fill={i < post.rating ? "#f59e0b" : "none"} stroke={i < post.rating ? "#f59e0b" : "var(--ink-4)"} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="sv-post-right">
                      <div className="sv-cover-bg" style={{ background: post.coverBg }} />
                      <div className="sv-cover-noise" />
                      <div className="sv-cover-year">{post.year}</div>
                      <div className="sv-cover-bottom">
                        <span className="sv-cover-emoji">{post.cover}</span>
                        <div className="sv-cover-title">{post.title}</div>
                        <div className="sv-cover-author">{post.subtitle}</div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="sv-aside">
            <div className="sv-aside-header">
              <div className="sv-aside-title">Discover</div>
              <div className="sv-search-aside">
                <Search size={12} color="var(--ink-3)" />
                <input type="text" placeholder="Search people, titles…" />
              </div>
            </div>
            <div className="sv-aside-section">
              <div className="sv-aside-section-label">People to Follow</div>
              {suggestions.map(s => (
                <div key={s.id} className="sv-suggest">
                  <div className="sv-suggest-avatar" style={{ background: s.color }}>{s.initials}</div>
                  <div>
                    <div className="sv-suggest-name">{s.name}</div>
                    <div className="sv-suggest-handle">{s.handle}</div>
                  </div>
                  <button className="sv-follow-btn">+ Follow</button>
                </div>
              ))}
            </div>
            <div className="sv-event">
              <div className="sv-event-head">
                <div className="sv-event-label"><Calendar size={11} /> Featured Event</div>
                <div className="sv-event-date">Mar 22</div>
              </div>
              <div className="sv-event-body">
                <div className="sv-event-title">New Market Night</div>
                <p className="sv-event-desc">An evening of creativity, books, and storytelling with fellow enthusiasts.</p>
                <button className="sv-event-btn"><Sparkles size={12} /> Learn More <ArrowRight size={12} /></button>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </>
  );
};

export default HomeFeed;
