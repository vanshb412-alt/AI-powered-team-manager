import React, { useState, useEffect, useRef, useCallback } from 'react';
import { projectData, tasks, weeklyData } from './data.js';

const projectNames = Object.keys(projectData);

function LoadBar({ load, animate }) {
  const w = animate ? load : 0;
  const color = load > 85 ? 'var(--danger)' : load > 65 ? 'var(--warning)' : 'var(--success)';
  return (
    <div style={{flex:1}}>
      <div className="load-bar"><div className="load-fill" style={{width:`${w}%`,background:color}}/></div>
    </div>
  );
}

function MemberCard({ m, animate, delay }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), delay); return () => clearTimeout(t); }, [delay]);
  const color = m.load > 85 ? 'var(--danger)' : m.load > 65 ? 'var(--warning)' : 'var(--success)';
  return (
    <div className="member-row" style={{opacity:show?1:0,transform:show?'translateX(0)':'translateX(20px)',transition:'all 0.2s ease-out'}}>
      <div className="member-avatar" style={{background:m.color}}>{m.initials}</div>
      <div className="member-info">
        <div className="member-name">
          {m.name}
          {m.load > 85 && <span className="warn-icon" title="AI: Risk of burnout detected">⚠<span className="warn-tooltip">AI: Risk of burnout detected</span></span>}
        </div>
        <div className="member-role">{m.role}</div>
        <LoadBar load={m.load} animate={animate && show} />
        <div className="member-stats">{m.tasks} tasks · {m.pts}pts · {m.overdue} overdue</div>
      </div>
      <div className="load-pct" style={{color}}>{m.load}%</div>
    </div>
  );
}

function WeeklyChart({ isDark }) {
  const ref = useRef(null);
  const drawn = useRef(false);
  const draw = useCallback(() => {
    const c = ref.current; if (!c) return;
    const par = c.parentElement; if (!par) return;
    const W = par.clientWidth, H = 220;
    c.width = W * 2; c.height = H * 2; c.style.width = W+'px'; c.style.height = H+'px';
    const ctx = c.getContext('2d'); ctx.scale(2,2);
    const { days, tasks: td, prs } = weeklyData;
    const mx = Math.max(...td,...prs)*1.3, px=36, py=16, cw=W-px*2, ch=H-py*3;
    const txt = isDark?'#8B8AA0':'#6B6B80', grid = isDark?'#2A2840':'#E8E8F0';
    ctx.strokeStyle=grid; ctx.lineWidth=0.5;
    for(let i=0;i<=4;i++){const y=py+(ch/4)*i;ctx.beginPath();ctx.moveTo(px,y);ctx.lineTo(W-px,y);ctx.stroke();
      ctx.fillStyle=txt;ctx.font='11px Inter';ctx.textAlign='right';ctx.fillText(Math.round(mx-(mx/4)*i),px-8,y+4);}
    const bw=Math.min((cw/7)*0.28,20), g=3;
    days.forEach((d,i)=>{const x=px+(cw/7)*i+(cw/7)/2;
      const th=(td[i]/mx)*ch;ctx.fillStyle='#7F77DD';ctx.beginPath();ctx.roundRect?ctx.roundRect(x-bw-g,py+ch-th,bw,th,[3,3,0,0]):ctx.rect(x-bw-g,py+ch-th,bw,th);ctx.fill();
      const ph=(prs[i]/mx)*ch;ctx.fillStyle='#5DCAA5';ctx.beginPath();ctx.roundRect?ctx.roundRect(x+g,py+ch-ph,bw,ph,[3,3,0,0]):ctx.rect(x+g,py+ch-ph,bw,ph);ctx.fill();
      ctx.fillStyle=txt;ctx.textAlign='center';ctx.font='11px Inter';ctx.fillText(d,x,py+ch+16);});
    ctx.fillStyle='#7F77DD';ctx.beginPath();ctx.roundRect?ctx.roundRect(W/2-80,H-16,10,10,2):ctx.rect(W/2-80,H-16,10,10);ctx.fill();
    ctx.fillStyle=txt;ctx.textAlign='left';ctx.font='11px Inter';ctx.fillText('Tasks',W/2-65,H-8);
    ctx.fillStyle='#5DCAA5';ctx.beginPath();ctx.roundRect?ctx.roundRect(W/2-10,H-16,10,10,2):ctx.rect(W/2-10,H-16,10,10);ctx.fill();
    ctx.fillStyle=txt;ctx.fillText('PRs',W/2+5,H-8);
  },[isDark]);

  useEffect(()=>{draw();const h=()=>draw();window.addEventListener('resize',h);return()=>window.removeEventListener('resize',h);},[draw]);
  return <canvas ref={ref} style={{display:'block',width:'100%'}}/>;
}

export default function DashboardScreen({ isDark, loaded }) {
  const [selProject, setSelProject] = useState(projectNames[0]);
  const [animBars, setAnimBars] = useState(false);
  const [memberKey, setMemberKey] = useState(0);

  useEffect(() => { if(loaded){ const t=setTimeout(()=>setAnimBars(true),200); return()=>clearTimeout(t); } }, [loaded]);
  
  const switchProject = (p) => {
    if(p===selProject) return;
    setAnimBars(false);
    setMemberKey(k=>k+1);
    setSelProject(p);
    setTimeout(()=>setAnimBars(true),100);
  };

  const proj = projectData[selProject];

  return (
    <div>
      {/* Greeting */}
      <div className="greeting">
        <h1>Good morning, Vansh 👋</h1>
        <div className="greeting-sub"><span className="pulse-dot"/> AI has 3 new insights for your team today</div>
      </div>

      {/* AI Brief */}
      <div className="ai-brief">
        <div className="ai-brief-circle"/>
        <div className="ai-brief-inner">
          <div className="ai-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><circle cx="8" cy="16" r="1" fill="white"/><circle cx="16" cy="16" r="1" fill="white"/></svg>
          </div>
          <div style={{flex:1}}>
            <div className="ai-title">AI Sprint Summary</div>
            <div className="ai-body">Sprint 14 is 68% complete. Priya is at risk of overload — 3 tasks due Friday. Consider redistributing API Integration to Raj who has 40% bandwidth free. Estimated sprint success: 82%.</div>
            <div className="ai-link">View Details →</div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="metrics-grid">
        {[
          {label:'Active Tasks',val:'24',delta:'↑ 3 since yesterday',color:'var(--success)'},
          {label:'Team Velocity',val:'87%',delta:'↑ 12% vs last sprint',color:'var(--success)'},
          {label:'Blockers',val:'2',delta:'↑ 1 new blocker',color:'var(--danger)',valColor:'var(--danger)'},
          {label:'Sprint Health',val:'Good',delta:'AI confidence 91%',color:'var(--text-muted)',valColor:'var(--success)'},
        ].map((m,i)=>(
          <div className="card-inner" key={i}>
            <div className="metric-label">{m.label}</div>
            <div className="metric-val" style={{color:m.valColor||'var(--text)'}}>{m.val}</div>
            <div className="metric-delta" style={{color:m.color}}>{m.delta}</div>
          </div>
        ))}
      </div>

      {/* Projects + Team Load */}
      <div className="hero-section">
        <div className="card" style={{borderRadius:'16px 0 0 16px'}}>
          <div className="card-title">Projects <span className="card-badge">4 active</span></div>
          {projectNames.map(p=>(
            <div key={p} className={`project-row ${p===selProject?'active':''}`} onClick={()=>switchProject(p)}>
              <div style={{flex:1,minWidth:0}}>
                <div className="project-name">{p}</div>
                <div className="project-pct">{projectData[p].pct}% complete</div>
                <div className="project-bar"><div className="project-bar-fill" style={{width:`${projectData[p].pct}%`}}/></div>
              </div>
              <div className="stacked-avatars">
                {projectData[p].members.slice(0,3).map((m,i)=>(
                  <div key={i} className="mini-avatar" style={{background:m.color,color:'white'}}>{m.initials}</div>
                ))}
                {projectData[p].members.length>3 && <div className="mini-avatar" style={{background:'var(--bg)',color:'var(--text-muted)'}}>+{projectData[p].members.length-3}</div>}
              </div>
              <span className={`project-tag ${projectData[p].tagClass}`}>{projectData[p].tag}</span>
            </div>
          ))}
        </div>
        <div className="card" style={{borderRadius:'0 16px 16px 0',borderLeft:'none'}}>
          <div className="card-title">Team on {selProject}</div>
          <div style={{fontSize:12,color:'var(--text-muted)',marginTop:-12,marginBottom:16}}>AI-monitored load status</div>
          <div key={memberKey}>
            {proj.members.map((m,i)=>(
              <MemberCard key={m.name} m={m} animate={animBars} delay={i*60}/>
            ))}
          </div>
        </div>
      </div>

      {/* Tasks + Activity */}
      <div className="two-col">
        <div className="card">
          <div className="card-title">Priority Tasks <span className="card-badge">5 open</span></div>
          {tasks.map((t,i)=>(
            <div className="task-row" key={i}>
              <div className="task-dot" style={{background:t.dot}}/>
              <div className="task-name">{t.name}</div>
              <div className="member-avatar" style={{background:t.dot,width:24,height:24,fontSize:9}}>{t.who[0]}</div>
              <span className="task-tag" style={{background:t.tagBg,color:t.tagColor}}>{t.tag}</span>
              <span className="task-due">{t.due}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">Weekly Activity</div>
          <WeeklyChart isDark={isDark}/>
        </div>
      </div>
    </div>
  );
}
