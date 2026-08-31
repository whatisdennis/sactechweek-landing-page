(() => {
  const nav = document.querySelector('.tandem-nav');
  const navToggle = document.querySelector('.tandem-nav-toggle');
  const navPanel = document.querySelector('#tandem-menu');
  const mobileNav = matchMedia('(max-width: 1023px)');

  if (nav && navToggle && navPanel) {
    const closeMenu = () => {
      nav.classList.remove('tandem-nav--open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open navigation menu');
    };
    const openMenu = () => {
      nav.classList.add('tandem-nav--open');
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'Close navigation menu');
    };
    navToggle.addEventListener('click', () => navToggle.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu());
    nav.addEventListener('click', (event) => { if (event.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') { closeMenu(); navToggle.focus(); } });
    document.addEventListener('pointerdown', (event) => { if (navToggle.getAttribute('aria-expanded') === 'true' && !nav.contains(event.target)) closeMenu(); });
    document.addEventListener('focusin', (event) => { if (navToggle.getAttribute('aria-expanded') === 'true' && !nav.contains(event.target)) closeMenu(); });
    mobileNav.addEventListener('change', () => { if (!mobileNav.matches) closeMenu(); });
  }

  const form = document.querySelector('#newsletter');
  if (form) form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = form.elements.email;
    const status = form.querySelector('.tandem-form-status');
    const button = form.querySelector('button');
    if (!email.validity.valid) { email.focus(); status.textContent = 'Enter a valid email address.'; return; }
    button.disabled = true; status.textContent = 'Submitting…';
    try {
      const response = await fetch('/newsletter-signup', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({email:email.value, website:form.elements.website.value}) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Please try again shortly.');
      form.reset(); status.textContent = result.message || "You're in. Watch your inbox.";
    } catch (error) { status.textContent = error.message || 'Please try again shortly.'; }
    finally { button.disabled = false; }
  });

  const canvas = document.querySelector('#tandem-point-cloud');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const sources = ['hero-bloom.jpg','hero-fish.jpg','hero-planet-obj.jpg','hero-face.jpg','hero-tree.jpg','hero-computer.jpg','hero-hand.jpg','hero-apple.jpg','hero-faucet.jpg'].map(n => `assets/tandem/${n}`);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COUNT = Math.min(innerWidth < 700 ? 3800 : 7000, reduce ? 3000 : 7000), HOLD=4200, MORPH=2100;
  let w=0,h=0,raf=0,visible=true,ready=false,from=0,to=1,morphing=false,phase=performance.now();
  const frames=[]; const px=new Float32Array(COUNT),py=new Float32Array(COUNT),pz=new Float32Array(COUNT),seed=new Float32Array(COUNT);
  for(let i=0;i<COUNT;i++)seed[i]=Math.random()*Math.PI*2;
  function sample(img){
    const S=180, off=document.createElement('canvas'); off.width=off.height=S; const c=off.getContext('2d');
    const scale=Math.min(S/img.naturalWidth,S/img.naturalHeight),iw=img.naturalWidth*scale,ih=img.naturalHeight*scale;
    c.drawImage(img,(S-iw)/2,(S-ih)/2,iw,ih); const d=c.getImageData(0,0,S,S).data,lum=new Float32Array(S*S),mask=new Uint8Array(S*S),dist=new Float32Array(S*S);
    for(let p=0,i=0;p<S*S;p++,i+=4){const l=(d[i]*.299+d[i+1]*.587+d[i+2]*.114)/255;lum[p]=l;mask[p]=l>.1?1:0;dist[p]=mask[p]?1e6:0;}
    const at=(x,y)=>x<0||y<0||x>=S||y>=S?0:dist[y*S+x];
    for(let y=0;y<S;y++)for(let x=0;x<S;x++){let p=y*S+x;if(mask[p])dist[p]=Math.min(dist[p],at(x-1,y)+1,at(x,y-1)+1,at(x-1,y-1)+1.414,at(x+1,y-1)+1.414)}
    for(let y=S-1;y>=0;y--)for(let x=S-1;x>=0;x--){let p=y*S+x;if(mask[p])dist[p]=Math.min(dist[p],at(x+1,y)+1,at(x,y+1)+1,at(x+1,y+1)+1.414,at(x-1,y+1)+1.414)}
    let max=1;for(let p=0;p<S*S;p++)if(dist[p]>max)max=dist[p]; const thick=new Float32Array(S*S);for(let p=0;p<S*S;p++)thick[p]=mask[p]?.72*Math.sqrt(Math.min(1,dist[p]/max)):0;
    const X=[],Y=[],Z=[],NX=[],NY=[],NZ=[],C=[]; const th=(x,y)=>x<0||y<0||x>=S||y>=S?0:thick[y*S+x];
    for(let y=0;y<S;y++)for(let x=0;x<S;x++){const p=y*S+x;if(!mask[p])continue;const l=lum[p],dn=Math.min(1,dist[p]/max),rim=dn<.06;if(!rim&&Math.random()>.34+l*.4)continue;const i=p*4,gx=(th(x+1,y)-th(x-1,y))*S*.5,gy=(th(x,y+1)-th(x,y-1))*S*.5,n=Math.hypot(gx,gy,1)||1,side=rim?0:(Math.random()<.5?1:-1),depth=thick[p]*(.82+l*.3);X.push(x/S*2-1);Y.push(y/S*2-1);Z.push(side*depth+(Math.random()-.5)*.02);NX.push(-gx*(side||1)/n);NY.push(-gy*(side||1)/n);NZ.push(side===0?0:side/n);C.push(`rgb(${Math.min(255,d[i]+16)},${Math.min(255,d[i+1]+10)},${d[i+2]})`)}
    const f={x:new Float32Array(COUNT),y:new Float32Array(COUNT),z:new Float32Array(COUNT),nx:new Float32Array(COUNT),ny:new Float32Array(COUNT),nz:new Float32Array(COUNT),c:new Array(COUNT)},n=X.length||1;
    for(let k=0;k<COUNT;k++){const j=Math.floor(k/COUNT*n+(k%7)*.13)%n;f.x[k]=X[j];f.y[k]=Y[j];f.z[k]=Z[j];f.nx[k]=NX[j];f.ny[k]=NY[j];f.nz[k]=NZ[j];f.c[k]=C[j]}return f;
  }
  Promise.all(sources.map(src=>new Promise(resolve=>{const image=new Image();image.onload=()=>resolve(image);image.src=src;}))).then(images=>{images.forEach(image=>frames.push(sample(image)));px.set(frames[0].x);py.set(frames[0].y);pz.set(frames[0].z);ready=true;phase=performance.now()});
  function resize(){const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);w=Math.max(1,Math.floor(r.width));h=Math.max(1,Math.floor(r.height));canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}new ResizeObserver(resize).observe(canvas);resize();
  const pointer={x:-9999,y:-9999,active:false},hand={x:-9999,y:-9999,vx:0,vy:0,pull:0},down={x:0,y:0,t:0};let dragX=0,dragY=0,spinFree=0,spinX=0;
  function move(e){const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;if(pointer.active){dragY+=(x-pointer.x)*.0022;dragX+=(y-pointer.y)*.0014}else{hand.x=x;hand.y=y}pointer.x=x;pointer.y=y;pointer.active=true}canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerleave',()=>pointer.active=false);canvas.addEventListener('pointerdown',e=>{const r=canvas.getBoundingClientRect();down.x=e.clientX-r.left;down.y=e.clientY-r.top;down.t=performance.now();move(e)});canvas.addEventListener('pointerup',e=>{const r=canvas.getBoundingClientRect();if(Math.hypot(e.clientX-r.left-down.x,e.clientY-r.top-down.y)<6&&performance.now()-down.t<500&&ready&&!morphing){morphing=true;phase=performance.now()}});
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting},{threshold:.01}).observe(canvas);
  const ease=t=>t*t*(3-2*t);
  function render(now){raf=requestAnimationFrame(render);if(!visible)return;ctx.clearRect(0,0,w,h);if(!ready)return;let m=0;if(!morphing&&now-phase>HOLD&&!reduce){morphing=true;phase=now}else if(morphing){m=Math.min(1,(now-phase)/MORPH);if(m>=1){morphing=false;from=to;to=(to+1)%frames.length;phase=now;m=0}}const A=frames[from],B=frames[to],k=ease(m),storm=Math.sin(Math.PI*m);if(pointer.active){hand.vx+=(pointer.x-hand.x)*.12;hand.vy+=(pointer.y-hand.y)*.12;hand.pull+=(1-hand.pull)*.08}else hand.pull+=(0-hand.pull)*.04;hand.vx*=.84;hand.vy*=.84;hand.x+=hand.vx;hand.y+=hand.vy;dragY*=.94;dragX*=.94;spinFree=(spinFree+dragY)*.995;const sy=Math.sin((reduce?0:now*.00016)+spinFree),cy=Math.cos((reduce?0:now*.00016)+spinFree);spinX=Math.max(-.4,Math.min(.4,spinX*.96+dragX));const sx=Math.sin(spinX),cx=Math.cos(spinX),R=Math.min(w,h)*.42,ox=w*.55,oy=h*.44,R2=Math.min(w,h)*.24;ctx.globalCompositeOperation='lighter';for(let i=0;i<COUNT;i++){const s=seed[i];let tx=A.x[i]+(B.x[i]-A.x[i])*k,ty=A.y[i]+(B.y[i]-A.y[i])*k,tz=A.z[i]+(B.z[i]-A.z[i])*k;if(storm>.001){const drift=storm*(.35+.45*Math.abs(Math.sin(s*3.7)));tx+=Math.cos(s*5.1+now*.0016)*drift*.8+drift*.5;ty+=Math.sin(s*2.3+now*.0012)*drift*.55;tz+=Math.sin(s*4.4-now*.0011)*drift*.7}px[i]+=(tx+Math.sin(now*.0006+s)*.008-px[i])*.09;py[i]+=(ty+Math.cos(now*.0005+s*1.7)*.008-py[i])*.09;pz[i]+=(tz-pz[i])*.09;const xr=px[i]*cy+pz[i]*sy,zr=-px[i]*sy+pz[i]*cy,yr=py[i]*cx-zr*sx,zz=py[i]*sx+zr*cx,persp=1.9/(1.9+zz);let X=ox+xr*R*persp,Y=oy+yr*R*persp;if(hand.pull>.01){const dx=X-hand.x,dy=Y-hand.y,d=Math.hypot(dx,dy);if(d<R2){const g=(1-d/R2)**2*hand.pull,iv=1/(d+.001);X+=(dx*iv-dy*iv*.8)*g*26;Y+=(dy*iv+dx*iv*.8)*g*26}}ctx.globalAlpha=Math.min(1,Math.max(.32,persp*1.15)*(.7+.3*Math.sin(now*.0022+s*3.1))*(1-storm*.35));ctx.fillStyle=storm>.5?(i%11===0?'rgb(240,226,196)':B.c[i]):k>.5?B.c[i]:A.c[i];ctx.fillRect(X,Y,persp>1.02?1.5:1.1,persp>1.02?1.5:1.1)}ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}raf=requestAnimationFrame(render);
})();
