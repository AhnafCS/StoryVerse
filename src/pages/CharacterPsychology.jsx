import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { useTheme } from '../hooks/useTheme';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { Brain, Sparkles, User, Plus, Activity, Zap, Heart, Sword, Crown, Ghost, Target, X, ChevronRight, Sun, Moon, Wand2, Printer } from 'lucide-react';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

/* ─── Ambient background with noise + orbs ──────────────────────────────── */
const AmbientBackground = ({ isDark }) => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
    <div style={{
      position: 'absolute', inset: 0,
      background: isDark 
        ? 'radial-gradient(ellipse 80% 60% at 20% 10%, #0d0221 0%, #020008 60%, #000 100%)'
        : 'radial-gradient(ellipse 80% 60% at 20% 10%, #f8f7ff 0%, #f0edff 60%, #e8e4f3 100%)'
    }} />
    {/* Glowing orbs */}
    <div style={{
      position: 'absolute', top: '-10%', left: '-5%',
      width: 600, height: 600,
      background: isDark 
        ? 'radial-gradient(circle, rgba(99,44,255,0.18) 0%, transparent 70%)'
        : 'radial-gradient(circle, rgba(99,44,255,0.12) 0%, transparent 70%)',
      borderRadius: '50%',
      animation: 'orbDrift1 18s ease-in-out infinite'
    }} />
    <div style={{
      position: 'absolute', bottom: '-15%', right: '-10%',
      width: 700, height: 700,
      background: isDark 
        ? 'radial-gradient(circle, rgba(0,210,180,0.10) 0%, transparent 70%)'
        : 'radial-gradient(circle, rgba(0,210,180,0.06) 0%, transparent 70%)',
      borderRadius: '50%',
      animation: 'orbDrift2 22s ease-in-out infinite'
    }} />
    <div style={{
      position: 'absolute', top: '40%', left: '50%',
      width: 400, height: 400,
      background: isDark 
        ? 'radial-gradient(circle, rgba(180,0,255,0.07) 0%, transparent 70%)'
        : 'radial-gradient(circle, rgba(180,0,255,0.05) 0%, transparent 70%)',
      borderRadius: '50%',
      animation: 'orbDrift3 15s ease-in-out infinite'
    }} />
    {/* Subtle grid lines */}
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: isDark ? `
        linear-gradient(rgba(99,44,255,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(99,44,255,0.04) 1px, transparent 1px)
      ` : `
        linear-gradient(rgba(99,44,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(99,44,255,0.03) 1px, transparent 1px)
      `,
      backgroundSize: '80px 80px'
    }} />
    <style>{`
      @keyframes orbDrift1 {
        0%,100%  { transform: translate(0,0) scale(1); }
        33%      { transform: translate(40px,-30px) scale(1.08); }
        66%      { transform: translate(-20px,50px) scale(0.95); }
      }
      @keyframes orbDrift2 {
        0%,100%  { transform: translate(0,0) scale(1); }
        40%      { transform: translate(-50px,30px) scale(1.05); }
        70%      { transform: translate(20px,-40px) scale(0.97); }
      }
      @keyframes orbDrift3 {
        0%,100%  { transform: translate(-50%,-50%) scale(1); }
        50%      { transform: translate(-50%,-50%) scale(1.2); }
      }
    `}</style>
  </div>
);

/* ─── Glass card ─────────────────────────────────────────────────────────── */
const GlassCard = ({ children, className = '', style = {}, accent = false, isDark }) => (
  <div
    className={className}
    style={{
      position: 'relative',
      background: isDark ? 'rgba(10,4,28,0.7)' : 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: accent
        ? (isDark ? '1px solid rgba(99,44,255,0.45)' : '1px solid rgba(99,44,255,0.35)')
        : (isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.08)'),
      borderRadius: 20,
      boxShadow: accent
        ? (isDark ? '0 0 40px rgba(99,44,255,0.15), inset 0 1px 0 rgba(255,255,255,0.06)' : '0 0 40px rgba(99,44,255,0.1), inset 0 1px 0 rgba(255,255,255,0.8)')
        : (isDark ? 'inset 0 1px 0 rgba(255,255,255,0.04)' : '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)'),
      overflow: 'hidden',
      ...style
    }}
  >
    {/* top sheen */}
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 1,
      background: isDark 
        ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)'
        : 'linear-gradient(90deg, transparent, rgba(99,44,255,0.2), transparent)'
    }} />
    {children}
  </div>
);

/* ─── Section label ──────────────────────────────────────────────────────── */
const SectionLabel = ({ icon: Icon, children, color = '#7c3aed', isDark }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
    <div style={{
      width: 38, height: 38, borderRadius: 12,
      background: `${color}22`,
      border: `1px solid ${color}55`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0
    }}>
      <Icon size={18} color={color} />
    </div>
    <span 
      className="cp-section-label"
      style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}
    >
      {children}
    </span>
  </div>
);

/* ─── Trait pill ─────────────────────────────────────────────────────────── */
const TraitPill = ({ type, text }) => {
  const styles = {
    strength: { bg: 'rgba(0,210,130,0.1)', border: 'rgba(0,210,130,0.3)', color: '#00e09a' },
    weakness:  { bg: 'rgba(255,60,80,0.1)',  border: 'rgba(255,60,80,0.3)',  color: '#ff5c72' },
    mbti:      { bg: 'rgba(99,44,255,0.15)',  border: 'rgba(99,44,255,0.4)',  color: '#a78bfa' },
    alignment: { bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)', color: '#fbbf24' },
  };
  const s = styles[type] || styles.mbti;
  return (
    <span style={{
      display: 'inline-block',
      padding: '6px 14px',
      borderRadius: 999,
      fontSize: 13,
      fontFamily: "'DM Mono', monospace",
      fontWeight: 500,
      background: s.bg,
      border: `1px solid ${s.border}`,
      color: s.color,
      letterSpacing: '0.03em'
    }}>
      {text}
    </span>
  );
};

/* ─── Score ring ─────────────────────────────────────────────────────────── */
const ScoreRing = ({ icon: Icon, label, value, color, isDark }) => {
  const r = 32;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value || 0));
  const dash = (pct / 100) * circ;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={90} height={90} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={45} cy={45} r={r} fill="none" stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"} strokeWidth={6} />
          <circle
            cx={45} cy={45} r={r} fill="none"
            stroke={color} strokeWidth={6}
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${color}aa)`, transition: 'stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)' }}
          />
        </svg>
        <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Icon size={14} color={color} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, fontWeight: 700, color: isDark ? '#fff' : '#1a1a1a' }}>
            {value}
          </span>
        </div>
      </div>
      <div style={{
        marginTop: 8,
        fontFamily: "'DM Mono', monospace",
        fontSize: 10, fontWeight: 600,
        letterSpacing: '0.15em', textTransform: 'uppercase',
        color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)'
      }}>
        {label}
      </div>
    </div>
  );
};

/* ─── Character list item ────────────────────────────────────────────────── */
const CharacterItem = ({ character, isSelected, onClick, isDark }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%', textAlign: 'left', cursor: 'pointer',
      padding: '14px 16px',
      borderRadius: 14,
      border: isSelected ? '1px solid rgba(99,44,255,0.5)' : (isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)'),
      background: isSelected ? 'rgba(99,44,255,0.12)' : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'),
      display: 'flex', alignItems: 'center', gap: 14,
      transition: 'all 0.25s ease',
      boxShadow: isSelected ? '0 0 24px rgba(99,44,255,0.12)' : 'none',
      outline: 'none'
    }}
    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'; }}
    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'; }}
  >
    <div style={{
      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
      background: isSelected
        ? 'linear-gradient(135deg, #6c2aff, #b44fff)'
        : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Mono', monospace",
      fontSize: 16, fontWeight: 700,
      color: isSelected ? '#fff' : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)'),
      boxShadow: isSelected ? '0 4px 16px rgba(99,44,255,0.4)' : 'none',
      transition: 'all 0.25s ease'
    }}>
      {character.name.charAt(0).toUpperCase()}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 14, fontWeight: 600,
        color: isSelected ? '#7c3aed' : (isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.8)'),
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
      }}>
        {character.name}
      </div>
      <div style={{
        fontSize: 12, marginTop: 3,
        color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.45)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
      }}>
        {character.description}
      </div>
    </div>
    <ChevronRight size={14} color={isSelected ? '#7c3aed' : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)')} />
  </button>
);

/* ─── Alignment grid ─────────────────────────────────────────────────────── */
const AlignmentGrid = ({ activeAlignment, isDark }) => {
  const cells = [
    'Lawful Good', 'Neutral Good', 'Chaotic Good',
    'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
    'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
  ];
  const getColor = (a) => {
    if (a.includes('Good'))    return { bg: 'linear-gradient(135deg,#f59e0b,#fbbf24)', glow: '#f59e0b' };
    if (a.includes('Evil'))    return { bg: 'linear-gradient(135deg,#ef4444,#e11d48)', glow: '#ef4444' };
    if (a === 'True Neutral')  return { bg: 'linear-gradient(135deg,#6c2aff,#b44fff)', glow: '#7c3aed' };
    return { bg: 'linear-gradient(135deg,#0ea5e9,#06b6d4)', glow: '#06b6d4' };
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
      {cells.map((c) => {
        const active = c === activeAlignment;
        const col = getColor(c);
        return (
          <div key={c} style={{
            padding: '12px 8px', borderRadius: 12, textAlign: 'center',
            fontFamily: "'DM Mono', monospace",
            fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
            background: active ? col.bg : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
            border: active ? 'none' : (isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)'),
            color: active ? '#fff' : (isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.4)'),
            transform: active ? 'scale(1.07)' : 'scale(1)',
            boxShadow: active ? `0 8px 28px -4px ${col.glow}66` : 'none',
            transition: 'all 0.4s cubic-bezier(.4,0,.2,1)',
            cursor: 'default'
          }}>
            {c}
          </div>
        );
      })}
    </div>
  );
};

/* ─── Primary button ─────────────────────────────────────────────────────── */
const Btn = ({ onClick, children, icon: Icon, disabled, variant = 'primary', fullWidth = false, isDark }) => {
  const styles = {
    primary: {
      background: 'linear-gradient(135deg, #6c2aff 0%, #b44fff 100%)',
      color: '#fff',
      border: 'none',
      boxShadow: '0 4px 24px rgba(99,44,255,0.4)'
    },
    secondary: {
      background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
      color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
      border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.15)',
      boxShadow: 'none'
    },
    glow: {
      background: 'linear-gradient(135deg, #00d2b4 0%, #0076ff 100%)',
      color: '#fff',
      border: 'none',
      boxShadow: '0 4px 24px rgba(0,210,180,0.35)'
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
        padding: '11px 22px', borderRadius: 12,
        fontFamily: "'DM Mono', monospace",
        fontSize: 13, fontWeight: 600, letterSpacing: '0.04em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        width: fullWidth ? '100%' : undefined,
        transition: 'all 0.2s ease',
        outline: 'none',
        whiteSpace: 'nowrap'
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.filter = 'brightness(1.15)'; }}
      onMouseLeave={e => { e.currentTarget.style.filter = ''; }}
    >
      {Icon && <Icon size={15} />}
      {children}
    </button>
  );
};

/* ─── Divider ────────────────────────────────────────────────────────────── */
const Divider = ({ isDark }) => (
  <div style={{
    height: 1, margin: '20px 0',
    background: isDark 
      ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)'
      : 'linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent)'
  }} />
);

/* ══════════════════════════════════════════════════════════════════════════ */
const CharacterPsychology = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCharacter, setNewCharacter] = useState({ name: '', description: '' });
  
  const [whatIfScenario, setWhatIfScenario] = useState('');
  const [whatIfResult, setWhatIfResult] = useState('');
  const [isGeneratingWhatIf, setIsGeneratingWhatIf] = useState(false);

  useEffect(() => { loadCharacters(); }, []);

  // Check for pending psychology data from UserProfile posts
  useEffect(() => {
    const pendingData = localStorage.getItem('psychology_pending');
    if (pendingData) {
      try {
        const { name, description, timestamp } = JSON.parse(pendingData);
        // Only use data if it's less than 5 minutes old
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          setNewCharacter({ name, description });
          setShowCreateForm(true);
          toast.info('Character data loaded from your post!');
        }
        // Clear the pending data
        localStorage.removeItem('psychology_pending');
      } catch (e) {
        console.error('Failed to parse psychology pending data:', e);
      }
    }
  }, []);

  const loadCharacters = async () => {
    try {
      const res = await api.authenticatedRequest('/characters');
      setCharacters(res.characters || []);
    } catch { toast.error('Failed to load characters'); }
  };

  const createCharacter = async (e) => {
    e.preventDefault();
    try {
      const res = await api.authenticatedRequest('/characters', {
        method: 'POST', body: JSON.stringify(newCharacter)
      });
      toast.success('Character created!');
      setCharacters([...characters, res.character]);
      setShowCreateForm(false);
      setNewCharacter({ name: '', description: '' });
    } catch (err) { toast.error(err.message || 'Failed to create character'); }
  };

  const analyzeCharacter = async () => {
    if (!selectedCharacter) { toast.error('Select a character first'); return; }
    setIsAnalyzing(true);
    try {
      const res = await api.authenticatedRequest(`/analyze/${selectedCharacter._id}`, { method: 'POST' });
      setAnalysis(res.analysis);
      toast.success('Analysis complete!');
      setWhatIfResult('');
      setWhatIfScenario('');
    } catch (err) { toast.error(err.message || 'Analysis failed'); }
    finally { setIsAnalyzing(false); }
  };

  const generateWhatIf = async () => {
    if (!whatIfScenario.trim()) return;
    setIsGeneratingWhatIf(true);
    try {
      const res = await api.authenticatedRequest('/forum/whatif', {
        method: 'POST',
        body: JSON.stringify({ characterId: selectedCharacter._id, scenario: whatIfScenario })
      });
      setWhatIfResult(res.scenarioResult);
      toast.success('Scenario generated!');
    } catch (err) {
      toast.error(err.message || 'Failed to generate scenario');
    } finally {
      setIsGeneratingWhatIf(false);
    }
  };

  const exportReport = () => {
    window.print();
  };

  const getRadarData = () => {
    if (!analysis) return null;
    return {
      labels: ['Leadership', 'Antagonist\nPotential', 'Emotional\nStability'],
      datasets: [{
        data: [analysis.scores.leadership, analysis.scores.antagonistPotential, analysis.scores.emotionalStability],
        backgroundColor: 'rgba(99,44,255,0.15)',
        borderColor: 'rgba(164,120,255,0.9)',
        borderWidth: 2.5,
        pointBackgroundColor: '#b44fff',
        pointBorderColor: 'rgba(255,255,255,0.8)',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    };
  };

  const radarOpts = {
    responsive: true, maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true, max: 100,
        ticks: { stepSize: 25, color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.35)', backdropColor: 'transparent', font: { size: 10 } },
        grid: { color: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)', circular: true },
        angleLines: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
        pointLabels: { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', font: { size: 12, weight: '500', family: "'DM Mono', monospace" } }
      }
    },
    plugins: { legend: { display: false } }
  };

  return (
    <div 
      key={isDark ? 'dark' : 'light'}
      style={{ minHeight: '100vh' }}
    >
      {/* Load Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap');

        * { box-sizing: border-box; }

        .cp-scroll::-webkit-scrollbar { width: 4px; }
        .cp-scroll::-webkit-scrollbar-track { background: transparent; }
        .cp-scroll::-webkit-scrollbar-thumb { background: rgba(99,44,255,0.4); border-radius: 999px; }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-fadeup { animation: fadeSlideUp 0.6s cubic-bezier(.4,0,.2,1) both; }
        .anim-delay-1 { animation-delay: 0.08s; }
        .anim-delay-2 { animation-delay: 0.16s; }
        .anim-delay-3 { animation-delay: 0.24s; }
        .anim-delay-4 { animation-delay: 0.32s; }
        .anim-delay-5 { animation-delay: 0.40s; }
        .anim-delay-6 { animation-delay: 0.48s; }

        @keyframes pulseGlow {
          0%,100% { box-shadow: 0 0 20px rgba(99,44,255,0.15); }
          50%      { box-shadow: 0 0 40px rgba(99,44,255,0.35); }
        }

        .cp-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(56px, 8vw, 96px);
          font-weight: 900;
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin: 0 0 16px;
        }

        .cp-subtitle {
          font-family: 'DM Mono', monospace;
          font-size: 18px;
          letter-spacing: 0.04em;
          margin: 0;
        }

        .cp-section-label {
          font-family: 'DM Mono', 'Fira Code', monospace;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .cp-badge {
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }
      `}</style>

      <AmbientBackground isDark={isDark} />

      <div style={{
        position: 'relative', zIndex: 10,
        minHeight: '100vh',
        padding: '48px 24px',
        fontFamily: 'system-ui, sans-serif'
      }}>
        {/* Back button */}
        <button
          onClick={() => window.location.href = '/feed'}
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            borderRadius: 12,
            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.15)',
            color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: "'DM Mono', monospace",
            fontSize: 13,
            fontWeight: 500,
            textDecoration: 'none',
            zIndex: 20
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
            e.currentTarget.style.transform = 'translateX(-2px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>

          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="anim-fadeup" style={{ marginBottom: 56, textAlign: 'center' }}>
            {/* Theme Toggle */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
              <button
                onClick={toggleTheme}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  borderRadius: 999,
                  background: isDark ? 'rgba(99,44,255,0.15)' : 'rgba(99,44,255,0.1)',
                  border: isDark ? '1px solid rgba(99,44,255,0.3)' : '1px solid rgba(99,44,255,0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {isDark ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} color="#6c2aff" />}
                <span style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 12,
                  fontWeight: 500,
                  color: isDark ? '#fbbf24' : '#6c2aff'
                }}>
                  {isDark ? 'Light' : 'Dark'}
                </span>
              </button>
            </div>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 20px', borderRadius: 999,
              background: isDark ? 'rgba(99,44,255,0.15)' : 'rgba(99,44,255,0.1)',
              border: isDark ? '1px solid rgba(99,44,255,0.35)' : '1px solid rgba(99,44,255,0.25)',
              marginBottom: 28,
              transition: 'all 0.3s ease'
            }}>
              <span 
                className="cp-badge"
                style={{ color: isDark ? '#a78bfa' : '#7c3aed' }}
              >
                AI-Powered Psychology Engine
              </span>
            </div>

            <h1 
              className="cp-title"
              style={{
                color: isDark ? '#ffffff' : '#6c2aff',
                transition: 'color 0.4s ease'
              }}
            >
              Character{" "}
              <em style={{ fontStyle: 'italic' }}>Psychology</em>
            </h1>

            <p 
              className="cp-subtitle"
              style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.55)' }}
            >
              Uncover the hidden depths of characters.
            </p>
          </div>

          {/* ── Two-column layout ────────────────────────────────────────── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(300px,380px) 1fr',
            gap: 28,
            alignItems: 'start'
          }}>

            {/* ── LEFT: Character panel ──────────────────────────────────── */}
            <div className="anim-fadeup anim-delay-1" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <GlassCard style={{ padding: 24 }} accent isDark={isDark}>
                <SectionLabel icon={User} color="#a78bfa" isDark={isDark}>Characters</SectionLabel>

                {/* Create form toggle */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -8, marginBottom: 16 }}>
                  <Btn
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    icon={showCreateForm ? X : Plus}
                    variant="secondary"
                    isDark={isDark}
                  >
                    {showCreateForm ? 'Cancel' : 'New Character'}
                  </Btn>
                </div>

                {/* Create form */}
                {showCreateForm && (
                  <div style={{
                    padding: 20, marginBottom: 20,
                    borderRadius: 16,
                    background: 'rgba(99,44,255,0.06)',
                    border: '1px solid rgba(99,44,255,0.2)'
                  }}>
                    <form onSubmit={createCharacter} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <input
                        type="text"
                        placeholder="Character name…"
                        value={newCharacter.name}
                        onChange={e => setNewCharacter({ ...newCharacter, name: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'}`,
                          borderRadius: 12,
                          padding: '13px 16px',
                          color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)',
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 15,
                          outline: 'none',
                          transition: 'border-color 0.2s, box-shadow 0.2s'
                        }}
                      />
                      <textarea
                        placeholder="Personality, background, motivations, flaws…"
                        value={newCharacter.description}
                        onChange={e => setNewCharacter({ ...newCharacter, description: e.target.value })}
                        style={{ 
                          height: 110, 
                          resize: 'none',
                          width: '100%',
                          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'}`,
                          borderRadius: 12,
                          padding: '13px 16px',
                          color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)',
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 15,
                          outline: 'none',
                          transition: 'border-color 0.2s, box-shadow 0.2s'
                        }}
                        required
                      />
                      <Btn onClick={createCharacter} icon={Sparkles} variant="primary" fullWidth>
                        Create Character
                      </Btn>
                    </form>
                  </div>
                )}

                {/* Character list */}
                <div className="cp-scroll" style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 440, overflowY: 'auto' }}>
                  {characters.length === 0 ? (
                    <div style={{
                      textAlign: 'center', padding: '32px 0',
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 14, color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.4)',
                      letterSpacing: '0.08em'
                    }}>
                      No characters yet.<br />Create one above.
                    </div>
                  ) : (
                    characters.map(char => (
                      <CharacterItem
                        key={char._id}
                        character={char}
                        isSelected={selectedCharacter?._id === char._id}
                        onClick={() => { setSelectedCharacter(char); setAnalysis(null); }}
                        isDark={isDark}
                      />
                    ))
                  )}
                </div>

                {/* Analyze CTA */}
                {selectedCharacter && !analysis && (
                  <>
                    <Divider isDark={isDark} />
                    <Btn
                      onClick={analyzeCharacter}
                      disabled={isAnalyzing}
                      icon={Brain}
                      variant="glow"
                      fullWidth
                    >
                      {isAnalyzing
                        ? '✦  Analyzing…'
                        : `Analyse ${selectedCharacter.name}`}
                    </Btn>
                  </>
                )}
              </GlassCard>
            </div>

            {/* ── RIGHT: Analysis panel ─────────────────────────────────── */}
            <div>
              {analysis ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                  {/* Radar chart */}
                  <GlassCard className="anim-fadeup" style={{ padding: 28 }} accent isDark={isDark}>
                    <SectionLabel icon={Activity} color="#a78bfa" isDark={isDark}>Psychological Profile</SectionLabel>
                    <div style={{ height: 280, position: 'relative' }}>
                      {getRadarData() && <Radar data={getRadarData()} options={radarOpts} />}
                    </div>
                  </GlassCard>

                  {/* Score rings */}
                  <GlassCard className="anim-fadeup anim-delay-1" style={{ padding: '24px 28px' }} isDark={isDark}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                      <ScoreRing icon={Crown}  label="Leadership"  value={analysis.scores.leadership}          color="#fbbf24" isDark={isDark} />
                      <ScoreRing icon={Ghost}  label="Antagonist"  value={analysis.scores.antagonistPotential} color="#f87171" isDark={isDark} />
                      <ScoreRing icon={Heart}  label="Stability"   value={analysis.scores.emotionalStability}  color="#34d399" isDark={isDark} />
                    </div>
                  </GlassCard>

                  {/* MBTI + Alignment tags */}
                  <div className="anim-fadeup anim-delay-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <GlassCard style={{ padding: 24 }} isDark={isDark}>
                      <SectionLabel icon={Target} color="#a78bfa" isDark={isDark}>MBTI Type</SectionLabel>
                      <TraitPill type="mbti" text={analysis.mbti} />
                    </GlassCard>
                    <GlassCard style={{ padding: 24 }} isDark={isDark}>
                      <SectionLabel icon={Sword} color="#fbbf24" isDark={isDark}>Alignment</SectionLabel>
                      <TraitPill type="alignment" text={analysis.moralAlignment} />
                    </GlassCard>
                  </div>

                  {/* Alignment matrix */}
                  <GlassCard className="anim-fadeup anim-delay-3" style={{ padding: 28 }} isDark={isDark}>
                    <SectionLabel icon={Sword} color="#fbbf24" isDark={isDark}>Alignment Matrix</SectionLabel>
                    <AlignmentGrid activeAlignment={analysis.moralAlignment} isDark={isDark} />
                  </GlassCard>

                  {/* Strengths + Weaknesses */}
                  <div className="anim-fadeup anim-delay-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <GlassCard style={{ padding: 24 }} isDark={isDark}>
                      <SectionLabel icon={Zap} color="#00e09a" isDark={isDark}>Strengths</SectionLabel>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {analysis.traits.strengths.map((s, i) => <TraitPill key={i} type="strength" text={s} />)}
                      </div>
                    </GlassCard>
                    <GlassCard style={{ padding: 24 }} isDark={isDark}>
                      <SectionLabel icon={Heart} color="#ff5c72" isDark={isDark}>Weaknesses</SectionLabel>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {analysis.traits.weaknesses.map((w, i) => <TraitPill key={i} type="weakness" text={w} />)}
                      </div>
                    </GlassCard>
                  </div>

                  {/* Motivation */}
                  <GlassCard className="anim-fadeup anim-delay-5" style={{ padding: 28 }} isDark={isDark}>
                    <SectionLabel icon={Sparkles} color="#f472b6" isDark={isDark}>Primary Motivation</SectionLabel>
                    <p style={{
                      margin: 0,
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: 20, fontStyle: 'italic',
                      color: isDark ? 'rgba(255,255,255,0.82)' : 'rgba(0,0,0,0.75)',
                      lineHeight: 1.7,
                      letterSpacing: '0.01em'
                    }}>
                      "{analysis.motivation}"
                    </p>
                  </GlassCard>

                  {/* What If Scenario Generator */}
                  <GlassCard className="anim-fadeup anim-delay-6" style={{ padding: 28 }} isDark={isDark}>
                    <SectionLabel icon={Wand2} color="#b44fff" isDark={isDark}>"What If" Scenario Generator</SectionLabel>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                      <input
                        type="text"
                        placeholder="What if they made a different choice...?"
                        value={whatIfScenario}
                        onChange={(e) => setWhatIfScenario(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') generateWhatIf();
                        }}
                        style={{
                          flex: 1,
                          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'}`,
                          borderRadius: 12,
                          padding: '13px 16px',
                          color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)',
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 15,
                          outline: 'none',
                          transition: 'border-color 0.2s, box-shadow 0.2s'
                        }}
                      />
                      <Btn onClick={generateWhatIf} disabled={isGeneratingWhatIf || !whatIfScenario.trim()} icon={Wand2} variant="primary">
                        {isGeneratingWhatIf ? 'Dreaming...' : 'Generate'}
                      </Btn>
                    </div>
                    {whatIfResult && (
                      <div style={{
                        padding: 20,
                        borderRadius: 16,
                        background: isDark ? 'rgba(180,79,255,0.05)' : 'rgba(180,79,255,0.08)',
                        border: isDark ? '1px solid rgba(180,79,255,0.2)' : '1px solid rgba(180,79,255,0.3)'
                      }}>
                        <p style={{
                          margin: 0,
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 14,
                          color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.8)',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-line'
                        }}>
                          {whatIfResult}
                        </p>
                      </div>
                    )}
                  </GlassCard>

                  {/* Export Report Action */}
                  <div className="anim-fadeup anim-delay-6" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                    <Btn onClick={exportReport} icon={Printer} variant="secondary" isDark={isDark}>
                      Export Report to PDF (Academic Mode)
                    </Btn>
                  </div>

                </div>
              ) : (
                /* Empty state */
                <GlassCard className="anim-fadeup anim-delay-2" style={{
                  padding: 60, textAlign: 'center',
                  minHeight: 460,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center'
                }} isDark={isDark}>
                  <div style={{
                    width: 100, height: 100, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(99,44,255,0.2) 0%, transparent 70%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 28,
                    animation: 'pulseGlow 3s ease-in-out infinite'
                  }}>
                    <Brain size={44} color="rgba(164,120,255,0.5)" />
                  </div>
                  <h2 style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 32, fontWeight: 700,
                    color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
                    margin: '0 0 16px'
                  }}>
                    {selectedCharacter ? 'Ready to Analyse' : 'Select a Character'}
                  </h2>
                  <p style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 15, color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.55)',
                    lineHeight: 1.8, margin: 0, maxWidth: 340,
                    letterSpacing: '0.03em'
                  }}>
                    {selectedCharacter
                      ? `Click "Analyse ${selectedCharacter.name}" to unlock their psychological profile.`
                      : 'Choose a character from the left panel, or create a new one to begin.'}
                  </p>
                </GlassCard>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterPsychology;