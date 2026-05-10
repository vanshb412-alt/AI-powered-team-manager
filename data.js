export const projectData = {
  'Mobile App Redesign': { pct:68, tag:'In Progress', tagClass:'tag-amber', members:[
    {name:'Priya S.',role:'Frontend',initials:'PS',color:'#E24B4A',load:92,tasks:8,pts:18,overdue:2},
    {name:'Anika R.',role:'Design',initials:'AR',color:'#BA7517',load:75,tasks:6,pts:12,overdue:0},
    {name:'Dev K.',role:'QA',initials:'DK',color:'#1D9E75',load:60,tasks:5,pts:10,overdue:1},
    {name:'Raj M.',role:'Backend',initials:'RM',color:'#534AB7',load:48,tasks:4,pts:8,overdue:0}]},
  'Backend API v2': { pct:45, tag:'In Progress', tagClass:'tag-amber', members:[
    {name:'Raj M.',role:'Backend',initials:'RM',color:'#534AB7',load:78,tasks:7,pts:14,overdue:1},
    {name:'Dev K.',role:'QA',initials:'DK',color:'#1D9E75',load:55,tasks:4,pts:9,overdue:0},
    {name:'Priya S.',role:'Frontend',initials:'PS',color:'#E24B4A',load:40,tasks:3,pts:6,overdue:0}]},
  'Design System': { pct:92, tag:'Almost Done', tagClass:'tag-green', members:[
    {name:'Anika R.',role:'Design',initials:'AR',color:'#BA7517',load:88,tasks:9,pts:16,overdue:3},
    {name:'Priya S.',role:'Frontend',initials:'PS',color:'#E24B4A',load:35,tasks:2,pts:4,overdue:0}]},
  'Q3 Analytics Dashboard': { pct:20, tag:'Just Started', tagClass:'tag-muted', members:[
    {name:'Raj M.',role:'Backend',initials:'RM',color:'#534AB7',load:30,tasks:2,pts:5,overdue:0},
    {name:'Dev K.',role:'QA',initials:'DK',color:'#1D9E75',load:25,tasks:2,pts:4,overdue:0},
    {name:'Anika R.',role:'Design',initials:'AR',color:'#BA7517',load:45,tasks:3,pts:7,overdue:0}]}
};
export const tasks = [
  {dot:'#E24B4A',name:'Fix auth middleware bug',who:'Raj',tag:'Urgent',tagBg:'rgba(226,75,74,0.1)',tagColor:'#E24B4A',due:'Due today'},
  {dot:'#BA7517',name:'Finalize onboarding flow',who:'Priya',tag:'In Review',tagBg:'rgba(186,117,23,0.1)',tagColor:'#BA7517',due:'Due Thu'},
  {dot:'#1D9E75',name:'Design system audit',who:'Anika',tag:'Done',tagBg:'rgba(29,158,117,0.1)',tagColor:'#1D9E75',due:'May 8'},
  {dot:'#BA7517',name:'API rate limit testing',who:'Dev',tag:'In Progress',tagBg:'rgba(186,117,23,0.1)',tagColor:'#BA7517',due:'Due Fri'},
  {dot:'#534AB7',name:'Q3 roadmap review',who:'All',tag:'Planned',tagBg:'rgba(83,74,183,0.1)',tagColor:'#534AB7',due:'May 15'},
];
export const announcements = [
  {tag:'Hiring',tagBg:'rgba(186,117,23,0.15)',tagColor:'#BA7517',title:'Q3 hiring freeze announced across all departments',date:'May 8, 2026',impact:'Your open backend engineer request may be delayed — consider redistributing sprint load across Raj and Dev.'},
  {tag:'Product',tagBg:'rgba(29,158,117,0.15)',tagColor:'#1D9E75',title:'New design guidelines released by brand team',date:'May 6, 2026',impact:"Anika's Design System project aligns with this — prioritize completion before next sprint."},
  {tag:'Policy',tagBg:'rgba(83,74,183,0.15)',tagColor:'#534AB7',title:'Remote work policy updated — core hours now 11am–4pm',date:'May 3, 2026',impact:'No direct sprint impact. Meeting schedules may need adjustment for Raj who is in a different timezone.'},
];
export const notifications = [
  {color:'#E24B4A',title:'Priya marked as overloaded',time:'2 min ago'},
  {color:'#BA7517',title:'Sprint 14 deadline approaching',time:'1 hour ago'},
  {color:'#1D9E75',title:'Design System audit completed',time:'3 hours ago'},
];
export const weeklyData = {days:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],tasks:[5,8,6,10,7,2,3],prs:[3,5,4,7,6,1,2]};
export const velocityData = {sprints:['S10','S11','S12','S13','S14'],values:[62,70,75,78,87]};
export const sprintTable = [
  {sprint:'S12',tasks:34,bugs:8,velocity:'72%',cycle:'2.8d',ai:74},
  {sprint:'S13',tasks:38,bugs:11,velocity:'78%',cycle:'2.6d',ai:81},
  {sprint:'S14',tasks:41,bugs:14,velocity:'87%',cycle:'2.3d',ai:88,current:true},
];
export const heatmapData = [2,3,4,3,2,1,0,1,3,3,4,3,0,1,2,4,3,4,2,1,0,1,2,3,3,2,0,1];
export const myTasks = [
  {title:'Fix auth middleware bug',project:'Backend API v2',desc:'Authentication tokens are expiring prematurely causing user logouts in production environment. Needs immediate hotfix.',due:'Today',priority:'Urgent',prColor:'#E24B4A',borderColor:'#E24B4A',assignedBy:'Raj M.',dueColor:'#E24B4A'},
  {title:'Finalize onboarding flow screens',project:'Mobile App Redesign',desc:'Complete the remaining 3 onboarding screens with animations and hand off to dev by end of sprint.',due:'Tomorrow',priority:'High',prColor:'#E24B4A',borderColor:'#BA7517',assignedBy:'Anika R.',dueColor:'#BA7517'},
  {title:'Write unit tests for payment module',project:'Backend API v2',desc:'Cover edge cases for failed transactions, refunds, and duplicate payment prevention.',due:'May 13',priority:'High',prColor:'#E24B4A',borderColor:'#BA7517',assignedBy:'Raj M.',dueColor:'#BA7517'},
  {title:'Review design system components',project:'Design System',desc:'Audit button states, form inputs, and modal components against new brand guidelines.',due:'May 14',priority:'Medium',prColor:'#BA7517',borderColor:'#534AB7',assignedBy:'Anika R.',dueColor:'#1D9E75'},
  {title:'Update API documentation',project:'Backend API v2',desc:'Document all new v2 endpoints with request/response examples and error codes.',due:'May 15',priority:'Medium',prColor:'#BA7517',borderColor:'#534AB7',assignedBy:'Raj M.',dueColor:'#1D9E75'},
  {title:'Q3 roadmap review preparation',project:'Q3 Analytics Dashboard',desc:'Prepare talking points and data slides for the Q3 planning session with stakeholders.',due:'May 15',priority:'Low',prColor:'#6B6B80',borderColor:'#534AB7',assignedBy:'Dev K.',dueColor:'#1D9E75'},
];
export const achievements = {
  unlocked:[
    {name:'Sprint Slayer',desc:'Completed an entire sprint with zero incomplete tasks',date:'May 1, 2026',cat:'Sprint',tier:'gold'},
    {name:'Bug Exterminator',desc:'Resolved 50+ bugs across all projects',date:'April 20, 2026',cat:'Tasks',tier:'gold'},
    {name:'Team Player',desc:'Collaborated on 5 different projects simultaneously',date:'April 15, 2026',cat:'Team',tier:'gold'},
    {name:'On Fire 🔥',desc:'Maintained a 10-day task completion streak',date:'May 5, 2026',cat:'Tasks',tier:'silver'},
    {name:'Velocity King',desc:'Achieved 90%+ team velocity in a sprint',date:'April 28, 2026',cat:'Sprint',tier:'silver'},
    {name:'Early Bird',desc:'Completed 20 tasks before their deadline',date:'April 10, 2026',cat:'Tasks',tier:'silver'},
    {name:'First Blood',desc:'Completed your very first task on Synapse',date:'March 1, 2026',cat:'Milestones',tier:'bronze'},
    {name:'Team Welcome',desc:'Joined your first project team',date:'March 1, 2026',cat:'Milestones',tier:'bronze'},
  ],
  locked:[
    {name:'Promoted 🚀',desc:'Receive a promotion or role upgrade',progress:'Role unchanged · Keep delivering',cat:'Milestones',tier:'gold',pct:0},
    {name:'Century',desc:'Complete 100 tasks in a single sprint cycle',progress:'41/100 tasks',cat:'Tasks',tier:'gold',pct:41},
    {name:'Zero Blockers',desc:'Run 3 consecutive sprints with zero blockers',progress:'1/3 sprints',cat:'Sprint',tier:'silver',pct:33},
    {name:'Mentor',desc:'Help resolve 10 blockers raised by teammates',progress:'6/10 blockers resolved',cat:'Team',tier:'silver',pct:60},
  ]
};
