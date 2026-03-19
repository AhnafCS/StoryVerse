// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { useTheme } from '../hooks/useTheme';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Filler, Tooltip, Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import * as d3 from 'd3';
import {
  BookOpen, Sparkles, GitBranch, Activity, Flame,
  Users, Map, BarChart2, RefreshCw, Sun, Moon, ChevronRight
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

/* ─── Reused ambient background (matches CharacterPsychology) ────────────── */
const AmbientBackground = ({ isDark }) => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
    <div style={{
      position: 'absolute', inset: 0,
      background: isDark
        ? 'radial-gradient(ellipse 80% 60% at 20% 10%, #0d0221 0%, #020008 60%, #000 100%)'
        : 'radial-gradient(ellipse 80% 60% at 20% 10%, #f8f7ff 0%, #f0edff 60%, #e8e4f3 100%)'
    }} />
    <div style={{
      position: 'absolute', top: '-10%', left: '-5%', width: 600, height: 600,
      background: isDark
        ? 'radial-gradient(circle, rgba(0,180,255,0.14) 0%, transparent 70%)'
        : 'radial-gradient(circle, rgba(0,180,255,0.08) 0%, transparent 70%)',
      borderRadius: '50%', animation: 'orbDrift1 18s ease-in-out infinite'
    }} />
    <div style={{
      position: 'absolute', bottom: '-15%', right: '-10%', width: 700, height: 700,
      background: isDark
        ? 'radial-gradient(circle, rgba(99,44,255,0.10) 0%, transparent 70%)'
        : 'radial-gradient(circle, rgba(99,44,255,0.06) 0%, transparent 70%)',
      borderRadius: '50%', animation: 'orbDrift2 22s ease-in-out infinite'
    }} />
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: isDark
        ? 'linear-gradient(rgba(0,180,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,255,0.03) 1px, transparent 1px)'
        : 'linear-gradient(rgba(99,44,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(99,44,255,0.025) 1px, transparent 1px)',
      backgroundSize: '80px 80px'
    }} />
    <style>{`
      @keyframes orbDrift1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-30px) scale(1.08)} 66%{transform:translate(-20px,50px) scale(0.95)} }
      @keyframes orbDrift2 { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(-50px,30px) scale(1.05)} 70%{transform:translate(20px,-40px) scale(0.97)} }
      @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
      @keyframes pulseGlow { 0%,100%{box-shadow:0 0 20px rgba(0,180,255,0.15)} 50%{box-shadow:0 0 40px rgba(0,180,255,0.35)} }
      .nv-fadeup { animation: fadeUp 0.5s ease forwards; }
      .nv-delay1 { animation-delay: 0.1s; opacity: 0; }
      .nv-delay2 { animation-delay: 0.2s; opacity: 0; }
      .nv-delay3 { animation-delay: 0.3s; opacity: 0; }
      .nv-delay4 { animation-delay: 0.4s; opacity: 0; }
    `}</style>
  </div>
);

/* ─── Glass card ─────────────────────────────────────────────────────────── */
const GlassCard = ({ children, className = '', style = {}, accent = false, isDark }) => (
  <div className={className} style={{
    position: 'relative',
    background: isDark ? 'rgba(10,4,28,0.7)' : 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
    border: accent
      ? (isDark ? '1px solid rgba(0,180,255,0.4)' : '1px solid rgba(0,180,255,0.3)')
      : (isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.08)'),
    borderRadius: 20,
    boxShadow: accent
      ? (isDark ? '0 0 40px rgba(0,180,255,0.12), inset 0 1px 0 rgba(255,255,255,0.06)' : '0 0 40px rgba(0,180,255,0.08), inset 0 1px 0 rgba(255,255,255,0.8)')
      : (isDark ? 'inset 0 1px 0 rgba(255,255,255,0.04)' : '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)'),
    overflow: 'hidden', ...style
  }}>
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 1,
      background: isDark
        ? 'linear-gradient(90deg, transparent, rgba(0,180,255,0.2), transparent)'
        : 'linear-gradient(90deg, transparent, rgba(0,180,255,0.15), transparent)'
    }} />
    {children}
  </div>
);

/* ─── Section label ──────────────────────────────────────────────────────── */
const SectionLabel = ({ icon: Icon, children, color = '#00b4ff', isDark }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
    <div style={{
      width: 38, height: 38, borderRadius: 12,
      background: `${color}22`, border: `1px solid ${color}55`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
    }}>
      <Icon size={18} color={color} />
    </div>
    <span style={{
      fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 600,
      letterSpacing: '0.12em', textTransform: 'uppercase',
      color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'
    }}>{children}</span>
  </div>
);

/* ─── Btn ────────────────────────────────────────────────────────────────── */
const Btn = ({ children, onClick, disabled, icon: Icon, variant = 'default', fullWidth }) => {
  const variants = {
    glow: {
      background: 'linear-gradient(135deg, #0090cc 0%, #6628ff 100%)',
      color: '#fff', border: 'none',
      boxShadow: '0 4px 24px rgba(0,144,204,0.4)'
    },
    primary: {
      background: 'rgba(0,180,255,0.15)', color: '#00b4ff',
      border: '1px solid rgba(0,180,255,0.35)'
    },
    danger: {
      background: 'rgba(255,60,80,0.12)', color: '#ff5c72',
      border: '1px solid rgba(255,60,80,0.3)'
    },
    default: {
      background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)',
      border: '1px solid rgba(255,255,255,0.1)'
    }
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '12px 20px', borderRadius: 12, cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 600,
        letterSpacing: '0.05em', transition: 'all 0.2s', width: fullWidth ? '100%' : 'auto',
        opacity: disabled ? 0.5 : 1, ...variants[variant]
      }}
    >
      {Icon && <Icon size={15} />}
      {children}
    </button>
  );
};

/* ─── Character selector item ────────────────────────────────────────────── */
const CharacterItem = ({ character, isSelected, onClick, isDark }) => (
  <div onClick={onClick} style={{
    padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
    background: isSelected
      ? (isDark ? 'rgba(0,180,255,0.12)' : 'rgba(0,180,255,0.1)')
      : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
    border: isSelected
      ? '1px solid rgba(0,180,255,0.4)'
      : (isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)'),
    transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
  }}>
    <div>
      <div style={{
        fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 600,
        color: isSelected ? '#00b4ff' : (isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)')
      }}>{character.name}</div>
      <div style={{
        fontSize: 12, fontFamily: "'DM Mono', monospace",
        color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)',
        marginTop: 3,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200
      }}>{character.description?.slice(0, 60)}…</div>
    </div>
    {isSelected && <ChevronRight size={16} color="#00b4ff" />}
  </div>
);

/* ─── Feature 1 & 2: Growth Arc + Emotional Intensity Chart ─────────────── */
const GrowthArcChart = ({ growthArc, isDark }) => {
  const labels = growthArc.map(p => p.phase);
  const sentimentData = growthArc.map(p => ((p.sentimentScore + 1) / 2) * 100); // normalize to 0-100
  const intensityData = growthArc.map(p => p.emotionalIntensity);

  const data = {
    labels,
    datasets: [
      {
        label: 'Growth Arc (Sentiment)',
        data: sentimentData,
        borderColor: '#00b4ff',
        backgroundColor: 'rgba(0,180,255,0.08)',
        pointBackgroundColor: '#00b4ff',
        pointBorderColor: isDark ? '#0a041c' : '#fff',
        pointBorderWidth: 2, pointRadius: 6, pointHoverRadius: 8,
        tension: 0.4, fill: true, borderWidth: 2
      },
      {
        label: 'Emotional Intensity',
        data: intensityData,
        borderColor: '#f472b6',
        backgroundColor: 'rgba(244,114,182,0.06)',
        pointBackgroundColor: '#f472b6',
        pointBorderColor: isDark ? '#0a041c' : '#fff',
        pointBorderWidth: 2, pointRadius: 6, pointHoverRadius: 8,
        tension: 0.4, fill: true, borderWidth: 2, borderDash: [5, 3]
      }
    ]
  };

  const opts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)',
          font: { family: "'DM Mono', monospace", size: 11 },
          boxWidth: 12, padding: 20
        }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(10,4,28,0.95)' : 'rgba(255,255,255,0.98)',
        titleColor: isDark ? '#fff' : '#000',
        bodyColor: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
        borderColor: 'rgba(0,180,255,0.3)', borderWidth: 1,
        titleFont: { family: "'DM Mono', monospace", size: 12 },
        bodyFont: { family: "'DM Mono', monospace", size: 11 },
        callbacks: {
          afterBody: (items) => {
            const idx = items[0]?.dataIndex;
            const phase = growthArc[idx];
            return phase ? [`\n${phase.description}`] : [];
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)',
          font: { family: "'DM Mono', monospace", size: 10 }
        },
        grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)' }
      },
      y: {
        min: 0, max: 100,
        ticks: {
          color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)',
          font: { family: "'DM Mono', monospace", size: 10 },
          callback: v => `${v}%`
        },
        grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)' }
      }
    }
  };

  return (
    <div style={{ height: 300, position: 'relative' }}>
      <Line data={data} options={opts} />
    </div>
  );
};

/* ─── Feature 1: Phase breakdown cards ──────────────────────────────────── */
const PhaseCards = ({ growthArc, isDark }) => {
  const sentimentColor = (score) => {
    if (score >= 0.4) return '#00e09a';
    if (score >= 0) return '#00b4ff';
    if (score >= -0.4) return '#fbbf24';
    return '#ff5c72';
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginTop: 20 }}>
      {growthArc.map((phase, i) => (
        <div key={i} style={{
          padding: '14px 12px', borderRadius: 12,
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
          border: `1px solid ${sentimentColor(phase.sentimentScore)}33`,
          textAlign: 'center'
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: `${sentimentColor(phase.sentimentScore)}22`,
            border: `1px solid ${sentimentColor(phase.sentimentScore)}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 8px',
            fontFamily: "'DM Mono', monospace", fontSize: 11,
            color: sentimentColor(phase.sentimentScore), fontWeight: 700
          }}>{i + 1}</div>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 600,
            color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.75)',
            marginBottom: 4
          }}>{phase.phase}</div>
          <div style={{
            fontSize: 10, fontFamily: "'DM Mono', monospace",
            color: sentimentColor(phase.sentimentScore)
          }}>{phase.sentimentScore >= 0 ? '+' : ''}{(phase.sentimentScore * 100).toFixed(0)}%</div>
        </div>
      ))}
    </div>
  );
};

/* ─── Feature 3: Relationship Network (D3) ───────────────────────────────── */
const RelationshipGraph = ({ relationships, characterName, isDark }) => {
  const svgRef = useRef(null);

  const relationColors = {
    friendship: '#00e09a', rivalry: '#ff5c72', romance: '#f472b6',
    mentor: '#fbbf24', conflict: '#ff3c50', neutral: '#6b7280'
  };

  useEffect(() => {
    if (!svgRef.current || !relationships?.length) return;

    const width = svgRef.current.clientWidth || 560;
    const height = 380;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%').attr('height', height);

    // Build unique nodes
    const nodeSet = new Set([characterName]);
    relationships.forEach(r => { nodeSet.add(r.source); nodeSet.add(r.target); });
    const nodes = Array.from(nodeSet).map(id => ({ id, isMain: id === characterName }));

    const links = relationships.map(r => ({
      source: r.source, target: r.target,
      type: r.type, strength: r.strength
    }));

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(d => 130 - d.strength * 6))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide(40));

    // Arrow markers per type
    const defs = svg.append('defs');
    Object.entries(relationColors).forEach(([type, color]) => {
      defs.append('marker')
        .attr('id', `arrow-${type}`).attr('viewBox', '0 -5 10 10')
        .attr('refX', 28).attr('refY', 0)
        .attr('markerWidth', 6).attr('markerHeight', 6).attr('orient', 'auto')
        .append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', color).attr('opacity', 0.7);
    });

    // Links
    const link = svg.append('g').selectAll('line')
      .data(links).join('line')
      .attr('stroke', d => relationColors[d.type] || '#6b7280')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => 1 + d.strength * 0.3)
      .attr('marker-end', d => `url(#arrow-${d.type})`);

    // Link labels
    const linkLabel = svg.append('g').selectAll('text')
      .data(links).join('text')
      .text(d => d.type)
      .attr('font-family', "'DM Mono', monospace")
      .attr('font-size', 9)
      .attr('fill', d => relationColors[d.type] || '#6b7280')
      .attr('opacity', 0.8)
      .attr('text-anchor', 'middle');

    // Node groups
    const node = svg.append('g').selectAll('g')
      .data(nodes).join('g')
      .call(d3.drag()
        .on('start', (event, d) => { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on('end', (event, d) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; })
      );

    // Glow circle for main character
    node.filter(d => d.isMain).append('circle')
      .attr('r', 30)
      .attr('fill', 'rgba(0,180,255,0.12)')
      .attr('stroke', 'rgba(0,180,255,0.3)').attr('stroke-width', 1);

    node.append('circle')
      .attr('r', d => d.isMain ? 22 : 16)
      .attr('fill', d => d.isMain
        ? (isDark ? 'rgba(0,144,204,0.3)' : 'rgba(0,144,204,0.2)')
        : (isDark ? 'rgba(99,44,255,0.25)' : 'rgba(99,44,255,0.15)'))
      .attr('stroke', d => d.isMain ? '#00b4ff' : '#7c3aed')
      .attr('stroke-width', d => d.isMain ? 2.5 : 1.5);

    node.append('text')
      .text(d => d.id)
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.isMain ? 38 : 30)
      .attr('font-family', "'DM Mono', monospace")
      .attr('font-size', d => d.isMain ? 12 : 10)
      .attr('font-weight', d => d.isMain ? 700 : 500)
      .attr('fill', isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)');

    // Tooltip on hover
    node.append('title').text(d => d.id);

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      linkLabel
        .attr('x', d => (d.source.x + d.target.x) / 2)
        .attr('y', d => (d.source.y + d.target.y) / 2 - 5);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => simulation.stop();
  }, [relationships, characterName, isDark]);

  // Legend
  return (
    <div>
      <svg ref={svgRef} style={{ width: '100%', display: 'block' }} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
        {Object.entries(relationColors).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
            <span style={{
              fontFamily: "'DM Mono', monospace", fontSize: 10,
              color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
              textTransform: 'capitalize'
            }}>{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Feature 4: Story Structure card ───────────────────────────────────── */
const StoryStructureCard = ({ storyStructure, isDark }) => {
  const structureIcons = {
    "Hero's Journey": '⚔️', 'Tragedy': '💀', 'Redemption Arc': '✨',
    'Coming of Age': '🌱', 'Revenge Arc': '🔥', 'Fallen Hero': '🌑', "Anti-Hero's Path": '🗡️'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Structure type badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, flexShrink: 0
        }}>
          {structureIcons[storyStructure.type] || '📖'}
        </div>
        <div>
          <div style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 22, fontWeight: 700,
            color: isDark ? '#fff' : '#000', marginBottom: 4
          }}>{storyStructure.type}</div>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: 11,
            color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)',
            letterSpacing: '0.08em', textTransform: 'uppercase'
          }}>Narrative Structure</div>
        </div>
      </div>

      {/* Description */}
      <p style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 15, fontStyle: 'italic', lineHeight: 1.7, margin: 0,
        color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)'
      }}>"{storyStructure.description}"</p>

      {/* Key moments */}
      {storyStructure.keyMoments?.length > 0 && (
        <div>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)',
            marginBottom: 10
          }}>Key Story Moments</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {storyStructure.keyMoments.map((m, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '10px 14px', borderRadius: 10,
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)'
              }}>
                <span style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 11,
                  color: '#fbbf24', fontWeight: 700, flexShrink: 0
                }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 12,
                  color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)',
                  lineHeight: 1.5
                }}>{m}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Feature 5: Theme & Conflict ────────────────────────────────────────── */
const ThemeConflictCard = ({ themeAnalysis, isDark }) => {
  const intensity = themeAnalysis.conflictIntensity || 0;
  const intensityColor = intensity >= 75 ? '#ff3c50' : intensity >= 50 ? '#fbbf24' : intensity >= 25 ? '#00b4ff' : '#00e09a';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Themes */}
      <div>
        <div style={{
          fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 600,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)', marginBottom: 12
        }}>Recurring Themes</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {themeAnalysis.recurringThemes?.map((theme, i) => (
            <span key={i} style={{
              padding: '7px 14px', borderRadius: 999,
              fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 500,
              background: 'rgba(0,180,255,0.1)', border: '1px solid rgba(0,180,255,0.3)',
              color: '#00b4ff'
            }}>{theme}</span>
          ))}
        </div>
      </div>

      {/* Conflict intensity bar */}
      <div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10
        }}>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)'
          }}>Conflict Intensity</div>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 700,
            color: intensityColor
          }}>{intensity}/100</span>
        </div>
        <div style={{
          height: 10, borderRadius: 999,
          background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%', borderRadius: 999,
            width: `${intensity}%`,
            background: `linear-gradient(90deg, ${intensityColor}88, ${intensityColor})`,
            transition: 'width 1s ease',
            boxShadow: `0 0 12px ${intensityColor}55`
          }} />
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: 5
        }}>
          {['Minimal', 'Low', 'Moderate', 'High', 'Extreme'].map((l, i) => (
            <span key={i} style={{
              fontFamily: "'DM Mono', monospace", fontSize: 9,
              color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.35)'
            }}>{l}</span>
          ))}
        </div>
      </div>

      {/* Conflict description */}
      {themeAnalysis.conflictDescription && (
        <p style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 15, fontStyle: 'italic', lineHeight: 1.7, margin: 0,
          color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.6)',
          borderLeft: `3px solid ${intensityColor}55`, paddingLeft: 16
        }}>"{themeAnalysis.conflictDescription}"</p>
      )}
    </div>
  );
};

/* ─── Loading skeleton ───────────────────────────────────────────────────── */
const LoadingSkeleton = ({ isDark }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
    {[300, 200, 400, 240].map((h, i) => (
      <GlassCard key={i} style={{ padding: 28, height: h }} isDark={isDark}>
        <div style={{
          width: '40%', height: 16, borderRadius: 8, marginBottom: 24,
          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          animation: 'pulseGlow 2s ease-in-out infinite'
        }} />
        <div style={{
          width: '100%', height: '60%', borderRadius: 12,
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
          animation: 'pulseGlow 2s ease-in-out infinite'
        }} />
      </GlassCard>
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
══════════════════════════════════════════════════════════════════════════ */
const NarrativeViz = () => {
  const { isDark, toggleTheme } = useTheme();
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [narrative, setNarrative] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Load characters on mount
  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const data = await api.authenticatedRequest('/characters');
        setCharacters(data.characters || []);
      } catch {
        toast.error('Failed to load characters');
      }
    };
    loadCharacters();
  }, []);

  // When character selected, try to fetch existing narrative
  useEffect(() => {
    if (!selectedCharacter) { setNarrative(null); return; }
    const fetchNarrative = async () => {
      setIsFetching(true);
      try {
        const data = await api.authenticatedRequest(`/narrative/${selectedCharacter._id}`);
        setNarrative(data.narrative);
      } catch {
        setNarrative(null); // 404 = not yet generated
      } finally {
        setIsFetching(false);
      }
    };
    fetchNarrative();
  }, [selectedCharacter]);

  const generateNarrative = async () => {
    if (!selectedCharacter) return;
    setIsLoading(true);
    try {
      const data = await api.authenticatedRequest(`/narrative/${selectedCharacter._id}`, { method: 'POST' });
      setNarrative(data.narrative);
      toast.success('Narrative analysis complete!');
    } catch (err) {
      toast.error(err.message || 'Failed to generate narrative');
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateNarrative = async () => {
    if (!selectedCharacter) return;
    try {
      await api.authenticatedRequest(`/narrative/${selectedCharacter._id}`, { method: 'DELETE' });
      setNarrative(null);
      toast.success('Cleared — click Analyse to regenerate');
    } catch {
      toast.error('Failed to clear narrative');
    }
  };

  const navLinkStyle = {
    fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 500,
    color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)',
    textDecoration: 'none', letterSpacing: '0.05em',
    padding: '6px 12px', borderRadius: 8,
    transition: 'color 0.2s'
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <AmbientBackground isDark={isDark} />

      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: isDark ? 'rgba(2,0,8,0.7)' : 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.07)',
        padding: '0 32px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOpen size={20} color="#00b4ff" />
          <span style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 18, fontWeight: 700,
            color: isDark ? '#fff' : '#000'
          }}>StoryVerse</span>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: 10,
            color: 'rgba(0,180,255,0.7)', marginLeft: 4,
            background: 'rgba(0,180,255,0.1)', border: '1px solid rgba(0,180,255,0.25)',
            padding: '2px 8px', borderRadius: 6
          }}>Narrative</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a href="/psychology" style={navLinkStyle}>Psychology</a>
          <a href="/feed" style={navLinkStyle}>Feed</a>
          <button onClick={toggleTheme} style={{
            width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
            background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'
          }}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </nav>

      {/* ── Page content ─────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 1, padding: '40px 32px', maxWidth: 1280, margin: '0 auto' }}>

        {/* Header */}
        <div className="nv-fadeup" style={{ marginBottom: 40, textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 999,
            background: 'rgba(0,180,255,0.1)', border: '1px solid rgba(0,180,255,0.25)',
            marginBottom: 16
          }}>
            <GitBranch size={13} color="#00b4ff" />
            <span style={{
              fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#00b4ff',
              letterSpacing: '0.1em', textTransform: 'uppercase'
            }}>Requirement 3 — AI Narrative Engine</span>
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 700, margin: '0 0 12px',
            color: isDark ? '#fff' : '#000'
          }}>Narrative & Growth Visualization</h1>
          <p style={{
            fontFamily: "'DM Mono', monospace", fontSize: 14,
            color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)',
            margin: 0, maxWidth: 520, marginInline: 'auto', lineHeight: 1.7
          }}>
            AI-powered story structure detection, growth arc mapping, relationship networks, and theme analysis.
          </p>
        </div>

        {/* ── Two-column layout ────────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 320px) minmax(0, 1fr)',
          gap: 24, alignItems: 'start'
        }}>

          {/* LEFT: Character selector */}
          <GlassCard className="nv-fadeup nv-delay1" style={{ padding: 24 }} isDark={isDark}>
            <SectionLabel icon={Users} color="#00b4ff" isDark={isDark}>Select Character</SectionLabel>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 480, overflowY: 'auto' }}>
              {characters.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '32px 0',
                  fontFamily: "'DM Mono', monospace", fontSize: 13,
                  color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.4)', letterSpacing: '0.06em'
                }}>
                  No characters found.<br />Create characters in Psychology.
                </div>
              ) : (
                characters.map(char => (
                  <CharacterItem
                    key={char._id}
                    character={char}
                    isSelected={selectedCharacter?._id === char._id}
                    onClick={() => setSelectedCharacter(char)}
                    isDark={isDark}
                  />
                ))
              )}
            </div>

            {selectedCharacter && (
              <>
                <div style={{
                  height: 1, margin: '20px 0',
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'
                }} />
                {!narrative ? (
                  <Btn
                    onClick={generateNarrative}
                    disabled={isLoading || isFetching}
                    icon={Sparkles} variant="glow" fullWidth
                  >
                    {isLoading ? '✦  Analysing…' : isFetching ? '⟳  Loading…' : `Analyse ${selectedCharacter.name}`}
                  </Btn>
                ) : (
                  <Btn
                    onClick={regenerateNarrative}
                    icon={RefreshCw} variant="danger" fullWidth
                  >
                    Regenerate Analysis
                  </Btn>
                )}
              </>
            )}
          </GlassCard>

          {/* RIGHT: Visualizations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {isLoading && <LoadingSkeleton isDark={isDark} />}

            {!isLoading && !narrative && (
              <GlassCard className="nv-fadeup nv-delay2" style={{
                padding: 60, textAlign: 'center', minHeight: 460,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
              }} isDark={isDark}>
                <div style={{
                  width: 100, height: 100, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(0,180,255,0.18) 0%, transparent 70%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 28, animation: 'pulseGlow 3s ease-in-out infinite'
                }}>
                  <Map size={44} color="rgba(0,180,255,0.5)" />
                </div>
                <h2 style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 32, fontWeight: 700, margin: '0 0 16px',
                  color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'
                }}>
                  {selectedCharacter ? 'Ready to Map' : 'Select a Character'}
                </h2>
                <p style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 14,
                  color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.5)',
                  lineHeight: 1.8, margin: 0, maxWidth: 360, letterSpacing: '0.03em'
                }}>
                  {selectedCharacter
                    ? `Click "Analyse ${selectedCharacter.name}" to generate narrative visualizations.`
                    : 'Choose a character from the left to begin narrative analysis.'}
                </p>
              </GlassCard>
            )}

            {!isLoading && narrative && (
              <>
                {/* Feature 1 & 2: Growth Arc + Emotional Intensity */}
                <GlassCard className="nv-fadeup" style={{ padding: 28 }} accent isDark={isDark}>
                  <SectionLabel icon={Activity} color="#00b4ff" isDark={isDark}>
                    Character Growth Arc &amp; Emotional Intensity
                  </SectionLabel>
                  <GrowthArcChart growthArc={narrative.growthArc} isDark={isDark} />
                  <PhaseCards growthArc={narrative.growthArc} isDark={isDark} />
                </GlassCard>

                {/* Feature 3: Relationship Network */}
                <GlassCard className="nv-fadeup nv-delay1" style={{ padding: 28 }} isDark={isDark}>
                  <SectionLabel icon={Users} color="#a78bfa" isDark={isDark}>
                    Relationship Network Graph
                  </SectionLabel>
                  <RelationshipGraph
                    relationships={narrative.relationships}
                    characterName={selectedCharacter?.name}
                    isDark={isDark}
                  />
                </GlassCard>

                {/* Feature 4 + 5: Two-column grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <GlassCard className="nv-fadeup nv-delay2" style={{ padding: 28 }} isDark={isDark}>
                    <SectionLabel icon={Map} color="#fbbf24" isDark={isDark}>
                      Story Structure
                    </SectionLabel>
                    <StoryStructureCard storyStructure={narrative.storyStructure} isDark={isDark} />
                  </GlassCard>

                  <GlassCard className="nv-fadeup nv-delay3" style={{ padding: 28 }} isDark={isDark}>
                    <SectionLabel icon={Flame} color="#f472b6" isDark={isDark}>
                      Themes &amp; Conflict Intensity
                    </SectionLabel>
                    <ThemeConflictCard themeAnalysis={narrative.themeAnalysis} isDark={isDark} />
                  </GlassCard>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NarrativeViz;
