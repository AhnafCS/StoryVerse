import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import api from "../services/api";
import {
  User, Edit2, Save, X, Plus, Image, MessageCircle, Heart, Bookmark,
  Settings, ArrowLeft, Sun, Moon, Search, Brain, GitBranch,
  Film, Book, Tv, Star, Tag, Filter, Camera, ChevronDown, ChevronUp, Send, Trash2
} from "lucide-react";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────
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
  name: string;
  username: string;
  bio: string;
  avatar: string;
  posts: UserPost[];
}

interface MediaEntry {
  _id: string;
  title: string;
  type: string;
  creator?: string;
  releaseYear?: number;
  summary?: string;
  genres?: string[];
  tags?: string[];
}

// ── Constants ─────────────────────────────────────────────────────────────
const GENRES = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
  'Mystery', 'Psychological', 'Romance', 'Sci-Fi', 'Slice of Life', 'Thriller'];
const COMMON_TAGS = ['Dark Themes', 'Coming of Age', 'Magic System', 'Plot Twist',
  'Anti-Hero', 'Redemption Arc', 'Isekai', 'Time Travel', 'Dystopia', 'Found Family'];
const MEDIA_TYPES = ['Anime', 'Book', 'Series', 'Movie', 'Other'];
const TYPE_ICONS: Record<string, React.ReactNode> = {
  Anime: <Film size={13} />, Book: <Book size={13} />,
  Series: <Tv size={13} />, Movie: <Film size={13} />, Other: <Star size={13} />,
};

const UserProfile = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  // ── Profile state ─────────────────────────────────────────────────────────
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempUsername, setTempUsername] = useState("");
  const [tempBio, setTempBio] = useState("");

  const [showPostModal, setShowPostModal] = useState(false);
  const [postType, setPostType] = useState<'text' | 'image'>('text');
  const [postContent, setPostContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageCaption, setImageCaption] = useState("");

  // Avatar upload state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Comments state
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

  // ── Media Library state ───────────────────────────────────────────────────
  const [mediaList, setMediaList] = useState<MediaEntry[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [mediaLoading, setMediaLoading] = useState(false);
  const [showAddMedia, setShowAddMedia] = useState(false);
  const [activeTab, setActiveTab] = useState<'library' | 'favorites'>('library');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGenre, setFilterGenre] = useState("");
  const [filterType, setFilterType] = useState("");
  const [notification, setNotification] = useState("");

  const [mediaForm, setMediaForm] = useState({
    title: "", type: "Anime", creator: "", releaseYear: "",
    summary: "", genres: [] as string[], tags: [] as string[],
  });
  const [customTag, setCustomTag] = useState("");
  const [addingMedia, setAddingMedia] = useState(false);

  // ── Get userId from localStorage ─────────────────────────────────────────
  const getUserId = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try { return JSON.parse(userStr)?.id || JSON.parse(userStr)?._id || null; }
    catch { return null; }
  };

  // ── Load profile ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const profileResponse = await api.profile.getCurrentProfile();
        setUserProfile(profileResponse.user);
        const postsResponse = await api.posts.getUserPosts(profileResponse.user.username);
        setUserPosts(postsResponse.posts || []);
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  // ── Load media & favorites ────────────────────────────────────────────────
  const loadMedia = useCallback(async (filters = {}) => {
    setMediaLoading(true);
    try {
      const data = await api.media.getAll(filters);
      setMediaList(Array.isArray(data) ? data : []);
    } catch {
      setMediaList([]);
    } finally {
      setMediaLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMedia();
    const userId = getUserId();
    if (userId) {
      api.favorites.get(userId)
        .then((favs: MediaEntry[]) => setFavorites(new Set(favs.map(f => f._id))))
        .catch(() => {});
    }
  }, [loadMedia]);

  // ── Search debounce ───────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      const filters: any = {};
      if (searchTerm) filters.title = searchTerm;
      if (filterGenre) filters.genre = filterGenre;
      if (filterType) filters.genre = filterType;
      loadMedia(filters);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm, filterGenre, filterType, loadMedia]);

  // ── Notification helper ───────────────────────────────────────────────────
  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  // ── Toggle genre/tag in form ──────────────────────────────────────────────
  const toggleFormItem = (field: 'genres' | 'tags', value: string) => {
    setMediaForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }));
  };

  // ── Add media ─────────────────────────────────────────────────────────────
  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingMedia(true);
    try {
      await api.media.add({
        ...mediaForm,
        releaseYear: mediaForm.releaseYear ? parseInt(mediaForm.releaseYear) : undefined,
      });
      setShowAddMedia(false);
      setMediaForm({ title: "", type: "Anime", creator: "", releaseYear: "", summary: "", genres: [], tags: [] });
      loadMedia();
      showNotif("Media added to library!");
    } catch {
      showNotif("Failed to add media");
    } finally {
      setAddingMedia(false);
    }
  };

  // ── Toggle favorite ───────────────────────────────────────────────────────
  const toggleFavorite = async (mediaId: string) => {
    const userId = getUserId();
    if (!userId) { showNotif("Please log in"); return; }
    const wasSaved = favorites.has(mediaId);
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(mediaId) ? next.delete(mediaId) : next.add(mediaId);
      return next;
    });
    try {
      if (wasSaved) {
        await api.favorites.remove(userId, mediaId);
        showNotif("Removed from favorites");
      } else {
        await api.favorites.add(userId, mediaId);
        showNotif("Saved to favorites ★");
      }
    } catch {
      setFavorites(prev => {
        const next = new Set(prev);
        wasSaved ? next.add(mediaId) : next.delete(mediaId);
        return next;
      });
    }
  };

  // ── Profile edit handlers ─────────────────────────────────────────────────
  const handleSaveName = async () => {
    if (tempName.trim() && userProfile) {
      try {
        const res = await api.profile.updateProfile({ name: tempName.trim() });
        setUserProfile(res.user);
        setIsEditingName(false);
      } catch {}
    }
  };

  const handleSaveUsername = async () => {
    if (tempUsername.trim() && userProfile) {
      try {
        const res = await api.profile.updateProfile({ username: tempUsername.trim() });
        setUserProfile(res.user);
        setIsEditingUsername(false);
      } catch {}
    }
  };

  const handleSaveBio = async () => {
    if (userProfile) {
      try {
        const res = await api.profile.updateProfile({ bio: tempBio });
        setUserProfile(res.user);
        setIsEditingBio(false);
      } catch {}
    }
  };

  // ── Create post ───────────────────────────────────────────────────────────
  const handleCreatePost = async () => {
    const contentToUse = postType === 'image' ? imageCaption : postContent;
    if (contentToUse.trim() || selectedImage) {
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
        
        const postData = {
          type: postType,
          content: postType === 'text' ? trimmedContent : trimmedContent, // Caption is the content for image posts
          imageUrl: postType === 'image' ? selectedImage : '',
          featureTag,
          featureData
        };

        const response = await api.posts.createPost(postData);
        
        // Add new post to the posts list
        setUserPosts(prev => [response.post, ...prev]);
        
        // Reset form
        setPostContent("");
        setImageCaption("");
        setSelectedImage(null);
        setShowPostModal(false);
        setPostType('text');
      } catch (error) {
        console.error('Failed to create post:', error);
        toast.error('Failed to create post');
      }
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const response = await api.upload.avatar(file);
      
      // Update profile with new avatar URL
      await api.profile.updateProfile({ avatar: response.avatarUrl });
      
      // Update local state
      setUserProfile(prev => prev ? { ...prev, avatar: response.avatarUrl } : null);
      
      toast.success('Profile picture updated successfully!');
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast.error(error.message || 'Failed to upload profile picture');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle post image upload via API
  const handlePostImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    try {
      const response = await api.upload.postImage(file);
      setSelectedImage(response.imageUrl);
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    }
  };

  // Handle comment submission
  const handleAddComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    try {
      const response = await api.posts.addComment(postId, content);
      
      // Update the post's comments in state
      setUserPosts(prev => prev.map(post => 
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
      
      setUserPosts(prev => prev.map(post => 
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

  // Toggle comments visibility
  const toggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  // Toggle post content expansion
  const toggleExpand = (postId: string) => {
    setExpandedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  const displayedMedia = activeTab === 'favorites'
    ? mediaList.filter(m => favorites.has(m._id))
    : mediaList;

  if (loading) return <div className="up-root" style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',fontFamily:'system-ui',color:'#9a9a9a' }}>Loading profile...</div>;

  if (error || !userProfile) return (
    <div className="up-root" style={{ fontFamily:'system-ui' }}>
      <div style={{ padding: 40, textAlign:'center', color:'#9a9a9a' }}>
        {error || 'Failed to load profile'}
        <br /><button onClick={() => navigate('/feed')} style={{ marginTop:16,padding:'8px 20px',background:'#6d28d9',color:'white',border:'none',borderRadius:8,cursor:'pointer' }}>Return to Feed</button>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');
        * { box-sizing: border-box; }
        :root {
          ${isDark ? `
          --white: #0a0a0a; --ink: #f5f5f5; --ink-secondary: #a0a0a0; --ink-muted: #6a6a6a;
          --ink-faint: #2a2a2a; --surface: #141414; --border: #222222;
          --shadow-xs: 0 1px 3px rgba(0,0,0,0.3); --shadow-sm: 0 2px 12px rgba(0,0,0,0.4);
          ` : `
          --white: #ffffff; --ink: #0d0d0d; --ink-secondary: #4a4a4a; --ink-muted: #9a9a9a;
          --ink-faint: #e8e8e8; --surface: #fafafa; --border: #efefef;
          --shadow-xs: 0 1px 3px rgba(0,0,0,0.06); --shadow-sm: 0 2px 12px rgba(0,0,0,0.07);
          `}
          --purple: #6d28d9; --purple-light: #ede9fe; --purple-mid: #8b5cf6;
          --radius-sm: 10px; --radius-md: 16px; --radius-lg: 22px;
          --font-serif: 'Instrument Serif', Georgia, serif;
          --font-sans: 'DM Sans', system-ui, sans-serif;
        }
        .up-root { font-family: var(--font-sans); background: var(--white); min-height: 100vh; color: var(--ink); -webkit-font-smoothing: antialiased; }
        .up-header { position: sticky; top: 0; background: ${isDark ? 'rgba(10,10,10,0.88)' : 'rgba(255,255,255,0.88)'}; backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); z-index: 50; padding: 14px 36px; }
        .up-header-inner { display: flex; align-items: center; justify-content: space-between; max-width: 860px; margin: 0 auto; }
        .up-header-left { display: flex; align-items: center; gap: 16px; }
        .up-back-btn { display: flex; align-items: center; gap: 8px; padding: 7px 12px; border-radius: var(--radius-sm); background: none; border: none; color: var(--ink-secondary); cursor: pointer; transition: all 0.15s; font-size: 14px; font-weight: 500; }
        .up-back-btn:hover { background: var(--surface); color: var(--ink); }
        .up-header-title { font-family: var(--font-serif); font-size: 22px; letter-spacing: -0.02em; color: var(--ink); }
        .up-header-actions { display: flex; align-items: center; gap: 10px; }
        .up-theme-btn { display: flex; align-items: center; gap: 7px; padding: 7px 13px; border-radius: 100px; background: var(--surface); border: 1px solid var(--border); cursor: pointer; font-size: 12px; font-weight: 500; color: var(--ink-secondary); transition: all 0.2s; }
        .up-theme-btn:hover { border-color: var(--purple-mid); color: var(--purple); }
        .up-search-wrap { position: relative; display: flex; align-items: center; }
        .up-search-wrap svg { position: absolute; left: 12px; color: var(--ink-muted); pointer-events: none; }
        .up-search { padding: 8px 16px 8px 36px; background: var(--surface); border: 1px solid var(--border); border-radius: 100px; font-size: 13px; font-family: var(--font-sans); color: var(--ink); outline: none; width: 200px; transition: border-color 0.2s, width 0.3s; }
        .up-search:focus { border-color: var(--purple-mid); width: 240px; }
        .up-main { max-width: 860px; margin: 0 auto; padding: 36px; }

        /* Profile */
        .up-profile-section { margin-bottom: 40px; }
        .up-profile-header { display: flex; align-items: flex-start; gap: 24px; margin-bottom: 28px; }
        .up-avatar { width: 88px; height: 88px; border-radius: 50%; background: var(--purple); display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 600; color: white; flex-shrink: 0; }
        .up-profile-info { flex: 1; }
        .up-name-row { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
        .up-display-name { font-size: 28px; font-weight: 700; color: var(--ink); letter-spacing: -0.02em; margin: 0; }
        .up-username-row { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
        .up-handle { font-size: 15px; color: var(--ink-muted); }
        .up-name-input { font-size: 28px; font-weight: 700; color: var(--ink); background: var(--surface); border: 1px solid var(--purple); border-radius: var(--radius-sm); padding: 4px 8px; outline: none; font-family: var(--font-sans); max-width: 280px; }
        .up-username-input { font-size: 22px; font-weight: 600; color: var(--ink); background: var(--surface); border: 1px solid var(--purple); border-radius: var(--radius-sm); padding: 4px 8px; outline: none; font-family: var(--font-sans); }
        .up-edit-btn-small { display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: var(--radius-sm); background: none; border: none; color: var(--ink-muted); cursor: pointer; opacity: 0.6; transition: all 0.15s; }
        .up-edit-btn-small:hover { background: var(--surface); color: var(--ink); opacity: 1; }
        .up-edit-btn { display: flex; align-items: center; gap: 6px; padding: 5px 11px; border-radius: var(--radius-sm); background: none; border: 1px solid var(--border); color: var(--ink-secondary); cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.15s; }
        .up-edit-btn:hover { background: var(--surface); color: var(--ink); }
        .up-save-btn { display: flex; align-items: center; gap: 5px; padding: 5px 11px; border-radius: var(--radius-sm); background: var(--purple); border: none; color: white; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.15s; }
        .up-save-btn:hover { background: var(--purple-mid); }
        .up-cancel-btn { display: flex; align-items: center; gap: 5px; padding: 5px 11px; border-radius: var(--radius-sm); background: none; border: 1px solid var(--border); color: var(--ink-secondary); cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.15s; }
        .up-bio { font-size: 15px; color: var(--ink-secondary); line-height: 1.6; margin-bottom: 14px; white-space: pre-wrap; }
        .up-bio-input { font-size: 15px; color: var(--ink); line-height: 1.6; background: var(--surface); border: 1px solid var(--purple); border-radius: var(--radius-sm); padding: 8px 12px; outline: none; font-family: var(--font-sans); resize: vertical; min-height: 80px; width: 100%; }
        .up-action-buttons { display: flex; gap: 8px; }
        .up-create-post-btn { display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: var(--radius-md); background: var(--purple); border: none; color: white; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.15s; }
        .up-create-post-btn:hover { background: var(--purple-mid); transform: translateY(-1px); }

        /* ── Media Library Section ── */
        .ml-section { margin-bottom: 48px; }
        .ml-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .ml-title { font-size: 20px; font-weight: 700; color: var(--ink); letter-spacing: -0.01em; }
        .ml-add-btn { display: flex; align-items: center; gap: 7px; padding: 9px 16px; background: var(--purple); color: white; border: none; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .ml-add-btn:hover { background: var(--purple-mid); transform: translateY(-1px); }

        /* Tabs */
        .ml-tabs { display: flex; gap: 4px; margin-bottom: 20px; border-bottom: 1px solid var(--border); }
        .ml-tab { padding: 8px 18px; font-size: 13px; font-weight: 500; color: var(--ink-muted); background: none; border: none; border-bottom: 2px solid transparent; margin-bottom: -1px; cursor: pointer; transition: all 0.15s; }
        .ml-tab:hover { color: var(--ink); }
        .ml-tab.active { color: var(--purple); border-bottom-color: var(--purple); font-weight: 600; }

        /* Filters */
        .ml-filters { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .ml-filter-input { padding: 8px 14px; background: var(--surface); border: 1px solid var(--border); border-radius: 100px; font-size: 13px; font-family: var(--font-sans); color: var(--ink); outline: none; transition: border-color 0.2s; }
        .ml-filter-input:focus { border-color: var(--purple-mid); }
        .ml-filter-select { padding: 8px 14px; background: var(--surface); border: 1px solid var(--border); border-radius: 100px; font-size: 13px; font-family: var(--font-sans); color: var(--ink); outline: none; cursor: pointer; }

        /* Media grid */
        .ml-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
        .ml-card { border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px; background: var(--white); transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s; }
        .ml-card:hover { border-color: var(--purple-mid); box-shadow: var(--shadow-sm); transform: translateY(-2px); }
        .ml-card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 10px; }
        .ml-type-badge { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; padding: 3px 9px; border-radius: 100px; background: var(--purple-light); color: var(--purple); }
        .ml-fav-btn { background: none; border: none; cursor: pointer; color: var(--ink-muted); transition: color 0.15s; padding: 2px; border-radius: 4px; display: flex; }
        .ml-fav-btn:hover { color: var(--purple); }
        .ml-fav-btn.saved { color: var(--purple); }
        .ml-card-title { font-size: 15px; font-weight: 700; color: var(--ink); margin-bottom: 3px; line-height: 1.3; }
        .ml-card-creator { font-size: 12px; color: var(--ink-muted); margin-bottom: 10px; }
        .ml-card-summary { font-size: 13px; color: var(--ink-secondary); line-height: 1.55; margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .ml-tags { display: flex; flex-wrap: wrap; gap: 5px; }
        .ml-tag { font-size: 11px; padding: 2px 8px; border-radius: 100px; background: var(--surface); color: var(--ink-secondary); border: 1px solid var(--border); }
        .ml-genre-tag { font-size: 11px; padding: 2px 8px; border-radius: 100px; background: ${isDark ? 'rgba(109,40,217,0.15)' : '#ede9fe'}; color: var(--purple); }
        .ml-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px; color: var(--ink-muted); text-align: center; gap: 12px; }
        .ml-empty-icon { font-size: 36px; }

        /* Add Media Modal */
        .ml-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .ml-modal { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px; width: 100%; max-width: 520px; max-height: 85vh; overflow-y: auto; }
        .ml-modal-title { font-family: var(--font-serif); font-size: 22px; color: var(--ink); margin-bottom: 20px; }
        .ml-field { margin-bottom: 14px; }
        .ml-label { display: block; font-size: 11px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: var(--ink-muted); margin-bottom: 6px; }
        .ml-input { width: 100%; padding: 9px 13px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 14px; font-family: var(--font-sans); color: var(--ink); outline: none; transition: border-color 0.2s; }
        .ml-input:focus { border-color: var(--purple); }
        .ml-select { width: 100%; padding: 9px 13px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 14px; font-family: var(--font-sans); color: var(--ink); outline: none; cursor: pointer; }
        .ml-tags-wrap { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 6px; }
        .ml-tag-toggle { font-size: 12px; padding: 4px 10px; border-radius: 100px; border: 1px solid var(--border); background: none; color: var(--ink-muted); cursor: pointer; transition: all 0.15s; }
        .ml-tag-toggle:hover { border-color: var(--purple); color: var(--purple); }
        .ml-tag-toggle.active-genre { background: var(--purple); border-color: var(--purple); color: white; }
        .ml-tag-toggle.active-tag { background: #db2777; border-color: #db2777; color: white; }
        .ml-custom-tag-row { display: flex; gap: 8px; margin-top: 8px; }
        .ml-modal-actions { display: flex; gap: 10px; margin-top: 20px; }
        .ml-btn-primary { flex: 1; padding: 10px; background: var(--purple); color: white; border: none; border-radius: var(--radius-sm); font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
        .ml-btn-primary:hover { background: var(--purple-mid); }
        .ml-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .ml-btn-secondary { padding: 10px 18px; background: var(--surface); color: var(--ink); border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 14px; font-weight: 500; cursor: pointer; }

        /* Posts section */
        .up-posts-section { margin-bottom: 48px; }
        .up-section-title { font-size: 18px; font-weight: 600; color: var(--ink); margin-bottom: 20px; }
        .up-post { border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; margin-bottom: 14px; background: var(--white); transition: border-color 0.2s; }
        .up-post:hover { border-color: var(--purple-mid); }
        .up-post-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .up-post-user { display: flex; align-items: center; gap: 12px; }
        .up-post-avatar { width: 38px; height: 38px; border-radius: 50%; background: var(--purple); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: white; }
        .up-post-username { font-size: 14px; font-weight: 600; color: var(--ink); }
        .up-post-time { font-size: 12px; color: var(--ink-muted); }
        .up-post-text { font-size: 15px; color: var(--ink); line-height: 1.6; white-space: pre-wrap; }
        .up-post-actions { display: flex; align-items: center; gap: 4px; padding-top: 14px; border-top: 1px solid var(--border); }
        .up-action-btn { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 500; color: var(--ink-secondary); background: none; border: none; cursor: pointer; transition: all 0.15s; }
        .up-action-btn:hover { background: var(--surface); color: var(--ink); }
        .up-action-btn.liked { color: #e11d48; }
        .up-action-spacer { flex: 1; }

        /* Modal for post */
        .up-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
        .up-modal { background: var(--white); border-radius: var(--radius-lg); padding: 28px; max-width: 480px; width: 90%; max-height: 80vh; overflow-y: auto; }
        .up-modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .up-modal-title { font-size: 18px; font-weight: 600; color: var(--ink); }
        .up-close-btn { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%; background: none; border: none; color: var(--ink-muted); cursor: pointer; }
        .up-close-btn:hover { background: var(--surface); }
        .up-post-type-tabs { display: flex; gap: 8px; margin-bottom: 20px; }
        .up-type-tab { flex: 1; padding: 9px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: none; color: var(--ink-secondary); cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.15s; }
        .up-type-tab.active { background: var(--purple); border-color: var(--purple); color: white; }
        .up-textarea { width: 100%; min-height: 110px; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface); color: var(--ink); font-size: 15px; font-family: var(--font-sans); resize: vertical; outline: none; }
        .up-textarea:focus { border-color: var(--purple); }
        .up-modal-actions { display: flex; gap: 10px; margin-top: 20px; }
        .up-modal-btn { flex: 1; padding: 11px; border-radius: var(--radius-sm); font-size: 14px; font-weight: 500; cursor: pointer; border: none; }
        .up-modal-btn.primary { background: var(--purple); color: white; }
        .up-modal-btn.primary:hover { background: var(--purple-mid); }
        .up-modal-btn.secondary { background: var(--surface); border: 1px solid var(--border); color: var(--ink); }

        /* Toast */
        .sv-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: var(--ink); color: var(--white); padding: 11px 22px; border-radius: 100px; font-size: 14px; font-weight: 500; z-index: 300; animation: sv-toast-in 0.3s ease; }
        @keyframes sv-toast-in { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

        .up-feature-badge-row { margin-bottom: 10px; display: flex; gap: 8px; flex-wrap: wrap; }
        .up-feature-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 11px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; border: none; cursor: pointer; transition: all 0.2s; }
        .up-feature-badge.psychology { background: rgba(124,58,237,0.15); color: #7c3aed; }
        .up-feature-badge.psychology:hover { background: #7c3aed; color: white; }
        .up-feature-badge.narrative { background: rgba(0,144,204,0.15); color: #0090cc; }
        .up-feature-badge.narrative:hover { background: #0090cc; color: white; }
        .up-image-upload { border: 2px dashed var(--border); border-radius: var(--radius-md); padding: 28px; text-align: center; cursor: pointer; transition: all 0.15s; }
        .up-image-upload:hover { border-color: var(--purple); background: var(--purple-light); }
        .up-image-preview { width: 100%; max-width: 280px; border-radius: var(--radius-md); margin-top: 14px; }
        .up-post-image { width: 100%; max-width: 400px; border-radius: var(--radius-md); margin-top: 12px; }
        .up-post-content { margin-bottom: 16px; }
        .up-feature-data { background: ${theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'}; border-radius: var(--radius-md); padding: 16px; margin-bottom: 12px; }
        .up-feature-name { font-size: 16px; font-weight: 700; color: var(--ink); margin-bottom: 8px; }
        .up-feature-summary { font-size: 14px; color: var(--ink-secondary); line-height: 1.5; }
        .up-avatar-container:hover .up-avatar-overlay { transform: scale(1.1); }
        .up-avatar-container:hover .up-avatar { opacity: 0.8; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .up-action-btn.active { color: var(--purple); }
      `}</style>

      <div className="up-root">
        {/* Header */}
        <header className="up-header">
          <div className="up-header-inner">
            <div className="up-header-left">
              <button className="up-back-btn" onClick={() => navigate('/feed')}>
                <ArrowLeft size={15} /> Back
              </button>
              <h1 className="up-header-title">Profile</h1>
            </div>
            <div className="up-header-actions">
              <button className="up-theme-btn" onClick={toggleTheme}>
                {isDark ? <Sun size={13} /> : <Moon size={13} />}
                {isDark ? 'Light' : 'Dark'}
              </button>
              {/* Search — searches media library */}
              <div className="up-search-wrap">
                <Search size={13} />
                <input
                  className="up-search"
                  type="text"
                  placeholder="Search media..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </header>

        <main className="up-main">
          {/* ── Profile Section ── */}
          <section className="up-profile-section">
            <div className="up-profile-header">
              <div 
                className="up-avatar-container" 
                style={{ position: 'relative', cursor: 'pointer' }}
                onClick={() => document.getElementById('avatar-upload')?.click()}
              >
                <div className="up-avatar">
                  {userProfile.avatar ? (
                    <img 
                      src={userProfile.avatar.startsWith('http') ? userProfile.avatar : `http://localhost:5000${userProfile.avatar}`} 
                      alt={userProfile.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                    />
                  ) : (
                    <span>{userProfile.name ? userProfile.name.charAt(0).toUpperCase() : userProfile.username.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div 
                  className="up-avatar-overlay"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '32px',
                    height: '32px',
                    background: 'var(--purple)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '3px solid var(--white)',
                  }}
                >
                  {isUploadingAvatar ? (
                    <div className="up-spinner-small" style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Camera size={16} color="white" />
                  )}
                </div>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarUpload}
                />
              </div>
              <div className="up-profile-info">
                {/* Name */}
                <div className="up-name-row">
                  {isEditingName ? (
                    <input className="up-name-input" value={tempName}
                      onChange={e => setTempName(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && handleSaveName()} autoFocus />
                  ) : (
                    <h1 className="up-display-name">{userProfile.name || userProfile.username}</h1>
                  )}
                  {isEditingName ? (
                    <div className="up-action-buttons">
                      <button className="up-save-btn" onClick={handleSaveName}><Save size={13} /></button>
                      <button className="up-cancel-btn" onClick={() => setIsEditingName(false)}><X size={13} /></button>
                    </div>
                  ) : (
                    <button className="up-edit-btn-small" onClick={() => { setIsEditingName(true); setTempName(userProfile.name || userProfile.username); }}>
                      <Edit2 size={11} />
                    </button>
                  )}
                </div>

                {/* Username */}
                <div className="up-username-row">
                  {isEditingUsername ? (
                    <input className="up-username-input" value={tempUsername}
                      onChange={e => setTempUsername(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && handleSaveUsername()} autoFocus />
                  ) : (
                    <span className="up-handle">@{userProfile.username}</span>
                  )}
                  {isEditingUsername ? (
                    <div className="up-action-buttons">
                      <button className="up-save-btn" onClick={handleSaveUsername}><Save size={12} /></button>
                      <button className="up-cancel-btn" onClick={() => setIsEditingUsername(false)}><X size={12} /></button>
                    </div>
                  ) : (
                    <button className="up-edit-btn-small" onClick={() => { setIsEditingUsername(true); setTempUsername(userProfile.username); }}>
                      <Edit2 size={10} />
                    </button>
                  )}
                </div>

                {/* Bio */}
                {isEditingBio ? (
                  <div>
                    <textarea className="up-bio-input" value={tempBio} onChange={e => setTempBio(e.target.value)} autoFocus />
                    <div className="up-action-buttons" style={{ marginTop: 10 }}>
                      <button className="up-save-btn" onClick={handleSaveBio}><Save size={13} /> Save</button>
                      <button className="up-cancel-btn" onClick={() => setIsEditingBio(false)}><X size={13} /> Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="up-bio">{userProfile.bio}</p>
                    <button className="up-edit-btn" onClick={() => { setIsEditingBio(true); setTempBio(userProfile.bio); }}>
                      <Edit2 size={13} /> Edit Bio
                    </button>
                  </div>
                )}
              </div>
            </div>
            <button className="up-create-post-btn" onClick={() => setShowPostModal(true)}>
              <Plus size={15} /> Create New Post
            </button>
          </section>

          {/* ── Media Library Section ── */}
          <section className="ml-section">
            <div className="ml-header">
              <div>
                <div className="ml-title">📚 My Media Library</div>
                <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 2 }}>
                  Add, tag, and bookmark your anime, books & series
                </div>
              </div>
              <button className="ml-add-btn" onClick={() => setShowAddMedia(true)}>
                <Plus size={14} /> Add Media
              </button>
            </div>

            {/* Tabs */}
            <div className="ml-tabs">
              {(['library', 'favorites'] as const).map(tab => (
                <button key={tab} className={`ml-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}>
                  {tab === 'library' ? `All Media (${mediaList.length})` : `★ Favorites (${favorites.size})`}
                </button>
              ))}
            </div>

            {/* Filters — Requirement 4: Search & Filter by genre/type */}
            <div className="ml-filters">
              <div className="up-search-wrap" style={{ flex: 1 }}>
                <Search size={13} />
                <input className="ml-filter-input" style={{ paddingLeft: 34, width: '100%' }}
                  placeholder="Search by title or creator..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <select className="ml-filter-select" value={filterGenre}
                onChange={e => setFilterGenre(e.target.value)}>
                <option value="">All Genres</option>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <select className="ml-filter-select" value={filterType}
                onChange={e => setFilterType(e.target.value)}>
                <option value="">All Types</option>
                {MEDIA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {(filterGenre || filterType || searchTerm) && (
                <button className="ml-btn-secondary" style={{ borderRadius: 100, padding: '8px 14px', fontSize: 12 }}
                  onClick={() => { setSearchTerm(""); setFilterGenre(""); setFilterType(""); loadMedia(); }}>
                  Clear
                </button>
              )}
            </div>

            {/* Media Grid */}
            {mediaLoading ? (
              <div className="ml-empty"><div className="ml-empty-icon">⏳</div><p>Loading...</p></div>
            ) : displayedMedia.length === 0 ? (
              <div className="ml-empty">
                <div className="ml-empty-icon">{activeTab === 'favorites' ? '★' : '📭'}</div>
                <p>{activeTab === 'favorites' ? 'No favorites yet. Click ★ on any media to save it!' : 'No media found. Click "Add Media" to get started!'}</p>
              </div>
            ) : (
              <div className="ml-grid">
                {displayedMedia.map(media => (
                  <div key={media._id} className="ml-card">
                    <div className="ml-card-top">
                      <span className="ml-type-badge">
                        {TYPE_ICONS[media.type] || <Star size={11} />}
                        {media.type}
                      </span>
                      {/* Requirement 5: Favorites toggle */}
                      <button className={`ml-fav-btn ${favorites.has(media._id) ? 'saved' : ''}`}
                        onClick={() => toggleFavorite(media._id)}
                        title={favorites.has(media._id) ? 'Remove from favorites' : 'Save to favorites'}>
                        <Bookmark size={15} fill={favorites.has(media._id) ? 'var(--purple)' : 'none'}
                          stroke={favorites.has(media._id) ? 'var(--purple)' : 'currentColor'} />
                      </button>
                    </div>
                    <div className="ml-card-title">{media.title}</div>
                    <div className="ml-card-creator">
                      {media.creator && `by ${media.creator}`}
                      {media.releaseYear && ` · ${media.releaseYear}`}
                    </div>
                    {media.summary && <div className="ml-card-summary">{media.summary}</div>}
                    {/* Requirement 2: Genre & Tag display */}
                    <div className="ml-tags">
                      {media.genres?.map(g => <span key={g} className="ml-genre-tag">{g}</span>)}
                      {media.tags?.map(t => <span key={t} className="ml-tag">{t}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Posts Section ── */}
          <section className="up-posts-section">
            <h2 className="up-section-title">Your Posts</h2>
            {userPosts.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 24px', color:'var(--ink-muted)', fontSize:15 }}>
                No posts yet. Create your first post!
              </div>
            ) : (
              userPosts.map(post => (
                <div key={post.id} className="up-post">
                  <div className="up-post-header">
                    <div className="up-post-user">
                      <div className="up-post-avatar">
                        {post.author?.avatar ? (
                          <img 
                            src={post.author.avatar.startsWith('http') ? post.author.avatar : `http://localhost:5000${post.author.avatar}`} 
                            alt={post.author.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                          />
                        ) : (
                          <span>{post.author?.name?.charAt(0).toUpperCase() || '?'}</span>
                        )}
                      </div>
                      <div>
                        <div className="up-post-username">{post.author?.name || 'Unknown'}</div>
                        <div className="up-post-time">@{post.author?.username || 'unknown'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="up-post-content">
                    {/* Feature Tag Badges - Show both Psychology and Narrative for @AI posts */}
                    {post.featureTag === 'ai' && (
                      <div className="up-feature-badge-row">
                        <button className="up-feature-badge psychology"
                          onClick={() => { localStorage.setItem('psychology_pending', JSON.stringify({ name: post.featureData?.name, description: post.featureData?.fullContent, timestamp: Date.now() })); navigate('/psychology'); }}>
                          <Brain size={14} /> PSYCHOLOGY
                        </button>
                        <button className="up-feature-badge narrative"
                          onClick={() => { localStorage.setItem('narrative_pending', JSON.stringify({ title: post.featureData?.name, content: post.featureData?.fullContent, timestamp: Date.now() })); navigate('/narrative'); }}>
                          <GitBranch size={14} /> NARRATIVE
                        </button>
                      </div>
                    )}
                    
                    {/* Feature Data Summary */}
                    {post.featureData && (
                      <div className="up-feature-data">
                        <div className="up-feature-name">{post.featureData.name || 'Untitled'}</div>
                        <div className="up-feature-summary">
                          {expandedPosts.has(post.id) 
                            ? (post.featureData.fullContent || post.featureData.summary || '')
                            : (post.featureData.summary || post.featureData.fullContent?.substring(0, 100) + '...' || '')}
                        </div>
                        {(post.featureData.fullContent && post.featureData.fullContent.length > 100) && (
                          <button 
                            className="up-expand-btn"
                            onClick={() => toggleExpand(post.id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              marginTop: '8px',
                              padding: '4px 8px',
                              fontSize: '12px',
                              color: 'var(--purple)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: 500,
                            }}
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
                          className="up-post-image" 
                        />
                        {post.content && !post.featureTag && (
                          <p className="up-post-text" style={{ marginTop: '12px' }}>{post.content}</p>
                        )}
                      </>
                    )}
                    
                    {/* Text Content (only if no feature tag - feature content is shown above) */}
                    {post.type === 'text' && !post.featureTag && (
                      <p className="up-post-text">{post.content}</p>
                    )}
                  </div>
                  <div className="up-post-actions">
                    <button className={`up-action-btn ${post.liked ? 'liked' : ''}`}>
                      <Heart size={14} fill={post.liked ? "#e11d48" : "none"} stroke={post.liked ? "#e11d48" : "currentColor"} />
                      {post.likeCount || 0}
                    </button>
                    <button 
                      className={`up-action-btn ${expandedComments.has(post.id) ? 'active' : ''}`}
                      onClick={() => toggleComments(post.id)}
                    >
                      <MessageCircle size={14} />
                      {post.commentCount || 0}
                    </button>
                    <div className="up-action-spacer" />
                    <button className="up-action-btn"><Bookmark size={14} /></button>
                  </div>

                  {/* Comments Section */}
                  {expandedComments.has(post.id) && (
                    <div className="up-comments-section" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
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
                            borderRadius: 'var(--radius-sm)',
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
                            borderRadius: 'var(--radius-sm)',
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
                            <div style={{ 
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
                            }}>
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
                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
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
              ))
            )}
          </section>
        </main>

        {/* ── Add Media Modal ── */}
        {showAddMedia && (
          <div className="ml-modal-overlay" onClick={() => setShowAddMedia(false)}>
            <div className="ml-modal" onClick={e => e.stopPropagation()}>
              <div className="ml-modal-title">➕ Add New Media</div>
              <form onSubmit={handleAddMedia}>
                {/* Requirement 1: Core fields */}
                <div className="ml-field">
                  <label className="ml-label">Title *</label>
                  <input className="ml-input" required value={mediaForm.title}
                    onChange={e => setMediaForm({...mediaForm, title: e.target.value})} placeholder="e.g. One Piece" />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <div className="ml-field">
                    <label className="ml-label">Type *</label>
                    <select className="ml-select" value={mediaForm.type}
                      onChange={e => setMediaForm({...mediaForm, type: e.target.value})}>
                      {MEDIA_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="ml-field">
                    <label className="ml-label">Release Year</label>
                    <input className="ml-input" type="number" min="1900" max="2030"
                      value={mediaForm.releaseYear}
                      onChange={e => setMediaForm({...mediaForm, releaseYear: e.target.value})} placeholder="2024" />
                  </div>
                </div>
                <div className="ml-field">
                  <label className="ml-label">Creator</label>
                  <input className="ml-input" value={mediaForm.creator}
                    onChange={e => setMediaForm({...mediaForm, creator: e.target.value})} placeholder="Author, Director, Studio..." />
                </div>
                <div className="ml-field">
                  <label className="ml-label">Summary</label>
                  <textarea className="ml-input" rows={3} value={mediaForm.summary}
                    onChange={e => setMediaForm({...mediaForm, summary: e.target.value})}
                    placeholder="Brief description..." style={{ resize:'vertical' }} />
                </div>

                {/* Requirement 2: Genre Tagging */}
                <div className="ml-field">
                  <label className="ml-label">Genres</label>
                  <div className="ml-tags-wrap">
                    {GENRES.map(g => (
                      <button type="button" key={g}
                        className={`ml-tag-toggle ${mediaForm.genres.includes(g) ? 'active-genre' : ''}`}
                        onClick={() => toggleFormItem('genres', g)}>{g}</button>
                    ))}
                  </div>
                </div>

                {/* Requirement 2: Theme Tagging */}
                <div className="ml-field">
                  <label className="ml-label">Theme Tags</label>
                  <div className="ml-tags-wrap">
                    {COMMON_TAGS.map(t => (
                      <button type="button" key={t}
                        className={`ml-tag-toggle ${mediaForm.tags.includes(t) ? 'active-tag' : ''}`}
                        onClick={() => toggleFormItem('tags', t)}>{t}</button>
                    ))}
                  </div>
                  <div className="ml-custom-tag-row">
                    <input className="ml-input" style={{ flex:1 }} placeholder="Add custom tag..."
                      value={customTag} onChange={e => setCustomTag(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (customTag.trim()) { toggleFormItem('tags', customTag.trim()); setCustomTag(""); }}}} />
                    <button type="button" className="ml-btn-secondary"
                      onClick={() => { if (customTag.trim()) { toggleFormItem('tags', customTag.trim()); setCustomTag(""); }}}>+</button>
                  </div>
                  {mediaForm.tags.length > 0 && (
                    <div className="ml-tags-wrap" style={{ marginTop: 8 }}>
                      {mediaForm.tags.map(t => (
                        <span key={t} className="ml-tag" style={{ cursor:'pointer' }}
                          onClick={() => toggleFormItem('tags', t)}>{t} ×</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="ml-modal-actions">
                  <button type="button" className="ml-btn-secondary" onClick={() => setShowAddMedia(false)}>Cancel</button>
                  <button type="submit" className="ml-btn-primary" disabled={addingMedia}>
                    {addingMedia ? 'Adding...' : 'Add to Library'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Create Post Modal ── */}
        {showPostModal && (
          <div className="up-modal-overlay" onClick={() => setShowPostModal(false)}>
            <div className="up-modal" onClick={e => e.stopPropagation()}>
              <div className="up-modal-header">
                <h3 className="up-modal-title">Create New Post</h3>
                <button className="up-close-btn" onClick={() => setShowPostModal(false)}><X size={15} /></button>
              </div>
              <div className="up-post-type-tabs">
                <button className={`up-type-tab ${postType === 'text' ? 'active' : ''}`} onClick={() => setPostType('text')}>Text Post</button>
                <button className={`up-type-tab ${postType === 'image' ? 'active' : ''}`} onClick={() => setPostType('image')}>Image Post</button>
              </div>
              {postType === 'text' ? (
                <textarea className="up-textarea"
                  placeholder={"What's on your mind?\n\nTip: Use @AI to create entries for Psychology & Narrative"}
                  value={postContent} onChange={e => setPostContent(e.target.value)}
                  style={postContent.toLowerCase().includes('@ai') ? { borderColor: '#7c3aed' } : {}} />
              ) : (
                <div>
                  <div className="up-image-upload" onClick={() => document.getElementById('img-upload')?.click()}>
                    <Image size={28} style={{ color:'var(--ink-muted)',marginBottom:10 }} />
                    <p style={{ color:'var(--ink-muted)',fontSize:14 }}>Click to upload image</p>
                    <input id="img-upload" type="file" accept="image/*" style={{ display:'none' }} onChange={handlePostImageUpload} />
                  </div>
                  {selectedImage && (
                    <>
                      <img src={selectedImage?.startsWith('http') ? selectedImage : `http://localhost:5000${selectedImage}`} alt="Preview" className="up-image-preview" />
                      {/* Caption input with AI support */}
                      <textarea
                        className="up-textarea"
                        placeholder="Add a caption...&#10;&#10;Tip: Use @AI to create an entry for Psychology and Narrative (line 1 = name, rest = description)"
                        value={imageCaption}
                        onChange={(e) => setImageCaption(e.target.value)}
                        style={{ 
                          marginTop: '16px',
                          minHeight: '80px',
                          borderColor: imageCaption.toLowerCase().includes('@ai') ? '#7c3aed' : undefined
                        }}
                      />
                      {imageCaption.toLowerCase().includes('@ai') && (
                        <div style={{ 
                          marginTop: '8px', 
                          padding: '6px 12px', 
                          background: 'rgba(124, 58, 237, 0.1)', 
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: '#7c3aed',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span style={{ 
                            background: '#7c3aed', 
                            color: 'white', 
                            padding: '2px 8px', 
                            borderRadius: '4px',
                            fontWeight: 600,
                            fontSize: '11px'
                          }}>@AI</span>
                          <span>This caption will create entries in Psychology & Narrative</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              <div className="up-modal-actions">
                <button className="up-modal-btn secondary" onClick={() => setShowPostModal(false)}>Cancel</button>
                <button className="up-modal-btn primary" onClick={handleCreatePost}>Post</button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {notification && <div className="sv-toast">{notification}</div>}
      </div>
    </>
  );
};

export default UserProfile;
