import './style.css';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDggnqowSmLVVmc__QLTQDTit32zwDhPGE',
  authDomain: 'tweety-birds.firebaseapp.com',
  projectId: 'tweety-birds',
  storageBucket: 'tweety-birds.firebasestorage.app',
  messagingSenderId: '85095299029',
  appId: '1:85095299029:web:d054732b1a66f7caa22f5c',
  measurementId: 'G-3866ZTJRV3'
};
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const googleProvider = new GoogleAuthProvider();
let cloudReady = false;
let cloudUser = null;
let cloudSaveTimer = null;

async function startGoogleLogin() {
  await signInWithRedirect(auth, googleProvider);
}
async function loadCloudData(user) {
  const ref = doc(db, 'users', user.uid, 'aviary', 'main');
  const snap = await getDoc(ref);
  if (snap.exists() && snap.data().data) {
    data = { ...initial, ...snap.data().data };
  } else {
    // First login: migrate this browser's existing records to the user's private cloud document.
    await setDoc(ref, { data, updatedAt: new Date().toISOString(), owner: user.uid });
  }
  localStorage.setItem(STORE, JSON.stringify(data));
  cloudReady = true;
  render();
}


const STORE = 'tweety-birds-data-v1';
const today = () => new Date().toISOString().slice(0,10);
const fmt = d => d ? new Date(`${d}T00:00:00`).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '—';
const addDays = (date, days) => { const d = new Date(`${date}T00:00:00`); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10); };
const uid = () => Math.random().toString(36).slice(2,10);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const initial = {
  pairs: [
    {id:'p1',number:'C-01',name:'Yellow Fischer',male:'C-01M',female:'C-01F',status:'Breeding',rest:null},
    {id:'p2',number:'C-02',name:'Green Fischer',male:'C-02M',female:'C-02F',status:'Breeding',rest:null}
  ], eggs:[], babies:[], courses:[], transactions:[]
};
let data;
try { data = {...initial,...JSON.parse(localStorage.getItem(STORE) || '{}')}; } catch { data = structuredClone(initial); }
let page = 'Dashboard';
let selectedPair = data.pairs[0]?.id || '';
const save = () => {
  localStorage.setItem(STORE, JSON.stringify(data));
  if (cloudUser && cloudReady) {
    clearTimeout(cloudSaveTimer);
    cloudSaveTimer = setTimeout(async () => {
      try {
        await setDoc(doc(db, 'users', cloudUser.uid, 'aviary', 'main'), {
          data, owner: cloudUser.uid, updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error('Cloud save failed:', err);
        alert('Cloud save failed. Please check your internet connection and Firestore security rules.');
      }
    }, 500);
  }
};
const pairById = id => data.pairs.find(p=>p.id===id);
const pairLabel = id => { const p=pairById(id); return p ? `${p.number} · ${p.name}` : 'Unknown pair'; };
const pill = (label, type='neutral') => `<span class="pill ${type}">${esc(label)}</span>`;
const icon = name => ({Dashboard:'⌂','Pair Management':'♧','Egg Management':'◉','Baby Management':'♡','Courses & Medicine':'✚','Finance Management':'＄'}[name] || '•');
const nav = ['Dashboard','Pair Management','Egg Management','Baby Management','Courses & Medicine','Finance Management'];
function shell(){
 document.querySelector('#app').innerHTML = `<aside class="sidebar"><div class="brand"><div class="brand-mark">🐦</div><div><b>Tweety Birds</b><small>Aviary Manager</small></div></div><nav>${nav.map(n=>`<button class="nav-item ${page===n?'active':''}" data-page="${n}"><span>${icon(n)}</span>${n}</button>`).join('')}</nav><div class="side-note">Soft Sage · Teal · Warm White</div></aside><main class="main"><header class="topbar"><div><div class="eyebrow">AVIARY MANAGEMENT</div><h1>${page}</h1></div><div class="top-actions"><span class="today">${fmt(today())}</span><button class="avatar" id="sign-out" title="Sign out">↪</button></div></header><section id="content"></section><footer>Cloud-synced · Tweety Birds</footer></main>`;
 document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{page=b.dataset.page;render();});
}
function dashboard(){
 const expenses=data.transactions.filter(t=>t.type==='Expense').reduce((s,t)=>s+Number(t.amount||0),0), income=data.transactions.filter(t=>t.type==='Income').reduce((s,t)=>s+Number(t.amount||0),0);
 return `<div class="welcome"><div><div class="eyebrow">WELCOME BACK</div><h2>Your aviary at a glance</h2><p>Keep every pair, egg, baby and record organized.</p></div><div class="bird-art">🐤</div></div><div class="stats-grid"><div class="stat"><span>Active Pairs</span><b>${data.pairs.length}</b><small>Registered pairs</small></div><div class="stat"><span>Total Eggs</span><b>${data.eggs.length}</b><small>All recorded eggs</small></div><div class="stat"><span>Total Babies</span><b>${data.babies.length}</b><small>Baby directory</small></div><div class="stat"><span>Net Finance</span><b>${(income-expenses).toLocaleString()}</b><small>Income minus expenses</small></div></div><div class="section-head"><div><h3>Management Modules</h3><p>Choose a section to manage your records.</p></div></div><div class="module-grid">${nav.slice(1).map(n=>`<button class="module-card" data-page="${n}"><span class="module-icon">${icon(n)}</span><b>${n}</b><small>Open ${n.toLowerCase()}</small><span class="arrow">↗</span></button>`).join('')}</div><div class="panel"><div class="section-head"><div><h3>Pairs needing attention</h3><p>Current rest status for each pair</p></div></div>${data.pairs.length?data.pairs.map(p=>`<div class="list-row"><div><b>${esc(p.number)} · ${esc(p.name)}</b><small>${p.rest?`Rest: ${fmt(p.rest.start)} – ${fmt(p.rest.end)}`:'No active rest period'}</small></div>${pill(p.status,p.status==='Resting'?'warning':'success')}</div>`).join(''):'<div class="empty">No pairs added yet.</div>'}</div>`;
}
function pairsPage(){return `<div class="toolbar"><div><h2>Pair Directory</h2><p>Manage breeding pairs and each pair's latest rest record.</p></div><button class="primary" id="add-pair">＋ Add Pair</button></div><div class="pair-grid">${data.pairs.map(p=>`<article class="panel pair-card"><div class="pair-top"><div><span class="eyebrow">PAIR NUMBER</span><h3>${esc(p.number)}</h3></div>${pill(p.status,p.status==='Resting'?'warning':'success')}</div><h4>${esc(p.name)}</h4><div class="parent-line"><span>Male Parent</span><b>${esc(p.male||'Not added')}</b></div><div class="parent-line"><span>Female Parent</span><b>${esc(p.female||'Not added')}</b></div>${p.rest?`<div class="rest-box"><b>Latest Rest Record</b><div class="parent-line"><span>Start Date</span><b>${fmt(p.rest.start)}</b></div><div class="parent-line"><span>End Date</span><b>${fmt(p.rest.end)}</b></div><div class="parent-line"><span>Duration</span><b>20 Days</b></div>${p.status==='Resting'?`<div class="remaining">${Math.max(0,Math.ceil((new Date(p.rest.end+'T00:00:00')-new Date(today()+'T00:00:00'))/86400000))} days remaining</div>`:pill('Completed','success')}</div>`:`<div class="rest-box muted-box">No rest record yet</div>`}<div class="card-actions">${p.status==='Resting'?`<button class="primary" data-complete-rest="${p.id}">Start Breeding</button>`:`<button class="primary" data-rest="${p.id}">Give Rest · 20 Days</button>`}<button class="secondary" data-edit-pair="${p.id}">Edit Pair</button></div></article>`).join('')||'<div class="empty panel">No pairs yet. Add your first pair.</div>'}</div>`;}
function eggsPage(){return `<div class="toolbar"><div><h2>Egg Records</h2><p>Track laying dates and update each egg's status.</p></div><button class="primary" id="add-egg">＋ Add Egg</button></div><div class="panel"><div class="table-wrap"><table><thead><tr><th>Egg No.</th><th>Pair</th><th>Laying Date</th><th>Fertility Check</th><th>Status</th><th>Action</th></tr></thead><tbody>${data.eggs.map(e=>`<tr><td>${esc(e.number)}</td><td>${esc(pairLabel(e.pair))}</td><td>${fmt(e.date)}</td><td>${fmt(addDays(e.date,8))}</td><td><select data-egg-status="${e.id}">${['Pending','Fertile','Hatched','Infertile','Rotten','Damaged','Eaten/Lost'].map(s=>`<option ${e.status===s?'selected':''}>${s}</option>`).join('')}</select></td><td><button class="text-btn" data-delete-egg="${e.id}">Delete</button></td></tr>`).join('')||'<tr><td colspan="6" class="empty">No egg records yet.</td></tr>'}</tbody></table></div></div>`;}
function babiesPage(){return `<div class="toolbar"><div><h2>Baby Directory</h2><p>Ring numbers are assigned sequentially and are never reused.</p></div><button class="primary" id="add-baby">＋ Register Baby</button></div><div class="panel"><div class="table-wrap"><table><thead><tr><th>Ring Number</th><th>Source Pair</th><th>Male Parent</th><th>Female Parent</th><th>Gender</th><th>Ring Date</th></tr></thead><tbody>${data.babies.map(b=>`<tr><td><b>${esc(b.ring)}</b></td><td>${esc(pairLabel(b.pair))}</td><td>${esc(pairById(b.pair)?.male||'—')}</td><td>${esc(pairById(b.pair)?.female||'—')}</td><td><select data-baby-gender="${b.id}">${['Not Added','Male','Female'].map(s=>`<option ${b.gender===s?'selected':''}>${s}</option>`).join('')}</select></td><td>${fmt(b.date)}</td></tr>`).join('')||'<tr><td colspan="6" class="empty">No babies registered yet.</td></tr>'}</tbody></table></div></div>`;}
const courseTypes=['Deworming Course','Breeding Course','Canker Course'];
function coursesPage(){return `<div class="toolbar"><div><h2>Courses & Medicine</h2><p>Separate medicine schedules for each pair and course.</p></div><button class="primary" id="add-course">＋ Add Medicine Course</button></div><div class="course-grid">${data.pairs.flatMap(p=>courseTypes.map(type=>{const c=data.courses.find(x=>x.pair===p.id&&x.type===type);return `<article class="panel course-card"><div class="eyebrow">${esc(pairLabel(p.id))}</div><h3>${type}</h3>${c?`<div class="medicine-list">${c.medicines.map(m=>`<div class="medicine"><b>${esc(m.name)}</b><small>${m.days.length} day course</small>${m.days.map((d,i)=>`<label class="day-check"><input type="checkbox" data-med-check="${c.id}:${m.id}:${i}" ${d.done?'checked':''}/> Day ${i+1} ${d.done?`· ${fmt(d.date)}`:''}</label>`).join('')}</div>`).join('')}</div>${c.completed?pill('Completed','success'):`<button class="secondary full" data-complete-course="${c.id}">Complete Course</button>`}`:`<p class="muted">No medicines added.</p><button class="secondary full" data-new-course="${p.id}:${type}">Add Medicines</button>`}</article>`;})).join('')}</div>`;}
function financePage(){const inc=data.transactions.filter(t=>t.type==='Income').reduce((s,t)=>s+Number(t.amount),0),exp=data.transactions.filter(t=>t.type==='Expense').reduce((s,t)=>s+Number(t.amount),0);return `<div class="toolbar"><div><h2>Finance Overview</h2><p>Record income and expenses with your own names.</p></div><div class="button-row"><button class="primary" id="add-income">＋ Income</button><button class="secondary" id="add-expense">＋ Expense</button></div></div><div class="stats-grid finance-stats"><div class="stat"><span>Total Income</span><b class="income">${inc.toLocaleString()}</b></div><div class="stat"><span>Total Expenses</span><b class="expense">${exp.toLocaleString()}</b></div><div class="stat"><span>Net Profit / Loss</span><b>${(inc-exp).toLocaleString()}</b></div></div><div class="panel"><h3>Transaction History</h3><div class="table-wrap"><table><thead><tr><th>Date</th><th>Type</th><th>Name</th><th>Amount</th><th>Notes</th><th></th></tr></thead><tbody>${data.transactions.map(t=>`<tr><td>${fmt(t.date)}</td><td>${pill(t.type,t.type==='Income'?'success':'warning')}</td><td>${esc(t.name)}</td><td>${Number(t.amount).toLocaleString()}</td><td>${esc(t.notes||'—')}</td><td><button class="text-btn" data-delete-tx="${t.id}">Delete</button></td></tr>`).join('')||'<tr><td colspan="6" class="empty">No transactions recorded.</td></tr>'}</tbody></table></div></div>`;}
function render(){shell();const content=document.querySelector('#content');content.innerHTML=({Dashboard:dashboard,'Pair Management':pairsPage,'Egg Management':eggsPage,'Baby Management':babiesPage,'Courses & Medicine':coursesPage,'Finance Management':financePage}[page])();bind();}
function modal(title,body,onSave){const wrap=document.createElement('div');wrap.className='modal-backdrop';wrap.innerHTML=`<div class="modal"><div class="modal-head"><h3>${title}</h3><button class="close">×</button></div><form id="modal-form">${body}<div class="modal-actions"><button type="button" class="secondary close">Cancel</button><button class="primary" type="submit">Save</button></div></form></div>`;document.body.append(wrap);wrap.querySelectorAll('.close').forEach(b=>b.onclick=()=>wrap.remove());wrap.onclick=e=>{if(e.target===wrap)wrap.remove()};wrap.querySelector('form').onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target);onSave(fd);save();wrap.remove();render();};}
function bind(){
 document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{page=b.dataset.page;render()});
 const el=id=>document.getElementById(id);
 if(el('add-pair'))el('add-pair').onclick=()=>modal('Add Pair',`<label>Pair Name<input name="name" required placeholder="e.g. Yellow Fischer"></label><label>Male Parent ID<input name="male" placeholder="e.g. C-03M"></label><label>Female Parent ID<input name="female" placeholder="e.g. C-03F"></label>`,fd=>{const n=data.pairs.length+1,number=`C-${String(n).padStart(2,'0')}`;data.pairs.push({id:uid(),number,name:fd.get('name'),male:fd.get('male'),female:fd.get('female'),status:'Breeding',rest:null});});
 document.querySelectorAll('[data-rest]').forEach(b=>b.onclick=()=>{const p=pairById(b.dataset.rest);if(!confirm(`Give ${p.number} a 20-day rest?`))return;const start=today();p.rest={start,end:addDays(start,20),duration:20};p.status='Resting';save();render();});
 document.querySelectorAll('[data-complete-rest]').forEach(b=>b.onclick=()=>{const p=pairById(b.dataset.completeRest);if(!confirm('Start breeding again for this pair?'))return;p.status='Breeding';save();render();});
 document.querySelectorAll('[data-edit-pair]').forEach(b=>b.onclick=()=>{const p=pairById(b.dataset.editPair);modal('Edit Pair',`<label>Pair Name<input name="name" required value="${esc(p.name)}"></label><label>Male Parent ID<input name="male" value="${esc(p.male||'')}"></label><label>Female Parent ID<input name="female" value="${esc(p.female||'')}"></label>`,fd=>{p.name=fd.get('name');p.male=fd.get('male');p.female=fd.get('female');});});
 if(el('add-egg'))el('add-egg').onclick=()=>modal('Add Egg',`<label>Pair<select name="pair" required>${data.pairs.map(p=>`<option value="${p.id}">${esc(pairLabel(p.id))}</option>`).join('')}</select></label><label>Egg Number<input name="number" required placeholder="e.g. Egg 1"></label><label>Laying Date<input type="date" name="date" value="${today()}" required></label>`,fd=>data.eggs.push({id:uid(),pair:fd.get('pair'),number:fd.get('number'),date:fd.get('date'),status:'Pending'}));
 document.querySelectorAll('[data-egg-status]').forEach(s=>s.onchange=()=>{const e=data.eggs.find(x=>x.id===s.dataset.eggStatus);e.status=s.value;save()});document.querySelectorAll('[data-delete-egg]').forEach(b=>b.onclick=()=>{if(confirm('Delete this egg record?')){data.eggs=data.eggs.filter(x=>x.id!==b.dataset.deleteEgg);save();render()}});
 if(el('add-baby'))el('add-baby').onclick=()=>modal('Register Baby',`<label>Source Pair<select name="pair" required>${data.pairs.map(p=>`<option value="${p.id}">${esc(pairLabel(p.id))}</option>`).join('')}</select></label><label>Ring Fitting Date<input type="date" name="date" value="${today()}" required></label><label>Gender<select name="gender"><option>Not Added</option><option>Male</option><option>Female</option></select></label>`,fd=>{const max=data.babies.reduce((m,b)=>Math.max(m,Number((b.ring||'').replace('TB-',''))||0),0)+1;data.babies.push({id:uid(),ring:`TB-${String(max).padStart(2,'0')}`,pair:fd.get('pair'),date:fd.get('date'),gender:fd.get('gender')});});
 document.querySelectorAll('[data-baby-gender]').forEach(s=>s.onchange=()=>{const b=data.babies.find(x=>x.id===s.dataset.babyGender);b.gender=s.value;save()});
 if(el('add-course'))el('add-course').onclick=()=>modal('Add Medicine Course',`<label>Pair<select name="pair">${data.pairs.map(p=>`<option value="${p.id}">${esc(pairLabel(p.id))}</option>`).join('')}</select></label><label>Course Type<select name="type">${courseTypes.map(t=>`<option>${t}</option>`).join('')}</select></label><label>Medicine Name<input name="medicine" required placeholder="Medicine name"></label><label>Duration (Days)<input name="days" type="number" min="1" max="90" value="7" required></label>`,fd=>{let c=data.courses.find(x=>x.pair===fd.get('pair')&&x.type===fd.get('type'));if(!c){c={id:uid(),pair:fd.get('pair'),type:fd.get('type'),medicines:[],completed:false};data.courses.push(c);}const days=Array.from({length:Number(fd.get('days'))},()=>({done:false,date:''}));c.medicines.push({id:uid(),name:fd.get('medicine'),days});c.completed=false;});
 document.querySelectorAll('[data-new-course]').forEach(b=>b.onclick=()=>{const [pair,type]=b.dataset.newCourse.split(':');modal('Add Medicine',`<label>Medicine Name<input name="medicine" required></label><label>Duration (Days)<input name="days" type="number" min="1" max="90" value="7" required></label>`,fd=>{let c=data.courses.find(x=>x.pair===pair&&x.type===type);if(!c){c={id:uid(),pair,type,medicines:[],completed:false};data.courses.push(c);}c.medicines.push({id:uid(),name:fd.get('medicine'),days:Array.from({length:Number(fd.get('days'))},()=>({done:false,date:''}))});});});
 document.querySelectorAll('[data-med-check]').forEach(c=>c.onchange=()=>{const [cid,mid,index]=c.dataset.medCheck.split(':');const course=data.courses.find(x=>x.id===cid),med=course.medicines.find(x=>x.id===mid),day=med.days[Number(index)];day.done=c.checked;day.date=c.checked?today():'';course.completed=false;save();render()});
 document.querySelectorAll('[data-complete-course]').forEach(b=>b.onclick=()=>{const c=data.courses.find(x=>x.id===b.dataset.completeCourse);if(!c.medicines.every(m=>m.days.every(d=>d.done))){alert('Please complete every medicine day before completing this course.');return;}c.completed=true;save();render()});
 if(el('add-income'))el('add-income').onclick=()=>transactionModal('Income');if(el('add-expense'))el('add-expense').onclick=()=>transactionModal('Expense');
 document.querySelectorAll('[data-delete-tx]').forEach(b=>b.onclick=()=>{if(confirm('Delete this transaction?')){data.transactions=data.transactions.filter(t=>t.id!==b.dataset.deleteTx);save();render()}});
}
function transactionModal(type){const suggestions=[...new Set(data.transactions.filter(t=>t.type===type).map(t=>t.name))];modal(`Add ${type}`,`<label>Name<input name="name" list="name-suggestions" required placeholder="Name"><datalist id="name-suggestions">${suggestions.map(s=>`<option value="${esc(s)}">`).join('')}</datalist></label><label>Amount<input name="amount" type="number" min="0" step="0.01" required></label><label>Date<input name="date" type="date" value="${today()}" required></label><label>Notes (Optional)<textarea name="notes" rows="2"></textarea></label>`,fd=>data.transactions.push({id:uid(),type,name:fd.get('name'),amount:Number(fd.get('amount')),date:fd.get('date'),notes:fd.get('notes')}));}
function showLogin(message = '') {
  document.querySelector('#app').innerHTML = `<main style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#eef3ed"><section style="width:min(100%,420px);background:white;border-radius:20px;padding:28px;box-shadow:0 12px 40px #18352a18;text-align:center"><div style="font-size:48px">🐦</div><h1 style="margin:10px 0">Tweety Birds</h1><p style="color:#66736b">Sign in with your Google account to access your aviary records from any device.</p>${message ? `<p style="color:#b45309">${esc(message)}</p>` : ''}<button id="google-login" style="margin-top:16px;padding:13px 20px;border:0;border-radius:10px;background:#24765e;color:white;font-weight:700;width:100%">Continue with Google</button><p style="font-size:12px;color:#78847d;margin-top:18px">Your records are stored in your private Firebase account.</p></section></main>`;
  document.querySelector('#google-login').onclick = () => startGoogleLogin().catch(e => {
    console.error(e); showLogin('Google sign-in could not start. Check the authorized domains in Firebase Authentication settings.');
  });
}
document.addEventListener('click', e => {
  if (e.target.closest('#sign-out')) signOut(auth).catch(console.error);
});
getRedirectResult(auth).catch(err => console.error('Google sign-in redirect:', err));
onAuthStateChanged(auth, async user => {
  cloudUser = user;
  cloudReady = false;
  if (!user) {
    showLogin();
    return;
  }
  try {
    await loadCloudData(user);
  } catch (err) {
    console.error('Could not load cloud records:', err);
    showLogin('Could not load your cloud records. Check Firestore security rules and try again.');
  }
});
if('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('/sw.js').catch(()=>{});
