import{g as y,S as I}from"./Base.astro_astro_type_script_index_0_lang.B-UNbXRX.js";import{W as N,a as q,O as W,j as C,k as E,l as k,V as m,T as H,L as Z}from"./three.module.Dp7Kec_c.js";y.registerPlugin(I);const O=`
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`,j=`
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tA; uniform sampler2D dA;
  uniform sampler2D tB; uniform sampler2D dB;
  uniform vec2 uRes;
  uniform vec2 uPointer;
  uniform float uImgRatio;
  uniform vec2 uFocus;      // horizontal focus of each image when cropped (0 left .. 1 right)
  uniform float uNight;     // 1 = blue night, 0 = daylight
  uniform float uMix;       // 0 = rose scene, 1 = argan scene
  uniform float uZoom;
  uniform float uDepthAmt;
  uniform float uTime;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }

  vec2 cover(vec2 uv, float focus) {
    float sr = uRes.x / uRes.y;
    vec2 s = sr > uImgRatio ? vec2(1.0, uImgRatio / sr) : vec2(sr / uImgRatio, 1.0);
    uv = (uv - 0.5) / uZoom + 0.5;
    return uv * s + vec2((1.0 - s.x) * focus, (1.0 - s.y) * 0.5);
  }

  // Depth-aware parallax: two refinement steps give cleaner edges than a single offset.
  vec2 parallax(sampler2D depthMap, vec2 uv) {
    vec2 shift = uPointer * uDepthAmt;
    float d = texture2D(depthMap, uv).r;
    vec2 p = uv + shift * (d - 0.45);
    d = texture2D(depthMap, p).r;
    p = uv + shift * (d - 0.45);
    return clamp(p, vec2(0.001), vec2(0.999));
  }

  vec3 grade(vec3 c, vec2 uv) {
    float lum = dot(c, vec3(0.299, 0.587, 0.114));
    vec3 night = vec3(0.035, 0.06, 0.16) + pow(lum, 1.35) * vec3(0.32, 0.46, 0.92);
    // sunrise warmth peaks halfway through the transition, strongest near the horizon
    float glow = uNight * (1.0 - uNight) * 4.0;
    vec3 dawn = c + vec3(0.55, 0.12, 0.25) * glow * smoothstep(1.0, 0.35, uv.y) * 0.35;
    return mix(dawn, night, uNight);
  }

  void main() {
    vec2 uvA = parallax(dA, cover(vUv, uFocus.x));
    vec2 uvB = parallax(dB, cover(vUv, uFocus.y));
    vec3 a = grade(texture2D(tA, uvA).rgb, vUv);
    vec3 b = grade(texture2D(tB, uvB).rgb, vUv);

    // Dissolve from rose to argan: near objects of the argan scene appear first.
    float v = texture2D(dB, uvB).r * 0.8 + noise(vUv * 9.0 + uTime * 0.05) * 0.2;
    float edge = uMix * 1.5 - 0.25;
    float k = smoothstep(1.0 - edge, 1.25 - edge, v);
    vec3 col = mix(a, b, k);

    float vig = smoothstep(1.15, 0.35, length((vUv - 0.5) * vec2(1.1, 1.3)));
    col *= mix(0.72, 1.0, vig);
    col += (hash(vUv * uRes + uTime) - 0.5) * 0.025;
    gl_FragColor = vec4(col, 1.0);
  }
`;function Y({reduced:S}){const s=document.querySelector("[data-scene]"),h=document.querySelector("[data-story]"),p=document.querySelector(".hero"),x=document.querySelector("[data-dawn]");if(!s||!h||!p||!x||S)return;let i;try{i=new N({antialias:!1,powerPreference:"high-performance"})}catch{return}const u=innerWidth<760;i.setPixelRatio(Math.min(devicePixelRatio,u?1.5:2));const t={tA:{value:null},dA:{value:null},tB:{value:null},dB:{value:null},uRes:{value:new m(1,1)},uPointer:{value:new m},uImgRatio:{value:1.5},uFocus:{value:new m(.55,.3)},uNight:{value:1},uMix:{value:0},uZoom:{value:1.06},uDepthAmt:{value:u?.03:.045},uTime:{value:0}},w=new q,A=new W(-1,1,1,-1,0,1);w.add(new C(new E(2,2),new k({uniforms:t,vertexShader:O,fragmentShader:j,depthTest:!1})));const D=new H,v=e=>new Promise((o,r)=>D.load(e,l=>{l.minFilter=Z,l.generateMipmaps=!1,o(l)},void 0,r)),a=s.dataset,c=u&&innerHeight>innerWidth*1.1&&!!a.aPortrait,B=c?a.aPortrait:u?a.aSmall:a.a,F=c?a.bPortrait:u?a.bSmall:a.b,U=c?a.adPortrait:a.ad,L=c?a.bdPortrait:a.bd;c&&t.uFocus.value.set(.5,.5);const M=()=>{const e=s.clientWidth,o=s.clientHeight;i.setSize(e,o,!1),t.uRes.value.set(e*i.getPixelRatio(),o*i.getPixelRatio())},d=new m,P=matchMedia("(hover: hover) and (pointer: fine)").matches;P&&addEventListener("pointermove",e=>d.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight*2-1)),{passive:!0});const n={night:1,mix:0,zoom:1.06},R=()=>{const e=Math.min(1,Math.max(0,scrollY/p.offsetHeight)),o=x.getBoundingClientRect(),r=Math.min(1,Math.max(0,-o.top/Math.max(1,o.height-innerHeight)));n.night=1-y.parseEase("power2.inOut")(Math.min(1,Math.max(0,(r-.1)/.18))),n.mix=Math.min(1,Math.max(0,(r-.36)/.14)),n.zoom=1.06+e*.04+r*.1};addEventListener("scroll",R,{passive:!0});let g=!1;const T=performance.now(),b=()=>{if(!g)return;const e=(performance.now()-T)/1e3;P||d.set(Math.sin(e*.25)*.6,Math.cos(e*.2)*.3),t.uPointer.value.lerp(d,.05),t.uNight.value+=(n.night-t.uNight.value)*.08,t.uMix.value+=(n.mix-t.uMix.value)*.08,t.uZoom.value+=(n.zoom-t.uZoom.value)*.08,t.uTime.value=e,i.render(w,A),requestAnimationFrame(b)},f=e=>{e!==g&&(g=e,e&&requestAnimationFrame(b))};Promise.all([v(B),v(U),v(F),v(L)]).then(([e,o,r,l])=>{t.tA.value=e,t.dA.value=o,t.tB.value=r,t.dB.value=l,t.uImgRatio.value=e.image.width/e.image.height,s.appendChild(i.domElement),M(),R(),t.uNight.value=n.night,t.uMix.value=n.mix,new IntersectionObserver(([z])=>f(z.isIntersecting&&!document.hidden)).observe(h),document.addEventListener("visibilitychange",()=>f(!document.hidden&&h.getBoundingClientRect().bottom>0)),addEventListener("resize",M),f(!0),requestAnimationFrame(()=>s.classList.add("is-live"))}).catch(()=>i.dispose())}export{Y as initScene};
