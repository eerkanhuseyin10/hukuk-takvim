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
      <div class="modal-header"><h2>İçe ve Dışa Aktar</h2><button class="btn" onclick="closeDisaAktar()">✕</button></div>
      <div class="modal-body">
        <div style="border:1px solid #93c5fd;background:#eff6ff;border-radius:12px;padding:15px;margin-bottom:12px;">
          <div style="font-size:14px;font-weight:700;margin-bottom:5px;">UYAP duruşmalarını içe aktar</div>
          <div style="font-size:12px;color:var(--text2);line-height:1.5;margin-bottom:12px;">UYAP Avukat Portal'dan indirilen .ics dosyasını okur; müvekkilleri, dava dosyalarını ve duruşmaları oluşturmadan önce özetini gösterir. Mevcut kayıtlar tekrar eklenmez.</div>
          <input id="uyap-ics-dosya" type="file" accept="text/calendar,.ics" style="display:none;" onchange="uyapIcsDosyasiSecildi(this)">
          <button class="btn btn-primary" style="width:100%;" onclick="document.getElementById('uyap-ics-dosya').click()">UYAP .ics Dosyası Seç</button>
        </div>
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

// ── UYAP .ICS İÇE AKTAR ─────────────────────────────────────────
let UYAP_ICS_ONIZLEME=[],UYAP_ICS_DOSYALAR=[];
function uyapIcsCoz(metin){
  const satirlar=[];
  String(metin||'').replace(/\r\n/g,'\n').replace(/\r/g,'\n').split('\n').forEach(s=>{if(/^[ \t]/.test(s)&&satirlar.length)satirlar[satirlar.length-1]+=s.slice(1);else satirlar.push(s);});
  const etkinlikler=[];let e=null;
  satirlar.forEach(s=>{if(s==='BEGIN:VEVENT')e={};else if(s==='END:VEVENT'){if(e)etkinlikler.push(e);e=null;}else if(e&&s.includes(':')){const i=s.indexOf(':'),k=s.slice(0,i).split(';')[0],v=s.slice(i+1);(e[k]||(e[k]=[])).push(v);}});
  const ac=s=>String(s||'').replace(/\\n/g,'\n').replace(/\\,/g,',').replace(/\\;/g,';').replace(/\\\\/g,'\\').trim();
  const alan=(d,etiket)=>{const m=d.match(new RegExp('(?:^|\\n)'+etiket.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+':\\s*([^\\n]*)','i'));return m?m[1].trim():'';};
  const bolum=(d,baslik,sonraki)=>{const re=new RegExp('(?:^|\\n)'+baslik+':\\s*\\n([\\s\\S]*?)'+(sonraki?'(?=\\n'+sonraki+':|$)':'$'),'i'),m=d.match(re);if(!m)return[];return m[1].split('\n').map(x=>x.replace(/^\s*-\s*/,'').trim()).filter(Boolean).map(x=>{const p=x.match(/^(.*?)\s+-\s+([^\n-]+)$/);return{name:(p?p[1]:x).trim(),rol:(p?p[2]:'').trim()};});};
  return etkinlikler.map(x=>{
    const d=ac(x.DESCRIPTION?.[0]||''),dt=String(x.DTSTART?.[0]||''),m=dt.match(/(\d{4})(\d{2})(\d{2})T?(\d{2})?(\d{2})?/),temsil=bolum(d,'Vekili Olunan Taraflar','Diğer Taraflar'),diger=bolum(d,'Diğer Taraflar','');
    return{uid:ac(x.UID?.[0]||''),date:m?`${m[1]}-${m[2]}-${m[3]}`:'',saat:m&&m[4]?`${m[4]}:${m[5]||'00'}`:'',mahkeme:alan(d,'Birim')||ac(x.LOCATION?.[0]||''),dava:alan(d,'Dosya No'),dosyaTuru:alan(d,'Dosya Türü'),islem:alan(d,'İşlem')||'Duruşma',sonuc:alan(d,'Sonuç'),temsil,diger};
  }).filter(x=>x.date&&x.mahkeme&&x.dava);
}
function uyapIcsAnahtar(s){return String(s||'').trim().replace(/\s+/g,' ').toLocaleLowerCase('tr-TR');}
function uyapIcsDal(tur,mahkeme,islem=''){const s=uyapIcsAnahtar((tur||'')+' '+(mahkeme||'')+' '+(islem||''));if(s.includes('keşif')||s.includes('kesif'))return'kesif';if(s.includes('ceza')||s.includes('ağır'))return'ceza';if(s.includes('icra'))return'icra';if(s.includes('idari')||s.includes('vergi'))return'idare';return'hukuk';}
function uyapIcsDosyaAnahtari(x){return uyapIcsAnahtar(x.mahkeme)+'|'+uyapIcsAnahtar(x.dava);}
function uyapIcsDalEtiketi(dal){return{hukuk:'Hukuk',ceza:'Ceza',icra:'İcra',idare:'İdare',kesif:'Keşif',cmk:'CMK',tevkil:'Tevkil'}[dal]||'Hukuk';}
function uyapIcsDosyaTuruSec(index,deger){if(UYAP_ICS_DOSYALAR[index])UYAP_ICS_DOSYALAR[index].secim=deger;}
function uyapIcsKayitDali(x){const grup=UYAP_ICS_DOSYALAR.find(g=>g.anahtar===uyapIcsDosyaAnahtari(x));return grup&&['cmk','tevkil'].includes(grup.secim)?grup.secim:uyapIcsDal(x.dosyaTuru,x.mahkeme,x.islem);}
function uyapIcsAktarilacaklar(){const atlanacak=new Set(UYAP_ICS_DOSYALAR.filter(g=>g.secim==='atla').map(g=>g.anahtar));return UYAP_ICS_ONIZLEME.filter(x=>!atlanacak.has(uyapIcsDosyaAnahtari(x)));}
async function uyapIcsDosyasiSecildi(input){
  const dosya=input.files?.[0];input.value='';if(!dosya)return;
  if(dosya.size>5*1024*1024){disaAktarMesaj('ICS dosyası 5 MB sınırını aşıyor.',true);return;}
  try{UYAP_ICS_ONIZLEME=uyapIcsCoz(await dosya.text());}catch(e){UYAP_ICS_ONIZLEME=[];}
  if(!UYAP_ICS_ONIZLEME.length){disaAktarMesaj('UYAP duruşması bulunamadı. UYAP Avukat Portal duruşma takvimi .ics dosyasını seçin.',true);return;}
  const muvekkilSayisi=new Set(UYAP_ICS_ONIZLEME.flatMap(x=>x.temsil.map(y=>uyapIcsAnahtar(y.name)))).size,grupMap=new Map();UYAP_ICS_ONIZLEME.forEach(x=>{const anahtar=uyapIcsDosyaAnahtari(x);if(!grupMap.has(anahtar))grupMap.set(anahtar,{anahtar,ornek:x,kayitlar:[],secim:'otomatik'});grupMap.get(anahtar).kayitlar.push(x);});UYAP_ICS_DOSYALAR=[...grupMap.values()];const dosyaSayisi=UYAP_ICS_DOSYALAR.length;
  let o=document.getElementById('uyap-ics-onizleme');if(!o){o=document.createElement('div');o.id='uyap-ics-onizleme';o.className='modal-overlay';o.style.zIndex='620';document.body.appendChild(o);}o.onclick=ev=>{if(ev.target===o)o.style.display='none';};
  o.innerHTML=`<div class="modal" style="max-width:760px;"><div class="modal-header"><div><h2>UYAP Aktarım Önizlemesi</h2><div style="font-size:11px;color:var(--text2);margin-top:3px;">${UYAP_ICS_ONIZLEME.length} duruşma · ${dosyaSayisi} dosya · ${muvekkilSayisi} vekili olunan taraf</div></div><button class="btn" onclick="document.getElementById('uyap-ics-onizleme').style.display='none'">✕</button></div><div class="modal-body"><div style="padding:11px;background:#eff6ff;border-radius:9px;font-size:11px;color:#1e40af;margin-bottom:12px;line-height:1.5;">Her dosya için UYAP'tan belirlenen türü koruyabilir, <b>CMK / Tevkil</b> seçebilir veya artık takip etmediğiniz dosyayı <b>hiç aktarmayabilirsiniz</b>. Seçim, dosyanın bütün duruşmalarına uygulanır.</div><div style="max-height:390px;overflow:auto;border:1px solid var(--border);border-radius:10px;">${UYAP_ICS_DOSYALAR.map((g,i)=>{const x=g.ornek,otomatik=uyapIcsDal(x.dosyaTuru,x.mahkeme,x.islem);return`<div style="padding:11px;border-bottom:1px solid var(--border);display:grid;grid-template-columns:minmax(0,1fr) 190px;gap:12px;align-items:center;"><div><b style="font-size:12px;">${esc(x.dava)} · ${esc(x.mahkeme)}</b><div style="font-size:11px;color:var(--text2);margin-top:4px;">${g.kayitlar.length} duruşma · Müvekkil: ${esc(x.temsil.map(y=>y.name).join(', ')||'Belirtilmemiş')}</div></div><select style="width:100%;padding:8px;border:1px solid var(--border2);border-radius:9px;background:var(--surface);" onchange="uyapIcsDosyaTuruSec(${i},this.value)"><option value="otomatik">Türü koru (${uyapIcsDalEtiketi(otomatik)})</option><option value="cmk">CMK</option><option value="tevkil">Tevkil</option><option value="atla">⛔ Bu dosyayı aktarma</option></select></div>`;}).join('')}</div><div style="font-size:10px;color:var(--text3);margin-top:8px;">“Bu dosyayı aktarma” seçilen dosyalar için duruşma, dava kartı ve müvekkil oluşturulmaz. Mevcut kayıtlar yeniden oluşturulmaz.</div><div style="display:flex;gap:8px;margin-top:14px;"><button class="btn" style="flex:1;" onclick="document.getElementById('uyap-ics-onizleme').style.display='none'">Vazgeç</button><button id="uyap-ics-aktar-btn" class="btn btn-primary" style="flex:1;" onclick="uyapIcsAktar()">Seçilenleri Oluştur</button></div><div id="uyap-ics-aktar-msg" style="font-size:12px;margin-top:9px;"></div></div></div>`;o.style.display='flex';
}
async function uyapIcsAktar(){
  const btn=document.getElementById('uyap-ics-aktar-btn'),msg=document.getElementById('uyap-ics-aktar-msg');if(!UYAP_ICS_ONIZLEME.length)return;btn.disabled=true;btn.textContent='Aktarılıyor...';
  try{
    const aktarilacaklar=uyapIcsAktarilacaklar(),kullaniciAtlanan=UYAP_ICS_ONIZLEME.length-aktarilacaklar.length;
    if(!aktarilacaklar.length){msg.textContent='Aktarılacak dosya seçilmedi.';msg.style.color='#b42318';btn.disabled=false;btn.textContent='Seçilenleri Oluştur';return;}
    await buroKartlariYukle();
    const mMap=new Map(MUVEKKIL_KARTLARI.map(x=>[uyapIcsAnahtar(x.ad),x]));
    const yeniM=[];aktarilacaklar.flatMap(x=>x.temsil).forEach(x=>{const k=uyapIcsAnahtar(x.name);if(k&&!mMap.has(k)){mMap.set(k,{ad:x.name});yeniM.push({buro_id:_buro.id,ad:x.name,created_by:_user.id});}});
    if(yeniM.length){const{error}=await sb.from('muvekkiller').insert(yeniM);if(error)throw error;}
    const{data:ml,error:mh}=await sb.from('muvekkiller').select('id,buro_id,ad').eq('buro_id',_buro.id);if(mh)throw mh;mMap.clear();(ml||[]).forEach(x=>mMap.set(uyapIcsAnahtar(x.ad),x));
    const dKey=x=>uyapIcsAnahtar(x.mahkeme)+'|'+uyapIcsAnahtar(x.dosya_no||x.dava),dMap=new Map(DAVA_DOSYALARI.map(x=>[dKey(x),x])),yeniD=[];
    aktarilacaklar.forEach(x=>{const k=dKey(x);if(!dMap.has(k)){dMap.set(k,{mahkeme:x.mahkeme,dosya_no:x.dava});yeniD.push({buro_id:_buro.id,mahkeme:x.mahkeme,dosya_no:x.dava,konu:x.dosyaTuru||null,hukuk_alani:uyapIcsDalEtiketi(uyapIcsDal(x.dosyaTuru,x.mahkeme,x.islem)),karsi_taraf:x.diger.map(y=>y.name).join(', ')||null,durum:'acik',created_by:_user.id});}});
    if(yeniD.length){const{error}=await sb.from('dava_dosyalari').insert(yeniD);if(error)throw error;}
    const{data:dl,error:dh}=await sb.from('dava_dosyalari').select('*').eq('buro_id',_buro.id);if(dh)throw dh;dMap.clear();(dl||[]).forEach(x=>dMap.set(dKey(x),x));
    const baglar=[];aktarilacaklar.forEach(x=>{const d=dMap.get(dKey(x));x.temsil.forEach(t=>{const m=mMap.get(uyapIcsAnahtar(t.name));if(d&&m)baglar.push({dava_dosyasi_id:d.id,muvekkil_id:m.id});});});
    if(baglar.length){const tek=[...new Map(baglar.map(x=>[x.dava_dosyasi_id+'|'+x.muvekkil_id,x])).values()];const{error}=await sb.from('dava_dosyasi_muvekkilleri').upsert(tek,{onConflict:'dava_dosyasi_id,muvekkil_id',ignoreDuplicates:true});if(error)throw error;}
    const mevcut=new Set(records.map(x=>[x.date,x.saat,uyapIcsAnahtar(x.mahkeme),uyapIcsAnahtar(x.dava)].join('|'))),kayitlar=[];let atlanan=0;
    aktarilacaklar.forEach(x=>{const k=[x.date,x.saat,uyapIcsAnahtar(x.mahkeme),uyapIcsAnahtar(x.dava)].join('|');if(mevcut.has(k)){atlanan++;return;}mevcut.add(k);const d=dMap.get(dKey(x)),ms=x.temsil.map(t=>mMap.get(uyapIcsAnahtar(t.name))).filter(Boolean),tamam=/yapıldı|tamamlandı/i.test(x.sonuc),dal=uyapIcsKayitDali(x),tur=uyapIcsDalEtiketi(dal);kayitlar.push({type:'durusma',date:x.date,saat:x.saat||null,buro_id:_buro.id,baslik:x.islem||'Duruşma',muvekkil:ms.map(m=>m.ad).join(', ')||null,muvekkil_id:ms[0]?.id||null,dava_dosyasi_id:d?.id||null,mahkeme:x.mahkeme,dava:x.dava,dal,istipi:tur,istipi_val:tur,not_alani:['UYAP takviminden aktarıldı.',x.sonuc&&'Sonuç: '+x.sonuc,x.diger.length&&'Diğer taraflar: '+x.diger.map(y=>y.name+' ('+y.rol+')').join(', ')].filter(Boolean).join('\n'),tamamlandi:tamam,gecmis_kayit:tamam});});
    if(kayitlar.length){const{error}=await sb.from('kayitlar').insert(kayitlar);if(error)throw error;}
    await loadRecords();await buroKartlariYukle();msg.textContent=`✓ ${kayitlar.length} duruşma, ${yeniD.length} dosya ve ${yeniM.length} müvekkil oluşturuldu.${kullaniciAtlanan?' Seçiminizle '+kullaniciAtlanan+' duruşma aktarılmadı.':''}${atlanan?' '+atlanan+' mevcut duruşma atlandı.':''}`;btn.textContent='Tamamlandı';setTimeout(()=>{document.getElementById('uyap-ics-onizleme').style.display='none';closeDisaAktar();},2200);
  }catch(e){msg.textContent='Aktarım durdu: '+(e.message||e);msg.style.color='#dc2626';btn.disabled=false;btn.textContent='Tekrar Dene';}
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
