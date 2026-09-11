/* Sekreter renderer: 08-export-bootstrap.js */
function masaustuAraclariniGoster(){const b=document.getElementById('guncelleme-denetle-btn');if(b)b.style.display=window.sekreterDesktop?'block':'none';}
async function guncellemeDenetle(){if(!window.sekreterDesktop?.checkForUpdates){alert('Güncelleme denetimi yalnızca masaüstü uygulamasında kullanılabilir.');return;}await window.sekreterDesktop.checkForUpdates();}
document.addEventListener('DOMContentLoaded',masaustuAraclariniGoster);
// ── YEDEK VE DIŞA AKTAR ────────────────────────────────────────────────
function openDisaAktar(){
  if(!_buro||!['yonetici','ortak'].includes(_buro.rol)){alert('Yedekleme ve dışa aktarma yalnızca yönetici veya ortaklara açıktır.');return;}
  let overlay=document.getElementById('disa-aktar-overlay');
  if(!overlay){
    overlay=document.createElement('div');
    overlay.id='disa-aktar-overlay';
    overlay.className='modal-overlay';
    overlay.style.zIndex='500';
    overlay.onclick=e=>{if(e.target===overlay)closeDisaAktar();};
    overlay.innerHTML=`<div class="modal" style="max-width:480px;">
      <div class="modal-handle"></div>
      <div class="modal-header"><h2>Yedek ve Dışa Aktar</h2><button class="btn" onclick="closeDisaAktar()">✕</button></div>
      <div class="modal-body">
        <div style="border:1px solid #86efac;background:#f0fdf4;border-radius:12px;padding:15px;margin-bottom:12px;">
          <div style="font-size:14px;font-weight:700;margin-bottom:5px;">Tam veri yedeği</div>
          <div style="font-size:12px;color:var(--text2);line-height:1.5;margin-bottom:12px;">Takvim, müvekkil, dava dosyası, mali kayıtlar, makbuzlar, büro ayarları ve evrak listesini tek dosyada indirir.</div>
          <button id="tam-yedek-btn" class="btn btn-primary" style="width:100%;" onclick="tamVeriYedegiIndir()">.json Tam Yedeği İndir</button>
        </div>
        ${_buro?.rol==='yonetici'?`<div style="border:1px solid #fdba74;background:#fff7ed;border-radius:12px;padding:15px;margin-bottom:12px;">
          <div style="font-size:14px;font-weight:700;margin-bottom:5px;">Yedeği geri yükle</div>
          <div style="font-size:12px;color:var(--text2);line-height:1.5;margin-bottom:12px;">Yalnızca aynı büroya ait tam JSON yedeğini boş bir büroya geri yükler. Mevcut kayıtların üzerine yazmaz.</div>
          <input id="yedek-geri-yukle-dosya" type="file" accept="application/json,.json" style="display:none;" onchange="yedekDosyasiSecildi(this)">
          <button id="yedek-geri-yukle-btn" class="btn" style="width:100%;" onclick="document.getElementById('yedek-geri-yukle-dosya').click()">JSON Yedeği Seç ve Doğrula</button>
        </div>`:''}
        <div style="border:1px solid var(--border);border-radius:12px;padding:15px;margin-bottom:12px;">
          <div style="font-size:14px;font-weight:700;margin-bottom:5px;">Excel / Numbers yedeği</div>
          <div style="font-size:12px;color:var(--text2);line-height:1.5;margin-bottom:12px;">Tüm kayıtları, duruşmaları, süreli işleri, tamamlananları ve müvekkil özetini ayrı sayfalarda indirir.</div>
          <button class="btn btn-primary" style="width:100%;" onclick="excelYedegiIndir()">.xlsx Dosyasını İndir</button>
        </div>
        <div style="border:1px solid var(--border);border-radius:12px;padding:15px;">
          <div style="font-size:14px;font-weight:700;margin-bottom:5px;">Takvim dosyası</div>
          <div style="font-size:12px;color:var(--text2);line-height:1.5;margin-bottom:12px;">Açık kayıtları Apple Takvim, Google Takvim veya Outlook'a aktarılabilecek biçimde indirir.</div>
          <button class="btn" style="width:100%;" onclick="icsTakvimiIndir()">.ics Dosyasını İndir</button>
        </div>
        <div id="disa-aktar-msg" style="font-size:12px;color:var(--text2);margin-top:12px;min-height:18px;"></div>
      </div>
    </div>`;
    document.body.appendChild(overlay);
  }
  overlay.style.display='flex';
}
function closeDisaAktar(){const el=document.getElementById('disa-aktar-overlay');if(el)el.style.display='none';}
function disaAktarMesaj(metin,hata=false){const el=document.getElementById('disa-aktar-msg');if(el){el.textContent=metin;el.style.color=hata?'#dc2626':'#166534';}}
function yedekDosyaTarihi(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
async function yedekTabloyuOku(tablo,filtreAlan='buro_id',filtreDeger=null){
  const tumu=[];
  for(let baslangic=0;;baslangic+=1000){
    let sorgu=sb.from(tablo).select('*').range(baslangic,baslangic+999);
    if(filtreAlan&&filtreDeger!==null)sorgu=sorgu.eq(filtreAlan,filtreDeger);
    const{data,error}=await sorgu;
    if(error)throw new Error(tablo+': '+error.message);
    tumu.push(...(data||[]));
    if(!data||data.length<1000)break;
  }
  return tumu;
}
async function tamVeriYedegiIndir(){
  const btn=document.getElementById('tam-yedek-btn');
  if(!_buro?.id){disaAktarMesaj('Büro bilgisi bulunamadı. Önce tekrar giriş yapın.',true);return;}
  if(btn){btn.disabled=true;btn.textContent='Yedek hazırlanıyor...';}
  try{
    const tablolar=['buro_uyeleri','kayitlar','muvekkiller','dava_dosyalari','dosya_evraklari','dosya_islem_gecmisi','dosya_mali_hareketleri','ofis_mali_hareketleri','mali_ortaklar','mali_ay_ayarlari','mali_ayarlar','mali_makbuzlar','secenekler','gelistirme_notlari','buro_ayarlari','islem_gunlugu'];
    const sonuc={burolar:await yedekTabloyuOku('burolar','id',_buro.id)};
    for(const tablo of tablolar)sonuc[tablo]=await yedekTabloyuOku(tablo,'buro_id',_buro.id);
    const dosyaIds=(sonuc.dava_dosyalari||[]).map(x=>x.id);
    sonuc.dava_dosyasi_muvekkilleri=[];
    for(let i=0;i<dosyaIds.length;i+=100){
      const{data,error}=await sb.from('dava_dosyasi_muvekkilleri').select('*').in('dava_dosyasi_id',dosyaIds.slice(i,i+100));
      if(error)throw new Error('dava_dosyasi_muvekkilleri: '+error.message);
      sonuc.dava_dosyasi_muvekkilleri.push(...(data||[]));
    }
    const yedek={
      format:'sekreter-tam-yedek',
      surum:1,
      olusturulma_zamani:new Date().toISOString(),
      buro_id:_buro.id,
      not:'Evrak kayıtları ve dosya yolları dahildir; Supabase Storage içindeki gerçek evrak dosyaları ayrıca saklanmalıdır.',
      tablolar:sonuc
    };
    const blob=new Blob([JSON.stringify(yedek,null,2)],{type:'application/json;charset=utf-8'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='Sekreter-Tam-Yedek-'+yedekDosyaTarihi()+'.json';a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    const adet=Object.values(sonuc).reduce((n,l)=>n+(Array.isArray(l)?l.length:0),0);
    await guvenlikOlayiKaydet('tam_yedek_indirildi');
    disaAktarMesaj('Tam yedek hazırlandı: '+adet+' kayıt indirildi. Dosyayı güvenli bir yerde saklayın.');
  }catch(e){disaAktarMesaj('Tam yedek oluşturulamadı: '+(e.message||e),true);}
  finally{if(btn){btn.disabled=false;btn.textContent='.json Tam Yedeği İndir';}}
}
async function yedekDosyasiSecildi(input){
  const dosya=input.files?.[0];input.value='';if(!dosya)return;
  if(dosya.size>25*1024*1024){disaAktarMesaj('Yedek dosyası 25 MB sınırını aşıyor.',true);return;}
  let yedek;
  try{yedek=JSON.parse(await dosya.text());}catch(e){disaAktarMesaj('Seçilen dosya geçerli bir JSON yedeği değil.',true);return;}
  if(yedek?.format!=='sekreter-tam-yedek'||!yedek.tablolar||Number(yedek.surum)!==1){disaAktarMesaj('Bu dosya Sekreter tam yedeği biçiminde değil.',true);return;}
  if(String(yedek.buro_id)!==String(_buro?.id)){disaAktarMesaj('Bu yedek başka bir büroya ait olduğu için yüklenemez.',true);return;}
  const adet=Object.values(yedek.tablolar).reduce((n,l)=>n+(Array.isArray(l)?l.length:0),0);
  const onay=confirm(`${dosya.name}\n\n${adet} kayıt doğrulandı. Geri yükleme yalnızca büro veri tabloları boşsa yapılacaktır. Devam edilsin mi?`);
  if(!onay)return;
  const btn=document.getElementById('yedek-geri-yukle-btn');if(btn){btn.disabled=true;btn.textContent='Geri yükleniyor…';}
  disaAktarMesaj('Yedek sunucuda doğrulanıyor ve geri yükleniyor…');
  const{data,error}=await sb.rpc('sekreter_yedek_geri_yukle',{yedek});
  if(btn){btn.disabled=false;btn.textContent='JSON Yedeği Seç ve Doğrula';}
  if(error){disaAktarMesaj('Geri yükleme yapılmadı: '+error.message,true);return;}
  disaAktarMesaj(`✓ Geri yükleme tamamlandı: ${data?.geri_yuklenen_kayit??adet} kayıt.`);
  await loadRecords();
  if(typeof buroKartlariYukle==='function')await buroKartlariYukle();
}
function kayitSatiri(r){
  return [r.date?new Date(r.date+'T12:00:00'):null,r.saat||'',typeLabel(r.type,r.dal),getBaslik(r),r.muvekkil||'',r.mahkeme||'',r.dava||'',dalLabel(r.dal),r.tamamlandi?'Tamamlandı':'Açık',r.not||''];
}
function excelSayfasiOlustur(liste){
  const basliklar=['Tarih / Son Gün','Saat','Tür','Başlık','Müvekkil','Mahkeme / Kurum','Dava No','Hukuk Dalı','Durum','Açıklama'];
  const ws=XLSX.utils.aoa_to_sheet([basliklar,...liste.map(kayitSatiri)],{cellDates:true});
  ws['!cols']=basliklar.map((b,i)=>({wch:Math.min(45,Math.max(b.length+2,...liste.map(r=>String(kayitSatiri(r)[i]??'').length+2)))}));
  ws['!autofilter']={ref:`A1:J${Math.max(1,liste.length+1)}`};
  for(let satir=2;satir<=liste.length+1;satir++)if(ws['A'+satir])ws['A'+satir].z='yyyy-mm-dd';
  return ws;
}
function excelYedegiIndir(){
  if(!window.XLSX){disaAktarMesaj('Excel bileşeni yüklenemedi. İnternet bağlantınızı kontrol edin.',true);return;}
  try{
    const sirali=[...records].sort((a,b)=>(a.date||'').localeCompare(b.date||''));
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,excelSayfasiOlustur(sirali),'Tüm Kayıtlar');
    XLSX.utils.book_append_sheet(wb,excelSayfasiOlustur(sirali.filter(r=>r.type==='durusma')),'Duruşmalar');
    XLSX.utils.book_append_sheet(wb,excelSayfasiOlustur(sirali.filter(r=>r.type==='sure')),'Süreli İşler');
    XLSX.utils.book_append_sheet(wb,excelSayfasiOlustur(sirali.filter(r=>r.tamamlandi)),'Tamamlananlar');
    const bugun=new Date();bugun.setHours(0,0,0,0);
    const gruplar=new Map();
    sirali.filter(r=>r.muvekkil).forEach(r=>{const k=r.muvekkil.trim();if(!gruplar.has(k))gruplar.set(k,[]);gruplar.get(k).push(r);});
    const mv=[['Müvekkil','Toplam Kayıt','Açık İş','Duruşma / Randevu','Geciken']];
    [...gruplar.entries()].sort((a,b)=>a[0].localeCompare(b[0],'tr')).forEach(([ad,liste])=>mv.push([ad,liste.length,liste.filter(r=>!r.tamamlandi).length,liste.filter(r=>r.type==='durusma').length,liste.filter(r=>!r.tamamlandi&&new Date(r.date+'T12:00:00')<bugun).length]));
    const mvWs=XLSX.utils.aoa_to_sheet(mv);mvWs['!cols']=[{wch:32},{wch:14},{wch:12},{wch:20},{wch:10}];mvWs['!autofilter']={ref:`A1:E${Math.max(1,mv.length)}`};
    XLSX.utils.book_append_sheet(wb,mvWs,'Müvekkil Özeti');
    XLSX.writeFile(wb,'Sekreter-Yedek-'+yedekDosyaTarihi()+'.xlsx',{compression:true,cellDates:true});
    disaAktarMesaj(records.length+' kayıt Excel / Numbers dosyasına aktarıldı.');
  }catch(e){disaAktarMesaj('Dosya oluşturulamadı: '+(e.message||e),true);}
}
function icsKacis(s){return String(s||'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');}
function icsTarih(s){return String(s||'').replaceAll('-','');}
function icsTakvimiIndir(){
  try{
    const acik=records.filter(r=>!r.tamamlandi&&r.date);
    const simdi=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
    const satirlar=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Sekreter//Buro Takvimi//TR','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Sekreter'];
    acik.forEach(r=>{
      satirlar.push('BEGIN:VEVENT','UID:sekreter-'+r.id+'@sekreter.local','DTSTAMP:'+simdi);
      if(r.saat){
        const baslangic=icsTarih(r.date)+'T'+r.saat.replace(':','')+'00';
        const bitis=new Date(r.date+'T'+r.saat+':00');bitis.setHours(bitis.getHours()+1);
        const bitisStr=`${bitis.getFullYear()}${String(bitis.getMonth()+1).padStart(2,'0')}${String(bitis.getDate()).padStart(2,'0')}T${String(bitis.getHours()).padStart(2,'0')}${String(bitis.getMinutes()).padStart(2,'0')}00`;
        satirlar.push('DTSTART;TZID=Europe/Istanbul:'+baslangic,'DTEND;TZID=Europe/Istanbul:'+bitisStr);
      }else{
        const ertesi=new Date(r.date+'T12:00:00');ertesi.setDate(ertesi.getDate()+1);
        satirlar.push('DTSTART;VALUE=DATE:'+icsTarih(r.date),'DTEND;VALUE=DATE:'+`${ertesi.getFullYear()}${String(ertesi.getMonth()+1).padStart(2,'0')}${String(ertesi.getDate()).padStart(2,'0')}`);
      }
      satirlar.push('SUMMARY:'+icsKacis(getBaslik(r)),'DESCRIPTION:'+icsKacis([r.muvekkil,r.mahkeme,r.dava,r.not].filter(Boolean).join(' · ')),'END:VEVENT');
    });
    satirlar.push('END:VCALENDAR');
    const blob=new Blob(['\ufeff'+satirlar.join('\r\n')],{type:'text/calendar;charset=utf-8'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Sekreter-Takvim-'+yedekDosyaTarihi()+'.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    disaAktarMesaj(acik.length+' açık kayıt takvim dosyasına aktarıldı.');
  }catch(e){disaAktarMesaj('Takvim dosyası oluşturulamadı: '+(e.message||e),true);}
}

// Masaüstü kullanımı için kısa yollar: Ctrl/Cmd+K arama, Ctrl/Cmd+N yeni kayıt.
document.addEventListener('keydown',e=>{
  const cmd=e.ctrlKey||e.metaKey;
  if(cmd&&e.key.toLowerCase()==='k'){
    e.preventDefault();
    showView('takvim',document.querySelector('.nav-item[onclick*="takvim"]'));
    const arama=document.getElementById('cal-search');
    if(arama){arama.focus();arama.select();}
  }
  if(cmd&&e.key.toLowerCase()==='n'){
    e.preventDefault();
    openModal();
  }
  if(e.key==='Escape'){
    if(document.getElementById('buro-kart-detay-overlay')?.style.display!=='none') closeBuroKartDetay();
    if(document.getElementById('bildirim-ayar-overlay')?.style.display!=='none') closeBildirimAyarlari();
    if(document.getElementById('disa-aktar-overlay')?.style.display!=='none') closeDisaAktar();
    if(document.getElementById('modal')?.style.display!=='none') closeModal();
    if(document.getElementById('kayit-modal')?.style.display!=='none') closeKayitModal();
    if(document.getElementById('muvekkil-modal')?.style.display!=='none') closeMuvekkilModal();
    if(document.getElementById('durusma-sonuc-overlay')?.style.display!=='none') closeDurusmaSonuc();
  }
});

authBaslat();
