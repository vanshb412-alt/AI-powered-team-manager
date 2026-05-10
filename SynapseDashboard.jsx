import React, { useState, useEffect, useRef, useCallback } from 'react';
import './app.css';
import { notifications, announcements } from './data.js';
import LoginScreen from './LoginScreen.jsx';
import RoleSelectScreen from './RoleSelectScreen.jsx';
import OnboardingScreen from './OnboardingScreen.jsx';
import ProfileScreen from './ProfileScreen.jsx';
import DashboardScreen from './DashboardScreen.jsx';
import AnalyticsScreen from './AnalyticsScreen.jsx';
import AchievementsScreen from './AchievementsScreen.jsx';
import MemberProjectView from './MemberProjectView.jsx';

const BellIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
const MoonIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>;
const SunIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>;
const MegaIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
const TrophyIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/></svg>;

export default function SynapseDashboard() {
  // Auth state from localStorage
  const stored = useRef({
    isLoggedIn: localStorage.getItem('synapse_loggedIn') === 'true',
    userRole: localStorage.getItem('synapse_role'),
    onboarded: localStorage.getItem('synapse_onboarded') === 'true',
  });

  const [appPhase, setAppPhase] = useState(
    stored.current.isLoggedIn && stored.current.onboarded ? 'app' :
    stored.current.isLoggedIn ? 'roleSelect' : 'login'
  );
  const [userRole, setUserRole] = useState(stored.current.userRole || null);
  const [selectedRole, setSelectedRole] = useState(null);

  // App state
  const defaultScreen = stored.current.isLoggedIn && stored.current.onboarded
    ? (stored.current.userRole === 'member' ? 'myproject' : 'dashboard') : 'profile';
  const [screen, setScreen] = useState(defaultScreen);
  const [isDark, setIsDark] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [bellRing, setBellRing] = useState(false);
  const [themeSpin, setThemeSpin] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [fadeState, setFadeState] = useState('active');
  const [showSignOut, setShowSignOut] = useState(false);

  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const hovering = useRef(false);

  // Init loaded
  useEffect(() => { if (appPhase === 'app') setTimeout(() => setLoaded(true), 100); }, [appPhase]);

  // Bell ring
  useEffect(() => {
    if (appPhase !== 'app') return;
    const iv = setInterval(() => { setBellRing(true); setTimeout(() => setBellRing(false), 500); }, 8000);
    return () => clearInterval(iv);
  }, [appPhase]);

  // Cursor
  useEffect(() => {
    const onMove = (e) => { mousePos.current = { x: e.clientX, y: e.clientY }; };
    const onClick = (e) => {
      const r = document.createElement('div'); r.className = 'click-ripple';
      r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px';
      document.body.appendChild(r); setTimeout(() => r.remove(), 400);
      if (dotRef.current) { dotRef.current.classList.add('clicking'); setTimeout(() => dotRef.current?.classList.remove('clicking'), 150); }
    };
    const onOver = (e) => {
      hovering.current = !!e.target.closest('button,a,[role="button"],.project-row,.nav-btn,.card-inner,.insight-pill,.mag-btn,.avatar,.heatmap-cell,.ai-brief,.task-card-hover');
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('click', onClick);
    document.addEventListener('mouseover', onOver);
    let raf;
    const loop = () => {
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.12;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.12;
      if (dotRef.current) { dotRef.current.style.left = mousePos.current.x + 'px'; dotRef.current.style.top = mousePos.current.y + 'px'; dotRef.current.classList.toggle('hovering', hovering.current); }
      if (ringRef.current) { ringRef.current.style.left = ringPos.current.x + 'px'; ringRef.current.style.top = ringPos.current.y + 'px'; ringRef.current.classList.toggle('hovering', hovering.current); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); document.removeEventListener('mousemove', onMove); document.removeEventListener('click', onClick); document.removeEventListener('mouseover', onOver); };
  }, []);

  useEffect(() => { document.body.classList.toggle('dark', isDark); }, [isDark]);

  const toggleDark = () => { setThemeSpin(true); setTimeout(() => setThemeSpin(false), 400); setIsDark(d => !d); };

  const navigate = useCallback((target) => {
    if (target === screen) return;
    setFadeState('exit');
    setTimeout(() => { setScreen(target); setFadeState('enter'); setTimeout(() => setFadeState('active'), 20); }, 200);
  }, [screen]);

  const addToast = useCallback((type, msg) => {
    const id = Date.now();
    setToasts(t => [...t, { id, type, msg }]);
    setTimeout(() => {
      setToasts(t => t.map(x => x.id === id ? { ...x, exit: true } : x));
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 200);
    }, 2500);
  }, []);

  // Auth handlers
  const handleLogin = () => {
    localStorage.setItem('synapse_loggedIn', 'true');
    setAppPhase('roleSelect');
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setAppPhase('onboarding');
  };

  const handleOnboardComplete = (data) => {
    const role = selectedRole;
    localStorage.setItem('synapse_role', role);
    localStorage.setItem('synapse_onboarded', 'true');
    localStorage.setItem('synapse_userName', data.userName);
    localStorage.setItem('synapse_userRoleTitle', data.userRoleTitle);
    localStorage.setItem('synapse_teamName', data.teamName);
    localStorage.setItem('synapse_projectName', data.projectName);
    if (data.inviteCode) localStorage.setItem('synapse_inviteCode', data.inviteCode);
    setUserRole(role);
    setScreen(role === 'member' ? 'myproject' : 'dashboard');
    setAppPhase('app');
  };

  const handleSignOut = () => {
    localStorage.removeItem('synapse_loggedIn');
    localStorage.removeItem('synapse_role');
    localStorage.removeItem('synapse_onboarded');
    localStorage.removeItem('synapse_userName');
    localStorage.removeItem('synapse_userRoleTitle');
    localStorage.removeItem('synapse_teamName');
    localStorage.removeItem('synapse_projectName');
    localStorage.removeItem('synapse_inviteCode');
    setUserRole(null); setSelectedRole(null);
    setShowSignOut(false); setShowNotifs(false);
    setAppPhase('login');
  };

  // Pre-app screens
  if (appPhase === 'login') return (
    <><div ref={dotRef} className="cursor-dot" /><div ref={ringRef} className="cursor-ring" />
      <LoginScreen onLogin={handleLogin} /></>
  );
  if (appPhase === 'roleSelect') return (
    <><div ref={dotRef} className="cursor-dot" /><div ref={ringRef} className="cursor-ring" />
      <RoleSelectScreen onSelect={handleRoleSelect} /></>
  );
  if (appPhase === 'onboarding') return (
    <><div ref={dotRef} className="cursor-dot" /><div ref={ringRef} className="cursor-ring" />
      <OnboardingScreen role={selectedRole} onComplete={handleOnboardComplete} /></>
  );

  // Tab config based on role
  const isLeader = userRole === 'leader';
  const tabItems = isLeader
    ? [{ key: 'profile', label: 'Profile' }, { key: 'dashboard', label: 'Dashboard' }, { key: 'analytics', label: 'Analytics' }]
    : [{ key: 'profile', label: 'Profile' }, { key: 'myproject', label: 'My Project' }];

  return (
    <>
      <div ref={dotRef} className="cursor-dot" /><div ref={ringRef} className="cursor-ring" />

      {/* Navbar */}
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div className="nav-brand">
            <div className="nav-dot" /><span className="nav-title">Synapse</span><span className="nav-sub">AI Team OS</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {tabItems.map(t => (
              <button key={t.key} className="nav-btn" onClick={() => navigate(t.key)}
                style={{
                  width: 'auto', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                  background: screen === t.key ? 'rgba(83,74,183,0.1)' : 'transparent',
                  color: screen === t.key ? 'var(--primary)' : 'var(--text-muted)'
                }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <input className="nav-search" placeholder="Search tasks, people..." />
        <div className="nav-right">
          <button className="nav-btn" onClick={() => navigate('achievements')} title="Achievements"
            style={{ color: screen === 'achievements' ? 'var(--primary)' : 'var(--text-muted)' }}><TrophyIcon /></button>
          <button className="nav-btn" onClick={() => setShowSidebar(true)}><MegaIcon /></button>
          <button className={`nav-btn ${bellRing ? 'bell-ringing' : ''}`} onClick={() => setShowNotifs(n => !n)} style={{ position: 'relative' }}>
            <BellIcon /><span className="badge">3</span>
            {showNotifs && (
              <div className="notif-dropdown" onClick={e => e.stopPropagation()}>
                {notifications.map((n, i) => (
                  <div className="notif-item" key={i}><div className="notif-bar" style={{ background: n.color }} /><div><div className="notif-title">{n.title}</div><div className="notif-time">{n.time}</div></div></div>
                ))}
              </div>
            )}
          </button>
          <button className={`nav-btn ${themeSpin ? 'theme-spin' : ''}`} onClick={toggleDark}>{isDark ? <SunIcon /> : <MoonIcon />}</button>
          <div className="avatar" onClick={() => setShowSignOut(s => !s)}
            style={{ cursor: 'none', boxShadow: screen === 'profile' ? '0 0 0 2px var(--primary)' : 'none', transition: 'box-shadow 0.2s ease', position: 'relative' }}>
            VK
            {showSignOut && (
              <div style={{
                position: 'absolute', top: 48, right: 0, background: 'var(--surface)',
                border: '0.5px solid var(--border)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                overflow: 'hidden', zIndex: 200, minWidth: 140
              }} onClick={e => e.stopPropagation()}>
                <button onClick={() => { setShowSignOut(false); navigate('profile'); }} style={{
                  display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none',
                  fontSize: 13, fontFamily: 'inherit', color: 'var(--text)', textAlign: 'left', cursor: 'pointer'
                }}>Go to Profile</button>
                <button onClick={handleSignOut} style={{
                  display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none',
                  borderTop: '0.5px solid var(--border)', fontSize: 13, fontFamily: 'inherit',
                  color: '#E24B4A', textAlign: 'left', cursor: 'pointer'
                }}>Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="main" style={{ paddingTop: 88 }}>
        <div style={{
          opacity: fadeState === 'exit' ? 0 : 1,
          transform: fadeState === 'exit' ? 'translateY(-6px)' : fadeState === 'enter' ? 'translateY(6px)' : 'translateY(0)',
          transition: fadeState === 'exit' ? 'all 0.2s ease-in' : 'all 0.25s ease-out',
        }}>
          {screen === 'profile' && <ProfileScreen onNavigate={navigate} role={userRole} />}
          {screen === 'dashboard' && isLeader && <DashboardScreen isDark={isDark} loaded={loaded} />}
          {screen === 'analytics' && isLeader && <AnalyticsScreen isDark={isDark} addToast={addToast} />}
          {screen === 'myproject' && !isLeader && <MemberProjectView addToast={addToast} />}
          {screen === 'achievements' && <AchievementsScreen />}
        </div>
      </main>

      {/* Sidebar */}
      <div className={`sidebar-overlay ${showSidebar ? 'open' : ''}`} onClick={() => setShowSidebar(false)} />
      <div className={`sidebar ${showSidebar ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div><div className="sidebar-title">Company Forecast</div><div className="sidebar-sub">AI-summarized org updates</div></div>
          <button className="sidebar-close" onClick={() => setShowSidebar(false)}>✕</button>
        </div>
        {announcements.map((a, i) => (
          <div className="announce-card" key={i}>
            <span className="announce-tag" style={{ background: a.tagBg, color: a.tagColor }}>{a.tag}</span>
            <div className="announce-title">{a.title}</div>
            <div className="announce-date">{a.date}</div>
            <div className="ai-impact"><div className="ai-impact-label">AI Impact on Your Team:</div>{a.impact}</div>
          </div>
        ))}
      </div>

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.exit ? 'exit' : ''}`}>
            <div className="toast-bar" style={{ background: t.type === 'loading' ? 'var(--primary)' : t.type === 'success' ? 'var(--success)' : 'var(--danger)' }} />
            {t.type === 'loading' ? <div className="toast-spinner" /> : t.type === 'success' ? '✓' : '✕'}
            {t.msg}
          </div>
        ))}
      </div>
    </>
  );
}
