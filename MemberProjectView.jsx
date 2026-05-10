import React, { useState, useEffect } from 'react';
import { getCurrentUser, getActiveProject, getTasksForUser, completeTask, raiseBlocker, calculateCompletion, getTimeAgo, getData, updateTask } from './store.js';

const getDefaultMyPriority = (leaderPriority) => {
  if (leaderPriority === 'Urgent' || leaderPriority === 'High') 
    return 'Do first';
  if (leaderPriority === 'Medium') return 'Do next';
  return 'Later';
};

const MY_PRIORITY_OPTIONS = [
  { value: 'Do first', emoji: '🔴' },
  { value: 'Do next',  emoji: '🟡' },
  { value: 'Later',    emoji: '🟢' },
];

const SORT_ORDER = { 'Do first': 0, 'Do next': 1, 'Later': 2 };

function Confetti({x,y}){const colors=['#534AB7','#7F77DD','#1D9E75','#BA7517','#E24B4A','#F5A623'];
  return(<div style={{position:'fixed',left:x,top:y,pointerEvents:'none',zIndex:9999}}>
    {Array.from({length:6}).map((_,i)=>{const angle=(Math.PI*2/6)*i+Math.random()*0.5;const dist=30+Math.random()*30;
      return(<div key={i} style={{position:'absolute',width:6,height:6,borderRadius:2,background:colors[i],left:0,top:0,animation:'confettiBurst 0.4s ease-out forwards',animationDelay:`${i*0.02}s`,'--tx':`${Math.cos(angle)*dist}px`,'--ty':`${Math.sin(angle)*dist}px`}}/>);})}</div>);
}

export default function MemberProjectView({addToast,forceUpdate,dv}){
  const [show,setShow]=useState(false);const[confetti,setConfetti]=useState(null);
  const [showBlocker,setShowBlocker]=useState(false);const[blockerText,setBlockerText]=useState('');const[blockerTask,setBlockerTask]=useState('');const[blockerSent,setBlockerSent]=useState(false);
  
  const [myPriorities, setMyPriorities] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('synapse_my_priorities') || '{}'
      );
    } catch { return {}; }
  });

  const handleMyPriority = (taskId, value, leaderPriority) => {
    const updated = { ...myPriorities, [taskId]: value };
    setMyPriorities(updated);
    localStorage.setItem(
      'synapse_my_priorities', 
      JSON.stringify(updated)
    );
  };

  useEffect(()=>{setTimeout(()=>setShow(true),50);},[]);

  const user=getCurrentUser();const proj=getActiveProject();
  const myTasks=proj?getTasksForUser(proj.id,user?.name):[];
  const pendingTasks=myTasks.filter(t=>t.status!=='Done');
  
  const sortedTasks = [...pendingTasks].sort((a, b) => {
    const pa = myPriorities[a.id] || getDefaultMyPriority(a.priority);
    const pb = myPriorities[b.id] || getDefaultMyPriority(b.priority);
    return (SORT_ORDER[pa] ?? 1) - (SORT_ORDER[pb] ?? 1);
  });

  const completion=calculateCompletion(proj?.id);
  const totalTasks=proj?.tasks?.length||0;const doneTasks=(proj?.tasks||[]).filter(t=>t.status==='Done').length;
  const openBlockers=(proj?.blockers||[]).filter(b=>b.status==='Open').length;

  // Get recent activity from completedTasks
  const d=getData();const recentActivity=(d?.completedTasks||[]).filter(ct=>ct.projectId===proj?.id).sort((a,b)=>new Date(b.completedAt)-new Date(a.completedAt)).slice(0,5).map(ct=>{
    const task=proj?.tasks?.find(t=>t.id===ct.taskId);const member=proj?.members?.find(m=>task?.assignedTo?.toLowerCase()===m.name?.toLowerCase());
    return{initials:member?.initials||'??',color:member?.avatarColor||'#534AB7',name:member?.name||task?.assignedTo||'Unknown',task:task?.name||'Task',time:getTimeAgo(ct.completedAt)};
  });

  const toggleTask=(taskId,e)=>{const task=myTasks.find(t=>t.id===taskId);if(!task||!proj)return;
    const rect=e.currentTarget.getBoundingClientRect();
    setConfetti({x:rect.left+10,y:rect.top+10,id:Date.now()});setTimeout(()=>setConfetti(null),500);
    const result=completeTask(proj.id,task.id);
    addToast('success',`Task marked complete! +${result.xp} XP`);
    if(result.newAchievements?.length){setTimeout(()=>{result.newAchievements.forEach(a=>{addToast('success',`🏆 ${a.name} unlocked! +${a.xp} XP`,3500);});},500);}
    forceUpdate?.();
  };

  const handleCommit = (taskId) => {
    if (!proj) return;
    updateTask(proj.id, taskId, { committed: true, committedAt: new Date().toISOString() });
    addToast('success', "You committed to this task! The team is counting on you 💪", 3000);
    forceUpdate?.();
  };

  const handlePriorityChange = (taskId, newPri) => {
    // keeping empty or removing, wait, wait, the prompt told me to remove this and use handleMyPriority
    // so I will just replace it with empty
  };

  const submitBlocker=()=>{if(!proj)return;
    raiseBlocker(proj.id,{raisedBy:user?.name||'Unknown',taskId:blockerTask,description:blockerText});
    setBlockerSent(true);forceUpdate?.();
    setTimeout(()=>{setShowBlocker(false);setBlockerSent(false);setBlockerText('');setBlockerTask('');},2000);
  };

  const tagStyle=(pri)=>{if(pri==='Urgent')return{pr:'#E24B4A',border:'#E24B4A',due:'#E24B4A'};if(pri==='High')return{pr:'#E24B4A',border:'#BA7517',due:'#BA7517'};if(pri==='Medium')return{pr:'#BA7517',border:'#534AB7',due:'#1D9E75'};return{pr:'#6B6B80',border:'#534AB7',due:'#1D9E75'};};

  return(
    <div>
      {confetti&&<Confetti x={confetti.x} y={confetti.y} key={confetti.id}/>}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24,opacity:show?1:0,transition:'all 0.3s ease'}}>
        <div><h1 style={{fontSize:20,fontWeight:600}}>{proj?.name||'My Project'}</h1><div style={{fontSize:13,color:'var(--text-muted)',marginTop:4}}>{proj?.members?.[0]?.name?'Team '+proj.name:''}</div></div>
        <span style={{fontSize:12,fontWeight:600,padding:'4px 14px',borderRadius:8,background:'rgba(83,74,183,0.1)',color:'#534AB7'}}>{proj?.sprintName||'Sprint'}</span>
      </div>
      <div className="card" style={{marginBottom:24,opacity:show?1:0,transform:show?'translateY(0)':'translateY(12px)',transition:'all 0.4s ease 0.15s'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:32}}>
          <div style={{flex:1}}>
            <div style={{fontSize:12,color:'var(--text-muted)',textTransform:'uppercase',fontWeight:500,letterSpacing:0.5}}>Overall Progress</div>
            <div style={{fontSize:36,fontWeight:600,color:'#534AB7',margin:'8px 0'}}>{completion}%</div>
            <div style={{fontSize:13,color:'var(--text-muted)'}}>{proj?.sprintName} · {doneTasks} of {totalTasks} tasks complete</div>
            <div style={{height:5,background:'var(--border)',borderRadius:3,marginTop:16,overflow:'hidden'}}><div style={{height:'100%',background:'#534AB7',borderRadius:3,width:show?completion+'%':'0%',transition:'width 0.8s ease-out 0.3s'}}/></div>
          </div>
          <div style={{display:'flex',gap:24}}>
            {[{val:'N/A',label:'Days left',color:'var(--text)'},{val:String(openBlockers),label:'Blockers',color:'#E24B4A'},{val:'82%',label:'AI Success Rate',color:'#1D9E75'}].map((s,i)=>(<div key={i} style={{textAlign:'center'}}><div style={{fontSize:22,fontWeight:600,color:s.color}}>{s.val}</div><div style={{fontSize:11,color:'var(--text-muted)',marginTop:4}}>{s.label}</div></div>))}
          </div>
        </div>
      </div>
      <div style={{background:'var(--pill-bg)',border:'0.5px solid #AFA9EC',borderRadius:12,padding:16,marginBottom:24,opacity:show?1:0,transition:'all 0.3s ease 0.5s'}}>
        <div style={{fontSize:12,fontWeight:600,color:'#534AB7',marginBottom:6}}>✨ AI Team Insight</div>
        <div style={{fontSize:13,color:'var(--text)',lineHeight:1.6}}>
          {pendingTasks.length>0?`You have ${pendingTasks.length} pending task${pendingTasks.length>1?'s':''}. ${pendingTasks.some(t=>t.priority==='Urgent')?'Focus on your urgent tasks first.':'Your team is on track for sprint completion.'}`:'All tasks complete! Great work this sprint.'}
        </div>
      </div>
      <div style={{marginBottom:24}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
          <h2 style={{fontSize:16,fontWeight:600}}>My Tasks</h2>
          <span style={{fontSize:11,fontWeight:600,padding:'2px 10px',borderRadius:8,background:'rgba(226,75,74,0.1)',color:'#E24B4A'}}>{pendingTasks.length} remaining</span>
        </div>
        <div style={{fontSize:12,color:'var(--text-muted)',marginBottom:16}}>Your assigned work for {proj?.sprintName||'this sprint'}</div>
        {pendingTasks.length===0?<div style={{textAlign:'center',padding:32,color:'var(--text-muted)'}}><div style={{fontSize:32,marginBottom:8}}>📭</div><div style={{fontSize:14,fontWeight:600}}>No tasks assigned yet</div><div style={{fontSize:12,marginTop:4}}>Your team leader hasn't assigned any tasks to you yet.</div></div>:
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {sortedTasks.map((t,i)=>{const s=tagStyle(t.priority);return(
            <div key={t.id} className="card-inner task-card-hover task-card-member" style={{borderLeft:`3px solid ${t.committed?'#1D9E75':s.border}`,padding:'14px 16px',opacity:show?1:0,transform:show?'translateY(0)':'translateY(12px)'}}>
              <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
                <div onClick={(e)=>toggleTask(t.id,e)} style={{width:20,height:20,borderRadius:6,border:'2px solid var(--border)',background:'transparent',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,marginTop:2,transition:'all 0.2s'}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:600}}>{t.name}</div>
                  <div style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>📁 {proj?.name}</div>
                  <div style={{fontSize:12,color:'var(--text-muted)',marginTop:4,overflow:'hidden',textOverflow:'ellipsis',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{t.description}</div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <span style={{fontSize:11,fontWeight:600,padding:'2px 10px',borderRadius:8,background:`${s.pr}15`,color:s.pr}}>{t.priority}</span>
                  <div style={{fontSize:11,fontWeight:600,color:s.due,marginTop:8}}>{t.dueDate?new Date(t.dueDate).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'No date'}</div>
                </div>
              </div>
              {t.status === 'Done' ? (
                <div style={{marginTop: 12, textAlign: 'right', fontSize: 11, fontWeight: 600, color: '#1D9E75'}}>✓ Completed</div>
              ) : (
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12}}>
                  {t.status !== 'Done' && (
                    <div style={{
                      display: 'flex', alignItems: 'center', 
                      gap: 8, marginTop: 8
                    }}>
                      <span style={{
                        fontSize: 11, color: 'var(--text-muted)', 
                        whiteSpace: 'nowrap'
                      }}>
                        My priority:
                      </span>
                      <select
                        value={
                          myPriorities[t.id] || 
                          getDefaultMyPriority(t.priority)
                        }
                        onChange={e => handleMyPriority(
                          t.id, e.target.value, t.priority
                        )}
                        style={{
                          padding: '3px 8px', borderRadius: 6,
                          border: '0.5px solid var(--border)',
                          background: 'var(--surface)',
                          color: 'var(--text)', fontSize: 11,
                          fontFamily: 'inherit', cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        {MY_PRIORITY_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>
                            {o.emoji} {o.value}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {t.committed ? (
                    <div style={{fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: '#1D9E75', color: 'white', marginTop: 8}}>✓ Committed</div>
                  ) : (
                    <button onClick={() => handleCommit(t.id)} style={{fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: 'transparent', border: '1px solid #534AB7', color: '#534AB7', cursor: 'pointer', display: 'flex', alignItems: 'center', height: 28, marginTop: 8}}>🎯 Commit</button>
                  )}
                </div>
              )}
            </div>);})}
        </div>}
      </div>
      <button onClick={()=>setShowBlocker(true)} style={{width:'100%',padding:14,borderRadius:12,border:'1.5px solid #E24B4A',background:'transparent',color:'#E24B4A',fontSize:14,fontWeight:600,fontFamily:'inherit',cursor:'pointer',marginBottom:24,display:'flex',alignItems:'center',justifyContent:'center',gap:8,opacity:show?1:0,transition:'all 0.2s ease 1.2s'}}>⚠ Raise a Blocker</button>
      {showBlocker&&<div className="card" style={{marginBottom:24}}>
        {!blockerSent?<><h3 style={{fontSize:14,fontWeight:600,marginBottom:12}}>What's blocking you?</h3>
          <textarea value={blockerText} onChange={e=>setBlockerText(e.target.value)} placeholder="Describe what's stopping you..." style={{width:'100%',height:80,padding:12,borderRadius:8,border:'0.5px solid var(--border)',fontSize:13,fontFamily:'inherit',background:'var(--bg)',color:'var(--text)',outline:'none',resize:'none',marginBottom:12}}/>
          <select value={blockerTask} onChange={e=>setBlockerTask(e.target.value)} style={{width:'100%',padding:10,borderRadius:8,border:'0.5px solid var(--border)',fontSize:13,fontFamily:'inherit',background:'var(--bg)',color:'var(--text)',outline:'none',marginBottom:12}}>
            <option value="">Which task is blocked?</option>{myTasks.map((t,i)=><option key={i} value={t.id}>{t.name}</option>)}</select>
          <button onClick={submitBlocker} style={{width:'100%',padding:12,borderRadius:8,border:'none',background:'#E24B4A',color:'white',fontSize:13,fontWeight:600,fontFamily:'inherit',cursor:'pointer'}}>Submit Blocker</button>
        </>:<div style={{textAlign:'center',padding:16,color:'#1D9E75',fontWeight:500,fontSize:14}}>✓ Blocker raised. Your team lead has been notified.</div>}
      </div>}
      <div>
        <h2 style={{fontSize:14,fontWeight:600}}>Recent Team Activity</h2>
        <div style={{fontSize:12,color:'var(--text-muted)',marginBottom:16,marginTop:4}}>What the team shipped recently</div>
        {recentActivity.length===0?<div style={{textAlign:'center',padding:24,color:'var(--text-muted)',fontSize:13}}>No recent activity yet.</div>:
        recentActivity.map((a,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:i<recentActivity.length-1?'0.5px solid var(--border)':'none',opacity:show?1:0,transform:show?'translateY(0)':'translateY(8px)',transition:`all 0.25s ease ${1.3+i*0.06}s`}}>
          <div style={{width:28,height:28,borderRadius:'50%',background:a.color,color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:600,flexShrink:0}}>{a.initials}</div>
          <div style={{flex:1,fontSize:13}}><strong>{a.name}</strong> completed "{a.task}"</div>
          <span style={{fontSize:11,color:'var(--text-muted)',flexShrink:0}}>{a.time}</span>
          <span style={{color:'#1D9E75',fontSize:14}}>✓</span>
        </div>))}
      </div>
    </div>
  );
}
