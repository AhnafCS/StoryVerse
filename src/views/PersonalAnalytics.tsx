import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { useTheme } from '../hooks/useTheme';
import { 
  BarChart3, Brain, ArrowLeft, Target, 
  TrendingUp, Activity, Users, Star, Award
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell
} from 'recharts';

/* ─── Shared UI Helpers ─────────────────────────────────────────────────── */

const AmbientBackground = ({ isDark }) => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
    <div style={{
      position: 'absolute', inset: 0,
      background: isDark 
        ? 'radial-gradient(ellipse 80% 60% at 20% 10%, #0d0221 0%, #020008 60%, #000 100%)'
        : 'radial-gradient(ellipse 80% 60% at 20% 10%, #f7f9fc 0%, #edf1f7 60%, #e2e8f0 100%)'
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
        ? (isDark ? '0 8px 32px rgba(255,100,100,0.1)' : '0 8px 32px rgba(255,100,100,0.1)')
        : (isDark ? '0 4px 24px rgba(0,0,0,0.2)' : '0 4px 24px rgba(0,0,0,0.04)'),
      overflow: 'hidden',
      ...style
    }}
  >
    {children}
  </div>
);

const StatBadge = ({ icon: Icon, label, value, color, isDark }) => (
  <GlassCard isDark={isDark} style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
    <div style={{ width: 48, height: 48, borderRadius: 16, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
      <Icon size={24} />
    </div>
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#aaa' : '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: isDark ? '#fff' : '#111' }}>{value}</div>
    </div>
  </GlassCard>
);

/* ─── Main Component ────────────────────────────────────────────────────── */

export default function PersonalAnalytics() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAnalytics(); }, []);

  const loadAnalytics = async () => {
    try {
      const res = await api.authenticatedRequest('/analytics/personal');
      setData(res.analytics);
    } catch {
      toast.error('Failed to load personal analytics.');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div key={isDark ? 'dark' : 'light'} style={{ minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <AmbientBackground isDark={isDark} />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
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
              <BarChart3 color="#ec4899" />
              Personal Analytics Dashboard
            </h1>
            <p style={{ margin: '4px 0 0', color: isDark ? '#aaa' : '#666', fontSize: 14 }}>
              Insights into your character analysis patterns and psychological preferences.
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: isDark ? '#666' : '#999' }}>
            <Activity size={40} className="animate-pulse" style={{ margin: '0 auto 16px' }} />
            <p>Crunching your analytics data...</p>
          </div>
        ) : !data ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: isDark ? '#666' : '#999' }}>
             Failed to load analytics.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Top Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
              <StatBadge icon={Users} label="Total Analyses" value={data.totalAnalyses} color="#3b82f6" isDark={isDark} />
              <StatBadge icon={Target} label="Moral Ambiguity" value={data.moralAmbiguityIndex + '%'} color="#f59e0b" isDark={isDark} />
              <StatBadge icon={Brain} label="Emotional Complexity" value={data.emotionalComplexity} color="#8b5cf6" isDark={isDark} />
              <StatBadge icon={Award} label="Most Analyzed" value={data.characters.length > 0 ? data.characters[0].name : 'N/A'} color="#10b981" isDark={isDark} />
            </div>

            {/* Charts Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1.5fr 1fr', gap: 24 }}>
              
              <GlassCard style={{ padding: 24 }} isDark={isDark}>
                <h3 style={{ margin: '0 0 24px', fontSize: 16, color: isDark ? '#fff' : '#111', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TrendingUp size={18} color="#f59e0b" />
                  Your Average Character Scores
                </h3>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Leadership', score: data.avgScores.leadership },
                      { name: 'Antagonist\nPotential', score: data.avgScores.antagonistPotential },
                      { name: 'Emotional\nStability', score: data.avgScores.emotionalStability }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} vertical={false} />
                      <XAxis dataKey="name" stroke={isDark ? '#888' : '#666'} tick={{ fill: isDark ? '#ccc' : '#444' }} />
                      <YAxis stroke={isDark ? '#888' : '#666'} tick={{ fill: isDark ? '#ccc' : '#444' }} />
                      <RechartsTooltip cursor={{fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}} contentStyle={{ background: isDark ? '#111' : '#fff', border: 'none', borderRadius: 8, color: isDark ? '#fff' : '#000' }} />
                      <Bar dataKey="score" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              <GlassCard style={{ padding: 24 }} isDark={isDark}>
                <h3 style={{ margin: '0 0 24px', fontSize: 16, color: isDark ? '#fff' : '#111', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Star size={18} color="#ec4899" />
                  Alignment Distribution
                </h3>
                <div style={{ height: 300 }}>
                  {data?.alignment分布?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.alignment分布}
                          cx="50%" cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {data.alignment分布.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ background: isDark ? '#111' : '#fff', border: 'none', borderRadius: 8, color: isDark ? '#fff' : '#000' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: isDark ? '#666' : '#999' }}>
                      Not enough data yet.
                    </div>
                  )}
                </div>
              </GlassCard>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}
