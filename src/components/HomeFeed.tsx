import { useState } from "react";
import { Search, Plus, Heart, MessageCircle, TrendingUp, Book, Film, Tv, LogOut, Star, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomeFeed = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // Mock data for the feed
  const mockPosts = [
    {
      id: 1,
      type: "book",
      title: "Dune",
      author: "Frank Herbert",
      user: "BookLover42",
      rating: 5,
      review: "Masterpiece of science fiction with incredible world-building and political intrigue. The way Herbert weaves complex themes of power, religion, and ecology is absolutely brilliant.",
      likes: 234,
      comments: 45,
      timestamp: "2 hours ago",
      userAvatar: "👤",
      cover: "📚"
    },
    {
      id: 2,
      type: "anime",
      title: "Attack on Titan",
      creator: "WIT Studio",
      user: "AnimeFan99",
      rating: 5,
      review: "The character development and plot twists are absolutely mind-blowing. Every episode leaves you on the edge of your seat.",
      likes: 567,
      comments: 89,
      timestamp: "5 hours ago",
      userAvatar: "🧑",
      cover: "🎌"
    },
    {
      id: 3,
      type: "series",
      title: "Breaking Bad",
      creator: "Vince Gilligan",
      user: "TVCritic",
      rating: 5,
      review: "Walter White's transformation is one of the best character arcs in television history. The writing is phenomenal.",
      likes: 892,
      comments: 156,
      timestamp: "1 day ago",
      userAvatar: "👨",
      cover: "📺"
    }
  ];

  const getTypeIcon = (type: string) => {
    switch(type) {
      case "book": return <Book className="w-4 h-4" />;
      case "anime": return <Film className="w-4 h-4" />;
      case "series": return <Tv className="w-4 h-4" />;
      default: return <Book className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-gray-900">StoryVerse</h1>
              
              {/* Navigation Tabs */}
              <nav className="hidden md:flex items-center gap-6">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === "all" 
                      ? "text-purple-600 border-b-2 border-purple-600" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab("books")}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === "books" 
                      ? "text-purple-600 border-b-2 border-purple-600" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Books
                </button>
                <button
                  onClick={() => setActiveTab("anime")}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === "anime" 
                      ? "text-purple-600 border-b-2 border-purple-600" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Anime
                </button>
                <button
                  onClick={() => setActiveTab("series")}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === "series" 
                      ? "text-purple-600 border-b-2 border-purple-600" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Series
                </button>
              </nav>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search media..."
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-200 transition-all"
                />
              </div>
              <button className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Plus className="w-5 h-5" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Trending Section */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Trending Now</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {["One Piece", "The Witcher", "Naruto", "Harry Potter", "Stranger Things"].map((title, i) => (
              <div key={i} className="flex-shrink-0 text-center">
                <div className="w-16 h-16 bg-purple-50 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-2xl">📖</span>
                </div>
                <p className="text-xs text-gray-700 truncate w-16">{title}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feed Posts */}
        <div className="space-y-4">
          {mockPosts.map((post) => (
            <article key={post.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-200 transition-colors">
              {/* Post Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-lg">
                    {post.userAvatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{post.user}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{post.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {getTypeIcon(post.type)}
                      <span className="text-sm text-gray-600">{post.title}</span>
                      <span className="text-sm text-gray-400">by {post.author || post.creator}</span>
                    </div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-purple-500 text-purple-500" />
                ))}
              </div>

              {/* Review */}
              <p className="text-gray-800 mb-4 leading-relaxed">{post.review}</p>

              {/* Actions */}
              <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                <button className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">{post.comments}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors ml-auto">
                  <span className="text-sm">Share</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomeFeed;
