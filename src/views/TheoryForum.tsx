import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { useTheme } from '../hooks/useTheme';
import { 
  MessageSquare, Sparkles, Send, BrainCircuit, ShieldAlert,
  ChevronRight, ArrowLeft, Loader2, Info, Search, FileText,
  User, X
} from 'lucide-react';

/* ─── Shared UI Helpers ─────────────────────────────────────────────────── */

const AmbientBackground = ({ isDark }) => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
    <div style={{
      position: 'absolute', inset: 0,
      background: isDark 
        ? 'radial-gradient(ellipse 80% 60% at 20% 10%, #0d0221 0%, #020008 60%, #000 100%)'
        : 'radial-gradient(ellipse 80% 60% at 20% 10%, #f7f9fc 0%, #edf1f7 60%, #e2e8f0 100%)'
    }} />
    {/* Glowing orbs */}
    <div style={{
      position: 'absolute', top: '10%', right: '10%',
      width: 500, height: 500,
      background: isDark 
        ? 'radial-gradient(circle, rgba(60,130,255,0.12) 0%, transparent 70%)'
        : 'radial-gradient(circle, rgba(60,130,255,0.08) 0%, transparent 70%)',
      borderRadius: '50%',
      animation: 'orbDrift1 20s ease-in-out infinite'
    }} />
    <div style={{
      position: 'absolute', bottom: '0%', left: '0%',
      width: 600, height: 600,
      background: isDark 
        ? 'radial-gradient(circle, rgba(160,50,255,0.1) 0%, transparent 70%)'
        : 'radial-gradient(circle, rgba(160,50,255,0.06) 0%, transparent 70%)',
      borderRadius: '50%',
      animation: 'orbDrift2 25s ease-in-out infinite'
    }} />
  </div>
);

const GlassCard = ({ children, className = '', style = {}, isDark, accent = false }) => (
  <div
    className={className}
    style={{
      position: 'relative',
      background: isDark ? 'rgba(15,10,30,0.6)' : 'rgba(255,255,255,0.75)',
      backdropFilter: 'blur(20px)',
      border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
      borderRadius: 24,
      boxShadow: accent 
        ? (isDark ? '0 8px 32px rgba(99,44,255,0.15)' : '0 8px 32px rgba(99,44,255,0.1)')
        : (isDark ? '0 4px 24px rgba(0,0,0,0.2)' : '0 4px 24px rgba(0,0,0,0.04)'),
      overflow: 'hidden',
      ...style
    }}
  >
    {children}
  </div>
);

const Btn = ({ onClick, children, icon: Icon, disabled, variant = 'primary', isDark }) => {
  const styles = {
    primary: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      color: '#fff',
      border: 'none',
      boxShadow: '0 4px 16px rgba(139,92,246,0.3)'
    },
    secondary: {
      background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
      color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
      boxShadow: 'none'
    }
  };
  const s = styles[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...s,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '10px 20px', borderRadius: 12,
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 14, fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s ease',
        outline: 'none'
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {Icon && (disabled && Icon === Loader2 ? <Icon size={16} className="animate-spin" /> : <Icon size={16} />)}
      {children}
    </button>
  );
};

/* ─── Main Component ────────────────────────────────────────────────────── */

export default function TheoryForum() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [theories, setTheories] = useState([]);
  const [activeTheory, setActiveTheory] = useState(null);
  
  // Create theory state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  // Comment state
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);

  // Summary state
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => { loadTheories(); }, []);

  const loadTheories = async () => {
    try {
      const res = await api.authenticatedRequest('/forum/theories');
      setTheories(res.theories || []);
    } catch {
      toast.error('Failed to load forum theories.');
    }
  };

  const handleCreateTheory = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await api.authenticatedRequest('/forum/theories', {
        method: 'POST',
        body: JSON.stringify({ title, content })
      });
      toast.success('Theory posted and evaluated by AI!');
      setTheories([res.theory, ...theories]);
      setTitle('');
      setContent('');
      setShowCreate(false);
    } catch (err) {
      toast.error(err.message || 'Failed to post theory');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !activeTheory) return;
    setIsCommenting(true);
    try {
      const res = await api.authenticatedRequest(`/forum/theories/${activeTheory._id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: commentText })
      });
      setActiveTheory(res.theory);
      setTheories(theories.map(t => t._id === res.theory._id ? res.theory : t));
      setCommentText('');
      toast.success('Comment added');
    } catch (err) {
      toast.error('Failed to add comment');
    } finally {
      setIsCommenting(false);
    }
  };

  const handleGetSummary = async () => {
    if (!activeTheory) return;
    setIsSummarizing(true);
    try {
      const res = await api.authenticatedRequest(`/forum/theories/${activeTheory._id}/summary`);
      setActiveTheory({ ...activeTheory, aiSummary: res.summary });
      setTheories(theories.map(t => t._id === activeTheory._id ? { ...t, aiSummary: res.summary } : t));
      toast.success('Debate summarized!');
    } catch (err) {
      toast.error('Failed to summarize debate');
    } finally {
      setIsSummarizing(false);
    }
  };

  const AIEvaluationBadge = ({ evalData }) => {
    if (!evalData) return null;
    const { logicalStrength, consistency } = evalData;
    const avg = (logicalStrength + consistency) / 2;
    let color = '#10b981'; // green
    if (avg < 50) color = '#ef4444'; // red
    else if (avg < 75) color = '#f59e0b'; // yellow

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color, background: `${color}15`, padding: '4px 8px', borderRadius: 8 }}>
        <BrainCircuit size={14} />
        AI Score: {Math.round(avg)}
      </div>
    );
  };

  return (
    <div key={isDark ? 'dark' : 'light'} style={{ minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .tf-scroll::-webkit-scrollbar { width: 4px; }
        .tf-scroll::-webkit-scrollbar-track { background: transparent; }
        .tf-scroll::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 999px; }
        .fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      
      <AmbientBackground isDark={isDark} />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => window.location.href = '/feed'}
              style={{
                width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                border: 'none', color: isDark ? '#fff' : '#000', cursor: 'pointer'
              }}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: isDark ? '#fff' : '#111', display: 'flex', alignItems: 'center', gap: 10 }}>
                <MessageSquare color="#8b5cf6" />
                Theory & Debate Forum
              </h1>
              <p style={{ margin: '4px 0 0', color: isDark ? '#aaa' : '#666', fontSize: 14 }}>
                Share theories, get AI evaluations, and debate with the community.
              </p>
            </div>
          </div>
          {!activeTheory && (
            <Btn onClick={() => setShowCreate(!showCreate)} icon={showCreate ? X : Sparkles} isDark={isDark}>
              {showCreate ? 'Close' : 'Post Theory'}
            </Btn>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: activeTheory ? '1fr 1.3fr' : '1fr', gap: 24, alignItems: 'start' }}>
          
          {/* LEFT: Feed or Create Form */}
          <div style={{ display: activeTheory && window.innerWidth < 768 ? 'none' : 'block' }}>
            {showCreate && !activeTheory && (
              <GlassCard className="fade-in" style={{ padding: 24, marginBottom: 24 }} accent isDark={isDark}>
                <h3 style={{ margin: '0 0 16px', color: isDark ? '#fff' : '#111' }}>Submit a New Theory</h3>
                <form onSubmit={handleCreateTheory} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <input
                    type="text" placeholder="Theory Title" value={title} onChange={e => setTitle(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 12,
                      background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
                      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                      color: isDark ? '#fff' : '#000', outline: 'none'
                    }}
                    required
                  />
                  <textarea
                    placeholder="Describe your theory in detail... The AI will evaluate its logical strength and consistency."
                    value={content} onChange={e => setContent(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 12, minHeight: 120, resize: 'vertical',
                      background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
                      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                      color: isDark ? '#fff' : '#000', outline: 'none'
                    }}
                    required
                  />
                  <Btn disabled={isSubmitting} icon={isSubmitting ? Loader2 : BrainCircuit} isDark={isDark} variant="primary">
                    {isSubmitting ? 'AI Evaluating...' : 'Submit & Evaluate'}
                  </Btn>
                </form>
              </GlassCard>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {theories.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: isDark ? '#666' : '#999' }}>
                  <Search size={40} opacity={0.5} style={{ margin: '0 auto 16px' }} />
                  <p>No theories posted yet. Be the first!</p>
                </div>
              ) : (
                theories.map(t => (
                  <GlassCard 
                    key={t._id} 
                    className="fade-in"
                    style={{ 
                      padding: 20, cursor: 'pointer',
                      border: activeTheory?._id === t._id ? '1px solid #8b5cf6' : undefined,
                      transform: activeTheory?._id === t._id ? 'scale(1.02)' : 'scale(1)',
                      transition: 'all 0.2s'
                    }} 
                    isDark={isDark}
                  >
                    <div onClick={() => { setActiveTheory(t); setShowCreate(false); }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: isDark ? '#fff' : '#111' }}>{t.title}</h3>
                        <AIEvaluationBadge evalData={t.aiEvaluation} />
                      </div>
                      <p style={{ margin: '0 0 16px', fontSize: 14, color: isDark ? '#aaa' : '#555', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {t.content}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: isDark ? '#777' : '#888' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <User size={12} /> {t.userId?.username || 'Unknown'} • {new Date(t.createdAt).toLocaleDateString()}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MessageSquare size={12} /> {t.comments.length}
                        </span>
                      </div>
                    </div>
                  </GlassCard>
                ))
              )}
            </div>
          </div>

          {/* RIGHT: Active Theory Debate & AI Summary */}
          {activeTheory && (
            <GlassCard className="fade-in" style={{ padding: 24, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)' }} accent isDark={isDark}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <h2 style={{ margin: '0 0 8px', fontSize: 24, color: isDark ? '#fff' : '#111' }}>{activeTheory.title}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: isDark ? '#aaa' : '#666' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <User size={14} /> {activeTheory.userId?.username || 'Unknown'}
                    </span>
                    <AIEvaluationBadge evalData={activeTheory.aiEvaluation} />
                  </div>
                </div>
                <button
                  onClick={() => setActiveTheory(null)}
                  style={{ background: 'none', border: 'none', color: isDark ? '#aaa' : '#666', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Theory Content & AI Feedback */}
              <div className="tf-scroll" style={{ overflowY: 'auto', flex: 1, paddingRight: 8 }}>
                <div style={{ fontSize: 15, lineHeight: 1.6, color: isDark ? '#ddd' : '#333', marginBottom: 24 }}>
                  {activeTheory.content}
                </div>

                {activeTheory.aiEvaluation && (
                  <div style={{ padding: 16, borderRadius: 12, background: isDark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.05)', border: `1px solid rgba(139,92,246,0.2)`, marginBottom: 32 }}>
                    <h4 style={{ margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 6, color: '#8b5cf6', fontSize: 14 }}>
                      <ShieldAlert size={16} /> AI Evaluation Feedback
                    </h4>
                    <p style={{ margin: 0, fontSize: 14, color: isDark ? '#bbb' : '#555' }}>
                      {activeTheory.aiEvaluation.feedback}
                    </p>
                  </div>
                )}

                {/* AI SUMMARY SECTION */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '32px 0 16px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', paddingBottom: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 18, color: isDark ? '#fff' : '#111' }}>Debate</h3>
                  <Btn onClick={handleGetSummary} disabled={isSummarizing || activeTheory.comments.length === 0} icon={isSummarizing ? Loader2 : FileText} variant="secondary" isDark={isDark}>
                    Generate AI Summary
                  </Btn>
                </div>

                {activeTheory.aiSummary && (
                  <div className="fade-in" style={{ padding: 16, borderRadius: 12, background: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)', border: `1px solid rgba(59,130,246,0.2)`, marginBottom: 24 }}>
                    <h4 style={{ margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 6, color: '#3b82f6', fontSize: 14 }}>
                      <BrainCircuit size={16} /> AI Debate Summary
                    </h4>
                    <p style={{ margin: 0, fontSize: 14, color: isDark ? '#bbb' : '#555', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                      {activeTheory.aiSummary}
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {activeTheory.comments.map(c => (
                    <div key={c._id} style={{ padding: 12, borderRadius: 12, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: isDark ? '#aaa' : '#666', marginBottom: 4 }}>
                        <User size={12} /> {c.userId?.username || 'User'}
                      </div>
                      <div style={{ fontSize: 14, color: isDark ? '#eee' : '#222' }}>{c.content}</div>
                    </div>
                  ))}
                  {activeTheory.comments.length === 0 && (
                    <div style={{ fontSize: 14, color: isDark ? '#666' : '#999', textAlign: 'center', padding: '20px 0' }}>
                      Be the first to provide input on this theory!
                    </div>
                  )}
                </div>
              </div>

              {/* Add Comment Input */}
              <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                <input
                  type="text"
                  placeholder="Add your thoughts to the debate..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                  style={{
                    flex: 1, padding: '12px 16px', borderRadius: 12,
                    background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                    color: isDark ? '#fff' : '#000', outline: 'none'
                  }}
                />
                <Btn onClick={handleAddComment} disabled={isCommenting || !commentText.trim()} icon={Send} isDark={isDark}>
                  Post
                </Btn>
              </div>

            </GlassCard>
          )}

        </div>
      </div>
    </div>
  );
}
