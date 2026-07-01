// Loads this design system into the template + auto-loads the configured brand
// font(s) from the brand layer, so a template renders in the brand font even
// when only --brand-font is set (no manual @import needed). base = repo root.
(() => {
  const base = '../..';
  function loadBrandFonts(){
    try{
      const cs = getComputedStyle(document.documentElement);
      ['--brand-font','--brand-font-display'].forEach(function(v){
        var fam=(cs.getPropertyValue(v)||'').split(',')[0].replace(/['"]/g,'').trim();
        if(!fam||/^(system-ui|ui-sans-serif|sans-serif|serif|monospace|inherit|initial|-apple-system|BlinkMacSystemFont)$/i.test(fam)) return;
        var id='bf-'+fam.replace(/[^a-z0-9]+/gi,'-');
        if(document.getElementById(id)) return;
        var l=document.createElement('link'); l.id=id; l.rel='stylesheet';
        l.href='https://fonts.googleapis.com/css2?family='+encodeURIComponent(fam).replace(/%20/g,'+')+'&display=swap';
        document.head.appendChild(l);
      });
    }catch(e){}
  }
  var link=document.createElement('link'); link.rel='stylesheet'; link.href=base+'/styles.css';
  link.onload=loadBrandFonts; document.head.appendChild(link);
  setTimeout(loadBrandFonts, 500);
  var s=document.createElement('script'); s.src=base+'/_ds_bundle.js'; s.onerror=function(){}; document.head.appendChild(s);
})();
