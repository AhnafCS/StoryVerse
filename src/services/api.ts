const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  setAuthToken(token: string): void {
    localStorage.setItem('token', token);
  }

  removeAuthToken(): void {
    localStorage.removeItem('token');
  }

  async authenticatedRequest(endpoint: string, options: RequestOptions = {}): Promise<any> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // ── Auth ─────────────────────────────────────────────────────────────────
  auth = {
    register: async (userData: any) => {
      const response = await this.authenticatedRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      if (response.token) this.setAuthToken(response.token);
      return response;
    },

    login: async (credentials: any) => {
      const response = await this.authenticatedRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      if (response.token) this.setAuthToken(response.token);
      return response;
    },

    logout: () => {
      this.removeAuthToken();
      localStorage.removeItem('user');
      return Promise.resolve();
    },

    getCurrentUser: async () => {
      return await this.authenticatedRequest('/auth/me');
    },
  };

  // ── Profile ───────────────────────────────────────────────────────────────
  profile = {
    getCurrentProfile: async () => {
      return await this.authenticatedRequest('/profiles/me');
    },

    updateProfile: async (profileData: any) => {
      return await this.authenticatedRequest('/profiles/me', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    },

    getProfile: async (username: string) => {
      return await this.authenticatedRequest(`/profiles/${username}`);
    },

    followUser: async (username: string) => {
      return await this.authenticatedRequest(`/profiles/${username}/follow`, {
        method: 'POST',
      });
    },

    unfollowUser: async (username: string) => {
      return await this.authenticatedRequest(`/profiles/${username}/follow`, {
        method: 'DELETE',
      });
    },

    searchUsers: async (query: string) => {
      return await this.authenticatedRequest(`/profiles/search?q=${encodeURIComponent(query)}`);
    },

    getSuggestedUsers: async (limit = 5) => {
      const token = this.getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      try {
        const response = await fetch(`${this.baseURL}/profiles/suggested?limit=${limit}`, {
          method: 'GET',
          headers,
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Suggested users API error:', error);
        throw error;
      }
    },
  };

  // ── Posts ─────────────────────────────────────────────────────────────────
  posts = {
    getPosts: async (params: Record<string, any> = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `/posts?${queryString}` : '/posts';
      return await this.authenticatedRequest(endpoint);
    },

    getPost: async (postId: string) => {
      return await this.authenticatedRequest(`/posts/${postId}`);
    },

    createPost: async (postData: any) => {
      return await this.authenticatedRequest('/posts', {
        method: 'POST',
        body: JSON.stringify(postData),
      });
    },

    deletePost: async (postId: string) => {
      return await this.authenticatedRequest(`/posts/${postId}`, {
        method: 'DELETE',
      });
    },

    getUserPosts: async (username: string, params: Record<string, any> = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString
        ? `/posts/user/${username}?${queryString}`
        : `/posts/user/${username}`;
      return await this.authenticatedRequest(endpoint);
    },

    toggleLike: async (postId: string) => {
      return await this.authenticatedRequest(`/posts/${postId}/like`, {
        method: 'POST',
      });
    },

    addComment: async (postId: string, content: string) => {
      return await this.authenticatedRequest(`/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
    },

    deleteComment: async (postId: string, commentId: string) => {
      return await this.authenticatedRequest(`/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
      });
    },
  };

  // ── Media (Requirement 1, 2, 4) ──────────────────────────────────────────
  media = {
    // Requirement 4: Search & Filter by title, genre, or creator
    getAll: async (filters: {
      title?: string;
      genre?: string;
      creator?: string;
      tag?: string;
    } = {}) => {
      const params = new URLSearchParams();
      if (filters.title)   params.append('title',   filters.title);
      if (filters.genre)   params.append('genre',   filters.genre);
      if (filters.creator) params.append('creator', filters.creator);
      if (filters.tag)     params.append('tag',     filters.tag);
      const qs = params.toString();
      return await this.authenticatedRequest(`/media${qs ? `?${qs}` : ''}`);
    },

    getById: async (id: string) => {
      return await this.authenticatedRequest(`/media/${id}`);
    },

    // Requirement 1: Add Media with title, genre, creator, release year, summary
    // Requirement 2: Genre & Theme Tagging (genres + tags arrays)
    add: async (mediaData: {
      title: string;
      type: string;
      creator?: string;
      releaseYear?: number;
      summary?: string;
      genres?: string[];
      tags?: string[];
    }) => {
      return await this.authenticatedRequest('/media/add', {
        method: 'POST',
        body: JSON.stringify(mediaData),
      });
    },
  };

  // ── Favorites (Requirement 5) ─────────────────────────────────────────────
  favorites = {
    // Get all bookmarked media for a user
    get: async (userId: string) => {
      return await this.authenticatedRequest(`/favorites/${userId}`);
    },

    // Bookmark a media entry
    add: async (userId: string, mediaId: string) => {
      return await this.authenticatedRequest(`/favorites/${userId}`, {
        method: 'POST',
        body: JSON.stringify({ mediaId }),
      });
    },

    // Remove bookmark
    remove: async (userId: string, mediaId: string) => {
      return await this.authenticatedRequest(`/favorites/${userId}`, {
        method: 'DELETE',
        body: JSON.stringify({ mediaId }),
      });
    },
  };

  async uploadImage(file: File): Promise<any> {
    const token = this.getAuthToken();
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await fetch(`${this.baseURL}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  }
}

const api = new ApiService();
export default api;