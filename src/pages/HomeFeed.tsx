import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import api from "../services/api";
import { toast } from "sonner";
import {
  Search, Plus, Brain, TrendingUp, MessageCircle,
  Home, Bookmark, Settings, User,
  Sun, Moon, GitBranch, ArrowUpRight, ChevronRight, UserPlus, Heart, MoreHorizontal, LogOut,
  ChevronDown, ChevronUp, Send, Trash2, X, Image, Camera
} from "lucide-react";

const HomeFeed = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  
  // Comments state
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Post creation state
  const [showPostModal, setShowPostModal] = useState(false);
  const [postType, setPostType] = useState<'text' | 'image'>('text');
  const [postContent, setPostContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageCaption, setImageCaption] = useState("");

  // Fetch current user profile
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.profile.getCurrentProfile();
        setCurrentUser(response.user);
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch all posts for global feed
  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        const response = await api.posts.getPosts({ limit: 20 });
        setAllPosts(response.posts || []);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        setAllPosts([]);
      }
    };

    fetchAllPosts();
  }, []);

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

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
  };

  const toggleExpand = (postId: string) => {
    setExpandedPosts(prev => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
  };

  // Toggle comments visibility
  const toggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
  };

  // Handle comment submission
  const handleAddComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    try {
      const response = await api.posts.addComment(postId, content);
      
      // Update the post's comments in state
      setAllPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              comments: [...(post.comments || []), response.comment],
              commentCount: response.commentCount
            }
          : post
      ));
      
      // Clear the input
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      toast.success('Comment added!');
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    }
  };

  // Handle comment deletion
  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      const response = await api.posts.deleteComment(postId, commentId);
      
      setAllPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              comments: (post.comments || []).filter((c: any) => c.id !== commentId),
              commentCount: response.commentCount
            }
          : post
      ));
      
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  // Navigate to user profile
  const navigateToProfile = (username: string) => {
    navigate(`/profile/${username}`);
  };

  const handleFeatureClick = (featureType: string, post: any) => {
    if (!post.featureData) return;
    
    // Store the feature data for the destination page
    if (featureType === 'psychology') {
      localStorage.setItem('psychology_pending', JSON.stringify({
        name: post.featureData.name,
        description: post.featureData.fullContent,
        timestamp: Date.now()
      }));
      navigate('/psychology');
    } else if (featureType === 'narrative') {
      localStorage.setItem('narrative_pending', JSON.stringify({
        title: post.featureData.name,
        content: post.featureData.fullContent,
        timestamp: Date.now()
      }));
      navigate('/narrative');
    }
  };

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to login page
    navigate('/');
  };

  // Handle post creation
  const handleCreatePost = async () => {
    const contentToUse = postType === 'image' ? imageCaption : postContent;
    if (!contentToUse.trim() && !selectedImage) {
      toast.error('Please add content or an image');
      return;
    }

    try {
      const trimmedContent = contentToUse.trim();
      
      // Check for @AI keyword in content
      const hasAI = trimmedContent.toLowerCase().includes('@ai');
      let featureTag = null;
      let featureData = null;
      
      if (hasAI) {
        featureTag = 'ai'; // Special tag for @AI posts
        const lines = trimmedContent.split('\n');
        const nameLine = lines[0].replace(/@ai/gi, '').trim();
        const descriptionLines = lines.slice(1).join('\n').trim();
        const fullContent = descriptionLines || 'No description provided';
        
        featureData = {
          name: nameLine || 'Untitled Entry',
          summary: fullContent.substring(0, 100) + (fullContent.length > 100 ? '...' : ''),
          fullContent: fullContent
        };
        
        // Store for both Psychology and Narrative pages
        localStorage.setItem('psychology_pending', JSON.stringify({
          name: featureData.name,
          description: fullContent,
          timestamp: Date.now()
        }));
        localStorage.setItem('narrative_pending', JSON.stringify({
          title: featureData.name,
          content: fullContent,
          timestamp: Date.now()
        }));
      }

      const postData: any = {
        type: postType,
        content: postType === 'text' ? trimmedContent : trimmedContent, // Caption is the content for image posts
        imageUrl: postType === 'image' ? selectedImage : '',
        featureTag,
        featureData
      };

      const response = await api.posts.createPost(postData);
      
      // Add new post to the beginning of the feed
      setAllPosts(prev => [response.post, ...prev]);
      
      // Reset form
      setPostContent("");
      setImageCaption("");
      setSelectedImage(null);
      setShowPostModal(false);
      setPostType('text');
      
      toast.success('Post created successfully!');
    } catch (error) {
      console.error('Failed to create post:', error);
      toast.error('Failed to create post');
    }
  };

  // Handle image selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const features = [
    {
      icon: <Brain size={22} />,
      label: "Psychology",
      badge: "AI",
      badgeColor: "#6d28d9",
      description: "Explore the psychological dimensions of characters, narratives, and reader responses through AI-powered analysis.",
      route: "/psychology",
      accent: "#6d28d9",
      accentLight: isDark ? "rgba(109,40,217,0.12)" : "#ede9fe",
    },
    {
      icon: <GitBranch size={22} />,
      label: "Narrative Analytics",
      badge: "AI",
      badgeColor: "#0090cc",
      description: "Dissect story structure, plot arcs, and narrative mechanics with intelligent tools built for serious readers.",
      route: "/narrative",
      accent: "#0090cc",
      accentLight: isDark ? "rgba(0,144,204,0.10)" : "#e0f4fd",
    },
    {
      icon: <TrendingUp size={22} />,
      label: "Analytics",
      badge: "AI",
      badgeColor: "#0090cc",
      description: "Track reading patterns, engagement trends, and community insights with data-driven analytics.",
      route: "/analytics",
      accent: "#0090cc",
      accentLight: isDark ? "rgba(0,144,204,0.10)" : "#e0f4fd",
    },
    {
      icon: <MessageCircle size={22} />,
      label: "Forum",
      badge: "AI",
      badgeColor: "#00a36b",
      description: "Engage in structured discussions with AI-assisted moderation and community-curated threads.",
      route: "/forum",
      accent: "#00a36b",
      accentLight: isDark ? "rgba(0,163,107,0.10)" : "#e0faf1",
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

        /* Layout */
        .sv-layout {
          display: flex;
          max-width: 1280px;
          margin: 0 auto;
        }

        /* Left Sidebar */
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

        .sv-nav-feature {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          font-size: 14px;
          font-weight: 500;
          color: var(--ink);
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          width: 100%;
          transition: background 0.15s, color 0.15s;
          letter-spacing: -0.01em;
        }

        .sv-nav-feature:hover {
          background: var(--surface);
        }

        .sv-nav-badge {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 2px 6px;
          border-radius: 4px;
          color: white;
          margin-left: auto;
          flex-shrink: 0;
        }

        .sv-sidebar-footer {
          margin-top: auto;
          padding-top: 24px;
          border-top: 1px solid var(--border);
        }

        .sv-logout-btn {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          font-size: 14px;
          font-weight: 500;
          color: var(--ink-secondary);
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          width: 100%;
          transition: all 0.15s;
          letter-spacing: -0.01em;
        }

        .sv-logout-btn:hover {
          background: var(--surface);
          color: #dc2626;
        }

        .sv-divider {
          height: 1px;
          background: var(--border);
          margin: 16px 0;
        }

        .sv-section-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: var(--ink-muted);
          margin-bottom: 10px;
          padding: 0 4px;
        }

        /* Main */
        .sv-main {
          flex: 1;
          border-right: 1px solid var(--border);
          min-height: 100vh;
        }

        .sv-header {
          position: sticky;
          top: 0;
          background: ${isDark ? 'rgba(10,10,10,0.88)' : 'rgba(255,255,255,0.88)'};
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          z-index: 50;
          padding: 18px 36px;
        }

        .sv-header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sv-greeting { display: flex; flex-direction: column; }

        .sv-greeting-sub {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: var(--ink-muted);
        }

        .sv-greeting-main {
          font-family: var(--font-serif);
          font-size: 26px;
          letter-spacing: -0.02em;
          color: var(--ink);
          line-height: 1.1;
          margin-top: 2px;
        }

        .sv-header-actions { display: flex; align-items: center; gap: 10px; }

        .sv-theme-btn {
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

        .sv-theme-btn:hover {
          border-color: var(--purple-mid);
          background: var(--purple-light);
          color: var(--purple);
        }

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
          font-size: 14px;
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

        .sv-search::placeholder { color: var(--ink-muted); }

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

        /* Feature Cards */
        .sv-features-area {
          padding: 24px 36px;
        }

        .sv-features-intro {
          margin-bottom: 20px;
        }

        .sv-features-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--purple);
          margin-bottom: 8px;
        }

        .sv-features-heading {
          font-family: var(--font-serif);
          font-size: 28px;
          letter-spacing: -0.025em;
          color: var(--ink);
          line-height: 1.15;
          margin-bottom: 8px;
        }

        .sv-features-subheading {
          font-size: 14px;
          color: var(--ink-secondary);
          line-height: 1.5;
          max-width: 520px;
          letter-spacing: -0.005em;
        }

        .sv-feature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .sv-feature-card {
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s, background 0.2s;
          background: var(--white);
          position: relative;
          overflow: hidden;
        }

        .sv-feature-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
        }

        .sv-feature-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .sv-feature-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sv-feature-arrow {
          color: var(--ink-muted);
          transition: transform 0.2s, color 0.2s;
          flex-shrink: 0;
        }

        .sv-feature-card:hover .sv-feature-arrow {
          transform: translate(3px, -3px);
        }

        .sv-feature-label {
          font-size: 15px;
          font-weight: 600;
          color: var(--ink);
          letter-spacing: -0.02em;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .sv-feature-badge {
          font-size: 8px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          padding: 2px 5px;
          border-radius: 4px;
          color: white;
        }

        .sv-feature-desc {
          font-size: 12px;
          color: var(--ink-secondary);
          line-height: 1.4;
          letter-spacing: -0.005em;
        }

        .sv-feature-cta {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 12px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: -0.01em;
          border: none;
          background: none;
          cursor: pointer;
          padding: 0;
          transition: gap 0.15s;
        }

        .sv-feature-cta:hover { gap: 8px; }

        /* Right Sidebar */
        .sv-sidebar-right {
          width: 280px;
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          padding: 28px 22px;
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

        /* Quick Access Panel */
        .sv-quick-access {
          background: var(--surface);
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
          gap: 13px;
          padding: 13px 18px;
          cursor: pointer;
          transition: background 0.15s;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          border-bottom: 1px solid var(--border);
        }

        .sv-quick-item:last-child { border-bottom: none; }

        .sv-quick-item:hover { background: ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)'}; }

        .sv-quick-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sv-quick-icon svg {
          width: 15px;
          height: 15px;
        }

        .sv-quick-label {
          font-size: 13.5px;
          font-weight: 500;
          color: var(--ink);
          letter-spacing: -0.01em;
          flex: 1;
        }

        .sv-quick-arrow {
          color: var(--ink-muted);
          opacity: 0;
          transition: opacity 0.15s, transform 0.15s;
        }

        .sv-quick-item:hover .sv-quick-arrow {
          opacity: 1;
          transform: translate(2px, -2px);
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
          gap: 8px;
          padding: 10px 14px;
          border-bottom: 1px solid var(--border);
          min-width: 0;
        }

        .sv-suggested-item:last-child {
          border-bottom: none;
        }

        .sv-suggested-user {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 0;
          cursor: pointer;
          padding: 4px;
          border-radius: var(--radius-sm);
          transition: background 0.15s;
          border: none;
          background: none;
          text-align: left;
          overflow: hidden;
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
          overflow: hidden;
        }

        .sv-suggested-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--ink);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sv-suggested-username {
          font-size: 11px;
          color: var(--ink-muted);
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sv-suggested-bio {
          font-size: 10px;
          color: var(--ink-secondary);
          margin-top: 2px;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .sv-suggested-arrow {
          color: var(--ink-muted);
          opacity: 0;
          transition: opacity 0.15s, transform 0.15s;
          flex-shrink: 0;
          display: none;
        }

        .sv-suggested-user:hover .sv-suggested-arrow {
          opacity: 1;
          transform: translate(2px, -2px);
        }

        .sv-suggested-follow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 5px 8px;
          border-radius: var(--radius-sm);
          background: var(--purple);
          border: none;
          color: white;
          cursor: pointer;
          transition: all 0.15s;
          font-size: 11px;
          font-weight: 500;
          flex-shrink: 0;
          white-space: nowrap;
        }

        .sv-suggested-follow:hover {
          background: var(--purple-mid);
          transform: translateY(-1px);
        }

        /* Global Posts Feed Styles */
        .sv-posts-feed-section {
          padding: 32px 36px;
          border-top: 1px solid var(--border);
        }

        .sv-posts-feed-intro {
          margin-bottom: 24px;
        }

        .sv-posts-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--purple);
          margin-bottom: 8px;
        }

        .sv-posts-heading {
          font-family: var(--font-serif);
          font-size: 24px;
          letter-spacing: -0.025em;
          color: var(--ink);
          line-height: 1.15;
          margin-bottom: 8px;
        }

        .sv-posts-subheading {
          font-size: 14px;
          color: var(--ink-secondary);
          line-height: 1.5;
        }

        .sv-posts-feed {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .sv-feed-post {
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px;
          background: var(--white);
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .sv-feed-post:hover {
          border-color: var(--purple-mid);
          box-shadow: var(--shadow-sm);
        }

        .sv-feed-post-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .sv-feed-post-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sv-feed-avatar {
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

        .sv-feed-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sv-feed-user-info {
          display: flex;
          flex-direction: column;
        }

        .sv-feed-username {
          font-size: 15px;
          font-weight: 600;
          color: var(--ink);
        }

        .sv-feed-handle {
          font-size: 13px;
          color: var(--ink-muted);
        }

        .sv-feed-post-content {
          margin-bottom: 16px;
        }

        .sv-feed-post-text {
          font-size: 15px;
          color: var(--ink);
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .sv-feed-post-image {
          width: 100%;
          max-width: 400px;
          border-radius: var(--radius-md);
        }

        .sv-feature-badge-row {
          margin-bottom: 12px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .sv-feature-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sv-feature-badge.psychology {
          background: rgba(124, 58, 237, 0.15);
          color: #7c3aed;
        }

        .sv-feature-badge.psychology:hover {
          background: #7c3aed;
          color: white;
          transform: translateY(-1px);
        }

        .sv-feature-badge.narrative {
          background: rgba(0, 144, 204, 0.15);
          color: #0090cc;
        }

        .sv-feature-badge.narrative:hover {
          background: #0090cc;
          color: white;
          transform: translateY(-1px);
        }

        .sv-feature-data {
          background: ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'};
          border-radius: var(--radius-md);
          padding: 16px;
          margin-bottom: 12px;
        }

        .sv-feature-name {
          font-size: 16px;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 8px;
        }

        .sv-feature-summary {
          font-size: 14px;
          color: var(--ink-secondary);
          line-height: 1.5;
        }

        .sv-expand-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 8px;
          padding: 4px 8px;
          font-size: 12px;
          color: var(--purple);
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 500;
          transition: color 0.2s;
        }

        .sv-expand-btn:hover {
          color: var(--purple-dark);
          text-decoration: underline;
        }

        .sv-feed-post-actions {
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

        .sv-action-spacer {
          flex: 1;
        }

        @keyframes sv-fadein {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .sv-feature-card { animation: sv-fadein 0.4s ease both; }
        .sv-feature-card:nth-child(1) { animation-delay: 0.05s; }
        .sv-feature-card:nth-child(2) { animation-delay: 0.10s; }
        .sv-feature-card:nth-child(3) { animation-delay: 0.15s; }
        .sv-feature-card:nth-child(4) { animation-delay: 0.20s; }

        /* Post Creation Modal Styles */
        .sv-modal-overlay {
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
          backdrop-filter: blur(4px);
        }

        .sv-modal {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: var(--shadow-md);
        }

        .sv-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
        }

        .sv-modal-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--ink);
          margin: 0;
        }

        .sv-close-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--ink-secondary);
          transition: all 0.15s;
        }

        .sv-close-btn:hover {
          background: var(--surface);
          color: var(--ink);
        }

        .sv-post-type-tabs {
          display: flex;
          padding: 0 24px;
          border-bottom: 1px solid var(--border);
        }

        .sv-type-tab {
          flex: 1;
          padding: 12px 0;
          background: none;
          border: none;
          font-size: 14px;
          font-weight: 500;
          color: var(--ink-secondary);
          cursor: pointer;
          transition: all 0.15s;
          border-bottom: 2px solid transparent;
        }

        .sv-type-tab.active {
          color: var(--purple);
          border-bottom-color: var(--purple);
        }

        .sv-type-tab:hover {
          color: var(--ink);
        }

        .sv-modal-content {
          padding: 24px;
        }

        .sv-text-input {
          width: 100%;
          min-height: 120px;
          padding: 12px 16px;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          font-family: var(--font-sans);
          font-size: 14px;
          color: var(--ink);
          background: var(--white);
          resize: vertical;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .sv-text-input:focus {
          border-color: var(--purple-mid);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.12);
        }

        .sv-text-input::placeholder {
          color: var(--ink-muted);
        }

        .sv-image-upload-area {
          border: 2px dashed var(--border);
          border-radius: var(--radius-md);
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.15s;
          background: var(--surface);
        }

        .sv-image-upload-area:hover {
          border-color: var(--purple-mid);
          background: var(--purple-light);
        }

        .sv-image-preview {
          margin-top: 16px;
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .sv-image-preview img {
          width: 100%;
          height: auto;
          object-fit: cover;
        }

        .sv-image-caption {
          width: 100%;
          min-height: 80px;
          margin-top: 16px;
          padding: 12px 16px;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          font-family: var(--font-sans);
          font-size: 14px;
          color: var(--ink);
          background: var(--white);
          resize: vertical;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .sv-image-caption:focus {
          border-color: var(--purple-mid);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.12);
        }

        .sv-image-caption::placeholder {
          color: var(--ink-muted);
        }

        .sv-modal-actions {
          display: flex;
          gap: 12px;
          padding: 20px 24px;
          border-top: 1px solid var(--border);
        }

        .sv-modal-btn {
          flex: 1;
          padding: 10px 20px;
          border-radius: var(--radius-sm);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          border: none;
        }

        .sv-modal-btn.primary {
          background: var(--purple);
          color: white;
        }

        .sv-modal-btn.primary:hover {
          background: var(--purple-mid);
        }

        .sv-modal-btn.secondary {
          background: var(--surface);
          color: var(--ink-secondary);
          border: 1px solid var(--border);
        }

        .sv-modal-btn.secondary:hover {
          background: var(--border);
          color: var(--ink);
        }

        .sv-upload-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 16px;
          color: var(--ink-muted);
        }

        .sv-upload-text {
          font-size: 14px;
          color: var(--ink-secondary);
          margin-bottom: 8px;
        }

        .sv-upload-hint {
          font-size: 12px;
          color: var(--ink-muted);
        }

        @media (max-width: 900px) {
          .sv-feature-grid { grid-template-columns: 1fr; }
          .sv-modal {
            width: 95%;
            margin: 20px;
          }
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
              <button className="sv-nav-item active" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <Home size={16} />
                Home
              </button>
              <button className="sv-nav-item" onClick={() => navigate('/profile')}>
                <User size={16} />
                Profile
              </button>

              {/* <div className="sv-divider" />
              <p className="sv-section-label">Features</p>

              <button className="sv-nav-feature" onClick={() => navigate('/psychology')}>
                <Brain size={15} style={{ color: '#6d28d9', flexShrink: 0 }} />
                Psychology
                <span className="sv-nav-badge" style={{ background: '#6d28d9' }}>AI</span>
              </button>

              <button className="sv-nav-feature" onClick={() => navigate('/narrative')}>
                <GitBranch size={15} style={{ color: '#0090cc', flexShrink: 0 }} />
                Narrative
                <span className="sv-nav-badge" style={{ background: '#0090cc' }}>AI</span>
              </button>

              <button className="sv-nav-feature" onClick={() => navigate('/analytics')}>
                <TrendingUp size={15} style={{ color: '#0090cc', flexShrink: 0 }} />
                Analytics
                <span className="sv-nav-badge" style={{ background: '#0090cc' }}>AI</span>
              </button>

              <button className="sv-nav-feature" onClick={() => navigate('/forum')}>
                <MessageCircle size={15} style={{ color: '#00a36b', flexShrink: 0 }} />
                Forum
                <span className="sv-nav-badge" style={{ background: '#00a36b' }}>AI</span>
              </button> */}
            </nav>

            {/* Logout Button */}
            <div className="sv-sidebar-footer">
              <button className="sv-logout-btn" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Log out</span>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="sv-main">
            {/* Header */}
            <header className="sv-header">
              <div className="sv-header-inner">
                <div className="sv-greeting">
                  <span className="sv-greeting-sub">StoryVerse</span>
                  <span className="sv-greeting-main">Welcome back</span>
                </div>
                <div className="sv-header-actions">
                  <button className="sv-theme-btn" onClick={toggleTheme}>
                    {isDark ? <Sun size={13} /> : <Moon size={13} />}
                    {isDark ? 'Light' : 'Dark'}
                  </button>
                  <div className="sv-search-wrap">
                    <Search size={13} />
                    <input className="sv-search" type="text" placeholder="Search anything..." />
                  </div>
                  <button className="sv-plus-btn" onClick={() => setShowPostModal(true)}><Plus size={16} /></button>
                </div>
              </div>
            </header>

            {/* Feature Cards */}
            <div className="sv-features-area">
              <div className="sv-features-intro">
                <p className="sv-features-eyebrow">Core Features</p>
                
                
              </div>

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
                    <div className="sv-feature-card-top">
                      <div
                        className="sv-feature-icon-wrap"
                        style={{ background: f.accentLight, color: f.accent }}
                      >
                        {f.icon}
                      </div>
                      <ArrowUpRight size={16} className="sv-feature-arrow" style={{ color: f.accent }} />
                    </div>

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
                ))}
              </div>
            </div>

            {/* Global Posts Feed */}
            {allPosts.length > 0 && (
              <div className="sv-posts-feed-section">
                <div className="sv-posts-feed-intro">
                  <p className="sv-posts-eyebrow">Community Feed</p>
                  <h2 className="sv-posts-heading">Latest from the Community</h2>
                  <p className="sv-posts-subheading">See what everyone in StoryVerse is sharing</p>
                </div>
                <div className="sv-posts-feed">
                  {allPosts.map(post => (
                    <div key={post.id} className="sv-feed-post">
                      <div className="sv-feed-post-header">
                        <div className="sv-feed-post-user" style={{ cursor: 'pointer' }} onClick={() => navigateToProfile(post.author.username)}>
                          <div className="sv-feed-avatar">
                            {post.author.avatar ? (
                              <img 
                                src={post.author.avatar.startsWith('http') ? post.author.avatar : `http://localhost:5000${post.author.avatar}`} 
                                alt={post.author.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <span>{post.author.name.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="sv-feed-user-info">
                            <div className="sv-feed-username">{post.author.name}</div>
                            <div className="sv-feed-handle">@{post.author.username}</div>
                          </div>
                        </div>
                        <button className="sv-more-btn">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>

                      <div className="sv-feed-post-content">
                        {/* Feature Tag Badges - Show both Psychology and Narrative for @AI posts */}
                        {post.featureTag === 'ai' && (
                          <div className="sv-feature-badge-row">
                            <button
                              className="sv-feature-badge psychology"
                              onClick={() => handleFeatureClick('psychology', post)}
                            >
                              <Brain size={14} />
                              <span>PSYCHOLOGY</span>
                            </button>
                            <button
                              className="sv-feature-badge narrative"
                              onClick={() => handleFeatureClick('narrative', post)}
                            >
                              <GitBranch size={14} />
                              <span>NARRATIVE</span>
                            </button>
                          </div>
                        )}
                        
                        {/* Feature Data Summary */}
                        {post.featureData && (
                          <div className="sv-feature-data">
                            <div className="sv-feature-name">{post.featureData.name || 'Untitled'}</div>
                            <div className="sv-feature-summary">
                              {expandedPosts.has(post.id) 
                                ? (post.featureData.fullContent || post.featureData.summary || '')
                                : (post.featureData.summary || post.featureData.fullContent?.substring(0, 100) + '...' || '')}
                            </div>
                            {(post.featureData.fullContent && post.featureData.fullContent.length > 100) && (
                              <button 
                                className="sv-expand-btn"
                                onClick={() => toggleExpand(post.id)}
                              >
                                {expandedPosts.has(post.id) ? (
                                  <><ChevronUp size={14} /> Show less</>
                                ) : (
                                  <><ChevronDown size={14} /> Show more</>
                                )}
                              </button>
                            )}
                          </div>
                        )}
                        
                        {/* Image Content (shown if post has an image) */}
                        {post.type === 'image' && post.imageUrl && (
                          <>
                            <img 
                              src={post.imageUrl?.startsWith('http') ? post.imageUrl : `http://localhost:5000${post.imageUrl}`} 
                              alt="Post image" 
                              className="sv-feed-post-image" 
                            />
                            {post.content && !post.featureTag && (
                              <p className="sv-feed-post-text" style={{ marginTop: '12px' }}>{post.content}</p>
                            )}
                          </>
                        )}
                        
                        {/* Text Content (only if no feature tag) */}
                        {post.type === 'text' && !post.featureTag && (
                          <p className="sv-feed-post-text">{post.content}</p>
                        )}
                      </div>

                      <div className="sv-feed-post-actions">
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
                        <button 
                          className={`sv-action-btn ${expandedComments.has(post.id) ? 'active' : ''}`}
                          onClick={() => toggleComments(post.id)}
                        >
                          <MessageCircle size={15} />
                          {post.commentCount || 0}
                        </button>
                        <div className="sv-action-spacer" />
                        <button className="sv-action-btn">
                          <Bookmark size={15} />
                        </button>
                      </div>

                      {/* Comments Section */}
                      {expandedComments.has(post.id) && (
                        <div className="sv-comments-section" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                          {/* Comment Input */}
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                            <input
                              type="text"
                              placeholder="Write a comment..."
                              value={commentInputs[post.id] || ''}
                              onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                              style={{
                                flex: 1,
                                padding: '8px 12px',
                                borderRadius: '10px',
                                border: '1px solid var(--border)',
                                background: 'var(--surface)',
                                color: 'var(--ink)',
                                fontSize: '14px',
                                outline: 'none',
                              }}
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              style={{
                                padding: '8px 12px',
                                background: 'var(--purple)',
                                border: 'none',
                                borderRadius: '10px',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Send size={16} />
                            </button>
                          </div>

                          {/* Comments List */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {(post.comments || []).map((comment: any) => (
                              <div key={comment.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                <div 
                                  style={{ 
                                    width: '28px', 
                                    height: '28px', 
                                    borderRadius: '50%', 
                                    background: 'var(--purple)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    color: 'white',
                                    flexShrink: 0,
                                    overflow: 'hidden',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => navigateToProfile(comment.author?.username)}
                                >
                                  {comment.author?.avatar ? (
                                    <img 
                                      src={comment.author.avatar.startsWith('http') ? comment.author.avatar : `http://localhost:5000${comment.author.avatar}`} 
                                      alt={comment.author.name}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                  ) : (
                                    <span>{comment.author?.name?.charAt(0).toUpperCase() || '?'}</span>
                                  )}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                    <span 
                                      style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', cursor: 'pointer' }}
                                      onClick={() => navigateToProfile(comment.author?.username)}
                                    >
                                      {comment.author?.name || 'Unknown'}
                                    </span>
                                    <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
                                      @{comment.author?.username || 'unknown'}
                                    </span>
                                  </div>
                                  <p style={{ fontSize: '14px', color: 'var(--ink-secondary)', margin: 0 }}>{comment.content}</p>
                                </div>
                                <button
                                  onClick={() => handleDeleteComment(post.id, comment.id)}
                                  style={{
                                    padding: '4px',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--ink-muted)',
                                    cursor: 'pointer',
                                    opacity: 0.6,
                                  }}
                                  title="Delete comment"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                            {(post.comments || []).length === 0 && (
                              <p style={{ fontSize: '13px', color: 'var(--ink-muted)', textAlign: 'center', margin: 0 }}>
                                No comments yet. Be the first to comment!
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* Right Sidebar */}
          <aside className="sv-sidebar-right">
            {/* Profile */}
            <button className="sv-user-profile" onClick={() => navigate('/profile')}>
              <div className="sv-profile-avatar" style={{ overflow: 'hidden' }}>
                {currentUser?.avatar ? (
                  <img 
                    src={currentUser.avatar.startsWith('http') ? currentUser.avatar : `http://localhost:5000${currentUser.avatar}`}
                    alt={currentUser.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span>{currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'ME'}</span>
                )}
              </div>
              <div>
                <div className="sv-profile-name">{currentUser?.name || 'Your Profile'}</div>
                <div className="sv-profile-handle">@{currentUser?.username || 'yourusername'}</div>
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
                          <img 
                            src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`} 
                            alt={user.name} 
                          />
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

      {/* Post Creation Modal */}
      {showPostModal && (
        <div className="sv-modal-overlay" onClick={() => setShowPostModal(false)}>
          <div className="sv-modal" onClick={e => e.stopPropagation()}>
            <div className="sv-modal-header">
              <h3 className="sv-modal-title">Create New Post</h3>
              <button className="sv-close-btn" onClick={() => setShowPostModal(false)}><X size={15} /></button>
            </div>
            <div className="sv-post-type-tabs">
              <button className={`sv-type-tab ${postType === 'text' ? 'active' : ''}`} onClick={() => setPostType('text')}>Text Post</button>
              <button className={`sv-type-tab ${postType === 'image' ? 'active' : ''}`} onClick={() => setPostType('image')}>Image Post</button>
            </div>
            <div className="sv-modal-content">
              {postType === 'text' ? (
                <textarea
                  className="sv-text-input"
                  placeholder={"What's on your mind?\n\nTip: Use @AI to create entries for Psychology & Narrative"}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  style={postContent.toLowerCase().includes('@ai') ? { borderColor: 'var(--purple)' } : {}}
                />
              ) : (
                <div>
                  {!selectedImage ? (
                    <div className="sv-image-upload-area" onClick={() => document.getElementById('image-upload')?.click()}>
                      <Camera className="sv-upload-icon" />
                      <div className="sv-upload-text">Click to upload an image</div>
                      <div className="sv-upload-hint">PNG, JPG, GIF up to 10MB</div>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageSelect}
                      />
                    </div>
                  ) : (
                    <div className="sv-image-preview">
                      <img src={selectedImage} alt="Selected" />
                      <button
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '30px',
                          height: '30px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={() => setSelectedImage(null)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  <textarea
                    className="sv-image-caption"
                    placeholder="Add a caption...\n\nTip: Use @AI to create an entry for Psychology and Narrative (line 1 = name, rest = description)"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    style={{ borderColor: imageCaption.toLowerCase().includes('@ai') ? 'var(--purple)' : undefined }}
                  />
                  {imageCaption.toLowerCase().includes('@ai') && (
                    <div style={{ 
                      marginTop: '8px', 
                      padding: '6px 12px', 
                      background: 'var(--purple-light)', 
                      border: '1px solid var(--purple)', 
                      borderRadius: '8px', 
                      fontSize: '12px', 
                      color: 'var(--purple)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span style={{ 
                        background: 'var(--purple)', 
                        color: 'white', 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        fontWeight: 600,
                        fontSize: '11px'
                      }}>@AI</span>
                      <span>This caption will create entries in Psychology & Narrative</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="sv-modal-actions">
              <button className="sv-modal-btn secondary" onClick={() => setShowPostModal(false)}>Cancel</button>
              <button className="sv-modal-btn primary" onClick={handleCreatePost}>Post</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 1024px) {
          #sv-left { display: flex !important; }
        }
      `}</style>
    </>
  );
};

export default HomeFeed;
