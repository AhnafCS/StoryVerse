import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import api from "../services/api";
import {
  User, ArrowLeft, Sun, Moon, Search, Heart, MessageCircle, Bookmark,
  Calendar, Users, UserPlus, Check
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  username: string;
  bio: string;
  avatar: string;
  followers: any[];
  following: any[];
  followerCount: number;
  followingCount: number;
  isVerified: boolean;
  lastSeen: string;
  createdAt: string;
}

interface UserPost {
  id: string;
  author: {
    id: string;
    username: string;
    name: string;
    avatar: string;
  };
  content: string;
  type: 'text' | 'image';
  imageUrl: string;
  likes: any[];
  comments: any[];
  likeCount: number;
  commentCount: number;
  tags: string[];
  isPublic: boolean;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

const ViewProfile = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!username) return;
      
      try {
        setLoading(true);
        const response = await api.profile.getProfile(username);
        setUserProfile(response.user);
        setUserPosts(response.posts || []);
        
        // Check if current user is following this profile
        // This would need to be implemented based on current user data
        setIsFollowing(false);
        
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        setError('User not found or profile is private');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  const handleFollow = async () => {
    if (!username) return;
    
    try {
      if (isFollowing) {
        await api.profile.unfollowUser(username);
        setIsFollowing(false);
        if (userProfile) {
          setUserProfile({
            ...userProfile,
            followerCount: userProfile.followerCount - 1
          });
        }
      } else {
        await api.profile.followUser(username);
        setIsFollowing(true);
        if (userProfile) {
          setUserProfile({
            ...userProfile,
            followerCount: userProfile.followerCount + 1
          });
        }
      }
    } catch (error) {
      console.error('Failed to follow/unfollow user:', error);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await api.posts.toggleLike(postId);
      setLikedPosts(prev => {
        const next = new Set(prev);
        next.has(postId) ? next.delete(postId) : next.add(postId);
        return next;
      });
      
      // Update post like count
      setUserPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
              isLiked: !post.isLiked
            }
          : post
      ));
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="vp-root">
        <div className="vp-loading">
          <div className="vp-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="vp-root">
        <header className="vp-header">
          <div className="vp-header-inner">
            <div className="vp-header-left">
              <button className="vp-back-btn" onClick={() => navigate('/feed')}>
                <ArrowLeft size={16} />
                Back
              </button>
              <h1 className="vp-header-title">Profile Not Found</h1>
            </div>
          </div>
        </header>
        <main className="vp-main">
          <div className="vp-error">
            <p>{error || 'User not found'}</p>
            <button onClick={() => navigate('/feed')}>Return to Home</button>
          </div>
        </main>
      </div>
    );
  }

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

        .vp-root {
          font-family: var(--font-sans);
          background: var(--white);
          min-height: 100vh;
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
        }

        .vp-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          color: var(--ink-muted);
        }

        .vp-spinner {
          width: 32px;
          height: 32px;
          border: 2px solid var(--border);
          border-top: 2px solid var(--purple);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .vp-header {
          position: sticky;
          top: 0;
          background: ${isDark ? 'rgba(10,10,10,0.88)' : 'rgba(255,255,255,0.88)'};
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          z-index: 50;
          padding: 18px 36px;
        }

        .vp-header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 640px;
          margin: 0 auto;
        }

        .vp-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .vp-back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          background: none;
          border: none;
          color: var(--ink-secondary);
          cursor: pointer;
          transition: all 0.15s;
          font-size: 14px;
          font-weight: 500;
        }

        .vp-back-btn:hover {
          background: var(--surface);
          color: var(--ink);
        }

        .vp-header-title {
          font-family: var(--font-serif);
          font-size: 24px;
          letter-spacing: -0.02em;
          color: var(--ink);
        }

        .vp-main {
          max-width: 640px;
          margin: 0 auto;
          padding: 36px;
        }

        .vp-profile-section {
          margin-bottom: 48px;
        }

        .vp-profile-header {
          display: flex;
          align-items: flex-start;
          gap: 24px;
          margin-bottom: 32px;
        }

        .vp-avatar {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background: var(--purple);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 600;
          color: white;
          flex-shrink: 0;
          overflow: hidden;
        }

        .vp-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .vp-profile-info {
          flex: 1;
        }

        .vp-username-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .vp-username {
          font-size: 28px;
          font-weight: 600;
          color: var(--ink);
          letter-spacing: -0.02em;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .vp-verified-badge {
          width: 20px;
          height: 20px;
          background: var(--purple);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .vp-bio {
          font-size: 15px;
          color: var(--ink-secondary);
          line-height: 1.6;
          margin-bottom: 16px;
          white-space: pre-wrap;
        }

        .vp-profile-stats {
          display: flex;
          gap: 24px;
          margin-bottom: 20px;
        }

        .vp-stat {
          display: flex;
          flex-direction: column;
        }

        .vp-stat-value {
          font-size: 18px;
          font-weight: 600;
          color: var(--ink);
        }

        .vp-stat-label {
          font-size: 12px;
          color: var(--ink-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .vp-action-buttons {
          display: flex;
          gap: 12px;
        }

        .vp-follow-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background: var(--white);
          color: var(--ink);
          cursor: pointer;
          transition: all 0.15s;
          font-size: 15px;
          font-weight: 500;
        }

        .vp-follow-btn:hover {
          background: var(--surface);
        }

        .vp-follow-btn.following {
          background: var(--purple);
          color: white;
          border-color: var(--purple);
        }

        .vp-follow-btn.following:hover {
          background: var(--purple-mid);
        }

        .vp-posts-section {
          margin-bottom: 48px;
        }

        .vp-section-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--ink);
          letter-spacing: -0.01em;
          margin-bottom: 24px;
        }

        .vp-post {
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px;
          margin-bottom: 16px;
          background: var(--white);
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .vp-post:hover {
          border-color: var(--purple-mid);
          box-shadow: var(--shadow-sm);
        }

        .vp-post-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .vp-post-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .vp-post-avatar {
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
          overflow: hidden;
        }

        .vp-post-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .vp-post-user-info {
          display: flex;
          flex-direction: column;
        }

        .vp-post-username {
          font-size: 15px;
          font-weight: 600;
          color: var(--ink);
        }

        .vp-post-time {
          font-size: 12px;
          color: var(--ink-muted);
        }

        .vp-post-content {
          margin-bottom: 16px;
        }

        .vp-post-text {
          font-size: 15px;
          color: var(--ink);
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .vp-post-image {
          width: 100%;
          max-width: 400px;
          border-radius: var(--radius-md);
          margin-top: 12px;
        }

        .vp-post-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }

        .vp-action-btn {
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

        .vp-action-btn:hover {
          background: var(--surface);
          color: var(--ink);
        }

        .vp-action-btn.liked {
          color: #e11d48;
        }

        .vp-action-spacer {
          flex: 1;
        }

        .vp-error {
          text-align: center;
          padding: 48px 24px;
        }

        .vp-error p {
          color: var(--ink-muted);
          margin-bottom: 16px;
        }

        .vp-error button {
          padding: 10px 20px;
          border-radius: var(--radius-sm);
          background: var(--purple);
          color: white;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }
      `}</style>

      <div className="vp-root">
        {/* Header */}
        <header className="vp-header">
          <div className="vp-header-inner">
            <div className="vp-header-left">
              <button className="vp-back-btn" onClick={() => navigate('/feed')}>
                <ArrowLeft size={16} />
                Back
              </button>
              <h1 className="vp-header-title">@{userProfile.username}</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="vp-main">
          {/* Profile Section */}
          <section className="vp-profile-section">
            <div className="vp-profile-header">
              <div className="vp-avatar">
                {userProfile.avatar ? (
                  <img src={userProfile.avatar} alt={userProfile.name} />
                ) : (
                  <span>{userProfile.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="vp-profile-info">
                <div className="vp-username-row">
                  <h2 className="vp-username">
                    {userProfile.name}
                    {userProfile.isVerified && (
                      <div className="vp-verified-badge">
                        <Check size={12} />
                      </div>
                    )}
                  </h2>
                </div>
                
                <p className="vp-bio">{userProfile.bio}</p>

                <div className="vp-profile-stats">
                  <div className="vp-stat">
                    <span className="vp-stat-value">{userProfile.followerCount}</span>
                    <span className="vp-stat-label">Followers</span>
                  </div>
                  <div className="vp-stat">
                    <span className="vp-stat-value">{userProfile.followingCount}</span>
                    <span className="vp-stat-label">Following</span>
                  </div>
                  <div className="vp-stat">
                    <span className="vp-stat-value">{userPosts.length}</span>
                    <span className="vp-stat-label">Posts</span>
                  </div>
                </div>

                <div className="vp-action-buttons">
                  <button 
                    className={`vp-follow-btn ${isFollowing ? 'following' : ''}`}
                    onClick={handleFollow}
                  >
                    {isFollowing ? (
                      <>
                        <Check size={16} />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} />
                        Follow
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Posts Section */}
          <section className="vp-posts-section">
            <h2 className="vp-section-title">Posts</h2>
            
            {userPosts.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '48px 24px',
                color: 'var(--ink-muted)',
                fontSize: '15px'
              }}>
                No posts yet.
              </div>
            ) : (
              userPosts.map((post) => (
                <div key={post.id} className="vp-post">
                  <div className="vp-post-header">
                    <div className="vp-post-user">
                      <div className="vp-post-avatar">
                        {post.author.avatar ? (
                          <img src={post.author.avatar} alt={post.author.name} />
                        ) : (
                          <span>{post.author.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="vp-post-user-info">
                        <div className="vp-post-username">{post.author.name}</div>
                        <div className="vp-post-time">{formatDate(post.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="vp-post-content">
                    {post.type === 'text' ? (
                      <p className="vp-post-text">{post.content}</p>
                    ) : (
                      <img src={post.imageUrl} alt="Post image" className="vp-post-image" />
                    )}
                  </div>
                  
                  <div className="vp-post-actions">
                    <button 
                      className={`vp-action-btn ${post.isLiked ? 'liked' : ''}`}
                      onClick={() => handleLikePost(post.id)}
                    >
                      <Heart
                        size={14}
                        fill={post.isLiked ? "#e11d48" : "none"}
                        stroke={post.isLiked ? "#e11d48" : "currentColor"}
                      />
                      {post.likeCount}
                    </button>
                    <button className="vp-action-btn">
                      <MessageCircle size={14} />
                      {post.commentCount}
                    </button>
                    <div className="vp-action-spacer" />
                    <button className="vp-action-btn">
                      <Bookmark size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </section>
        </main>
      </div>
    </>
  );
};

export default ViewProfile;
