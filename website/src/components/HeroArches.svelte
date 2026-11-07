<script lang="ts">
  import { onMount } from 'svelte';

  let canvasEl = $state<HTMLCanvasElement | null>(null);

  onMount(() => {
    if (!canvasEl) return;
    const canvas = canvasEl;
    const hero = canvas.closest('.hero');
    if (!hero) return;
    const gl = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false, powerPreference: 'low-power' });
    if (!gl) return;

    const VERT = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
    const FRAG = `precision highp float;
uniform vec2 uRes; uniform float uDpr, uT, uDark, uCopy; uniform vec3 uArch; uniform vec3 uPtr; uniform float uLit[8];
const vec3 CITRUS = vec3(.70,.90,.26);
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){return .55*vn(p)+.3*vn(p*2.03+7.)+.15*vn(p*4.1+13.);}
vec4 over(vec4 top, vec4 under){return top+under*(1.-top.a);}
vec4 dots(vec2 p){
  const float cell=15.;
  vec2 id=floor(p/cell), c=(id+.5)*cell;
  float patch_=smoothstep(.42,.74,vn(id*.05+vec2(3.,uT*.012)));
  float fine=vn(id*.31+11.);
  float rad=cell*(.05+.27*patch_*fine);
  float near=uPtr.z*exp(-dot(c-uPtr.xy,c-uPtr.xy)/14000.);
  rad+=cell*.14*near;
  float a=smoothstep(rad+.7,rad-.7,length(p-c));
  float top=uRes.y-uArch.y-uArch.z;
  float copy=uCopy>0.?mix(.42,1.,smoothstep(uCopy*.72,uCopy*1.08,p.x)):mix(.1,1.,smoothstep(top-90.,top+30.,p.y));
  float fade=smoothstep(0.,140.,uRes.y-p.y);
  float off=h21(id+vec2(3.1,7.7))*9.;
  float clock=uT*.22+off;
  float lot=h21(id*1.37+floor(clock));
  float lit=smoothstep(.93-.04*patch_,.985,lot)*pow(sin(fract(clock)*3.14159),2.);
  vec2 rel=c-vec2(uArch.x,uRes.y-uArch.y);
  float ang=atan(rel.y,rel.x), rr=length(rel);
  float arm=cos(ang*1.-log(max(rr,1.))*5.236+uT*.35);
  lit=max(lit,smoothstep(.985,1.,arm)*smoothstep(.55,.8,fine)*smoothstep(1400.,200.,rr)*.8);
  lit*=smoothstep(.25,.6,patch_);
  rad+=cell*.06*lit;
  a=smoothstep(rad+.7,rad-.7,length(p-c));
  float o=(uDark>.5?.34:.4)*(.35+.65*patch_+near)*copy*fade*a;
  vec3 col=uDark>.5?vec3(.74,.78,.82):vec3(.34,.38,.46);
  vec3 tint=uDark>.5?CITRUS:vec3(.52,.76,.08);
  float lo=mix(o,(uDark>.5?.9:.85)*copy*fade*a,lit);
  col=mix(col,tint,lit);
  return vec4(col*lo,lo);
}
vec4 shade(float x, vec2 p, vec2 g, float al){
  float R=uArch.z;
  vec3 L=normalize(vec3(-.42,.62,.66));
  vec3 col; float alpha=1.;
  float t0=uT;
  if(x>.37){
    float u=(x-.37)/.07875, i=min(floor(u),7.), t=2.*(u-i)-1.;
    float h=sqrt(max(0.,1.-t*t*.94));
    vec3 n=normalize(vec3(g*t,h+.08));
    vec2 lq=vec2(al*1.45+t*.3+i*.21,x*3.4-t0*.05);
    float w=fbm(lq+vec2(t0*.035,0.));
    float fold=sin(al*2.3+w*6.2+t0*.11+n.x*1.7)*.5+.5;
    float ch=uDark>.5?smoothstep(.38,1.,fold):smoothstep(.16,.96,fold);
    float apex=exp(-pow((al-.02+sin(t0*.09)*.2)*(7.5+i*.3),2.));
    float spec=pow(max(dot(n,L),0.),26.);
    float groove=smoothstep(1.,.66,abs(t));
    float cit=smoothstep(.56,.74,fbm(lq*.72+vec2(19.,t0*.018)))*smoothstep(.2,1.,fold);
    float lit=0.;
    for(int k=0;k<8;k++){if(float(k)==i)lit=uLit[k];}
    if(uDark>.5){
      col=mix(vec3(.038,.044,.056),vec3(.34,.37,.42),ch*ch);
      col+=vec3(.86,.89,.93)*apex*h*(.42+.5*ch);
      col+=vec3(.9)*spec*.42;
      col=mix(col,CITRUS*(.3+.8*ch),cit*.5);
      col*=mix(.16,1.,groove);
      col+=vec3(.66,.70,.76)*smoothstep(.2,.0,abs(t+.5))*(.1+.34*ch);
      col+=vec3(.66,.70,.76)*smoothstep(.2,.0,abs(t-.5))*(.06+.22*ch);
      col=mix(col,vec3(1.,1.,.92),apex*spec*.3);
      col=mix(col,mix(CITRUS*1.35,vec3(1.,1.,.85),apex*.5),lit*(.55+.45*apex));
      alpha=(.2+.55*ch+.35*apex)*mix(.25,1.,groove);
      alpha=mix(alpha,min(1.,alpha+.65),lit);
    }else{
      col=mix(vec3(.88,.90,.93),vec3(.56,.60,.66),ch*.85);
      col=mix(col,vec3(.18,.21,.26),apex*h*.85);
      col+=vec3(1.)*spec*.55;
      col=mix(col,vec3(.52,.76,.08),cit*.45);
      col*=mix(.35,1.,groove);
      col=mix(col,vec3(.32,.54,.02),lit*.75);
      alpha=(.3+.5*ch+.3*apex)*mix(.35,1.,groove);
      alpha=mix(alpha,min(1.,alpha+.5),lit);
    }
  }else if(x>.33){
    col=vec3(0.); alpha=0.;
  }else if(x>.21){
    float t=(x-.27)/.06;
    float h=sqrt(max(0.,1.-t*t*.9));
    vec3 n=normalize(vec3(g*t,h+.1));
    float spec=pow(max(dot(n,L),0.),18.);
    float apex=exp(-pow(al*8.,2.));
    vec3 base=uDark>.5?vec3(.66,.86,.22):vec3(.48,.72,.06);
    vec3 edge=uDark>.5?vec3(.35,.52,.05):vec3(.25,.40,.02);
    col=mix(edge,base,h);
    col+=vec3(1.,1.,.8)*spec*(uDark>.5?.6:.45);
    col+=vec3(.95,1.,.7)*apex*.4;
    alpha=(uDark>.5?.92:.85)*(h*.85+.15);
  }else{
    vec2 c=p-vec2(uArch.x,uArch.y+R*.18);
    float rb=R*.088, d=length(c);
    if(d<=rb){
      float z=sqrt(max(0.,1.-pow(d/rb,2.)));
      vec3 n=vec3(c/rb,z);
      vec3 Lb=normalize(vec3(-.36,.42,.82));
      float diff=max(dot(n,Lb),0.);
      float spec=pow(max(dot(reflect(-Lb,n),vec3(0,0,1)),0.),32.);
      float rim=pow(1.-z,2.5);
      col=mix(vec3(.72,.76,.82),vec3(1.),diff);
      col=mix(col,vec3(.42,.46,.52),rim*.8);
      col+=vec3(1.)*spec*.9;
      alpha=1.;
    }else{
      col=vec3(0.); alpha=0.;
    }
  }
  return vec4(col,alpha);
}
void main(){
  vec2 p=gl_FragCoord.xy/uDpr;
  vec4 d=dots(p);
  vec2 q=vec2(p.x-uArch.x, p.y-uArch.y);
  float R=uArch.z;
  float ang=atan(max(q.y,0.),q.x);
  float al=(ang-1.5707963)/1.5707963;
  float rad=q.y>0.?length(q):abs(q.x);
  vec2 g=q.y>0.?normalize(q):vec2(sign(q.x),0.);
  float x=rad/R;
  vec4 top=vec4(0.);
  if(x<=1.04&&x>=.08&&p.y>=uArch.y-R*.4){
    vec4 s=shade(x,p,g,al);
    float edge=smoothstep(1.04,1.,x)*smoothstep(.08,.11,x);
    top=vec4(s.rgb*s.a, s.a*edge);
  }
  gl_FragColor=over(top,d);
}`;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prg = gl.createProgram()!;
    gl.attachShader(prg, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prg, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prg);
    gl.useProgram(prg);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(prg, 'a');
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prg, 'uRes');
    const uDpr = gl.getUniformLocation(prg, 'uDpr');
    const uT = gl.getUniformLocation(prg, 'uT');
    const uDark = gl.getUniformLocation(prg, 'uDark');
    const uCopy = gl.getUniformLocation(prg, 'uCopy');
    const uArch = gl.getUniformLocation(prg, 'uArch');
    const uPtr = gl.getUniformLocation(prg, 'uPtr');
    const uLit = gl.getUniformLocation(prg, 'uLit');

    let dpr = 1, width = 0, height = 0;
    let device: { w: number; h: number } | null = null;
    const arch = { x: 0, y: 0, r: 0 };
    const ptr = { x: 0, y: 0, on: 0, target: 0 };
    const lit = new Float32Array(8);
    const target = new Float32Array(8);
    let copy = 0;
    const still = matchMedia('(prefers-reduced-motion: reduce)');

    const layout = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      if (device) {
        canvas.width = device.w;
        canvas.height = device.h;
      } else {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      const split = width >= 900;
      if (split) {
        arch.r = Math.min(width * 0.38, height * 0.78, 430);
        arch.x = width - arch.r * 1.05;
        arch.y = (height - arch.r) * 0.45;
        copy = Math.min(width * 0.54, width - arch.r * 1.25);
      } else {
        arch.r = Math.min(width * 0.46, 290);
        arch.x = width / 2;
        arch.y = arch.r * 0.12;
        copy = 0;
      }
    };

    const ringAt = (px: number, py: number) => {
      const qx = px - arch.x, qy = height - py - arch.y;
      const v = (qy > 0 ? Math.hypot(qx, qy) : Math.abs(qx)) / arch.r;
      return v > 0.37 && v < 1 ? Math.min(7, Math.floor((v - 0.37) / 0.07875)) : -1;
    };

    let chosen = -1, hovered = -1;
    const apply = () => {
      const on = chosen >= 0 ? chosen : hovered;
      if (on >= 0 && intro >= 0) {
        intro = -1;
        nextWave(performance.now());
      }
      for (let i = 0; i < 8; i++) if (intro < 0) target[i] = i === on ? 1 : 0;
      wake();
    };
    const announce = () => hero.dispatchEvent(new CustomEvent('arch-hover', { detail: { index: hovered } }));
    hero.addEventListener('arch-select', ((e: CustomEvent<{ index: number }>) => {
      chosen = e.detail.index;
      apply();
    }) as EventListener);

    const onPointerMove = (e: PointerEvent) => {
      const b = canvas.getBoundingClientRect();
      const inside = e.clientY >= b.top && e.clientY <= b.bottom && e.clientX >= b.left && e.clientX <= b.right;
      ptr.x = e.clientX - b.left;
      ptr.y = e.clientY - b.top;
      ptr.target = inside && e.pointerType === 'mouse' ? 1 : 0;
      const ring = inside && e.pointerType === 'mouse' ? ringAt(ptr.x, ptr.y) : -1;
      if (ring !== hovered) {
        hovered = ring;
        announce();
        apply();
      }
      wake();
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    let intro = still.matches ? -1 : 0;
    const start = performance.now();
    let waveAt = start + 500, waveStep = 170, waveIn = false;
    const nextWave = (now: number) => {
      waveAt = now + 12000 + Math.random() * 12000;
      waveStep = 150 + Math.random() * 80;
      waveIn = Math.random() < 0.35;
    };
    const dark = () => (document.documentElement.classList.contains('light') ? 0 : 1);

    const draw = (now: number) => {
      const t = still.matches ? 40 : (now - start) / 1000 + 40;
      gl.uniform2f(uRes, width, height);
      gl.uniform1f(uDpr, dpr);
      gl.uniform1f(uT, t);
      gl.uniform1f(uDark, dark());
      gl.uniform1f(uCopy, copy);
      gl.uniform3f(uArch, arch.x, arch.y, arch.r);
      gl.uniform3f(uPtr, ptr.x, ptr.y, ptr.on);
      gl.uniform1fv(uLit, lit);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    let raf = 0, last = 0, visible = true;
    const step = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      if (now - last >= 32) {
        last = now;
        if (intro < 0 && !still.matches && now >= waveAt) {
          if (chosen < 0 && hovered < 0) intro = 0;
          else nextWave(now);
        }
        if (intro >= 0) {
          const e = (now - waveAt) / waveStep;
          for (let i = 0; i < 8; i++) {
            const k = waveIn ? 7 - i : i;
            target[i] = e > k && e < k + 2 ? 1 : 0;
          }
          if (e > 10) {
            intro = -1;
            nextWave(now);
            apply();
          }
        }
        let moving = false;
        for (let i = 0; i < 8; i++) {
          const d = target[i] - lit[i];
          if (Math.abs(d) > 0.002) moving = true;
          lit[i] += d * 0.28;
        }
        const dp = ptr.target - ptr.on;
        if (Math.abs(dp) > 0.002) moving = true;
        ptr.on += dp * 0.16;
        draw(now);
        if (still.matches && !moving) return;
      }
      raf = requestAnimationFrame(step);
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };

    const resized = new ResizeObserver(([entry]) => {
      const size = entry.devicePixelContentBoxSize?.[0];
      device = size ? { w: size.inlineSize, h: size.blockSize } : null;
      layout();
      draw(performance.now());
      wake();
    });
    try {
      resized.observe(canvas, { box: 'device-pixel-content-box' });
    } catch {
      resized.observe(canvas);
    }
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
    });
    io.observe(canvas);

    document.addEventListener('visibilitychange', wake);
    const mo = new MutationObserver(wake);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    gl.clearColor(0, 0, 0, 0);
    layout();
    wake();

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', wake);
      io.disconnect();
      mo.disconnect();
      resized.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  });
</script>

<canvas bind:this={canvasEl} class="hero-arches" aria-hidden="true"></canvas>

<style>
  :global(.hero-arches) {
    position: absolute;
    inset: 0;
    z-index: 0;
    display: block;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
</style>
