import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import {
  User, Edit2, Save, X, Plus, Image, MessageCircle, Heart, Bookmark,
  Settings, ArrowLeft, Sun, Moon, Search, ChevronRight
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

const UserProfile = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: "YourUsername",
    bio: "Welcome to your profile! Add a bio to tell others about yourself.",
    avatar: "ME",
    posts: []
  });

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempUsername, setTempUsername] = useState("");
  const [tempBio, setTempBio] = useState("");

  const [showPostModal, setShowPostModal] = useState(false);
  const [postType, setPostType] = useState<'text' | 'image'>('text');
  const [postContent, setPostContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Load user profile from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
  }, []);

  // Save user profile to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  const handleSaveUsername = () => {
    if (tempUsername.trim()) {
      setUserProfile(prev => ({ ...prev, username: tempUsername.trim() }));
      setIsEditingUsername(false);
    }
  };

  const handleSaveBio = () => {
    setUserProfile(prev => ({ ...prev, bio: tempBio }));
    setIsEditingBio(false);
  };

  const handleCreatePost = () => {
    if (postContent.trim() || selectedImage) {
      const newPost: UserPost = {
        id: Date.now().toString(),
        type: postType,
        content: postContent.trim(),
        timestamp: "   Just now",
        likes: 0,
        comments: 0,
        liked: false,
        saved: false
      };

      if (postType === 'image' && selectedImage) {
        newPost.content = selectedImage;
      }

      setUserProfile(prev => ({
        ...prev,
        posts: [newPost, ...prev.posts]
      }));

      // Reset form
      setPostContent("");
      setSelectedImage(null);
      setShowPostModal(false);
      setPostType('text');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLikePost = (postId: string) => {
    setUserProfile(prev => ({
      ...prev,
      posts: prev.posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              liked: !post.liked, 
              likes: post.liked ? post.likes - 1 : post.likes + 1 
            }
          : post
      )
    }));
  };

  const handleSavePost = (postId: string) => {
    setUserProfile(prev => ({
      ...prev,
      posts: prev.posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              saved: !post.saved
            }
          : post
      )
    }));
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

        .up-root {
          font-family: var(--font-sans);
          background: var(--white);
          min-height: 100vh;
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
        }

        .up-header {
          position: sticky;
          top: 0;
          background: ${isDark ? 'rgba(10,10,10,0.88)' : 'rgba(255,255,255,0.88)'};
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          z-index: 50;
          padding: 18px 36px;
        }

        .up-header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 640px;
          margin: 0 auto;
        }

        .up-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .up-back-btn {
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

        .up-back-btn:hover {
          background: var(--surface);
          color: var(--ink);
        }

        .up-header-title {
          font-family: var(--font-serif);
          font-size: 24px;
          letter-spacing: -0.02em;
          color: var(--ink);
        }

        .up-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .up-theme-btn {
          display: flex;
          align-items: center;
          gap: 7px;
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

        .up-theme-btn:hover {
          border-color: var(--purple-mid);
          background: var(--purple-light);
          color: var(--purple);
        }

        .up-search-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .up-search-wrap svg {
          position: absolute;
          left: 12px;
          color: var(--ink-muted);
          pointer-events: none;
        }

        .up-search {
          padding: 9px 16px 9px 36px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 100px;
          font-size: 14px;
          font-family: var(--font-sans);
          color: var(--ink);
          outline: none;
          width: 200px;
          transition: border-color 0.2s, box-shadow 0.2s, width 0.3s;
        }

        .up-search:focus {
          border-color: var(--purple-mid);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.12);
          width: 240px;
        }

        .up-search::placeholder { color: var(--ink-muted); }

        .up-main {
          max-width: 640px;
          margin: 0 auto;
          padding: 36px;
        }

        .up-profile-section {
          margin-bottom: 48px;
        }

        .up-profile-header {
          display: flex;
          align-items: flex-start;
          gap: 24px;
          margin-bottom: 32px;
        }

        .up-avatar {
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
        }

        .up-profile-info {
          flex: 1;
        }

        .up-username-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .up-username {
          font-size: 28px;
          font-weight: 600;
          color: var(--ink);
          letter-spacing: -0.02em;
        }

        .up-edit-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          background: none;
          border: 1px solid var(--border);
          color: var(--ink-secondary);
          cursor: pointer;
          transition: all 0.15s;
          font-size: 13px;
          font-weight: 500;
        }

        .up-edit-btn:hover {
          background: var(--surface);
          color: var(--ink);
        }

        .up-username-input {
          font-size: 28px;
          font-weight: 600;
          color: var(--ink);
          letter-spacing: -0.02em;
          background: var(--surface);
          border: 1px solid var(--purple);
          border-radius: var(--radius-sm);
          padding: 4px 8px;
          outline: none;
          font-family: var(--font-sans);
        }

        .up-bio {
          font-size: 15px;
          color: var(--ink-secondary);
          line-height: 1.6;
          margin-bottom: 16px;
          white-space: pre-wrap;
        }

        .up-bio-input {
          font-size: 15px;
          color: var(--ink);
          line-height: 1.6;
          background: var(--surface);
          border: 1px solid var(--purple);
          border-radius: var(--radius-sm);
          padding: 8px 12px;
          outline: none;
          font-family: var(--font-sans);
          resize: vertical;
          min-height: 80px;
        }

        .up-action-buttons {
          display: flex;
          gap: 8px;
        }

        .up-save-btn {
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
          font-size: 13px;
          font-weight: 500;
        }

        .up-save-btn:hover {
          background: var(--purple-mid);
        }

        .up-cancel-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          background: none;
          border: 1px solid var(--border);
          color: var(--ink-secondary);
          cursor: pointer;
          transition: all 0.15s;
          font-size: 13px;
          font-weight: 500;
        }

        .up-cancel-btn:hover {
          background: var(--surface);
          color: var(--ink);
        }

        .up-create-post-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: var(--radius-md);
          background: var(--purple);
          border: none;
          color: white;
          cursor: pointer;
          transition: all 0.15s;
          font-size: 15px;
          font-weight: 500;
          margin-bottom: 32px;
        }

        .up-create-post-btn:hover {
          background: var(--purple-mid);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        .up-posts-section {
          margin-bottom: 48px;
        }

        .up-section-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--ink);
          letter-spacing: -0.01em;
          margin-bottom: 24px;
        }

        .up-post {
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px;
          margin-bottom: 16px;
          background: var(--white);
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .up-post:hover {
          border-color: var(--purple-mid);
          box-shadow: var(--shadow-sm);
        }

        .up-post-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .up-post-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .up-post-avatar {
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

        .up-post-user-info {
          display: flex;
          flex-direction: column;
        }

        .up-post-username {
          font-size: 15px;
          font-weight: 600;
          color: var(--ink);
        }

        .up-post-time {
          font-size: 12px;
          color: var(--ink-muted);
        }

        .up-post-content {
          margin-bottom: 16px;
        }

        .up-post-text {
          font-size: 15px;
          color: var(--ink);
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .up-post-image {
          width: 100%;
          max-width: 400px;
          border-radius: var(--radius-md);
          margin-top: 12px;
        }

        .up-post-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }

        .up-action-btn {
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

        .up-action-btn:hover {
          background: var(--surface);
          color: var(--ink);
        }

        .up-action-btn.liked {
          color: #e11d48;
        }

        .up-action-btn.saved {
          color: var(--purple);
        }

        .up-action-spacer {
          flex: 1;
        }

        .up-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .up-modal {
          background: var(--white);
          border-radius: var(--radius-lg);
          padding: 32px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .up-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .up-modal-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--ink);
        }

        .up-close-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: none;
          border: none;
          color: var(--ink-muted);
          cursor: pointer;
          transition: all 0.15s;
        }

        .up-close-btn:hover {
          background: var(--surface);
          color: var(--ink);
        }

        .up-post-type-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
        }

        .up-type-tab {
          flex: 1;
          padding: 10px;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          background: none;
          color: var(--ink-secondary);
          cursor: pointer;
          transition: all 0.15s;
          font-size: 14px;
          font-weight: 500;
        }

        .up-type-tab.active {
          background: var(--purple);
          border-color: var(--purple);
          color: white;
        }

        .up-textarea {
          width: 100%;
          min-height: 120px;
          padding: 12px;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          background: var(--surface);
          color: var(--ink);
          font-size: 15px;
          font-family: var(--font-sans);
          resize: vertical;
          outline: none;
        }

        .up-textarea:focus {
          border-color: var(--purple);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.12);
        }

        .up-image-upload {
          border: 2px dashed var(--border);
          border-radius: var(--radius-md);
          padding: 32px;
          text-align: center;
          cursor: pointer;
          transition: all 0.15s;
        }

        .up-image-upload:hover {
          border-color: var(--purple);
          background: var(--purple-light);
        }

        .up-image-preview {
          width: 100%;
          max-width: 300px;
          border-radius: var(--radius-md);
          margin-top: 16px;
        }

        .up-modal-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .up-modal-btn {
          flex: 1;
          padding: 12px;
          border-radius: var(--radius-sm);
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          border: none;
        }

        .up-modal-btn.primary {
          background: var(--purple);
          color: white;
        }

        .up-modal-btn.primary:hover {
          background: var(--purple-mid);
        }

        .up-modal-btn.secondary {
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--ink);
        }

        .up-modal-btn.secondary:hover {
          background: var(--border);
        }
      `}</style>

      <div className="up-root">
        {/* Header */}
        <header className="up-header">
          <div className="up-header-inner">
            <div className="up-header-left">
              <button className="up-back-btn" onClick={() => navigate('/feed')}>
                <ArrowLeft size={16} />
                Back
              </button>
              <h1 className="up-header-title">Profile</h1>
            </div>
            <div className="up-header-actions">
              <button className="up-theme-btn" onClick={toggleTheme}>
                {isDark ? <Sun size={13} /> : <Moon size={13} />}
                {isDark ? 'Light' : 'Dark'}
              </button>
              <div className="up-search-wrap">
                <Search size={13} />
                <input className="up-search" type="text" placeholder="Search anything..." />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="up-main">
          {/* Profile Section */}
          <section className="up-profile-section">
            <div className="up-profile-header">
              <div className="up-avatar">{userProfile.avatar}</div>
              <div className="up-profile-info">
                <div className="up-username-row">
                  {isEditingUsername ? (
                    <input
                      className="up-username-input"
                      value={tempUsername}
                      onChange={(e) => setTempUsername(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveUsername()}
                      autoFocus
                    />
                  ) : (
                    <h2 className="up-username">{userProfile.username}</h2>
                  )}
                  {isEditingUsername ? (
                    <div className="up-action-buttons">
                      <button className="up-save-btn" onClick={handleSaveUsername}>
                        <Save size={14} />
                        Save
                      </button>
                      <button className="up-cancel-btn" onClick={() => {
                        setIsEditingUsername(false);
                        setTempUsername("");
                      }}>
                        <X size={14} />
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="up-edit-btn" 
                      onClick={() => {
                        setIsEditingUsername(true);
                        setTempUsername(userProfile.username);
                      }}
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                  )}
                </div>
                
                {isEditingBio ? (
                  <div>
                    <textarea
                      className="up-bio-input"
                      value={tempBio}
                      onChange={(e) => setTempBio(e.target.value)}
                      autoFocus
                    />
                    <div className="up-action-buttons" style={{ marginTop: '12px' }}>
                      <button className="up-save-btn" onClick={handleSaveBio}>
                        <Save size={14} />
                        Save
                      </button>
                      <button className="up-cancel-btn" onClick={() => {
                        setIsEditingBio(false);
                        setTempBio("");
                      }}>
                        <X size={14} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="up-bio">{userProfile.bio}</p>
                    <button 
                      className="up-edit-btn" 
                      onClick={() => {
                        setIsEditingBio(true);
                        setTempBio(userProfile.bio);
                      }}
                    >
                      <Edit2 size={14} />
                      Edit Bio
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button className="up-create-post-btn" onClick={() => setShowPostModal(true)}>
              <Plus size={16} />
              Create New Post
            </button>
          </section>

          {/* Posts Section */}
          <section className="up-posts-section">
            <h2 className="up-section-title">Your Posts</h2>
            
            {userProfile.posts.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '48px 24px',
                color: 'var(--ink-muted)',
                fontSize: '15px'
              }}>
                No posts yet. Create your first post to get started!
              </div>
            ) : (
              userProfile.posts.map((post) => (
                <div key={post.id} className="up-post">
                  <div className="up-post-header">
                    <div className="up-post-user">
                      <div className="up-post-avatar">{userProfile.avatar}</div>
                      <div className="up-post-user-info">
                        <div className="up-post-username">{userProfile.username}</div>
                        <div className="up-post-time">{post.timestamp}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="up-post-content">
                    {post.type === 'text' ? (
                      <p className="up-post-text">{post.content}</p>
                    ) : (
                      <img src={post.content} alt="Post image" className="up-post-image" />
                    )}
                  </div>
                  
                  <div className="up-post-actions">
                    <button 
                      className={`up-action-btn ${post.liked ? 'liked' : ''}`}
                      onClick={() => handleLikePost(post.id)}
                    >
                      <Heart size={14} fill={post.liked ? "#e11d48" : "none"} />
                      {post.likes}
                    </button>
                    <button className="up-action-btn">
                      <MessageCircle size={14} />
                      {post.comments}
                    </button>
                    <div className="up-action-spacer" />
                    <button 
                      className={`up-action-btn ${post.saved ? 'saved' : ''}`}
                      onClick={() => handleSavePost(post.id)}
                    >
                      <Bookmark size={14} fill={post.saved ? "var(--purple)" : "none"} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </section>
        </main>

        {/* Create Post Modal */}
        {showPostModal && (
          <div className="up-modal-overlay" onClick={() => setShowPostModal(false)}>
            <div className="up-modal" onClick={(e) => e.stopPropagation()}>
              <div className="up-modal-header">
                <h3 className="up-modal-title">Create New Post</h3>
                <button className="up-close-btn" onClick={() => setShowPostModal(false)}>
                  <X size={16} />
                </button>
              </div>
              
              <div className="up-post-type-tabs">
                <button 
                  className={`up-type-tab ${postType === 'text' ? 'active' : ''}`}
                  onClick={() => setPostType('text')}
                >
                  Text Post
                </button>
                <button 
                  className={`up-type-tab ${postType === 'image' ? 'active' : ''}`}
                  onClick={() => setPostType('image')}
                >
                  Image Post
                </button>
              </div>
              
              {postType === 'text' ? (
                <textarea
                  className="up-textarea"
                  placeholder="What's on your mind?"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                />
              ) : (
                <div>
                  <div className="up-image-upload" onClick={() => document.getElementById('image-upload')?.click()}>
                    <Image size={32} style={{ color: 'var(--ink-muted)', marginBottom: '12px' }} />
                    <p style={{ color: 'var(--ink-muted)', marginBottom: '8px' }}>
                      Click to upload an image
                    </p>
                    <p style={{ color: 'var(--ink-muted)', fontSize: '12px' }}>
                      PNG, JPG, GIF up to 10MB
                    </p>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageUpload}
                    />
                  </div>
                  {selectedImage && (
                    <img src={selectedImage} alt="Preview" className="up-image-preview" />
                  )}
                </div>
              )}
              
              <div className="up-modal-actions">
                <button 
                  className="up-modal-btn secondary"
                  onClick={() => setShowPostModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="up-modal-btn primary"
                  onClick={handleCreatePost}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UserProfile;
