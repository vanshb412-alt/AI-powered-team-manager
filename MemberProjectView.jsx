import React, { useState, useEffect } from 'react';
import { myTasks } from './data.js';

const activity = [
  { initials: 'RM', color: '#534AB7', name: 'Raj M.', task: 'Set up API rate limiting', time: '2h ago' },
  { initials: 'AR', color: '#BA7517', name: 'Anika R.', task: 'Homepage redesign mockup', time: '4h ago' },
  { initials: 'DK', color: '#1D9E75', name: 'Dev K.', task: 'Write regression tests', time: 'Yesterday' },
  { initials: 'RM', color: '#534AB7', name: 'Raj M.', task: 'Database schema migration', time: 'Yesterday' },
  { initials: 'AR', color: '#BA7517', name: 'Anika R.', task: 'Icon set finalization', time: '2 days ago' },
];

function Confetti({ x, y }) {
  const colors = ['#534AB7', '#7F77DD', '#1D9E75', '#BA7517', '#E24B4A', '#F5A623'];
  return (
    <div style={{ position: 'fixed', left: x, top: y, pointerEvents: 'none', zIndex: 9999 }}>
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (Math.PI * 2 / 6) * i + Math.random() * 0.5;
        const dist = 30 + Math.random() * 30;
        return (
          <div key={i} style={{
            position: 'absolute', width: 6, height: 6, borderRadius: 2,
            background: colors[i], left: 0, top: 0,
            animation: `confettiBurst 0.4s ease-out forwards`,
            animationDelay: `${i * 0.02}s`,
            '--tx': `${Math.cos(angle) * dist}px`, '--ty': `${Math.sin(angle) * dist}px`
          }} />
        );
      })}
    </div>
  );
}

export default function MemberProjectView({ addToast }) {
  const [show, setShow] = useState(false);
  const [completed, setCompleted] = useState({});
  const [confetti, setConfetti] = useState(null);
  const [showBlocker, setShowBlocker] = useState(false);
  const [blockerText, setBlockerText] = useState('');
  const [blockerTask, setBlockerTask] = useState('');
  const [blockerSent, setBlockerSent] = useState(false);

  useEffect(() => { setTimeout(() => setShow(true), 50); }, []);

  const toggleTask = (i, e) => {
    if (completed[i]) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setConfetti({ x: rect.left + 10, y: rect.top + 10, id: Date.now() });
    setTimeout(() => setConfetti(null), 500);
    setCompleted(c => ({ ...c, [i]: true }));
    addToast('success', 'Task marked complete! +50 XP');
  };

  const submitBlocker = () => {
    setBlockerSent(true);
    setTimeout(() => { setShowBlocker(false); setBlockerSent(false); setBlockerText(''); setBlockerTask(''); }, 2000);
  };

  const completedCount = Object.keys(completed).length;

  return (
    <div>
      {confetti && <Confetti x={confetti.x} y={confetti.y} key={confetti.id} />}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24,
        opacity: show ? 1 : 0, transition: 'all 0.3s ease' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Mobile App Redesign</h1>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Team Synapse</div>
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 14px', borderRadius: 8, background: 'rgba(83,74,183,0.1)', color: '#534AB7' }}>Sprint 14</span>
      </div>

      {/* Progress card */}
      <div className="card" style={{ marginBottom: 24, opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(12px)', transition: 'all 0.4s ease 0.15s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500, letterSpacing: 0.5 }}>Overall Progress</div>
            <div style={{ fontSize: 36, fontWeight: 600, color: '#534AB7', margin: '8px 0' }}>68%</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sprint 14 · 41 of 60 tasks complete</div>
            <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, marginTop: 16, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#534AB7', borderRadius: 3, width: show ? '68%' : '0%', transition: 'width 0.8s ease-out 0.3s' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {[{ val: '12', label: 'Days left', color: 'var(--text)' }, { val: '8', label: 'Blockers', color: '#E24B4A' }, { val: '82%', label: 'AI Success Rate', color: '#1D9E75' }].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 600, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insight */}
      <div style={{
        background: 'var(--pill-bg)', border: '0.5px solid #AFA9EC', borderRadius: 12,
        padding: 16, marginBottom: 24,
        opacity: show ? 1 : 0, transition: 'all 0.3s ease 0.5s'
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#534AB7', marginBottom: 6 }}>✨ AI Team Insight</div>
        <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>
          Your team is on track for sprint completion. Focus on your 2 overdue tasks to keep the momentum going.
        </div>
      </div>

      {/* My Tasks */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>My Tasks</h2>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 8, background: 'rgba(226,75,74,0.1)', color: '#E24B4A' }}>{6 - completedCount} remaining</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Your assigned work for Sprint 14</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {myTasks.map((t, i) => {
            const done = completed[i];
            return (
              <div key={i} className="card-inner task-card-hover" style={{
                borderLeft: `3px solid ${done ? '#1D9E75' : t.borderColor}`, padding: '14px 16px',
                opacity: show ? (done ? 0.5 : 1) : 0, transform: show ? 'translateY(0)' : 'translateY(12px)',
                transition: `all 0.25s ease ${0.65 + i * 0.08}s`,
                textDecoration: done ? 'line-through' : 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div onClick={(e) => toggleTask(i, e)} style={{
                    width: 20, height: 20, borderRadius: 6, border: done ? 'none' : '2px solid var(--border)',
                    background: done ? '#1D9E75' : 'transparent', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 2, transition: 'all 0.2s',
                    color: 'white', fontSize: 12
                  }}>{done ? '✓' : ''}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{t.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>📁 {t.project}</div>
                    <div style={{
                      fontSize: 12, color: 'var(--text-muted)', marginTop: 4,
                      overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                    }}>{t.desc}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 8, background: `${t.prColor}15`, color: t.prColor }}>{t.priority}</span>
                    <div style={{ fontSize: 11, fontWeight: 600, color: t.dueColor, marginTop: 8 }}>{t.due}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Raise Blocker */}
      <button onClick={() => setShowBlocker(true)} style={{
        width: '100%', padding: 14, borderRadius: 12, border: '1.5px solid #E24B4A',
        background: 'transparent', color: '#E24B4A', fontSize: 14, fontWeight: 600,
        fontFamily: 'inherit', cursor: 'pointer', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        opacity: show ? 1 : 0, transition: 'all 0.2s ease 1.2s'
      }}>⚠ Raise a Blocker</button>

      {showBlocker && (
        <div className="card" style={{ marginBottom: 24 }}>
          {!blockerSent ? (
            <>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>What's blocking you?</h3>
              <textarea value={blockerText} onChange={e => setBlockerText(e.target.value)}
                placeholder="Describe what's stopping you from completing your work..."
                style={{
                  width: '100%', height: 80, padding: 12, borderRadius: 8, border: '0.5px solid var(--border)',
                  fontSize: 13, fontFamily: 'inherit', background: 'var(--bg)', color: 'var(--text)',
                  outline: 'none', resize: 'none', marginBottom: 12
                }} />
              <select value={blockerTask} onChange={e => setBlockerTask(e.target.value)} style={{
                width: '100%', padding: 10, borderRadius: 8, border: '0.5px solid var(--border)',
                fontSize: 13, fontFamily: 'inherit', background: 'var(--bg)', color: 'var(--text)',
                outline: 'none', marginBottom: 12
              }}>
                <option value="">Which task is blocked?</option>
                {myTasks.map((t, i) => <option key={i} value={t.title}>{t.title}</option>)}
              </select>
              <button onClick={submitBlocker} style={{
                width: '100%', padding: 12, borderRadius: 8, border: 'none',
                background: '#E24B4A', color: 'white', fontSize: 13, fontWeight: 600,
                fontFamily: 'inherit', cursor: 'pointer'
              }}>Submit Blocker</button>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: 16, color: '#1D9E75', fontWeight: 500, fontSize: 14 }}>
              ✓ Blocker raised. Your team lead has been notified.
            </div>
          )}
        </div>
      )}

      {/* Team Activity Feed */}
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 600 }}>Recent Team Activity</h2>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, marginTop: 4 }}>What the team shipped recently</div>
        {activity.map((a, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
            borderBottom: i < activity.length - 1 ? '0.5px solid var(--border)' : 'none',
            opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(8px)',
            transition: `all 0.25s ease ${1.3 + i * 0.06}s`
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', background: a.color, color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, flexShrink: 0
            }}>{a.initials}</div>
            <div style={{ flex: 1, fontSize: 13 }}>
              <strong>{a.name}</strong> completed "{a.task}"
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{a.time}</span>
            <span style={{ color: '#1D9E75', fontSize: 14 }}>✓</span>
          </div>
        ))}
      </div>
    </div>
  );
}
