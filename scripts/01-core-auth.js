/* Sekreter renderer: 01-core-auth.js */
const SUPABASE_URL='https://uocdxifomlrbzorizrud.supabase.co';
const SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvY2R4aWZvbWxyYnpvcml6cnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MzI1MTEsImV4cCI6MjA4OTAwODUxMX0.Vf0hXl-s96DEvGDF3gHNgGyd8EQvvuF8p-XzWmJcv9M';
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

// ── AUTH & PROFİL SİSTEMİ ────────────────────────────────────────
let _user = null;
let _buro = null; // Giriş sonrası buroBilgisiYukle() ile doldurulur
async function buroBilgisiYukle(){
  if(!_user)return false;
  const{data:uyelik,error:e1}=await sb.from('buro_uyeleri').select('buro_id').eq('user_id',_user.id).limit(1).maybeSingle();
  if(e1||!uyelik){console.error('Büro üyeliği okunamadı:',e1?.message);return false;}
  const{data:buro,error:e2}=await sb.from('burolar').select('id,ad').eq('id',uyelik.buro_id).maybeSingle();
  if(e2||!buro){console.error('Büro kaydı okunamadı:',e2?.message);return false;}
  _buro={id:buro.id, ad:buro.ad};
  return true;
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
  document.getElementById('profil-buro-kodu').textContent = _buro?.id || '—';
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
  const meta=_koMod==='yeni'?{buro_adi:buroAdi}:{katil_buro_id:buroKodu};
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
  const buroVarMi=await buroBilgisiYukle();
  if(!buroVarMi){
    showApp();
    document.querySelector('.app').innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100vh;text-align:center;padding:24px;"><div><div style="font-size:16px;font-weight:700;margin-bottom:8px;">Büro bilgisi bulunamadı</div><div style="font-size:13px;color:var(--text2);max-width:340px;margin:0 auto 16px;">Hesabınız henüz bir büroya bağlı değil. Lütfen destek ile iletişime geçin.</div><button class="btn" onclick="cikisYap()">Çıkış Yap</button></div></div>';
    return;
  }
  showApp();
  const sad = document.getElementById('sidebar-buro-ad');
  if(sad) sad.textContent = _buro.ad;
  await ozelSecenekleriYukle();
  await notlariYukle();
  await loadRecords();
  await buroKartlariYukle();
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

