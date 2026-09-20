/* Sekreter renderer: 04-calendar.js */
// ── YARDIMCILAR ───────────────────────────────────────────────────
function sentenceCase(str){
  if(!str) return str;
  return str.charAt(0).toLocaleUpperCase('tr-TR')+str.slice(1);
}
// Kullanıcı verisini HTML'e basarken kaçış (XSS koruması)
function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function titleCase(str){
  if(!str) return str;
  return str.replace(/\S+/g, w=>w.charAt(0).toLocaleUpperCase('tr-TR')+w.slice(1).toLocaleLowerCase('tr-TR'));
}
function formatDate(s){if(!s)return'—';const d=new Date(s+'T12:00:00');return d.toLocaleDateString('tr-TR',{day:'2-digit',month:'short',year:'numeric'});}
function formatDateLong(s){if(!s)return'—';const d=new Date(s+'T12:00:00');return d.toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});}
function typeLabel(t,dal){
  if(t==='durusma'){
    const ozel={tahkim:'Tahkim',arabuluculuk:'Arabuluculuk',randevu:'Randevu',kesif:'Keşif',tevkil:'Tevkil',cmk:'CMK'};
    return ozel[dal]||'Duruşma';
  }
  return{sure:'Süreli İş',genel:'Genel İş',tekrar:'Tekrarlayan'}[t]||t;
}
function dalLabel(d){return{ceza:'Ceza',hukuk:'Hukuk',idare:'İdare',icra:'İcra',tahkim:'Tahkim'}[d]||'—';}
function tebligLabel(t){return{etebligat:'E-Tebligat',tefhim:'Tefhim',fiziki:'Fiziki tebligat'}[t]||t||'—';}
function getBaslik(r){return r.baslik||r.istipi||r.not||'—';}
function typeBadgeColor(t){return{durusma:'var(--blue-light)',sure:'var(--amber)',genel:'var(--green-light)'}[t]||'var(--border)';}
function typeTextColor(t){return{durusma:'var(--blue-dark)',sure:'var(--amber-dark)',genel:'var(--green-dark)'}[t]||'var(--text)';}
function renderAll(){renderDashboard();renderCal();renderTakvimArama();if(document.getElementById('view-liste').classList.contains('active'))renderListe();}

// ── DASHBOARD ─────────────────────────────────────────────────────
function gunKaldiLabel(dateStr, type){
  if(type==='genel') return '';
  const today=new Date();today.setHours(0,0,0,0);
  const d=new Date(dateStr+'T12:00:00');d.setHours(0,0,0,0);
  const diff=Math.round((d-today)/86400000);
  if(diff<0)return '';
  if(diff===0)return '<span style="background:#dc2626;color:#fff;border-radius:4px;padding:1px 7px;font-size:11px;font-weight:600;">Bugün</span>';
  if(diff<=3)return '<span style="background:#dc2626;color:#fff;border-radius:4px;padding:1px 7px;font-size:11px;font-weight:600;">'+diff+' gün kaldı</span>';
  return '<span style="background:#22c55e;color:#fff;border-radius:4px;padding:1px 7px;font-size:11px;font-weight:600;">'+diff+' gün kaldı</span>';
}
let _dashFilter = 'hepsi';
function filterDashboard(f){
  _dashFilter=f;
  // kart vurgusu
  document.querySelectorAll('.stat-card').forEach(x=>x.style.borderColor='');
  const map={hepsi:0,genel:1,sure:2,acil:3};
  if(map[f]!==undefined){
    const cards=document.querySelectorAll('.stat-card');
    if(cards[map[f]])cards[map[f]].style.borderColor='var(--navy)';
  }
  renderDashboard();
}
let _dashboardOdak='tum';
function dashboardOdakSec(tur){
  // Seçili karta tekrar basılırsa bütün bölümleri yeniden göster.
  _dashboardOdak=_dashboardOdak===tur?'tum':tur;
  dashboardOdakUygula();
}
function dashboardOdakUygula(){
  const bugunGoster=_dashboardOdak==='tum'||_dashboardOdak==='bugun';
  const gecikenGoster=_dashboardOdak==='tum'||_dashboardOdak==='geciken';
  const onDortGoster=_dashboardOdak==='tum'||_dashboardOdak==='14gun';
  const bugunTitle=document.getElementById('bugun-title');
  const bugunList=document.getElementById('bugun-list');
  const gecenTitle=document.getElementById('gecen-title');
  const gecenList=document.getElementById('gecen-list');
  const yaklasanTitle=document.getElementById('yaklasan-title');
  const yaklasanWrap=document.getElementById('yaklasan-wrap');
  if(bugunTitle) bugunTitle.style.display=bugunGoster?'block':'none';
  if(bugunList) bugunList.style.display=bugunGoster?'flex':'none';
  const gecikenVar=records.some(r=>{
    const bugun=new Date();bugun.setHours(0,0,0,0);
    const d=new Date(r.date+'T12:00:00');d.setHours(0,0,0,0);
    return d<bugun&&!r.tamamlandi&&(r.type==='sure'||r.type==='durusma')&&!r.tekrarAnaId;
  });
  if(gecenTitle) gecenTitle.style.display=gecikenGoster&&gecikenVar?'block':'none';
  if(gecenList) gecenList.style.display=gecikenGoster&&gecikenVar?'flex':'none';
  if(yaklasanTitle) yaklasanTitle.style.display=onDortGoster?'block':'none';
  if(yaklasanWrap) yaklasanWrap.style.display=onDortGoster?'':'none';
  document.querySelectorAll('.focus-card').forEach(kart=>kart.classList.toggle('active',kart.dataset.focus===_dashboardOdak));
}

function renderDashboard(){
  const today=new Date();today.setHours(0,0,0,0);
  const in14=new Date(today);in14.setDate(today.getDate()+14);
  const ms=new Date(today.getFullYear(),today.getMonth(),1);
  const me=new Date(today.getFullYear(),today.getMonth()+1,0);me.setHours(23,59,59);

  // İstatistikler - sadece bu ay
  const buAy=r=>{const d=new Date(r.date+'T12:00:00');return d>=ms&&d<=me;};
  document.getElementById('stat-total').textContent=records.filter(buAy).length;
  document.getElementById('stat-genel').textContent=records.filter(r=>r.type==='genel'&&!r.tekrarAnaId&&buAy(r)).length;
  document.getElementById('stat-durusma').textContent=records.filter(r=>r.type==='durusma'&&buAy(r)).length;
  document.getElementById('stat-sure').textContent=records.filter(r=>r.type==='sure'&&buAy(r)).length;
  document.getElementById('stat-tekrar').textContent=records.filter(r=>r.tekrarTipi&&!r.tekrarAnaId&&buAy(r)).length;
  const aktifKayitlar=records.filter(r=>!r.tamamlandi&&!r.tekrarAnaId);
  const bugunList=aktifKayitlar.filter(r=>{
    const d=new Date(r.date+'T12:00:00');d.setHours(0,0,0,0);
    return d.getTime()===today.getTime();
  }).sort((a,b)=>(a.saat||'99:99').localeCompare(b.saat||'99:99'));
  const onDortGun=aktifKayitlar.filter(r=>{
    const d=new Date(r.date+'T12:00:00');d.setHours(0,0,0,0);
    return d>=today&&d<=in14;
  }).sort((a,b)=>new Date(a.date)-new Date(b.date));
  const urgents=records.filter(r=>{const d=new Date(r.date+'T12:00:00');d.setHours(0,0,0,0);return r.type==='sure'&&d>=today&&d<=in14&&!r.tekrarAnaId;}).sort((a,b)=>new Date(a.date)-new Date(b.date));
  // acil kart kaldırıldı

  // Süresi geçen tamamlanmayan işler
  const gecenList=records.filter(r=>{
    const d=new Date(r.date+'T12:00:00');d.setHours(0,0,0,0);
    return d<today&&!r.tamamlandi&&(r.type==='sure'||r.type==='durusma')&&!r.tekrarAnaId;
  }).sort((a,b)=>new Date(b.date)-new Date(a.date));
  document.getElementById('focus-bugun').textContent=bugunList.length;
  document.getElementById('focus-geciken').textContent=gecenList.length;
  document.getElementById('focus-14gun').textContent=onDortGun.length;

  const bugunEl=document.getElementById('bugun-list');
  bugunEl.innerHTML=bugunList.length?bugunList.map(r=>`<div class="urgent-item" style="border-left-color:#3b82f6;" onclick="openKayitModal(${r.id})">
    <div><div class="u-title">${esc(getBaslik(r))}</div><div class="u-sub">${r.saat?'⏰ '+esc(r.saat)+' · ':''}${r.muvekkil?esc(r.muvekkil):'Müvekkil belirtilmedi'}${r.mahkeme?' · '+esc(r.mahkeme):''}</div></div>
    <span class="badge badge-${r.type==='tekrar'?'tekrar-type':r.type}">${esc(typeLabel(r.type,r.dal))}</span>
  </div>`).join(''):'<div class="empty-state" style="padding:16px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);">Bugün için açık kayıt yok.</div>';
  const gecenEl=document.getElementById('gecen-list');
  const gecenTitle=document.getElementById('gecen-title');
  if(gecenList.length){
    gecenTitle.style.display='block';
    gecenEl.style.display='flex';
    gecenEl.innerHTML=gecenList.map(r=>{
      const d=new Date(r.date+'T12:00:00');d.setHours(0,0,0,0);
      const diff=Math.abs(Math.round((d-today)/86400000));
      return`<div class="urgent-item" style="border-left-color:#f59e0b;" onclick="openKayitModal(${r.id})">
        <div>
          <div class="u-title">${r.muvekkil?esc(r.muvekkil):'Müvekkil belirtilmedi'} — ${esc(getBaslik(r))}</div>
          <div class="u-sub">${esc(r.dava)} ${r.dal?'· '+dalLabel(r.dal):''}</div>
        </div>
        <div class="urgent-days" style="color:#f59e0b;">${diff===0?'Bugün':diff+' gün geçti'}</div>
      </div>`;
    }).join('');
  } else {
    gecenTitle.style.display='none';
    gecenEl.style.display='none';
  }

  // Acil süreler kaldırıldı

  // Kart vurgusu
  document.querySelectorAll('.stat-card').forEach(x=>x.style.cssText='');
  const cardIdx={hepsi:0,genel:1,durusma:2,sure:3,tekrar:4};
  const cards=document.querySelectorAll('.stat-card');
  if(cardIdx[_dashFilter]!==undefined&&cards[cardIdx[_dashFilter]]){
    cards[cardIdx[_dashFilter]].style.borderColor='var(--navy)';
    cards[cardIdx[_dashFilter]].style.background='var(--navy-light)';
  }

  // Yaklaşan kayıtlar - filtre
  let upcoming=[];
  const buAyFilter=r=>{const d=new Date(r.date+'T12:00:00');return d>=ms&&d<=me;};
  if(_dashFilter==='hepsi'){
    upcoming=records.filter(r=>buAyFilter(r)&&!r.tamamlandi&&!r.tekrarAnaId).sort((a,b)=>new Date(a.date)-new Date(b.date));
  } else if(_dashFilter==='genel'){
    upcoming=records.filter(r=>r.type==='genel'&&buAyFilter(r)&&!r.tekrarAnaId).sort((a,b)=>new Date(a.date)-new Date(b.date));
  } else if(_dashFilter==='sure'){
    upcoming=records.filter(r=>r.type==='sure'&&buAyFilter(r)).sort((a,b)=>new Date(a.date)-new Date(b.date));
  } else if(_dashFilter==='durusma'){
    upcoming=records.filter(r=>r.type==='durusma'&&buAyFilter(r)).sort((a,b)=>new Date(a.date)-new Date(b.date));
  } else if(_dashFilter==='tekrar'){
    upcoming=records.filter(r=>(r.tekrarTipi||r.tekrarAnaId)&&buAyFilter(r)).sort((a,b)=>new Date(a.date)-new Date(b.date));
  } else if(_dashFilter==='acil'){
    upcoming=urgents;
  }

  // Başlık güncelle
  const titles={hepsi:'Bu Aydaki Tüm İşler',genel:'Bu Aydaki Genel İşler',durusma:'Bu Aydaki Duruşma / Randevular',sure:'Bu Aydaki Süreli İşler',tekrar:'Bu Aydaki Tekrarlayan İşler',acil:'Acil Süreler (7 Gün)'};
  const yt=document.getElementById('yaklasan-title');
  if(yt) yt.innerHTML=(_dashFilter==='hepsi'||_dashFilter===undefined?'Yaklaşan Kayıtlar <span style="font-weight:400;text-transform:none;letter-spacing:0;">(Önümüzdeki 14 Gün)</span>':titles[_dashFilter]);

  // Yaklaşan 7 gün - filtre seçili değilse önümüzdeki 7 gün sure/durusma/tekrar
  let weekly=_dashFilter==='hepsi'?[
    ...records.filter(r=>{
      const d=new Date(r.date+'T12:00:00');d.setHours(0,0,0,0);
      return d>=today&&d<=in14&&!r.tamamlandi&&!r.tekrarAnaId&&(r.type==='sure'||r.type==='durusma'||r.type==='tekrar'||r.type==='genel');
    })
  ].sort((a,b)=>new Date(a.date)-new Date(b.date)):upcoming;

  const displayList=_dashFilter==='hepsi'?weekly:upcoming;

  const tb=document.getElementById('upcoming-tbody');
  if(!displayList.length){tb.innerHTML='<tr><td colspan="6" style="text-align:center;color:var(--text3);padding:18px;">Kayıt yok</td></tr>';dashboardOdakUygula();return;}
  let lastDate='';
  tb.innerHTML=displayList.map(r=>{
    const lbl=gunKaldiLabel(r.date,r.type);
    let dateHeader='';
    if(r.date!==lastDate){
      lastDate=r.date;
      const today=new Date();today.setHours(0,0,0,0);
      const d=new Date(r.date+'T12:00:00');d.setHours(0,0,0,0);
      const diff=Math.round((d-today)/86400000);
      const dayLabel=diff===0?'Bugün':diff===1?'Yarın':diff===-1?'Dün':formatDate(r.date);
      dateHeader=`<tr><td colspan="6" style="padding:10px 13px 5px;background:var(--surface2);border-bottom:2px solid var(--border);border-top:1px solid var(--border);"><span style="font-size:12px;font-weight:700;color:var(--navy);">${dayLabel}</span><span style="font-size:11px;color:var(--text3);margin-left:6px;">${diff===0||diff===1||diff===-1?formatDate(r.date):''}</span></td></tr>`;
    }
    return dateHeader+`<tr onclick="openKayitModal(${r.id})" style="cursor:pointer;${r.tamamlandi?'opacity:0.5;':''}">
      <td>${r.saat?'<span style="font-weight:600;color:var(--navy);">⏰ '+r.saat+'</span><br>':''}<span style="font-size:11px;">${lbl}</span></td>
      <td style="${r.tamamlandi?'text-decoration:line-through;color:var(--text3);':''}">${r.tamamlandi?'✓ ':''}${getBaslik(r)}</td>
      <td style="padding:0;">${r.muvekkil?`<span class='mv-link' onclick='event.stopPropagation();openMuvekkilModal(${JSON.stringify(r.muvekkil)})' style="display:block;padding:9px 13px;cursor:pointer;">${esc(r.muvekkil)}</span>`:'<span style="padding:9px 13px;display:block;">—</span>'}</td>
      <td><span class="badge badge-${r.type==='tekrar'?'tekrar-type':r.type}">${typeLabel(r.type,r.dal)}</span></td>
      <td>${dalLabel(r.dal)}</td>
      <td><div class="action-btns">
        <button class="icon-btn share-card-btn" onclick="event.stopPropagation();shareKayitCard(${r.id})">📤 Paylaş</button>
        <button class="icon-btn" onclick="event.stopPropagation();openModal(records.find(x=>x.id===${r.id}))">Düzenle</button>
        
        <button class="icon-btn del" onclick="event.stopPropagation();deleteRecord(${r.id})">Sil</button>
      </div></td>
    </tr>`;
  }).join('');
  dashboardOdakUygula();
}

// ── TAKVİM ────────────────────────────────────────────────────────
// ── RESMİ TATİLLER ───────────────────────────────────────────────
// Fallback - API çalışmazsa kullanılır
const TATILLER_FALLBACK = {
  "01-01": "Yılbaşı",
  "04-23": "Ulusal Egemenlik ve Çocuk Bayramı",
  "05-01": "Emek ve Dayanışma Günü",
  "05-19": "Atatürk'ü Anma, Gençlik ve Spor Bayramı",
  "07-15": "Demokrasi ve Millî Birlik Günü",
  "08-30": "Zafer Bayramı",
  "10-29": "Cumhuriyet Bayramı",
  "2026-03-19":"Ramazan Bayramı Arifesi","2026-03-20":"Ramazan Bayramı 1. Günü","2026-03-21":"Ramazan Bayramı 2. Günü","2026-03-22":"Ramazan Bayramı 3. Günü",
  "2026-05-26":"Kurban Bayramı Arifesi","2026-05-27":"Kurban Bayramı 1. Günü","2026-05-28":"Kurban Bayramı 2. Günü","2026-05-29":"Kurban Bayramı 3. Günü","2026-05-30":"Kurban Bayramı 4. Günü",
  "2027-03-08":"Ramazan Bayramı Arifesi","2027-03-09":"Ramazan Bayramı 1. Günü","2027-03-10":"Ramazan Bayramı 2. Günü","2027-03-11":"Ramazan Bayramı 3. Günü",
  "2027-05-15":"Kurban Bayramı Arifesi","2027-05-16":"Kurban Bayramı 1. Günü","2027-05-17":"Kurban Bayramı 2. Günü","2027-05-18":"Kurban Bayramı 3. Günü","2027-05-19":"Kurban Bayramı 4. Günü",
};
let TATILLER_API = {}; // API'den yüklenen tatiller

async function tatilleriYukle(){
  const buYil = new Date().getFullYear();
  for(const yil of [buYil, buYil+1]){
    try{
      const res = await fetch('https://date.nager.at/api/v3/PublicHolidays/'+yil+'/TR');
      if(!res.ok) continue;
      const data = await res.json();
      data.forEach(t=>{
        TATILLER_API[t.date] = t.localName;
      });
    }catch(e){}
  }
  renderCal(); // tatiller yüklenince takvimi yenile
}


function getTatil(dateStr){
  if(!dateStr) return null;
  // API'den gelen tatiller
  if(TATILLER_API[dateStr]) return TATILLER_API[dateStr];
  // Fallback: tam tarih
  if(TATILLER_FALLBACK[dateStr]) return TATILLER_FALLBACK[dateStr];
  // Fallback: ay-gün (sabit tatiller)
  const md = dateStr.slice(5);
  if(TATILLER_FALLBACK[md]) return TATILLER_FALLBACK[md];
  return null;
}

// ── SÜRÜKLEME (mouse events) ──────────────────────────────────────
let _drag = {active:false, recId:null, ghost:null, startX:0, startY:0};

function calDragStart(e, id){
  if(e.button !== 0) return;
  _drag.recId = id;
  _drag.startX = e.clientX;
  _drag.startY = e.clientY;
  _drag.active = false;

  const ghost = document.createElement('div');
  const rec = records.find(r=>r.id===id);
  ghost.textContent = rec ? (rec.muvekkil||getBaslik(rec)) : '';
  ghost.style.cssText = 'position:fixed;padding:6px 12px;background:var(--navy);color:#fff;border-radius:8px;font-size:12px;pointer-events:none;z-index:9999;opacity:0;transition:opacity .1s;max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
  document.body.appendChild(ghost);
  _drag.ghost = ghost;

  document.addEventListener('mousemove', calMouseMove);
  document.addEventListener('mouseup', calMouseUp);
  e.preventDefault();
}

function calMouseMove(e){
  if(!_drag.recId) return;
  const dx = Math.abs(e.clientX - _drag.startX);
  const dy = Math.abs(e.clientY - _drag.startY);
  if(!_drag.active && (dx > 5 || dy > 5)){
    _drag.active = true;
    _drag.ghost.style.opacity = '0.95';
  }
  if(_drag.active && _drag.ghost){
    _drag.ghost.style.left = (e.clientX + 12) + 'px';
    _drag.ghost.style.top = (e.clientY - 16) + 'px';
    document.querySelectorAll('.cal-cell.drag-over').forEach(x=>x.classList.remove('drag-over'));
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const cell = el && el.closest('.cal-cell');
    if(cell && cell.dataset.date) cell.classList.add('drag-over');
  }
}

async function calMouseUp(e){
  document.removeEventListener('mousemove', calMouseMove);
  document.removeEventListener('mouseup', calMouseUp);
  document.querySelectorAll('.cal-cell.drag-over').forEach(x=>x.classList.remove('drag-over'));
  if(_drag.ghost){ _drag.ghost.remove(); _drag.ghost = null; }

  if(_drag.active && _drag.recId){
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const cell = el && el.closest('.cal-cell');
    const dateStr = cell && cell.dataset.date;
    if(dateStr){
      const rec = records.find(r=>r.id===_drag.recId);
      if(rec && rec.date !== dateStr){
        if(rec.tekrarAnaId){ alert('Otomatik tekrar kayıtları taşınamaz.'); }
        else {
          const{error} = await sb.from('kayitlar').update({date:dateStr}).eq('id',_drag.recId);
          if(error) alert('Taşıma hatası: '+error.message);
          else await loadRecords();
        }
      }
    }
  }
  _drag = {active:false, recId:null, ghost:null, startX:0, startY:0};
}

// ── TAKVİM SWIPE ─────────────────────────────────────────────────
let _calTouchX=0;
function calTouchStart(e){_calTouchX=e.touches[0].clientX;}
function calTouchEnd(e){
  const dx=e.changedTouches[0].clientX-_calTouchX;
  if(Math.abs(dx)>50){changeCalendar(dx<0?1:-1);}
}
function changeMonth(dir){currentMonth+=dir;if(currentMonth>11){currentMonth=0;currentYear++;}if(currentMonth<0){currentMonth=11;currentYear--;}renderCal();}
function changeCalendar(dir){
  if(calendarView==='month'){
    changeMonth(dir);
    calendarCursor=new Date(currentYear,currentMonth,1);
  }else{
    calendarCursor=new Date(calendarCursor);
    calendarCursor.setDate(calendarCursor.getDate()+dir*7);
    currentMonth=calendarCursor.getMonth();currentYear=calendarCursor.getFullYear();
    renderCal();
  }
}
function setCalendarView(view){
  calendarView=view==='week'?'week':'month';
  if(calendarView==='month'){
    currentMonth=calendarCursor.getMonth();currentYear=calendarCursor.getFullYear();
  }else{
    calendarCursor=new Date(currentYear,currentMonth,Math.min(calendarCursor.getDate(),new Date(currentYear,currentMonth+1,0).getDate()));
  }
  renderCal();
}
function takvimBuguneGit(){
  calendarCursor=new Date();currentMonth=calendarCursor.getMonth();currentYear=calendarCursor.getFullYear();renderCal();
}

function clearTakvimArama(){
  const inp=document.getElementById('cal-search');
  if(inp) inp.value='';
  renderTakvimArama();
}

function renderTakvimArama(){
  const inp=document.getElementById('cal-search');
  const box=document.getElementById('cal-search-results');
  if(!inp||!box) return;
  const q=(inp.value||'').trim().toLowerCase();
  if(!q){box.classList.remove('show');box.innerHTML='';return;}
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const bugun=new Date();bugun.setHours(0,0,0,0);
  let sonuc=records.filter(r=>{
    const metin=[getBaslik(r),r.muvekkil,r.mahkeme,r.dava,r.not,typeLabel(r.type,r.dal),dalLabel(r.dal)].join(' ').toLowerCase();
    return metin.includes(q);
  }).sort((a,b)=>{
    const da=new Date((a.date||'')+'T12:00:00'), db=new Date((b.date||'')+'T12:00:00');
    const ag=(!a.tamamlandi&&da>=bugun)?0:1, bg=(!b.tamamlandi&&db>=bugun)?0:1;
    if(ag!==bg) return ag-bg;
    return ag===0 ? da-db : db-da;
  });
  if(!sonuc.length){
    box.classList.add('show');
    box.innerHTML='<div class="cal-search-head"><span>Arama sonucu</span><button class="icon-btn" onclick="clearTakvimArama()">Temizle</button></div><div style="padding:16px;text-align:center;color:var(--text3);font-size:13px;">Kayıt bulunamadı</div>';
    return;
  }
  const rows=sonuc.slice(0,30).map(r=>{
    const muvekkil=r.muvekkil?`<span class="mv-link" onclick='event.stopPropagation();openMuvekkilModal(${JSON.stringify(r.muvekkil)})'>${esc(r.muvekkil)}</span>`:'—';
    const dava=r.dava?` · <span class="mv-link" onclick='event.stopPropagation();openDosyaModal(${JSON.stringify(r.dava)})'>${esc(r.dava)}</span>`:'';
    const durum=r.tamamlandi?' · ✓ tamamlandı':(new Date((r.date||'')+'T12:00:00')<bugun?' · geçmiş':'');
    return `<div class="cal-search-item" onclick="showCalDetail('${r.date}',${r.id})">
      <div class="cal-search-date">${formatDate(r.date)}${r.saat?'<br>'+esc(r.saat):''}</div>
      <div style="min-width:0;">
        <div class="cal-search-title">${esc(getBaslik(r))}</div>
        <div class="cal-search-sub">${muvekkil}${r.mahkeme?' · '+esc(r.mahkeme):''}${dava}${durum}</div>
      </div>
      <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
        <button class="icon-btn share-card-btn" onclick="event.stopPropagation();shareKayitCard(${r.id})" title="Kart olarak paylaş">📤</button>
        <span class="badge badge-${r.type==='tekrar'?'tekrar-type':r.type}">${typeLabel(r.type,r.dal)}</span>
      </div>
    </div>`;
  }).join('');
  box.classList.add('show');
  box.innerHTML=`<div class="cal-search-head"><span>${sonuc.length} kayıt bulundu</span><button class="icon-btn" onclick="clearTakvimArama()">Temizle</button></div>${rows}${sonuc.length>30?'<div style="padding:8px 12px;font-size:11px;color:var(--text3);text-align:center;">İlk 30 sonuç gösteriliyor.</div>':''}`;
}

function renderCal(){
  const months=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  const tarihAnahtari=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const today=new Date();today.setHours(0,0,0,0);
  let cells=[];
  if(calendarView==='week'){
    const baslangic=new Date(calendarCursor);baslangic.setHours(0,0,0,0);
    const gun=baslangic.getDay()||7;baslangic.setDate(baslangic.getDate()-gun+1);
    for(let i=0;i<7;i++){
      const dt=new Date(baslangic);dt.setDate(baslangic.getDate()+i);
      cells.push({day:dt.getDate(),other:false,date:tarihAnahtari(dt),isToday:dt.getTime()===today.getTime()});
    }
    const bitis=new Date(baslangic);bitis.setDate(baslangic.getDate()+6);
    document.getElementById('cal-month-label').textContent=`${baslangic.getDate()} ${months[baslangic.getMonth()]} – ${bitis.getDate()} ${months[bitis.getMonth()]} ${bitis.getFullYear()}`;
  }else{
    document.getElementById('cal-month-label').textContent=months[currentMonth]+' '+currentYear;
    const fd=new Date(currentYear,currentMonth,1);let sdow=fd.getDay();if(sdow===0)sdow=7;
    const dim=new Date(currentYear,currentMonth+1,0).getDate(),dip=new Date(currentYear,currentMonth,0).getDate();
    for(let i=sdow-1;i>0;i--){
      const prevDate=new Date(currentYear,currentMonth,1-i);
      cells.push({day:dip-i+1,other:true,date:tarihAnahtari(prevDate)});
    }
    for(let d=1;d<=dim;d++){const dt=new Date(currentYear,currentMonth,d);dt.setHours(0,0,0,0);cells.push({day:d,other:false,date:tarihAnahtari(dt),isToday:dt.getTime()===today.getTime()});}
    let nextDay=1;
    while(cells.length%7!==0){
      const nextDate=new Date(currentYear,currentMonth+1,nextDay);
      cells.push({day:nextDay,other:true,date:tarihAnahtari(nextDate)});
      nextDay++;
    }
  }
  document.getElementById('cal-view-month').classList.toggle('active',calendarView==='month');
  document.getElementById('cal-view-week').classList.toggle('active',calendarView==='week');
  const grid=document.getElementById('cal-grid');
  grid.classList.toggle('week-view',calendarView==='week');
  grid.innerHTML=cells.map(c=>{
    const evs=c.date?records.filter(r=>r.date===c.date).sort((a,b)=>{
    // Tamamlananlar sona
    if(a.tamamlandi!==b.tamamlandi) return a.tamamlandi?1:-1;
    const order={sure:0,durusma:1,tekrar:2,genel:3};
    return (order[a.type]??9)-(order[b.type]??9);
  }):[];
    const gorunenSinir=calendarView==='week'?20:3;
    const eh=evs.slice(0,gorunenSinir).map(r=>{
    let cls=r.tamamlandi?'ev-tamamlandi':(r.type==='tekrar'||r.tekrarAnaId)?'ev-tekrar':('ev-'+r.type);
    let prefix=r.tamamlandi?'✓ ':(r.tekrarTipi||r.tekrarAnaId)?'↻ ':'';
    return`<span class="cal-event ${cls}" onmousedown="calDragStart(event,${r.id})" onclick="event.stopPropagation();openKayitModal(${r.id})" style="cursor:pointer;">${prefix}${esc(r.muvekkil||getBaslik(r))}</span>`;
  }).join('')+(evs.length>gorunenSinir?`<span style="font-size:11px;color:var(--navy);font-weight:700;display:block;cursor:pointer;padding:1px 3px;border-radius:3px;background:var(--navy-light);" onclick="event.stopPropagation();showCalDetail('${c.date}')">+${evs.length-gorunenSinir} daha</span>`:'');
    const tatil=c.date?getTatil(c.date):null;
    const clickAttr=c.date?`onclick="showCalDetail('${c.date}')" data-date="${c.date}"`:'' ;
    const tatilHTML=tatil?`<div style="font-size:8px;color:#dc2626;font-weight:600;line-height:1.2;margin-bottom:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${tatil}</div>`:'';
    const dayStyle=tatil?'color:#dc2626;font-weight:700;':'';
    return`<div class="cal-cell${c.other?' other-month':''}${c.isToday?' today':''}" ${clickAttr}><div class="cal-day" style="${dayStyle}">${c.other&&!c.day?'':c.day}</div>${tatilHTML}${eh}</div>`;
  }).join('');
}

// ── TAKVİM DETAY PANELİ ───────────────────────────────────────────
let _calDetailDate=null,_calDetailExpanded=null;

function showCalDetail(dateStr, expandId){
  _calDetailDate=dateStr;
  _calDetailExpanded=expandId||null;
  const tatilBilgi=getTatil(dateStr);
  document.getElementById('cal-detail-date').textContent=formatDateLong(dateStr)+(tatilBilgi?' — '+tatilBilgi:'');
  if(tatilBilgi){document.getElementById('cal-detail-date').style.color='#dc2626';}
  else{document.getElementById('cal-detail-date').style.color='';}
  renderCalDetail();
  document.getElementById('cal-detail-overlay').classList.add('open');
  setTimeout(()=>document.getElementById('cal-detail-panel').classList.add('open'),10);
}

function renderCalDetail(){
  const dateStr=_calDetailDate;
  const evs=records.filter(r=>r.date===dateStr).sort((a,b)=>{
    // Tamamlananlar sona
    if(a.tamamlandi!==b.tamamlandi) return a.tamamlandi?1:-1;
    const order={sure:0,durusma:1,tekrar:2,genel:3};
    const oa=order[a.type]??9, ob=order[b.type]??9;
    if(oa!==ob) return oa-ob;
    // Aynı tipteyse saate göre sırala
    if(a.saat&&b.saat) return a.saat.localeCompare(b.saat);
    if(a.saat) return -1;
    if(b.saat) return 1;
    return 0;
  });
  const container=document.getElementById('cal-detail-items');
  if(!evs.length){
    container.innerHTML=`<div class="cal-detail-empty">Bu tarihte kayıt yok.</div><button class="cal-add-btn" onclick="closeCalDetail();openModal(null,'${dateStr}')">+ Bu Tarihe Kayıt Ekle</button>`;
    return;
  }
  const typeDot={sure:'#ef4444',durusma:'#3b82f6',genel:'#22c55e',tekrar:'#f59e0b'};
  let html=evs.map(r=>{
    const dot=typeDot[r.type]||'#9aa0ac';
    const tStyle=r.tamamlandi?'opacity:0.5;':'';
    const d=r.hesapDetay;
    let detHTML='';
    if(r.type==='sure'&&d) detHTML=`<div style="margin-top:8px;border-radius:8px;overflow:hidden;border:1px solid var(--border);">${buildHesapHTML(d)}</div>`;
    return `<div style="border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;margin-bottom:10px;${tStyle}">
      <div style="padding:12px 14px;background:var(--surface2);display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--border);">
        <div style="width:10px;height:10px;border-radius:50%;background:${dot};flex-shrink:0;"></div>
        <span class="badge badge-${r.type==='tekrar'?'tekrar-type':r.type}" style="font-size:11px;">${typeLabel(r.type,r.dal)}</span>
        ${r.dal?`<span style="font-size:11px;color:var(--text2);">${dalLabel(r.dal)}</span>`:''}
        ${r.saat?`<span style="font-size:12px;font-weight:600;color:var(--navy);">⏰ ${esc(r.saat)}</span>`:''}
      </div>
      <div style="padding:12px 14px;">
        <div style="font-size:15px;font-weight:600;margin-bottom:8px;cursor:pointer;" onclick="openKayitModal(${r.id})">${r.tamamlandi?'✓ ':''}${esc(getBaslik(r))} <span style="font-size:11px;color:var(--navy);">· Detay ve dosya akışı ›</span></div>
        ${r.muvekkil?`<div style="font-size:13px;color:var(--text2);margin-bottom:4px;"><b>Müvekkil:</b> ${String(r.muvekkil).split(',').map(ad=>ad.trim()).filter(Boolean).map(ad=>`<span class="mv-link" style="margin-right:7px;" onclick='event.stopPropagation();openMuvekkilModal(${JSON.stringify(ad)})'>${esc(ad)} ›</span>`).join('')}</div>`:''}
        ${r.mahkeme?`<div style="font-size:13px;color:var(--text2);margin-bottom:4px;"><b>Mahkeme:</b> ${esc(r.mahkeme)}</div>`:''}
        ${r.dava?`<div style="font-size:13px;color:var(--text2);margin-bottom:4px;"><b>Dava No:</b> <span class="mv-link" onclick="takvimdenDosyaAc(${r.id})">${esc(r.dava)} ›</span></div>`:''}
        ${r.not?`<div style="font-size:13px;color:var(--text2);margin-bottom:4px;"><b>Not:</b> ${r.not.split('\n').map(s=>{const es=esc(s);return s.includes('tarihinde oluşturuldu')&&s.includes('Planlandığı tarih')?'<strong>'+es+'</strong>':es;}).join('<br>')}</div>`:''}
        ${detHTML}
        ${r.tekrarTipi?`<div style="margin-top:8px;padding:5px 10px;background:#fef3c7;border-radius:6px;font-size:11px;color:#92400e;display:flex;justify-content:space-between;">
          <span>↻ ${tekrarTipiLabel(r.tekrarTipi)}${r.tekrarBitis?' · Bitiş: '+formatDate(r.tekrarBitis):''}</span>
          <button style="background:none;border:none;cursor:pointer;color:#dc2626;font-size:11px;font-family:inherit;" onclick="deleteTekrarHepsi(${r.id})">Tümünü sil</button>
        </div>`:''}
        ${r.tekrarAnaId?`<div style="margin-top:8px;padding:5px 10px;background:#fef3c7;border-radius:6px;font-size:11px;color:#92400e;">↻ Tekrarlayan iş</div>`:''}
        <div style="display:flex;gap:7px;margin-top:12px;padding-top:10px;border-top:1px solid var(--border);">
          ${r.type==='durusma'&&!r.tamamlandi?`<button class="icon-btn" style="background:#1e40af;color:#fff;border-color:#1e40af;font-weight:600;" onclick="closeCalDetail();openDurusmaSonuc(${r.id})">📋 Sonuç Gir</button>`:''}
          ${r.type==='genel'&&!r.tamamlandi&&(r.baslik||'').toLocaleLowerCase('tr-TR').includes('duruşma tarihi')?`<button class="icon-btn" style="background:#1e40af;color:#fff;border-color:#1e40af;font-weight:600;" onclick="closeCalDetail();setTimeout(()=>{openKayitModal(${r.id});setTimeout(()=>durusmaTarihiGir(${r.id}),150);},100)">📅 Duruşma Tarihi Gir</button>`:''}
          <button class="icon-btn share-card-btn" onclick="shareKayitCard(${r.id})">📤 Paylaş</button>
          <button class="icon-btn" style="${r.tamamlandi?'color:#22c55e;border-color:#22c55e;font-weight:600;':''}" onclick="toggleTamamlandi(${r.id})">${r.tamamlandi?'↩ Geri Al':'○ Tamamlandı'}</button>
          <button class="icon-btn" onclick="closeCalDetail();openModal(records.find(x=>x.id===${r.id}))">Düzenle</button>
          
          <button class="icon-btn del" onclick="deleteRecord(${r.id})">Sil</button>
        </div>
      </div>
    </div>`;
  }).join('');
  html+=`<button class="cal-add-btn" onclick="closeCalDetail();openModal(null,'${dateStr}')">+ Bu Tarihe Kayıt Ekle</button>`;
  container.innerHTML=html;
}

function toggleCalItem(id){
  _calDetailExpanded=_calDetailExpanded===id?null:id;
  renderCalDetail();
}

function openMuvekkilModal(isim){
  if(!isim||isim==='—') return;
  const hedefler=String(isim).split(',').map(ad=>muvekkilAdiAnahtari(ad)).filter(Boolean);
  const tumIsler = records.filter(r=>String(r.muvekkil||'').split(',').some(ad=>hedefler.includes(muvekkilAdiAnahtari(ad))));

  const bugun = new Date();
  bugun.setHours(0,0,0,0);

  const gelecek = tumIsler
    .filter(r=>!r.tamamlandi && new Date((r.date||'')+'T12:00:00')>=bugun)
    .sort((a,b)=>new Date(a.date)-new Date(b.date));

  const gecmis = tumIsler
    .filter(r=>!r.tamamlandi && new Date((r.date||'')+'T12:00:00')<bugun)
    .sort((a,b)=>new Date(b.date)-new Date(a.date));

  const tamamlanan = tumIsler
    .filter(r=>r.tamamlandi)
    .sort((a,b)=>new Date(b.date)-new Date(a.date));

  const typeDot={sure:'#ef4444',durusma:'#3b82f6',genel:'#22c55e',tekrar:'#f59e0b'};

  const isItem = (r,opts={}) => `
      <div class="muvekkil-is-item" ${opts.style?`style="${opts.style}"`:''} onclick="closeMuvekkilModal();openKayitModal(${r.id})">
        <div class="mv-dot" style="background:${opts.dot||typeDot[r.type]||'#9aa0ac'};"></div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-weight:500;${opts.line?'text-decoration:line-through;':''}white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${opts.prefix||''}${esc(getBaslik(r))}</div>
          <div style="font-size:11px;color:var(--text2);">${formatDate(r.date)}${r.saat?' · ⏰'+esc(r.saat):''} · ${typeLabel(r.type,r.dal)}${r.mahkeme?' · '+esc(r.mahkeme):''}${r.dava?' · '+esc(r.dava):''}</div>
        </div>
        <div style="font-size:11px;color:var(--text3);">›</div>
      </div>`;

  document.getElementById('mv-isim').textContent=isim;
  document.getElementById('mv-ozet').textContent=tumIsler.length+' iş · '+gelecek.length+' gelecek · '+gecmis.length+' geçmiş · '+tamamlanan.length+' tamamlanan';

  let html='';
  if(gelecek.length){
    html+='<div class="muvekkil-isler-group"><div class="muvekkil-isler-title">Gelecek İşler ('+gelecek.length+')</div>';
    html+=gelecek.map(r=>isItem(r)).join('');
    html+='</div>';
  }
  if(gecmis.length){
    html+='<div class="muvekkil-isler-group"><div class="muvekkil-isler-title" style="margin-top:8px;color:#991b1b;">Geçmiş / Tamamlanmamış İşler ('+gecmis.length+')</div>';
    html+=gecmis.map(r=>isItem(r,{style:'border-left:3px solid #ef4444;'})).join('');
    html+='</div>';
  }
  if(tamamlanan.length){
    html+='<div class="muvekkil-isler-group"><div class="muvekkil-isler-title" style="margin-top:8px;">Tamamlanan İşler ('+tamamlanan.length+')</div>';
    html+=tamamlanan.map(r=>isItem(r,{style:'opacity:0.6;',dot:'#d1d5db',line:true,prefix:'✓ '})).join('');
    html+='</div>';
  }
  if(!tumIsler.length){
    html='<div style="text-align:center;color:var(--text3);padding:30px;">Kayıt bulunamadı</div>';
  }

  document.getElementById('mv-body').innerHTML=html;
  document.getElementById('muvekkil-modal').style.display='flex';
}
function closeMuvekkilModal(){
  document.getElementById('muvekkil-modal').style.display='none';
}

function openDosyaModal(davaNo){
  if(!davaNo||davaNo==='—') return;
  const norm = s => (s||'').trim().toLocaleLowerCase('tr-TR');
  const hedef = norm(davaNo);
  const tumIsler = records.filter(r=>norm(r.dava)===hedef);

  const bugun = new Date();
  bugun.setHours(0,0,0,0);

  const gelecek = tumIsler
    .filter(r=>!r.tamamlandi && new Date((r.date||'')+'T12:00:00')>=bugun)
    .sort((a,b)=>new Date(a.date)-new Date(b.date));

  const gecmis = tumIsler
    .filter(r=>!r.tamamlandi && new Date((r.date||'')+'T12:00:00')<bugun)
    .sort((a,b)=>new Date(b.date)-new Date(a.date));

  const tamamlanan = tumIsler
    .filter(r=>r.tamamlandi)
    .sort((a,b)=>new Date(b.date)-new Date(a.date));

  const typeDot={sure:'#ef4444',durusma:'#3b82f6',genel:'#22c55e',tekrar:'#f59e0b'};
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  const isItem = (r,opts={}) => `
      <div class="muvekkil-is-item" ${opts.style?`style="${opts.style}"`:''} onclick="closeMuvekkilModal();openKayitModal(${r.id})">
        <div class="mv-dot" style="background:${opts.dot||typeDot[r.type]||'#9aa0ac'};"></div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-weight:500;${opts.line?'text-decoration:line-through;':''}white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${opts.prefix||''}${esc(getBaslik(r))}</div>
          <div style="font-size:11px;color:var(--text2);">${formatDate(r.date)}${r.saat?' · ⏰'+esc(r.saat):''} · ${typeLabel(r.type,r.dal)}${r.muvekkil?' · '+esc(r.muvekkil):''}${r.mahkeme?' · '+esc(r.mahkeme):''}</div>
        </div>
        <div style="font-size:11px;color:var(--text3);">›</div>
      </div>`;

  document.getElementById('mv-isim').textContent='Dosya: '+davaNo;
  document.getElementById('mv-ozet').textContent=tumIsler.length+' iş · '+gelecek.length+' gelecek · '+gecmis.length+' geçmiş · '+tamamlanan.length+' tamamlanan';

  let html='';
  if(gelecek.length){
    html+='<div class="muvekkil-isler-group"><div class="muvekkil-isler-title">Gelecek İşler ('+gelecek.length+')</div>';
    html+=gelecek.map(r=>isItem(r)).join('');
    html+='</div>';
  }
  if(gecmis.length){
    html+='<div class="muvekkil-isler-group"><div class="muvekkil-isler-title" style="margin-top:8px;color:#991b1b;">Geçmiş / Tamamlanmamış İşler ('+gecmis.length+')</div>';
    html+=gecmis.map(r=>isItem(r,{style:'border-left:3px solid #ef4444;'})).join('');
    html+='</div>';
  }
  if(tamamlanan.length){
    html+='<div class="muvekkil-isler-group"><div class="muvekkil-isler-title" style="margin-top:8px;">Tamamlanan İşler ('+tamamlanan.length+')</div>';
    html+=tamamlanan.map(r=>isItem(r,{style:'opacity:0.6;',dot:'#d1d5db',line:true,prefix:'✓ '})).join('');
    html+='</div>';
  }
  if(!tumIsler.length){
    html='<div style="text-align:center;color:var(--text3);padding:30px;">Bu dosya numarasına ait kayıt bulunamadı</div>';
  }

  document.getElementById('mv-body').innerHTML=html;
  document.getElementById('muvekkil-modal').style.display='flex';
}
function kaydinBagliDosyasi(r){return DAVA_DOSYALARI.find(d=>String(d.id)===String(r.davaDosyasiId))||DAVA_DOSYALARI.find(d=>dosyaAnahtari(d.dosya_no,d.mahkeme)===dosyaAnahtari(r.dava,r.mahkeme))||null;}
function takvimdenMuvekkilAc(kayitId){const r=records.find(x=>String(x.id)===String(kayitId));if(!r||!r.muvekkil)return;closeCalDetail();closeKayitModal();openMuvekkilModal(String(r.muvekkil).split(',')[0].trim());}
function takvimdenDosyaAc(kayitId){const r=records.find(x=>String(x.id)===String(kayitId));if(!r||!r.dava)return;closeCalDetail();closeKayitModal();openDosyaModal(r.dava);}
async function takvimKaydiniDosyaGecmisineEkle(kayitId){
  const r=records.find(x=>String(x.id)===String(kayitId)),d=r&&kaydinBagliDosyasi(r);if(!r||!d){alert('Bu kayıt bir dosya kartına bağlı değil.');return;}
  const aciklama=formatDate(r.date)+(r.saat?' '+r.saat:'')+' — '+getBaslik(r)+(r.tamamlandi?' tamamlandı.':' takvime kaydedildi.');
  const{error}=await sb.from('dosya_islem_gecmisi').insert({buro_id:_buro.id,dava_dosyasi_id:d.id,aciklama,created_by:_user.id});if(error){alert('Dosya geçmişine eklenemedi: '+error.message);return;}alert('✓ Takvim kaydı dosya geçmişine eklendi.');
}
let AKTIF_KAYIT_DETAY_ID=null;
async function openKayitModal(id){
  const r=records.find(x=>x.id===id);
  if(!r)return;
  AKTIF_KAYIT_DETAY_ID=id;
  let bagliDosya=kaydinBagliDosyasi(r);
  if(!bagliDosya&&r.davaDosyasiId){const{data}=await sb.from('dava_dosyalari').select('*').eq('id',r.davaDosyasiId).maybeSingle();if(data){bagliDosya=data;if(!DAVA_DOSYALARI.some(x=>String(x.id)===String(data.id)))DAVA_DOSYALARI.push(data);}}
  if(!bagliDosya&&r.dava){let q=sb.from('dava_dosyalari').select('*').eq('buro_id',_buro.id).eq('dosya_no',r.dava).limit(1);const{data}=await q.maybeSingle();if(data){bagliDosya=data;r.davaDosyasiId=data.id;await sb.from('kayitlar').update({dava_dosyasi_id:data.id}).eq('id',r.id);if(!DAVA_DOSYALARI.some(x=>String(x.id)===String(data.id)))DAVA_DOSYALARI.push(data);}}
  const typeDot={sure:'#ef4444',durusma:'#3b82f6',genel:'#22c55e',tekrar:'#f59e0b'};
  document.getElementById('km-type-dot').style.background=typeDot[r.type]||'#9aa0ac';
  document.getElementById('km-title').textContent=getBaslik(r);
  const d=r.hesapDetay;
  let body='';
  if(r.type==='sure'&&d){
    body+=`<div style="border-radius:var(--radius);overflow:hidden;border:1px solid var(--border);margin-bottom:14px;">${buildHesapHTML(d)}</div>`;
  }
  const kartMuvekkilleri=bagliDosya?MUVEKKIL_KARTLARI.filter(m=>DOSYA_MUVEKKIL_BAGLARI.some(b=>String(b.dava_dosyasi_id)===String(bagliDosya.id)&&String(b.muvekkil_id)===String(m.id))):[];
  const muvekkilDegeri=kartMuvekkilleri.length?kartMuvekkilleri.map(m=>`<button type="button" class="icon-btn" style="margin:2px 4px 2px 0;" onclick='closeKayitModal();openMuvekkilModal(${JSON.stringify(m.ad)})'>${esc(m.ad)} ›</button>`).join(''):(r.muvekkil?String(r.muvekkil).split(',').map(ad=>ad.trim()).filter(Boolean).map(ad=>`<button type="button" class="icon-btn" style="margin:2px 4px 2px 0;" onclick='closeKayitModal();openMuvekkilModal(${JSON.stringify(ad)})'>${esc(ad)} ›</button>`).join(''):'');
  const rows=[
    muvekkilDegeri?{l:kartMuvekkilleri.length>1?'Müvekkiller':'Müvekkil',v:muvekkilDegeri}:null,
    r.mahkeme?{l:'Mahkeme',v:esc(r.mahkeme)}:null,
    r.dava?{l:'Dava No',v:`<span onclick="takvimdenDosyaAc(${r.id})" style="color:var(--navy);font-weight:600;text-decoration:underline;cursor:pointer;">${esc(r.dava)} ›</span>`}:null,
    r.dal?{l:'Dal',v:dalLabel(r.dal)}:null,
    r.saat?{l:'Saat',v:'⏰ '+esc(r.saat)}:null,
    {l:'Tarih',v:formatDate(r.date)},
    r.not?{l:'Not',v:esc(r.not).replace(/\n/g,'<br>')}:null,
    r.tekrarTipi?{l:'Tekrar',v:'↻ '+tekrarTipiLabel(r.tekrarTipi)+(r.tekrarBitis?' · Bitiş: '+formatDate(r.tekrarBitis):'')}:null,
  ].filter(Boolean);
  body+=rows.map(row=>`<div class="kayit-row"><div class="kayit-row-label">${row.l}</div><div class="kayit-row-val">${row.v}</div></div>`).join('');
  const isDurusma = r.type==='durusma';
  const isMazeretTakip = r.type==='genel' && !r.tamamlandi && (r.baslik||'').toLocaleLowerCase('tr-TR').includes('duruşma tarihi');
  if(bagliDosya){
    const dosyaAkisi=await dosyaEkBilgilerHTML(bagliDosya.id);
    body+=`<div style="margin-top:14px;padding:12px;background:var(--navy-light);border:1px solid #c5d5ea;border-radius:11px;"><div style="margin-bottom:10px;"><div style="font-size:10px;font-weight:700;color:var(--navy);">DOSYA AKIŞI · ${esc(bagliDosya.dosya_no||'Numarasız')}</div><div style="font-size:10px;color:var(--text2);margin-top:2px;">Bu dosyada yapılan işlemler</div></div><div style="background:var(--surface);border-radius:9px;padding:10px;">${dosyaAkisi}</div></div>`;
  }
  else body+=`<div style="margin-top:14px;padding:10px;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;font-size:11px;color:#9a3412;">Bu kayıt henüz bir dosya kartına bağlı değil. Düzenle bölümünden dava dosyasını seçip kaydedin.</div>`;
  body+=`<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;padding-top:4px;">
    ${isMazeretTakip?`<button class="icon-btn" style="flex:1;padding:10px;background:#1e40af;color:#fff;border-color:#1e40af;font-weight:600;" onclick="durusmaTarihiGir(${r.id})">📅 Duruşma Tarihi Gir</button>`:''}
    ${isDurusma&&!r.tamamlandi?`<button class="icon-btn" style="flex:1;padding:10px;background:#1e40af;color:#fff;border-color:#1e40af;font-weight:600;" onclick="closeKayitModal();openDurusmaSonuc(${r.id})">📋 Sonuç Gir</button>`:''}
    ${ekSureUygunMu(r)?`<button class="icon-btn" style="flex:1;padding:10px;background:#1e40af;color:#fff;border-color:#1e40af;font-weight:600;" onclick="closeKayitModal();openEkSureOverlay(${r.id})">⏳ Ek Süre Talep Dilekçesi</button>`:''}
    <button class="icon-btn share-card-btn" style="flex:1;padding:10px;" onclick="shareKayitCard(${r.id})">📤 Paylaş</button>
    <button class="icon-btn" style="flex:1;padding:10px;${r.tamamlandi?'color:#22c55e;border-color:#22c55e;font-weight:600;':''}" onclick="toggleTamamlandi(${r.id});closeKayitModal();">${r.tamamlandi?'↩ Geri Al':'○ Tamamlandı'}</button>
    <button class="icon-btn" style="flex:1;padding:10px;" onclick="closeKayitModal();openModal(records.find(x=>x.id===${r.id}))">✎ Düzenle</button>
    <button class="icon-btn del" style="padding:10px 14px;" onclick="closeKayitModal();deleteRecord(${r.id})">Sil</button>
  </div>`;
  document.getElementById('km-body').innerHTML=body;
  document.getElementById('kayit-modal').style.display='flex';
}
function closeKayitModal(){
  AKTIF_KAYIT_DETAY_ID=null;
  document.getElementById('kayit-modal').style.display='none';
}
// ── EK SÜRE TALEP DİLEKÇESİ ─────────────────────────────────────
function ekSureUygunMu(r){
  return r.type==='sure' && (r.istipiVal==='Cevap Dilekçesi'||r.istipi==='Cevap Dilekçesi') && !r.tamamlandi;
}
let _ekSureId=null;
function openEkSureOverlay(id){
  const r=records.find(x=>x.id===id);if(!r)return;
  _ekSureId=id;
  document.getElementById('ek-sure-baslik').textContent=getBaslik(r);
  document.getElementById('ek-sure-tarih').textContent='Mevcut son gün: '+formatDate(r.date);
  document.getElementById('ek-sure-overlay').style.display='flex';
}
function closeEkSureOverlay(){
  document.getElementById('ek-sure-overlay').style.display='none';
  _ekSureId=null;
}
async function ekSureTalebiUygula(tur){
  const r=records.find(x=>x.id===_ekSureId);if(!r)return;
  let yeni=new Date(r.date+'T12:00:00');let aciklama='';
  if(tur==='1hafta'){yeni.setDate(yeni.getDate()+7);aciklama='+1 hafta';}
  else if(tur==='2hafta'){yeni.setDate(yeni.getDate()+14);aciklama='+2 hafta';}
  else if(tur==='1ay'){yeni.setMonth(yeni.getMonth()+1);aciklama='+1 ay';}
  const dow=yeni.getDay();
  if(dow===6)yeni.setDate(yeni.getDate()+2);
  else if(dow===0)yeni.setDate(yeni.getDate()+1);
  const yeniStr=yeni.toISOString().split('T')[0];
  const _eskiNot=r.not?r.not+'\n':'';
  const yeniNot=_eskiNot+'Ek süre talebi kabul edildi ('+aciklama+') → '+formatDate(yeniStr)+' tarihine ötelendi.';
  let yeniHesapDetay=r.hesapDetay?JSON.parse(JSON.stringify(r.hesapDetay)):null;
  if(yeniHesapDetay){
    yeniHesapDetay.adimlar=[...(yeniHesapDetay.adimlar||[]),{label:'EK SÜRE',val:formatDate(yeniStr),desc:'Mahkemece verilen ek süre ('+aciklama+')'}];
    yeniHesapDetay.sonGun=yeniStr;
  }
  const{error}=await sb.from('kayitlar').update({date:yeniStr,not_alani:yeniNot,hesap_detay:yeniHesapDetay}).eq('id',r.id);
  if(error){alert('Hata: '+error.message);return;}
  closeEkSureOverlay();
  await loadRecords();
  alert('✓ Ek süre talebi işlendi. Yeni son gün: '+formatDate(yeniStr));
}
function showMahkemeDropdown(inputId, ddId){
  const input=document.getElementById(inputId);
  const dd=document.getElementById(ddId);
  if(!input||!dd) return;
  const val=input.value.toLocaleLowerCase('tr-TR').trim();
  const kaynak=tumMahkemeListesi();
  const matches=val
    ? kaynak.filter(m=>m.toLocaleLowerCase('tr-TR').includes(val))
    : kaynak;
  if(!matches.length){dd.style.display='none';return;}
  dd.innerHTML=matches.map(m=>{
    const safe=m.replace(/&/g,'&amp;').replace(/"/g,'&quot;');
    return '<div class="mahkeme-dropdown-item" data-inputid="'+inputId+'" data-ddid="'+ddId+'" data-val="'+safe+'">'+m+'</div>';
  }).join('');
  dd.querySelectorAll('.mahkeme-dropdown-item').forEach(el=>{
    el.addEventListener('mousedown',function(e){
      e.preventDefault();
      document.getElementById(el.dataset.inputid).value=el.dataset.val;
      document.getElementById(el.dataset.inputid).dispatchEvent(new Event('input',{bubbles:true}));
      document.getElementById(el.dataset.ddid).style.display='none';
    });
  });
  dd.style.display='block';
}
// ── DURUŞMA SONUCU ───────────────────────────────────────────────
let _durusmaSonucId = null;

function openDurusmaSonuc(id){
  const r = records.find(x=>x.id===id);
  if(!r) return;
  _durusmaSonucId = id;
  document.getElementById('ds-baslik').textContent = getBaslik(r);
  document.getElementById('ds-tarih').textContent = formatDate(r.date) + (r.saat?' · ⏰'+r.saat:'');
  renderSonucButonlari(r.dal||'');
  document.getElementById('durusma-sonuc-overlay').style.display = 'flex';
}

function toggleSonucForm(formId, clearInput){
  ['ertelendi-form','karar-form','anlasmama-form','ikinci-oturum-form','gorusme-ertelendi-form','iptal-form'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.style.display='none';
  });
  const f=document.getElementById(formId);
  if(f){
    f.style.display='block';
    if(clearInput){
      ['ertelendi-tarih','ikinci-oturum-tarih'].forEach(tid=>{
        const t=document.getElementById(tid);
        if(t){t.value='';t.defaultValue='';}
      });
    }
  }
}

function renderSonucButonlari(dal){
  const container=document.getElementById('sonuc-butonlar');
  if(dal==='arabuluculuk'){
    container.innerHTML=`<button class="sonuc-btn karar" onclick="toggleSonucForm('anlasmama-form',false)"><span>🤝</span><span>Anlaşma</span></button><div class="ertelendi-form" id="anlasmama-form"><label style="font-size:12px;color:var(--text2);font-weight:500;display:block;margin-bottom:6px;">Anlaşma Notu <span style="color:#dc2626;">*zorunlu</span></label><textarea id="karar-not" placeholder="Anlaşma detayları..." style="width:100%;padding:10px;font-size:14px;border:1px solid var(--border2);border-radius:var(--radius);font-family:inherit;height:80px;resize:vertical;"></textarea><button onclick="durusmaSonucKarar()" style="width:100%;margin-top:10px;padding:12px;background:#22c55e;color:#fff;border:none;border-radius:var(--radius);font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;">Kaydet</button></div><button class="sonuc-btn ertelendi" onclick="durusmaSonucAnlasmama()"><span>❌</span><span>Anlaşamama</span></button><button class="sonuc-btn mazeret" onclick="toggleSonucForm('ikinci-oturum-form',true)"><span>📅</span><span>2. Oturum</span></button><div class="ertelendi-form" id="ikinci-oturum-form"><label style="font-size:12px;color:var(--text2);font-weight:500;display:block;margin-bottom:6px;">2. Oturum Tarihi</label><input type="date" id="ikinci-oturum-tarih" style="width:100%;padding:10px;font-size:14px;border:1px solid var(--border2);border-radius:var(--radius);font-family:inherit;"><input type="time" id="ikinci-oturum-saat" style="width:100%;padding:10px;font-size:14px;border:1px solid var(--border2);border-radius:var(--radius);font-family:inherit;margin-top:8px;"><button onclick="durusmaSonucIkinciOturum()" style="width:100%;margin-top:10px;padding:12px;background:var(--navy);color:#fff;border:none;border-radius:var(--radius);font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;">Yeni Tarihe Ekle</button></div>`;
  } else if(dal==='randevu'){
    container.innerHTML=`<button class="sonuc-btn karar" onclick="toggleSonucForm('karar-form',false)"><span>✅</span><span>Görüşme Yapıldı</span></button><div class="ertelendi-form" id="karar-form"><label style="font-size:12px;color:var(--text2);font-weight:500;display:block;margin-bottom:6px;">Görüşme Notu <span style="color:#dc2626;">*zorunlu</span></label><textarea id="karar-not" placeholder="Görüşme detayları..." style="width:100%;padding:10px;font-size:14px;border:1px solid var(--border2);border-radius:var(--radius);font-family:inherit;height:80px;resize:vertical;"></textarea><button onclick="durusmaSonucKarar()" style="width:100%;margin-top:10px;padding:12px;background:#22c55e;color:#fff;border:none;border-radius:var(--radius);font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;">Kaydet</button></div><button class="sonuc-btn ertelendi" onclick="toggleSonucForm('gorusme-ertelendi-form',true)"><span>📅</span><span>Görüşme Ertelendi</span></button><div class="ertelendi-form" id="gorusme-ertelendi-form"><label style="font-size:12px;color:var(--text2);font-weight:500;display:block;margin-bottom:6px;">Yeni Randevu Tarihi</label><input type="date" id="ertelendi-tarih" style="width:100%;padding:10px;font-size:14px;border:1px solid var(--border2);border-radius:var(--radius);font-family:inherit;"><input type="time" id="ertelendi-saat" style="width:100%;padding:10px;font-size:14px;border:1px solid var(--border2);border-radius:var(--radius);font-family:inherit;margin-top:8px;"><button onclick="durusmayiErtelendi()" style="width:100%;margin-top:10px;padding:12px;background:var(--navy);color:#fff;border:none;border-radius:var(--radius);font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;">Yeni Tarihe Ekle</button></div><button class="sonuc-btn mazeret" onclick="toggleSonucForm('iptal-form',false)"><span>🚫</span><span>İptal Edildi</span></button><div class="ertelendi-form" id="iptal-form"><label style="font-size:12px;color:var(--text2);font-weight:500;display:block;margin-bottom:6px;">İptal Notu (opsiyonel)</label><textarea id="iptal-not" placeholder="İptal gerekçesi..." style="width:100%;padding:10px;font-size:14px;border:1px solid var(--border2);border-radius:var(--radius);font-family:inherit;height:60px;resize:vertical;"></textarea><button onclick="durusmaSonucIptal()" style="width:100%;margin-top:10px;padding:12px;background:#ef4444;color:#fff;border:none;border-radius:var(--radius);font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;">İptal Edildi Olarak Kaydet</button></div>`;
  } else if(dal==='kesif'){
    container.innerHTML=`<button class="sonuc-btn karar" onclick="toggleSonucForm('karar-form',false)"><span>✅</span><span>Keşif Yapıldı</span></button><div class="ertelendi-form" id="karar-form"><label style="font-size:12px;color:var(--text2);font-weight:500;display:block;margin-bottom:6px;">Keşif Notu <span style="color:#dc2626;">*zorunlu</span></label><textarea id="karar-not" placeholder="Keşif detayları..." style="width:100%;padding:10px;font-size:14px;border:1px solid var(--border2);border-radius:var(--radius);font-family:inherit;height:80px;resize:vertical;"></textarea><button onclick="durusmaSonucKarar()" style="width:100%;margin-top:10px;padding:12px;background:#22c55e;color:#fff;border:none;border-radius:var(--radius);font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;">Kaydet</button></div><button class="sonuc-btn mazeret" onclick="durusmaSonucMazeretSadece()"><span>📋</span><span>Mazeret Gönderildi</span></button>`;
  } else if(dal==='tevkil'){
    container.innerHTML=`<button class="sonuc-btn karar" onclick="toggleSonucForm('karar-form',false)"><span>✅</span><span>Duruşma Yapıldı</span></button><div class="ertelendi-form" id="karar-form"><label style="font-size:12px;color:var(--text2);font-weight:500;display:block;margin-bottom:6px;">Duruşma Notu <span style="color:#dc2626;">*zorunlu</span></label><textarea id="karar-not" placeholder="Duruşma detayları..." style="width:100%;padding:10px;font-size:14px;border:1px solid var(--border2);border-radius:var(--radius);font-family:inherit;height:80px;resize:vertical;"></textarea><button onclick="durusmaSonucKarar()" style="width:100%;margin-top:10px;padding:12px;background:#22c55e;color:#fff;border:none;border-radius:var(--radius);font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;">Kaydet</button></div><button class="sonuc-btn ertelendi" onclick="toggleSonucForm('ertelendi-form',true)"><span>📅</span><span>Ertelendi</span></button><div class="ertelendi-form" id="ertelendi-form"><label style="font-size:12px;color:var(--text2);font-weight:500;display:block;margin-bottom:6px;">Yeni Duruşma Tarihi</label><input type="date" id="ertelendi-tarih" style="width:100%;padding:10px;font-size:14px;border:1px solid var(--border2);border-radius:var(--radius);font-family:inherit;"><input type="time" id="ertelendi-saat" style="width:100%;padding:10px;font-size:14px;border:1px solid var(--border2);border-radius:var(--radius);font-family:inherit;margin-top:8px;"><button onclick="durusmayiErtelendi()" style="width:100%;margin-top:10px;padding:12px;background:var(--navy);color:#fff;border:none;border-radius:var(--radius);font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;">Yeni Tarihe Ekle</button></div>`;
  } else {
    container.innerHTML=`<button class="sonuc-btn ertelendi" onclick="toggleSonucForm('ertelendi-form',true)"><span>📅</span><span>Ertelendi</span></button><div class="ertelendi-form" id="ertelendi-form"><label style="font-size:12px;color:var(--text2);font-weight:500;display:block;margin-bottom:6px;">Yeni Duruşma Tarihi</label><input type="date" id="ertelendi-tarih" style="width:100%;padding:10px;font-size:14px;border:1px solid var(--border2);border-radius:var(--radius);font-family:inherit;"><input type="time" id="ertelendi-saat" style="width:100%;padding:10px;font-size:14px;border:1px solid var(--border2);border-radius:var(--radius);font-family:inherit;margin-top:8px;"><button onclick="durusmayiErtelendi()" style="width:100%;margin-top:10px;padding:12px;background:var(--navy);color:#fff;border:none;border-radius:var(--radius);font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;">Yeni Tarihe Ekle</button></div><button class="sonuc-btn karar" onclick="toggleSonucForm('karar-form',false)"><span>✅</span><span>Karar Verildi</span></button><div class="ertelendi-form" id="karar-form"><label style="font-size:12px;color:var(--text2);font-weight:500;display:block;margin-bottom:6px;">Karar Notu <span style="color:#dc2626;">*zorunlu</span></label><textarea id="karar-not" placeholder="Örn: Beraat, mahkumiyet, tazminat kararı..." style="width:100%;padding:10px;font-size:14px;border:1px solid var(--border2);border-radius:var(--radius);font-family:inherit;height:80px;resize:vertical;"></textarea><button onclick="durusmaSonucKarar()" style="width:100%;margin-top:10px;padding:12px;background:#22c55e;color:#fff;border:none;border-radius:var(--radius);font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;">Kaydet</button></div><button class="sonuc-btn mazeret" onclick="durusmaSonucMazeret()"><span>📋</span><span>Mazeret Gönderildi</span></button>`;
  }
}

function closeDurusmaSonuc(){
  document.getElementById('durusma-sonuc-overlay').style.display = 'none';
  _durusmaSonucId = null;
}

async function durusmaSonucAnlasmama(){
  const r=records.find(x=>x.id===_durusmaSonucId);if(!r)return;
  const yeniTarih=new Date(r.date+'T12:00:00');yeniTarih.setDate(yeniTarih.getDate()+14);
  const tarihStr=yeniTarih.toISOString().split('T')[0];
  const yeniRec={type:'genel',date:tarihStr,baslik:'Hukuk Davası Açılışı Değerlendir',not_alani:'Arabuluculuk anlaşmazlıkla sonuçlandı.',muvekkil:r.muvekkil||null,mahkeme:r.mahkeme||null,dava:r.dava||null,dal:'hukuk',tamamlandi:false};
  await sb.from('kayitlar').insert(localToDB(yeniRec));
  const _en=r.not?r.not+'\n':'';
  await sb.from('kayitlar').update({tamamlandi:true,not_alani:_en+'Anlaşamama → '+formatDate(tarihStr)+' tarihine hatırlatma eklendi'}).eq('id',r.id);
  closeDurusmaSonuc();await loadRecords();
  alert('✓ Anlaşamama kaydedildi. '+formatDate(tarihStr)+' tarihine hatırlatma eklendi.');
}

async function durusmaSonucIkinciOturum(){
  const r=records.find(x=>x.id===_durusmaSonucId);if(!r)return;
  const yeniTarih=document.getElementById('ikinci-oturum-tarih').value;
  const yeniSaat=document.getElementById('ikinci-oturum-saat').value;
  if(!yeniTarih){alert('Yeni tarih seçiniz.');return;}
  const yeniRec={...localToDB(r),date:yeniTarih,saat:yeniSaat||r.saat||null};delete yeniRec.id;
  await sb.from('kayitlar').insert(yeniRec);
  const _en=r.not?r.not+'\n':'';
  await sb.from('kayitlar').update({tamamlandi:true,not_alani:_en+'2. Oturum → '+formatDate(yeniTarih)}).eq('id',r.id);
  closeDurusmaSonuc();await loadRecords();
  alert('✓ 2. Oturum '+formatDate(yeniTarih)+' tarihine eklendi.');
}

async function durusmaSonucIptal(){
  const r=records.find(x=>x.id===_durusmaSonucId);if(!r)return;
  const iptalNot=(document.getElementById('iptal-not')||{}).value||'';
  const _en=r.not?r.not+'\n':'';
  await sb.from('kayitlar').update({tamamlandi:true,not_alani:_en+'İptal edildi'+(iptalNot.trim()?' → '+iptalNot.trim():'')}).eq('id',r.id);
  closeDurusmaSonuc();await loadRecords();
}

async function durusmaSonucMazeretSadece(){
  const r=records.find(x=>x.id===_durusmaSonucId);if(!r)return;
  const _en=r.not?r.not+'\n':'';
  await sb.from('kayitlar').update({tamamlandi:true,not_alani:_en+'Mazeret gönderildi'}).eq('id',r.id);
  closeDurusmaSonuc();await loadRecords();
  alert('✓ Mazeret gönderildi olarak kaydedildi.');
}


async function durusmayiErtelendi(){
  const r = records.find(x=>x.id===_durusmaSonucId);
  if(!r) return;
  const yeniTarih = document.getElementById('ertelendi-tarih').value;
  const yeniSaat = document.getElementById('ertelendi-saat').value;
  if(!yeniTarih){ alert('Yeni tarih seçiniz.'); return; }
  const yeniRec = {...localToDB(r), date:yeniTarih, saat:yeniSaat||r.saat||null};
  delete yeniRec.id;
  const {error} = await sb.from('kayitlar').insert(yeniRec);
  if(error){ alert('Hata: '+error.message); return; }
  // Eski kaydı tamamlandı yap, açıklama ekle
  const _ertelEskiNot=r.not?r.not+'\n':'';
  await sb.from('kayitlar').update({tamamlandi:true, not_alani:_ertelEskiNot+'Ertelendi → '+formatDate(yeniTarih)}).eq('id',r.id);
  closeDurusmaSonuc();
  await loadRecords();
  alert('✓ Duruşma '+formatDate(yeniTarih)+' tarihine ertelendi.');
}
async function durusmaSonucKarar(){
  if(!_durusmaSonucId) return;
  const not_metni = document.getElementById('karar-not').value.trim();
  if(!not_metni){ alert('Karar notu zorunludur.'); return; }
  const _kararRec=records.find(x=>x.id===_durusmaSonucId);
  const _kararEskiNot=_kararRec&&_kararRec.not?_kararRec.not+'\n':'';
  await sb.from('kayitlar').update({tamamlandi:true, not_alani:_kararEskiNot+'Karar verildi: '+sentenceCase(not_metni)}).eq('id',_durusmaSonucId);
  closeDurusmaSonuc();
  await loadRecords();
}
async function durusmaSonucMazeret(){
  const r = records.find(x=>x.id===_durusmaSonucId);
  if(!r) return;
  // 1 hafta sonra genel iş ekle
  const yeniTarih = new Date(r.date+'T12:00:00');
  yeniTarih.setDate(yeniTarih.getDate()+7);
  const tarihStr = yeniTarih.toISOString().split('T')[0];
  const yeniRec = {
    type:'genel', date:tarihStr,
    baslik:'Duruşma Tarihini Öğren',
    not_alani:getBaslik(r)+' - mazeret sonrası yeni tarihi öğren',
    muvekkil:r.muvekkil||null, mahkeme:r.mahkeme||null, dava:r.dava||null,
    dal:r.dal||null, tamamlandi:false,
    buro_id:_buro?_buro.id:null
  };
  const {error} = await sb.from('kayitlar').insert(yeniRec);
  if(error){ alert('Hata: '+error.message); return; }
  // Orijinal duruşmayı tamamlandı yap
  const _mazeretEskiNot=r.not?r.not+'\n':'';
  await sb.from('kayitlar').update({tamamlandi:true, not_alani:_mazeretEskiNot+'Mazeret gönderildi → '+formatDate(tarihStr)+' tarihinde takip edilecek'}).eq('id',_durusmaSonucId);
  closeDurusmaSonuc();
  await loadRecords();
  alert('✓ Mazeret kaydedildi. '+formatDate(tarihStr)+' tarihine hatırlatıcı eklendi.');
}
function closeCalDetail(){
  document.getElementById('cal-detail-panel').classList.remove('open');
  document.getElementById('cal-detail-overlay').classList.remove('open');
}

// ── MAZERET SONRASI DURUŞMA TARİHİ GİRİŞİ ───────────────────────
function durusmaTarihiGir(id){
  const r = records.find(x=>x.id===id);
  if(!r) return;

  const existing = document.getElementById('durusma-tarih-form');
  if(existing){ existing.remove(); return; }

  const container = document.getElementById('km-body');
  if(!container){
    alert('Kayıt detayı açılamadı.');
    return;
  }

  const formDiv = document.createElement('div');
  formDiv.id = 'durusma-tarih-form';
  formDiv.style.cssText = 'background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px;margin-bottom:14px;';
  formDiv.innerHTML = `
    <div style="font-size:12px;font-weight:600;color:#1e40af;margin-bottom:10px;">📅 Yeni Duruşma Tarihini Gir</div>
    <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;">
      <div style="flex:1;min-width:130px;">
        <label style="font-size:11px;color:#374151;font-weight:500;display:block;margin-bottom:4px;">Tarih</label>
        <input type="date" id="yeni-durusma-tarih" style="width:100%;padding:8px 10px;font-size:14px;border:1px solid #d1d5db;border-radius:8px;font-family:inherit;">
      </div>
      <div style="flex:1;min-width:100px;">
        <label style="font-size:11px;color:#374151;font-weight:500;display:block;margin-bottom:4px;">Saat (opsiyonel)</label>
        <input type="time" id="yeni-durusma-saat" style="width:100%;padding:8px 10px;font-size:14px;border:1px solid #d1d5db;border-radius:8px;font-family:inherit;">
      </div>
    </div>
    <div style="display:flex;gap:8px;">
      <button onclick="durusmaTarihiKaydet(${id})" style="flex:1;padding:10px;background:#1e40af;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">Duruşmayı Ekle</button>
      <button onclick="document.getElementById('durusma-tarih-form')?.remove()" style="padding:10px 14px;background:transparent;border:1px solid #d1d5db;border-radius:8px;font-size:13px;cursor:pointer;font-family:inherit;">İptal</button>
    </div>
  `;

  container.insertBefore(formDiv, container.firstChild);
}

async function durusmaTarihiKaydet(genelIsId){
  const tarih = document.getElementById('yeni-durusma-tarih')?.value;
  const saat  = document.getElementById('yeni-durusma-saat')?.value;

  if(!tarih){
    alert('Tarih seçiniz.');
    return;
  }

  const r = records.find(x=>x.id===genelIsId);
  if(!r){
    alert('Kayıt bulunamadı.');
    return;
  }

  const yeniDurusma = {
    type:'durusma',
    date:tarih,
    saat:saat||null,
    baslik:r.mahkeme||'Duruşma',
    mahkeme:r.mahkeme||null,
    muvekkil:r.muvekkil||null,
    dava:r.dava||null,
    dal:r.dal||null,
    not_alani:'Mazeret sonrası yeni tarih. Kaynak: '+formatDate(r.date)+' tarihli hatırlatıcı.',
    tamamlandi:false,
    buro_id:_buro?_buro.id:null
  };

  const {error} = await sb.from('kayitlar').insert(yeniDurusma);
  if(error){
    alert('Hata: '+error.message);
    return;
  }

  const eskiNot = r.not ? r.not+'\n' : '';
  await sb.from('kayitlar').update({
    tamamlandi:true,
    not_alani:eskiNot+'Duruşma tarihi girildi → '+formatDate(tarih)+(saat?' saat '+saat:'')
  }).eq('id',genelIsId);

  closeKayitModal();
  await loadRecords();

  if(typeof eDurusmaTalebiOlustur === 'function'){
    await eDurusmaTalebiOlustur({...yeniDurusma});
    await loadRecords();
  }

  alert('✓ Duruşma '+formatDate(tarih)+(saat?' saat '+saat:'')+' tarihine eklendi.');
}

// Swipe ile modal kapatma — DEVRE DIŞI (sadece çarpı ile kapanır)
let _swipeStartY=0;
function swipeStart(e){_swipeStartY=e.touches[0].clientY;}
function swipeEnd(e,closeFn){
  // Swipe ile kapatma kaldırıldı — sadece çarpı butonu ile kapanır
}
