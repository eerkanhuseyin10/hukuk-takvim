/* Sekreter renderer: 03-records-sync.js */
const BILDIRIM_AYAR_KEY='sekreter_bildirim_ayarlari_v1';
const BILDIRIM_GECMIS_KEY='sekreter_bildirim_gecmisi_v1';
const BILDIRIM_TESLIM_KEY='sekreter_bildirim_teslim_v1';
function bildirimAyarlariOku(){try{return{gun:3,detay:false,...JSON.parse(localStorage.getItem(BILDIRIM_AYAR_KEY)||'{}')};}catch(e){return{gun:3,detay:false};}}
function bildirimGecmisiOku(){try{return JSON.parse(localStorage.getItem(BILDIRIM_GECMIS_KEY)||'[]');}catch(e){return[];}}
function bildirimGecmisiYaz(liste){try{localStorage.setItem(BILDIRIM_GECMIS_KEY,JSON.stringify(liste.slice(0,50)));}catch(e){}}
function bildirimGecmisineEkle(baslik,mesaj,basarili=true){const liste=bildirimGecmisiOku();liste.unshift({zaman:new Date().toISOString(),baslik,mesaj,basarili});bildirimGecmisiYaz(liste);bildirimGecmisiniRender();}
function bildirimTeslimleriOku(){try{return new Set(JSON.parse(localStorage.getItem(BILDIRIM_TESLIM_KEY)||'[]'));}catch(e){return new Set();}}
function bildirimTeslimleriniYaz(set){try{localStorage.setItem(BILDIRIM_TESLIM_KEY,JSON.stringify([...set].slice(-500)));}catch(e){}}

async function bildirimIzniAl(){
  if(!('Notification' in window)) return;
  if(Notification.permission === 'default'){
    await Notification.requestPermission();
  }
}

function bildirimGonder(baslik, mesaj, icon, gecmiseEkle=true){
  if(Notification.permission !== 'granted') return false;
  try{
  const n = new Notification(baslik, {
    body: mesaj,
    icon: icon || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+PHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iMTAiIGZpbGw9IiMwZjI0NDciLz48dGV4dCB4PSIyNCIgeT0iMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiNGQUM3NzUiPkU8L3RleHQ+PC9zdmc+',
    badge: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+PHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iMTAiIGZpbGw9IiMwZjI0NDciLz48L3N2Zz4=',
    tag: baslik,
    renotify: false,
  });
  n.onclick = () => { window.focus(); n.close(); };
  if(gecmiseEkle) bildirimGecmisineEkle(baslik,mesaj,true);
  return true;
  }catch(e){if(gecmiseEkle)bildirimGecmisineEkle(baslik,mesaj,false);return false;}
}

function hatirlaticiKontrol(){
  if(Notification.permission !== 'granted') return;
  const ayar=bildirimAyarlariOku();
  const bugun=new Date();bugun.setHours(0,0,0,0);
  const teslimler=bildirimTeslimleriOku(),bugunKey=bugun.toISOString().slice(0,10);
  records.filter(r=>!r.tamamlandi&&r.date&&(r.type==='sure'||r.type==='durusma')).forEach(r=>{
    const d=new Date(r.date+'T12:00:00');d.setHours(0,0,0,0);
    const fark=Math.round((d-bugun)/86400000);
    if(fark<0||fark>Number(ayar.gun))return;
    const anahtar=bugunKey+'|'+r.id+'|'+fark;
    if(teslimler.has(anahtar))return;
    const zaman=fark===0?'bugün':fark===1?'yarın':fark+' gün sonra';
    const baslik=(r.type==='durusma'?'Duruşma / randevu ':'Süreli iş ')+zaman;
    const mesaj=ayar.detay?[getBaslik(r),r.muvekkil,r.dava,r.saat].filter(Boolean).join(' · '):typeLabel(r.type,r.dal)+(r.saat?' · '+r.saat:'');
    if(bildirimGonder(baslik,mesaj)){teslimler.add(anahtar);}
  });
  bildirimTeslimleriniYaz(teslimler);
}

// Bildirim izni butonu - sidebar footer'a eklenir
function bildirimDurumGuncelle(){
  const btn = document.getElementById('bildirim-btn');
  if(!btn) return;
  if(!('Notification' in window)){
    btn.style.display='none'; return;
  }
  if(Notification.permission==='granted'){
    btn.textContent='🔔 Bildirimler Açık';
    btn.style.color='#4ade80';
  } else if(Notification.permission==='denied'){
    btn.textContent='🔕 Bildirim Engellendi';
    btn.style.color='#f87171';
  } else {
    btn.textContent='🔔 Bildirimleri Aç';
    btn.style.color='rgba(255,255,255,0.6)';
  }
}

async function bildirimToggle(){
  await bildirimIzniAl();
  bildirimDurumGuncelle();
  if(Notification.permission==='granted') hatirlaticiKontrol();
}
// ── TEKRAR MOTORU ────────────────────────────────────────────────
function openBildirimAyarlari(){
  let overlay=document.getElementById('bildirim-ayar-overlay');
  if(!overlay){
    overlay=document.createElement('div');overlay.id='bildirim-ayar-overlay';overlay.className='modal-overlay';overlay.style.zIndex='510';
    overlay.onclick=e=>{if(e.target===overlay)closeBildirimAyarlari();};
    overlay.innerHTML=`<div class="modal" style="max-width:520px;"><div class="modal-handle"></div><div class="modal-header"><h2>Bildirim Ayarları</h2><button class="btn" onclick="closeBildirimAyarlari()">✕</button></div><div class="modal-body">
      <div class="fg"><label>Kaç gün önceden bildirilsin?</label><select id="bildirim-gun" style="width:100%;padding:10px;border:1px solid var(--border2);border-radius:10px;background:var(--surface);font-family:inherit;"><option value="1">1 gün</option><option value="3">3 gün</option><option value="7">7 gün</option><option value="14">14 gün</option></select></div>
      <label style="display:flex;gap:9px;align-items:flex-start;font-size:13px;cursor:pointer;margin:14px 0;"><input type="checkbox" id="bildirim-detay" style="margin-top:2px;accent-color:var(--navy);"><span><b>Bildirimde ayrıntıları göster</b><br><span style="font-size:11px;color:var(--text2);">Kapalıyken müvekkil, dosya ve iş başlığı kilit ekranında görünmez.</span></span></label>
      <div style="display:flex;gap:8px;flex-wrap:wrap;"><button class="btn btn-primary" onclick="bildirimAyarlariKaydet()">Ayarları Kaydet</button><button class="btn" onclick="denemeBildirimiGonder()">Deneme Bildirimi</button></div>
      <div id="bildirim-ayar-msg" style="font-size:12px;min-height:18px;color:var(--text2);margin-top:10px;"></div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:18px;margin-bottom:8px;"><div class="section-title" style="margin:0;">Bildirim Geçmişi</div><button class="icon-btn del" onclick="bildirimGecmisiniTemizle()">Geçmişi Temizle</button></div>
      <div id="bildirim-gecmis-list" style="max-height:230px;overflow:auto;border:1px solid var(--border);border-radius:10px;"></div>
    </div></div>`;
    document.body.appendChild(overlay);
  }
  const ayar=bildirimAyarlariOku();document.getElementById('bildirim-gun').value=String(ayar.gun);document.getElementById('bildirim-detay').checked=!!ayar.detay;
  overlay.style.display='flex';bildirimGecmisiniRender();
}
function closeBildirimAyarlari(){const el=document.getElementById('bildirim-ayar-overlay');if(el)el.style.display='none';}
function bildirimAyarMesaj(m){const el=document.getElementById('bildirim-ayar-msg');if(el)el.textContent=m;}
function bildirimAyarlariKaydet(){
  const ayar={gun:Number(document.getElementById('bildirim-gun').value)||3,detay:document.getElementById('bildirim-detay').checked};
  try{localStorage.setItem(BILDIRIM_AYAR_KEY,JSON.stringify(ayar));bildirimAyarMesaj('✓ Ayarlar bu cihaz için kaydedildi.');hatirlaticiKontrol();}catch(e){bildirimAyarMesaj('Ayarlar kaydedilemedi.');}
}
async function denemeBildirimiGonder(){
  await bildirimIzniAl();bildirimDurumGuncelle();
  if(Notification.permission!=='granted'){bildirimAyarMesaj('Tarayıcı bildirim izni vermedi.');return;}
  const ayar=bildirimAyarlariOku(),mesaj=ayar.detay?'Deneme Müvekkili · 2026/123 · 10:30':'Ayrıntılar gizli · 10:30';
  bildirimGonder('Sekreter deneme bildirimi',mesaj);bildirimAyarMesaj('Deneme bildirimi gönderildi.');
}
function bildirimGecmisiniRender(){
  const el=document.getElementById('bildirim-gecmis-list');if(!el)return;const liste=bildirimGecmisiOku();
  el.innerHTML=liste.length?liste.map(x=>`<div style="padding:9px 11px;border-bottom:1px solid var(--border);"><div style="font-size:12px;font-weight:600;">${esc(x.baslik)}</div><div style="font-size:11px;color:var(--text2);margin-top:2px;">${esc(x.mesaj)}</div><div style="font-size:10px;color:var(--text3);margin-top:3px;">${new Date(x.zaman).toLocaleString('tr-TR')} · ${x.basarili?'Gönderildi':'Başarısız'}</div></div>`).join(''):'<div style="padding:15px;text-align:center;color:var(--text3);font-size:12px;">Henüz bildirim yok.</div>';
}
function bildirimGecmisiniTemizle(){bildirimGecmisiYaz([]);bildirimGecmisiniRender();}

function tekrarTipiLabel(t){return{haftalik:'Haftalık',aylik:'Aylık',yillik:'Yıllık'}[t]||'';}

function nextTekrarDate(dateStr, tipi){
  const d = new Date(dateStr+'T12:00:00');
  if(tipi==='haftalik') d.setDate(d.getDate()+7);
  else if(tipi==='aylik') d.setMonth(d.getMonth()+1);
  else if(tipi==='yillik') d.setFullYear(d.getFullYear()+1);
  return d.toISOString().split('T')[0];
}

let ST_TEKRAR = '';
let ST_TEKRAR_D = '';
function setTekrar(val,el){
  document.querySelectorAll('#tekrar-chips .chip').forEach(c=>c.classList.remove('sel'));
  el.classList.add('sel'); ST_TEKRAR=val;
  document.getElementById('tekrar-bitis-box').style.display=val?'block':'none';
}
function setTekrarD(val,el){
  document.querySelectorAll('#tekrar-chips-d .chip').forEach(c=>c.classList.remove('sel'));
  el.classList.add('sel'); ST_TEKRAR_D=val;
  document.getElementById('tekrar-bitis-box-d').style.display=val?'block':'none';
}


async function olusturTekrarKayitlari(anaRec){
  if(!anaRec.tekrarTipi)return;
  const bitis=anaRec.tekrarBitis||new Date(new Date().setFullYear(new Date().getFullYear()+2)).toISOString().split('T')[0];
  const mevcutlar=records.filter(r=>r.tekrarAnaId===anaRec.id).map(r=>r.date);
  let sonTarih=mevcutlar.length>0?mevcutlar.sort().pop():anaRec.date;
  const yeniKayitlar=[];
  let next=nextTekrarDate(sonTarih,anaRec.tekrarTipi);
  while(next<=bitis&&yeniKayitlar.length<24){
    if(!mevcutlar.includes(next)){
      const rec={...localToDB({...anaRec,date:next,id:undefined,tekrarAnaId:anaRec.id,tekrarTipi:null,tekrarBitis:null,type:'tekrar'})};
      rec.tekrar_ana_id=anaRec.id;
      yeniKayitlar.push(rec);
    }
    next=nextTekrarDate(next,anaRec.tekrarTipi);
  }
  if(yeniKayitlar.length>0)await sb.from('kayitlar').insert(yeniKayitlar);
}
// ── GEÇMİŞ GENEL İŞLERİ BUGÜNE TAŞI ────────────────────────────

let _bekleyenSilme=null;
function silinmeyiBekleyenleriFiltrele(liste){
  if(!_bekleyenSilme) return liste;
  const idler=new Set(_bekleyenSilme.ids.map(String));
  return liste.filter(r=>!idler.has(String(r.id)));
}

async function loadRecords(){
  setSyncStatus('loading','Yükleniyor...');
  if(!_buro) return;
  const{data,error}=await sb.from('kayitlar').select('*').eq('buro_id',_buro.id).order('date',{ascending:true});
  if(error){setSyncStatus('error','Bağlantı hatası');return;}
  records=silinmeyiBekleyenleriFiltrele((data||[]).map(dbToLocal));
  // Tekrar kayıtlarını otomatik oluştur
  const anaKayitlar = records.filter(r=>r.tekrarTipi && !r.tekrarAnaId && r.type==='tekrar');
  for(const r of anaKayitlar){ await olusturTekrarKayitlari(r); }
  if(anaKayitlar.length>0){
    const{data:data2}=await sb.from('kayitlar').select('*').eq('buro_id',_buro.id).order('date',{ascending:true});
    records=silinmeyiBekleyenleriFiltrele((data2||[]).map(dbToLocal));
  }
  // Geçmiş genel işleri bugüne taşı
  const genelIsTasindi=await genelIsleriTasi();
  if(genelIsTasindi){
    const{data:_dataFinal}=await sb.from('kayitlar').select('*').eq('buro_id',_buro.id).order('date',{ascending:true});
    if(_dataFinal) records=silinmeyiBekleyenleriFiltrele(_dataFinal.map(dbToLocal));
  }
  setSyncStatus('ok','Bağlı');
  renderAll();
  bildirimDurumGuncelle();
  hatirlaticiKontrol();
  canliSenkronuBaslat();
}

async function genelIsleriTasi(){
  const _b=new Date();
  const _bs=_b.getFullYear()+'-'+String(_b.getMonth()+1).padStart(2,'0')+'-'+String(_b.getDate()).padStart(2,'0');
  if(!_buro) return false;
  const{data,error}=await sb.from('kayitlar')
    .update({date:_bs})
    .eq('buro_id',_buro.id)
    .eq('type','genel')
    .eq('tamamlandi',false)
    .is('tekrar_ana_id',null)
    .or('gecmis_kayit.is.null,gecmis_kayit.eq.false')
    .lt('date',_bs)
    .select('id');
  return !error&&Array.isArray(data)&&data.length>0;
}
function setSyncStatus(s,t){
  document.getElementById('sync-dot').className='sync-dot'+(s==='error'?' error':s==='loading'?' loading':'');
  document.getElementById('sync-text').textContent=t;
}

// Aynı bürodaki başka bir kullanıcının değişikliklerini sayfayı
// yenilemeden alır. Supabase Dashboard > Database > Replication altında
// public.kayitlar tablosunun Realtime yayınına eklenmesi gerekir.
let _kayitlarKanali=null;
let _canliYenilemeTimer=null;
let _otomatikKontrolTimer=null;
let _sessizYuklemeSuruyor=false;

// Salt okuma yapar. loadRecords() gibi tekrarlayan kayıt üretmez veya
// geçmiş işlerin tarihini değiştirmez; bu nedenle arka planda güvenle çalışır.
async function kayitlariSessizYenile(){
  if(!_buro||!navigator.onLine||_sessizYuklemeSuruyor) return;
  _sessizYuklemeSuruyor=true;
  try{
    const{data,error}=await sb.from('kayitlar').select('*').eq('buro_id',_buro.id).order('date',{ascending:true});
    if(error){setSyncStatus('error','Senkron bekliyor');return;}
    const yeni=silinmeyiBekleyenleriFiltrele((data||[]).map(dbToLocal));
    const eskiImza=JSON.stringify(records);
    const yeniImza=JSON.stringify(yeni);
    if(eskiImza!==yeniImza){records=yeni;renderAll();hatirlaticiKontrol();}
    setSyncStatus('ok',_kayitlarKanali?'Canlı':'Bağlı');
  }finally{
    _sessizYuklemeSuruyor=false;
  }
}

function otomatikKontroluBaslat(){
  if(_otomatikKontrolTimer) return;
  // Realtime bağlantısına yedek kontrol: her 4 saniye yerine dakikada bir.
  // Böylece açık her tarayıcı sekmesinin veritabanını sürekli taraması önlenir.
  _otomatikKontrolTimer=setInterval(kayitlariSessizYenile,60000);
}
function canliSenkronuBaslat(){
  if(!_buro) return;
  otomatikKontroluBaslat();
  if(_kayitlarKanali) return;
  _kayitlarKanali=sb.channel('sekreter-kayitlar-'+_buro.id)
    .on('postgres_changes',{
      event:'*',schema:'public',table:'kayitlar',filter:'buro_id=eq.'+_buro.id
    },()=>{
      clearTimeout(_canliYenilemeTimer);
      _canliYenilemeTimer=setTimeout(kayitlariSessizYenile,250);
    })
    .subscribe(durum=>{
      if(durum==='SUBSCRIBED') setSyncStatus('ok','Canlı');
      if(durum==='CHANNEL_ERROR'||durum==='TIMED_OUT') setSyncStatus('error','Senkron bekliyor');
    });
}
async function canliSenkronuKapat(){
  clearTimeout(_canliYenilemeTimer);
  clearInterval(_otomatikKontrolTimer);
  _otomatikKontrolTimer=null;
  if(_kayitlarKanali) await sb.removeChannel(_kayitlarKanali);
  _kayitlarKanali=null;
}

window.addEventListener('online',()=>{
  setSyncStatus('loading','Yeniden bağlanıyor...');
  kayitlariSessizYenile();
});
window.addEventListener('offline',()=>setSyncStatus('error','Çevrimdışı'));
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible') kayitlariSessizYenile();
});
function dbToLocal(r){return{id:r.id,type:r.type,date:r.date,baslik:r.baslik||'',muvekkil:r.muvekkil||'',muvekkilId:r.muvekkil_id||null,davaDosyasiId:r.dava_dosyasi_id||null,mahkeme:r.mahkeme||'',dava:r.dava||'',dal:r.dal||'',istipi:r.istipi||'',istipiVal:r.istipi_val||'',tebligTarihi:r.teblig_tarihi||'',tebligSekli:r.teblig_sekli||'',sureMiktar:r.sure_miktar,sureBirim:r.sure_birim||'',hesapDetay:r.hesap_detay||null,not:r.not_alani||'',saat:r.saat||'',tekrarTipi:r.tekrar_tipi||null,tekrarBitis:r.tekrar_bitis||null,tekrarAnaId:r.tekrar_ana_id||null,tamamlandi:r.tamamlandi===true,gecmisKayit:r.gecmis_kayit===true};}
function localToDB(r){return{type:r.type,date:r.date,buro_id:r.buroId||(_buro?_buro.id:null),baslik:r.baslik||null,muvekkil:r.muvekkil||null,muvekkil_id:r.muvekkilId||null,dava_dosyasi_id:r.davaDosyasiId||null,mahkeme:r.mahkeme||null,dava:r.dava||null,dal:r.dal||null,istipi:r.istipi||null,istipi_val:r.istipiVal||null,teblig_tarihi:r.tebligTarihi||null,teblig_sekli:r.tebligSekli||null,sure_miktar:r.sureMiktar||null,sure_birim:r.sureBirim||null,hesap_detay:r.hesapDetay||null,not_alani:r.not||null,saat:r.saat||null,tekrar_tipi:r.tekrarTipi||null,tekrar_bitis:r.tekrarBitis||null,tekrar_ana_id:r.tekrarAnaId||null,tamamlandi:r.tamamlandi||false,gecmis_kayit:r.gecmisKayit||false};}

// ── SÜRE MOTORU ───────────────────────────────────────────────────
function isAdliTatil(d){const m=d.getMonth(),g=d.getDate();return(m===6&&g>=20)||m===7;}
function hesaplaSureMotoru(tebligTarihi,miktar,birim,dal,istipi){
  const t=new Date(tebligTarihi);t.setHours(12,0,0,0);
  let sonGun;const adimlar=[];
  if(dal==='ceza'){if(birim==='gun'){sonGun=new Date(t);sonGun.setDate(t.getDate()+miktar);}else if(birim==='hafta'){sonGun=new Date(t);sonGun.setDate(t.getDate()+miktar*7);}else{sonGun=new Date(t);sonGun.setMonth(t.getMonth()+miktar);}}
  else{const b=new Date(t);b.setDate(t.getDate()+1);if(birim==='gun'){sonGun=new Date(b);sonGun.setDate(b.getDate()+miktar-1);}else if(birim==='hafta'){sonGun=new Date(t);sonGun.setDate(t.getDate()+miktar*7);}else{sonGun=new Date(t);sonGun.setMonth(t.getMonth()+miktar);}}
  adimlar.push({label:'YASAL SÜRE',val:formatDate(sonGun.toISOString().split('T')[0]),desc:(birim==='gun'?miktar+' gün':birim==='hafta'?miktar+' hafta':miktar+' ay')+' eklendi'});
  const adliTatilMuaf=istipi&&ADLI_TATIL_MUAF_ISTIPLERI.has(istipi);
  let kaydirma=null;
  if(adliTatilMuaf&&isAdliTatil(sonGun)){kaydirma='Bu iş tipi adli tatile tabi değil → süre normal işledi';}
  else if(isAdliTatil(sonGun)){const tb=new Date(sonGun.getFullYear(),7,31);if(dal==='ceza'){sonGun=new Date(tb);sonGun.setDate(tb.getDate()+3);kaydirma='Adli tatile denk geldi → +3 gün (CMK)';}else if(dal==='icra'){kaydirma='İcra: adli tatilden etkilenmez';}else if(dal==='hukuk'){sonGun=new Date(tb);sonGun.setDate(tb.getDate()+7);kaydirma='Adli tatile denk geldi → +1 hafta (HMK)';}else{sonGun=new Date(tb);sonGun.setDate(tb.getDate()+7);kaydirma='Adli tatile denk geldi → +7 gün (İYUK m.8/3)';}}
  const dow=sonGun.getDay();
  if(dow===6){sonGun.setDate(sonGun.getDate()+2);kaydirma=(kaydirma?kaydirma+' + ':'')+'Cumartesiye denk → Pazartesi';}
  else if(dow===0){sonGun.setDate(sonGun.getDate()+1);kaydirma=(kaydirma?kaydirma+' + ':'')+'Pazara denk → Pazartesi';}
  if(kaydirma)adimlar.push({label:'KAYDIRMA',val:formatDate(sonGun.toISOString().split('T')[0]),desc:kaydirma});
  return{sonGun,adimlar};
}
function buildHesapHTML(d){
  if(!d)return'';
  let h='';
  h+='<div style="background:var(--navy-light);padding:7px 13px;font-size:11px;font-weight:600;color:var(--navy);text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid #d0dcea;">Süre Hesabı</div>';
  h+=`<div class="hesap-row"><div class="hesap-row-label">TEBLİĞ</div><div class="hesap-row-val">${formatDate(d.tebligTarihi)} <span class="hesap-row-desc">${tebligLabel(d.tebligSekli)} olarak alındı</span></div></div>`;
  if(d.isEteb)h+=`<div class="hesap-row"><div class="hesap-row-label">E-TEBLİGAT</div><div class="hesap-row-val">${formatDate(d.fiiliTeblig)} <span class="hesap-row-desc">+5 gün eklendi</span></div></div>`;
  (d.adimlar||[]).forEach(a=>h+=`<div class="hesap-row"><div class="hesap-row-label">${a.label}</div><div class="hesap-row-val">${a.val} <span class="hesap-row-desc">${a.desc}</span></div></div>`);
  // Son gün saatini belirle
  let sonGunSaatStr='23:59';
  if(d.istipi==='E-Duruşma Talebi'&&d.adimlar&&d.adimlar[0]){
    const parts=d.adimlar[0].val.split(' ');
    const saatKandidati=parts[parts.length-1];
    if(/^\d{2}:\d{2}$/.test(saatKandidati)) sonGunSaatStr=saatKandidati;
  }
  const isKesinlesme=(d.istipi==='İcranın Kesinleşmesi'||d.istipi==='Dosyanın Kesinleşmesi')&&d.sonGun;
  if(isKesinlesme){
    const kesinlesmeD=new Date(d.sonGun+'T12:00:00');
    kesinlesmeD.setDate(kesinlesmeD.getDate()+1);
    const gun=kesinlesmeD.getDate(),ay=kesinlesmeD.toLocaleDateString('tr-TR',{month:'long'}),yil=kesinlesmeD.getFullYear();
    h+=`<div class="hesap-son" style="display:flex;flex-direction:column;align-items:center;gap:4px;">
      <div>SON GÜN &nbsp; ${formatDate(d.sonGun)} &nbsp; ${sonGunSaatStr}</div>
      <div style="font-size:11px;font-weight:500;opacity:0.9;">(Son günün ertesi günü kesinleşir)</div>
    </div>`;
    h+=`<div style="background:#fef3c7;padding:9px 13px;font-size:13px;font-weight:700;text-align:center;color:#92400e;">⚡ Kesinleşme: ${gun} ${ay} ${yil}</div>`;
  } else {
    h+=`<div class="hesap-son">SON GÜN &nbsp; ${formatDate(d.sonGun)} &nbsp; ${sonGunSaatStr}</div>`;
  }
  return h;
}

// ── FORM ──────────────────────────────────────────────────────────
function setChip(g,val,el){
  const ids={teblig:'teblig-chips',dal:'dal-chips',dal2:'dal-chips-d'};
  document.querySelectorAll('#'+ids[g]+' .chip').forEach(c=>c.classList.remove('sel'));
  el.classList.add('sel');ST[g]=val;
  if(g==='teblig'){document.getElementById('eteb-uyari').style.display=val==='etebligat'?'block':'none';hesapla();}
  if(g==='dal')hesapla();
  if(g==='dal2'){
    const dosyaBox=document.getElementById('durusma-dosya-box');
    const mahkemeBox=document.getElementById('durusma-mahkeme-box');
    const baslikLabel=document.getElementById('durusma-baslik-label');
    const randevuMahkemeSatir=document.getElementById('durusma-randevu-mahkeme-satir');
    if(val==='randevu'){
      if(dosyaBox) dosyaBox.style.display='block'; // randevuda da dosya kutusu görünsün
      if(mahkemeBox) mahkemeBox.style.display='none';
      if(baslikLabel) baslikLabel.textContent='Randevu Konusu';
      if(randevuMahkemeSatir) randevuMahkemeSatir.style.display='block';
    } else {
      if(dosyaBox) dosyaBox.style.display='block';
      if(mahkemeBox) mahkemeBox.style.display='block';
      if(baslikLabel) baslikLabel.textContent='Mahkeme Adı';
      if(randevuMahkemeSatir) randevuMahkemeSatir.style.display='none';
    }
  }
}
function setBirim(b,el){document.querySelectorAll('.sure-birim-btn').forEach(x=>x.classList.remove('sel'));el.classList.add('sel');ST.birim=b;hesapla();}
let ST_TEKRAR_SIKLIK = '';
function setTekrarSiklik(val,el){
  document.querySelectorAll('#tekrar-siklik-chips .chip').forEach(x=>x.classList.remove('sel'));
  el.classList.add('sel');
  ST_TEKRAR_SIKLIK = val;
}
function setType(t,el){
  document.querySelectorAll('.type-tab').forEach(x=>x.classList.remove('sel'));el.classList.add('sel');ST.type=t;
  document.getElementById('form-sure').style.display=t==='sure'?'block':'none';
  document.getElementById('form-durusma').style.display=t==='durusma'?'block':'none';
  document.getElementById('form-genel').style.display=t==='genel'?'block':'none';
  const ft=document.getElementById('form-tekrar');if(ft)ft.style.display=t==='tekrar'?'block':'none';
  if(t==='tekrar'&&ST.prefillDate){const ftd=document.getElementById('f-tekrar-tarih');if(ftd&&!ftd.value)ftd.value=ST.prefillDate;}
  const titles={sure:'Süreli İş',durusma:'Duruşma / Randevu',genel:'Genel İş',tekrar:'Tekrarlayan İş'};
  document.getElementById('modal-title').textContent=titles[t]+(ST.editId?' — Düzenle':' Ekle');
  const seciliM=MUVEKKIL_KARTLARI.find(x=>String(x.id)===String(ST.muvekkilId));if(seciliM)aktifFormaMuvekkilYaz(seciliM.ad);
  const seciliD=DAVA_DOSYALARI.find(x=>String(x.id)===String(ST.davaDosyasiId));if(seciliD)aktifFormaDosyaYaz(seciliD);
  kayitOrtakDosyaBilgisiniFormaYaz();
}
function toggleCollapsible(h){h.querySelector('.collapsible-arrow').classList.toggle('open');h.nextElementSibling.classList.toggle('open');}
let ST_MANUEL_SURE=false;
function manuelSonGunAc(){
  ST_MANUEL_SURE=true;
  document.getElementById('sure-oto-alanlar').style.display='none';
  document.getElementById('sure-manuel-alan').style.display='block';
}
function manuelSonGunKapat(){
  ST_MANUEL_SURE=false;
  document.getElementById('sure-oto-alanlar').style.display='block';
  document.getElementById('sure-manuel-alan').style.display='none';
}
function hesapla(){
  const teb=document.getElementById('f-teblig-tarihi').value;
  const mik=parseInt(document.getElementById('f-sure-miktar').value);
  const box=document.getElementById('sure-hesap-box');
  if(!teb||!mik||mik<1||!ST.birim||!ST.dal){box.classList.remove('show');ST.hesaplananTarih=null;return;}
  let base=new Date(teb+'T12:00:00');
  const isEteb=ST.teblig==='etebligat';
  if(isEteb)base.setDate(base.getDate()+5);
  const{sonGun,adimlar}=hesaplaSureMotoru(base,mik,ST.birim,ST.dal,selectedIstipi);
  ST.hesaplananTarih=sonGun.toISOString().split('T')[0];
  ST.hesapDetay={tebligTarihi:teb,tebligSekli:ST.teblig,fiiliTeblig:base.toISOString().split('T')[0],isEteb,miktar:mik,birim:ST.birim,dal:ST.dal,istipi:selectedIstipi,adimlar,sonGun:ST.hesaplananTarih};
  box.innerHTML=buildHesapHTML(ST.hesapDetay);box.classList.add('show');
}

// ── MODAL ─────────────────────────────────────────────────────────
function renderKayitKartSecicileri(muvekkilId,dosyaId){
  const ms=document.getElementById('kayit-muvekkil-karti'),ds=document.getElementById('kayit-dosya-karti');if(!ms||!ds)return;
  ms.innerHTML='<option value="">Müvekkil kartı seç...</option>'+MUVEKKIL_KARTLARI.map(m=>`<option value="${m.id}">${esc(m.ad)}</option>`).join('');ms.value=String(muvekkilId||'');
  const secili=new Set((ST.muvekkilIds||[]).map(String));if(muvekkilId)secili.add(String(muvekkilId));ST.muvekkilIds=[...secili];
  kayitDosyaSecenekleriniYenile(dosyaId);
  const bagli=new Set(ST.davaDosyasiId?DOSYA_MUVEKKIL_BAGLARI.filter(x=>String(x.dava_dosyasi_id)===String(ST.davaDosyasiId)).map(x=>String(x.muvekkil_id)):[]);bagli.forEach(id=>secili.add(id));ST.muvekkilIds=[...secili];
  kayitMuvekkilSecimGorunumunuYenile();kayitBaglantiGorunumunuGuncelle();
}
function kayitDosyaSecenekleriniYenile(secilecekId){
  const ds=document.getElementById('kayit-dosya-karti');if(!ds)return;const ids=new Set((ST.muvekkilIds||[]).map(String)),dosyaIds=new Set(DOSYA_MUVEKKIL_BAGLARI.filter(b=>ids.has(String(b.muvekkil_id))).map(b=>String(b.dava_dosyasi_id))),dosyalar=ids.size?DAVA_DOSYALARI.filter(d=>dosyaIds.has(String(d.id))):[];
  const onceki=String(secilecekId||ST.davaDosyasiId||''),placeholder=!ids.size?'Önce müvekkil seçin':dosyalar.length?'Dosya seçmek zorunlu değildir':'Bu müvekkile bağlı kayıtlı dosya yok';
  ds.innerHTML=`<option value="">${placeholder}</option>`+dosyalar.map(d=>`<option value="${d.id}">${esc((d.dosya_no||'Numarasız dosya')+(d.mahkeme?' — '+d.mahkeme:''))}</option>`).join('');ds.value=dosyalar.some(d=>String(d.id)===onceki)?onceki:'';ST.davaDosyasiId=ds.value||null;ds.disabled=!ids.size||!dosyalar.length;
}
function aktifFormaMuvekkilYaz(ad){const map={sure:'f-muvekkil',durusma:'f-durusma-muvekkil',genel:'f-genel-muvekkil',tekrar:'f-tekrar-muvekkil'},el=document.getElementById(map[ST.type]);if(el)el.value=ad||'';}
function aktifFormaDosyaYaz(d){
  if(!d)return;const p=String(d.dosya_no||'').split('/'),yil=p[0]||'',no=p.slice(1).join('/')||p[0]||'';
  const ids={sure:['f-dava-yil','f-dava-no','f-mahkeme'],durusma:['f-durusma-yil','f-durusma-no','f-durusma-mahkeme-adi'],genel:['f-genel-yil','f-genel-no','f-genel-mahkeme'],tekrar:['f-tekrar-yil','f-tekrar-no','f-tekrar-mahkeme']}[ST.type];if(!ids)return;
  if(/^\d{4}$/.test(yil)&&p.length>1)setYil(ids[0],yil);const noEl=document.getElementById(ids[1]);if(noEl)noEl.value=p.length>1?no:(d.dosya_no||'');const mEl=document.getElementById(ids[2]);if(mEl)mEl.value=d.mahkeme||'';
  const hukuk=String(d.hukuk_alani||'').toLocaleLowerCase('tr-TR'),dal=hukuk.includes('ceza')?'ceza':hukuk.includes('icra')?'icra':hukuk.includes('idare')?'idare':hukuk.includes('tahkim')?'tahkim':hukuk.includes('arabuluculuk')?'arabuluculuk':hukuk?'hukuk':'';
  const grup=ST.type==='sure'?'dal-chips':ST.type==='durusma'?'dal-chips-d':'';
  if(dal&&grup){const chip=[...document.querySelectorAll('#'+grup+' .chip')].find(x=>(x.getAttribute('onclick')||'').includes("'"+dal+"'"));if(chip)setChip(ST.type==='sure'?'dal':'dal2',dal,chip);}
  const ozet=document.getElementById('kayit-dosya-ozet');if(ozet){const detay=[d.hukuk_alani,d.taraf_sifati&&'Sıfat: '+d.taraf_sifati,d.karsi_taraf&&'Karşı taraf: '+d.karsi_taraf].filter(Boolean);ozet.innerHTML='<b>'+esc(d.dosya_no||'Seçili dosya')+'</b>'+(detay.length?' · '+detay.map(esc).join(' · '):'')+'<br>Dosya bilgileri forma otomatik aktarıldı.';ozet.style.color='var(--navy)';}
}
function kayitMuvekkilKartiSecildi(){const id=document.getElementById('kayit-muvekkil-karti').value||null;ST.muvekkilIds=id?[id]:[];kayitMuvekkilSecimGorunumunuYenile();}
function kayitMuvekkilCokluDegisti(){kayitMuvekkilSecimGorunumunuYenile();}
function kayitMuvekkilSecimGorunumunuYenile(){
  ST.muvekkilIds=[...new Set((ST.muvekkilIds||[]).map(String))].filter(id=>MUVEKKIL_KARTLARI.some(m=>String(m.id)===id));ST.muvekkilId=ST.muvekkilIds[0]||null;
  const adlar=ST.muvekkilIds.map(id=>MUVEKKIL_KARTLARI.find(m=>String(m.id)===id)?.ad).filter(Boolean),box=document.getElementById('kayit-muvekkil-secilenler');
  if(box)box.innerHTML=adlar.length?ST.muvekkilIds.map(id=>{const m=MUVEKKIL_KARTLARI.find(x=>String(x.id)===id);return `<span class="kayit-muvekkil-chip">${esc(m.ad)}<button type="button" onclick="kayitMuvekkilCikar('${id}')" aria-label="Müvekkili çıkar">×</button></span>`;}).join(''):'<span style="font-size:12px;color:var(--text3);">Henüz müvekkil seçilmedi.</span>';
  aktifFormaMuvekkilYaz(adlar.join(', '));const o=document.getElementById('kayit-dosya-ozet');if(o&&!ST.davaDosyasiId)o.textContent=adlar.length?adlar.length+' müvekkil seçildi.':'Dosyasız iş için müvekkil seçebilir veya yeni müvekkil ekleyebilirsiniz.';
}
function kayitMuvekkilAramaSonuclari(){
  const input=document.getElementById('kayit-muvekkil-ara'),box=document.getElementById('kayit-muvekkil-arama-sonuc');if(!input||!box)return;const q=String(input.value||'').trim().toLocaleLowerCase('tr-TR');
  if(!q){box.style.display='none';box.innerHTML='';return;}const bulunan=MUVEKKIL_KARTLARI.filter(m=>!(ST.muvekkilIds||[]).map(String).includes(String(m.id))&&String(m.ad||'').toLocaleLowerCase('tr-TR').includes(q)).slice(0,8);
  box.innerHTML=bulunan.length?bulunan.map(m=>`<button type="button" onclick="kayitMuvekkilSec('${m.id}')"><b>${esc(m.ad)}</b></button>`).join(''):'<div class="empty">Eşleşen kayıt yok. “Yeni Müvekkil” ile ekleyebilirsiniz.</div>';box.style.display='block';
}
function kayitMuvekkilSec(id){if(!(ST.muvekkilIds||[]).map(String).includes(String(id)))ST.muvekkilIds=[...(ST.muvekkilIds||[]),String(id)];const i=document.getElementById('kayit-muvekkil-ara'),b=document.getElementById('kayit-muvekkil-arama-sonuc');if(i)i.value='';if(b)b.style.display='none';kayitMuvekkilSecimGorunumunuYenile();kayitDosyaSecenekleriniYenile();}
function kayitMuvekkilCikar(id){ST.muvekkilIds=(ST.muvekkilIds||[]).filter(x=>String(x)!==String(id));kayitMuvekkilSecimGorunumunuYenile();kayitDosyaSecenekleriniYenile();}
function kayitBaglantiGorunumunuGuncelle(){const secili=!!ST.davaDosyasiId,elemanlar=[document.querySelector('#form-sure .dosya-box:has(#f-mahkeme)'),document.getElementById('durusma-mahkeme-box'),document.getElementById('durusma-dosya-box'),document.querySelector('#form-tekrar .dosya-box:has(#f-tekrar-mahkeme)')];elemanlar.forEach(x=>{if(x)x.style.display=secili?'none':'';});const gh=document.querySelector('#form-genel .collapsible-header'),gb=gh?.nextElementSibling;if(gh)gh.style.display=secili?'none':'';if(gb&&secili)gb.classList.remove('open');}
function kayitEkranindanYeniMuvekkilEkle(){let ov=document.getElementById('kayit-yeni-muvekkil-overlay');if(!ov){ov=document.createElement('div');ov.id='kayit-yeni-muvekkil-overlay';ov.className='modal-overlay';ov.style.zIndex='10020';ov.innerHTML=`<div class="modal" style="max-width:480px;"><div class="modal-header"><h2>Yeni Müvekkil</h2><button type="button" class="btn" onclick="document.getElementById('kayit-yeni-muvekkil-overlay').remove()">✕</button></div><div class="modal-body"><div class="fg"><label>Ad Soyad / Unvan</label><input id="kayit-yeni-m-ad" autocomplete="off"></div><div style="font-size:11px;color:var(--text3);margin:-4px 0 12px;">Kişisel veri miktarını azaltmak için başka iletişim veya kimlik bilgisi tutulmaz.</div><button type="button" class="save-btn" onclick="kayitYeniMuvekkilKaydet()">Kaydet ve Seç</button></div></div>`;document.body.appendChild(ov);}ov.style.display='flex';setTimeout(()=>document.getElementById('kayit-yeni-m-ad')?.focus(),30);}
async function kayitYeniMuvekkilKaydet(){const ad=document.getElementById('kayit-yeni-m-ad')?.value.trim();if(!ad){alert('Müvekkil adı gereklidir.');return;}const kayit={buro_id:_buro.id,ad,created_by:_user.id};const{data,error}=await sb.from('muvekkiller').insert(kayit).select('id,buro_id,ad').single();if(error){alert('Müvekkil eklenemedi: '+error.message);return;}MUVEKKIL_KARTLARI.push(data);ST.muvekkilIds=[...(ST.muvekkilIds||[]),String(data.id)];if(ST.davaDosyasiId){const{error:bagHata}=await sb.from('dava_dosyasi_muvekkilleri').insert({dava_dosyasi_id:ST.davaDosyasiId,muvekkil_id:data.id});if(!bagHata)DOSYA_MUVEKKIL_BAGLARI.push({dava_dosyasi_id:ST.davaDosyasiId,muvekkil_id:data.id});}document.getElementById('kayit-yeni-muvekkil-overlay')?.remove();renderKayitKartSecicileri(data.id,ST.davaDosyasiId);}
function kayitOrtakDosyaAlanlariniHazirla(){const s=document.getElementById('kayit-ortak-dosya-yil');if(!s||s.options.length)return;const y=new Date().getFullYear();for(let i=y+2;i>=y-10;i--)s.add(new Option(String(i),String(i)));s.value=String(y);}
function kayitOrtakDosyaAlanlariniDoldur(){kayitOrtakDosyaAlanlariniHazirla();const d=DAVA_DOSYALARI.find(x=>String(x.id)===String(ST.davaDosyasiId)),mah=document.getElementById('kayit-ortak-mahkeme'),no=document.getElementById('kayit-ortak-dosya-no'),yil=document.getElementById('kayit-ortak-dosya-yil');if(d){const p=String(d.dosya_no||'').split('/');if(mah)mah.value=d.mahkeme||'';if(yil&&/^\d{4}$/.test(p[0]))yil.value=p[0];if(no)no.value=p.length>1?p.slice(1).join('/'):(d.dosya_no||'');}kayitOrtakDosyaBilgisiniFormaYaz();}
function kayitOrtakDosyaBilgisiniFormaYaz(){const mah=document.getElementById('kayit-ortak-mahkeme')?.value||'',no=document.getElementById('kayit-ortak-dosya-no')?.value||'',yil=document.getElementById('kayit-ortak-dosya-yil')?.value||String(new Date().getFullYear());['f-mahkeme','f-durusma-mahkeme-adi','f-durusma-randevu-mahkeme','f-genel-mahkeme','f-tekrar-mahkeme'].forEach(id=>{const e=document.getElementById(id);if(e)e.value=mah;});['f-dava-no','f-durusma-no','f-genel-no','f-tekrar-no'].forEach(id=>{const e=document.getElementById(id);if(e)e.value=no;});['f-dava-yil','f-durusma-yil','f-genel-yil','f-tekrar-yil'].forEach(id=>setYil(id,yil));}
function kayitDosyaKartiSecildi(){
  const id=document.getElementById('kayit-dosya-karti').value||null,d=DAVA_DOSYALARI.find(x=>String(x.id)===String(id));ST.davaDosyasiId=id;
  if(!d){const o=document.getElementById('kayit-dosya-ozet');if(o){o.textContent='Dosya seçmeden de yalnızca müvekkil bağlantısıyla kayıt oluşturabilirsiniz.';o.style.color='var(--text3)';}return;}
  renderKayitKartSecicileri(null,id);aktifFormaDosyaYaz(d);kayitOrtakDosyaAlanlariniDoldur();
  const bagliIds=DOSYA_MUVEKKIL_BAGLARI.filter(x=>String(x.dava_dosyasi_id)===String(id)).map(x=>String(x.muvekkil_id)),muvekkiller=MUVEKKIL_KARTLARI.filter(x=>bagliIds.includes(String(x.id))),ozet=document.getElementById('kayit-dosya-ozet');if(ozet)ozet.innerHTML=`<b>${esc(d.dosya_no||'Seçili dosya')}</b>${d.mahkeme?' · '+esc(d.mahkeme):''}<br>${muvekkiller.length?'<b>'+muvekkiller.length+' müvekkil bağlı:</b> '+muvekkiller.map(x=>esc(x.ad)).join(', '):'Bu dosyaya bağlı müvekkil bulunmuyor.'}`;kayitBaglantiGorunumunuGuncelle();
}

function openModal(editRecord,prefillDate){
  ST={type:'sure',teblig:'',dal:'',dal2:'',birim:'',hesaplananTarih:null,hesapDetay:null,editId:null,prefillDate:prefillDate||'',muvekkilId:null,muvekkilIds:[],davaDosyasiId:null};
  selectedIstipi='';
  document.querySelectorAll('.chip,.type-tab,.sure-birim-btn').forEach(c=>c.classList.remove('sel'));
  document.querySelector('.type-tab').classList.add('sel');
  const cy=new Date().getFullYear();
  ['f-teblig-tarihi','f-sure-saat','f-mahkeme','f-dava-no','f-muvekkil','f-not-sure','f-sure-miktar','f-durusma-mahkeme-adi','f-durusma-no','f-durusma-muvekkil','f-durusma-not','f-durusma-saat','f-genel-baslik','f-genel-mahkeme','f-genel-no','f-genel-muvekkil','f-genel-aciklama','f-genel-saat','istipi-search','f-istipi-val','f-istipi-text','f-durusma-randevu-mahkeme','istipi-search-genel','f-sure-son-gun-manuel'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  manuelSonGunKapat();
  setYil('f-dava-yil',cy);setYil('f-durusma-yil',cy);setYil('f-genel-yil',cy);setYil('f-tekrar-yil',cy);
  const today=prefillDate||'';
  document.getElementById('f-durusma-tarih').value=today;
  document.getElementById('f-genel-tarih').value=today;
  const ftd=document.getElementById('f-tekrar-tarih');if(ftd)ftd.value=prefillDate||'';
  document.getElementById('sure-hesap-box').classList.remove('show');
  ST_TEKRAR_SIKLIK='';
  const ft=document.getElementById('form-tekrar');if(ft)ft.style.display='none';
  document.querySelectorAll('#tekrar-siklik-chips .chip').forEach(x=>x.classList.remove('sel'));
  ['f-tekrar-baslik','f-tekrar-bitis2','f-tekrar-aciklama'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const ftt=document.getElementById('f-tekrar-tarih');if(ftt)ftt.value='';
  ST_TEKRAR=''; ST_TEKRAR_D=''; ST_TEKRAR_SIKLIK='';
  document.querySelectorAll('#tekrar-chips .chip, #tekrar-chips-d .chip').forEach(x=>x.classList.remove('sel'));
  const tc0=document.querySelector('#tekrar-chips .chip');if(tc0)tc0.classList.add('sel');
  const td0=document.querySelector('#tekrar-chips-d .chip');if(td0)td0.classList.add('sel');
  const tbb=document.getElementById('tekrar-bitis-box');if(tbb)tbb.style.display='none';
  const tbbd=document.getElementById('tekrar-bitis-box-d');if(tbbd)tbbd.style.display='none';
  const ftb=document.getElementById('f-tekrar-bitis');if(ftb)ftb.value='';
  const ftbd=document.getElementById('f-tekrar-bitis-d');if(ftbd)ftbd.value='';
  document.getElementById('eteb-uyari').style.display='none';
  document.getElementById('istipi-list').style.display='none';
  const ilg=document.getElementById('istipi-list-genel');if(ilg)ilg.style.display='none';
  document.getElementById('form-sure').style.display='block';
  document.getElementById('form-durusma').style.display='none';
  document.getElementById('form-genel').style.display='none';
  const ddb=document.getElementById('durusma-dosya-box');if(ddb)ddb.style.display='block';
  const dmb=document.getElementById('durusma-mahkeme-box');if(dmb)dmb.style.display='block';
  const dbl=document.getElementById('durusma-baslik-label');if(dbl)dbl.textContent='Mahkeme Adı';
  document.getElementById('form-tekrar').style.display='none';
  document.querySelectorAll('#tekrar-siklik-chips .chip').forEach(x=>x.classList.remove('sel'));
  ['f-tekrar-baslik','f-tekrar-saat','f-tekrar-bitis2','f-tekrar-mahkeme','f-tekrar-no','f-tekrar-muvekkil','f-tekrar-aciklama'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('f-tekrar-tarih').value='';
  document.getElementById('modal-title').textContent='Süreli İş Ekle';
  kayitOrtakDosyaAlanlariniHazirla();
  const ortakMah=document.getElementById('kayit-ortak-mahkeme'),ortakNo=document.getElementById('kayit-ortak-dosya-no'),ortakYil=document.getElementById('kayit-ortak-dosya-yil'),ortakDetay=document.getElementById('kayit-ortak-dosya-detay'),mAra=document.getElementById('kayit-muvekkil-ara'),mSonuc=document.getElementById('kayit-muvekkil-arama-sonuc');
  if(ortakMah)ortakMah.value='';if(ortakNo)ortakNo.value='';if(ortakYil)ortakYil.value=String(cy);if(ortakDetay)ortakDetay.open=false;if(mAra)mAra.value='';if(mSonuc)mSonuc.style.display='none';
  renderKayitKartSecicileri(null,null);

  if(editRecord){
    ST.editId=editRecord.id;ST.type=editRecord.type;
    document.querySelectorAll('.type-tab').forEach(x=>x.classList.remove('sel'));
    // Tekrarlayan iş için 4. sekme (index 3)
    const tabIdx={sure:0,durusma:1,genel:2,tekrar:3}[editRecord.type]||0;
    const tabs=document.querySelectorAll('.type-tab');
    if(tabs[tabIdx]) tabs[tabIdx].classList.add('sel');
    const titles={sure:'Süreli İş',durusma:'Duruşma / Randevu',genel:'Genel İş',tekrar:'Tekrarlayan İş'};
    document.getElementById('modal-title').textContent=(titles[editRecord.type]||editRecord.type)+' — Düzenle';
    document.getElementById('form-sure').style.display=editRecord.type==='sure'?'block':'none';
    document.getElementById('form-durusma').style.display=editRecord.type==='durusma'?'block':'none';
    document.getElementById('form-genel').style.display=editRecord.type==='genel'?'block':'none';
    document.getElementById('form-tekrar').style.display=editRecord.type==='tekrar'?'block':'none';
    if(editRecord.type==='sure'){
      document.getElementById('f-sure-saat').value=editRecord.saat||'';
      document.getElementById('f-teblig-tarihi').value=editRecord.tebligTarihi||'';
      document.getElementById('f-sure-miktar').value=editRecord.sureMiktar||'';
      document.getElementById('f-mahkeme').value=editRecord.mahkeme||'';
      document.getElementById('f-muvekkil').value=editRecord.muvekkil||'';
      document.getElementById('f-not-sure').value=editRecord.not||'';
      if(editRecord.istipiVal)selectIstipi(editRecord.istipiVal);
      const dp=(editRecord.dava||'').split('/');setYil('f-dava-yil',dp[0]||cy);document.getElementById('f-dava-no').value=dp[1]||'';
      if(editRecord.tebligSekli){const el=document.querySelector('#teblig-chips .chip[onclick*="\''+editRecord.tebligSekli+'\'"]');if(el){el.classList.add('sel');ST.teblig=editRecord.tebligSekli;document.getElementById('eteb-uyari').style.display=editRecord.tebligSekli==='etebligat'?'block':'none';}}
      if(editRecord.dal){const el=document.querySelector('#dal-chips .chip[onclick*="\''+editRecord.dal+'\'"]');if(el){el.classList.add('sel');ST.dal=editRecord.dal;}}
      if(editRecord.sureBirim){const bEl=document.querySelector('.sure-birim-btn[onclick*="\''+editRecord.sureBirim+'\'"]');if(bEl){bEl.classList.add('sel');ST.birim=editRecord.sureBirim;}}
      hesapla();
    } else if(editRecord.type==='tekrar'){
      document.getElementById('f-tekrar-baslik').value=editRecord.baslik||'';
      document.getElementById('f-tekrar-tarih').value=editRecord.date||'';
      document.getElementById('f-tekrar-bitis2').value=editRecord.tekrarBitis||'';
      document.getElementById('f-tekrar-aciklama').value=editRecord.not||'';
      document.getElementById('f-tekrar-mahkeme').value=editRecord.mahkeme||'';
      document.getElementById('f-tekrar-muvekkil').value=editRecord.muvekkil||'';
      const tdp=(editRecord.dava||'').split('/');setYil('f-tekrar-yil',tdp[0]||cy);document.getElementById('f-tekrar-no').value=tdp[1]||'';
      if(editRecord.tekrarTipi){
        ST_TEKRAR_SIKLIK=editRecord.tekrarTipi;
        const sc=document.querySelector('#tekrar-siklik-chips .chip[onclick*="\''+editRecord.tekrarTipi+'\'"]');
        if(sc) sc.classList.add('sel');
      }
    } else if(editRecord.type==='durusma'){
      document.getElementById('f-durusma-mahkeme-adi').value=editRecord.mahkeme||'';
      document.getElementById('f-durusma-tarih').value=editRecord.date||'';
      document.getElementById('f-durusma-saat').value=editRecord.saat||'';
      document.getElementById('f-durusma-muvekkil').value=editRecord.muvekkil||'';
      document.getElementById('f-durusma-not').value=editRecord.not||'';
      const dp=(editRecord.dava||'').split('/');setYil('f-durusma-yil',dp[0]||cy);document.getElementById('f-durusma-no').value=dp[1]||'';
      if(editRecord.dal){const el=document.querySelector('#dal-chips-d .chip[onclick*="\''+editRecord.dal+'\'"]');if(el){el.classList.add('sel');ST.dal2=editRecord.dal;}}
      // Randevu tipi için mahkeme/yer alanını göster
      const rms=document.getElementById('durusma-randevu-mahkeme-satir');
      const dmb=document.getElementById('durusma-mahkeme-box');
      if(editRecord.dal==='randevu'){
        if(rms) rms.style.display='block';
        if(dmb) dmb.style.display='none';
        const rmEl=document.getElementById('f-durusma-randevu-mahkeme');
        if(rmEl) rmEl.value=editRecord.mahkeme||'';
        document.getElementById('f-durusma-mahkeme-adi').value='';
      } else {
        if(rms) rms.style.display='none';
      }
    }else{
      document.getElementById('f-genel-baslik').value=editRecord.baslik||'';
      document.getElementById('f-genel-tarih').value=editRecord.date||'';
      document.getElementById('f-genel-saat').value=editRecord.saat||'';
      // Düzenlemede oluşturuldu satırını açıklama alanından çıkar
      const _notSatirlari=(editRecord.not||'').split('\n').filter(s=>!(s.includes('tarihinde oluşturuldu')&&s.includes('Planlandığı tarih')));
      document.getElementById('f-genel-aciklama').value=_notSatirlari.join('\n').trim();
      document.getElementById('f-genel-mahkeme').value=editRecord.mahkeme||'';
      document.getElementById('f-genel-muvekkil').value=editRecord.muvekkil||'';
      const dp=(editRecord.dava||'').split('/');setYil('f-genel-yil',dp[0]||cy);document.getElementById('f-genel-no').value=dp[1]||'';
    }
  }
  if(editRecord){const adlar=String(editRecord.muvekkil||'').split(',').map(x=>muvekkilAdiAnahtari(x));ST.muvekkilIds=MUVEKKIL_KARTLARI.filter(m=>adlar.includes(muvekkilAdiAnahtari(m.ad))).map(m=>String(m.id));renderKayitKartSecicileri(editRecord.muvekkilId,editRecord.davaDosyasiId);const mah=document.getElementById('kayit-ortak-mahkeme'),no=document.getElementById('kayit-ortak-dosya-no'),yil=document.getElementById('kayit-ortak-dosya-yil'),dp=String(editRecord.dava||'').split('/');if(mah)mah.value=editRecord.mahkeme||'';if(yil&&/^\d{4}$/.test(dp[0]))yil.value=dp[0];if(no)no.value=dp.length>1?dp.slice(1).join('/'):'';kayitOrtakDosyaBilgisiniFormaYaz();}
  document.getElementById('modal').style.display='flex';
}
function closeModal(){document.getElementById('modal').style.display='none';}

// Escape tuşu ile modal kapat
document.addEventListener('keydown', function(e){
  if(e.key==='Escape'){
    // Açık olan modalı kapat - en üsttekinden başla
    if(document.getElementById('durusma-sonuc-overlay').style.display==='flex'){closeDurusmaSonuc();return;}
    if(document.getElementById('ek-sure-overlay').style.display==='flex'){closeEkSureOverlay();return;}
    if(document.getElementById('referans-detay-overlay').style.display==='flex'){closeReferansDetay();return;}
    if(document.getElementById('liste-yonetim-overlay').style.display==='flex'){closeListeYonetim();return;}
    if(document.getElementById('notlar-overlay').style.display==='flex'){closeNotlar();return;}
    if(document.getElementById('hizli-not-overlay').style.display==='flex'){closeHizliNot();return;}
    if(document.getElementById('muvekkil-modal').style.display==='flex'){closeMuvekkilModal();return;}
    if(document.getElementById('kayit-modal').style.display==='flex'){closeKayitModal();return;}
    if(document.getElementById('modal').style.display==='flex'){closeModal();return;}
    if(document.getElementById('cal-detail-panel').classList.contains('open')){closeCalDetail();return;}
  }
});

// Geri butonu ile modal kapat
;

// Enter tuşu ile kaydet
document.addEventListener('keydown', function(e){
  if(e.key==='Enter' && document.getElementById('modal').style.display==='flex'){
    // Textarea veya dropdown içindeyse kaydetme
    const tag = document.activeElement.tagName.toLowerCase();
    if(tag==='textarea') return;
    if(document.activeElement.closest('.istipi-list')) return;
    if(document.activeElement.closest('.mahkeme-dropdown')) return;
    e.preventDefault();
    saveRecord();
  }
});

// ── E-DURUŞMA TALEBİ OTOMATİK OLUŞTUR ───────────────────────────
// Mahkemenin hangi şehirde olduğunu tespit et
function eDurusmaMetinNorm(metin){return String(metin||'').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
function isDurusmaMuaf(mahkeme,muafYerler){
  const ad=eDurusmaMetinNorm(mahkeme);
  return !!ad&&(muafYerler||[]).some(yer=>ad.includes(eDurusmaMetinNorm(yer)));
}
function isCezaDavasi(dal){
  return dal==='ceza';
}

async function eDurusmaTalebiOlustur(rec){
  if(!rec.date||!_buro?.id) return;
  const{data:ayar,error:ayarHatasi}=await sb.from('buro_ayarlari').select('e_durusma_otomatik,e_durusma_muaf_yerler').eq('buro_id',_buro.id).maybeSingle();
  if(ayarHatasi||!ayar?.e_durusma_otomatik) return;
  if(isDurusmaMuaf(rec.mahkeme,ayar.e_durusma_muaf_yerler)) return;
  if(isCezaDavasi(rec.dal)) return;
  // Randevu, arabuluculuk, keşif, tevkil, cmk gibi özel tiplerde de oluşturma
  const ozelTipler=['arabuluculuk','randevu','kesif','tevkil','cmk','tahkim'];
  if(ozelTipler.includes(rec.dal)) return;

  // Duruşmadan 24 saat önce = son gün
  const durusmaDt=new Date(rec.date+'T'+(rec.saat||'00:00')+':00');
  const sonGunDt=new Date(durusmaDt.getTime()-24*60*60*1000);
  const sonGunStr=sonGunDt.getFullYear()+'-'+String(sonGunDt.getMonth()+1).padStart(2,'0')+'-'+String(sonGunDt.getDate()).padStart(2,'0');
  const sonGunSaat=String(sonGunDt.getHours()).padStart(2,'0')+':'+String(sonGunDt.getMinutes()).padStart(2,'0');

  const sonGunLong=sonGunDt.toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'});

  const muvekkil=rec.muvekkil||'Müvekkil';
  const mahkeme=rec.mahkeme||'duruşma';
  const baslik='E-Duruşma Talebi: '+muvekkil+' — '+mahkeme;
  const not='Son Gün: '+sonGunLong+' '+sonGunSaat+'\nDuruşma tarihi: '+formatDate(rec.date)+(rec.saat?' saat '+rec.saat:'');

  const yeniRec={
    type:'sure',
    date:sonGunStr,
    baslik,
    muvekkil:rec.muvekkil||null,
    mahkeme:rec.mahkeme||null,
    dava:rec.dava||null,
    dal:rec.dal||null,
    istipi:'E-Duruşma Talebi',
    istipi_val:'E-Duruşma Talebi',
    not_alani:not,
    saat:sonGunSaat,
    tamamlandi:false,
    buro_id:_buro?_buro.id:null,
    // hesap_detay olmadan — sadece basit gösterim
    hesap_detay:{
      tebligTarihi:rec.date,
      tebligSekli:'',
      fiiliTeblig:rec.date,
      isEteb:false,
      miktar:1,birim:'gun',
      dal:rec.dal||'hukuk',
      istipi:'E-Duruşma Talebi',
      adimlar:[{label:'SON GÜN',val:sonGunLong+' '+sonGunSaat,desc:'Duruşmadan 24 saat önce'}],
      sonGun:sonGunStr
    }
  };
  // hesap_detay'ı JSON olarak gönder
  const dbRec=localToDB({...yeniRec,buroId:_buro?_buro.id:null});
  dbRec.hesap_detay=yeniRec.hesap_detay;
  dbRec.saat=sonGunSaat;
  const{data:mevcut}=await sb.from('kayitlar').select('id').eq('buro_id',_buro.id).eq('date',sonGunStr).eq('istipi','E-Duruşma Talebi').eq('baslik',baslik).limit(1).maybeSingle();
  if(mevcut)return;
  await sb.from('kayitlar').insert(dbRec);
}

async function kopyalaRecord(id){
  const rec=records.find(r=>r.id===id);
  if(!rec) return;
  const yeni={...localToDB(rec)};
  delete yeni.id;
  yeni.buro_id=_buro?_buro.id:null;
  yeni.tamamlandi=false;
  // Genel iş ise oluşturulma notunu güncelle
  if(rec.type==='genel'){
    const bugun=new Date();
    const bugunStr=bugun.getFullYear()+'-'+String(bugun.getMonth()+1).padStart(2,'0')+'-'+String(bugun.getDate()).padStart(2,'0');
    const eskiNot=(rec.not||'').split('\n').filter(s=>!(s.includes('tarihinde oluşturuldu')&&s.includes('Planlandığı tarih'))).join('\n').trim();
    const yeniNotSatiri=formatDate(bugunStr)+' tarihinde oluşturuldu. Planlandığı tarih: '+formatDate(rec.date)+'.';
    yeni.not_alani=eskiNot?eskiNot+'\n'+yeniNotSatiri:yeniNotSatiri;
  }
  const {error}=await sb.from('kayitlar').insert(yeni);
  if(error){alert('Kopyalama hatası: '+error.message);return;}
  await loadRecords();
  alert('✓ Kayıt kopyalandı.');
}

// ── KAYDET ────────────────────────────────────────────────────────
async function durusmaCakismasiVarMi(rec){
  if(rec.type!=='durusma'||!rec.date||!rec.saat||!_buro) return false;
  let sorgu=sb.from('kayitlar')
    .select('id,baslik,muvekkil,mahkeme,dava,date,saat,dal')
    .eq('buro_id',_buro.id)
    .eq('type','durusma')
    .eq('date',rec.date)
    .eq('saat',rec.saat)
    .eq('tamamlandi',false);
  if(ST.editId) sorgu=sorgu.neq('id',ST.editId);
  const{data,error}=await sorgu.limit(10);
  let cakisanlar=data||[];
  // Bağlantı sorunu olursa ekrandaki listeyle yine de kontrol et.
  if(error){
    cakisanlar=records.filter(r=>r.type==='durusma'&&!r.tamamlandi&&r.date===rec.date&&r.saat===rec.saat&&String(r.id)!==String(ST.editId||''));
  }
  if(!cakisanlar.length) return false;
  const detay=cakisanlar.slice(0,3).map(r=>{
    const baslik=r.baslik||r.mahkeme||'Duruşma / Randevu';
    return '• '+baslik+(r.muvekkil?' — '+r.muvekkil:'')+(r.dava?' ('+r.dava+')':'');
  }).join('\n');
  return !confirm('⚠️ Saat çakışması bulundu\n\n'+formatDate(rec.date)+' saat '+rec.saat+' için başka bir kayıt var:\n\n'+detay+'\n\nYine de kaydetmek istiyor musunuz?');
}

async function saveRecord(){
  let rec={};
  if(ST.type==='sure'){
    const yil=document.getElementById('f-dava-yil').value,no=document.getElementById('f-dava-no').value.trim();
    if(ST_MANUEL_SURE){
      const manuelTarih=document.getElementById('f-sure-son-gun-manuel').value;
      if(!manuelTarih){alert('Lütfen son günü girin.');return;}
      rec={type:'sure',date:manuelTarih,saat:document.getElementById('f-sure-saat').value,baslik:titleCase(selectedIstipi)||'Süreli İş',tebligTarihi:'',tebligSekli:'',dal:ST.dal||'',sureMiktar:null,sureBirim:'',istipi:selectedIstipi,istipiVal:selectedIstipi,mahkeme:titleCase(document.getElementById('f-mahkeme').value.trim()),dava:yil&&no?yil+'/'+no:(no||''),muvekkil:titleCase(document.getElementById('f-muvekkil').value.trim()),not:sentenceCase(document.getElementById('f-not-sure').value.trim()),hesapDetay:null};
    } else {
      if(!ST.hesaplananTarih){alert('Lütfen tebliğ tarihi, hukuk dalı, süre birimi ve miktarı girin. (Tebligat bilginiz yoksa "Tebligat bilgim yok, son günü direkt gireyim" seçeneğini kullanabilirsiniz.)');return;}
      rec={type:'sure',date:ST.hesaplananTarih,saat:document.getElementById('f-sure-saat').value,baslik:titleCase(selectedIstipi)||'Süreli İş',tebligTarihi:document.getElementById('f-teblig-tarihi').value,tebligSekli:ST.teblig,dal:ST.dal,sureMiktar:parseInt(document.getElementById('f-sure-miktar').value),sureBirim:ST.birim,istipi:selectedIstipi,istipiVal:selectedIstipi,mahkeme:titleCase(document.getElementById('f-mahkeme').value.trim()),dava:yil&&no?yil+'/'+no:(no||''),muvekkil:titleCase(document.getElementById('f-muvekkil').value.trim()),not:sentenceCase(document.getElementById('f-not-sure').value.trim()),hesapDetay:ST.hesapDetay};
    }
  }else if(ST.type==='durusma'){
    const date=document.getElementById('f-durusma-tarih').value;if(!date){alert('Tarih zorunludur.');return;}
    const yil=document.getElementById('f-durusma-yil').value,no=document.getElementById('f-durusma-no').value.trim();
    rec={type:'durusma',date,baslik:(()=>{
      const mAdi=titleCase(document.getElementById('f-durusma-mahkeme-adi').value.trim());
      if(mAdi) return mAdi;
      const ozel={tahkim:'Tahkim',arabuluculuk:'Arabuluculuk',randevu:'Randevu',kesif:'Keşif',tevkil:'Tevkil',cmk:'CMK'};
      return ozel[ST.dal2]||'Duruşma';
    })(),saat:document.getElementById('f-durusma-saat').value,dal:ST.dal2,mahkeme:ST.dal2==='randevu'?titleCase((document.getElementById('f-durusma-randevu-mahkeme')||{value:''}).value.trim()||''):titleCase(document.getElementById('f-durusma-mahkeme-adi').value.trim()),dava:yil&&no?yil+'/'+no:(no||''),muvekkil:titleCase(document.getElementById('f-durusma-muvekkil').value.trim()),not:sentenceCase(document.getElementById('f-durusma-not').value.trim()),tekrarTipi:ST_TEKRAR_D||null,tekrarBitis:ST_TEKRAR_D&&document.getElementById('f-tekrar-bitis-d').value?document.getElementById('f-tekrar-bitis-d').value:null};
  }else if(ST.type==='tekrar'){
    const date=document.getElementById('f-tekrar-tarih').value;
    if(!date){alert('Başlangıç tarihi zorunludur.');return;}
    if(!ST_TEKRAR_SIKLIK){alert('Tekrar sıklığı seçiniz.');return;}
    const yil=document.getElementById('f-tekrar-yil').value,no=document.getElementById('f-tekrar-no').value.trim();
    rec={type:'tekrar',date,baslik:titleCase(document.getElementById('f-tekrar-baslik').value.trim())||'Tekrarlayan İş',not:sentenceCase(document.getElementById('f-tekrar-aciklama').value.trim()),tekrarTipi:ST_TEKRAR_SIKLIK,tekrarBitis:document.getElementById('f-tekrar-bitis2').value||null,mahkeme:titleCase(document.getElementById('f-tekrar-mahkeme').value.trim()),dava:yil&&no?yil+'/'+no:(no||''),muvekkil:titleCase(document.getElementById('f-tekrar-muvekkil').value.trim())};
  }else{
    const date=document.getElementById('f-genel-tarih').value;if(!date){alert('Tarih zorunludur.');return;}
    const yil=document.getElementById('f-genel-yil').value,no=document.getElementById('f-genel-no').value.trim();
    const _mevcutNot=sentenceCase(document.getElementById('f-genel-aciklama').value.trim());
    let _tamNot;
    if(ST.editId){
      // Düzenlemede: mevcut notta "tarihinde oluşturuldu" satırı varsa koru, yoksa sadece notu güncelle
      const _eskiRec=records.find(r=>r.id===ST.editId);
      const _eskiNotSatiri=(_eskiRec?.not||'').split('\n').find(s=>s.includes('tarihinde oluşturuldu')&&s.includes('Planlandığı tarih'));
      if(_eskiNotSatiri){
        _tamNot=_mevcutNot?_mevcutNot+'\n'+_eskiNotSatiri:_eskiNotSatiri;
      } else {
        _tamNot=_mevcutNot||'';
      }
    } else {
      // Yeni kayıt: oluşturulma notu ekle
      const _bugun=new Date();
      const _bugunStr=_bugun.getFullYear()+'-'+String(_bugun.getMonth()+1).padStart(2,'0')+'-'+String(_bugun.getDate()).padStart(2,'0');
      const _olusturmaNotSatiri=formatDate(_bugunStr)+' tarihinde oluşturuldu. Planlandığı tarih: '+formatDate(date)+'.';
      _tamNot=_mevcutNot?_mevcutNot+'\n'+_olusturmaNotSatiri:_olusturmaNotSatiri;
    }
    rec={type:'genel',date,baslik:titleCase(document.getElementById('f-genel-baslik').value.trim())||'Genel İş',saat:document.getElementById('f-genel-saat').value,mahkeme:titleCase(document.getElementById('f-genel-mahkeme').value.trim()),dava:yil&&no?yil+'/'+no:(no||''),muvekkil:titleCase(document.getElementById('f-genel-muvekkil').value.trim()),not:_tamNot,gecmisKayit:(()=>{
      if(ST.editId){const _eskiRec=records.find(r=>r.id===ST.editId);return _eskiRec?.gecmisKayit||false;}
      const _bugun3=new Date();_bugun3.setHours(0,0,0,0);
      const _tarihObj=new Date(date+'T12:00:00');_tarihObj.setHours(0,0,0,0);
      return _tarihObj<_bugun3;
    })()};
  }
  const seciliDosya=DAVA_DOSYALARI.find(x=>String(x.id)===String(ST.davaDosyasiId));
  rec.davaDosyasiId=seciliDosya?seciliDosya.id:null;
  const seciliMuvekkiller=(ST.muvekkilIds||[]).map(id=>MUVEKKIL_KARTLARI.find(m=>String(m.id)===String(id))).filter(Boolean);
  if(seciliMuvekkiller.length){rec.muvekkil=seciliMuvekkiller.map(x=>x.ad).join(', ');rec.muvekkilId=seciliMuvekkiller[0].id;}else rec.muvekkilId=null;
  if(await durusmaCakismasiVarMi(rec)) return;
  const btn=document.getElementById('save-btn');btn.textContent='Kaydediliyor...';btn.disabled=true;
  if(rec.mahkeme)ogrenMahkeme(rec.mahkeme);
  if(!_buro){alert('Oturum hatası.');return;}
  rec.buroId=_buro.id;
  if(ST.editId){
    const {error}=await sb.from('kayitlar').update(localToDB(rec)).eq('id',ST.editId);
    if(error){alert('Güncelleme hatası: '+error.message);}
    // Tekrarlayan iş ise tüm tekrar kayıtlarını da güncelle (tarih hariç)
    else if(rec.type==='tekrar'){
      const anaRec=records.find(r=>r.id===ST.editId);
      const anaId=anaRec?.tekrarAnaId||ST.editId;
      // Başlık ve not güncelle — tarih her tekrarda farklı olduğu için dokunma
      const tekrarGuncelle={
        baslik:localToDB(rec).baslik,
        not_alani:localToDB(rec).not_alani,
        tekrar_tipi:localToDB(rec).tekrar_tipi,
        tekrar_bitis:localToDB(rec).tekrar_bitis,
        mahkeme:localToDB(rec).mahkeme,
        dava:localToDB(rec).dava,
        muvekkil:localToDB(rec).muvekkil,
      };
      await sb.from('kayitlar').update(tekrarGuncelle).eq('tekrar_ana_id',anaId);
      await sb.from('kayitlar').update(tekrarGuncelle).eq('id',anaId);
    }
  }
  else{
    const{error}=await sb.from('kayitlar').insert(localToDB(rec));
    if(error){alert('Kayıt hatası: '+error.message);}
    // Duruşma ise, E-Duruşma Talebi otomatik oluştur
    else if(rec.type==='durusma'){
      await eDurusmaTalebiOlustur(rec);
    }
  }
  btn.textContent='Kaydet';btn.disabled=false;
  closeModal();await loadRecords();
tatilleriYukle();
bildirimIzniAl().then(bildirimDurumGuncelle);
showView('takvim',document.querySelector('.nav-item.active'));

}
async function toggleTamamlandi(id){
  const rec=records.find(r=>r.id===id);
  if(!rec)return;
  // Geri al - direkt
  if(rec.tamamlandi===true){
    const{error}=await sb.from('kayitlar').update({tamamlandi:false}).eq('id',id);
    if(error){alert('Hata: '+error.message);return;}
    await loadRecords();return;
  }
  // Tamamlandı yaparken açıklama her zaman zorunlu
  const not_metni=await metinGirisPenceresi({baslik:'İşi Tamamla',aciklama:'Tamamlanan işin dosya geçmişinde anlaşılır olması için kısa bir açıklama yazın.',etiket:'Yapılan işlem',yerTutucu:'Örn. Dilekçe sunuldu, müvekkile bilgi verildi…',zorunlu:true});
  if(not_metni===null) return;
  const _eskiNot1=rec.not?rec.not+'\n':'';
  const{error}=await sb.from('kayitlar').update({tamamlandi:true,not_alani:_eskiNot1+sentenceCase(not_metni.trim())}).eq('id',id);
  if(error){alert('Hata: '+error.message);return;}
  if(rec.davaDosyasiId){const aciklama=formatDate(rec.date)+(rec.saat?' '+rec.saat:'')+' — '+getBaslik(rec)+' tamamlandı: '+sentenceCase(not_metni.trim());const{error:gecmisHata}=await sb.from('dosya_islem_gecmisi').insert({buro_id:_buro.id,dava_dosyasi_id:rec.davaDosyasiId,aciklama,created_by:_user.id});if(gecmisHata)console.warn('Dosya geçmişi kaydı eklenemedi:',gecmisHata.message);}
  await loadRecords();
  if(document.getElementById('cal-detail-panel').classList.contains('open')){
    showCalDetail(rec.date);
  }
}
async function deleteRecord(id){
  const rec = records.find(r=>r.id===id);
  let msg = 'Bu kaydı silmek istediğinizden emin misiniz?';
  if(rec&&rec.tekrarTipi){
    const choice = confirm('Bu tekrarlayan bir iştir.\n\nTamam: Sadece bu kaydı sil\nİptal: Vazgeç');
    if(!choice) return;
  } else {
    if(!confirm(msg)) return;
  }
  if(!rec) return;
  await silmeyiBeklet([rec],'“'+getBaslik(rec)+'” silindi');
}
async function deleteTekrarHepsi(anaId){
  if(!confirm('Bu tekrarlayan işin TÜM kayıtları silinecek. Emin misiniz?'))return;
  const grup=records.filter(r=>String(r.id)===String(anaId)||String(r.tekrarAnaId)===String(anaId));
  if(!grup.length) return;
  await silmeyiBeklet(grup,grup.length+' tekrarlayan kayıt silindi');
}

function geriAlBildirimiGoster(mesaj){
  let kutu=document.getElementById('geri-al-bildirimi');
  if(!kutu){
    kutu=document.createElement('div');
    kutu.id='geri-al-bildirimi';
    kutu.style.cssText='position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:3000;background:#1f1f1f;color:#fff;border:1px solid rgba(212,175,112,.45);border-radius:12px;box-shadow:0 10px 35px rgba(0,0,0,.28);padding:11px 12px 11px 16px;display:flex;align-items:center;gap:18px;max-width:calc(100vw - 32px);font-size:13px;';
    document.body.appendChild(kutu);
  }
  kutu.innerHTML='<span>'+esc(mesaj)+'</span><button type="button" onclick="silmeIsleminiGeriAl()" style="border:none;background:#d4af70;color:#1a1a1a;border-radius:8px;padding:7px 12px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap;">Geri Al</button>';
  kutu.style.display='flex';
}

function geriAlBildirimiKapat(){
  const kutu=document.getElementById('geri-al-bildirimi');
  if(kutu) kutu.style.display='none';
}

async function bekleyenSilmeyiTamamla(){
  const islem=_bekleyenSilme;
  if(!islem) return;
  clearTimeout(islem.timer);
  _bekleyenSilme=null;
  geriAlBildirimiKapat();
  const{error}=await sb.from('kayitlar').delete().in('id',islem.ids);
  if(error){
    records=[...records,...islem.kayitlar].sort((a,b)=>(a.date||'').localeCompare(b.date||''));
    renderAll();
    alert('Silme hatası: '+error.message);
  }
}

async function silmeyiBeklet(kayitlar,mesaj){
  // Arka arkaya iki ayrı silme yapılırsa ilkini tamamlayıp yenisini beklet.
  if(_bekleyenSilme) await bekleyenSilmeyiTamamla();
  const ids=kayitlar.map(r=>r.id);
  const idSet=new Set(ids.map(String));
  records=records.filter(r=>!idSet.has(String(r.id)));
  openDetailId=null;
  closeCalDetail();
  renderAll();
  _bekleyenSilme={ids,kayitlar:[...kayitlar],timer:null};
  _bekleyenSilme.timer=setTimeout(bekleyenSilmeyiTamamla,8000);
  geriAlBildirimiGoster(mesaj);
}

function silmeIsleminiGeriAl(){
  const islem=_bekleyenSilme;
  if(!islem) return;
  clearTimeout(islem.timer);
  _bekleyenSilme=null;
  records=[...records,...islem.kayitlar].sort((a,b)=>(a.date||'').localeCompare(b.date||''));
  geriAlBildirimiKapat();
  renderAll();
}
