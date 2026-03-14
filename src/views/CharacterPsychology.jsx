import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { toast } from 'sonner';
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
import { Brain, Sparkles, User, Plus, Activity, Zap, Heart, Sword, Crown, Ghost, Target, X, ChevronRight } from 'lucide-react';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

/* ─── Ambient background with noise + orbs ──────────────────────────────── */
const AmbientBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse 80% 60% at 20% 10%, #0d0221 0%, #020008 60%, #000 100%)'
    }} />
    {/* Glowing orbs */}
    <div style={{
      position: 'absolute', top: '-10%', left: '-5%',
      width: 600, height: 600,
      background: 'radial-gradient(circle, rgba(99,44,255,0.18) 0%, transparent 70%)',
      borderRadius: '50%',
      animation: 'orbDrift1 18s ease-in-out infinite'
    }} />
    <div style={{
      position: 'absolute', bottom: '-15%', right: '-10%',
      width: 700, height: 700,
      background: 'radial-gradient(circle, rgba(0,210,180,0.10) 0%, transparent 70%)',
      borderRadius: '50%',
      animation: 'orbDrift2 22s ease-in-out infinite'
    }} />
    <div style={{
      position: 'absolute', top: '40%', left: '50%',
      width: 400, height: 400,
      background: 'radial-gradient(circle, rgba(180,0,255,0.07) 0%, transparent 70%)',
      borderRadius: '50%',
      animation: 'orbDrift3 15s ease-in-out infinite'
    }} />
    {/* Subtle grid lines */}
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: `
        linear-gradient(rgba(99,44,255,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(99,44,255,0.04) 1px, transparent 1px)
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
const GlassCard = ({ children, className = '', style = {}, accent = false }) => (
  <div
    className={className}
    style={{
      position: 'relative',
      background: 'rgba(10,4,28,0.7)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: accent
        ? '1px solid rgba(99,44,255,0.45)'
        : '1px solid rgba(255,255,255,0.07)',
      borderRadius: 20,
      boxShadow: accent
        ? '0 0 40px rgba(99,44,255,0.15), inset 0 1px 0 rgba(255,255,255,0.06)'
        : 'inset 0 1px 0 rgba(255,255,255,0.04)',
      overflow: 'hidden',
      ...style
    }}
  >
    {/* top sheen */}
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 1,
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)'
    }} />
    {children}
  </div>
);

/* ─── Section label ──────────────────────────────────────────────────────── */
const SectionLabel = ({ icon: Icon, children, color = '#7c3aed' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
    <div style={{
      width: 34, height: 34, borderRadius: 10,
      background: `${color}22`,
      border: `1px solid ${color}55`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0
    }}>
      <Icon size={16} color={color} />
    </div>
    <span style={{
      fontFamily: "'DM Mono', 'Fira Code', monospace",
      fontSize: 11, fontWeight: 600,
      letterSpacing: '0.2em', textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.45)'
    }}>
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
const ScoreRing = ({ icon: Icon, label, value, color }) => {
  const r = 32;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value || 0));
  const dash = (pct / 100) * circ;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={90} height={90} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={45} cy={45} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
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
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, fontWeight: 700, color: '#fff' }}>
            {value}
          </span>
        </div>
      </div>
      <div style={{
        marginTop: 8,
        fontFamily: "'DM Mono', monospace",
        fontSize: 10, fontWeight: 600,
        letterSpacing: '0.15em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.35)'
      }}>
        {label}
      </div>
    </div>
  );
};

/* ─── Character list item ────────────────────────────────────────────────── */
const CharacterItem = ({ character, isSelected, onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%', textAlign: 'left', cursor: 'pointer',
      padding: '14px 16px',
      borderRadius: 14,
      border: isSelected ? '1px solid rgba(99,44,255,0.5)' : '1px solid rgba(255,255,255,0.05)',
      background: isSelected ? 'rgba(99,44,255,0.12)' : 'rgba(255,255,255,0.02)',
      display: 'flex', alignItems: 'center', gap: 14,
      transition: 'all 0.25s ease',
      boxShadow: isSelected ? '0 0 24px rgba(99,44,255,0.12)' : 'none',
      outline: 'none'
    }}
    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
  >
    <div style={{
      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
      background: isSelected
        ? 'linear-gradient(135deg, #6c2aff, #b44fff)'
        : 'rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Mono', monospace",
      fontSize: 16, fontWeight: 700,
      color: isSelected ? '#fff' : 'rgba(255,255,255,0.3)',
      boxShadow: isSelected ? '0 4px 16px rgba(99,44,255,0.4)' : 'none',
      transition: 'all 0.25s ease'
    }}>
      {character.name.charAt(0).toUpperCase()}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 14, fontWeight: 600,
        color: isSelected ? '#d4b4ff' : 'rgba(255,255,255,0.75)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
      }}>
        {character.name}
      </div>
      <div style={{
        fontSize: 12, marginTop: 3,
        color: 'rgba(255,255,255,0.3)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
      }}>
        {character.description}
      </div>
    </div>
    <ChevronRight size={14} color={isSelected ? '#a78bfa' : 'rgba(255,255,255,0.15)'} />
  </button>
);

/* ─── Alignment grid ─────────────────────────────────────────────────────── */
const AlignmentGrid = ({ activeAlignment }) => {
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
            background: active ? col.bg : 'rgba(255,255,255,0.03)',
            border: active ? 'none' : '1px solid rgba(255,255,255,0.06)',
            color: active ? '#fff' : 'rgba(255,255,255,0.22)',
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
const Btn = ({ onClick, children, icon: Icon, disabled, variant = 'primary', fullWidth = false }) => {
  const styles = {
    primary: {
      background: 'linear-gradient(135deg, #6c2aff 0%, #b44fff 100%)',
      color: '#fff',
      border: 'none',
      boxShadow: '0 4px 24px rgba(99,44,255,0.4)'
    },
    secondary: {
      background: 'rgba(255,255,255,0.05)',
      color: 'rgba(255,255,255,0.7)',
      border: '1px solid rgba(255,255,255,0.12)',
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
const Divider = () => (
  <div style={{
    height: 1, margin: '20px 0',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)'
  }} />
);

/* ══════════════════════════════════════════════════════════════════════════ */
const CharacterPsychology = () => {
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCharacter, setNewCharacter] = useState({ name: '', description: '' });

  useEffect(() => { loadCharacters(); }, []);

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
    } catch (err) { toast.error(err.message || 'Analysis failed'); }
    finally { setIsAnalyzing(false); }
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
        ticks: { stepSize: 25, color: 'rgba(255,255,255,0.25)', backdropColor: 'transparent', font: { size: 10 } },
        grid: { color: 'rgba(255,255,255,0.07)', circular: true },
        angleLines: { color: 'rgba(255,255,255,0.1)' },
        pointLabels: { color: 'rgba(255,255,255,0.6)', font: { size: 12, weight: '500', family: "'DM Mono', monospace" } }
      }
    },
    plugins: { legend: { display: false } }
  };

  return (
    <>
      {/* Load Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap');

        * { box-sizing: border-box; }

        .cp-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 13px 16px;
          color: rgba(255,255,255,0.85);
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .cp-input::placeholder { color: rgba(255,255,255,0.2); }
        .cp-input:focus {
          border-color: rgba(99,44,255,0.5);
          box-shadow: 0 0 0 3px rgba(99,44,255,0.12);
        }

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
      `}</style>

      <AmbientBackground />

      <div style={{
        position: 'relative', zIndex: 10,
        minHeight: '100vh',
        padding: '48px 24px',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>

          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="anim-fadeup" style={{ marginBottom: 56, textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '7px 18px', borderRadius: 999,
              background: 'rgba(99,44,255,0.1)',
              border: '1px solid rgba(99,44,255,0.3)',
              marginBottom: 24
            }}>
              <Sparkles size={13} color="#a78bfa" />
              <span style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11, fontWeight: 600, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: '#a78bfa'
              }}>
                AI-Powered Psychology Engine
              </span>
            </div>

            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(42px, 6vw, 72px)',
              fontWeight: 900,
              lineHeight: 1.05,
              margin: '0 0 16px',
              background: 'linear-gradient(145deg, #ffffff 20%, #c4a7ff 60%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em'
            }}>
              Character<br />
              <em>Psychology</em>
            </h1>

            <p style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 14, color: 'rgba(255,255,255,0.35)',
              letterSpacing: '0.04em', margin: 0
            }}>
              Uncover the hidden depths within — one character at a time.
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
              <GlassCard style={{ padding: 24 }} accent>
                <SectionLabel icon={User} color="#a78bfa">Characters</SectionLabel>

                {/* Create form toggle */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -8, marginBottom: 16 }}>
                  <Btn
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    icon={showCreateForm ? X : Plus}
                    variant="secondary"
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
                        className="cp-input"
                        type="text"
                        placeholder="Character name…"
                        value={newCharacter.name}
                        onChange={e => setNewCharacter({ ...newCharacter, name: e.target.value })}
                        required
                      />
                      <textarea
                        className="cp-input"
                        placeholder="Personality, background, motivations, flaws…"
                        value={newCharacter.description}
                        onChange={e => setNewCharacter({ ...newCharacter, description: e.target.value })}
                        style={{ height: 110, resize: 'none' }}
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
                      fontSize: 12, color: 'rgba(255,255,255,0.2)',
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
                      />
                    ))
                  )}
                </div>

                {/* Analyze CTA */}
                {selectedCharacter && !analysis && (
                  <>
                    <Divider />
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
                  <GlassCard className="anim-fadeup" style={{ padding: 28 }} accent>
                    <SectionLabel icon={Activity} color="#a78bfa">Psychological Profile</SectionLabel>
                    <div style={{ height: 280, position: 'relative' }}>
                      {getRadarData() && <Radar data={getRadarData()} options={radarOpts} />}
                    </div>
                  </GlassCard>

                  {/* Score rings */}
                  <GlassCard className="anim-fadeup anim-delay-1" style={{ padding: '24px 28px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                      <ScoreRing icon={Crown}  label="Leadership"  value={analysis.scores.leadership}          color="#fbbf24" />
                      <ScoreRing icon={Ghost}  label="Antagonist"  value={analysis.scores.antagonistPotential} color="#f87171" />
                      <ScoreRing icon={Heart}  label="Stability"   value={analysis.scores.emotionalStability}  color="#34d399" />
                    </div>
                  </GlassCard>

                  {/* MBTI + Alignment tags */}
                  <div className="anim-fadeup anim-delay-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <GlassCard style={{ padding: 24 }}>
                      <SectionLabel icon={Target} color="#a78bfa">MBTI Type</SectionLabel>
                      <TraitPill type="mbti" text={analysis.mbti} />
                    </GlassCard>
                    <GlassCard style={{ padding: 24 }}>
                      <SectionLabel icon={Sword} color="#fbbf24">Alignment</SectionLabel>
                      <TraitPill type="alignment" text={analysis.moralAlignment} />
                    </GlassCard>
                  </div>

                  {/* Alignment matrix */}
                  <GlassCard className="anim-fadeup anim-delay-3" style={{ padding: 28 }}>
                    <SectionLabel icon={Sword} color="#fbbf24">Alignment Matrix</SectionLabel>
                    <AlignmentGrid activeAlignment={analysis.moralAlignment} />
                  </GlassCard>

                  {/* Strengths + Weaknesses */}
                  <div className="anim-fadeup anim-delay-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <GlassCard style={{ padding: 24 }}>
                      <SectionLabel icon={Zap} color="#00e09a">Strengths</SectionLabel>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {analysis.traits.strengths.map((s, i) => <TraitPill key={i} type="strength" text={s} />)}
                      </div>
                    </GlassCard>
                    <GlassCard style={{ padding: 24 }}>
                      <SectionLabel icon={Heart} color="#ff5c72">Weaknesses</SectionLabel>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {analysis.traits.weaknesses.map((w, i) => <TraitPill key={i} type="weakness" text={w} />)}
                      </div>
                    </GlassCard>
                  </div>

                  {/* Motivation */}
                  <GlassCard className="anim-fadeup anim-delay-5" style={{ padding: 28 }}>
                    <SectionLabel icon={Sparkles} color="#f472b6">Primary Motivation</SectionLabel>
                    <p style={{
                      margin: 0,
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: 18, fontStyle: 'italic',
                      color: 'rgba(255,255,255,0.82)',
                      lineHeight: 1.7,
                      letterSpacing: '0.01em'
                    }}>
                      "{analysis.motivation}"
                    </p>
                  </GlassCard>

                </div>
              ) : (
                /* Empty state */
                <GlassCard className="anim-fadeup anim-delay-2" style={{
                  padding: 60, textAlign: 'center',
                  minHeight: 460,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center'
                }}>
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
                    fontSize: 28, fontWeight: 700,
                    color: 'rgba(255,255,255,0.8)',
                    margin: '0 0 12px'
                  }}>
                    {selectedCharacter ? 'Ready to Analyse' : 'Select a Character'}
                  </h2>
                  <p style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 13, color: 'rgba(255,255,255,0.3)',
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
    </>
  );
};

export default CharacterPsychology;