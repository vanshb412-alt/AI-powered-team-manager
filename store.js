const SK = 'synapse_data';
const COLORS = ['#534AB7', '#1D9E75', '#BA7517', '#E24B4A', '#0F6E56', '#993556'];

export const ACHIEVEMENTS = [
  { id: 'first_blood', name: 'First Blood', desc: 'Completed your very first task on Synapse', cat: 'Milestones', tier: 'bronze', xp: 50 },
  { id: 'team_welcome', name: 'Team Welcome', desc: 'Joined your first project team', cat: 'Milestones', tier: 'bronze', xp: 50 },
  { id: 'on_fire', name: 'On Fire 🔥', desc: 'Maintained a 7-day task completion streak', cat: 'Tasks', tier: 'silver', xp: 100 },
  { id: 'early_bird', name: 'Early Bird', desc: 'Completed 5 tasks before their deadline', cat: 'Tasks', tier: 'silver', xp: 100 },
  { id: 'bug_exterminator', name: 'Bug Exterminator', desc: 'Completed 10 tasks with "bug" or "fix" in the name', cat: 'Tasks', tier: 'gold', xp: 200 },
  { id: 'sprint_slayer', name: 'Sprint Slayer', desc: 'Completed a sprint with 100% velocity', cat: 'Sprint', tier: 'gold', xp: 200 },
  { id: 'team_player', name: 'Team Player', desc: 'Be a member in 3+ different projects', cat: 'Team', tier: 'gold', xp: 200 },
  { id: 'velocity_king', name: 'Velocity King', desc: 'Achieved 90%+ velocity in any sprint', cat: 'Sprint', tier: 'silver', xp: 100 },
  { id: 'century', name: 'Century', desc: 'Complete 100 total tasks', cat: 'Tasks', tier: 'gold', xp: 200 },
  { id: 'zero_blockers', name: 'Zero Blockers', desc: 'Have 0 open blockers for 7 days', cat: 'Sprint', tier: 'silver', xp: 100 },
  { id: 'mentor', name: 'Mentor', desc: 'Resolve 10 blockers raised by others', cat: 'Team', tier: 'silver', xp: 100 },
  { id: 'promoted', name: 'Promoted 🚀', desc: 'Change role from member to leader in any project', cat: 'Milestones', tier: 'gold', xp: 200 },
];

export function getData() { try { const r = localStorage.getItem(SK); return r ? JSON.parse(r) : null; } catch { return null; } }
export function saveData(d) { localStorage.setItem(SK, JSON.stringify(d)); }
export function getCurrentUser() { return getData()?.currentUser || null; }
export function getActiveProject() { const d = getData(); if (!d || !d.currentUser) return null; const id = d.currentUser.activeProjectId; return d.projects?.find(p => p.id === id) || d.projects?.[0] || null; }
export function getUserProjects() { const d = getData(); if (!d) return []; return (d.userProjects || []).map(up => ({ ...up, project: d.projects?.find(p => p.id === up.projectId) })).filter(up => up.project); }
export function getProjectById(id) { return getData()?.projects?.find(p => p.id === id) || null; }
export function getTasksForUser(projectId, userName) { const p = getProjectById(projectId); if (!p) return []; return (p.tasks || []).filter(t => t.assignedTo?.toLowerCase() === userName?.toLowerCase()); }
export function getRoleInProject(projectId) { const d = getData(); return d?.userProjects?.find(up => up.projectId === projectId)?.role || 'member'; }

export function calculateCompletion(projectId) { const p = getProjectById(projectId); if (!p || !p.tasks?.length) return 0; const done = p.tasks.filter(t => t.status === 'Done').length; return Math.round((done / p.tasks.length) * 100); }
export function calculateUserLoad(projectId, memberName) { const p = getProjectById(projectId); if (!p) return 0; const tasks = (p.tasks || []).filter(t => t.assignedTo?.toLowerCase() === memberName?.toLowerCase() && t.status !== 'Done'); const pts = tasks.reduce((s, t) => s + (t.storyPoints || 1), 0); return Math.min(100, Math.round((pts / 20) * 100)); }
export function calculateStreak() { const d = getData(); if (!d?.currentUser) return 0; const last = d.currentUser.lastActiveDate; if (!last) return 0; const today = new Date().toDateString(); const lastD = new Date(last).toDateString(); if (today === lastD) return d.currentUser.streak || 0; const diff = (new Date(today) - new Date(lastD)) / 86400000; if (diff === 1) return (d.currentUser.streak || 0) + 1; return diff === 0 ? d.currentUser.streak || 0 : 0; }
export function calculateLevel(xp) { return Math.max(1, Math.floor((xp || 0) / 300) + 1); }
export function generateInitials(name) { if (!name) return '??'; const p = name.trim().split(/\s+/); return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : (p[0][0] + (p[0][1] || '')).toUpperCase(); }
export function getGreeting() { const h = new Date().getHours(); if (h >= 5 && h < 12) return 'Good morning'; if (h >= 12 && h < 17) return 'Good afternoon'; if (h >= 17 && h < 21) return 'Good evening'; return 'Good night'; }
export function getLevelName(lv) { if (lv >= 11) return 'Synapse Elite'; if (lv >= 9) return 'Team Legend'; if (lv >= 7) return 'Task Master'; if (lv >= 5) return 'Sprint Warrior'; if (lv >= 3) return 'Rising Star'; return 'Newcomer'; }
export function getTimeAgo(ds) { if (!ds) return ''; const diff = (Date.now() - new Date(ds).getTime()) / 1000; if (diff < 3600) return 'Just now'; if (diff < 86400) return Math.floor(diff / 3600) + 'h ago'; if (diff < 172800) return 'Yesterday'; return Math.floor(diff / 86400) + ' days ago'; }

export function addTaskToProject(projectId, taskData) { const d = getData(); if (!d) return; const p = d.projects?.find(x => x.id === projectId); if (!p) return; if (!p.tasks) p.tasks = []; p.tasks.push({ id: 'task_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5), createdAt: new Date().toISOString(), completedAt: null, status: 'Pending', storyPoints: 1, ...taskData }); saveData(d); }
export function updateTask(projectId, taskId, updates) { const d = getData(); if (!d) return; const p = d.projects?.find(x => x.id === projectId); if (!p) return; const t = p.tasks?.find(x => x.id === taskId); if (!t) return; Object.assign(t, updates); saveData(d); }
export function deleteTask(projectId, taskId) { const d = getData(); if (!d) return; const p = d.projects?.find(x => x.id === projectId); if (!p) return; p.tasks = (p.tasks || []).filter(t => t.id !== taskId); saveData(d); }

export function completeTask(projectId, taskId) {
  const d = getData(); if (!d) return { xp: 0, newAchievements: [] };
  const p = d.projects?.find(x => x.id === projectId); if (!p) return { xp: 0, newAchievements: [] };
  const t = p.tasks?.find(x => x.id === taskId); if (!t) return { xp: 0, newAchievements: [] };
  t.status = 'Done'; t.completedAt = new Date().toISOString();
  if (!d.completedTasks) d.completedTasks = [];
  d.completedTasks.push({ taskId, projectId, completedAt: t.completedAt, xpEarned: 50 });
  d.currentUser.xp = (d.currentUser.xp || 0) + 50;
  d.currentUser.level = calculateLevel(d.currentUser.xp);
  const today = new Date().toDateString();
  const last = d.currentUser.lastActiveDate ? new Date(d.currentUser.lastActiveDate).toDateString() : null;
  if (last !== today) { d.currentUser.streak = last && ((new Date(today) - new Date(last)) / 86400000 === 1) ? (d.currentUser.streak || 0) + 1 : 1; }
  d.currentUser.lastActiveDate = new Date().toISOString();
  saveData(d);
  const na = checkAchievements();
  return { xp: 50, newAchievements: na };
}

export function createProject(name, sprintName, user) {
  const d = getData(); if (!d) return null;
  const id = 'proj_' + Date.now();
  const code = (String.fromCharCode(65 + Math.random() * 26 | 0) + String.fromCharCode(65 + Math.random() * 26 | 0) + String.fromCharCode(65 + Math.random() * 26 | 0)) + '-' + (100 + Math.random() * 900 | 0);
  const proj = { id, name, sprintName: sprintName || 'Sprint 1', createdBy: user.id, inviteCode: code, members: [{ userId: user.id, name: user.name, role: user.roleTitle || 'Leader', initials: generateInitials(user.name), joinedAs: 'leader', avatarColor: COLORS[0] }], tasks: [], blockers: [], createdAt: new Date().toISOString() };
  if (!d.projects) d.projects = []; d.projects.push(proj);
  if (!d.userProjects) d.userProjects = []; d.userProjects.push({ projectId: id, role: 'leader', joinedAt: new Date().toISOString() });
  d.currentUser.activeProjectId = id; saveData(d); return proj;
}

export function joinProject(inviteCode, user) {
  const d = getData(); if (!d) return { success: false, error: 'No data' };
  const proj = d.projects?.find(p => p.inviteCode?.toUpperCase() === inviteCode?.toUpperCase());
  if (!proj) return { success: false, error: 'Invalid invite code. Check with your team leader.' };
  if (proj.members?.some(m => m.userId === user.id)) return { success: false, error: 'You are already in this project.' };
  if (!proj.members) proj.members = [];
  proj.members.push({ userId: user.id, name: user.name, role: user.roleTitle || 'Member', initials: generateInitials(user.name), joinedAs: 'member', avatarColor: COLORS[(proj.members.length) % COLORS.length] });
  if (!d.userProjects) d.userProjects = []; d.userProjects.push({ projectId: proj.id, role: 'member', joinedAt: new Date().toISOString() });
  d.currentUser.activeProjectId = proj.id; saveData(d); checkAchievements(); return { success: true, project: proj };
}

export function addMemberToProject(projectId, name, role) {
  const d = getData(); if (!d) return null;
  const p = d.projects?.find(x => x.id === projectId); if (!p) return null;
  if (!p.members) p.members = [];
  const uid = 'user_' + Date.now(); const initials = generateInitials(name);
  const code = initials + '-' + (100 + Math.random() * 900 | 0);
  const member = { userId: uid, name, role, initials, joinedAs: 'member', avatarColor: COLORS[p.members.length % COLORS.length], inviteCode: code };
  p.members.push(member); saveData(d); return member;
}

export function raiseBlocker(projectId, data) { const d = getData(); if (!d) return; const p = d.projects?.find(x => x.id === projectId); if (!p) return; if (!p.blockers) p.blockers = []; p.blockers.push({ id: 'blocker_' + Date.now(), status: 'Open', raisedAt: new Date().toISOString(), ...data }); saveData(d); }

export function checkAchievements() {
  const d = getData(); if (!d?.currentUser) return [];
  const u = d.currentUser, ct = d.completedTasks || [], up = d.userProjects || [];
  if (!u.unlockedAchievements) u.unlockedAchievements = [];
  const has = id => u.unlockedAchievements.includes(id);
  const unlock = [];
  if (!has('first_blood') && ct.length >= 1) unlock.push('first_blood');
  if (!has('team_welcome') && up.length >= 1) unlock.push('team_welcome');
  if (!has('on_fire') && (u.streak || 0) >= 7) unlock.push('on_fire');
  if (!has('early_bird')) { const early = ct.filter(c => { const p = d.projects?.find(x => x.id === c.projectId); const t = p?.tasks?.find(x => x.id === c.taskId); return t && t.dueDate && new Date(t.completedAt) <= new Date(t.dueDate); }); if (early.length >= 5) unlock.push('early_bird'); }
  if (!has('bug_exterminator')) { const bugs = ct.filter(c => { const p = d.projects?.find(x => x.id === c.projectId); const t = p?.tasks?.find(x => x.id === c.taskId); return t && /bug|fix/i.test(t.name); }); if (bugs.length >= 10) unlock.push('bug_exterminator'); }
  if (!has('team_player') && up.length >= 3) unlock.push('team_player');
  if (!has('velocity_king')) { const any90 = d.projects?.some(p => { if (!p.tasks?.length) return false; const done = p.tasks.filter(t => t.status === 'Done').length; return (done / p.tasks.length) * 100 >= 90; }); if (any90) unlock.push('velocity_king'); }
  if (!has('sprint_slayer')) { const any100 = d.projects?.some(p => p.tasks?.length > 0 && p.tasks.every(t => t.status === 'Done')); if (any100) unlock.push('sprint_slayer'); }
  if (!has('century') && ct.length >= 100) unlock.push('century');
  if (!has('zero_blockers')) { const noBlockers = d.projects?.every(p => !(p.blockers || []).some(b => b.status === 'Open')); if (noBlockers && d.projects?.length > 0) unlock.push('zero_blockers'); }
  if (!has('mentor')) { const resolved = (d.projects || []).reduce((s, p) => { return s + (p.blockers || []).filter(b => b.status === 'Resolved').length; }, 0); if (resolved >= 10) unlock.push('mentor'); }
  if (!has('promoted') && up.some(x => x.role === 'leader') && up.some(x => x.role === 'member')) unlock.push('promoted');
  if (unlock.length) { unlock.forEach(id => { u.unlockedAchievements.push(id); const a = ACHIEVEMENTS.find(x => x.id === id); if (a) u.xp = (u.xp || 0) + a.xp; }); u.level = calculateLevel(u.xp); saveData(d); }
  return unlock.map(id => ACHIEVEMENTS.find(a => a.id === id)).filter(Boolean);
}

export function getAchievementProgress(id) {
  const d = getData(); if (!d) return { pct: 0, text: '' };
  const ct = d.completedTasks || [], u = d.currentUser || {}, up = d.userProjects || [];
  switch (id) {
    case 'first_blood': return { pct: ct.length > 0 ? 100 : 0, text: ct.length > 0 ? 'Done' : 'Complete 1 task' };
    case 'team_welcome': return { pct: up.length > 0 ? 100 : 0, text: up.length > 0 ? 'Done' : 'Join a project' };
    case 'on_fire': return { pct: Math.min(100, ((u.streak || 0) / 7) * 100), text: `${u.streak || 0}/7 days` };
    case 'early_bird': { const n = ct.filter(c => { const p = d.projects?.find(x => x.id === c.projectId); const t = p?.tasks?.find(x => x.id === c.taskId); return t?.dueDate && new Date(t.completedAt) <= new Date(t.dueDate); }).length; return { pct: Math.min(100, (n / 5) * 100), text: `${n}/5 early` }; }
    case 'bug_exterminator': { const n = ct.filter(c => { const p = d.projects?.find(x => x.id === c.projectId); const t = p?.tasks?.find(x => x.id === c.taskId); return t && /bug|fix/i.test(t.name); }).length; return { pct: Math.min(100, (n / 10) * 100), text: `${n}/10 bugs` }; }
    case 'team_player': return { pct: Math.min(100, (up.length / 3) * 100), text: `${up.length}/3 projects` };
    case 'century': return { pct: Math.min(100, (ct.length / 100) * 100), text: `${ct.length}/100 tasks` };
    case 'mentor': { const n = (d.projects || []).reduce((s, p) => s + (p.blockers || []).filter(b => b.status === 'Resolved').length, 0); return { pct: Math.min(100, (n / 10) * 100), text: `${n}/10 resolved` }; }
    default: return { pct: 0, text: 'Keep going!' };
  }
}

export function parseCSV(text) {
  const lines = text.trim().split('\n'); if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  return lines.slice(1).map(line => {
    const vals = []; let cur = '', inQ = false;
    for (const ch of line) { if (ch === '"') { inQ = !inQ; } else if (ch === ',' && !inQ) { vals.push(cur.trim()); cur = ''; } else { cur += ch; } }
    vals.push(cur.trim());
    const obj = {}; headers.forEach((h, i) => { obj[h] = vals[i] || ''; }); return obj;
  }).filter(r => Object.values(r).some(v => v));
}

export function initDemoData(email) {
  const today = new Date(); const iso = d => d.toISOString(); const ago = (days) => { const x = new Date(today); x.setDate(x.getDate() - days); return iso(x); }; const future = (days) => { const x = new Date(today); x.setDate(x.getDate() + days); return x.toISOString().slice(0, 10); };
  const tasks1 = [
    { id: 't1', name: 'Fix auth middleware bug', description: 'Authentication tokens expiring prematurely causing logouts.', assignedTo: 'Raj M.', dueDate: future(0), priority: 'Urgent', status: 'In Progress', storyPoints: 5, createdAt: ago(10), completedAt: null },
    { id: 't2', name: 'Finalize onboarding flow', description: 'Complete remaining 3 onboarding screens with animations.', assignedTo: 'Priya S.', dueDate: future(1), priority: 'High', status: 'In Review', storyPoints: 5, createdAt: ago(8), completedAt: null },
    { id: 't3', name: 'Design system audit', description: 'Audit button states, form inputs against brand guidelines.', assignedTo: 'Anika R.', dueDate: future(-2), priority: 'Medium', status: 'Done', storyPoints: 3, createdAt: ago(14), completedAt: ago(3) },
    { id: 't4', name: 'API rate limit testing', description: 'Stress test rate limiting under concurrent connections.', assignedTo: 'Dev K.', dueDate: future(2), priority: 'High', status: 'In Progress', storyPoints: 5, createdAt: ago(7), completedAt: null },
    { id: 't5', name: 'Homepage redesign mockup', description: 'Create high-fidelity mockups for the new homepage.', assignedTo: 'Anika R.', dueDate: future(3), priority: 'High', status: 'In Progress', storyPoints: 8, createdAt: ago(5), completedAt: null },
    { id: 't6', name: 'Set up API rate limiting', description: 'Implement sliding window rate limiter for all endpoints.', assignedTo: 'Raj M.', dueDate: future(-1), priority: 'Medium', status: 'Done', storyPoints: 5, createdAt: ago(12), completedAt: ago(2) },
    { id: 't7', name: 'Write regression tests', description: 'Cover edge cases for auth, payments, and user flows.', assignedTo: 'Dev K.', dueDate: future(4), priority: 'Medium', status: 'Pending', storyPoints: 5, createdAt: ago(4), completedAt: null },
    { id: 't8', name: 'Database schema migration', description: 'Migrate user table to support multi-tenant architecture.', assignedTo: 'Raj M.', dueDate: future(-3), priority: 'High', status: 'Done', storyPoints: 8, createdAt: ago(15), completedAt: ago(4) },
    { id: 't9', name: 'Icon set finalization', description: 'Finalize and export all 120 icons for the design system.', assignedTo: 'Anika R.', dueDate: future(5), priority: 'Low', status: 'Pending', storyPoints: 3, createdAt: ago(3), completedAt: null },
    { id: 't10', name: 'Performance optimization', description: 'Optimize bundle size and implement code splitting.', assignedTo: 'Priya S.', dueDate: future(2), priority: 'High', status: 'In Progress', storyPoints: 8, createdAt: ago(6), completedAt: null },
    { id: 't11', name: 'User feedback integration', description: 'Add in-app feedback widget with sentiment analysis.', assignedTo: 'Dev K.', dueDate: future(6), priority: 'Medium', status: 'Pending', storyPoints: 3, createdAt: ago(2), completedAt: null },
    { id: 't12', name: 'Fix login page CSS bug', description: 'Login button misaligned on mobile viewports.', assignedTo: 'Priya S.', dueDate: future(-1), priority: 'Medium', status: 'Done', storyPoints: 2, createdAt: ago(9), completedAt: ago(1) },
    { id: 't13', name: 'Implement push notifications', description: 'Set up Firebase Cloud Messaging for iOS and Android push notifications. Handle foreground and background states.', assignedTo: 'Vansh Bansal', dueDate: future(2), priority: 'Urgent', status: 'Done', storyPoints: 8, createdAt: ago(12), completedAt: ago(5) },
    { id: 't14', name: 'Fix responsive layout on tablet', description: 'Several components break on iPad viewport. Fix navigation drawer, card grid, and modal sizing for tablet screens.', assignedTo: 'Vansh Bansal', dueDate: future(3), priority: 'High', status: 'Done', storyPoints: 5, createdAt: ago(10), completedAt: ago(6) },
    { id: 't15', name: 'Write unit tests for auth module', description: 'Cover login, logout, token refresh, and session expiry edge cases. Minimum 80% coverage required.', assignedTo: 'Vansh Bansal', dueDate: future(4), priority: 'High', status: 'Done', storyPoints: 5, createdAt: ago(11), completedAt: ago(2) },
    { id: 't16', name: 'Optimize image loading performance', description: 'Implement lazy loading and WebP conversion for all product images. Target LCP under 2.5 seconds.', assignedTo: 'Vansh Bansal', dueDate: future(5), priority: 'Medium', status: 'Done', storyPoints: 3, createdAt: ago(8), completedAt: ago(1) },
    { id: 't17', name: 'Update onboarding copy', description: 'Revise the 4 onboarding screens with new marketing copy approved by the brand team. Update illustrations too.', assignedTo: 'Vansh Bansal', dueDate: future(7), priority: 'Medium', status: 'Done', storyPoints: 2, createdAt: ago(9), completedAt: ago(3) },
    { id: 't18', name: 'Set up error monitoring with Sentry', description: 'Integrate Sentry SDK, configure source maps, set up alert rules for critical errors in production.', assignedTo: 'Vansh Bansal', dueDate: future(3), priority: 'High', status: 'In Progress', storyPoints: 3, createdAt: ago(1), completedAt: null },
    { id: 't19', name: 'Fix crash on profile page', description: 'App crashes when navigating to profile with empty avatar field.', assignedTo: 'Priya S.', dueDate: future(-4), priority: 'Urgent', status: 'Done', storyPoints: 2, createdAt: ago(13), completedAt: ago(5) },
    { id: 't19b', name: 'Resolve CORS bug on API gateway', description: 'Preflight requests failing for certain origins. Update CORS headers in API gateway config.', assignedTo: 'Raj M.', dueDate: future(-5), priority: 'High', status: 'Done', storyPoints: 3, createdAt: ago(16), completedAt: ago(6) },
  ];
  const tasks2 = [
    { id: 't20', name: 'Refactor token validation', description: 'Centralize JWT validation logic into middleware.', assignedTo: 'Vansh Bansal', dueDate: future(4), priority: 'High', status: 'Pending', storyPoints: 5, createdAt: ago(3), completedAt: null },
    { id: 't21', name: 'Add OAuth2 support', description: 'Integrate Google and GitHub OAuth2 providers.', assignedTo: 'Vansh Bansal', dueDate: future(6), priority: 'Medium', status: 'Pending', storyPoints: 8, createdAt: ago(2), completedAt: null },
    { id: 't22', name: 'Fix session timeout bug', description: 'Sessions expiring despite active usage.', assignedTo: 'Vansh Bansal', dueDate: future(1), priority: 'Urgent', status: 'In Progress', storyPoints: 3, createdAt: ago(4), completedAt: null },
    { id: 't23', name: 'Rate limiter middleware', description: 'Add rate limiting to auth endpoints.', assignedTo: 'Raj M.', dueDate: future(3), priority: 'Medium', status: 'In Progress', storyPoints: 5, createdAt: ago(5), completedAt: null },
    { id: 't24', name: 'Auth logging dashboard', description: 'Create admin view for auth event logs.', assignedTo: 'Raj M.', dueDate: future(7), priority: 'Low', status: 'Pending', storyPoints: 3, createdAt: ago(1), completedAt: null },
  ];
  // Build completedTasks from all Done tasks (so analytics joins work correctly)
  const doneTasks1 = tasks1.filter(t => t.status === 'Done');
  const completedTasks = doneTasks1.map(t => ({ taskId: t.id, projectId: 'proj_001', completedAt: t.completedAt, xpEarned: 50 }));
  // Historical completed tasks (older sprints) — use descriptive IDs that won't clash
  const histNames = [
    'Fix nav bar bug','Resolve payment timeout bug','Migrate legacy API endpoints','Fix profile image upload bug',
    'Refactor user service','Design sprint review slides','Fix broken unit tests','Set up staging environment',
    'Implement dark mode toggle','Fix dashboard crash bug','Write API documentation','Resolve CORS bug',
    'Optimize SQL queries','Fix email notification bug','Set up CI/CD pipeline','Conduct code review',
    'Fix memory leak in worker','Implement search feature','Update dependencies','Fix scroll bug on iOS',
    'Add export to CSV','Resolve websocket bug','Set up load balancer','Fix date parsing bug',
    'Implement analytics events','Write E2E tests','Fix broken build bug','Redesign settings page',
    'Resolve auth race condition bug','Add rate limiting','Fix font rendering bug','Profile memory usage',
    'Fix checkout flow bug','Implement lazy loading','Migrate to TypeScript',
  ];
  histNames.forEach((name, i) => {
    const daysAgo = 7 + Math.floor(i * 1.5);
    completedTasks.push({ taskId: 'hist_' + i, projectId: i < 28 ? 'proj_001' : 'proj_002', taskName: name, completedAt: ago(daysAgo), xpEarned: 50 });
  });

  const data = {
    currentUser: {
      id: 'user_001', name: 'Vansh Bansal', email: email || 'vansh@leadsquad.ai',
      avatar: 'VB', activeProjectId: 'proj_001',
      lastLogin: iso(today), streak: 12, lastActiveDate: iso(today),
      xp: 1850, level: 7, roleTitle: 'Frontend Developer',
      unlockedAchievements: ['first_blood', 'team_welcome', 'on_fire', 'early_bird', 'bug_exterminator', 'sprint_slayer', 'team_player', 'velocity_king']
    },
    projects: [
      {
        id: 'proj_001', name: 'Mobile App Redesign', sprintName: 'Sprint 14', createdBy: 'user_001', inviteCode: 'MOB-001',
        members: [
          { userId: 'user_001', name: 'Vansh Bansal', role: 'Frontend Developer', initials: 'VB', joinedAs: 'leader', avatarColor: '#534AB7' },
          { userId: 'user_002', name: 'Priya S.', role: 'Frontend', initials: 'PS', joinedAs: 'member', avatarColor: '#E24B4A' },
          { userId: 'user_003', name: 'Raj M.', role: 'Backend', initials: 'RM', joinedAs: 'member', avatarColor: '#534AB7' },
          { userId: 'user_004', name: 'Anika R.', role: 'Design', initials: 'AR', joinedAs: 'member', avatarColor: '#BA7517' },
          { userId: 'user_005', name: 'Dev K.', role: 'QA', initials: 'DK', joinedAs: 'member', avatarColor: '#1D9E75' },
        ], tasks: tasks1,
        blockers: [
          { id: 'b1', raisedBy: 'Priya S.', taskId: 't2', description: 'API endpoint not ready for onboarding flow', status: 'Open', raisedAt: ago(2) },
          { id: 'b2', raisedBy: 'Dev K.', taskId: 't4', description: 'Missing test credentials for staging environment', status: 'Open', raisedAt: ago(1) },
        ], createdAt: ago(30)
      },
      {
        id: 'proj_002', name: 'Auth Module Refactor', sprintName: 'Sprint 2', createdBy: 'user_003', inviteCode: 'AUTH-02',
        members: [
          { userId: 'user_003', name: 'Raj M.', role: 'Tech Lead', initials: 'RM', joinedAs: 'leader', avatarColor: '#534AB7' },
          { userId: 'user_001', name: 'Vansh Bansal', role: 'Frontend Developer', initials: 'VB', joinedAs: 'member', avatarColor: '#1D9E75' },
        ], tasks: tasks2, blockers: [], createdAt: ago(14)
      },
    ],
    userProjects: [
      { projectId: 'proj_001', role: 'leader', joinedAt: ago(30) },
      { projectId: 'proj_002', role: 'member', joinedAt: ago(14) },
    ],
    completedTasks
  };
  saveData(data); return data;
}

export function initNewUser(name, email, roleTitle) {
  const data = { currentUser: { id: 'user_' + Date.now(), name, email: email || '', avatar: generateInitials(name), lastLogin: new Date().toISOString(), streak: 0, lastActiveDate: new Date().toISOString(), xp: 0, level: 1, roleTitle: roleTitle || '', unlockedAchievements: [] }, projects: [], userProjects: [], completedTasks: [] };
  saveData(data); return data;
}

export function clearSession() {
  const d = getData();
  if (d) { d.currentUser.activeProjectId = null; saveData(d); }
  localStorage.removeItem('synapse_loggedIn');
}

export function setActiveProject(projectId) {
  const d = getData(); if (!d) return; d.currentUser.activeProjectId = projectId; saveData(d);
}

export function getAnnouncements() {
  const proj = getActiveProject();
  const tasks = proj?.tasks || [];
  const members = proj?.members || [];
  const overloaded = members.find(m => {
    const mt = tasks.filter(t => t.assignedTo?.toLowerCase() === m.name?.toLowerCase() && t.status !== 'Done');
    const pts = mt.reduce((s,t) => s + (t.storyPoints||3), 0);
    return pts > 15;
  });
  const openBlockers = (proj?.blockers||[]).filter(b => b.status === 'Open').length;
  const pendingCount = tasks.filter(t => t.status === 'Pending').length;
  const doneCount = tasks.filter(t => t.status === 'Done').length;
  const velocity = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  return [
    {
      tag: 'Hiring', tagBg: 'rgba(186,117,23,0.15)', tagColor: '#BA7517',
      title: 'Q3 hiring freeze announced across all departments',
      date: 'May 8, 2026',
      impact: overloaded
        ? `${overloaded.name} is carrying a heavy load — the hiring freeze may delay relief. Consider redistributing tasks now.`
        : 'No immediate impact on your current team capacity. Monitor workload as sprint progresses.'
    },
    {
      tag: 'Product', tagBg: 'rgba(29,158,117,0.15)', tagColor: '#1D9E75',
      title: 'New design guidelines released by brand team',
      date: 'May 6, 2026',
      impact: proj
        ? `${proj.name} may need a UI review pass. ${pendingCount} pending tasks could be affected by the new guidelines.`
        : 'Review your active projects for any UI components that need updating.'
    },
    {
      tag: 'Policy', tagBg: 'rgba(83,74,183,0.15)', tagColor: '#534AB7',
      title: 'Remote work policy updated — core hours now 11am–4pm',
      date: 'May 3, 2026',
      impact: openBlockers > 0
        ? `You have ${openBlockers} open blocker${openBlockers > 1 ? 's' : ''} — ensure standup meetings fall within new core hours to resolve them faster.`
        : `Sprint velocity at ${velocity}%. Core hour alignment should help team sync and maintain momentum.`
    }
  ];
}
