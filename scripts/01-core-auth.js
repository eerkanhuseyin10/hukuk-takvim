/* Sekreter renderer: 01-core-auth.js */
const SUPABASE_URL='https://uocdxifomlrbzorizrud.supabase.co';
const SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvY2R4aWZvbWxyYnpvcml6cnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MzI1MTEsImV4cCI6MjA4OTAwODUxMX0.Vf0hXl-s96DEvGDF3gHNgGyd8EQvvuF8p-XzWmJcv9M';
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

// ── AUTH & PROFİL SİSTEMİ ────────────────────────────────────────
let _user = null;
let _buro = null; // Giriş sonrası buroBilgisiYukle() ile doldurulur
let _platformAdmin=false;
const ROL_ADLARI={platform_admini:'Platform Admini',yonetici:'Yönetici',ortak:'Ortak',calisan:'Çalışan',uye:'Çalışan'};
const KULLANIM_KOSULU_SURUMU='1.0';
async function kullanimKosuluKontrol(){
  const{data}=await sb.from('kullanim_kosulu_onaylari').select('surum').eq('user_id',_user.id).eq('surum',KULLANIM_KOSULU_SURUMU).maybeSingle();if(data)return true;
  return new Promise(resolve=>{let o=document.getElementById('kosul-overlay');if(!o){o=document.createElement('div');o.id='kosul-overlay';o.className='modal-overlay';o.style.zIndex='4000';document.body.appendChild(o);}o.innerHTML=`<div class="modal" style="max-width:650px;"><div class="modal-header"><div><h2>Kullanım Koşulları</h2><div style="font-size:11px;color:var(--text2);">Sürüm ${KULLANIM_KOSULU_SURUMU}</div></div></div><div class="modal-body"><div style="max-height:48vh;overflow:auto;border:1px solid var(--border);border-radius:10px;padding:14px;font-size:12px;line-height:1.65;color:var(--text2);"><b>Önemli kullanım bilgileri</b><p>Sekreter; takvim, süre, dosya ve büro yönetimini destekleyen yardımcı bir yazılımdır. Hukuki görüş vermez ve mevzuat, mahkeme, UYAP veya resmi kayıtların yerine geçmez.</p><p>Kullanıcı; süreleri, tarihleri, hesaplamaları, bildirimleri ve dış kaynaklardan alınan bilgileri resmi kaynaklardan kontrol etmekle sorumludur. Yazılımdaki hata veya kesinti ihtimaline karşı gerekli mesleki kontrolleri ve yedeklemeleri sürdürmelidir.</p><p>Büro yöneticisi, sisteme girilen müvekkil ve dosya verileri bakımından gerekli hukuki dayanağın bulunmasından, çalışanların yetkilendirilmesinden, gizlilik yükümlülüklerinden ve kişisel verilerin hukuka uygun işlenmesinden sorumludur. Kullanıcı yalnızca işlemeye yetkili olduğu verileri yüklemelidir.</p><p>Hesap ve şifre paylaşılmamalı; yetkisi sona eren kullanıcı bürodan çıkarılmalıdır. Teknik güvenlik tedbirleri mutlak güvenlik garantisi anlamına gelmez.</p><p>Bu koşullar emredici hukuk hükümlerini, kişisel verilerin korunmasına ilişkin yükümlülükleri veya kanunen sınırlandırılamayan sorumlulukları ortadan kaldırmaz.</p></div><label style="display:flex;gap:9px;align-items:flex-start;margin:14px 0;font-size:12px;"><input id="kosul-onay" type="checkbox" style="margin-top:2px;"> Kullanım koşullarını okudum ve kabul ediyorum.</label><div style="display:flex;gap:8px;"><button class="btn" style="flex:1;" onclick="cikisYap()">Kabul Etmeden Çık</button><button id="kosul-kabul-btn" class="save-btn" style="flex:1;" onclick="kullanimKosulunuKabulEt()">Kabul Et ve Devam Et</button></div><div id="kosul-msg" style="font-size:11px;color:#b42318;margin-top:8px;"></div></div></div>`;o.style.display='flex';o._resolve=resolve;});
}
async function kullanimKosulunuKabulEt(){const o=document.getElementById('kosul-overlay'),msg=document.getElementById('kosul-msg');if(!document.getElementById('kosul-onay').checked){msg.textContent='Devam etmek için koşulları okuyup onaylayın.';return;}const btn=document.getElementById('kosul-kabul-btn');btn.disabled=true;const{error}=await sb.from('kullanim_kosulu_onaylari').insert({user_id:_user.id,surum:KULLANIM_KOSULU_SURUMU});if(error){msg.textContent='Onay kaydedilemedi: '+error.message;btn.disabled=false;return;}o.style.display='none';o._resolve?.(true);}

function metinGirisPenceresi({baslik='Bilgi Girin',aciklama='',etiket='Açıklama',yerTutucu='',deger='',zorunlu=false}={}){
  return new Promise(resolve=>{
    let o=document.getElementById('metin-giris-overlay');
    if(!o){o=document.createElement('div');o.id='metin-giris-overlay';o.className='modal-overlay';o.style.zIndex='700';document.body.appendChild(o);}
    let kapandi=false;
    const kapat=sonuc=>{if(kapandi)return;kapandi=true;o.style.display='none';resolve(sonuc);};
    o.innerHTML=`<div class="modal" style="max-width:480px;">
      <div class="modal-header"><div><h2>${esc(baslik)}</h2>${aciklama?`<div style="font-size:11px;color:var(--text2);margin-top:4px;">${esc(aciklama)}</div>`:''}</div><button type="button" class="btn" id="metin-giris-kapat">✕</button></div>
      <div class="modal-body"><div class="fg"><label for="metin-giris-alani">${esc(etiket)}</label><textarea id="metin-giris-alani" rows="4" placeholder="${esc(yerTutucu)}">${esc(deger)}</textarea></div><div id="metin-giris-hata" style="min-height:18px;color:#b42318;font-size:11px;"></div><div style="display:flex;justify-content:flex-end;gap:8px;"><button type="button" class="btn" id="metin-giris-iptal">Vazgeç</button><button type="button" class="save-btn" id="metin-giris-kaydet" style="width:auto;padding:10px 22px;">Kaydet</button></div></div>
    </div>`;
    o.style.display='flex';
    const alan=o.querySelector('#metin-giris-alani');
    const kaydet=()=>{const sonuc=alan.value.trim();if(zorunlu&&!sonuc){o.querySelector('#metin-giris-hata').textContent='Bu alan boş bırakılamaz.';alan.focus();return;}kapat(sonuc);};
    o.querySelector('#metin-giris-kapat').onclick=()=>kapat(null);
    o.querySelector('#metin-giris-iptal').onclick=()=>kapat(null);
    o.querySelector('#metin-giris-kaydet').onclick=kaydet;
    o.onclick=e=>{if(e.target===o)kapat(null);};
    alan.onkeydown=e=>{if((e.metaKey||e.ctrlKey)&&e.key==='Enter')kaydet();};
    setTimeout(()=>alan.focus(),30);
  });
}
async function buroBilgisiYukle(){
  if(!_user)return false;
  _platformAdmin=false;_buro=null;
  const{data:pa}=await sb.from('platform_adminleri').select('user_id').eq('user_id',_user.id).maybeSingle();
  if(pa){_platformAdmin=true;return 'platform_admini';}
  const{data:uyelik,error:e1}=await sb.from('buro_uyeleri').select('buro_id,rol').eq('user_id',_user.id).limit(1).maybeSingle();
  if(e1||!uyelik){console.error('Büro üyeliği okunamadı:',e1?.message);return false;}
  const{data:buro,error:e2}=await sb.from('burolar').select('id,ad').eq('id',uyelik.buro_id).maybeSingle();
  if(e2||!buro){console.error('Büro kaydı okunamadı:',e2?.message);return false;}
  _buro={id:buro.id, ad:buro.ad, rol:uyelik.rol||'calisan'};
  return true;
}
function rolArayuzunuUygula(){
  const maliYetkili=_buro&&['yonetici','ortak'].includes(_buro.rol);
  document.querySelectorAll('[data-role-finance]').forEach(el=>el.style.display=maliYetkili?'':'none');
  document.querySelectorAll('[data-role-manager]').forEach(el=>el.style.display=_buro?.rol==='yonetici'?'':'none');
  document.querySelectorAll('[data-role-invite]').forEach(el=>el.style.display=_buro&&['yonetici','ortak'].includes(_buro.rol)?'':'none');
}
async function openDavetPenceresi(){
  if(!_buro||!['yonetici','ortak'].includes(_buro.rol)){alert('Yalnızca yönetici veya ortak davet oluşturabilir.');return;}
  let o=document.getElementById('davet-overlay');if(!o){o=document.createElement('div');o.id='davet-overlay';o.className='modal-overlay';o.style.zIndex='650';document.body.appendChild(o);}
  o.innerHTML=`<div class="modal" style="max-width:460px;"><div class="modal-header"><div><h2>Tek Kullanımlık Davet</h2><div style="font-size:11px;color:var(--text2);margin-top:3px;">Kod 24 saat geçerlidir ve yalnızca bir kez kullanılabilir.</div></div><button class="btn" onclick="document.getElementById('davet-overlay').style.display='none'">✕</button></div><div class="modal-body"><div style="padding:12px;background:var(--surface2);border-radius:10px;font-size:12px;line-height:1.55;margin-bottom:14px;">Yeni kod oluşturulunca önceki kullanılmamış kod iptal edilir. Katılan kullanıcı başlangıçta çalışan olur.</div><button id="davet-olustur-btn" class="save-btn" onclick="davetKoduOlustur()">Yeni Davet Kodu Oluştur</button><div id="davet-kod-sonuc" style="margin-top:14px;"></div></div></div>`;o.style.display='flex';
}
async function davetKoduOlustur(){const btn=document.getElementById('davet-olustur-btn'),sonuc=document.getElementById('davet-kod-sonuc');btn.disabled=true;btn.textContent='Oluşturuluyor…';const{data,error}=await sb.rpc('sekreter_davet_olustur');btn.disabled=false;btn.textContent='Yeni Davet Kodu Oluştur';if(error){sonuc.innerHTML=`<div style="color:#b42318;font-size:12px;">${esc(error.message)}</div>`;return;}sonuc.innerHTML=`<div style="text-align:center;border:1px solid var(--border);border-radius:12px;padding:15px;"><div style="font-size:10px;color:var(--text3);">DAVET KODU</div><b style="font-family:monospace;font-size:23px;letter-spacing:2px;display:block;margin:8px;">${esc(data)}</b><button class="btn" onclick="navigator.clipboard.writeText('${esc(data)}');this.textContent='✓ Kopyalandı'">Kodu Kopyala</button><div style="font-size:10px;color:var(--text3);margin-top:9px;">24 saat içinde tek kişi kullanabilir.</div></div>`;}
async function buroAcilisMesajiniYukle(){if(!_buro)return;const{data}=await sb.from('buro_ayarlari').select('acilis_mesaji,goster').eq('buro_id',_buro.id).maybeSingle();const el=document.getElementById('acilis-mesaji');if(el)el.textContent=data?.goster&&data?.acilis_mesaji?data.acilis_mesaji:'Sekreter hazırlanıyor…';}
async function openAcilisMesajiAyari(){if(_buro?.rol!=='yonetici')return;const{data}=await sb.from('buro_ayarlari').select('acilis_mesaji,goster').eq('buro_id',_buro.id).maybeSingle();let o=document.getElementById('acilis-ayari-overlay');if(!o){o=document.createElement('div');o.id='acilis-ayari-overlay';o.className='modal-overlay';o.style.zIndex='650';document.body.appendChild(o);}o.innerHTML=`<div class="modal" style="max-width:500px;"><div class="modal-header"><h2>Açılış Mesajı / Dua</h2><button class="btn" onclick="document.getElementById('acilis-ayari-overlay').style.display='none'">✕</button></div><div class="modal-body"><label style="display:flex;gap:8px;margin-bottom:12px;"><input id="acilis-goster" type="checkbox" ${data?.goster?'checked':''}> Açılışta özel mesajı göster</label><div class="fg"><label>Mesaj veya dua</label><textarea id="acilis-metin" rows="5" maxlength="500" placeholder="Büronuza özel açılış mesajını yazın…">${esc(data?.acilis_mesaji||'')}</textarea></div><button class="save-btn" onclick="acilisMesajiKaydet()">Kaydet</button></div></div>`;o.style.display='flex';}
async function acilisMesajiKaydet(){const mesaj=(document.getElementById('acilis-metin').value||'').trim(),goster=document.getElementById('acilis-goster').checked;if(goster&&!mesaj){alert('Gösterilecek mesajı yazın.');return;}const{error}=await sb.from('buro_ayarlari').upsert({buro_id:_buro.id,acilis_mesaji:mesaj||null,goster,updated_at:new Date().toISOString(),updated_by:_user.id},{onConflict:'buro_id'});if(error){alert('Kaydedilemedi: '+error.message);return;}document.getElementById('acilis-ayari-overlay').style.display='none';alert('✓ Açılış ayarı kaydedildi.');}
function rolRozeti(rol){const ad=ROL_ADLARI[rol]||rol,renk={yonetici:'#7c3aed',ortak:'#0f766e',calisan:'#475467'}[rol]||'#475467';return `<span style="display:inline-flex;padding:4px 8px;border-radius:999px;background:${renk}15;color:${renk};font-size:11px;font-weight:700;">${ad}</span>`;}
async function openKullaniciYonetimi(){
  if(_buro?.rol!=='yonetici'){alert('Bu alan yalnızca büro yöneticisine açıktır.');return;}
  let o=document.getElementById('kullanici-yonetimi-overlay');if(!o){o=document.createElement('div');o.id='kullanici-yonetimi-overlay';o.className='modal-overlay';o.style.zIndex='590';document.body.appendChild(o);}
  o.innerHTML='<div class="modal" style="max-width:620px;"><div class="modal-header"><div><h2>Kullanıcılar ve Yetkiler</h2><div style="font-size:11px;color:var(--text2);margin-top:3px;">Yalnızca kendi büronuzdaki hesaplar gösterilir.</div></div><button class="btn" onclick="document.getElementById(\'kullanici-yonetimi-overlay\').style.display=\'none\'">✕</button></div><div class="modal-body"><div id="kullanici-yonetimi-liste" style="color:var(--text2);">Kullanıcılar yükleniyor...</div><div id="kullanici-yonetimi-msg" style="font-size:12px;margin-top:10px;"></div></div></div>';o.style.display='flex';o.onclick=e=>{if(e.target===o)o.style.display='none';};
  const{data,error}=await sb.rpc('sekreter_buro_kullanicilari');const l=document.getElementById('kullanici-yonetimi-liste');
  if(error){l.textContent='Kullanıcılar alınamadı: '+error.message;return;}
  l.innerHTML=(data||[]).map(x=>{const ben=String(x.user_id)===String(_user.id);return `<div style="border:1px solid var(--border);border-radius:12px;padding:13px;margin-bottom:9px;"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center;"><div style="min-width:0;"><div style="font-weight:650;overflow-wrap:anywhere;">${esc(x.email||'E-posta yok')}</div><div style="margin-top:5px;">${rolRozeti(x.rol)}${ben?' <span style="font-size:11px;color:var(--text2);">Siz</span>':''}</div></div>${ben?'':`<select aria-label="Kullanıcı rolü" onchange="kullaniciRolDegistir('${x.user_id}',this.value)" style="width:auto;min-width:110px;"><option value="calisan" ${x.rol==='calisan'?'selected':''}>Çalışan</option><option value="ortak" ${x.rol==='ortak'?'selected':''}>Ortak</option></select>`}</div>${ben?'':`<div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:10px;"><button class="btn" style="font-size:11px;" onclick="yoneticiligiDevret('${x.user_id}','${esc(x.email||'')}')">Yöneticiliği Devret</button><button class="btn" style="font-size:11px;color:#b42318;border-color:#fda29b;" onclick="uyeyiBurodanCikar('${x.user_id}','${esc(x.email||'')}')">Bürodan Çıkar</button></div>`}</div>`;}).join('')||'Büronuzda kullanıcı bulunamadı.';
}
async function kullaniciRolDegistir(userId,rol){const msg=document.getElementById('kullanici-yonetimi-msg');msg.textContent='Yetki güncelleniyor...';const{error}=await sb.rpc('sekreter_uye_rolunu_degistir',{target_user_id:userId,yeni_rol:rol});if(error){msg.textContent='Hata: '+error.message;return;}msg.textContent='✓ Yetki güncellendi.';await openKullaniciYonetimi();}
async function yoneticiligiDevret(userId,email){if(!confirm(`${email} yeni büro yöneticisi olacak. Siz ortak rolüne geçeceksiniz. Devam edilsin mi?`))return;const{error}=await sb.rpc('sekreter_yoneticiligi_devret',{target_user_id:userId});if(error){alert('Yöneticilik devredilemedi: '+error.message);return;}_buro.rol='ortak';rolArayuzunuUygula();document.getElementById('kullanici-yonetimi-overlay').style.display='none';alert('✓ Yöneticilik devredildi.');}
async function uyeyiBurodanCikar(userId,email){if(!confirm(`${email} bürodan çıkarılacak. Kullanıcının hesabı silinmeyecek ancak bu büronun verilerine artık erişemeyecek. Devam edilsin mi?`))return;const{error}=await sb.rpc('sekreter_uyeyi_burodan_cikar',{target_user_id:userId});if(error){alert('Kullanıcı çıkarılamadı: '+error.message);return;}await openKullaniciYonetimi();}
let PLATFORM_YONETIM_VERISI=null;
async function platformAdminEkraniniGoster(){
  showApp();
  document.querySelector('.app').innerHTML=`<main style="min-height:100vh;background:#f5f6f8;padding:clamp(16px,3vw,34px);"><section style="width:100%;max-width:1180px;margin:auto;"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap;margin-bottom:22px;"><div><div style="font-size:11px;font-weight:750;color:#9a742f;letter-spacing:.09em;text-transform:uppercase;">Sekreter Sistem Yönetimi</div><h1 style="font-size:27px;margin:6px 0 4px;">Platform Yönetim Paneli</h1><div style="font-size:12px;color:#667085;">Kullanıcı ve büro üyelikleri · Özel büro içerikleri bu panelde gösterilmez</div></div><div style="display:flex;gap:8px;"><button class="btn" onclick="platformAdminVerileriniYukle()">↻ Yenile</button><button class="btn" onclick="openProfilimModal()">Profil</button><button class="btn" onclick="cikisYap()" style="color:#dc2626;">Çıkış</button></div></div><div id="platform-admin-icerik"><div style="padding:30px;text-align:center;color:#667085;background:white;border:1px solid #e2e5ea;border-radius:16px;">Yönetim bilgileri yükleniyor…</div></div></section></main>`;
  await platformAdminVerileriniYukle();
}
function platformTarih(value){if(!value)return 'Henüz giriş yapmadı';const d=new Date(value);return Number.isNaN(d.getTime())?'—':d.toLocaleString('tr-TR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});}
async function platformAdminVerileriniYukle(){
  const alan=document.getElementById('platform-admin-icerik');if(!alan)return;
  alan.innerHTML='<div style="padding:30px;text-align:center;color:#667085;background:white;border:1px solid #e2e5ea;border-radius:16px;">Yönetim bilgileri yükleniyor…</div>';
  const{data,error}=await sb.rpc('sekreter_platform_yonetim_ozeti');
  if(error){alan.innerHTML=`<div style="padding:18px;color:#b42318;background:#fff1f0;border:1px solid #fda29b;border-radius:14px;">Panel yüklenemedi: ${esc(error.message)}<br><small>Önce 13-platform-admin-paneli.sql güncellemesini çalıştırın.</small></div>`;return;}
  PLATFORM_YONETIM_VERISI=data||{istatistik:{},burolar:[],kullanicilar:[]};platformAdminPaneliniCiz();
}
function platformAdminPaneliniCiz(){
  const alan=document.getElementById('platform-admin-icerik');if(!alan||!PLATFORM_YONETIM_VERISI)return;
  const s=PLATFORM_YONETIM_VERISI.istatistik||{},burolar=PLATFORM_YONETIM_VERISI.burolar||[];
  alan.innerHTML=`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-bottom:18px;">${[['Toplam Kullanıcı',s.kullanici_sayisi],['Toplam Büro',s.buro_sayisi],['Aktif Üyelik',s.aktif_uyelik_sayisi],['Bürosuz Hesap',s.burosuz_hesap_sayisi],['Son 30 Gün Giriş',s.son_30_gun_giris]].map(x=>`<div style="background:white;border:1px solid #e2e5ea;border-radius:14px;padding:16px;"><div style="font-size:11px;color:#667085;">${x[0]}</div><b style="display:block;font-size:25px;margin-top:5px;">${Number(x[1]||0).toLocaleString('tr-TR')}</b></div>`).join('')}</div><div style="display:grid;grid-template-columns:minmax(250px,.8fr) minmax(0,2fr);gap:14px;align-items:start;"><section style="background:white;border:1px solid #e2e5ea;border-radius:16px;padding:16px;"><div style="font-weight:750;margin-bottom:12px;">Bürolar</div><div style="display:grid;gap:8px;max-height:620px;overflow:auto;">${burolar.length?burolar.map(b=>`<div style="border:1px solid #eaecf0;border-radius:11px;padding:11px;"><div style="display:flex;justify-content:space-between;gap:8px;"><b>${esc(b.ad||'Adsız Büro')}</b><span style="font-size:11px;color:#667085;">${Number(b.uye_sayisi||0)} kullanıcı</span></div><div style="font-size:10px;color:#98a2b3;margin-top:5px;">${Number(b.yonetici_sayisi||0)} yönetici · ${Number(b.ortak_sayisi||0)} ortak · ${Number(b.calisan_sayisi||0)} çalışan</div></div>`).join(''):'<div style="color:#98a2b3;">Henüz büro yok.</div>'}</div></section><section style="background:white;border:1px solid #e2e5ea;border-radius:16px;padding:16px;min-width:0;"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px;"><div><b>Kullanıcılar</b><div id="platform-kullanici-sayac" style="font-size:10px;color:#98a2b3;margin-top:3px;"></div></div><input id="platform-kullanici-ara" type="search" placeholder="E-posta, ad veya büro ara…" oninput="platformKullanicilariCiz()" style="width:min(100%,310px);"></div><div style="overflow:auto;"><table style="width:100%;min-width:720px;"><thead><tr><th>Kullanıcı</th><th>Büro</th><th>Rol</th><th>Kayıt</th><th>Son giriş</th><th>Durum</th></tr></thead><tbody id="platform-kullanici-tbody"></tbody></table></div></section></div><div style="margin-top:14px;padding:12px 14px;border-radius:12px;background:#ecfdf3;color:#166534;font-size:11px;line-height:1.5;">🔒 Bu panel yalnızca hesap ve üyelik bilgilerini gösterir. Büro takvimi, müvekkiller, dava dosyaları, evraklar ve mali bilgiler platform adminine açılmaz.</div>`;
  platformKullanicilariCiz();
}
function platformKullanicilariCiz(){
  const tbody=document.getElementById('platform-kullanici-tbody');if(!tbody||!PLATFORM_YONETIM_VERISI)return;
  const q=(document.getElementById('platform-kullanici-ara')?.value||'').toLocaleLowerCase('tr-TR').trim(),tum=PLATFORM_YONETIM_VERISI.kullanicilar||[],liste=tum.filter(x=>!q||[x.email,x.ad,x.buro_adi,x.rol].join(' ').toLocaleLowerCase('tr-TR').includes(q));
  const sayac=document.getElementById('platform-kullanici-sayac');if(sayac)sayac.textContent=liste.length+' / '+tum.length+' hesap';
  tbody.innerHTML=liste.length?liste.map(x=>`<tr><td><b>${esc(x.ad||'—')}</b><br><small style="color:#667085;">${esc(x.email||'—')}</small></td><td>${esc(x.buro_adi||'—')}</td><td>${rolRozeti(x.rol||'calisan')}</td><td style="font-size:11px;white-space:nowrap;">${platformTarih(x.kayit_tarihi)}</td><td style="font-size:11px;white-space:nowrap;">${platformTarih(x.son_giris)}</td><td><span style="font-size:10px;font-weight:700;color:${x.durum==='aktif'?'#166534':x.durum==='burosuz'?'#b54708':'#6941c6'};">${x.durum==='aktif'?'Aktif':x.durum==='burosuz'?'Bürosuz':'Platform admini'}</span></td></tr>`).join(''):'<tr><td colspan="6" style="padding:24px;text-align:center;color:#98a2b3;">Aramaya uygun kullanıcı bulunamadı.</td></tr>';
}
// ── AÇILIŞ EKRANI: EN AZ 7 SANİYE GÖRÜNSÜN ────────────────────────
const YUKLEME_BASLANGIC=Date.now();
const YUKLEME_MIN_MS=4000;
function gizleYuklemeEkrani(){
  const kalan=Math.max(0,YUKLEME_MIN_MS-(Date.now()-YUKLEME_BASLANGIC));
  setTimeout(()=>{const lo=document.getElementById('loading-overlay');if(lo)lo.style.display='none';},kalan);
}
// ── BÜROYA ÖZEL EKLENEN İŞ TİPİ / MAHKEME LİSTELERİ ────────────────
let OZEL_ISTIPI=[];
let OZEL_MAHKEME=[];
async function ozelSecenekleriYukle(){
  if(!_buro)return;
  const{data,error}=await sb.from('secenekler').select('*').eq('buro_id',_buro.id);
  if(error){console.warn('secenekler tablosu okunamadı (kurulum gerekebilir):',error.message);return;}
  OZEL_ISTIPI=(data||[]).filter(x=>x.tur==='istipi').map(x=>x.deger);
  OZEL_MAHKEME=(data||[]).filter(x=>x.tur==='mahkeme').map(x=>x.deger);
}
function tumIstipiListesi(){
  return [...new Set([...IS_TIPLERI,...OZEL_ISTIPI])].sort((a,b)=>a.localeCompare(b,'tr'));
}
function tumMahkemeListesi(){
  return [...new Set([...MAHKEMELER,...OZEL_MAHKEME])].sort((a,b)=>a.localeCompare(b,'tr'));
}
async function yeniIstipiKaydet(deger){
  deger=titleCase(deger.trim());if(!deger)return deger;
  if(!tumIstipiListesi().some(x=>x.toLowerCase()===deger.toLowerCase())){
    OZEL_ISTIPI.push(deger);
    if(_buro){const{error}=await sb.from('secenekler').insert({buro_id:_buro.id,tur:'istipi',deger});if(error)console.warn('İş tipi kaydedilemedi:',error.message);}
  }
  return deger;
}
async function yeniIstipiEkleSureli(deger){const v=await yeniIstipiKaydet(deger);selectIstipi(v);}
async function yeniIstipiEkleGenel(deger){const v=await yeniIstipiKaydet(deger);selectIstipiGenel(v);}
async function ogrenMahkeme(deger){
  deger=(deger||'').trim();if(!deger)return;
  if(tumMahkemeListesi().some(x=>x.toLowerCase()===deger.toLowerCase()))return;
  OZEL_MAHKEME.push(deger);
  if(_buro){const{error}=await sb.from('secenekler').insert({buro_id:_buro.id,tur:'mahkeme',deger});if(error)console.warn('Mahkeme kaydedilemedi:',error.message);}
}
// ── LİSTE YÖNETİMİ (özel eklenen İş Tipi / Mahkeme) ────────────────
function openListeYonetim(){
  renderListeYonetim();
  document.getElementById('liste-yonetim-overlay').style.display='flex';
}
function closeListeYonetim(){
  document.getElementById('liste-yonetim-overlay').style.display='none';
}
function renderListeYonetim(){
  const li=document.getElementById('ly-istipi-liste');
  const lm=document.getElementById('ly-mahkeme-liste');
  if(li)li.innerHTML=OZEL_ISTIPI.length?OZEL_ISTIPI.slice().sort((a,b)=>a.localeCompare(b,'tr')).map(x=>`<div class="ly-row"><span>${x}</span><button onclick="lySilIstipi('${x.replace(/'/g,"\\'")}')">🗑 Sil</button></div>`).join(''):'<div class="ly-empty">Henüz özel iş tipi eklenmemiş.</div>';
  if(lm)lm.innerHTML=OZEL_MAHKEME.length?OZEL_MAHKEME.slice().sort((a,b)=>a.localeCompare(b,'tr')).map(x=>`<div class="ly-row"><span>${x}</span><button onclick="lySilMahkeme('${x.replace(/'/g,"\\'")}')">🗑 Sil</button></div>`).join(''):'<div class="ly-empty">Henüz özel mahkeme eklenmemiş.</div>';
}
async function lyIstipiEkle(){
  const inp=document.getElementById('ly-istipi-yeni');
  const v=await yeniIstipiKaydet(inp.value);
  inp.value='';
  renderListeYonetim();
}
async function lyMahkemeEkle(){
  const inp=document.getElementById('ly-mahkeme-yeni');
  await ogrenMahkeme(inp.value);
  inp.value='';
  renderListeYonetim();
}
async function lySilIstipi(deger){
  if(!confirm(`"${deger}" iş tipini silmek istediğinize emin misiniz?`))return;
  OZEL_ISTIPI=OZEL_ISTIPI.filter(x=>x!==deger);
  if(_buro){const{error}=await sb.from('secenekler').delete().eq('buro_id',_buro.id).eq('tur','istipi').eq('deger',deger);if(error)alert('Silme hatası: '+error.message);}
  renderListeYonetim();
}
async function lySilMahkeme(deger){
  if(!confirm(`"${deger}" mahkemeyi silmek istediğinize emin misiniz?`))return;
  OZEL_MAHKEME=OZEL_MAHKEME.filter(x=>x!==deger);
  if(_buro){const{error}=await sb.from('secenekler').delete().eq('buro_id',_buro.id).eq('tur','mahkeme').eq('deger',deger);if(error)alert('Silme hatası: '+error.message);}
  renderListeYonetim();
}
// ── GELİŞTİRME NOTLARI ──────────────────────────────────────────────
const ADMIN_BURO_ID='0d961c7f-fb7f-4679-95da-06704dcea589';
let GELISTIRME_NOTLARI=[];
let TUM_BUROLARDAN_NOTLAR=[];
async function notlariYukle(){
  if(!_buro)return;
  const{data,error}=await sb.from('gelistirme_notlari').select('*').eq('buro_id',_buro.id).order('created_at',{ascending:false});
  if(error){console.warn('Notlar okunamadı (tablo kurulmamış olabilir):',error.message);return;}
  GELISTIRME_NOTLARI=data||[];
  if(_buro.id===ADMIN_BURO_ID)await tumBurolardanNotlariYukle();
}
async function tumBurolardanNotlariYukle(){
  const{data,error}=await sb.from('gelistirme_notlari').select('*').neq('buro_id',ADMIN_BURO_ID).order('created_at',{ascending:false});
  if(error){console.warn('Diğer bürolardan notlar okunamadı:',error.message);return;}
  const notlar=data||[];
  const buroIdler=[...new Set(notlar.map(n=>n.buro_id))];
  let adMap={};
  if(buroIdler.length){
    const{data:burolar}=await sb.from('burolar').select('id,ad').in('id',buroIdler);
    (burolar||[]).forEach(b=>{adMap[b.id]=b.ad;});
  }
  TUM_BUROLARDAN_NOTLAR=notlar.map(n=>({...n,buro_adi:adMap[n.buro_id]||'Bilinmeyen Büro'}));
}
function renderNotlar(){
  const el=document.getElementById('notlar-liste');
  if(!el)return;
  const satir=n=>`<div class="not-row${n.tamamlandi?' done':''}">
    <input type="checkbox" ${n.tamamlandi?'checked':''} onchange="notToggle(${n.id},this.checked)">
    <div style="flex:1;">
      <div class="not-metin">${esc(n.not_metni)}</div>
      <div class="not-tarih">${n.yazan?esc(n.yazan)+' · ':''}${formatDate((n.created_at||'').split('T')[0])}</div>
    </div>
    <button onclick="notSil(${n.id})">🗑</button>
  </div>`;
  let html='';
  if(!GELISTIRME_NOTLARI.length){
    html='<div class="ly-empty">Henüz not eklenmemiş.</div>';
  } else {
    const aktif=GELISTIRME_NOTLARI.filter(n=>!n.tamamlandi);
    const biten=GELISTIRME_NOTLARI.filter(n=>n.tamamlandi);
    html=aktif.map(satir).join('')+(biten.length?`<div style="font-size:11px;color:var(--text3);margin:14px 0 6px;text-transform:uppercase;letter-spacing:.06em;">Tamamlanan (${biten.length})</div>`+biten.map(satir).join(''):'');
  }
  if(_buro?.id===ADMIN_BURO_ID){
    html+='<div class="ref-section-title">🌐 Diğer Bürolardan Gelen Notlar</div>';
    if(!TUM_BUROLARDAN_NOTLAR.length){
      html+='<div class="ly-empty">Henüz başka büro not bırakmadı.</div>';
    } else {
      html+=TUM_BUROLARDAN_NOTLAR.map(n=>`<div class="not-row${n.tamamlandi?' done':''}">
        <input type="checkbox" ${n.tamamlandi?'checked':''} onchange="notToggle(${n.id},this.checked)">
        <div style="flex:1;">
          <div class="not-metin">${esc(n.not_metni)}</div>
          <div class="not-tarih"><b>${esc(n.buro_adi)}</b>${n.yazan?' · '+esc(n.yazan):''} · ${formatDate((n.created_at||'').split('T')[0])}</div>
        </div>
        <button onclick="notSil(${n.id})">🗑</button>
      </div>`).join('');
    }
  }
  el.innerHTML=html;
}
function openNotlar(){
  renderNotlar();
  document.getElementById('notlar-overlay').style.display='flex';
}
function closeNotlar(){
  document.getElementById('notlar-overlay').style.display='none';
}
async function notEkle(){
  const inp=document.getElementById('not-yeni');
  const metin=(inp.value||'').trim();
  if(!metin)return;
  if(!_buro)return;
  const yazan=_user?.user_metadata?.full_name||_user?.email?.split('@')[0]||null;
  const{data,error}=await sb.from('gelistirme_notlari').insert({buro_id:_buro.id,not_metni:metin,yazan}).select().maybeSingle();
  if(error){alert('Not eklenemedi: '+error.message);return;}
  if(data)GELISTIRME_NOTLARI.unshift(data);
  inp.value='';
  renderNotlar();
}
async function notToggle(id,tamamlandi){
  GELISTIRME_NOTLARI=GELISTIRME_NOTLARI.map(n=>n.id===id?{...n,tamamlandi}:n);
  TUM_BUROLARDAN_NOTLAR=TUM_BUROLARDAN_NOTLAR.map(n=>n.id===id?{...n,tamamlandi}:n);
  renderNotlar();
  const{error}=await sb.from('gelistirme_notlari').update({tamamlandi}).eq('id',id);
  if(error)alert('Güncellenemedi: '+error.message);
}
async function notSil(id){
  if(!confirm('Bu notu silmek istediğinize emin misiniz?'))return;
  GELISTIRME_NOTLARI=GELISTIRME_NOTLARI.filter(n=>n.id!==id);
  TUM_BUROLARDAN_NOTLAR=TUM_BUROLARDAN_NOTLAR.filter(n=>n.id!==id);
  renderNotlar();
  const{error}=await sb.from('gelistirme_notlari').delete().eq('id',id);
  if(error)alert('Silinemedi: '+error.message);
}
// Hızlı not — floating buton
function openHizliNot(){
  document.getElementById('hn-metin').value='';
  document.getElementById('hizli-not-overlay').style.display='flex';
  setTimeout(()=>document.getElementById('hn-metin').focus(),50);
}
function closeHizliNot(){
  document.getElementById('hizli-not-overlay').style.display='none';
}
async function hizliNotKaydet(){
  const metin=(document.getElementById('hn-metin').value||'').trim();
  if(!metin)return;
  if(!_buro)return;
  const yazan=_user?.user_metadata?.full_name||_user?.email?.split('@')[0]||null;
  const{data,error}=await sb.from('gelistirme_notlari').insert({buro_id:_buro.id,not_metni:metin,yazan}).select().maybeSingle();
  if(error){alert('Not eklenemedi: '+error.message);return;}
  if(data)GELISTIRME_NOTLARI.unshift(data);
  closeHizliNot();
}
const SB_URL = 'https://uocdxifomlrbzorizrud.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvY2R4aWZvbWxyYnpvcml6cnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MzI1MTEsImV4cCI6MjA4OTAwODUxMX0.Vf0hXl-s96DEvGDF3gHNgGyd8EQvvuF8p-XzWmJcv9M';

function showApp(){
  document.getElementById('auth-overlay').style.display='none';
  document.querySelector('.app').style.display='flex';
  updateAvatar();
  gizleYuklemeEkrani();
}
function showAuth(){
  document.getElementById('auth-overlay').style.display='flex';
  document.querySelector('.app').style.display='none';
  gizleYuklemeEkrani();
}
function updateAvatar(){
  if(!_user) return;
  const harf = (_user.user_metadata?.full_name||_user.email||'?').charAt(0).toUpperCase();
  const av1 = document.getElementById('topbar-av');
  const av2 = document.getElementById('profil-av');
  if(av1) av1.textContent = harf;
  if(av2) av2.textContent = harf;
}
function kopyalaBuroKodu(){
  if(!_buro?.id)return;
  navigator.clipboard?.writeText(_buro.id).then(()=>{
    const el=document.getElementById('profil-buro-kodu');
    const eski=el.textContent;el.textContent='✓ Kopyalandı!';
    setTimeout(()=>{el.textContent=eski;},1200);
  }).catch(()=>{alert('Büro kodu: '+_buro.id);});
}

// Profil dropdown
function openProfil(){
  const ol = document.getElementById('profil-overlay');
  ol.style.display = ol.style.display==='flex' ? 'none' : 'flex';
  if(!_user || ol.style.display==='none') return;
  const isim = _user.user_metadata?.full_name || _user.email?.split('@')[0] || '?';
  document.getElementById('profil-isim').textContent = isim;
  document.getElementById('profil-email').textContent = _user.email || '—';
  document.getElementById('profil-buro').textContent = _buro?.ad || '—';
  document.getElementById('profil-rol').textContent = ROL_ADLARI[_platformAdmin?'platform_admini':_buro?.rol] || '—';
  document.getElementById('profil-kayit').textContent = records.length + ' kayıt';
  if(_user.created_at){
    const d = new Date(_user.created_at);
    document.getElementById('profil-tarih').textContent = d.toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'});
  }
  updateAvatar();
}
function openProfilimModal(){
  document.getElementById('profilim-overlay').style.display='flex';
  document.getElementById('profilim-msg').textContent='';
  document.getElementById('profil-mevcut-sifre').value='';
  document.getElementById('profil-yeni-sifre').value='';
  document.getElementById('profil-yeni-sifre2').value='';
  if(_user){
    document.getElementById('profil-adsoyad-input').value=_user.user_metadata?.full_name||'';
    document.getElementById('profil-email-input').value=_user.email||'';
  }
  const sil=document.getElementById('hesap-sil-alani');if(sil)sil.style.display=_platformAdmin?'none':'block';
}
function closeProfilimModal(){
  document.getElementById('profilim-overlay').style.display='none';
}
function setProfilMsg(msg,color){
  const el=document.getElementById('profilim-msg');
  el.textContent=msg;
  el.style.color=color||'var(--text2)';
}
async function profilGuncelle(){
  const adSoyad=(document.getElementById('profil-adsoyad-input').value||'').trim();
  if(!adSoyad){setProfilMsg('Ad soyad zorunludur.','#dc2626');return;}
  setProfilMsg('Güncelleniyor...','var(--text2)');
  const {error}=await sb.auth.updateUser({data:{full_name:adSoyad}});
  if(error){setProfilMsg('Hata: '+error.message,'#dc2626');return;}
  _user.user_metadata={..._user.user_metadata,full_name:adSoyad};
  updateAvatar();
  setProfilMsg('✓ Bilgiler güncellendi.','#22c55e');
}
async function sifreDegistir(){
  const mevcut=document.getElementById('profil-mevcut-sifre').value||'';
  const yeni=document.getElementById('profil-yeni-sifre').value||'';
  const yeni2=document.getElementById('profil-yeni-sifre2').value||'';
  if(!mevcut){setProfilMsg('Mevcut şifrenizi girin.','#dc2626');return;}
  if(yeni.length<6){setProfilMsg('Yeni şifre en az 6 karakter olmalıdır.','#dc2626');return;}
  if(yeni!==yeni2){setProfilMsg('Yeni şifreler eşleşmiyor.','#dc2626');return;}
  setProfilMsg('Doğrulanıyor...','var(--text2)');
  // Önce mevcut şifreyi doğrula
  const {error:girisHata}=await sb.auth.signInWithPassword({email:_user.email,password:mevcut});
  if(girisHata){setProfilMsg('Mevcut şifre hatalı.','#dc2626');return;}
  // Şifreyi güncelle
  setProfilMsg('Şifre değiştiriliyor...','var(--text2)');
  const {error}=await sb.auth.updateUser({password:yeni});
  if(error){setProfilMsg('Hata: '+error.message,'#dc2626');return;}
  document.getElementById('profil-mevcut-sifre').value='';
  document.getElementById('profil-yeni-sifre').value='';
  document.getElementById('profil-yeni-sifre2').value='';
  setProfilMsg('✓ Şifreniz başarıyla değiştirildi.','#22c55e');
}
function hesabimiSilPenceresi(){
  if(_platformAdmin){alert('Platform admini hesabı uygulama içinden silinemez.');return;}
  let o=document.getElementById('hesap-sil-overlay');if(!o){o=document.createElement('div');o.id='hesap-sil-overlay';o.className='modal-overlay';o.style.zIndex='610';document.body.appendChild(o);}
  o.innerHTML=`<div class="modal" style="max-width:440px;"><div class="modal-header"><div><h2 style="color:#b42318;">Hesabımı Sil</h2><div style="font-size:11px;color:var(--text2);margin-top:3px;">Bu işlem geri alınamaz.</div></div><button class="btn" onclick="document.getElementById('hesap-sil-overlay').style.display='none'">✕</button></div><div class="modal-body"><div style="padding:12px;border-radius:10px;background:#fff1f0;color:#912018;font-size:12px;line-height:1.5;margin-bottom:14px;">Takvim hesabınız ve büro üyeliğiniz silinecek. Büro yöneticisiyseniz önce yöneticiliği devretmelisiniz.</div><div class="fg"><label>Onaylamak için e-posta adresinizi yazın</label><input id="hesap-sil-email" type="email" placeholder="${esc(_user?.email||'')}"></div><button id="hesap-sil-btn" class="btn" style="width:100%;padding:11px;background:#b42318;color:white;border-color:#b42318;" onclick="hesabimiKaliciSil()">Hesabımı Kalıcı Olarak Sil</button><div id="hesap-sil-msg" style="font-size:12px;margin-top:9px;color:#b42318;"></div></div></div>`;o.style.display='flex';
}
async function hesabimiKaliciSil(){
  const email=(document.getElementById('hesap-sil-email')?.value||'').trim(),msg=document.getElementById('hesap-sil-msg'),btn=document.getElementById('hesap-sil-btn');
  if(email.toLowerCase()!==String(_user?.email||'').toLowerCase()){msg.textContent='Yazdığınız e-posta hesabınızla eşleşmiyor.';return;}
  if(!confirm('Hesabınız kalıcı olarak silinecek. Son kez onaylıyor musunuz?'))return;
  btn.disabled=true;btn.textContent='Hesap siliniyor...';
  const{error}=await sb.rpc('sekreter_hesabimi_sil',{email_onayi:email});
  if(error){msg.textContent='Hesap silinemedi: '+error.message;btn.disabled=false;btn.textContent='Hesabımı Kalıcı Olarak Sil';return;}
  try{await sb.auth.signOut();}catch(e){}location.reload();
}
function buromuSilPenceresi(){
  if(_buro?.rol!=='yonetici'){alert('Bu işlem yalnızca büro yöneticisine açıktır.');return;}
  let o=document.getElementById('buro-sil-overlay');if(!o){o=document.createElement('div');o.id='buro-sil-overlay';o.className='modal-overlay';o.style.zIndex='620';document.body.appendChild(o);}
  o.innerHTML=`<div class="modal" style="max-width:460px;"><div class="modal-header"><div><h2 style="color:#b42318;">Büroyu ve Takvimi Sil</h2><div style="font-size:11px;color:var(--text2);margin-top:3px;">Bu işlem geri alınamaz.</div></div><button class="btn" onclick="document.getElementById('buro-sil-overlay').style.display='none'">✕</button></div><div class="modal-body"><div style="padding:13px;border-radius:10px;background:#fff1f0;color:#912018;font-size:12px;line-height:1.55;margin-bottom:14px;"><strong>${esc(_buro.ad)}</strong> bürosunun takvimi, müvekkilleri, dava dosyaları, evrakları ve mali kayıtları kalıcı olarak silinecek. Üyelerin giriş hesapları silinmeyecek ancak bu büroyla bağlantıları kaldırılacak.<br><br>Önce Tam Veri Yedeği indirmeniz kuvvetle önerilir.</div><button class="btn" style="width:100%;margin-bottom:14px;" onclick="document.getElementById('buro-sil-overlay').style.display='none';openDisaAktar()">Önce Yedek Al</button><div class="fg"><label>Onaylamak için büro adını eksiksiz yazın</label><input id="buro-sil-ad" placeholder="${esc(_buro.ad)}" autocomplete="off"></div><label style="display:flex;gap:8px;align-items:flex-start;font-size:12px;color:var(--text2);margin-bottom:14px;"><input id="buro-sil-anladim" type="checkbox" style="margin-top:2px;">Bütün büro verilerinin kalıcı olarak silineceğini anlıyorum.</label><button id="buro-sil-btn" class="btn" style="width:100%;padding:11px;background:#b42318;color:white;border-color:#b42318;" onclick="buromuKaliciSil()">Büroyu Kalıcı Olarak Sil</button><div id="buro-sil-msg" style="font-size:12px;margin-top:9px;color:#b42318;"></div></div></div>`;o.style.display='flex';
}
async function buroEvraklariniSil(){
  const kok=await sb.storage.from('sekreter-evraklari').list(_buro.id,{limit:1000});
  if(kok.error)throw kok.error;
  const yollar=[];
  for(const oge of kok.data||[]){
    if(oge.id)yollar.push(_buro.id+'/'+oge.name);
    else{const alt=await sb.storage.from('sekreter-evraklari').list(_buro.id+'/'+oge.name,{limit:1000});if(alt.error)throw alt.error;(alt.data||[]).filter(x=>x.id).forEach(x=>yollar.push(_buro.id+'/'+oge.name+'/'+x.name));}
  }
  for(let i=0;i<yollar.length;i+=100){const{error}=await sb.storage.from('sekreter-evraklari').remove(yollar.slice(i,i+100));if(error)throw error;}
}
async function buromuKaliciSil(){
  const ad=(document.getElementById('buro-sil-ad')?.value||'').trim(),anladim=document.getElementById('buro-sil-anladim')?.checked,msg=document.getElementById('buro-sil-msg'),btn=document.getElementById('buro-sil-btn');
  if(ad.toLocaleLowerCase('tr-TR')!==String(_buro?.ad||'').trim().toLocaleLowerCase('tr-TR')){msg.textContent='Yazdığınız büro adı eşleşmiyor.';return;}
  if(!anladim){msg.textContent='Devam etmek için silme uyarısını onaylayın.';return;}
  if(!confirm(`${_buro.ad} ve bütün büro verileri kalıcı olarak silinecek. Son kez onaylıyor musunuz?`))return;
  btn.disabled=true;btn.textContent='Evraklar ve büro verileri siliniyor...';
  try{await buroEvraklariniSil();}catch(e){msg.textContent='Evraklar silinemedi; veri kaybını önlemek için işlem durduruldu: '+e.message;btn.disabled=false;btn.textContent='Büroyu Kalıcı Olarak Sil';return;}
  const{error}=await sb.rpc('sekreter_buromu_sil',{buro_adi_onayi:ad});
  if(error){msg.textContent='Büro silinemedi: '+error.message;btn.disabled=false;btn.textContent='Büroyu Kalıcı Olarak Sil';return;}
  alert('Büro ve takvim verileri silindi.');try{await sb.auth.signOut();}catch(e){}location.reload();
}
function closeProfil(){
  document.getElementById('profil-overlay').style.display='none';
}

// Davet kodu


// ── AUTH EKRANİ YÖNETICI ─────────────────────────────────────────
function authEkrani(ekran){
  document.getElementById('auth-giris-form').style.display='none';
  document.getElementById('auth-unuttum-form').style.display='none';
  document.getElementById('auth-yenile-form').style.display='none';
  document.getElementById('auth-kayitol-form').style.display='none';
  document.getElementById('auth-msg').textContent='';
  if(ekran==='giris') document.getElementById('auth-giris-form').style.display='block';
  else if(ekran==='unuttum') document.getElementById('auth-unuttum-form').style.display='block';
  else if(ekran==='yenile') document.getElementById('auth-yenile-form').style.display='block';
  else if(ekran==='kayitol') document.getElementById('auth-kayitol-form').style.display='block';
}
let _koMod='yeni';
function koModSec(mod){
  _koMod=mod;
  const yeniTab=document.getElementById('ko-tab-yeni'), katilTab=document.getElementById('ko-tab-katil');
  const buroAdi=document.getElementById('ko-buro-adi'), buroKodu=document.getElementById('ko-buro-kodu');
  if(mod==='yeni'){
    yeniTab.style.background='#d4af70';yeniTab.style.color='#1a1a1a';
    katilTab.style.background='transparent';katilTab.style.color='rgba(255,255,255,0.6)';
    buroAdi.style.display='block';buroKodu.style.display='none';
  } else {
    katilTab.style.background='#d4af70';katilTab.style.color='#1a1a1a';
    yeniTab.style.background='transparent';yeniTab.style.color='rgba(255,255,255,0.6)';
    buroAdi.style.display='none';buroKodu.style.display='block';
  }
}
async function kayitOl(){
  const email=(document.getElementById('ko-email').value||'').trim();
  const sifre=document.getElementById('ko-sifre').value||'';
  const sifre2=document.getElementById('ko-sifre2').value||'';
  const buroAdi=(document.getElementById('ko-buro-adi').value||'').trim();
  const buroKodu=(document.getElementById('ko-buro-kodu').value||'').trim();
  if(!email||!sifre){setAuthMsg('E-posta ve şifre zorunludur.','#f87171');return;}
  if(sifre.length<6){setAuthMsg('Şifre en az 6 karakter olmalıdır.','#f87171');return;}
  if(sifre!==sifre2){setAuthMsg('Şifreler eşleşmiyor.','#f87171');return;}
  if(_koMod==='yeni'&&!buroAdi){setAuthMsg('Büro adı zorunludur.','#f87171');return;}
  if(_koMod==='katil'&&!buroKodu){setAuthMsg('Büro kodu zorunludur.','#f87171');return;}
  setAuthMsg('Kayıt oluşturuluyor...','rgba(255,255,255,0.5)');
  const meta=_koMod==='yeni'?{buro_adi:buroAdi}:{};
  if(_koMod==='katil')try{localStorage.setItem('sekreter_bekleyen_davet',buroKodu.toUpperCase());}catch(e){}
  const{data,error}=await sb.auth.signUp({email,password:sifre,options:{data:meta}});
  if(error){setAuthMsg('Hata: '+error.message,'#f87171');return;}
  if(data.session){
    // E-posta onayı kapalıysa direkt oturum açılır
    _user=data.user;
    setAuthMsg('');
    await authSonrasiIslem();
  } else {
    setAuthMsg('✓ Kayıt oluşturuldu. E-postanıza gelen onay bağlantısına tıklayıp giriş yapabilirsiniz.','#4ade80');
    setTimeout(()=>{authEkrani('giris');},3000);
  }
}

function setAuthMsg(msg, color){
  const el=document.getElementById('auth-msg');
  el.textContent=msg;
  el.style.color=color||'rgba(255,255,255,0.5)';
}

// Email ile giriş
async function emailGiris(){
  const email=(document.getElementById('auth-email').value||'').trim();
  const sifre=document.getElementById('auth-sifre').value||'';
  const hatirla=document.getElementById('auth-hatirla').checked;
  if(!email||!sifre){setAuthMsg('E-posta ve şifre zorunludur.','#f87171');return;}
  setAuthMsg('Giriş yapılıyor...','rgba(255,255,255,0.5)');
  // Supabase oturum kalıcılığı: hatırla seçilmişse local, değilse session
  const {data, error}=await sb.auth.signInWithPassword({email, password:sifre});
  if(error){setAuthMsg('Hata: '+(error.message==='Invalid login credentials'?'E-posta veya şifre hatalı.':error.message),'#f87171');return;}
  if(!hatirla){
    // Session storage kullan - sekme kapanınca oturum biter
    try{ localStorage.setItem('sb_no_persist','1'); }catch(e){}
  } else {
    try{ localStorage.removeItem('sb_no_persist'); }catch(e){}
  }
  setAuthMsg('');
  _user=data.user;
  await authSonrasiIslem();
}

// Şifre sıfırlama kodu gönder
async function sifreSifirlaGonder(){
  const email=(document.getElementById('auth-unuttum-email').value||'').trim();
  if(!email){setAuthMsg('E-posta adresi zorunludur.','#f87171');return;}
  setAuthMsg('Kod gönderiliyor...','rgba(255,255,255,0.5)');
  const {error}=await sb.auth.resetPasswordForEmail(email,{
    // OTP modu: token_hash yerine kod kullanılır
  });
  if(error){setAuthMsg('Hata: '+error.message,'#f87171');return;}
  // E-posta girişini yenile formuna aktar
  document.getElementById('auth-otp-email').value=email;
  setAuthMsg('✓ Şifre sıfırlama kodu e-postanıza gönderildi.','#4ade80');
  setTimeout(()=>{authEkrani('yenile');},1800);
}

// OTP kodu ile şifre yenile
async function sifreYenile(){
  const email=(document.getElementById('auth-otp-email').value||'').trim();
  const kod=(document.getElementById('auth-otp-kod').value||'').trim();
  const yeniSifre=document.getElementById('auth-yeni-sifre').value||'';
  const yeniSifre2=document.getElementById('auth-yeni-sifre2').value||'';
  if(!email||!kod){setAuthMsg('E-posta ve kod zorunludur.','#f87171');return;}
  if(yeniSifre.length<6){setAuthMsg('Şifre en az 6 karakter olmalıdır.','#f87171');return;}
  if(yeniSifre!==yeniSifre2){setAuthMsg('Şifreler eşleşmiyor.','#f87171');return;}
  setAuthMsg('Şifre güncelleniyor...','rgba(255,255,255,0.5)');
  // Önce OTP ile oturumu doğrula
  const {data:vData, error:vError}=await sb.auth.verifyOtp({email, token:kod, type:'recovery'});
  if(vError){setAuthMsg('Hata: Kod geçersiz veya süresi dolmuş.','#f87171');return;}
  // Şifreyi güncelle
  const {error:uError}=await sb.auth.updateUser({password:yeniSifre});
  if(uError){setAuthMsg('Hata: '+uError.message,'#f87171');return;}
  setAuthMsg('✓ Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.','#4ade80');
  setTimeout(()=>{authEkrani('giris');},2000);
}

async function authSonrasiIslem(){
  const kosul=await kullanimKosuluKontrol();if(!kosul)return;
  const buroVarMi=await buroBilgisiYukle();
  if(buroVarMi==='platform_admini'){platformAdminEkraniniGoster();return;}
  if(!buroVarMi){
    showApp();
    document.querySelector('.app').innerHTML=`<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:24px;background:var(--surface2);"><div style="width:100%;max-width:480px;padding:28px;background:var(--surface);border:1px solid var(--border);border-radius:16px;box-shadow:0 16px 40px rgba(15,23,42,.1);"><div style="font-size:21px;font-weight:750;margin-bottom:7px;">Sekreter'e hoş geldiniz</div><div style="font-size:13px;color:var(--text2);line-height:1.6;margin:0 auto 18px;">Hesabınız aktif ancak bir büroya bağlı değil. Nasıl devam etmek istediğinizi seçin.</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:18px;"><button id="bos-hesap-kur-tab" class="btn btn-primary" onclick="bosHesapSecenekSec('kur')" style="padding:11px 7px;">Kendi Büromu Oluştur</button><button id="bos-hesap-katil-tab" class="btn" onclick="bosHesapSecenekSec('katil')" style="padding:11px 7px;">Davet Koduyla Katıl</button></div><div id="bos-hesap-kur-panel"><label for="mevcut-hesap-buro-adi" style="display:block;text-align:left;font-size:12px;font-weight:650;margin-bottom:6px;">Büro adı</label><input id="mevcut-hesap-buro-adi" type="text" placeholder="Örn. Erkan Hukuk ve Danışmanlık" style="width:100%;margin-bottom:10px;" onkeydown="if(event.key==='Enter')mevcutHesaplaBuroOlustur()"><button id="mevcut-hesap-kur-btn" class="save-btn" onclick="mevcutHesaplaBuroOlustur()">Büroyu Oluştur</button><div style="font-size:11px;color:var(--text3);line-height:1.5;margin-top:9px;">Büronun yöneticisi olursunuz. Daha sonra çalışan ve ortak ekleyebilirsiniz.</div></div><div id="bos-hesap-katil-panel" style="display:none;"><label for="mevcut-hesap-buro-kodu" style="display:block;text-align:left;font-size:12px;font-weight:650;margin-bottom:6px;">Tek kullanımlık davet kodu</label><input id="mevcut-hesap-buro-kodu" type="text" placeholder="XXXX-XXXX-XXXX" style="width:100%;margin-bottom:10px;text-transform:uppercase;" onkeydown="if(event.key==='Enter')mevcutHesaplaBuroyaKatil()"><button id="mevcut-hesap-katil-btn" class="save-btn" onclick="mevcutHesaplaBuroyaKatil()">Büroya Katıl</button><div style="font-size:11px;color:var(--text3);line-height:1.5;margin-top:9px;">Kod 24 saat geçerli ve tek kullanımlıktır. İlk katılımda çalışan olursunuz.</div></div><div id="mevcut-hesap-katil-msg" style="min-height:18px;margin-top:10px;font-size:12px;"></div><button class="btn" style="margin-top:10px;width:100%;" onclick="cikisYap()">Başka hesapla giriş yap</button><button class="btn" style="margin-top:8px;width:100%;color:#b42318;border-color:#fda29b;" onclick="hesabimiSilPenceresi()">Hesabımı Kalıcı Olarak Sil</button></div></div>`;
    let bekleyen='';try{bekleyen=localStorage.getItem('sekreter_bekleyen_davet')||'';}catch(e){}if(bekleyen){bosHesapSecenekSec('katil');document.getElementById('mevcut-hesap-buro-kodu').value=bekleyen;}
    return;
  }
  await buroAcilisMesajiniYukle();
  showApp();
  const sad = document.getElementById('sidebar-buro-ad');
  if(sad) sad.textContent = _buro.ad;
  rolArayuzunuUygula();
  await ozelSecenekleriYukle();
  await notlariYukle();
  await loadRecords();
  await buroKartlariYukle();
}

function bosHesapSecenekSec(secim){
  const kur=secim==='kur';
  document.getElementById('bos-hesap-kur-panel').style.display=kur?'block':'none';
  document.getElementById('bos-hesap-katil-panel').style.display=kur?'none':'block';
  document.getElementById('bos-hesap-kur-tab').className=kur?'btn btn-primary':'btn';
  document.getElementById('bos-hesap-katil-tab').className=kur?'btn':'btn btn-primary';
  const msg=document.getElementById('mevcut-hesap-katil-msg');if(msg)msg.textContent='';
  setTimeout(()=>document.getElementById(kur?'mevcut-hesap-buro-adi':'mevcut-hesap-buro-kodu')?.focus(),20);
}

async function mevcutHesaplaBuroOlustur(){
  const ad=(document.getElementById('mevcut-hesap-buro-adi')?.value||'').trim(),msg=document.getElementById('mevcut-hesap-katil-msg'),btn=document.getElementById('mevcut-hesap-kur-btn');
  if(ad.length<2){msg.textContent='Geçerli bir büro adı girin.';msg.style.color='#b42318';return;}
  btn.disabled=true;btn.textContent='Büro oluşturuluyor...';msg.textContent='';
  const{data,error}=await sb.rpc('sekreter_buro_olustur',{buro_adi_girdisi:ad});
  if(error){msg.textContent='Büro oluşturulamadı: '+error.message;msg.style.color='#b42318';btn.disabled=false;btn.textContent='Büroyu Oluştur';return;}
  const sonuc=Array.isArray(data)?data[0]:data;
  try{localStorage.removeItem('sekreter_bekleyen_davet');}catch(e){}
  msg.textContent='✓ '+(sonuc?.buro_adi||ad)+' oluşturuldu. Takviminiz açılıyor...';msg.style.color='#15803d';
  setTimeout(()=>location.reload(),700);
}

async function mevcutHesaplaBuroyaKatil(){
  const kod=(document.getElementById('mevcut-hesap-buro-kodu')?.value||'').trim(),msg=document.getElementById('mevcut-hesap-katil-msg'),btn=document.getElementById('mevcut-hesap-katil-btn');
  if(!kod){msg.textContent='Büro kodunu girin.';msg.style.color='#b42318';return;}
  btn.disabled=true;btn.textContent='Katılım yapılıyor...';msg.textContent='';
  const{data,error}=await sb.rpc('sekreter_buroya_katil',{buro_kodu:kod});
  if(error){msg.textContent='Katılım yapılamadı: '+error.message;msg.style.color='#b42318';btn.disabled=false;btn.textContent='Büroya Katıl';return;}
  const sonuc=Array.isArray(data)?data[0]:data;
  msg.textContent='✓ '+(sonuc?.buro_adi||'Büro')+' bürosuna katıldınız. Takvim açılıyor...';msg.style.color='#15803d';
  setTimeout(()=>location.reload(),700);
}

async function cikisYap(){
  if(!confirm('Çıkış yapmak istediğinizden emin misiniz?')) return;
  closeProfil();
  await canliSenkronuKapat();
  try{await Promise.race([sb.auth.signOut(),new Promise(r=>setTimeout(r,1500))]);}catch(e){}
  _user=null;
  authEkrani('giris');
  showAuth();
}

async function authBaslat(){
  // Şifre sıfırlama linki ile gelindi mi? (URL'de #access_token veya type=recovery)
  const hash=window.location.hash;
  if(hash&&hash.includes('type=recovery')){
    // Supabase auth state'i oku
    await sb.auth.getSession();
    authEkrani('yenile');
    showAuth();
    return;
  }
  const {data:{session}}=await sb.auth.getSession();
  if(!session?.user){showAuth();authEkrani('giris');return;}
  _user=session.user;
  await authSonrasiIslem();
}
