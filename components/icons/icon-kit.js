/* ============================================================
   ICON KIT — MORE THAN SAID
   Reusable hand-drawn icon library for the LinkedIn visuals.
   Brand-agnostic engine + editor. Ships with an EMPTY icon set; populate per project.

   USAGE
     <link rel="stylesheet" href="icon.css">
     <script src="icon-kit.js"></script>
     <icon-mark name="rocket"></icon-mark>
     <icon-ill  name="research"></icon-ill>
     el.innerHTML = IconKit.mark('funnel');

   EDIT MODE (node editor)
     IconKit.capture(name)         -> [{ci,type,pts:[[x,y]..]}]  (anchor points)
     IconKit.setPoint(name,ci,pi,x,y)   move one anchor (persisted)
     IconKit.resetMark(name)            clear edits for one mark
     Edits live in localStorage('icon-overrides') and every live
     <icon-mark>/<icon-ill> re-renders on the 'icon-changed' event.

   Colour: line = var(--icon-ink) (defaults to --brand-secondary),
   accent = var(--brand-primary). Size with CSS width/height.
   ============================================================ */
(function (root) {
  function mul(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  function f(n){return Math.round(n*10)/10;}

  // ---- edit state (module scope, shared with Pen primitives) ----
  var STORE={}, OV=null, CIDX=0, CAP=null, CAPTURE=false, CUSTOM={};
  try{ STORE=JSON.parse(root.localStorage.getItem('icon-overrides'))||{}; }catch(e){ STORE={}; }
  try{ (JSON.parse(root.localStorage.getItem('icon-custom'))||[]).forEach(function(n){CUSTOM[n]=true;}); }catch(e){}
  function NOOP(){}
  function persist(){ try{ root.localStorage.setItem('icon-overrides', JSON.stringify(STORE)); }catch(e){} }
  function persistCustom(){ try{ root.localStorage.setItem('icon-custom', JSON.stringify(Object.keys(CUSTOM))); }catch(e){} }
  function ovGet(ci){ return OV ? OV[ci] : null; }
  function applyMoves(ci, pts){ var o=ovGet(ci); if(o){ for(var k in o){ if(k.charAt(0)!=='_') pts[+k]=[o[k][0],o[k][1]]; } } return pts; }
  function cap(rec){ if(CAPTURE) CAP.push(rec); }
  // build an SVG path from anchors ([x,y] corner, or [x,y,hx,hy] with a symmetric bezier handle)
  function anchorPath(A, closed){
    if(!A||!A.length) return '';
    function hx(a){return a.length>2?a[2]:0;} function hy(a){return a.length>3?a[3]:0;}
    var d='M'+f(A[0][0])+' '+f(A[0][1]), n=A.length, segs=closed?n:n-1;
    for(var i=0;i<segs;i++){ var a=A[i], b=A[(i+1)%n];
      if(hx(a)||hy(a)||hx(b)||hy(b)){ d+=' C '+f(a[0]+hx(a))+' '+f(a[1]+hy(a))+' '+f(b[0]-hx(b))+' '+f(b[1]-hy(b))+' '+f(b[0])+' '+f(b[1]); }
      else d+=' L '+f(b[0])+' '+f(b[1]); }
    if(closed) d+=' Z'; return d;
  }
  function profileOutline(A, baseW, profile, closed){
    if(!A||A.length<2) return '';
    function hx(a){return a.length>2?a[2]:0;} function hy(a){return a.length>3?a[3]:0;}
    var segEnd = closed ? A.length : A.length-1, pts=[];
    for(var i=0;i<segEnd;i++){ var a=A[i], b=A[(i+1)%A.length];
      var c1x=a[0]+hx(a),c1y=a[1]+hy(a),c2x=b[0]-hx(b),c2y=b[1]-hy(b),sub=14;
      for(var s2=0;s2<sub;s2++){ var t=s2/sub,mt=1-t;
        pts.push([mt*mt*mt*a[0]+3*mt*mt*t*c1x+3*mt*t*t*c2x+t*t*t*b[0], mt*mt*mt*a[1]+3*mt*mt*t*c1y+3*mt*t*t*c2y+t*t*t*b[1]]); } }
    if(!closed) pts.push([A[A.length-1][0],A[A.length-1][1]]);
    var n=pts.length, T=[0]; for(var i=1;i<n;i++) T[i]=T[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]); var L=T[n-1]||1; for(var i=0;i<n;i++) T[i]/=L;
    function wf(t){ var v; if(profile==='bulge') v=Math.sin(Math.PI*t); else if(profile==='taper') v=1-t; else if(profile==='reverse') v=t; else if(profile==='waist') v=Math.abs(2*t-1); else v=1; return baseW*(0.14+0.95*v); }
    function norm(i){ var a=pts[(i-1+n)%n],b=pts[(i+1)%n]; if(!closed){ a=pts[Math.max(0,i-1)]; b=pts[Math.min(n-1,i+1)]; } var dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1; return [-dy/len,dx/len]; }
    var left=[],right=[]; for(var i=0;i<n;i++){ var hw=wf(T[i])/2, nb=norm(i); left.push([pts[i][0]+nb[0]*hw,pts[i][1]+nb[1]*hw]); right.push([pts[i][0]-nb[0]*hw,pts[i][1]-nb[1]*hw]); }
    if(closed){
      var d1='M'+f(left[0][0])+' '+f(left[0][1]); for(var i=1;i<n;i++) d1+=' L '+f(left[i][0])+' '+f(left[i][1]); d1+=' Z';
      var d2='M'+f(right[0][0])+' '+f(right[0][1]); for(var i=1;i<n;i++) d2+=' L '+f(right[i][0])+' '+f(right[i][1]); d2+=' Z';
      return d1+' '+d2;
    }
    var d='M'+f(left[0][0])+' '+f(left[0][1]); for(var i=1;i<n;i++) d+=' L '+f(left[i][0])+' '+f(left[i][1]);
    for(var i=n-1;i>=0;i--) d+=' L '+f(right[i][0])+' '+f(right[i][1]); d+=' Z'; return d;
  }

  function Pen(seed){
    var rng=mul(seed), els=[];
    function j(m){return (rng()*2-1)*m;}
    function smooth(pts,close){var d='M'+f(pts[0][0])+' '+f(pts[0][1]);
      for(var i=1;i<pts.length;i++){var mx=(pts[i-1][0]+pts[i][0])/2,my=(pts[i-1][1]+pts[i][1])/2;d+=' Q '+f(pts[i-1][0])+' '+f(pts[i-1][1])+' '+f(mx)+' '+f(my);}
      if(close)d+=' Z';else{var L=pts[pts.length-1];d+=' L '+f(L[0])+' '+f(L[1]);}return d;}
    function edgy(P,close){var d='M'+f(P[0][0])+' '+f(P[0][1]),n=P.length;
      function seg(a,b){var mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,nx=-(b[1]-a[1]),ny=(b[0]-a[0]),L=Math.hypot(nx,ny)||1;var bow=j(Math.min(1.5,Math.hypot(b[0]-a[0],b[1]-a[1])*0.02));d+=' Q '+f(mx+nx/L*bow)+' '+f(my+ny/L*bow)+' '+f(b[0])+' '+f(b[1]);}
      for(var i=1;i<n;i++)seg(P[i-1],P[i]);if(close){seg(P[n-1],P[0]);d+=' Z';}return d;}
    function line(x1,y1,x2,y2,o){o=o||{};var ci=CIDX++;var P=applyMoves(ci,[[x1,y1],[x2,y2]]);cap({ci:ci,type:'line',pts:[P[0].slice(),P[1].slice()],closed:false,sw:o.sw,coral:!!o.coral});var ov=ovGet(ci);if(ov&&ov._a){els.push({d:anchorPath(ov._a,!!ov._c),sw:o.sw,coral:o.coral,dash:o.dash,ci:ci});return;}x1=P[0][0];y1=P[0][1];x2=P[1][0];y2=P[1][1];
      var over=o.over||0,ang=Math.atan2(y2-y1,x2-x1),dx=Math.cos(ang),dy=Math.sin(ang);
      x1-=dx*over;y1-=dy*over;x2+=dx*over;y2+=dy*over;var nx=-dy,ny=dx,len=Math.hypot(x2-x1,y2-y1),a=Math.min(1.6,len*0.012+0.3);
      els.push({d:`M${f(x1)} ${f(y1)} C ${f(x1+(x2-x1)*0.34+nx*j(a))} ${f(y1+(y2-y1)*0.34+ny*j(a))} ${f(x1+(x2-x1)*0.66+nx*j(a))} ${f(y1+(y2-y1)*0.66+ny*j(a))} ${f(x2)} ${f(y2)}`,sw:o.sw,coral:o.coral,dash:o.dash,ci:ci});}
    function circle(cx,cy,r,o){o=o||{};var ci=CIDX++;var P=applyMoves(ci,[[cx,cy],[cx+r,cy]]);cap({ci:ci,type:'circle',pts:[P[0].slice(),P[1].slice()],closed:false,sw:o.sw,coral:!!o.coral});cx=P[0][0];cy=P[0][1];r=Math.hypot(P[1][0]-cx,P[1][1]-cy)||0.001;
      var tilt=j(0.04),sq=0.98+j(0.03),segs=28,pts=[];
      for(var i=0;i<segs;i++){var t=6.283*i/segs,rr=r*(1+j(0.012)),x=Math.cos(t)*rr,y=Math.sin(t)*rr*sq;pts.push([cx+x*Math.cos(tilt)-y*Math.sin(tilt),cy+x*Math.sin(tilt)+y*Math.cos(tilt)]);}
      els.push({d:smooth(pts,true),sw:o.sw,coral:o.coral,fill:o.fill,inkfill:o.inkfill,ci:ci});}
    function poly(pts,close,o){o=o||{};var ci=CIDX++;var A=applyMoves(ci,pts.map(function(p){return [p[0],p[1]];}));cap({ci:ci,type:'poly',pts:A.map(function(p){return p.slice();}),closed:!!close,sw:o.sw,coral:!!o.coral,fill:!!(o.fill||o.inkfill),sharp:!!o.sharp});var ov=ovGet(ci);if(ov&&ov._a){els.push({d:anchorPath(ov._a,ov._c!=null?ov._c:!!close),sw:o.sw,coral:o.coral,fill:o.fill,inkfill:o.inkfill,ci:ci});return;}var jj=o.j==null?0.8:o.j,P=A.map(p=>[p[0]+j(jj),p[1]+j(jj)]);
      els.push({d:(o.sharp?edgy(P,close):smooth(P,close)),sw:o.sw,coral:o.coral,fill:o.fill,inkfill:o.inkfill,ci:ci});}
    function dot(cx,cy,r,o){o=o||{};var ci=CIDX++;var P=applyMoves(ci,[[cx,cy],[cx+r,cy]]);cap({ci:ci,type:'dot',pts:[P[0].slice(),P[1].slice()],closed:false,coral:!!o.coral});cx=P[0][0];cy=P[0][1];r=Math.hypot(P[1][0]-cx,P[1][1]-cy);els.push({dot:[cx,cy,r],coral:o.coral});}
    function arc(cx,cy,r,a0,a1,o){o=o||{};var ci=CIDX++;var P=applyMoves(ci,[[cx,cy],[cx+r*Math.cos(a0),cy+r*Math.sin(a0)]]);cap({ci:ci,type:'arc',pts:[P[0].slice(),P[1].slice()],closed:false,sw:o.sw,coral:!!o.coral});cx=P[0][0];cy=P[0][1];r=Math.hypot(P[1][0]-cx,P[1][1]-cy);
      var segs=Math.max(5,Math.round(Math.abs(a1-a0)/0.32)),pts=[];
      for(var i=0;i<=segs;i++){var t=a0+(a1-a0)*i/segs;pts.push([cx+Math.cos(t)*r*(1+j(0.015)),cy+Math.sin(t)*r*(1+j(0.015))]);}
      els.push({d:smooth(pts,false),sw:o.sw,coral:o.coral,ci:ci});}
    function star(cx,cy,r,o){o=o||{};var pts=[],n=5,rot=-Math.PI/2+j(0.04);
      for(var i=0;i<n*2;i++){var rr=(i%2?r*0.42:r),a=rot+Math.PI*i/n;pts.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);}
      poly(pts,true,{coral:o.coral,fill:o.fill,inkfill:o.inkfill,sw:o.sw||2.5,j:0.4,sharp:true});}
    function heart(cx,cy,s){var ci=CIDX++;var P=applyMoves(ci,[[cx,cy],[cx,cy-s]]);cap({ci:ci,type:'heart',pts:[P[0].slice(),P[1].slice()],closed:false,coral:true});cx=P[0][0];cy=P[0][1];s=Math.hypot(P[1][0]-cx,P[1][1]-cy);
      els.push({d:`M ${f(cx)} ${f(cy+s*0.8)} C ${f(cx-s)} ${f(cy)} ${f(cx-s*0.5)} ${f(cy-s*0.72)} ${f(cx)} ${f(cy-s*0.18)} C ${f(cx+s*0.5)} ${f(cy-s*0.72)} ${f(cx+s)} ${f(cy)} ${f(cx)} ${f(cy+s*0.8)} Z`,coral:true,fill:true,sw:1.5});}
    return {line,circle,poly,dot,arc,star,heart,els};
  }

  var OUT=4.4, DET=3.4, COR=4;

  // ---- 100 sprinkle marks ----
  var ELEM = {};   // empty in the core build — add marks or create/import in the editor

  // ---- story illustrations ----
  var ILL = {};

  function svgFrom(els){
    return '<svg viewBox="0 0 160 160">'+els.map(function(e){
      var col=e.coral?'var(--brand-primary)':'var(--icon-ink)';
      if(e.dot) return '<circle cx="'+f(e.dot[0])+'" cy="'+f(e.dot[1])+'" r="'+e.dot[2]+'" fill="'+col+'"/>';
      if(e.xstroke!==undefined){ var sc=e.xstroke==='none'?'none':(e.xstroke==='coral'?'var(--brand-primary)':'var(--icon-ink)'); var fc=(!e.xfill||e.xfill==='none')?'none':(e.xfill==='coral'?'var(--brand-primary)':'var(--icon-ink)'); return '<path d="'+e.d+'" fill="'+fc+'"'+(e.eo?' fill-rule="evenodd"':'')+' stroke="'+sc+'" stroke-width="'+(e.sw||OUT)+'" stroke-linecap="round" stroke-linejoin="round"/>'; }
      if(e.fill||e.inkfill){var fc=e.inkfill?'var(--icon-ink)':col;return '<path d="'+e.d+'" fill="'+fc+'" stroke="'+fc+'" stroke-width="'+(e.sw||2.5)+'" stroke-linejoin="round" stroke-linecap="round"/>';}
      var dash=e.dash?' stroke-dasharray="2 13"':'';
      return '<path d="'+e.d+'" fill="none" stroke="'+col+'" stroke-width="'+(e.sw||OUT)+'" stroke-linecap="round" stroke-linejoin="round"'+dash+'/>';
    }).join('')+'</svg>';
  }
  function run(name, builder, seed){ OV=STORE[name]||null; CIDX=0; CAPTURE=false; var p=Pen(seed); builder(p);
    if(OV){ p.els.forEach(function(el){ if(el.ci==null) return; var v=OV[el.ci]; if(!v) return; if(v._sw!=null) el.sw=v._sw;
      if(v._stroke!=null||v._fill!=null){ var bs=el.coral?'coral':'ink', bf=(el.fill||el.inkfill)?(el.inkfill?'ink':(el.coral?'coral':'ink')):'none'; el.xstroke=(v._stroke!=null?v._stroke:(el.fill||el.inkfill?'none':bs)); el.xfill=(v._fill!=null?v._fill:bf); el.fill=false; el.inkfill=false; } }); }
    var ex=OV&&OV._extra; if(ex){ for(var i=0;i<ex.length;i++){ var s=ex[i];
      if(s.profile && s.profile!=='uniform'){ p.els.push({d:profileOutline(s.pts,s.sw||OUT,s.profile,!!s.closed),xfill:s.stroke||'ink',xstroke:'none',sw:0,eo:true}); }
      else p.els.push({d:anchorPath(s.pts,!!s.closed),sw:s.sw||OUT,xstroke:s.stroke||(s.coral?'coral':'ink'),xfill:s.fill||'none'}); } }
    OV=null; return p.els; }
  function hash(s){s=s||'';var h=29;for(var i=0;i<s.length;i++)h=(h*131+s.charCodeAt(i))>>>0;return h;}
  function seedFor(kind,name){ return hash((kind==='ill'?'i':'m')+name); }

  // ---- SVG -> editable anchor strokes (runtime; powers IconKit.installSvg) ----
  function _parsePath(d){
    var toks=d.match(/[MmLlHhVvCcSsQqTtAaZz]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi)||[]; var i=0;
    function n(){return parseFloat(toks[i++]);}
    var subs=[],cur=null,x=0,y=0,sx=0,sy=0,px=0,py=0,prev='';
    function start(){cur={pts:[],segs:[],closed:false};subs.push(cur);}
    while(i<toks.length){ var cmd=toks[i]; if(/[a-z]/i.test(cmd)) i++; else cmd=prev; var rel=cmd===cmd.toLowerCase(), C=cmd.toUpperCase();
      if(C==='M'){x=(rel?x:0)+n();y=(rel?y:0)+n();sx=x;sy=y;start();cur.pts.push([x,y]);prev=rel?'l':'L';}
      else if(C==='L'){x=(rel?x:0)+n();y=(rel?y:0)+n();cur.segs.push({t:'L'});cur.pts.push([x,y]);}
      else if(C==='H'){x=(rel?x:0)+n();cur.segs.push({t:'L'});cur.pts.push([x,y]);}
      else if(C==='V'){y=(rel?y:0)+n();cur.segs.push({t:'L'});cur.pts.push([x,y]);}
      else if(C==='C'){var a1=(rel?x:0)+n(),a2=(rel?y:0)+n(),b1=(rel?x:0)+n(),b2=(rel?y:0)+n();x=(rel?x:0)+n();y=(rel?y:0)+n();cur.segs.push({t:'C',c1:[a1,a2],c2:[b1,b2]});cur.pts.push([x,y]);px=b1;py=b2;}
      else if(C==='S'){var p1=2*x-px,p2=2*y-py,q1=(rel?x:0)+n(),q2=(rel?y:0)+n(),nx=(rel?x:0)+n(),ny=(rel?y:0)+n();cur.segs.push({t:'C',c1:[p1,p2],c2:[q1,q2]});cur.pts.push([nx,ny]);px=q1;py=q2;x=nx;y=ny;}
      else if(C==='Q'){var u1=(rel?x:0)+n(),u2=(rel?y:0)+n(),nx2=(rel?x:0)+n(),ny2=(rel?y:0)+n();cur.segs.push({t:'C',c1:[x+2/3*(u1-x),y+2/3*(u2-y)],c2:[nx2+2/3*(u1-nx2),ny2+2/3*(u2-ny2)]});cur.pts.push([nx2,ny2]);px=u1;py=u2;x=nx2;y=ny2;}
      else if(C==='T'){var w1=2*x-px,w2=2*y-py,nx3=(rel?x:0)+n(),ny3=(rel?y:0)+n();cur.segs.push({t:'C',c1:[x+2/3*(w1-x),y+2/3*(w2-y)],c2:[nx3+2/3*(w1-nx3),ny3+2/3*(w2-ny3)]});cur.pts.push([nx3,ny3]);px=w1;py=w2;x=nx3;y=ny3;}
      else if(C==='A'){i+=5;x=(rel?x:0)+parseFloat(toks[i++]);y=(rel?y:0)+parseFloat(toks[i++]);cur.segs.push({t:'L'});cur.pts.push([x,y]);}
      else if(C==='Z'){if(cur){cur.closed=true;cur.segs.push({t:'L'});x=sx;y=sy;}}
      if(C!=='C'&&C!=='S'&&C!=='Q'&&C!=='T'){px=x;py=y;} prev=cmd; }
    return subs.filter(function(s){return s.pts.length>1;});
  }
  function _toAnchors(sub){ var P=sub.pts,nn=P.length;
    var pts=(sub.closed&&nn>1&&P[0][0]===P[nn-1][0]&&P[0][1]===P[nn-1][1])?P.slice(0,-1):P; var m=pts.length,out=[];
    function so(k){return sub.segs[k]||{t:'L'};}
    for(var k=0;k<m;k++){var Pi=pts[k],o=so(k),ii=so((k-1+sub.segs.length)%sub.segs.length),hx=0,hy=0,have=0;
      if(o.t==='C'){hx+=o.c1[0]-Pi[0];hy+=o.c1[1]-Pi[1];have++;}
      if(ii&&ii.t==='C'&&ii.c2){hx+=Pi[0]-ii.c2[0];hy+=Pi[1]-ii.c2[1];have++;}
      if(have===2){hx/=2;hy/=2;} out.push(have?[Pi[0],Pi[1],hx,hy]:[Pi[0],Pi[1]]); }
    return {pts:out,closed:sub.closed};
  }
  function _attr(tag,name){var mm=tag.match(new RegExp(name+'\\s*=\\s*"([^"]*)"'));return mm?mm[1]:'';}
  function svgToStrokes(svg,opts){ opts=opts||{}; var accent=(opts.accent||'').toLowerCase().replace(/^#?/,'#');
    function role(fl,st){var c=((fl&&fl!=='none')?fl:st||'').trim().toLowerCase().replace(/^#?/,'#');return (accent&&c===accent)?'coral':'ink';}
    var vb=(svg.match(/viewBox\s*=\s*"([^"]+)"/)||[])[1]; var vw=vb?parseFloat(vb.split(/[\s,]+/)[2]):24; var s=160/(vw||24);
    var strokes=[]; var paths=svg.match(/<path\b[^>]*\bd\s*=\s*"([^"]+)"[^>]*>/gi)||[];
    for(var p=0;p<paths.length;p++){var tag=paths[p],dm=tag.match(/\bd\s*=\s*"([^"]+)"/);if(!dm)continue;
      var fl=_attr(tag,'fill'),st=_attr(tag,'stroke'),rl=role(fl,st),filled=fl&&fl!=='none',sw=(parseFloat(_attr(tag,'stroke-width')||'0')*s)||4.4;
      var subs=_parsePath(dm[1]); for(var u=0;u<subs.length;u++){var a=_toAnchors(subs[u]);
        strokes.push({pts:a.pts,closed:filled?true:a.closed,stroke:filled?'none':rl,fill:filled?rl:'none',sw:filled?0:sw});} }
    var cs=svg.match(/<circle\b[^>]*>/gi)||[];
    for(var ci=0;ci<cs.length;ci++){var ct=cs[ci],cx=parseFloat(_attr(ct,'cx')),cy=parseFloat(_attr(ct,'cy')),r=parseFloat(_attr(ct,'r'));if(!r)continue;
      var cf=_attr(ct,'fill'),cst=_attr(ct,'stroke'),crl=role(cf,cst),cfl=cf&&cf!=='none',kk=0.5523*r;
      strokes.push({pts:[[cx+r,cy,0,kk],[cx,cy+r,-kk,0],[cx-r,cy,0,-kk],[cx,cy-r,kk,0]],closed:true,stroke:cfl?'none':crl,fill:cfl?crl:'none',sw:cfl?0:((parseFloat(_attr(ct,'stroke-width')||'0')*s)||4.4)}); }
    for(var z=0;z<strokes.length;z++){ strokes[z].pts=strokes[z].pts.map(function(an){return an.map(function(v){return Math.round(v*s*100)/100;});}); }
    return strokes;
  }

  var IconKit = {
    mark:function(name,o){o=o||{};var b=ELEM[name]||(CUSTOM[name]?NOOP:null);return b?svgFrom(run(name,b, o.seed!=null?o.seed:seedFor('mark',name))):'';},
    ill:function(name,o){o=o||{};var b=ILL[name];return b?svgFrom(run(name,b, o.seed!=null?o.seed:seedFor('ill',name))):'';},
    markNames:Object.keys(ELEM),
    illNames:Object.keys(ILL),
    customNames:function(){ return Object.keys(CUSTOM); },
    newCustom:function(){ var n='custom-'+Date.now().toString(36); CUSTOM[n]=true; persistCustom(); return n; },
    removeCustom:function(name){ delete CUSTOM[name]; delete STORE[name]; persistCustom(); persist(); emit(); },
    // ---- editor API ----
    capture:function(name){ var kind=ILL[name]?'ill':'mark', b=ELEM[name]||ILL[name]||(CUSTOM[name]?NOOP:null); if(!b) return [];
      OV=STORE[name]||null; CIDX=0; CAPTURE=true; CAP=[]; var p=Pen(seedFor(kind,name)); b(p); CAPTURE=false;
      var out=CAP.map(function(rec){ var ov=OV&&OV[rec.ci]; if(ov&&ov._a){ rec.anchors=ov._a.map(function(a){return a.slice();}); rec.closed=ov._c!=null?ov._c:rec.closed; }
        if(rec.type!=='extra'){ var bS=rec.coral?'coral':'ink', bF=rec.fill?(rec.coral?'coral':'ink'):'none'; rec.stroke=(ov&&ov._stroke!=null)?ov._stroke:bS; rec.fill=(ov&&ov._fill!=null)?ov._fill:bF; rec.sw=(ov&&ov._sw!=null)?ov._sw:rec.sw; }
        return rec; });
      var ex=OV&&OV._extra; if(ex){ ex.forEach(function(s,i){ out.push({ci:'e'+i,type:'extra',extra:true,anchors:s.pts.map(function(a){return a.slice();}),pts:s.pts.map(function(a){return [a[0],a[1]];}),closed:!!s.closed,sw:s.sw,stroke:s.stroke||(s.coral?'coral':'ink'),fill:s.fill||'none',profile:s.profile||'uniform'}); }); }
      CAP=null; OV=null; return out; },
    setPoint:function(name,ci,pi,x,y){ STORE[name]=STORE[name]||{}; STORE[name][ci]=STORE[name][ci]||{}; STORE[name][ci][pi]=[Math.round(x*10)/10,Math.round(y*10)/10]; persist(); emit(); },
    setAnchors:function(name,ci,anchors,closed){ var e=STORE[name]=STORE[name]||{};
      if(String(ci).charAt(0)==='e'){ var idx=+String(ci).slice(1); if(e._extra&&e._extra[idx]){ e._extra[idx].pts=anchors; e._extra[idx].closed=!!closed; } }
      else { e[ci]=e[ci]||{}; e[ci]._a=anchors; e[ci]._c=!!closed; } persist(); emit(); },
    addExtra:function(name,stroke){ var e=STORE[name]=STORE[name]||{}; e._extra=e._extra||[]; e._extra.push(stroke); persist(); emit(); return e._extra.length-1; },
    removeExtra:function(name,idx){ var e=STORE[name]; if(e&&e._extra){ e._extra.splice(idx,1); persist(); emit(); } },
    setExtraStyle:function(name,idx,style){ var e=STORE[name]; if(e&&e._extra&&e._extra[idx]){ for(var k in style){ e._extra[idx][k]=style[k]; } persist(); emit(); } },
    setStrokeStyle:function(name,ci,style){ var e=STORE[name]=STORE[name]||{}; e[ci]=e[ci]||{}; if(style.sw!=null) e[ci]._sw=style.sw; if(style.stroke!=null) e[ci]._stroke=style.stroke; if(style.fill!=null) e[ci]._fill=style.fill; persist(); emit(); },
    getEdit:function(name){ return STORE[name]?JSON.parse(JSON.stringify(STORE[name])):null; },
    setEdit:function(name,obj){ if(obj==null) delete STORE[name]; else STORE[name]=obj; persist(); emit(); },
    isEdited:function(name){ return !!STORE[name]; },
    resetMark:function(name){ delete STORE[name]; persist(); emit(); },
    resetAll:function(){ STORE={}; persist(); emit(); },
    // Install an imported icon as an editable custom mark. `strokes` are _extra
    // anchor strokes: { pts:[[x,y] | [x,y,hx,hy], …], closed, stroke:'ink'|'coral',
    // fill:'none'|'ink'|'coral', sw }. It appears in the library + Visual Designer
    // (via customNames), renders through anchorPath (recolourable to the brand),
    // and opens fully editable in the icon editor — no per-install converter.
    installIcon:function(name, strokes){ if(!name||!strokes||!strokes.length) return;
      CUSTOM[name]=true; STORE[name]={ _extra: strokes }; persistCustom(); persist(); emit(); },
    // Install an icon straight from an SVG STRING — the converter is built in,
    // so no build script is needed. `opts.accent` (#hex) maps that colour to the
    // brand (coral); everything else becomes ink. Use this from a generated
    // components/icons/icon-library.js: IconKit.installSvg('star', '<svg…>', {accent:'#F2685C'}).
    installSvg:function(name, svg, opts){ if(!name||!svg) return 0; var s=svgToStrokes(svg, opts||{}); if(s.length) this.installIcon(name, s); return s.length; }
  };
  root.IconKit = IconKit;

  function emit(){ try{ document.dispatchEvent(new CustomEvent('icon-changed')); }catch(e){} }

  // ---- custom elements ----
  function define(tag, kind){
    if(!root.customElements || customElements.get(tag)) return;
    customElements.define(tag, class extends HTMLElement{
      static get observedAttributes(){return['name','seed'];}
      connectedCallback(){ this._r(); if(!this._h){ this._h=()=>this._r(); document.addEventListener('icon-changed',this._h);} }
      disconnectedCallback(){ if(this._h){ document.removeEventListener('icon-changed',this._h); this._h=null; } }
      attributeChangedCallback(){if(this.isConnected)this._r();}
      _r(){var n=this.getAttribute('name'); if(!n)return; var s=this.getAttribute('seed');
        this.innerHTML = IconKit[kind](n, s!=null?{seed:+s}:undefined);}
    });
  }
  define('icon-mark','mark');
  define('icon-ill','ill');
})(window);
