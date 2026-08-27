import { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Crown,
  Medal,
  Sparkles,
  Search
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

interface LeaderboardEntry {
  rank: number;
  studentId: string;
  name: string;
  email: string;
  totalAttempts: number;
  totalPoints: number;
  totalQuestions: number;
  averageScore: number;
  highestScore: number;
  perfectScores: number;
  topTopic: string;
  tier: string;
  lastAttemptAt?: string;
}

interface LeaderboardData {
  timeframe: string;
  totalLearners: number;
  rankings: LeaderboardEntry[];
  podium: LeaderboardEntry[];
  currentUserStanding: LeaderboardEntry | null;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/attempts/leaderboard?timeframe=${timeframe}`);
        setData(res.data.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load leaderboard data.');
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [timeframe]);

  const filteredRankings = (data?.rankings || []).filter(entry => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return entry.name.toLowerCase().includes(q) || (entry.topTopic || '').toLowerCase().includes(q);
  });

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { color: '#FFB500', bg: 'rgba(255, 181, 0, 0.15)', icon: <Crown size={16} /> };
    if (rank === 2) return { color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.15)', icon: <Medal size={16} /> };
    if (rank === 3) return { color: '#D97706', bg: 'rgba(217, 119, 6, 0.15)', icon: <Medal size={16} /> };
    return { color: 'var(--color-text-muted)', bg: 'var(--color-surface-high)', icon: null };
  };

  const getTierBadgeClass = (tier: string) => {
    if (tier === 'Master Expert') return 'badge-published';
    if (tier === 'Senior Specialist') return 'badge-verified';
    if (tier === 'Certified Practitioner') return 'badge-draft';
    return 'badge-draft';
  };

  const podiumOrder = () => {
    if (!data?.podium || data.podium.length === 0) return [];
    const p = data.podium;
    // Arrangement: 2nd place (left), 1st place (center), 3rd place (right)
    const arranged = [];
    if (p[1]) arranged.push({ ...p[1], position: 2 });
    if (p[0]) arranged.push({ ...p[0], position: 1 });
    if (p[2]) arranged.push({ ...p[2], position: 3 });
    return arranged;
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
        <div className="page-eyebrow">
          <Trophy size={14} /> Training Performance Index
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--sp-4)' }}>
          <div>
            <h1 className="page-title">Workforce Leaderboard</h1>
            <p className="page-subtitle">
              Recognizing top-performing learners, assessment mastery, and subject comprehension.
            </p>
          </div>

          {/* Timeframe selector */}
          <div className="filter-tabs">
            {(['all', 'month', 'week'] as const).map(tf => (
              <button
                key={tf}
                type="button"
                className={`filter-tab ${timeframe === tf ? 'active' : ''}`}
                onClick={() => setTimeframe(tf)}
              >
                {tf === 'all' ? 'All-Time' : tf === 'month' ? 'This Month' : 'This Week'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 'var(--sp-12)', display: 'flex', justifyContent: 'center' }}>
          <LoadingSpinner text="Computing workforce standings..." />
        </div>
      ) : error ? (
        <div className="card" style={{ padding: 'var(--sp-6)' }}>
          <div className="alert alert-error">{error}</div>
        </div>
      ) : !data || data.rankings.length === 0 ? (
        <EmptyState
          icon={<Trophy size={36} />}
          title="No leaderboard entries yet"
          description="Learners will appear here once they complete and submit assessments."
        />
      ) : (
        <>
          {/* ── Top 3 Podium Cards ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'var(--sp-4)',
            marginBottom: 'var(--sp-8)',
            alignItems: 'flex-end'
          }}>
            {podiumOrder().map(item => {
              const isFirst = item.position === 1;
              const isSecond = item.position === 2;
              const rankInfo = getRankBadge(item.position);

              return (
                <div
                  key={item.studentId}
                  className="card"
                  style={{
                    padding: isFirst ? 'var(--sp-6)' : 'var(--sp-5)',
                    textAlign: 'center',
                    background: isFirst ? 'var(--color-surface)' : 'var(--color-surface)',
                    border: isFirst ? '2px solid var(--color-gold)' : '1px solid var(--color-border)',
                    boxShadow: isFirst ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                    position: 'relative',
                    transform: isFirst ? 'scale(1.03)' : 'none',
                    transition: 'all var(--transition)'
                  }}
                >
                  {/* Top Crown/Rank Badge */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: rankInfo.bg,
                    color: rankInfo.color,
                    margin: '0 auto var(--sp-3)',
                    fontWeight: 800,
                    fontSize: 16
                  }}>
                    {isFirst ? <Crown size={20} /> : isSecond ? <Medal size={18} /> : <Award size={18} />}
                  </div>

                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: rankInfo.color, marginBottom: 4 }}>
                    Rank #{item.position}
                  </div>

                  <h3 style={{ fontSize: isFirst ? 'var(--text-lg)' : 'var(--text-base)', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 2px 0' }}>
                    {item.name}
                  </h3>

                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--sp-3)' }}>
                    {item.topTopic}
                  </div>

                  {/* Score Highlight Box */}
                  <div style={{
                    background: 'var(--color-surface-low)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--sp-3)',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 6
                  }}>
                    <div>
                      <div style={{ fontSize: isFirst ? 'var(--text-xl)' : 'var(--text-lg)', fontWeight: 800, color: 'var(--color-primary)' }}>
                        {item.averageScore}%
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Avg Score</div>
                    </div>
                    <div>
                      <div style={{ fontSize: isFirst ? 'var(--text-xl)' : 'var(--text-lg)', fontWeight: 800, color: 'var(--color-text)' }}>
                        {item.totalAttempts}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Quizzes Done</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Logged-in User Standing Banner (If available) ── */}
          {data.currentUserStanding && (
            <div style={{
              background: 'var(--color-surface-low)',
              border: '1.5px solid var(--color-primary)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--sp-4) var(--sp-6)',
              marginBottom: 'var(--sp-6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--sp-4)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  color: 'var(--color-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 'var(--text-base)'
                }}>
                  #{data.currentUserStanding.rank}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 'var(--text-base)', color: 'var(--color-text)' }}>
                    Your Platform Standing: Rank #{data.currentUserStanding.rank} of {data.totalLearners}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    Average score of {data.currentUserStanding.averageScore}% across {data.currentUserStanding.totalAttempts} completed assessment{data.currentUserStanding.totalAttempts === 1 ? '' : 's'}.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                <span className={`badge ${getTierBadgeClass(data.currentUserStanding.tier)}`} style={{ fontWeight: 700 }}>
                  {data.currentUserStanding.tier}
                </span>
                {data.currentUserStanding.perfectScores > 0 && (
                  <span className="badge badge-published" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Sparkles size={12} /> {data.currentUserStanding.perfectScores} Perfect Score{data.currentUserStanding.perfectScores === 1 ? '' : 's'}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── Complete Standings Table ── */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="section-header" style={{ padding: 'var(--sp-5) var(--sp-6)', borderBottom: '1px solid var(--color-border)', marginBottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
              <div>
                <h3 className="section-title" style={{ margin: 0 }}>Full Ranking Table</h3>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  Total {data.totalLearners} active workforce trainee{data.totalLearners === 1 ? '' : 's'} ranked
                </div>
              </div>

              {/* Search input */}
              <div className="search-wrapper" style={{ width: 240 }}>
                <span className="search-icon"><Search size={14} /></span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search trainee..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ padding: '6px 12px 6px 34px', fontSize: 'var(--text-xs)' }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 70 }}>Rank</th>
                    <th>Learner</th>
                    <th>Proficiency Tier</th>
                    <th>Average Score</th>
                    <th>Assessments Done</th>
                    <th>Perfect Scores</th>
                    <th>Primary Competency</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRankings.map((entry) => {
                    const isCurrentUser = user?.email === entry.email;
                    const rankInfo = getRankBadge(entry.rank);

                    return (
                      <tr
                        key={entry.studentId}
                        style={{
                          background: isCurrentUser ? 'var(--color-surface-low)' : undefined,
                          fontWeight: isCurrentUser ? 700 : 400
                        }}
                      >
                        <td>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontWeight: 800,
                            color: rankInfo.color,
                            fontSize: 'var(--text-sm)'
                          }}>
                            {rankInfo.icon}
                            #{entry.rank}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                            <div style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: isCurrentUser ? 'var(--color-primary)' : 'var(--color-surface-high)',
                              color: isCurrentUser ? 'var(--color-gold)' : 'var(--color-text)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 12,
                              fontWeight: 700,
                              flexShrink: 0
                            }}>
                              {entry.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                                {entry.name} {isCurrentUser && <span style={{ color: 'var(--color-primary)', fontSize: 11 }}>(You)</span>}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                                {entry.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getTierBadgeClass(entry.tier)}`} style={{ fontSize: 11 }}>
                            {entry.tier}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            fontWeight: 800,
                            fontSize: 'var(--text-sm)',
                            color: entry.averageScore >= 80 ? 'var(--color-success)' : entry.averageScore >= 60 ? 'var(--color-warning)' : 'var(--color-danger)'
                          }}>
                            {entry.averageScore}%
                          </span>
                        </td>
                        <td style={{ color: 'var(--color-text)', fontWeight: 600 }}>
                          {entry.totalAttempts}
                        </td>
                        <td>
                          {entry.perfectScores > 0 ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-gold)', fontWeight: 700, fontSize: 'var(--text-xs)' }}>
                              <Sparkles size={13} /> {entry.perfectScores}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>—</span>
                          )}
                        </td>
                        <td style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
                          {entry.topTopic}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
