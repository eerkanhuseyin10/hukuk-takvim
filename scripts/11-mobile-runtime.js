/* Sekreter mobil uygulama davranışları */
(function(){
  const cap=window.Capacitor;
  if(!cap?.isNativePlatform?.())return;
  document.documentElement.classList.add('native-mobile');

  const nav=document.getElementById('mobile-nav');
  const navToggle=document.getElementById('mobile-nav-toggle');
  window.mobileNavToggle=()=>{const aciliyor=nav?.classList.contains('collapsed');nav?.classList.toggle('collapsed',!aciliyor);document.documentElement.classList.toggle('mobile-nav-open',!!aciliyor);navToggle?.setAttribute('aria-expanded',String(!!aciliyor));};
  nav?.addEventListener('click',e=>{if(!e.target.closest('.mobile-nav-item'))return;setTimeout(()=>{nav.classList.add('collapsed');document.documentElement.classList.remove('mobile-nav-open');navToggle?.setAttribute('aria-expanded','false');},180);});

  const avatar=document.getElementById('topbar-av'),arama=document.querySelector('.cal-search-bar');
  if(avatar&&arama){const kopya=avatar.cloneNode(true);kopya.id='mobile-search-avatar';kopya.classList.add('mobile-search-avatar');arama.appendChild(kopya);new MutationObserver(()=>{kopya.textContent=avatar.textContent;}).observe(avatar,{childList:true,characterData:true,subtree:true});}

  const splash=document.getElementById('mobile-app-splash');
  if(splash){requestAnimationFrame(()=>splash.classList.add('show'));setTimeout(()=>{splash.classList.add('closing');setTimeout(()=>splash.remove(),420);},1150);}

  const app=cap.Plugins?.App;
  if(app?.addListener){
    app.addListener('backButton',()=>{
      const acik=[...document.querySelectorAll('.modal-overlay')].reverse().find(x=>getComputedStyle(x).display!=='none');
      if(acik){acik.style.display='none';return;}
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
