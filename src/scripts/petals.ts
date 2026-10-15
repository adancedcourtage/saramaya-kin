/**
 * Hero scene: Damask rose petals drifting through the blue night.
 * Petals scatter away from the pointer like a breath of wind.
 */
import * as THREE from 'three';

interface Petal {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rot: THREE.Euler;
  spin: THREE.Vector3;
  scale: number;
  phase: number;
}

function petalGeometry() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.5);
  s.bezierCurveTo(0.42, -0.35, 0.55, 0.2, 0.18, 0.5);
  s.quadraticCurveTo(0, 0.42, -0.18, 0.5);
  s.bezierCurveTo(-0.55, 0.2, -0.42, -0.35, 0, -0.5);
  const g = new THREE.ShapeGeometry(s, 14);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    p.setZ(i, 0.35 * x * x + 0.12 * (y + 0.5) * (y + 0.5));
  }
  g.computeVertexNormals();
  return g;
}

export function initPetals() {
  const host = document.querySelector<HTMLElement>('[data-petals]');
  if (!host) return;

  const mobile = innerWidth < 760;
  const count = mobile ? 40 : 90;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 14);

  scene.add(new THREE.HemisphereLight(0xc9d6ff, 0x3a0f2a, 1.1));
  const key = new THREE.DirectionalLight(0xffd9e4, 2.6);
  key.position.set(4, 6, 8);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x5b8cff, 1.4);
  rim.position.set(-6, -2, -4);
  scene.add(rim);

  const material = new THREE.MeshPhysicalMaterial({
    side: THREE.DoubleSide,
    roughness: 0.55,
    sheen: 1,
    sheenRoughness: 0.4,
    sheenColor: new THREE.Color('#ffd1de'),
    transmission: 0.12,
    thickness: 0.2,
  });
  const mesh = new THREE.InstancedMesh(petalGeometry(), material, count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(mesh);

  const palette = ['#c8426e', '#b8325e', '#e8789b', '#f7c9d6', '#d9577f', '#8f2147'].map((c) => new THREE.Color(c));
  let bounds = { w: 10, h: 6 };
  const petals: Petal[] = [];
  const rand = (a: number, b: number) => a + Math.random() * (b - a);

  function resize() {
    const { clientWidth: w, clientHeight: h } = host!;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const vh = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    bounds = { w: (vh * camera.aspect) / 2 + 1.5, h: vh / 2 + 1.5 };
  }
  resize();

  for (let i = 0; i < count; i++) {
    petals.push({
      pos: new THREE.Vector3(rand(-bounds.w, bounds.w), rand(-bounds.h, bounds.h), rand(-8, 3)),
      vel: new THREE.Vector3(rand(-0.15, 0.15), rand(-0.5, -0.2), 0),
      rot: new THREE.Euler(rand(0, 6.28), rand(0, 6.28), rand(0, 6.28)),
      spin: new THREE.Vector3(rand(-0.8, 0.8), rand(-0.8, 0.8), rand(-0.5, 0.5)),
      scale: rand(0.25, 0.7),
      phase: rand(0, 6.28),
    });
    mesh.setColorAt(i, palette[i % palette.length]);
  }

  const pointer = new THREE.Vector3(999, 999, 0);
  const pointerVel = new THREE.Vector2();
  let lastPointer = { x: 0, y: 0 };
  host.parentElement!.addEventListener('pointermove', (e) => {
    const r = host.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = -((e.clientY - r.top) / r.height) * 2 + 1;
    pointerVel.set(nx - lastPointer.x, ny - lastPointer.y);
    lastPointer = { x: nx, y: ny };
    pointer.set(nx * (bounds.w - 1.5), ny * (bounds.h - 1.5), 0);
  });
  host.parentElement!.addEventListener('pointerleave', () => pointer.set(999, 999, 0));

  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const sc = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const clock = new THREE.Clock();
  let running = true;
  let scrollFade = 0;

  function frame() {
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    petals.forEach((p, i) => {
      p.vel.x += Math.sin(t * 0.6 + p.phase) * 0.004;
      tmp.copy(p.pos).sub(pointer);
      tmp.z *= 0.3;
      const d = tmp.length();
      if (d < 2.6) {
        const force = (2.6 - d) * 0.9;
        p.vel.addScaledVector(tmp.normalize(), force * dt * 6);
        p.vel.x += pointerVel.x * 3;
        p.vel.y += pointerVel.y * 3;
        p.spin.multiplyScalar(1.02);
      }
      p.vel.y += (-0.32 - scrollFade * 0.6 - p.vel.y) * 0.02;
      p.vel.x *= 0.985;
      p.vel.z *= 0.96;
      p.pos.addScaledVector(p.vel, dt);
      p.spin.clampLength(0.2, 2.4);
      p.rot.x += p.spin.x * dt;
      p.rot.y += p.spin.y * dt;
      p.rot.z += p.spin.z * dt;
      if (p.pos.y < -bounds.h) { p.pos.y = bounds.h; p.pos.x = rand(-bounds.w, bounds.w); }
      if (p.pos.x > bounds.w) p.pos.x = -bounds.w;
      if (p.pos.x < -bounds.w) p.pos.x = bounds.w;
      q.setFromEuler(p.rot);
      sc.setScalar(p.scale);
      m.compose(p.pos, q, sc);
      mesh.setMatrixAt(i, m);
    });
    pointerVel.multiplyScalar(0.9);
    mesh.instanceMatrix.needsUpdate = true;
    camera.position.y = -scrollFade * 2;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  const io = new IntersectionObserver(([entry]) => {
    const was = running;
    running = entry.isIntersecting && !document.hidden;
    if (running && !was) { clock.getDelta(); requestAnimationFrame(frame); }
  });
  io.observe(host);
  document.addEventListener('visibilitychange', () => {
    const was = running;
    running = !document.hidden;
    if (running && !was) { clock.getDelta(); requestAnimationFrame(frame); }
  });
  addEventListener('resize', resize);
  addEventListener('scroll', () => { scrollFade = Math.min(1, scrollY / innerHeight); }, { passive: true });

  host.classList.add('is-live');
  requestAnimationFrame(frame);
}
