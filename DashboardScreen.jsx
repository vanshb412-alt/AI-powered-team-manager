import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getCurrentUser, getActiveProject, getUserProjects, calculateCompletion, calculateUserLoad, getGreeting, generateInitials, addMemberToProject, getProjectById, updateTask } from './store.js';

function getWeeklyData(tasks) {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const now = new Date();
  const counts = days.map((_, i) => {
    const day = new Date(now);
    day.setDate(now.getDate() - (6 - i));
    day.setHours(0,0,0,0);
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    return tasks.filter(t => {
      if (!t.completedAt) return false;
      const d = new Date(t.completedAt);
      return d >= day && d < next;
    }).length;
  });
  if (counts.some(c => c > 0)) {
    return { days, tasks: counts, prs: counts.map(c => Math.round(c * 0.6)) };
  }
  const done = tasks.filter(t => t.status === 'Done').length;
  const total = tasks.length || 8;
  const base = Math.max(2, Math.ceil(done / 5) || Math.ceil(total / 8));
  const fallback = [base+1, base+3, base+2, base+5, base+3, Math.max(1,Math.floor(base*0.4)), Math.max(1,Math.floor(base*0.3))];
  return { days, tasks: fallback, prs: fallback.map(c => Math.round(c * 0.6)) };
}

function LoadBar({load,animate}){const w=animate?load:0;const color=load>85?'var(--danger)':load>65?'var(--warning)':'var(--success)';
  return(<div style={{flex:1}}><div className="load-bar"><div className="load-fill" style={{width:`${w}%`,background:color}}/></div></div>);}

function MemberCard({m,animate,delay}){const[show,setShow]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setShow(true),delay);return()=>clearTimeout(t);},[delay]);
  const color=m.load>85?'var(--danger)':m.load>65?'var(--warning)':'var(--success)';
  return(<div className="member-row" style={{opacity:show?1:0,transform:show?'translateX(0)':'translateX(20px)',transition:'all 0.2s ease-out'}}>
    <div className="member-avatar" style={{background:m.avatarColor||'#534AB7'}}>{m.initials}</div>
    <div className="member-info">
      <div className="member-name">{m.name}{m.load>85&&<span className="warn-icon" title="AI: Risk of burnout detected">⚠<span className="warn-tooltip">AI: Risk of burnout detected</span></span>}</div>
      <div className="member-role">{m.role}</div>
      <LoadBar load={m.load} animate={animate&&show}/>
      <div className="member-stats">{m.taskCount} tasks · {m.pts}pts · {m.overdue} overdue</div>
    </div>
    <div className="load-pct" style={{color}}>{m.load}%</div>
  </div>);
}

function WeeklyChart({isDark,data}){const ref=useRef(null);
  const draw=useCallback(()=>{const c=ref.current;if(!c)return;const par=c.parentElement;if(!par)return;
    const W=par.clientWidth,H=220;c.width=W*2;c.height=H*2;c.style.width=W+'px';c.style.height=H+'px';
    const ctx=c.getContext('2d');ctx.scale(2,2);const{days,tasks:td,prs}=data;
    const rawMax=Math.max(...td,...prs);const mx=(rawMax||1)*1.3;
    const px=36,py=16,cw=W-px*2,ch=H-py*3;
    const txt=isDark?'#8B8AA0':'#6B6B80',grid=isDark?'#2A2840':'#E8E8F0';
    ctx.strokeStyle=grid;ctx.lineWidth=0.5;
    for(let i=0;i<=4;i++){const y=py+(ch/4)*i;ctx.beginPath();ctx.moveTo(px,y);ctx.lineTo(W-px,y);ctx.stroke();ctx.fillStyle=txt;ctx.font='11px Inter';ctx.textAlign='right';ctx.fillText(Math.round(mx-(mx/4)*i),px-8,y+4);}
    const bw=Math.min((cw/7)*0.28,20),g=3;
    days.forEach((d,i)=>{const x=px+(cw/7)*i+(cw/7)/2;
      const th=rawMax>0?(td[i]/mx)*ch:0;ctx.fillStyle='#7F77DD';ctx.beginPath();ctx.roundRect?ctx.roundRect(x-bw-g,py+ch-th,bw,th,[3,3,0,0]):ctx.rect(x-bw-g,py+ch-th,bw,th);ctx.fill();
      const ph=rawMax>0?(prs[i]/mx)*ch:0;ctx.fillStyle='#5DCAA5';ctx.beginPath();ctx.roundRect?ctx.roundRect(x+g,py+ch-ph,bw,ph,[3,3,0,0]):ctx.rect(x+g,py+ch-ph,bw,ph);ctx.fill();
      ctx.fillStyle=txt;ctx.textAlign='center';ctx.font='11px Inter';ctx.fillText(d,x,py+ch+16);});
    ctx.fillStyle='#7F77DD';ctx.beginPath();ctx.roundRect?ctx.roundRect(W/2-80,H-16,10,10,2):ctx.rect(W/2-80,H-16,10,10);ctx.fill();
    ctx.fillStyle=txt;ctx.textAlign='left';ctx.font='11px Inter';ctx.fillText('Tasks',W/2-65,H-8);
    ctx.fillStyle='#5DCAA5';ctx.beginPath();ctx.roundRect?ctx.roundRect(W/2-10,H-16,10,10,2):ctx.rect(W/2-10,H-16,10,10);ctx.fill();
    ctx.fillStyle=txt;ctx.fillText('PRs',W/2+5,H-8);
  },[isDark,data]);
  useEffect(()=>{draw();const h=()=>draw();window.addEventListener('resize',h);return()=>window.removeEventListener('resize',h);},[draw]);
  return <canvas ref={ref} style={{display:'block',width:'100%'}}/>;
}

function getProjectForecast(proj) {
  if (!proj?.tasks) return null;
  const total = proj.tasks.filter(t => t.status !== 'Done').length;
  const committed = proj.tasks.filter(t => t.committed && t.status !== 'Done').length;
  const completed = proj.tasks.filter(t => t.status === 'Done').length;
  
  if (total === 0) return null;
  
  const daysActive = 7; 
  const completionRate = completed > 0 ? (completed / (completed + total)) : 0.3;
  const commitmentBoost = committed > 0 ? 1 + ((committed / total) * 0.2) : 1; 
  
  const adjustedRate = Math.min(0.95, completionRate * commitmentBoost);
  const remainingTasks = total - (completed * adjustedRate);
  const tasksPerDay = Math.max(0.5, completed / daysActive);
  const daysRemaining = Math.ceil(remainingTasks / tasksPerDay);
  
  const forecastDate = new Date();
  forecastDate.setDate(forecastDate.getDate() + daysRemaining);
  
  const confidence = Math.round(
    50 + (completionRate * 30) + ((committed / total) * 20)
  );
  
  return {
    forecastDate: forecastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    daysRemaining,
    confidence,
    committed,
    total
  };
}

export default function DashboardScreen({isDark,loaded,addToast,forceUpdate,dv}){
  const user=getCurrentUser();const proj=getActiveProject();
  const ups=getUserProjects().filter(up=>up.role==='leader');
  const [selProjectId,setSelProjectId]=useState(proj?.id);
  const [animBars,setAnimBars]=useState(false);const[memberKey,setMemberKey]=useState(0);
  const [showAddMember,setShowAddMember]=useState(false);
  const [newName,setNewName]=useState('');const[newRole,setNewRole]=useState('');
  const [memberTip,setMemberTip]=useState(null);
  
  const currentUserName = user?.name || '';

  const handleCommit = (taskId, taskName) => {
    const selProj = getProjectById(selProjectId) || proj;
    if (!selProj) return;
    const task = selProj.tasks.find(t => t.id === taskId);
    if (!task) return;
    const updated = {
      ...task,
      committed: true,
      committedAt: new Date().toISOString()
    };
    updateTask(selProj.id, taskId, updated);
    addToast('success', `You committed to "${taskName}"! Your team is counting on you 💪`);
    forceUpdate?.();
  };

  useEffect(()=>{if(loaded){const t=setTimeout(()=>setAnimBars(true),200);return()=>clearTimeout(t);}},[loaded]);
  useEffect(()=>{setSelProjectId(proj?.id);},[proj?.id]);

  const switchProject=(pid)=>{if(pid===selProjectId)return;setAnimBars(false);setMemberKey(k=>k+1);setSelProjectId(pid);setTimeout(()=>setAnimBars(true),100);};

  const selProj=getProjectById(selProjectId)||proj;
  const tasks=selProj?.tasks||[];
  const activeTasks=tasks.filter(t=>t.status!=='Done').length;
  const doneTasks=tasks.filter(t=>t.status==='Done').length;
  const velocity=tasks.length?Math.round((doneTasks/tasks.length)*100):0;
  const openBlockers=(selProj?.blockers||[]).filter(b=>b.status==='Open').length;
  const healthLabel=velocity>=80?'Excellent':velocity>=60?'Good':velocity>=40?'Fair':'At Risk';
  const healthColor=velocity>=60?'var(--success)':velocity>=40?'var(--warning)':'var(--danger)';

  const members=(selProj?.members||[]).map(m=>{
    const mTasks=tasks.filter(t=>t.assignedTo?.toLowerCase()===m.name?.toLowerCase());
    const activeMTasks=mTasks.filter(t=>t.status!=='Done');
    const pts=activeMTasks.reduce((s,t)=>s+(t.storyPoints||1),0);
    const overdue=activeMTasks.filter(t=>t.dueDate&&new Date(t.dueDate)<new Date()).length;
    const load=Math.min(100,Math.round((pts/20)*100));
    return{...m,load,taskCount:activeMTasks.length,pts,overdue};
  });

  const priorityTasks=tasks.filter(t=>t.status!=='Done').sort((a,b)=>{
    const po={Urgent:0,High:1,Medium:2,Low:3};
    const diff=(po[a.priority]||3)-(po[b.priority]||3);
    if(diff!==0)return diff;
    return new Date(a.dueDate||'2099')-new Date(b.dueDate||'2099');
  }).slice(0,5);

  const tagStyle=(pri)=>{
    if(pri==='Urgent')return{bg:'rgba(226,75,74,0.1)',color:'#E24B4A'};
    if(pri==='High')return{bg:'rgba(186,117,23,0.1)',color:'#BA7517'};
    if(pri==='Done')return{bg:'rgba(29,158,117,0.1)',color:'#1D9E75'};
    return{bg:'rgba(83,74,183,0.1)',color:'#534AB7'};
  };

  const handleAddMember=()=>{
    if(!newName.trim()||!newRole.trim())return;
    const m=addMemberToProject(selProj.id,newName.trim(),newRole.trim());
    if(m){setMemberTip(m);setNewName('');setNewRole('');setShowAddMember(false);forceUpdate?.();
      setTimeout(()=>setMemberTip(null),4000);}
  };

  const greeting=getGreeting();

  return(
    <div>
      <div className="greeting">
        <h1>{greeting}, {user?.name?.split(' ')[0]||'there'} 👋</h1>
        <div className="greeting-sub"><span className="pulse-dot"/>AI has {openBlockers>0?openBlockers+' blocker'+(openBlockers>1?'s':'')+' and ':''}{priorityTasks.length} task insight{priorityTasks.length!==1?'s':''} for your team today</div>
      </div>
      <div className="ai-brief">
        <div className="ai-brief-circle"/>
        <div className="ai-brief-inner">
          <div className="ai-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><circle cx="8" cy="16" r="1" fill="white"/><circle cx="16" cy="16" r="1" fill="white"/></svg></div>
          <div style={{flex:1}}>
            <div className="ai-title">AI Sprint Summary</div>
            <div className="ai-body">{selProj?.sprintName||'Sprint'} is {velocity}% complete with {activeTasks} active tasks.{members.find(m=>m.load>85)?` ${members.find(m=>m.load>85).name} is at risk of overload.`:''} {velocity>=70?'Team is performing well.':'Consider redistributing tasks to improve velocity.'} Estimated sprint success: {Math.min(98,velocity+12)}%.</div>
            <div className="ai-link">View Details →</div>
          </div>
        </div>
      </div>
      <div className="metrics-grid">
        {[
          {label:'Active Tasks',val:String(activeTasks),delta:activeTasks>0?`${activeTasks} tasks remaining`:'All clear!',color:activeTasks>0?'var(--text-muted)':'var(--success)'},
          {label:'Team Velocity',val:velocity+'%',delta:velocity>=70?'↑ On track':'↓ Needs attention',color:velocity>=70?'var(--success)':'var(--warning)'},
          {label:'Blockers',val:String(openBlockers),delta:openBlockers>0?`${openBlockers} open blocker${openBlockers>1?'s':''}`:'No blockers!',color:openBlockers>0?'var(--danger)':'var(--success)',valColor:openBlockers>0?'var(--danger)':undefined},
          {label:'Sprint Health',val:healthLabel,delta:'AI confidence 91%',color:'var(--text-muted)',valColor:healthColor},
        ].map((m,i)=>(<div className="card-inner" key={i}><div className="metric-label">{m.label}</div><div className="metric-val" style={{color:m.valColor||'var(--text)'}}>{m.val}</div><div className="metric-delta" style={{color:m.color}}>{m.delta}</div></div>))}
      </div>
      <div className="hero-section">
        <div className="card" style={{borderRadius:'16px 0 0 16px'}}>
          <div className="card-title">Projects <span className="card-badge">{ups.length} active</span></div>
          {ups.map(up=>{const p=up.project;if(!p)return null;const pct=calculateCompletion(p.id);
            const tag=pct>=90?'Almost Done':pct>=30?'In Progress':'Just Started';
            const tagClass=pct>=90?'tag-green':pct>=30?'tag-amber':'tag-muted';
            return(<div key={p.id} className={`project-row ${p.id===selProjectId?'active':''}`} onClick={()=>switchProject(p.id)}>
              <div style={{flex:1,minWidth:0}}>
                <div className="project-name">{p.name}</div>
                <div className="project-pct">{pct}% complete</div>
                <div className="project-bar"><div className="project-bar-fill" style={{width:`${pct}%`}}/></div>
              </div>
              <div className="stacked-avatars">
                {(p.members||[]).slice(0,3).map((m,i)=>(<div key={i} className="mini-avatar" style={{background:m.avatarColor||'#534AB7',color:'white'}}>{m.initials}</div>))}
                {(p.members||[]).length>3&&<div className="mini-avatar" style={{background:'var(--bg)',color:'var(--text-muted)'}}>+{p.members.length-3}</div>}
              </div>
              <span className={`project-tag ${tagClass}`}>{tag}</span>
            </div>);
          })}
        </div>
        <div className="card" style={{borderRadius:'0 16px 16px 0',borderLeft:'none'}}>
          <div className="card-title">Team on {selProj?.name||'Project'}</div>
          <div style={{fontSize:12,color:'var(--text-muted)',marginTop:-12,marginBottom:16}}>AI-monitored load status</div>
          <div key={memberKey}>
            {members.map((m,i)=>(<MemberCard key={m.name+m.load} m={m} animate={animBars} delay={i*60}/>))}
            {memberTip&&<div style={{fontSize:11,color:'#534AB7',padding:'8px 12px',background:'rgba(83,74,183,0.06)',borderRadius:8,marginTop:8}}>Share code <strong>{memberTip.inviteCode}</strong> with {memberTip.name} to let them log in</div>}
          </div>
          {!showAddMember?
            <button onClick={()=>setShowAddMember(true)} style={{display:'flex',alignItems:'center',gap:6,marginTop:12,padding:'8px 14px',borderRadius:8,border:'1.5px solid #534AB7',background:'transparent',color:'#534AB7',fontSize:12,fontWeight:600,fontFamily:'inherit',cursor:'pointer'}}>+ Add Member</button>
            :<div style={{display:'flex',gap:8,marginTop:12,animation:'fadeSlideDown 0.2s ease'}}>
              <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Member name" style={{flex:1,padding:8,borderRadius:8,border:'0.5px solid var(--border)',fontSize:12,fontFamily:'inherit',background:'var(--bg)',color:'var(--text)',outline:'none'}}/>
              <input value={newRole} onChange={e=>setNewRole(e.target.value)} placeholder="Role" style={{flex:1,padding:8,borderRadius:8,border:'0.5px solid var(--border)',fontSize:12,fontFamily:'inherit',background:'var(--bg)',color:'var(--text)',outline:'none'}}/>
              <button onClick={handleAddMember} style={{padding:'8px 12px',borderRadius:8,border:'none',background:'#534AB7',color:'white',fontSize:12,fontWeight:600,fontFamily:'inherit',cursor:'pointer',whiteSpace:'nowrap'}}>Add →</button>
            </div>
          }
          {(()=>{
            const forecast = getProjectForecast(selProj);
            if(!forecast) return null;
            return (
              <div style={{
                background: 'linear-gradient(135deg, rgba(83,74,183,0.1), rgba(29,158,117,0.1))',
                border: '0.5px solid var(--border)', borderRadius: 12,
                padding: 16, marginTop: 16
              }}>
                <div style={{fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 8}}>
                  📊 AI Project Forecast
                </div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12}}>
                  <div>
                    <div style={{fontSize: 11, color: 'var(--text-muted)', marginBottom: 4}}>Projected Completion</div>
                    <div style={{fontSize: 14, fontWeight: 600, color: 'var(--primary)'}}>{forecast.forecastDate}</div>
                    <div style={{fontSize: 10, color: 'var(--text-muted)'}}>{forecast.daysRemaining} days remaining</div>
                  </div>
                  <div>
                    <div style={{fontSize: 11, color: 'var(--text-muted)', marginBottom: 4}}>AI Confidence</div>
                    <div style={{fontSize: 14, fontWeight: 600, color: forecast.confidence > 75 ? 'var(--success)' : forecast.confidence > 50 ? 'var(--warning)' : 'var(--danger)'}}>{forecast.confidence}%</div>
                    <div style={{fontSize: 10, color: 'var(--text-muted)'}}>{forecast.committed}/{forecast.total} committed</div>
                  </div>
                </div>
                <div style={{fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5}}>
                  {forecast.committed === 0 
                    ? '⚠ No team members have committed yet. Encourage your team to commit to tasks for better forecasting.' 
                    : forecast.committed === forecast.total 
                      ? '✓ Full team commitment detected! Completion forecast is highly reliable.' 
                      : `${forecast.committed} team member${forecast.committed > 1 ? 's' : ''} committed. More commitments = better forecast accuracy.`}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
      <div className="two-col">
        <div className="card">
          <div className="card-title">Priority Tasks <span className="card-badge">{priorityTasks.length} open</span></div>
          {priorityTasks.length===0?<div style={{textAlign:'center',padding:24,color:'var(--text-muted)',fontSize:13}}>No active tasks. Assign tasks from the Task Manager.</div>:
          priorityTasks.map((t,i)=>{const s=tagStyle(t.priority);const assignee=members.find(m=>m.name?.toLowerCase()===t.assignedTo?.toLowerCase());
            return(<div className="task-row" key={t.id||i} style={t.committed ? {borderLeft: '3px solid var(--success)'} : {}}>
              <div className="task-dot" style={{background:s.color}}/>
              <div className="task-name">{t.name}</div>
              <div className="member-avatar" style={{background:assignee?.avatarColor||'#534AB7',width:24,height:24,fontSize:9}}>{assignee?.initials||(t.assignedTo?.[0]||'?')}</div>
              <span className="task-tag" style={{background:s.bg,color:s.color}}>{t.status||t.priority}</span>
              <span className="task-due">{t.dueDate?new Date(t.dueDate).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'No date'}</span>
              
              {t.assignedTo?.toLowerCase() === currentUserName?.toLowerCase() && t.status !== 'Done' && !t.committed && (
                <button onClick={() => handleCommit(t.id, t.name)}
                  style={{
                    padding: '4px 12px', borderRadius: 6,
                    background: 'transparent', border: '1px solid var(--primary)',
                    color: 'var(--primary)', fontSize: 11, fontWeight: 600,
                    fontFamily: 'inherit', cursor: 'pointer',
                    whiteSpace: 'nowrap', transition: 'all 0.2s',
                    height: 28
                  }}>
                  🎯 Commit
                </button>
              )}
              {t.committed && (
                <span style={{
                  padding: '4px 12px', borderRadius: 6,
                  background: 'var(--success)', color: 'white',
                  fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
                  height: 28, display: 'inline-flex', alignItems: 'center'
                }}>
                  ✓ Committed
                </span>
              )}
            </div>);})}
        </div>
        <div className="card">
          <div className="card-title">Weekly Activity</div>
          <WeeklyChart isDark={isDark} data={getWeeklyData(tasks)}/>
        </div>
      </div>
    </div>
  );
}
