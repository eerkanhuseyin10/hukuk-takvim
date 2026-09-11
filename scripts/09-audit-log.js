/* Sekreter renderer: 09-audit-log.js */
const ISLEM_ADLARI={INSERT:'Eklendi',UPDATE:'Güncellendi',DELETE:'Silindi',ACCESS:'Açıldı',EXPORT:'İndirildi'};
const TABLO_ADLARI={kayitlar:'Takvim kaydı',muvekkiller:'Müvekkil',dava_dosyalari:'Dava dosyası',dosya_evraklari:'Dosya evrakı',dosya_islem_gecmisi:'Dosya işlemi',dosya_mali_hareketleri:'Dosya mali hareketi',ofis_mali_hareketleri:'Ofis mali hareketi',mali_makbuzlar:'Makbuz',mali_ortaklar:'Ortaklık ayarı',buro_uyeleri:'Büro kullanıcısı',buro_ayarlari:'Büro ayarı',buro_davet_kodlari:'Tek kullanımlık davet',tam_yedek_geri_yukleme:'Tam veri yedeği',oturum:'Kullanıcı oturumu',mali_alan:'Mali bölüm',tam_yedek:'Tam veri yedeği'};
async function guvenlikOlayiKaydet(olay,oturumdaBirKez=false){
  if(!_buro?.id||!_user?.id)return;
  const anahtar=`sekreter_guvenlik_${_buro.id}_${_user.id}_${olay}`;
  if(oturumdaBirKez){try{if(sessionStorage.getItem(anahtar))return;}catch(e){}}
  const{error}=await sb.rpc('sekreter_guvenlik_olayi_kaydet',{olay});
  if(!error&&olay==='oturum_acildi')sb.rpc('sekreter_eski_islem_gunluklerini_temizle').then(()=>{});
  if(!error&&oturumdaBirKez)try{sessionStorage.setItem(anahtar,'1');}catch(e){}
}
function islemGunluguTarih(v){try{return new Date(v).toLocaleString('tr-TR',{dateStyle:'medium',timeStyle:'short'});}catch(e){return '—';}}
async function openIslemGunlugu(){
  if(!_buro||_buro.rol!=='yonetici'){alert('İşlem günlüğünü yalnızca büro yöneticisi görebilir.');return;}
  let o=document.getElementById('islem-gunlugu-overlay');
  if(!o){o=document.createElement('div');o.id='islem-gunlugu-overlay';o.className='modal-overlay';o.style.zIndex='590';document.body.appendChild(o);}
  o.onclick=e=>{if(e.target===o)o.style.display='none';};
  o.innerHTML=`<div class="modal" style="max-width:820px;"><div class="modal-header"><div><h2>İşlem ve Erişim Günlüğü</h2><div style="font-size:11px;color:var(--text2);margin-top:3px;">Son 200 kayıt, erişim ve yedekleme işlemi</div></div><button class="btn" onclick="document.getElementById('islem-gunlugu-overlay').style.display='none'">✕</button></div><div class="modal-body"><div id="islem-gunlugu-liste" style="font-size:12px;color:var(--text2);">Yükleniyor…</div></div></div>`;
  o.style.display='flex';
  const{data,error}=await sb.rpc('sekreter_islem_gunlugu_listele',{kayit_sayisi:200});
  const c=document.getElementById('islem-gunlugu-liste');if(!c)return;
  if(error){c.innerHTML=`<div style="color:#b91c1c;">Günlük yüklenemedi: ${esc(error.message)}</div>`;return;}
  if(!data?.length){c.textContent='Henüz kaydedilmiş işlem yok.';return;}
  c.innerHTML=data.map(x=>`<div style="display:grid;grid-template-columns:minmax(125px,auto) 1fr;gap:12px;padding:11px 0;border-bottom:1px solid var(--border);"><div style="color:var(--text3);">${islemGunluguTarih(x.islem_tarihi)}</div><div><b style="color:var(--text);">${esc(x.kullanici||'Bilinmeyen kullanıcı')}</b> · ${esc(TABLO_ADLARI[x.tablo]||x.tablo)} <b>${esc(ISLEM_ADLARI[x.islem]||x.islem)}</b>${x.degisen_alanlar?.length?`<div style="font-size:10px;margin-top:3px;color:var(--text3);">Değişen alanlar: ${x.degisen_alanlar.map(esc).join(', ')}</div>`:''}</div></div>`).join('');
}
