import React, { useState, useEffect, useRef, useCallback } from 'react';
import { velocityData, sprintTable, heatmapData } from './data.js';

function VelocityChart({ isDark, animate }) {
  const ref = useRef(null);
  const draw = useCallback(() => {
    const c = ref.current; if(!c) return;
    const par = c.parentElement; if(!par) return;
    const W = par.clientWidth, H = 220;
    c.width=W*2; c.height=H*2; c.style.width=W+'px'; c.style.height=H+'px';
    const ctx = c.getContext('2d'); ctx.scale(2,2);
    const {sprints,values}=velocityData;
    const mx=Math.max(...values)*1.2, px=36, py=16, cw=W-px*2, ch=H-py*3;
    const txt=isDark?'#8B8AA0':'#6B6B80', grid=isDark?'#2A2840':'#E8E8F0';
    ctx.strokeStyle=grid;ctx.lineWidth=0.5;
    for(let i=0;i<=4;i++){const y=py+(ch/4)*i;ctx.beginPath();ctx.moveTo(px,y);ctx.lineTo(W-px,y);ctx.stroke();
      ctx.fillStyle=txt;ctx.font='11px Inter';ctx.textAlign='right';ctx.fillText(Math.round(mx-(mx/4)*i),px-8,y+4);}
    const pts=values.map((v,i)=>({x:px+(cw/(sprints.length-1))*i,y:py+ch-(v/mx)*ch}));
    // Line
    ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);
    for(let i=0;i<pts.length-1;i++){const cp=(pts[i+1].x-pts[i].x)/2;ctx.bezierCurveTo(pts[i].x+cp,pts[i].y,pts[i].x+cp,pts[i+1].y,pts[i+1].x,pts[i+1].y);}
    ctx.strokeStyle='#534AB7';ctx.lineWidth=2.5;ctx.stroke();
    // Fill
    ctx.lineTo(pts[pts.length-1].x,py+ch);ctx.lineTo(pts[0].x,py+ch);ctx.closePath();
    const grd=ctx.createLinearGradient(0,py,0,py+ch);grd.addColorStop(0,'rgba(83,74,183,0.25)');grd.addColorStop(1,'rgba(83,74,183,0)');ctx.fillStyle=grd;ctx.fill();
    // Points
    pts.forEach((p,i)=>{ctx.beginPath();ctx.arc(p.x,p.y,4,0,Math.PI*2);ctx.fillStyle='#534AB7';ctx.fill();ctx.lineWidth=2;ctx.strokeStyle=isDark?'#1A1928':'#fff';ctx.stroke();
      ctx.fillStyle=txt;ctx.textAlign='center';ctx.font='600 11px Inter';ctx.fillText(values[i],p.x,p.y-10);
      ctx.font='11px Inter';ctx.fillText(sprints[i],p.x,py+ch+16);});
  },[isDark]);
  useEffect(()=>{if(animate){draw();}const h=()=>draw();window.addEventListener('resize',h);return()=>window.removeEventListener('resize',h);},[draw,animate]);
  return <canvas ref={ref} style={{display:'block',width:'100%'}}/>;
}

export default function AnalyticsScreen({ isDark, addToast }) {
  const [animate, setAnimate] = useState(false);
  const [counts, setCounts] = useState([0,0,0]);

  useEffect(() => {
    const t = setTimeout(()=>setAnimate(true), 100);
    return ()=>clearTimeout(t);
  }, []);

  // Count-up animation
  useEffect(() => {
    if(!animate) return;
    const targets = [68,14,2.3];
    const start = performance.now();
    const dur = 800;
    const step = (now) => {
      const p = Math.min((now-start)/dur, 1);
      const ease = 1-Math.pow(1-p,3);
      setCounts(targets.map(t=>+(t*ease).toFixed(t<10?1:0)));
      if(p<1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [animate]);

  const outputData = [
    {name:'Priya S.',pct:92,color:'var(--danger)'},
    {name:'Anika R.',pct:88,color:'var(--danger)'},
    {name:'Raj M.',pct:78,color:'var(--warning)'},
    {name:'Dev K.',pct:60,color:'var(--success)'},
  ];

  const handleExport = () => {
    addToast('loading','Generating report...');
    setTimeout(()=>addToast('success','Report exported!'), 1500);
  };

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24}}>
        <div>
          <h1 style={{fontSize:20,fontWeight:600}}>Analytics & Reports</h1>
          <div style={{fontSize:13,color:'var(--text-muted)',marginTop:4}}>AI-generated insights · Sprint 14 · May 2026</div>
        </div>
        <button className="mag-btn" onClick={handleExport}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export Report
        </button>
      </div>

      <div className="insight-pills">
        {['↑ Velocity up 12%','⚠ Priya overloaded','⏱ Avg task: 2.3 days','🎯 82% sprint on track','💡 Design System near completion'].map((t,i)=>(
          <button className="insight-pill" key={i}>{t}</button>
        ))}
      </div>

      <div className="stats-grid">
        <div className="card-inner">
          <div className="metric-label">Completion Rate</div>
          <div className="metric-val">{counts[0]}%</div>
          <div style={{fontSize:12,color:'var(--text-muted)'}}>Sprint 14 progress</div>
          <div className="stat-bar"><div className="stat-fill" style={{width:animate?'68%':'0%',background:'var(--primary)'}}/></div>
        </div>
        <div className="card-inner">
          <div className="metric-label">Bugs Resolved</div>
          <div className="metric-val">{counts[1]}</div>
          <div className="metric-delta" style={{color:'var(--success)'}}>↑ 40% vs last sprint</div>
          <div className="stat-bar"><div className="stat-fill" style={{width:animate?'80%':'0%',background:'var(--success)'}}/></div>
        </div>
        <div className="card-inner">
          <div className="metric-label">Avg Cycle Time</div>
          <div className="metric-val">{counts[2]}d</div>
          <div className="metric-delta" style={{color:'var(--warning)'}}>↑ 0.4 days slower</div>
          <div className="stat-bar"><div className="stat-fill" style={{width:animate?'55%':'0%',background:'var(--warning)'}}/></div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-title">Velocity Trend</div>
          <VelocityChart isDark={isDark} animate={animate}/>
        </div>
        <div className="card">
          <div className="card-title">Individual Output</div>
          {outputData.map((o,i)=>(
            <div className="output-row" key={i}>
              <div className="output-name">{o.name}</div>
              <div className="output-bar-track">
                <div className="output-bar-fill" style={{width:animate?`${o.pct}%`:'0%',background:o.color,transitionDelay:`${i*80}ms`}}/>
              </div>
              <div className="output-pct" style={{color:o.color}}>{o.pct}%</div>
              {o.pct>85 && <span style={{fontSize:14}}>⚠️</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-title">Sprint Comparison</div>
          <table className="sprint-table">
            <thead><tr><th>Sprint</th><th>Tasks</th><th>Bugs</th><th>Velocity</th><th>Cycle</th><th>AI Score</th></tr></thead>
            <tbody>
              {sprintTable.map((r,i)=>(
                <tr key={i} className={r.current?'current':''}>
                  <td>{r.sprint}</td><td>{r.tasks}</td><td>{r.bugs}</td><td>{r.velocity}</td><td>{r.cycle}</td><td>{r.ai}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="card-title">Commit Activity</div>
          <div className="heatmap-grid">
            {heatmapData.map((lv,i)=>(
              <div key={i} className="heatmap-cell" data-level={lv}>
                <span className="heatmap-tooltip">Day {i+1}: {lv*4} commits</span>
              </div>
            ))}
          </div>
          <div className="heatmap-legend">
            <span>Less</span>
            {[0,1,2,3,4].map(l=><div key={l} className="heatmap-legend-cell" style={{background:`var(--heatmap-${l})`}}/>)}
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
