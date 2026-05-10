import React, { useState, useEffect } from 'react';

export default function RoleSelectScreen({ onSelect }) {
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState(null);
  useEffect(() => { setTimeout(() => setShow(true), 50); }, []);

  const cards = [
    { key:'leader', icon:'👑', iconBg:'#534AB7', title:'Create a Team',
      sub:"I'm a team leader. I'll manage projects, track progress and monitor my team.",
      tag:'Team Leader', tagBg:'rgba(83,74,183,0.1)', tagColor:'#534AB7' },
    { key:'member', icon:'👥', iconBg:'#1D9E75', title:'Join a Team',
      sub:"I'm a team member. I'll see my tasks, track my progress and stay on top of my work.",
      tag:'Team Member', tagBg:'rgba(29,158,117,0.1)', tagColor:'#1D9E75' },
  ];

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',padding:24}}>
      <div style={{maxWidth:560,width:'100%',textAlign:'center'}}>
        <h1 style={{fontSize:24,fontWeight:600,opacity:show?1:0,transition:'all 0.3s ease'}}>Welcome to Synapse 👋</h1>
        <p style={{fontSize:14,color:'var(--text-muted)',marginTop:8,opacity:show?1:0,transition:'all 0.3s ease 0.1s'}}>What best describes your role?</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,margin:'32px 0'}}>
          {cards.map((c,i)=>(
            <div key={c.key} onClick={()=>setSelected(c.key)} style={{
              background:'var(--surface)',border:selected===c.key?'2px solid #534AB7':'0.5px solid var(--border)',
              borderRadius:16,padding:28,cursor:'pointer',textAlign:'center',position:'relative',
              transform:show?(selected===c.key?'translateY(-4px)':'translateY(0)'):'scale(0.9)',
              opacity:show?1:0,transition:`all 0.4s ease ${0.15+i*0.15}s`,
              boxShadow:selected===c.key?'0 6px 20px rgba(83,74,183,0.12)':'0 2px 12px rgba(83,74,183,0.08)',
              backgroundColor:selected===c.key?'rgba(83,74,183,0.06)':'var(--surface)'
            }}>
              {selected===c.key && <div style={{position:'absolute',top:12,right:12,width:22,height:22,borderRadius:'50%',background:'#534AB7',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>✓</div>}
              <div style={{width:64,height:64,borderRadius:'50%',background:c.iconBg,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:28,marginBottom:16}}>{c.icon}</div>
              <div style={{fontSize:16,fontWeight:600,marginBottom:8}}>{c.title}</div>
              <div style={{fontSize:13,color:'var(--text-muted)',lineHeight:1.5,marginBottom:16}}>{c.sub}</div>
              <span style={{fontSize:12,fontWeight:600,padding:'4px 14px',borderRadius:8,background:c.tagBg,color:c.tagColor}}>{c.tag}</span>
            </div>
          ))}
        </div>
        <button onClick={()=>selected && onSelect(selected)} disabled={!selected} style={{
          width:'100%',padding:14,borderRadius:12,border:'none',
          background:selected?'#534AB7':'var(--border)',color:selected?'white':'var(--text-muted)',
          fontSize:14,fontWeight:600,fontFamily:'inherit',cursor:selected?'pointer':'not-allowed',
          transition:'all 0.2s'
        }}>Continue →</button>
      </div>
    </div>
  );
}
