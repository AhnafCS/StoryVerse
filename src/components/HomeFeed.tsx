import { useState } from "react";
import { Search, Plus, Heart, MessageCircle, TrendingUp, Book, Film, Tv, LogOut, Star, MoreHorizontal, Home, Compass, Bookmark, Settings, User, Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomeFeed = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // Mock data for sidebar suggestions
  const sidebarSuggestions = [
    { id: 1, name: "Alex Chen", avatar: "👨", mutual: 12 },
    { id: 2, name: "Sarah Miller", avatar: "👩", mutual: 8 },
    { id: 3, name: "David Kim", avatar: "👤", mutual: 15 }
  ];

  // Mock data for tasks/projects
  const sidebarTasks = [
    { id: 1, title: "Create calendar, chat and email app pages", progress: 75, people: 3 },
    { id: 2, title: "Model Answer", progress: 100, people: 5 },
    { id: 3, title: "Product Design, Figma, Sketch", progress: 60, people: 2 }
  ];

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
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white h-screen sticky top-0 border-r border-gray-200 hidden lg:block">
          <div className="p-6">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">StoryVerse</h1>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 text-purple-600 bg-purple-50 rounded-lg">
                <Home className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                <Compass className="w-5 h-5" />
                <span>Explore</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                <Bookmark className="w-5 h-5" />
                <span>Saved</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </nav>

            {/* Add to your feed */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Add to your feed</h3>
              <div className="space-y-3">
                {sidebarSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                        {suggestion.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{suggestion.name}</p>
                        <p className="text-xs text-gray-500">{suggestion.mutual} mutual</p>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full hover:bg-purple-700 transition-colors">
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-2xl mx-auto">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200 transition-all"
                    />
                  </div>
                  <button className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          <div className="p-6">
            {/* Trending Section */}
            <section className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">Trending Now</h2>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {["One Piece", "The Witcher", "Naruto", "Harry Potter", "Stranger Things"].map((title, i) => (
                  <div key={i} className="flex-shrink-0 text-center">
                    <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-2">
                      <span className="text-2xl">📖</span>
                    </div>
                    <p className="text-xs text-gray-700 truncate w-16">{title}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Feed Posts */}
            <div className="space-y-6">
              {mockPosts.map((post) => (
                <article key={post.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-lg">
                        {post.userAvatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{post.user}</span>
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

                  {/* Content */}
                  <div className="mb-4">
                    <div className="w-full h-48 bg-gray-100 rounded-2xl mb-4 flex items-center justify-center">
                      <span className="text-4xl">{post.cover}</span>
                    </div>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-purple-500 text-purple-500" />
                      ))}
                    </div>

                    {/* Review */}
                    <p className="text-gray-800 leading-relaxed">{post.review}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                    <button className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors">
                      <Heart className="w-5 h-5" />
                      <span className="text-sm font-medium">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">{post.comments}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors ml-auto">
                      <span className="text-sm font-medium">Share</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 bg-white h-screen sticky top-0 border-l border-gray-200 hidden xl:block">
          <div className="p-6">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200 transition-all"
              />
            </div>

            {/* Tasks/Projects */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Your Projects</h3>
              <div className="space-y-3">
                {sidebarTasks.map((task) => (
                  <div key={task.id} className="bg-gray-50 rounded-2xl p-4">
                    <h4 className="font-medium text-gray-900 mb-2 text-sm">{task.title}</h4>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex -space-x-2">
                        {[...Array(Math.min(task.people, 3))].map((_, i) => (
                          <div key={i} className="w-6 h-6 bg-purple-200 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-xs">👤</span>
                          </div>
                        ))}
                        {task.people > 3 && (
                          <div className="w-6 h-6 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-xs text-gray-600">+{task.people - 3}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{task.people} people</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all" 
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* You might be interested */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">You might be interested</h3>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm font-medium">Event</span>
                </div>
                <h4 className="font-bold text-lg mb-1">New Market Night</h4>
                <p className="text-sm opacity-90 mb-4">Join us for an evening of creativity and networking</p>
                <button className="w-full bg-white text-purple-600 rounded-xl py-2 font-medium text-sm hover:bg-gray-50 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default HomeFeed;
