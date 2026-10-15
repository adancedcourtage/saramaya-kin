/**
 * Story backdrop shared by the hero and the night-to-dawn passage.
 * Two paintings (Damask rose distillery, argan workshop) are rendered as 2.5D scenes:
 * each pixel is shifted by its depth for a parallax that follows the pointer and the scroll.
 * Scroll drives the grade from blue night to sunrise, then dissolves rose into argan.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mesh, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, TextureLoader, Vector2, WebGLRenderer, LinearFilter, type Texture } from 'three';

gsap.registerPlugin(ScrollTrigger);

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const fragmentShader = /* glsl */ `
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
`;

export function initScene({ reduced }: { reduced: boolean }) {
  const host = document.querySelector<HTMLElement>('[data-scene]');
  const story = document.querySelector<HTMLElement>('[data-story]');
  const hero = document.querySelector<HTMLElement>('.hero');
  const dawn = document.querySelector<HTMLElement>('[data-dawn]');
  if (!host || !story || !hero || !dawn || reduced) return;

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  } catch {
    return; // no WebGL: the static picture stays
  }
  const mobile = innerWidth < 760;
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));

  const uniforms = {
    tA: { value: null as Texture | null }, dA: { value: null as Texture | null },
    tB: { value: null as Texture | null }, dB: { value: null as Texture | null },
    uRes: { value: new Vector2(1, 1) },
    uPointer: { value: new Vector2() },
    uImgRatio: { value: 1.5 },
    uFocus: { value: new Vector2(0.55, 0.3) },
    uNight: { value: 1 },
    uMix: { value: 0 },
    uZoom: { value: 1.06 },
    uDepthAmt: { value: mobile ? 0.03 : 0.045 },
    uTime: { value: 0 },
  };
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  scene.add(new Mesh(new PlaneGeometry(2, 2), new ShaderMaterial({ uniforms, vertexShader, fragmentShader, depthTest: false })));

  const loader = new TextureLoader();
  const load = (url: string) =>
    new Promise<Texture>((resolve, reject) =>
      loader.load(url, (t) => { t.minFilter = LinearFilter; t.generateMipmaps = false; resolve(t); }, undefined, reject),
    );
  const { a, ad, b, bd } = host.dataset;

  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false);
    uniforms.uRes.value.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
  };

  // Pointer (or a slow drift on touch screens) moves the virtual camera.
  const target = new Vector2();
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer) {
    addEventListener('pointermove', (e) => target.set((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1)), { passive: true });
  }

  // Scroll choreography: hero = night; dawn passage = sunrise, then rose dissolves into argan.
  const state = { night: 1, mix: 0, zoom: 1.06 };
  const update = () => {
    const heroP = Math.min(1, Math.max(0, scrollY / hero.offsetHeight));
    const r = dawn.getBoundingClientRect();
    const dawnP = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
    state.night = 1 - gsap.parseEase('power2.inOut')(Math.min(1, Math.max(0, (dawnP - 0.28) / 0.32)));
    state.mix = Math.min(1, Math.max(0, (dawnP - 0.6) / 0.25));
    state.zoom = 1.06 + heroP * 0.04 + dawnP * 0.1;
  };
  addEventListener('scroll', update, { passive: true });

  let running = false;
  const clockStart = performance.now();
  const frame = () => {
    if (!running) return;
    const t = (performance.now() - clockStart) / 1000;
    if (!finePointer) target.set(Math.sin(t * 0.25) * 0.6, Math.cos(t * 0.2) * 0.3);
    uniforms.uPointer.value.lerp(target, 0.05);
    uniforms.uNight.value += (state.night - uniforms.uNight.value) * 0.08;
    uniforms.uMix.value += (state.mix - uniforms.uMix.value) * 0.08;
    uniforms.uZoom.value += (state.zoom - uniforms.uZoom.value) * 0.08;
    uniforms.uTime.value = t;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  };
  const setRunning = (on: boolean) => {
    if (on === running) return;
    running = on;
    if (on) requestAnimationFrame(frame);
  };

  Promise.all([load(a!), load(ad!), load(b!), load(bd!)])
    .then(([ta, da, tb, db]) => {
      uniforms.tA.value = ta; uniforms.dA.value = da; uniforms.tB.value = tb; uniforms.dB.value = db;
      uniforms.uImgRatio.value = ta.image.width / ta.image.height;
      host.appendChild(renderer.domElement);
      resize();
      update();
      uniforms.uNight.value = state.night;
      uniforms.uMix.value = state.mix;
      new IntersectionObserver(([entry]) => setRunning(entry.isIntersecting && !document.hidden)).observe(story);
      document.addEventListener('visibilitychange', () => setRunning(!document.hidden && story.getBoundingClientRect().bottom > 0));
      addEventListener('resize', resize);
      setRunning(true);
      requestAnimationFrame(() => host.classList.add('is-live'));
    })
    .catch(() => renderer.dispose());
}
