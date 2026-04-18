import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import api from "../services/api";
import {
  Search, Plus, Brain, TrendingUp, MessageCircle,
  Home, Bookmark, Settings, User,
  Sun, Moon, GitBranch, ArrowUpRight, ChevronRight, Heart, MoreHorizontal, UserPlus
} from "lucide-react";

interface UserPost {
  id: string;
  type: 'text' | 'image';
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  liked?: boolean;
  saved?: boolean;
}

interface UserProfile {
  username: string;
  bio: string;
  avatar: string;
  posts: UserPost[];
}

const HomeFeed = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [userPosts, setUserPosts] = useState<any[]>([]);

  // Load user profile from API
  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      try {
        const response = await api.profile.getCurrentProfile();
        setUserProfile(response.user);
      } catch (error) {
        console.error('Failed to fetch current user profile:', error);
        // Don't set error here, just continue without user profile
      }
    };

    fetchCurrentUserProfile();
  }, []);

  // Fetch user posts when userProfile is available
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!userProfile) return;
      
      try {
        const response = await api.posts.getUserPosts(userProfile.username);
        setUserPosts(response.posts || []);
      } catch (error) {
        console.error('Failed to fetch user posts:', error);
      }
    };

    fetchUserPosts();
  }, [userProfile]);

  // Fetch suggested users
  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        const response = await api.profile.getSuggestedUsers(5);
        console.log('Suggested users response:', response);
        setSuggestedUsers(response.users || []);
      } catch (error) {
        console.error('Failed to fetch suggested users:', error);
        setSuggestedUsers([]);
      }
    };

    fetchSuggestedUsers();
  }, []);

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
  };

  const toggleSave = (postId: string) => {
    setSavedPosts(prev => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
  };

  const handleFollow = async (username: string) => {
    try {
      await api.profile.followUser(username);
      setFollowing(prev => new Set([...prev, username]));
      // Refresh suggested users to update follow status
      const response = await api.profile.getSuggestedUsers(5);
      setSuggestedUsers(response.users || []);
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  const features = [
    {
      icon: <Brain size={18} />,
      label: "Psychology",
      badge: "AI",
      badgeColor: "#6d28d9",
      description: "Explore character psychology and narrative analysis through AI-powered tools.",
      route: "/psychology",
      accent: "#6d28d9",
      accentLight: isDark ? "rgba(109,40,217,0.12)" : "#ede9fe",
    },
    {
      icon: <GitBranch size={18} />,
      label: "Narrative",
      badge: "NEW",
      badgeColor: "#059669",
      description: "Visualize story structures and narrative flows with interactive diagrams.",
      route: "/narrative",
      accent: "#059669",
      accentLight: isDark ? "rgba(5,150,105,0.12)" : "#d1fae5",
    },
    {
      icon: <TrendingUp size={18} />,
      label: "Analytics",
      badge: "PRO",
      badgeColor: "#dc2626",
      description: "Track your reading patterns and get personalized insights into your story preferences.",
      route: "/analytics",
      accent: "#dc2626",
      accentLight: isDark ? "rgba(220,38,38,0.12)" : "#fee2e2",
    },
    {
      icon: <MessageCircle size={18} />,
      label: "Forum",
      badge: "HOT",
      badgeColor: "#7c3aed",
      description: "Join discussions with fellow readers and share your theories about your favorite stories.",
      route: "/forum",
      accent: "#7c3aed",
      accentLight: isDark ? "rgba(124,58,237,0.12)" : "#ede9fe",
    },
  ];

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
          `}
          --purple: #6d28d9;
          --purple-light: #ede9fe;
          --purple-mid: #8b5cf6;
          --radius-sm: 10px;
          --radius-md: 16px;
          --radius-lg: 22px;
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

        .sv-layout {
          display: grid;
          grid-template-columns: 220px 1fr 320px;
          min-height: 100vh;
        }

        .sv-sidebar-left {
          background: var(--surface);
          border-right: 1px solid var(--border);
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .sv-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: var(--font-serif);
          font-size: 20px;
          font-weight: 600;
          color: var(--ink);
        }

        .sv-logo-mark {
          width: 32px;
          height: 32px;
          background: var(--purple);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
        }

        .sv-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sv-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          color: var(--ink-secondary);
          text-decoration: none;
          transition: all 0.15s;
          font-size: 14px;
          font-weight: 500;
        }

        .sv-nav-item:hover {
          background: var(--surface);
          color: var(--ink);
        }

        .sv-nav-item.active {
          background: var(--purple);
          color: white;
        }

        .sv-main {
          padding: 32px 48px;
          overflow-y: auto;
        }

        .sv-header {
          margin-bottom: 32px;
        }

        .sv-header-title {
          font-family: var(--font-serif);
          font-size: 32px;
          font-weight: 600;
          color: var(--ink);
          letter-spacing: -0.02em;
          margin-bottom: 8px;
        }

        .sv-header-subtitle {
          font-size: 16px;
          color: var(--ink-secondary);
          line-height: 1.6;
        }

        .sv-features-area {
          margin-bottom: 48px;
        }

        .sv-feature-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .sv-feature-card {
          padding: 24px;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          background: var(--white);
          cursor: pointer;
          transition: all 0.2s;
        }

        .sv-feature-card:hover {
          border-color: var(--feature-accent, var(--purple));
          box-shadow: var(--shadow-sm);
          transform: translateY(-2px);
        }

        .sv-feature-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .sv-feature-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sv-feature-label {
          font-size: 16px;
          font-weight: 600;
          color: var(--ink);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sv-feature-badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 600;
          color: white;
        }

        .sv-feature-desc {
          font-size: 13px;
          color: var(--ink-secondary);
          line-height: 1.5;
        }

        .sv-feature-cta {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-weight: 500;
          border: none;
          background: none;
          cursor: pointer;
          transition: all 0.15s;
        }

        .sv-feature-cta:hover {
          background: var(--surface);
        }

        .sv-user-posts-area {
          margin-bottom: 48px;
        }

        .sv-posts-intro {
          margin-bottom: 24px;
        }

        .sv-posts-eyebrow {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--ink-muted);
          margin-bottom: 8px;
        }

        .sv-posts-heading {
          font-family: var(--font-serif);
          font-size: 24px;
          font-weight: 600;
          color: var(--ink);
          letter-spacing: -0.02em;
          margin-bottom: 8px;
        }

        .sv-posts-subheading {
          font-size: 15px;
          color: var(--ink-secondary);
          line-height: 1.6;
        }

        .sv-posts-feed {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .sv-user-post {
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px;
          background: var(--white);
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .sv-user-post:hover {
          border-color: var(--purple-mid);
          box-shadow: var(--shadow-sm);
        }

        .sv-user-post-inner {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .sv-user-post-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sv-user-post-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sv-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--purple);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          color: white;
        }

        .sv-user-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--ink);
        }

        .sv-user-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--ink-muted);
        }

        .sv-user-handle {
          font-weight: 500;
        }

        .sv-user-dot {
          width: 2px;
          height: 2px;
          background: var(--ink-muted);
          border-radius: 50%;
        }

        .sv-user-post-content {
          margin-bottom: 16px;
        }

        .sv-user-post-text {
          font-size: 15px;
          color: var(--ink);
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .sv-user-post-image {
          width: 100%;
          max-width: 400px;
          border-radius: var(--radius-md);
        }

        .sv-user-post-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }

        .sv-action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-weight: 500;
          color: var(--ink-secondary);
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.15s;
        }

        .sv-action-btn:hover {
          background: var(--surface);
          color: var(--ink);
        }

        .sv-action-btn.liked {
          color: #e11d48;
        }

        .sv-action-btn.liked:hover {
          background: ${isDark ? 'rgba(225,29,72,0.1)' : '#fff1f2'};
        }

        .sv-action-btn.saved {
          color: var(--purple);
        }

        .sv-action-btn.saved:hover {
          background: var(--purple-light);
        }

        .sv-action-spacer {
          flex: 1;
        }

        .sv-sidebar-right {
          background: var(--surface);
          border-left: 1px solid var(--border);
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .sv-user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: var(--radius-md);
          background: var(--white);
          border: 1px solid var(--border);
          cursor: pointer;
          transition: all 0.15s;
          text-decoration: none;
          color: var(--ink);
        }

        .sv-user-profile:hover {
          border-color: var(--purple);
          box-shadow: var(--shadow-sm);
        }

        .sv-profile-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--purple);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: white;
        }

        .sv-profile-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--ink);
        }

        .sv-profile-handle {
          font-size: 12px;
          color: var(--ink-muted);
        }

        .sv-quick-access {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .sv-quick-access-header {
          padding: 16px 18px 12px;
          border-bottom: 1px solid var(--border);
        }

        .sv-quick-access-title {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: var(--ink-muted);
        }

        .sv-quick-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 18px;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          transition: background 0.15s;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
        }

        .sv-quick-item:last-child {
          border-bottom: none;
        }

        .sv-quick-item:hover {
          background: var(--surface);
        }

        .sv-quick-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sv-quick-label {
          flex: 1;
          font-size: 13px;
          font-weight: 500;
          color: var(--ink);
        }

        .sv-quick-arrow {
          color: var(--ink-muted);
          transition: transform 0.15s;
        }

        .sv-quick-item:hover .sv-quick-arrow {
          transform: translate(2px, -2px);
        }

        .sv-more-btn {
          padding: 6px;
          border-radius: var(--radius-sm);
          background: none;
          border: none;
          color: var(--ink-muted);
          cursor: pointer;
          transition: all 0.15s;
        }

        .sv-more-btn:hover {
          background: var(--surface);
          color: var(--ink);
        }

        /* Suggested Accounts Styles */
        .sv-suggested-accounts {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          margin-top: 16px;
        }

        .sv-suggested-header {
          padding: 16px 18px 12px;
          border-bottom: 1px solid var(--border);
        }

        .sv-suggested-title {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: var(--ink-muted);
        }

        .sv-suggested-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 18px;
          border-bottom: 1px solid var(--border);
        }

        .sv-suggested-item:last-child {
          border-bottom: none;
        }

        .sv-suggested-user {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          cursor: pointer;
          padding: 4px;
          border-radius: var(--radius-sm);
          transition: background 0.15s;
          border: none;
          background: none;
          text-align: left;
        }

        .sv-suggested-user:hover {
          background: ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)'};
        }

        .sv-suggested-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--purple);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          color: white;
          flex-shrink: 0;
          overflow: hidden;
        }

        .sv-suggested-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sv-suggested-info {
          flex: 1;
          min-width: 0;
        }

        .sv-suggested-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--ink);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sv-suggested-username {
          font-size: 12px;
          color: var(--ink-muted);
          margin-top: 2px;
        }

        .sv-suggested-bio {
          font-size: 11px;
          color: var(--ink-secondary);
          margin-top: 4px;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .sv-suggested-arrow {
          color: var(--ink-muted);
          opacity: 0;
          transition: opacity 0.15s, transform 0.15s;
          flex-shrink: 0;
        }

        .sv-suggested-user:hover .sv-suggested-arrow {
          opacity: 1;
          transform: translate(2px, -2px);
        }

        .sv-suggested-follow {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          background: var(--purple);
          border: none;
          color: white;
          cursor: pointer;
          transition: all 0.15s;
          font-size: 12px;
          font-weight: 500;
          flex-shrink: 0;
        }

        .sv-suggested-follow:hover {
          background: var(--purple-mid);
          transform: translateY(-1px);
        }
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
                { icon: <Bookmark size={16} />, label: "Saved" },
                { icon: <User size={16} />, label: "Profile", route: "/profile" },
                { icon: <Settings size={16} />, label: "Settings" },
              ].map(item => (
                <a
                  key={item.label}
                  href={item.route || "#"}
                  className={`sv-nav-item ${item.active ? 'active' : ''}`}
                >
                  {item.icon}
                  {item.label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="sv-main">
            {/* Header */}
            <header className="sv-header">
              <h1 className="sv-header-title">Welcome back to StoryVerse</h1>
              <p className="sv-header-subtitle">
                Discover new narratives, analyze character psychology, and connect with fellow story enthusiasts.
              </p>
            </header>

            {/* Feature Cards */}
            <div className="sv-features-area">
              <div className="sv-feature-grid">
                {features.map((f) => (
                  <div
                    key={f.label}
                    className="sv-feature-card"
                    onClick={() => navigate(f.route)}
                    style={{ '--feature-accent': f.accent } as React.CSSProperties}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = f.accent;
                      (e.currentTarget as HTMLElement).style.background = f.accentLight;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = '';
                      (e.currentTarget as HTMLElement).style.background = '';
                    }}
                  >
                    <div
                      className="sv-feature-icon-wrap"
                      style={{ background: f.accentLight, color: f.accent }}
                    >
                      {f.icon}
                    </div>

                    <div className="sv-feature-content">
                      <div className="sv-feature-label">
                        {f.label}
                        <span className="sv-feature-badge" style={{ background: f.badgeColor }}>
                          {f.badge}
                        </span>
                      </div>

                      <p className="sv-feature-desc">{f.description}</p>

                      <button
                        className="sv-feature-cta"
                        style={{ color: f.accent }}
                      >
                        Open {f.label}
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Posts Section */}
            {userProfile && userPosts.length > 0 && (
              <div className="sv-user-posts-area">
                <div className="sv-posts-intro">
                  <p className="sv-posts-eyebrow">Recent Posts</p>
                  <h2 className="sv-posts-heading">
                    Recent Activity
                  </h2>
                  <p className="sv-posts-subheading">
                    Your latest thoughts and contributions to the StoryVerse community.
                  </p>
                </div>
                <div className="sv-posts-feed">
                  {userPosts.map(post => (
                    <article key={post.id} className="sv-user-post">
                      <div className="sv-user-post-inner">
                        {/* User Row */}
                        <div className="sv-user-post-header">
                          <div className="sv-user-post-user">
                            <div className="sv-avatar" style={{ background: '#6d28d9', width: 38, height: 38, fontSize: 12 }}>
                              {userProfile.avatar}
                            </div>
                            <div>
                              <div className="sv-user-name">{userProfile.username}</div>
                              <div className="sv-user-meta">
                                <span className="sv-user-handle">@{userProfile.username.toLowerCase()}</span>
                                <span className="sv-user-dot" />
                                <span className="sv-user-time">{post.timestamp}</span>
                              </div>
                            </div>
                          </div>
                          <button className="sv-more-btn"><MoreHorizontal size={16} /></button>
                        </div>

                        {/* Content */}
                        <div className="sv-user-post-content">
                          {post.type === 'text' ? (
                            <p className="sv-user-post-text">{post.content}</p>
                          ) : (
                            <img src={post.imageUrl} alt="Post image" className="sv-user-post-image" />
                          )}
                        </div>

                        {/* Actions */}
                        <div className="sv-user-post-actions">
                          <button
                            className={`sv-action-btn ${likedPosts.has(post.id) ? 'liked' : ''}`}
                            onClick={() => toggleLike(post.id)}
                          >
                            <Heart
                              size={15}
                              fill={likedPosts.has(post.id) ? "#e11d48" : "none"}
                              stroke={likedPosts.has(post.id) ? "#e11d48" : "currentColor"}
                            />
                            {post.likeCount || 0}
                          </button>
                          <button className="sv-action-btn">
                            <MessageCircle size={15} />
                            {post.commentCount || 0}
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
              </div>
            )}
          </main>

          {/* Right Sidebar */}
          <aside className="sv-sidebar-right">
            {/* Profile */}
            <button className="sv-user-profile" onClick={() => navigate('/profile')}>
              <div className="sv-profile-avatar">ME</div>
              <div>
                <div className="sv-profile-name">Your Profile</div>
                <div className="sv-profile-handle">@yourusername</div>
              </div>
              <ArrowUpRight size={14} style={{ marginLeft: 'auto', color: 'var(--ink-muted)' }} />
            </button>

            {/* Quick Access */}
            <div className="sv-quick-access">
              <div className="sv-quick-access-header">
                <p className="sv-quick-access-title">Quick Access</p>
              </div>

              {features.map((f) => (
                <button
                  key={f.label}
                  className="sv-quick-item"
                  onClick={() => navigate(f.route)}
                >
                  <div
                    className="sv-quick-icon"
                    style={{ background: f.accentLight, color: f.accent }}
                  >
                    {f.icon}
                  </div>
                  <span className="sv-quick-label">{f.label}</span>
                  <ArrowUpRight size={13} className="sv-quick-arrow" />
                </button>
              ))}
            </div>

            {/* Suggested Accounts */}
            <div className="sv-suggested-accounts">
              <div className="sv-suggested-header">
                <p className="sv-suggested-title">Suggested Accounts</p>
              </div>

              {suggestedUsers.length > 0 ? (
                suggestedUsers.map((user) => (
                  <div key={user.username} className="sv-suggested-item">
                    <button
                      className="sv-suggested-user"
                      onClick={() => navigate(`/profile/${user.username}`)}
                    >
                      <div className="sv-suggested-avatar">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} />
                        ) : (
                          <span>{user.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="sv-suggested-info">
                        <div className="sv-suggested-name">{user.name}</div>
                        <div className="sv-suggested-username">@{user.username}</div>
                        {user.bio && (
                          <div className="sv-suggested-bio">{user.bio}</div>
                        )}
                      </div>
                      <ArrowUpRight size={13} className="sv-suggested-arrow" />
                    </button>
                    <button
                      className="sv-suggested-follow"
                      onClick={() => handleFollow(user.username)}
                    >
                      <UserPlus size={14} />
                      Follow
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ 
                  padding: '20px 18px',
                  textAlign: 'center',
                  color: 'var(--ink-muted)',
                  fontSize: '13px'
                }}>
                  No suggested accounts available
                </div>
              )}
            </div>
          </aside>

        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          #sv-left { display: flex !important; }
        }
      `}</style>
    </>
  );
};

export default HomeFeed;
