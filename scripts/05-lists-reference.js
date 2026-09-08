/* Sekreter renderer: 05-lists-reference.js */
// ── LİSTE ─────────────────────────────────────────────────────────
function toggleDetail(id){openDetailId=openDetailId===id?null:id;renderListe();}

function safeText(v){
  return String(v||'').replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];});
}

function wrapCanvasText(ctx,text,x,y,maxWidth,lineHeight,maxLines){
  text=String(text||'').replace(/\s+/g,' ').trim();
  if(!text) return y;
  const words=text.split(' ');
  let line='',lines=[];
  for(const word of words){
    const test=line?line+' '+word:word;
    if(ctx.measureText(test).width>maxWidth && line){lines.push(line);line=word;}else{line=test;}
  }
  if(line) lines.push(line);
  if(maxLines && lines.length>maxLines){
    lines=lines.slice(0,maxLines);
    while(ctx.measureText(lines[lines.length-1]+'…').width>maxWidth && lines[lines.length-1].length>0){
      lines[lines.length-1]=lines[lines.length-1].slice(0,-1);
    }
    lines[lines.length-1]+='…';
  }
  for(const ln of lines){ctx.fillText(ln,x,y);y+=lineHeight;}
  return y;
}

function roundRectPath(ctx,x,y,w,h,r){
  const rr=Math.min(r,w/2,h/2);
  ctx.beginPath();
  ctx.moveTo(x+rr,y);
  ctx.arcTo(x+w,y,x+w,y+h,rr);
  ctx.arcTo(x+w,y+h,x,y+h,rr);
  ctx.arcTo(x,y+h,x,y,rr);
  ctx.arcTo(x,y,x+w,y,rr);
  ctx.closePath();
}

function kayitPaylasimMetni(r){
  return `📌 ${getBaslik(r)}\n\nMüvekkil: ${r.muvekkil||'-'}\nMahkeme: ${r.mahkeme||'-'}\nDosya No: ${r.dava||'-'}\nTarih: ${formatDate(r.date)}${r.saat?' '+r.saat:''}\nTür: ${typeLabel(r.type,r.dal)}${r.not?'\n\nNot: '+r.not:''}\n\n— ${_buro?.ad||''}`;
}

const BURO_LOGO_B64='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'; // Kullanıcı görseli, altın renk + kalınlaştırılmış çizgi (küçük boyutta görünürlük için)
let _kartLogoImg=null;
function kartLogoYukle(){
  return new Promise(resolve=>{
    if(_kartLogoImg){resolve(_kartLogoImg);return;}
    const img=new Image();
    img.onload=()=>{_kartLogoImg=img;resolve(img);};
    img.onerror=()=>resolve(null);
    img.src='data:image/png;base64,'+BURO_LOGO_B64;
  });
}
async function fontlariHazirla(){
  try{
    await Promise.all([
      document.fonts.load("800 44px Inter"),
      document.fonts.load("700 32px Inter"),
      document.fonts.load("600 30px Inter"),
      document.fonts.load("500 26px Inter"),
      document.fonts.load("400 26px Inter"),
    ]);
    await document.fonts.ready;
  }catch(e){}
}

function kayitKartCanvas(r,logoImg){
  const W=1080,H=1400;
  const buroAdi=_buro?.ad||'Büro';
  const monogram=buroAdi.trim().charAt(0).toLocaleUpperCase('tr-TR')||'B';
  const c=document.createElement('canvas');
  c.width=W;c.height=H;
  const ctx=c.getContext('2d');
  const F=(w,s)=>`${w} ${s}px Inter, 'Segoe UI', Arial, sans-serif`;

  // Dış zemin — hafif degrade
  const bgGrad=ctx.createLinearGradient(0,0,0,H);
  bgGrad.addColorStop(0,'#eef0f3');bgGrad.addColorStop(1,'#e4e7ec');
  ctx.fillStyle=bgGrad;ctx.fillRect(0,0,W,H);

  // Kart gövdesi — gölge + beyaz kart
  ctx.save();
  ctx.shadowColor='rgba(20,20,30,0.18)';ctx.shadowBlur=46;ctx.shadowOffsetY=18;
  roundRectPath(ctx,64,64,W-128,H-128,30);ctx.fillStyle='#ffffff';ctx.fill();
  ctx.restore();
  roundRectPath(ctx,64,64,W-128,H-128,30);ctx.strokeStyle='#e4e6ea';ctx.lineWidth=2;ctx.stroke();

  // Üst başlık şeridi — lacivert
  roundRectPath(ctx,64,64,W-128,158,30);
  ctx.save();ctx.clip();
  ctx.fillStyle='#1f1f1f';ctx.fillRect(64,64,W-128,158);
  ctx.restore();

  // Logo — koyu zemin üzerine direkt (altın renkli, kalınlaştırılmış çizgi)
  if(logoImg){
    const dh=95,dw=dh*(logoImg.width/logoImg.height);
    ctx.drawImage(logoImg,135-dw/2,143-dh/2,dw,dh);
  } else {
    ctx.fillStyle='#d4af70';ctx.font=F(800,32);ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(monogram,146,145);
    ctx.textAlign='left';ctx.textBaseline='alphabetic';
  }

  // Büro adı + alt başlık
  ctx.fillStyle='#ffffff';ctx.font=F(700,36);ctx.fillText(buroAdi,204,133);
  ctx.fillStyle='rgba(255,255,255,0.55)';ctx.font=F(500,24);ctx.fillText('İş Kartı',204,168);

  // Durum rozeti (sağ üst)
  const typeColor={sure:'#ef4444',durusma:'#3b82f6',genel:'#22c55e',tekrar:'#f59e0b'}[r.type]||'#6b7280';
  const badgeLabel=(r.tamamlandi?'✓ Tamamlandı':typeLabel(r.type,r.dal)).toUpperCase();
  ctx.font=F(700,22);
  const badgeW=Math.max(180,ctx.measureText(badgeLabel).width+56);
  const badgeX=W-64-30-badgeW;
  roundRectPath(ctx,badgeX,102,badgeW,44,22);ctx.fillStyle=r.tamamlandi?'#16a34a':typeColor;ctx.fill();
  ctx.fillStyle='#ffffff';ctx.textAlign='center';ctx.fillText(badgeLabel,badgeX+badgeW/2,130);
  ctx.textAlign='left';

  // Konu başlığı
  let y=290;
  ctx.fillStyle='#1a1d23';ctx.font=F(800,46);
  y=wrapCanvasText(ctx,getBaslik(r),110,y,860,58,2)+18;

  // İnce ayraç
  ctx.strokeStyle='#e9ebef';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(110,y);ctx.lineTo(970,y);ctx.stroke();
  y+=48;

  // İki sütunlu bilgi bloğu
  const colL=110,colR=560,colW=400;
  function bilgiHucre(x,yy,label,value){
    ctx.fillStyle='#9aa0ac';ctx.font=F(700,21);
    ctx.fillText(label.toLocaleUpperCase('tr-TR'),x,yy);
    ctx.fillStyle='#1a1d23';ctx.font=F(600,30);
    return wrapCanvasText(ctx,value||'—',x,yy+34,colW,38,2);
  }
  const yA=bilgiHucre(colL,y,'Müvekkil',r.muvekkil);
  const yB=bilgiHucre(colR,y,'Mahkeme',r.mahkeme);
  y=Math.max(yA,yB)+34;
  const yC=bilgiHucre(colL,y,'Dosya No',r.dava);
  const yD=bilgiHucre(colR,y,'Tarih',formatDate(r.date)+(r.saat?' · '+r.saat:''));
  y=Math.max(yC,yD)+34;
  if(r.dal){
    y=bilgiHucre(colL,y,'Hukuk Dalı',dalLabel(r.dal))+34;
  }

  // Not kutusu
  if(r.not){
    const notBoxY=y;
    ctx.font=F(400,28);
    // Yüksekliği önceden ölç
    const tempLines=String(r.not).replace(/\s+/g,' ').trim().split(' ');
    let line='',lineCount=1;
    for(const w of tempLines){const t=line?line+' '+w:w;if(ctx.measureText(t).width>760&&line){lineCount++;line=w;}else{line=t;}}
    lineCount=Math.min(lineCount,5);
    const boxH=64+lineCount*36;
    roundRectPath(ctx,110,notBoxY,860,boxH,16);ctx.fillStyle='#faf6ee';ctx.fill();
    ctx.strokeStyle='#f0e4c8';ctx.lineWidth=1.5;roundRectPath(ctx,110,notBoxY,860,boxH,16);ctx.stroke();
    ctx.fillStyle='#a9812f';ctx.font=F(700,20);ctx.fillText('NOT',140,notBoxY+38);
    ctx.fillStyle='#5a5342';ctx.font=F(400,28);
    wrapCanvasText(ctx,r.not,140,notBoxY+74,800,36,5);
    y=notBoxY+boxH+30;
  }

  // Alt bilgi şeridi — sadece ince bir uyarı notu
  const footerY=H-64-60;
  ctx.strokeStyle='#e9ebef';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(110,footerY);ctx.lineTo(970,footerY);ctx.stroke();
  ctx.fillStyle='#b7bcc5';ctx.font=F(400,20);ctx.textAlign='center';
  ctx.fillText('Bu bilgilendirme amaçlıdır, resmi belge niteliği taşımaz.',540,footerY+40);
  ctx.textAlign='left';
  return c;
}

function canvasToBlob(canvas){
  return new Promise(resolve=>canvas.toBlob(resolve,'image/png',0.95));
}

async function shareKayitCard(id){
  const r=records.find(x=>x.id===id);
  if(!r) return;
  try{
    await fontlariHazirla();
    const logoImg=await kartLogoYukle();
    const canvas=kayitKartCanvas(r,logoImg);
    const blob=await canvasToBlob(canvas);
    const fileName='is-karti-'+(r.dava||getBaslik(r)||r.id).toString().replace(/[^a-zA-Z0-9ğüşöçıİĞÜŞÖÇ-]+/g,'-').slice(0,45)+'.png';
    const file=new File([blob],fileName,{type:'image/png'});
    if(navigator.canShare && navigator.canShare({files:[file]}) && navigator.share){
      await navigator.share({title:getBaslik(r),text:'İş kartı',files:[file]});
      return;
    }
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=fileName;
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),1500);
    alert('İş kartı PNG olarak indirildi. WhatsApp’ta görsel olarak paylaşabilirsiniz.');
  }catch(err){
    console.error(err);
    const url='https://wa.me/?text='+encodeURIComponent(kayitPaylasimMetni(r));
    window.open(url,'_blank');
  }
}

function renderListe(){
  const ft=document.getElementById('filter-type').value;
  const durum=document.getElementById('filter-status')?.value||'acik';
  const fs=(document.getElementById('filter-search').value||'').toLowerCase();
  let f=records.filter(r=>!r.tekrarAnaId);
  if(durum==='acik')f=f.filter(r=>!r.tamamlandi);
  if(durum==='tamamlandi')f=f.filter(r=>r.tamamlandi);
  if(ft)f=f.filter(r=>r.type===ft);
  if(fs)f=f.filter(r=>(getBaslik(r)+r.muvekkil+r.dava+r.mahkeme).toLowerCase().includes(fs));
  f.sort((a,b)=>durum==='tamamlandi'?new Date(b.date)-new Date(a.date):new Date(a.date)-new Date(b.date));
  const tb=document.getElementById('liste-tbody');
  if(!f.length){tb.innerHTML='<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:18px;">Kayıt yok</td></tr>';return;}
  let html='';
  f.forEach(r=>{
    const rowStyle=r.tamamlandi?'opacity:0.45;text-decoration:line-through;':'';
    html+=`<tr onclick="toggleDetail(${r.id})" style="${rowStyle}">
      <td>${formatDate(r.date)}${r.saat?'<br><small style="color:var(--text2)">'+r.saat+'</small>':''}</td>
      <td>${getBaslik(r)}${r.tekrarTipi?'<br><span class="badge badge-tekrar">↻ '+tekrarTipiLabel(r.tekrarTipi)+'</span>':r.tekrarAnaId?'<br><span class="badge badge-tekrar">↻ Tekrar</span>':''}</td>
      <td style="padding:0;">${r.muvekkil?`<span class='mv-link' onclick='event.stopPropagation();openMuvekkilModal(${JSON.stringify(r.muvekkil)})' style="display:block;padding:9px 13px;cursor:pointer;">${r.muvekkil}</span>`:'<span style="padding:9px 13px;display:block;">—</span>'}</td>
      <td><span class="badge badge-${r.type==="tekrar"?"tekrar-type":r.type}">${typeLabel(r.type,r.dal)}</span></td>
      <td>${dalLabel(r.dal)}</td><td style="padding:0;">${r.dava?`<span class='mv-link' onclick='event.stopPropagation();openDosyaModal(${JSON.stringify(r.dava)})' style="display:block;padding:9px 13px;cursor:pointer;">${esc(r.dava)}</span>`:'<span style="padding:9px 13px;display:block;">—</span>'}</td>
      <td><div class="action-btns">
        <button class="icon-btn" onclick="event.stopPropagation();toggleTamamlandi(${r.id})" title="${r.tamamlandi?'Geri Al':'Tamamlandı işaretle'}">${r.tamamlandi?'↩ Geri Al':'○'}</button>
        <button class="icon-btn share-card-btn" onclick="event.stopPropagation();shareKayitCard(${r.id})">📤 Paylaş</button>
        <button class="icon-btn" onclick="event.stopPropagation();openModal(records.find(x=>x.id===${r.id}))">Düzenle</button>
        
        <button class="icon-btn del" onclick="event.stopPropagation();deleteRecord(${r.id})">Sil</button>
      </div></td>
    </tr>`;
    if(openDetailId===r.id){
      const d=r.hesapDetay;
      let dh=r.type==='sure'&&d?buildHesapHTML(d):`<div style="font-size:12px;color:var(--text2);">${r.mahkeme?'<b>Mahkeme:</b> '+esc(r.mahkeme)+' ':''} ${r.not?'<b>Not:</b> '+esc(r.not):''}</div>`;
      dh+=`<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">${ekSureUygunMu(r)?`<button class="icon-btn" style="color:#1e40af;border-color:#1e40af;font-weight:600;" onclick="event.stopPropagation();openEkSureOverlay(${r.id})">⏳ Ek Süre Talep Dilekçesi</button>`:''}<button class="icon-btn" onclick="openModal(records.find(x=>x.id===${r.id}))">Düzenle</button><button class="icon-btn del" onclick="deleteRecord(${r.id})">Sil</button></div>`;
      html+=`<tr class="detail-row"><td colspan="7">${dh}</td></tr>`;
    }
  });
  tb.innerHTML=html;
}

function renderTamamlanan(){
  const fs=(document.getElementById('filter-tamamlanan').value||'').toLowerCase();
  let f=records.filter(r=>r.tamamlandi&&!r.tekrarAnaId);
  if(fs)f=f.filter(r=>(getBaslik(r)+r.muvekkil+r.dava).toLowerCase().includes(fs));
  f.sort((a,b)=>new Date(b.date)-new Date(a.date));
  const tb=document.getElementById('tamamlanan-tbody');
  if(!f.length){tb.innerHTML='<tr><td colspan="6" style="text-align:center;color:var(--text3);padding:18px;">Tamamlanan iş yok</td></tr>';return;}
  tb.innerHTML=f.map(r=>`<tr onclick="openKayitModal(${r.id})" style="opacity:0.7;">
    <td>${formatDate(r.date)}</td>
    <td style="text-decoration:line-through;">${getBaslik(r)}</td>
    <td style="padding:0;">${r.muvekkil?`<span class='mv-link' onclick='event.stopPropagation();openMuvekkilModal(${JSON.stringify(r.muvekkil)})' style="display:block;padding:9px 13px;cursor:pointer;">${esc(r.muvekkil)}</span>`:'<span style="padding:9px 13px;display:block;">—</span>'}</td>
    <td><span class="badge badge-${r.type==='tekrar'?'tekrar-type':r.type}">${typeLabel(r.type,r.dal)}</span></td>
    <td>${dalLabel(r.dal)}</td>
    <td><div class="action-btns">
      <button class="icon-btn" style="color:#22c55e;font-weight:600;" onclick="event.stopPropagation();toggleTamamlandi(${r.id}).then(()=>renderTamamlanan())">↩ Geri Al</button>
      <button class="icon-btn del" onclick="event.stopPropagation();deleteRecord(${r.id})">Sil</button>
    </div></td>
  </tr>`).join('');
}

// ══════════════════════════════════════════════════════════════════
// ── REFERANS / BİLGİ BANKASI ────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════
const REFERANS_ITEMS=[
  {id:'aaut-tarife',baslik:'AAÜT 2026 Tarifesi',ozet:'Avukatlık Asgari Ücret Tarifesi — 2025/2026 karşılaştırmalı tam tarife',icon:'⚖️'},
  {id:'ucretli-izinler',baslik:'İşveren Tarafından Verilmesi Gereken Ücretli İzinler',ozet:'Yıllık izin, evlilik, doğum, ölüm, süt izni vb. süreleri ve kriterleri',icon:'🗓️'},
  {id:'kidem-ihbar',baslik:'İşten Ayrılış Nedenine Göre Tazminat Hakları',ozet:'50 SGK çıkış koduna göre kıdem, ihbar tazminatı ve işsizlik maaşı hakkı',icon:'💼'},
  {id:'tuketici-hakem',baslik:'Tüketici Hakem Heyetleri',ozet:'Başvuru yöntemleri, yetkili heyet, görev/üyeler ve 2026 parasal sınırları',icon:'🛒'},
];
function renderReferans(){
  const wrap=document.getElementById('referans-grid');
  if(!wrap)return;
  wrap.innerHTML=REFERANS_ITEMS.map(x=>`<div class="referans-card" onclick="openReferansDetay('${x.id}')">
    <div class="referans-card-icon">${x.icon}</div>
    <div class="referans-card-baslik">${x.baslik}</div>
    <div class="referans-card-ozet">${x.ozet}</div>
  </div>`).join('');
}
function openReferansDetay(id){
  const item=REFERANS_ITEMS.find(x=>x.id===id);if(!item)return;
  document.getElementById('ref-baslik').textContent=item.icon+' '+item.baslik;
  document.getElementById('ref-body').innerHTML=REFERANS_ICERIK[id]();
  document.getElementById('referans-detay-overlay').style.display='flex';
}
function closeReferansDetay(){
  document.getElementById('referans-detay-overlay').style.display='none';
}
function refRow(kalem,v25,v26){
  return `<tr><td>${kalem}</td><td>${v25}</td><td>${v26}</td></tr>`;
}
const REFERANS_ICERIK={
  // ── AAÜT TARİFESİ ──────────────────────────────────────────────
  'aaut-tarife':function(){
    let h='<div class="ref-note">2025 ve 2026 yılı Avukatlık Asgari Ücret Tarifesi karşılaştırmalı olarak sunulmaktadır. Tutarlar TL\'dir.</div>';

    h+='<div class="ref-section-title">BİRİNCİ KISIM · BİRİNCİ BÖLÜM — Dava ve Takiplerin Dışındaki Hukuki Yardımlarda Ödenecek Ücret</div>';
    h+='<table class="ref-table"><thead><tr><th style="width:60%;">Kalem</th><th>2025</th><th>2026</th></tr></thead><tbody>';
    h+=refRow('1. Büroda sözlü danışma (ilk 1 saate kadar)','3.500,00 TL','4.000,00 TL');
    h+=refRow('&nbsp;&nbsp;Takip eden her saat için','1.500,00 TL','1.800,00 TL');
    h+=refRow('2. Çağrı üzerine gidilen yerde sözlü danışma (ilk 1 saate kadar)','6.000,00 TL','7.000,00 TL');
    h+=refRow('&nbsp;&nbsp;Takip eden her saat için','3.000,00 TL','3.500,00 TL');
    h+=refRow('3. Yazılı danışma (ilk 1 saate kadar)','6.000,00 TL','7.000,00 TL');
    h+=refRow('&nbsp;&nbsp;Takip eden her saat için','3.000,00 TL','3.500,00 TL');
    h+=refRow('4. Her türlü dilekçe yazılması, ihbarname, ihtarname, protesto düzenlenmesi','4.500,00 TL','6.000,00 TL');
    h+=refRow('5a. Kira sözleşmesi ve benzeri','6.000,00 TL','8.000,00 TL');
    h+=refRow('5b. Tüzük, yönetmelik, miras sözleşmesi, vasiyetname, vakıf senedi ve benzeri','24.000,00 TL','32.000,00 TL');
    h+=refRow('5c. Şirket ana sözleşmesi, devir/birleşme vb. ticari sözleşmeler','16.000,00 TL','21.000,00 TL');
    h+=refRow('6. Arabuluculuğun anlaşmazlıkla sonuçlanması halinde taraf vekilleri için','7.000,00 TL','8.000,00 TL');
    h+='</tbody></table>';

    h+='<div class="ref-section-title">İKİNCİ BÖLÜM — İş Takibi Konusundaki Hukuki Yardımlarda Ödenecek Ücret</div>';
    h+='<table class="ref-table"><thead><tr><th style="width:60%;">Kalem</th><th>2025</th><th>2026</th></tr></thead><tbody>';
    h+=refRow('1. Belgelendirme, ödeme aşamasındaki paranın tahsili, belge örneği çıkarılması gibi işlerin takibi','5.000,00 TL','6.000,00 TL');
    h+=refRow('2a. Bir hakkın doğumu, tespiti, tescili, nakli, değiştirilmesi, sona erdirilmesi veya korunması','9.000,00 TL','12.000,00 TL');
    h+=refRow('2b. İpotek tesis/fek dahil — bankalara/finans kuruluşlarına verilen hukuki yardım','2.250,00 TL','3.000,00 TL');
    h+=refRow('3. Tüzel kişi tacirlerin şirket kuruluşu, ruhsat/imtiyaz, devir, TC vatandaşlığına kabul işleri','45.000,00 TL','60.000,00 TL');
    h+=refRow('4. Vergi uzlaşma komisyonlarında takip edilen işler','18.000,00 TL','24.000,00 TL');
    h+=refRow('5a. Uluslararası yargı yerleri — duruşmasız','80.000,00 TL','110.000,00 TL');
    h+=refRow('5b. Uluslararası yargı yerleri — duruşmalı','150.000,00 TL','200.000,00 TL');
    h+=refRow('5c. Konusu para olan işlerde ücret 3. Kısma göre belirlenir','—','—');
    h+=refRow('6. Tüketici hakem heyeti, sebze-meyve hal hakem heyeti (3. kısma göre; altındaysa asıl alacağı geçmemek kaydıyla)','5.000,00 TL','7.000,00 TL');
    h+='</tbody></table>';

    h+='<div class="ref-section-title">ÜÇÜNCÜ BÖLÜM — 1136 S.K. m.35 Gereğince Zorunlu Sözleşmeli Avukatlara Aylık Ücret</div>';
    h+='<table class="ref-table"><thead><tr><th style="width:60%;">Kalem</th><th>2025</th><th>2026</th></tr></thead><tbody>';
    h+=refRow('1. Yapı kooperatiflerinde','19.200,00 TL','27.000,00 TL');
    h+=refRow('2. Anonim şirketlerde','32.000,00 TL','45.000,00 TL');
    h+='</tbody></table>';
    h+='<div class="ref-note">Not: Takip edilen dava/takip/işlerde tarifeye göre hesaplanacak ücret, yıllık ücretin üzerindeyse aradaki eksik miktar avukata ayrıca ödenir.</div>';

    h+='<div class="ref-section-title">DÖRDÜNCÜ BÖLÜM — Sözleşmeli Avukatlara Ödenecek Aylık Ücret</div>';
    h+='<table class="ref-table"><thead><tr><th style="width:60%;">Kalem</th><th>2025</th><th>2026</th></tr></thead><tbody>';
    h+=refRow('1. Özel kişi/tüzel kişilerin sözleşmeli avukatlarına','25.000,00 TL','33.000,00 TL');
    h+=refRow('2. Kamu kurum ve kuruluşlarının sözleşmeli avukatlarına','25.000,00 TL','33.000,00 TL');
    h+='</tbody></table>';

    h+='<div class="ref-section-title">İKİNCİ KISIM · BİRİNCİ BÖLÜM — Konusu Para Olsa da MAKTU Ücrete Bağlı Hukuki Yardımlar</div>';
    h+='<table class="ref-table"><thead><tr><th style="width:60%;">Kalem</th><th>2025</th><th>2026</th></tr></thead><tbody>';
    h+=refRow('1a. İhtiyati haciz, ihtiyati tedbir, delillerin tespiti, icranın geri bırakılması, ödeme/tevdi yeri belirlenmesi — duruşmasız','7.500,00 TL','10.000,00 TL');
    h+=refRow('1b. Aynısı — duruşmalı','9.500,00 TL','12.500,00 TL');
    h+=refRow('2. Ortaklığın giderilmesi — satış memurluğu işlerinin takibi','12.500,00 TL','18.000,00 TL');
    h+=refRow('3. Ortaklığın giderilmesi ve taksim davaları','28.500,00 TL','40.000,00 TL');
    h+=refRow('4a. Vergi Mahkemeleri — duruşmasız','18.000,00 TL','30.000,00 TL');
    h+=refRow('4b. Vergi Mahkemeleri — duruşmalı','36.000,00 TL','40.000,00 TL');
    h+=refRow('5. Tüketici Mahkemeleri — kredi taksit/faiz uyarlama davaları','14.000,00 TL','20.000,00 TL');
    h+='</tbody></table>';

    h+='<div class="ref-section-title">İKİNCİ BÖLÜM — Konusu Para Olmayan Hukuki Yardımlar (Maktu)</div>';
    h+='<table class="ref-table"><thead><tr><th style="width:60%;">Kalem</th><th>2025</th><th>2026</th></tr></thead><tbody>';
    h+=refRow('1. İcra Dairelerinde yapılan takipler','6.000,00 TL','9.000,00 TL');
    h+=refRow('2. İcra Mahkemelerinde takip edilen işler','7.000,00 TL','11.000,00 TL');
    h+=refRow('3. İcra Mahkemelerinde takip edilen dava ve duruşmalı işler','12.000,00 TL','18.000,00 TL');
    h+=refRow('4. Tahliyeye ilişkin icra takipleri','13.500,00 TL','20.000,00 TL');
    h+=refRow('5. İcra Mahkemelerinde takip edilen ceza işleri','10.000,00 TL','15.000,00 TL');
    h+=refRow('6. Çocuk teslimi / kişisel ilişki kararlarının yerine getirilmesine muhalefetten kaynaklanan işler','12.000,00 TL','16.000,00 TL');
    h+=refRow('7. Ceza soruşturma evresinde takip edilen işler','8.000,00 TL','11.000,00 TL');
    h+=refRow('8. Sulh Hukuk Mahkemeleri','18.000,00 TL','30.000,00 TL');
    h+=refRow('9. Sulh Ceza Hakimlikleri ve İnfaz Hakimlikleri','13.500,00 TL','18.000,00 TL');
    h+=refRow('10. Asliye Mahkemeleri','30.000,00 TL','45.000,00 TL');
    h+=refRow('11. Tüketici Mahkemeleri','15.000,00 TL','22.500,00 TL');
    h+=refRow('12. Fikri ve Sınai Haklar Mahkemeleri','40.000,00 TL','55.000,00 TL');
    h+=refRow('13. Ağır Ceza Mahkemeleri','48.000,00 TL','65.000,00 TL');
    h+=refRow('14. Çocuk Mahkemeleri','30.000,00 TL','45.000,00 TL');
    h+=refRow('15. Çocuk Ağır Ceza Mahkemeleri','48.000,00 TL','65.000,00 TL');
    h+=refRow('16. Askerlik Kanunu — Disiplin Kurulları','18.000,00 TL','27.000,00 TL');
    h+=refRow('17a. İdare ve Vergi Mahkemeleri — duruşmasız','18.000,00 TL','30.000,00 TL');
    h+=refRow('17b. İdare ve Vergi Mahkemeleri — duruşmalı','36.000,00 TL','40.000,00 TL');
    h+=refRow('18a. BAM / Bölge İdare M. — ilk derecede görülen davalar','25.000,00 TL','35.000,00 TL');
    h+=refRow('18b. BAM — istinaf, bir duruşmalı işler','16.000,00 TL','22.000,00 TL');
    h+=refRow('18c. BAM — istinaf, birden fazla duruşma/keşif gibi işlemli işler','32.000,00 TL','42.000,00 TL');
    h+=refRow('19a. Sayıştay hesap yargılamaları — duruşmasız','24.000,00 TL','34.000,00 TL');
    h+=refRow('19b. Sayıştay hesap yargılamaları — duruşmalı','46.500,00 TL','65.000,00 TL');
    h+=refRow('20. Yargıtay — ilk derecede görülen davalar','46.500,00 TL','65.000,00 TL');
    h+=refRow('21a. Danıştay — ilk derecede — duruşmasız','28.000,00 TL','40.000,00 TL');
    h+=refRow('21b. Danıştay — ilk derecede — duruşmalı','56.000,00 TL','65.000,00 TL');
    h+=refRow('22. Yargıtay/Danıştay/Sayıştay — temyiz yolu, duruşmalı işler','28.000,00 TL','40.000,00 TL');
    h+=refRow('23. Uyuşmazlık Mahkemesi','30.000,00 TL','40.000,00 TL');
    h+=refRow('24a. AYM — Yüce Divan sıfatıyla bakılan davalar','90.000,00 TL','120.000,00 TL');
    h+=refRow('24b. AYM — Bireysel başvuru, duruşmasız','30.000,00 TL','40.000,00 TL');
    h+=refRow('&nbsp;&nbsp;AYM — Bireysel başvuru, duruşmalı','60.000,00 TL','80.000,00 TL');
    h+=refRow('24c. AYM — diğer dava ve işler','65.000,00 TL','90.000,00 TL');
    h+='</tbody></table>';

    h+='<div class="ref-section-title">ÜÇÜNCÜ KISIM — Konusu Para Olan İşler (Nispi — Kademeli Oran Tablosu)</div>';
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">';
    h+='<table class="ref-table"><thead><tr><th colspan="2">2025 Dilimleri</th></tr><tr><th>Tutar</th><th>Oran</th></tr></thead><tbody>';
    h+='<tr><td>İlk 400.000 TL için</td><td>%16</td></tr>';
    h+='<tr><td>Sonra gelen 400.000 TL için</td><td>%15</td></tr>';
    h+='<tr><td>Sonra gelen 800.000 TL için</td><td>%14</td></tr>';
    h+='<tr><td>Sonra gelen 1.200.000 TL için</td><td>%13</td></tr>';
    h+='<tr><td>Sonra gelen 1.200.000 TL için</td><td>%11</td></tr>';
    h+='<tr><td>Sonra gelen 1.600.000 TL için</td><td>%8</td></tr>';
    h+='<tr><td>Sonra gelen 2.000.000 TL için</td><td>%5</td></tr>';
    h+='<tr><td>Sonra gelen 2.400.000 TL için</td><td>%3</td></tr>';
    h+='<tr><td>Sonra gelen 2.800.000 TL için</td><td>%2</td></tr>';
    h+='<tr><td>11.600.000 TL\'dan yukarısı için</td><td>%1</td></tr>';
    h+='</tbody></table>';
    h+='<table class="ref-table"><thead><tr><th colspan="2">2026 Dilimleri</th></tr><tr><th>Tutar</th><th>Oran</th></tr></thead><tbody>';
    h+='<tr><td>İlk 600.000 TL için</td><td>%16</td></tr>';
    h+='<tr><td>Sonra gelen 600.000 TL için</td><td>%15</td></tr>';
    h+='<tr><td>Sonra gelen 1.200.000 TL için</td><td>%14</td></tr>';
    h+='<tr><td>Sonra gelen 1.800.000 TL için</td><td>%11</td></tr>';
    h+='<tr><td>Sonra gelen 2.400.000 TL için</td><td>%8</td></tr>';
    h+='<tr><td>Sonra gelen 3.000.000 TL için</td><td>%5</td></tr>';
    h+='<tr><td>Sonra gelen 3.600.000 TL için</td><td>%3</td></tr>';
    h+='<tr><td>Sonra gelen 4.200.000 TL için</td><td>%2</td></tr>';
    h+='<tr><td>18.600.000 TL\'dan yukarısı için</td><td>%1</td></tr>';
    h+='</tbody></table>';
    h+='</div>';
    h+='<div class="ref-note">Nispi ücret, dilimlere karşılık gelen oranların ilgili dilim tutarına uygulanıp toplanmasıyla bulunur. 2026 tarifesinde kaynak tabloda 2025\'teki "%13" dilimine karşılık gelen ayrı bir 2026 dilimi görünmemektedir; hesaplamada resmi Tarife metnine bakılması önerilir.</div>';
    return h;
  },

  // ── ÜCRETLİ İZİNLER ────────────────────────────────────────────
  'ucretli-izinler':function(){
    const izinler=[
      ['Yıllık Ücretli İzin','Hizmet süresi 1-5 yıl (5 yıl dahil)','En az 14 gün'],
      ['','Hizmet süresi 5 yıldan fazla 15 yıldan az','En az 20 gün'],
      ['','Hizmet süresi 15 yıl (dahil) ve daha fazla','En az 26 gün'],
      ['Evlilik İzni','İşçinin evlenmesi halinde izin verilir','3 gün'],
      ['Evlat Edinme İzni','İşçinin evlat edinmesi halinde izin verilir','3 gün'],
      ['Ölüm İzni','Anne/baba, eş, kardeş, çocuk ölümü halinde','3 gün'],
      ['Doğum (Babalık) İzni','İşçinin eşinin doğum yapması halinde','10 gün'],
      ['Engelli Çocuk İzni','İşçilerin en az %70 engelli veya süregen hastalığı olan çocuğunun tedavisinde, sağlık raporuna dayalı olarak ve çalışan eşlerden sadece biri tarafından kullanılır','10 güne kadar'],
      ['Yeni İş Arama İzni','İhbar süreleri içinde (talebe gerek kalmaksızın), işçiye yeni iş bulması için iş saatleri içinde (işçinin tercihine göre günlük veya toptan) verilir','En az günde 2 saat'],
      ['Süt İzni','Kadın işçilere 1 yaşından küçük çocuklarını emzirmeleri için fiili çalışma günü içinde verilir','Günde toplam 1,5 saat'],
      ['Gebe Çalışan Muayene İzni','Gebe çalışanlara gebelikleri süresince periyodik kontroller için verilir','Periyodik kontrolleri süresince'],
    ];
    let h='<table class="ref-table"><thead><tr><th style="width:22%;">İzin Adı</th><th>Kriteri</th><th style="width:18%;">Süresi</th></tr></thead><tbody>';
    izinler.forEach(x=>{h+=`<tr><td style="font-weight:600;">${x[0]}</td><td>${x[1]}</td><td style="font-weight:600;color:var(--navy);">${x[2]}</td></tr>`;});
    h+='</tbody></table>';
    h+='<div class="ref-note">Kaynak: İşveren tarafından işçiye verilmesi gereken ücretli izinler (4857 sayılı İş Kanunu ve ilgili mevzuat).</div>';
    return h;
  },

  // ── KIDEM / İHBAR / İŞSİZLİK ───────────────────────────────────
  'kidem-ihbar':function(){
    // [kod, neden, kıdem, ihbar, işsizlik]
    const V=[
    [1,'Deneme süreli iş sözleşmesinin işverence feshi','ALAMAZ','ALAMAZ','ALAMAZ'],
    [2,'Deneme süreli iş sözleşmesinin işçi tarafından feshi','ALAMAZ','ALAMAZ','ALAMAZ'],
    [3,'Belirsiz süreli iş sözleşmesinin işçi tarafından feshi (istifa)','ALAMAZ','ALAMAZ','ALAMAZ'],
    [4,'Belirsiz süreli iş sözleşmesinin işveren tarafından haklı sebep bildirilmeden feshi','ALIR','ALIR','ALIR'],
    [5,'Belirli süreli iş sözleşmesinin sona ermesi','ALIR','ALAMAZ','ALIR'],
    [8,'Emeklilik (yaşlılık) veya toptan ödeme nedeniyle','ALIR','ALAMAZ','ALAMAZ'],
    [9,'Malulen emeklilik nedeniyle','ALIR','ALAMAZ','ALAMAZ'],
    [10,'Ölüm','ALIR','ALAMAZ','ALAMAZ'],
    [11,'İş kazası sonucu ölüm','ALIR','ALAMAZ','ALAMAZ'],
    [12,'Askerlik','ALIR','ALAMAZ','ALAMAZ'],
    [13,'Kadın işçinin evlenmesi','ALIR','ALAMAZ','ALAMAZ'],
    [14,'Emeklilik için yaş dışında diğer şartların tamamlanması','ALIR','ALAMAZ','ALAMAZ'],
    [15,'Toplu işçi çıkarma','ALIR','ALIR','ALIR'],
    [16,'Sözleşme sona ermeden sigortalının aynı işverene ait diğer işyerine nakli','ALAMAZ','ALAMAZ','ALAMAZ'],
    [17,'İşyerinin kapanması','ALIR','ALIR','ALIR'],
    [18,'İşin sona ermesi','ALIR','ALIR','ALIR'],
    [19,'Mevsim bitimi (iş akdinin askıya alınması halinde kullanılır. Tekrar başlatılmayacaksa "4" nolu kod kullanılır)','ALAMAZ','ALAMAZ','ALAMAZ'],
    [20,'Kampanya bitimi (iş akdinin askıya alınması halinde kullanılır. Tekrar başlatılmayacaksa "4" nolu kod kullanılır)','ALAMAZ','ALAMAZ','ALAMAZ'],
    [21,'Statü değişikliği','ALAMAZ','ALAMAZ','ALAMAZ'],
    [22,'Diğer nedenler','ALAMAZ','ALAMAZ','ALAMAZ'],
    [23,'İşçi tarafından zorunlu nedenle fesih','ALIR','ALAMAZ','ALIR'],
    [24,'İşçi tarafından sağlık nedeniyle fesih','ALIR','ALAMAZ','ALIR'],
    [25,'İşçi tarafından işverenin ahlak ve iyiniyet kurallarına aykırı davranışı nedeni ile fesih','ALIR','ALAMAZ','ALIR'],
    [26,'Disiplin kurulu kararı ile fesih','ALAMAZ','ALAMAZ','ALAMAZ'],
    [27,'İşveren tarafından zorunlu nedenlerle ve tutukluluk nedeniyle fesih','ALIR','ALAMAZ','ALIR'],
    [28,'İşveren tarafından sağlık nedeni ile fesih','ALIR','ALAMAZ','ALIR'],
    [29,'Mülga — 1/4/2021 tarihli ve 2021/9 sayılı Genelge','ALAMAZ','ALAMAZ','ALAMAZ'],
    [30,'Vize süresinin bitimi (iş akdinin askıya alınması halinde kullanılır. Tekrar başlatılmayacaksa "4" nolu kod kullanılır)','ALAMAZ','ALAMAZ','ALAMAZ'],
    [31,'Borçlar K., Sendikalar K., Grev ve Lokavt K. kapsamında kendi istek ve kusuru dışında fesih','ALIR','ALIR','ALIR'],
    [32,'4046 sayılı Kanunun 21. maddesine göre özelleştirme nedeni ile feshi','ALIR','ALIR','ALIR'],
    [33,'Gazeteci tarafından sözleşmenin feshi','ALIR','ALAMAZ','ALIR'],
    [34,'İşyerinin devri, işin veya işyerinin niteliğinin değişmesi nedeniyle fesih','ALIR','ALIR','ALIR'],
    [35,'6495 SK nedeniyle devlet memurluğuna geçenler','ALAMAZ','ALAMAZ','ALAMAZ'],
    [36,'KHK ile işyerinin kapatılması','ALAMAZ','ALAMAZ','ALAMAZ'],
    [37,'KHK ile kamu görevinden çıkarma','ALAMAZ','ALAMAZ','ALAMAZ'],
    [38,'Doğum nedeniyle işten ayrılma','ALAMAZ','ALAMAZ','ALAMAZ'],
    [39,'696 KHK ile kamu işçiliğine geçiş','ALAMAZ','ALAMAZ','ALAMAZ'],
    [40,'696 KHK ile kamu işçiliğine geçilmemesi sebebiyle çıkış','ALIR','ALIR','ALAMAZ'],
    [41,'Re\'sen işten ayrılış bildirgesi düzenlenenler','ALAMAZ','ALAMAZ','ALAMAZ'],
    [42,'İşçinin işe alınırken gerekli vasıf/şartların bulunmadığı halde bulunduğunu ileri sürerek ya da gerçeğe aykırı bilgi/söz ile işvereni yanıltması','ALAMAZ','ALAMAZ','ALAMAZ'],
    [43,'İşçinin işveren/aile üyelerinin şeref-namusuna dokunacak söz/davranışta bulunması ya da asılsız ihbar/isnadı — 4857/25-II-B','ALAMAZ','ALAMAZ','ALAMAZ'],
    [44,'İşçinin işverenin başka bir işçisine cinsel tacizde bulunması — 4857/25-II-C','ALAMAZ','ALAMAZ','ALAMAZ'],
    [45,'İşçinin işverene/aile üyesine sataşması yahut işyerine sarhoş/uyuşturucu almış gelmesi ya da işyerinde bu maddeleri kullanması','ALAMAZ','ALAMAZ','ALAMAZ'],
    [46,'İşçinin işverenin güvenini kötüye kullanma, hırsızlık, meslek sırlarını ifşa gibi doğruluk ve bağlılığa uymayan davranışları','ALAMAZ','ALAMAZ','ALAMAZ'],
    [47,'İşçinin işyerinde yedi günden fazla hapisle cezalandırılan ve cezası ertelenmeyen bir suç işlemesi','ALAMAZ','ALAMAZ','ALAMAZ'],
    [48,'İşçinin izinsiz/haklı sebep olmaksızın art arda 2 iş günü, ya da bir ayda tatil sonrası 2 kez ya da bir ayda 3 iş günü işe gelmemesi','ALAMAZ','ALAMAZ','ALAMAZ'],
    [49,'İşçinin yapmakla ödevli olduğu görevleri hatırlatıldığı halde yapmamakta ısrar etmesi','ALAMAZ','ALAMAZ','ALAMAZ'],
    [50,'İşçinin kendi isteği/savsaması yüzünden iş güvenliğini tehlikeye düşürmesi ya da işyeri malına 30 günlük ücretiyle ödenemeyecek derecede zarar vermesi','ALAMAZ','ALAMAZ','ALAMAZ'],
    ];
    let h='<div class="ref-note">İşten ayrılış nedenine (SGK çıkış koduna) göre kıdem tazminatı, ihbar tazminatı ve işsizlik maaşı hakkı. Aşağıdaki tabloda arama yapabilirsiniz.</div>';
    h+='<input type="text" id="kidem-arama" placeholder="🔍 Kod veya neden ara..." style="width:100%;padding:9px 12px;font-size:13px;border:1px solid var(--border2);border-radius:var(--radius);font-family:inherit;margin-bottom:10px;" oninput="filtreleKidemTablosu(this.value)">';
    h+='<div style="max-height:55vh;overflow-y:auto;"><table class="ref-table" id="kidem-tablo"><thead><tr><th style="width:6%;">Kod</th><th>İşten Ayrılış Nedeni</th><th style="width:11%;">Kıdem</th><th style="width:11%;">İhbar</th><th style="width:11%;">İşsizlik</th></tr></thead><tbody>';
    V.forEach(x=>{
      h+=`<tr data-arama="${(x[0]+' '+x[1]).toLowerCase()}"><td>${x[0]}</td><td>${x[1]}</td><td class="${x[2]==='ALIR'?'ref-badge-alir':'ref-badge-alamaz'}">${x[2]}</td><td class="${x[3]==='ALIR'?'ref-badge-alir':'ref-badge-alamaz'}">${x[3]}</td><td class="${x[4]==='ALIR'?'ref-badge-alir':'ref-badge-alamaz'}">${x[4]}</td></tr>`;
    });
    h+='</tbody></table></div>';
    return h;
  },

  // ── TÜKETİCİ HAKEM HEYETLERİ ────────────────────────────────────
  'tuketici-hakem':function(){
    let h='<div class="ref-note">Kaynak: T.C. Ticaret Bakanlığı — Tüketicinin Korunması ve Piyasa Gözetimi Genel Müdürlüğü.</div>';

    h+='<div class="ref-section-title">Görevi Nedir? Kimlerden Oluşur?</div>';
    h+='<div class="ref-flow-box"><b>Görevi:</b> 6502 sayılı Tüketicinin Korunması Hakkında Kanun\'a göre; tüketici işlemleri ve tüketiciye yönelik uygulamalardan doğabilecek uyuşmazlıklara çözüm bulmak amacıyla kurulan heyetlerdir.</div>';
    h+='<table class="ref-table"><thead><tr><th style="width:26%;">Görev</th><th>Kim</th></tr></thead><tbody>';
    h+='<tr><td style="font-weight:600;">Başkan</td><td>İllerde Ticaret İl Müdürü; ilçelerde Kaymakam veya görevlendirdiği memur</td></tr>';
    h+='<tr><td style="font-weight:600;">Diğer Üyeler</td><td>Belediye temsilcisi · Baro temsilcisi · Tacir/Esnaf temsilcisi · Tüketici örgütü temsilcisi</td></tr>';
    h+='</tbody></table>';

    h+='<div class="ref-section-title">Başvuru Yöntemleri</div>';
    h+='<table class="ref-table"><thead><tr><th style="width:8%;">#</th><th>Yöntem</th></tr></thead><tbody>';
    h+='<tr><td><span class="ref-flow-num">1</span></td><td>Şahsen</td></tr>';
    h+='<tr><td><span class="ref-flow-num">2</span></td><td>Avukat aracılığıyla</td></tr>';
    h+='<tr><td><span class="ref-flow-num">3</span></td><td>Posta yoluyla</td></tr>';
    h+='<tr><td><span class="ref-flow-num">4</span></td><td>e-Devlet üzerinden TÜBİS (tuketicisikayeti.ticaret.gov.tr)</td></tr>';
    h+='</tbody></table>';
    h+='<div class="ref-note">⚠️ Sözlü başvuru yapılamaz.</div>';

    h+='<div class="ref-section-title">Başvuru Nasıl Yapılır?</div>';
    h+='<ul style="font-size:12.5px;line-height:1.7;margin:0 0 14px;padding-left:18px;">'
      +'<li>Uyuşmazlık konusunu içeren dilekçe hazırlanır.</li>'
      +'<li>Varsa delil oluşturan belgeler eklenir.</li>'
      +'<li>Başvuru, Tüketici Hakem Heyetine verilir.</li>'
      +'<li>Ticaret Bakanlığı internet sayfasındaki başvuru formu kullanılabilir.</li></ul>';

    h+='<div class="ref-section-title">Başvuruda Yer Alması Zorunlu Bilgiler</div>';
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 16px;">';
    h+='<ul style="font-size:12.5px;line-height:1.7;margin:0;padding-left:18px;">'
      +'<li>Ad, soyad / unvan</li>'
      +'<li>T.C. kimlik no / pasaport no / yabancı kimlik no</li>'
      +'<li>Tüketici değilse vergi kimlik no</li>'
      +'<li>Adres ve iletişim bilgileri</li>'
      +'<li>Varsa vekilin adı, soyadı, vergi kimlik no ve adresi</li></ul>';
    h+='<ul style="font-size:12.5px;line-height:1.7;margin:0;padding-left:18px;">'
      +'<li>Uyuşmazlık konusu</li>'
      +'<li>Talep</li>'
      +'<li>Türk Lirası cinsinden uyuşmazlık değeri</li>'
      +'<li>Şikayet edilen kişiye / firmaya ilişkin bilgiler</li></ul>';
    h+='</div>';
    h+='<div class="ref-note">Uyuşmazlık değeri döviz cinsindense, başvuru tarihindeki TCMB efektif döviz satış kuru esas alınarak Türk Lirası\'na çevrilir.</div>';

    h+='<div class="ref-section-title">Elektronik Başvuru</div>';
    h+='<ul style="font-size:12.5px;line-height:1.7;margin:0 0 14px;padding-left:18px;">'
      +'<li>Elektronik başvuruların TÜBİS ile yapılması zorunludur.</li>'
      +'<li>Başvuru formu eksiksiz doldurulmalıdır.</li>'
      +'<li>Varsa bilgi ve belgeler sisteme yüklenmelidir.</li>'
      +'<li>Bu şartlar sağlanırsa başvuru geçerli olur.</li></ul>';

    h+='<div class="ref-section-title">Hangi Heyete Başvuru Yapılabilir?</div>';
    h+='<div class="ref-flow-box">Başvurular, tüketicinin yerleşim yerinin bulunduğu veya tüketici işleminin yapıldığı yerdeki tüketici hakem heyetine yapılabilir.</div>';
    h+='<table class="ref-table"><thead><tr><th style="width:26%;">Heyet</th><th>Yetki Alanı</th></tr></thead><tbody>';
    h+='<tr><td style="font-weight:600;">İl Tüketici Hakem Heyetleri</td><td>İl sınırları içinde yetkilidir</td></tr>';
    h+='<tr><td style="font-weight:600;">İlçe Tüketici Hakem Heyetleri</td><td>İlçe sınırları içinde yetkilidir</td></tr>';
    h+='<tr><td style="font-weight:600;">Heyet kurulmayan ilçeler</td><td>Bakanlıkça o ilçe için belirlenen hakem heyeti yetkilidir</td></tr>';
    h+='</tbody></table>';

    h+='<div class="ref-section-title">Tüketici Hakem Heyeti Bulunmayan Yerlerde Başvuru</div>';
    h+='<ul style="font-size:12.5px;line-height:1.7;margin:0 0 8px;padding-left:18px;">'
      +'<li>İllerde <b>Ticaret İl Müdürlükleri</b>, ilçelerde <b>Kaymakamlıklar</b> bünyesinde faaliyet gösterilir.</li>'
      +'<li>Ancak her ilçede tüketici hakem heyeti bulunmamaktadır.</li>'
      +'<li>Bazı heyetlerin yetki alanı, heyet bulunmayan ilçeleri de kapsayacak şekilde genişletilerek yetkilendirilmiş olabilir.</li></ul>';
    h+='<div class="ref-flow-box">Kaymakamlık / irtibat personeli → Başvurunun alınması → <b>TÜBİS\'e kayıt</b></div>';
    h+='<div class="ref-note">Başvurular, ilgili kaymakamlıklardaki irtibat personeli aracılığıyla alınarak TÜBİS\'e kaydedilir.</div>';

    h+='<div class="ref-section-title">2026 Yılı Parasal Sınırları</div>';
    h+='<div class="ref-note">Başvuru sınırları, tüketici uyuşmazlıklarının değerleri açısından her yıl Hazine ve Maliye Bakanlığı tarafından ilan edilen yeniden değerleme oranına göre yeniden belirlenir.</div>';
    h+='<table class="ref-table"><thead><tr><th style="width:30%;">Uyuşmazlık Değeri</th><th>Sonuç</th></tr></thead><tbody>';
    h+='<tr><td class="ref-badge-alir" style="font-weight:700;">186.000 TL\'nin altında</td><td>İlçe veya İl Tüketici Hakem Heyetine başvuru yapılması zorunludur.</td></tr>';
    h+='<tr><td class="ref-badge-alamaz" style="font-weight:700;">186.000 TL ve üzeri</td><td>Tüketici Hakem Heyetine başvuru yapılamaz. Önce dava şartı arabuluculuk, ardından Tüketici Mahkemesi.</td></tr>';
    h+='</tbody></table>';
    h+='<div class="ref-flow-box">6502 sayılı Kanun m.73/A kapsamında: <b>1)</b> Dava şartı arabuluculuk → <b>2)</b> Tüketici mahkemesi → <b>3)</b> Tüketici mahkemesi bulunmayan yerlerde asliye hukuk mahkemesi</div>';
    h+='<div class="ref-note"><b>2026 yılı için 186.000 (yüz seksen altı bin) Türk Lirası</b>, Tüketici Hakem Heyetlerinin görev alanını belirleyen başvuru sınırıdır.</div>';
    return h;
  },
};
function filtreleKidemTablosu(q){
  q=(q||'').toLowerCase();
  document.querySelectorAll('#kidem-tablo tbody tr').forEach(tr=>{
    tr.style.display=tr.dataset.arama.includes(q)?'':'none';
  });
}

