/* Sekreter mobil uygulama davranışları */
(function(){
  const cap=window.Capacitor;
  if(!cap?.isNativePlatform?.())return;
  document.documentElement.classList.add('native-mobile');

  const avatar=document.getElementById('topbar-av'),arama=document.querySelector('.cal-search-bar'),mobilArac=document.getElementById('mobile-calendar-toolbar');
  if(arama&&mobilArac){arama.classList.add('mobile-calendar-search');mobilArac.appendChild(arama);}
  const avatarSlot=document.getElementById('mobile-calendar-avatar-slot');
  if(avatar&&avatarSlot){const kopya=avatar.cloneNode(true);kopya.id='mobile-search-avatar';kopya.classList.add('mobile-search-avatar');avatarSlot.appendChild(kopya);new MutationObserver(()=>{kopya.textContent=avatar.textContent;}).observe(avatar,{childList:true,characterData:true,subtree:true});}
  window.mobileCalendarSearchToggle=()=>{const aciliyor=!arama?.classList.contains('open');arama?.classList.toggle('open',aciliyor);if(aciliyor)setTimeout(()=>arama.querySelector('input')?.focus(),80);};

  const splash=document.getElementById('mobile-app-splash');
  if(splash){requestAnimationFrame(()=>splash.classList.add('show'));setTimeout(()=>{splash.classList.add('closing');setTimeout(()=>splash.remove(),420);},1150);}

  const app=cap.Plugins?.App;
  if(app?.addListener){
    app.addListener('backButton',()=>{
      const acik=[...document.querySelectorAll('.modal-overlay')].reverse().find(x=>getComputedStyle(x).display!=='none');
      if(acik){const ayarlaraDon=acik.dataset?.returnToSettings==='true';acik.style.display='none';if(ayarlaraDon&&typeof openAyarlarMerkezi==='function')setTimeout(openAyarlarMerkezi,80);return;}
      const aktif=document.querySelector('.view.active')?.id;
      if(aktif&&aktif!=='view-takvim'){
        const takvim=document.querySelector('.mobile-nav-item[onclick*="takvim"]');
        if(typeof showView==='function')showView('takvim',takvim);
        return;
      }
      app.minimizeApp?.();
    });
  }

  const status=cap.Plugins?.StatusBar;
  status?.setOverlaysWebView?.({overlay:false});
  status?.setBackgroundColor?.({color:'#f6f7f9'});
})();
