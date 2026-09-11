/* Sekreter renderer: 09-audit-log.js */
const ISLEM_ADLARI={INSERT:'Eklendi',UPDATE:'Güncellendi',DELETE:'Silindi'};
const TABLO_ADLARI={kayitlar:'Takvim kaydı',muvekkiller:'Müvekkil',dava_dosyalari:'Dava dosyası',dosya_evraklari:'Dosya evrakı',dosya_islem_gecmisi:'Dosya işlemi',dosya_mali_hareketleri:'Dosya mali hareketi',ofis_mali_hareketleri:'Ofis mali hareketi',mali_makbuzlar:'Makbuz',mali_ortaklar:'Ortaklık ayarı',buro_uyeleri:'Büro kullanıcısı',buro_ayarlari:'Büro ayarı',tam_yedek_geri_yukleme:'Tam veri yedeği'};
function islemGunluguTarih(v){try{return new Date(v).toLocaleString('tr-TR',{dateStyle:'medium',timeStyle:'short'});}catch(e){return '—';}}
async function openIslemGunlugu(){
  if(!_buro||_buro.rol!=='yonetici'){alert('İşlem günlüğünü yalnızca büro yöneticisi görebilir.');return;}
  let o=document.getElementById('islem-gunlugu-overlay');
  if(!o){o=document.createElement('div');o.id='islem-gunlugu-overlay';o.className='modal-overlay';o.style.zIndex='590';document.body.appendChild(o);}
  o.onclick=e=>{if(e.target===o)o.style.display='none';};
  o.innerHTML=`<div class="modal" style="max-width:820px;"><div class="modal-header"><div><h2>İşlem Günlüğü</h2><div style="font-size:11px;color:var(--text2);margin-top:3px;">Son 200 ekleme, güncelleme ve silme işlemi</div></div><button class="btn" onclick="document.getElementById('islem-gunlugu-overlay').style.display='none'">✕</button></div><div class="modal-body"><div id="islem-gunlugu-liste" style="font-size:12px;color:var(--text2);">Yükleniyor…</div></div></div>`;
  o.style.display='flex';
  const{data,error}=await sb.rpc('sekreter_islem_gunlugu_listele',{kayit_sayisi:200});
  const c=document.getElementById('islem-gunlugu-liste');if(!c)return;
  if(error){c.innerHTML=`<div style="color:#b91c1c;">Günlük yüklenemedi: ${esc(error.message)}</div>`;return;}
  if(!data?.length){c.textContent='Henüz kaydedilmiş işlem yok.';return;}
  c.innerHTML=data.map(x=>`<div style="display:grid;grid-template-columns:minmax(125px,auto) 1fr;gap:12px;padding:11px 0;border-bottom:1px solid var(--border);"><div style="color:var(--text3);">${islemGunluguTarih(x.islem_tarihi)}</div><div><b style="color:var(--text);">${esc(x.kullanici||'Bilinmeyen kullanıcı')}</b> · ${esc(TABLO_ADLARI[x.tablo]||x.tablo)} <b>${esc(ISLEM_ADLARI[x.islem]||x.islem)}</b>${x.degisen_alanlar?.length?`<div style="font-size:10px;margin-top:3px;color:var(--text3);">Değişen alanlar: ${x.degisen_alanlar.map(esc).join(', ')}</div>`:''}</div></div>`).join('');
}
