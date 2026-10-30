const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#primary-nav');
function closeMenu(returnFocus = false) {
  toggle?.setAttribute('aria-expanded', 'false');
  toggle?.setAttribute('aria-label', 'Open navigation');
  nav?.classList.remove('is-open');
  if (returnFocus) toggle?.focus();
}
toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  nav?.classList.toggle('is-open', open);
});
nav?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
document.addEventListener('click', event => {
  if (!event.target.closest('.header-inner')) closeMenu();
});
window.matchMedia('(min-width: 901px)').addEventListener('change',event=>{if(event.matches)closeMenu();});

const header = document.querySelector('.site-header');
const homeSections = document.querySelector('.corporate-hero')
  ? [...document.querySelectorAll('#about, #projects, #contact')] : [];
const navigationLinks = [...document.querySelectorAll('#primary-nav>a')];
let currentSection;
let scrollFrame = 0;
function updateScrollUI() {
  scrollFrame = 0;
  header?.classList.toggle('is-scrolled', window.scrollY > 20);
  const range = document.documentElement.scrollHeight - window.innerHeight;
  header?.style.setProperty('--page-progress', String(range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0));
  if (homeSections.length) {
    let section = '';
    for (const target of homeSections) if (target.getBoundingClientRect().top <= window.innerHeight * .35) section = target.id;
    if (section !== currentSection) {
      currentSection = section;
      for (const link of navigationLinks) {
        const target = new URL(link.href);
        const hash = target.hash.slice(1);
        const active = target.pathname === location.pathname && (section ? hash === section : !hash);
        if (active) link.setAttribute('aria-current', section ? 'location' : 'page');
        else link.removeAttribute('aria-current');
      }
    }
  }
}
const queueScrollUI = () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollUI); };
window.addEventListener('scroll', queueScrollUI, { passive: true });
window.addEventListener('resize', queueScrollUI);
window.addEventListener('load', queueScrollUI, { once: true });
updateScrollUI();

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
function updateMotion() {
  document.documentElement.dataset.motion = motionPreference.matches ? 'reduced' : 'running';
}
motionPreference.addEventListener('change', updateMotion);
updateMotion();

// Offer a direct copy action as an alternative to opening an email application.
for (const address of document.querySelectorAll('.contact-address, .contact-email')) {
  const email = address.getAttribute('href')?.match(/^mailto:([^?]+)/i)?.[1];
  if (!email) continue;
  const tools = document.createElement('div');
  tools.className = 'copy-email-tools';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'copy-email';
  button.textContent = 'Copy email address';
  const feedback = document.createElement('span');
  feedback.className = 'copy-feedback';
  feedback.setAttribute('role', 'status');
  tools.append(button, feedback);
  address.after(tools);
  button.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(decodeURIComponent(email));
      feedback.textContent = 'Email address copied.';
    } catch {
      let fallback = tools.querySelector('input');
      if (!fallback) {
        fallback = document.createElement('input');
        fallback.className = 'copy-email-fallback';
        fallback.readOnly = true;
        fallback.value = decodeURIComponent(email);
        fallback.setAttribute('aria-label', 'Email address to copy');
        tools.append(fallback);
      }
      fallback.focus();
      fallback.select();
      feedback.textContent = 'Copy the selected address using your device’s copy command.';
    }
  });
}

// Keep one accessible label; the second line is only a visual hover treatment.
for (const link of document.querySelectorAll('.button, .text-link, .header-inner nav>a, .contact-address, .footer-bottom>a')) {
  for (const text of [...link.childNodes].filter(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim())) {
    const label = text.textContent.trim();
    const labelWindow = document.createElement('span');
    labelWindow.className = 'label-window';
    const track = document.createElement('span');
    track.className = 'label-track';
    const original = document.createElement('span');
    original.textContent = label;
    const echo = document.createElement('span');
    echo.textContent = label;
    echo.setAttribute('aria-hidden', 'true');
    track.append(original, echo);
    labelWindow.append(track);
    text.replaceWith(labelWindow);
  }
}

// Suspend decorative loops while they are offscreen or the tab is hidden.
const motionStage = document.querySelector('.corporate-hero');
if (motionStage && 'IntersectionObserver' in window) {
  new IntersectionObserver(entries => {
    motionStage.classList.toggle('motion-offscreen', !entries[0].isIntersecting);
  }).observe(motionStage);
}
const suspendMotion = () => document.documentElement.classList.toggle('motion-suspended', document.hidden);
document.addEventListener('visibilitychange', suspendMotion);
suspendMotion();
const revealTargets = [...document.querySelectorAll('[data-reveal]')];
if ('IntersectionObserver' in window && !motionPreference.matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: .08 });
  for (const target of revealTargets) {
    target.classList.add('reveal-ready');
    observer.observe(target);
  }
  motionPreference.addEventListener('change', event => {
    if (event.matches) { observer.disconnect(); revealTargets.forEach(target => target.classList.add('is-visible')); }
  });
}

// Reveal each scene once, but keep tracking visibility for decorative loops.
const scenes = [...document.querySelectorAll('.motion-scene')];
if ('IntersectionObserver' in window) {
  const sceneObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      entry.target.classList.toggle('is-active', entry.isIntersecting);
      if (entry.isIntersecting) entry.target.classList.add('is-in-view');
    }
  }, { threshold: .15 });
  scenes.forEach(scene => sceneObserver.observe(scene));
}

const contents = document.querySelector('.toc-disclosure');
if (contents) {
  const narrow = window.matchMedia('(max-width: 680px)');
  const setContentsLayout = () => { contents.open = !narrow.matches; };
  setContentsLayout();
  narrow.addEventListener('change', setContentsLayout);
  contents.addEventListener('click', event => {
    if (event.target.closest('a') && narrow.matches) contents.open = false;
  });
}

// Printed help/policies include disclosure contents, then restore the reader's view.
let closedBeforePrint = [];
window.addEventListener('beforeprint', () => {
  closedBeforePrint = [...document.querySelectorAll('details:not([open])')];
  closedBeforePrint.forEach(detail => { detail.open = true; });
});
window.addEventListener('afterprint', () => {
  closedBeforePrint.forEach(detail => { detail.open = false; });
  closedBeforePrint = [];
});

// Map a pointer segment to the first crossed edge and its clockwise perimeter distance.
function frameEdgeCrossing(from, to, width, height) {
  const edges = [
    [{x:0,y:0},{x:width,y:0},0],
    [{x:width,y:0},{x:width,y:height},width],
    [{x:width,y:height},{x:0,y:height},width+height],
    [{x:0,y:height},{x:0,y:0},2*width+height]
  ];
  const dx=to.x-from.x, dy=to.y-from.y;
  let hit;
  for (const [a,b,start] of edges) {
    const ex=b.x-a.x, ey=b.y-a.y, denominator=dx*ey-dy*ex;
    if (Math.abs(denominator)<.00001) continue;
    const ax=a.x-from.x, ay=a.y-from.y;
    const t=(ax*ey-ay*ex)/denominator, u=(ax*dy-ay*dx)/denominator;
    if(t>0 && t<=1 && u>=0 && u<=1 && (!hit || t<hit.t)) {
      hit={t,distance:start+u*Math.hypot(ex,ey)};
    }
  }
  return hit;
}

// Account for the current skew/drift instead of testing an axis-aligned bounding box.
function frameLocalPoint(frame, point) {
  const style=getComputedStyle(frame);
  const width=parseFloat(style.width), height=parseFloat(style.height);
  const [ox,oy]=style.transformOrigin.split(' ').map(parseFloat);
  const matrix=new DOMMatrix(style.transform==='none'?undefined:style.transform);
  const corners=[[0,0],[width,0],[width,height],[0,height]].map(([x,y])=> {
    const p=new DOMPoint(x-ox,y-oy).matrixTransform(matrix);
    return {x:p.x+ox,y:p.y+oy};
  });
  const rect=frame.getBoundingClientRect();
  const p=new DOMPoint(point.x-rect.left+Math.min(...corners.map(p=>p.x))-ox,
    point.y-rect.top+Math.min(...corners.map(p=>p.y))-oy).matrixTransform(matrix.inverse());
  return {x:p.x+ox-.5,y:p.y+oy-.5,width:width-1,height:height-1};
}

// No pointer-following displacement: interaction only illuminates crossed frame edges.
if (motionStage) {
  const frames=[...motionStage.querySelectorAll('.structure-frame')];
  const active=new Map();
  const cooldown=new WeakMap();
  let previous, pending, crossingFrame=0;
  const clearFrameTraces=()=> {
    cancelAnimationFrame(crossingFrame);
    crossingFrame=0;
    previous=undefined;
    for(const [frame,effect] of active) {
      effect.animations.forEach(animation=>animation.cancel());
      effect.svg.remove();
      active.delete(frame);
    }
  };
  const traceFrame=(frame,distance,width,height)=> {
    if(active.has(frame) || performance.now()<(cooldown.get(frame)||0)) return;
    const ns='http://www.w3.org/2000/svg';
    const svg=document.createElementNS(ns,'svg');
    svg.setAttribute('class','frame-trace-layer');
    svg.setAttribute('viewBox','0 0 '+(width+1)+' '+(height+1));
    svg.setAttribute('aria-hidden','true');
    const perimeter=2*(width+height), half=perimeter/2, tail=Math.min(54,perimeter*.055);
    const duration=2400, arrival=.88;
    const route='M.5 .5 H'+(width+.5)+' V'+(height+.5)+' H.5 Z';
    const animations=[];
    for(const direction of [1,-1]) {
      const path=document.createElementNS(ns,'path');
      path.setAttribute('d',route);
      path.setAttribute('class','frame-trace-line');
      svg.append(path);
      const offset=(travel,length)=>-(distance+direction*travel-(direction===1?length:0));
      animations.push(path.animate([
        {strokeDasharray:'0 '+perimeter,strokeDashoffset:offset(0,0),opacity:0,offset:0},
        {strokeDasharray:tail+' '+(perimeter-tail),strokeDashoffset:offset(half*.08/arrival,tail),opacity:1,offset:.08},
        {strokeDasharray:tail+' '+(perimeter-tail),strokeDashoffset:offset(half,tail),opacity:1,offset:arrival},
        {strokeDasharray:tail+' '+(perimeter-tail),strokeDashoffset:offset(half,tail),opacity:0,offset:1}
      ],{duration,easing:'linear',fill:'both'}));
    }
    frame.append(svg);
    const meeting=svg.querySelector('path').getPointAtLength((distance+half)%perimeter);
    const spark=document.createElementNS(ns,'circle');
    spark.setAttribute('class','frame-trace-collision');
    spark.setAttribute('cx',meeting.x);spark.setAttribute('cy',meeting.y);spark.setAttribute('r','2.5');
    svg.append(spark);
    animations.push(spark.animate([{opacity:0,offset:0},{opacity:0,offset:arrival-.015},
      {opacity:1,offset:arrival+.015},{opacity:0,offset:1}],{duration,fill:'both'}));
    const effect={svg,animations};active.set(frame,effect);
    Promise.allSettled(animations.map(animation=>animation.finished)).then(()=> {
      if(active.get(frame)!==effect) return;
      svg.remove();active.delete(frame);cooldown.set(frame,performance.now()+300);
    });
  };
  motionStage.addEventListener('pointermove',event=> {
    if(event.pointerType!=='mouse' || motionPreference.matches || document.hidden) return;
    pending={x:event.clientX,y:event.clientY};
    if(crossingFrame) return;
    crossingFrame=requestAnimationFrame(()=> {
      crossingFrame=0;
      if(previous) for(const frame of frames) {
        if(!frame.getClientRects().length || active.has(frame)) continue;
        const from=frameLocalPoint(frame,previous), to=frameLocalPoint(frame,pending);
        const hit=frameEdgeCrossing(from,to,to.width,to.height);
        if(hit) traceFrame(frame,hit.distance,to.width,to.height);
      }
      previous=pending;
    });
  },{passive:true});
  motionStage.addEventListener('pointerleave',()=> {previous=undefined;}, {passive:true});
  motionStage.addEventListener('pointercancel',clearFrameTraces,{passive:true});
  window.addEventListener('scroll',clearFrameTraces,{passive:true});
  window.addEventListener('resize',clearFrameTraces);
  motionPreference.addEventListener('change',clearFrameTraces);
  document.addEventListener('visibilitychange',clearFrameTraces);
}
