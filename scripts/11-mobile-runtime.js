/* Sekreter mobil uygulama davranışları */
(function(){
  const cap=window.Capacitor;
  if(!cap?.isNativePlatform?.())return;
  document.documentElement.classList.add('native-mobile');

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
