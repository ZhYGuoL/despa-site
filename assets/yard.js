// The hero's back layer: a container yard behind the headline.
// Depth comes from atmospheric perspective (fog to the horizon colour), a ground plane in perspective,
// and parallax (the camera drifts a little with the pointer and with scroll). Nothing moves on its own.
// window.YARD (optional, set before this module runs) overrides the look: palette, light, camera, host element.

import * as THREE from "three";

const CFG = Object.assign({
  host: ".hero",
  sky: [[0, "#d9dfe0"], [0.42, "#ece9e0"], [0.5, "#ebe5d7"], [1, "#ebe5d7"]],
  haze: "#ebe5d7", fogNear: -50, fogFar: 290,
  ground: "#d9d2c2", lane: "#f3efe6",
  colors: ["#a3afb6", "#bcc4c0", "#cbbba3", "#b5a69b", "#9caab5", "#d2c8b7", "#aab7ae", "#c4a593", "#93a2ae", "#d6b796"],
  crane: "#8d9493",
  hemi: [0xf6f1e6, 0x9d9584, 1.5], sun: [0xfff3df, 2.2, [-60, 80, 40]],
  camera: { x: 0, y: 9, z: 34, lx: 0, ly: 1.6, lz: -80, fov: 30, phoneFov: 46 },
  parallax: [3.2, 1.4], exposure: 1, lamps: false, shadowOf: null,
}, window.YARD || {});

const host = document.querySelector(CFG.host);
const canvas = document.getElementById("yard");
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
} catch (e) {
  canvas.remove();
  throw e;
}
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = CFG.exposure;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(new THREE.Color(CFG.haze), CFG.fogNear, CFG.fogFar);

const skyTex = (() => {
  const c = document.createElement("canvas"); c.width = 4; c.height = 512;
  const x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, 0, 512);
  for (const [o, col] of CFG.sky) g.addColorStop(o, col);
  x.fillStyle = g; x.fillRect(0, 0, 4, 512);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
scene.add(new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false, depthWrite: false })));

scene.add(new THREE.HemisphereLight(CFG.hemi[0], CFG.hemi[1], CFG.hemi[2]));
const sun = new THREE.DirectionalLight(CFG.sun[0], CFG.sun[1]);
sun.position.set(...CFG.sun[2]);
scene.add(sun);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400), new THREE.MeshStandardMaterial({ color: CFG.ground, roughness: 1 }));
ground.rotation.x = -Math.PI / 2;
scene.add(ground);
const laneMat = new THREE.MeshBasicMaterial({ color: CFG.lane });
for (const x of [-46, -20, 20, 46, 78, -78]) {
  const lane = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 700), laneMat);
  lane.rotation.x = -Math.PI / 2; lane.position.set(x, 0.02, -330);
  scene.add(lane);
}
for (let z = -20; z > -400; z -= 34) {
  const tick = new THREE.Mesh(new THREE.PlaneGeometry(150, 0.25), laneMat);
  tick.rotation.x = -Math.PI / 2; tick.position.set(0, 0.02, z);
  scene.add(tick);
}

const ribTex = (() => {
  const c = document.createElement("canvas"); c.width = 256; c.height = 8;
  const x = c.getContext("2d");
  for (let i = 0; i < 32; i++) { x.fillStyle = i % 2 ? "#ffffff" : "#d8d8d8"; x.fillRect(i * 8, 0, 8, 8); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
})();

// stacks, seeded so the yard is the same every visit
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const boxes = [];
for (let row = 0; row < 14; row++) {
  const z = -38 - row * 22 - rnd() * 4;
  for (let x = -210; x < 210;) {
    const forty = rnd() > 0.35;
    const len = forty ? 12.19 : 6.06;
    if (Math.abs(x + len / 2) < 9 && row < 3) { x += 18; continue; }
    const h = 1 + Math.floor(rnd() * (row < 2 ? 3 : 4));
    for (let k = 0; k < h; k++) boxes.push({ x: x + len / 2, y: 1.3 + k * 2.6, z: z + (rnd() - 0.5) * 0.4, len, c: CFG.colors[Math.floor(rnd() * CFG.colors.length)] });
    x += len + 0.35 + (rnd() > 0.85 ? 6 + rnd() * 10 : 0);
  }
}
const inst = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 2.59, 2.44), new THREE.MeshStandardMaterial({ map: ribTex, roughness: 0.85, metalness: 0.05 }), boxes.length);
const m4 = new THREE.Matrix4(), col = new THREE.Color();
boxes.forEach((b, i) => {
  m4.compose(new THREE.Vector3(b.x, b.y, b.z), new THREE.Quaternion(), new THREE.Vector3(b.len, 1, 1));
  inst.setMatrixAt(i, m4);
  inst.setColorAt(i, col.set(b.c));
});
scene.add(inst);

const craneMat = new THREE.MeshStandardMaterial({ color: CFG.crane, roughness: 0.9 });
const beam = (w, h, d, x, y, z, parent) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), craneMat); m.position.set(x, y, z); parent.add(m); return m; };
function crane(x, z, s) {
  const g = new THREE.Group();
  for (const lx of [-9, 9]) for (const lz of [-7, 7]) beam(1.1, 44, 1.1, lx, 22, lz, g);
  beam(20, 1.4, 1.4, 0, 44, -7, g); beam(20, 1.4, 1.4, 0, 44, 7, g);
  beam(1.4, 1.6, 86, 0, 47, 18, g);
  beam(1.2, 18, 1.2, 0, 54, -4, g);
  const stay = beam(0.5, 0.5, 40, 0, 52, 14, g); stay.rotation.x = -0.32;
  beam(14, 1.2, 1.2, 0, 14, -7, g); beam(14, 1.2, 1.2, 0, 14, 7, g);
  g.position.set(x, 0, z); g.scale.setScalar(s); g.rotation.y = Math.PI;
  scene.add(g);
}
crane(-120, -360, 1.15); crane(-40, -390, 1.15); crane(55, -370, 1.15); crane(150, -400, 1.15);

// yard lamps: tall poles with a warm glow, receding along the lanes (used by the dusk look)
const glowTex = (() => {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const x = c.getContext("2d");
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,214,160,1)"); g.addColorStop(0.18, "rgba(255,190,120,0.55)"); g.addColorStop(1, "rgba(255,170,90,0)");
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
if (CFG.lamps) {
  const poleMat = new THREE.MeshStandardMaterial({ color: "#2a3340", roughness: 0.8 });
  for (const lx of [-33, 33]) for (let z = -14; z > -380; z -= 46) {
    const pole = new THREE.Mesh(new THREE.BoxGeometry(0.4, 26, 0.4), poleMat); pole.position.set(lx, 13, z); scene.add(pole);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.position.set(lx, 26.4, z); s.scale.setScalar(9); scene.add(s);
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.35 }));
    pool.rotation.x = -Math.PI / 2; pool.position.set(lx, 0.05, z); scene.add(pool);
  }
}

// the hanging container's shadow on the ground far below (used by the aerial look)
let shadow = null;
if (CFG.shadowOf) {
  const st = (() => {
    const c = document.createElement("canvas"); c.width = 256; c.height = 128;
    const x = c.getContext("2d");
    const g = x.createRadialGradient(128, 64, 8, 128, 64, 120);
    g.addColorStop(0, "rgba(15,29,43,0.55)"); g.addColorStop(0.5, "rgba(15,29,43,0.25)"); g.addColorStop(1, "rgba(15,29,43,0)");
    x.setTransform(1, 0, 0, 0.5, 0, 32); x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.5), new THREE.MeshBasicMaterial({ map: st, transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.08;
  scene.add(shadow);
}

// ---------- camera, parallax ----------
const camera = new THREE.PerspectiveCamera(CFG.camera.fov, 1, 0.5, 2000);
const C = CFG.camera;
let tx = 0, ty = 0, px = 0, py = 0, raf = 0, w = 0, h = 0;
const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3();

function size() {
  const r = host.getBoundingClientRect();
  w = Math.max(1, Math.round(r.width)); h = Math.max(1, Math.round(r.height));
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w / h < 0.8 ? C.phoneFov : C.fov;
  camera.updateProjectionMatrix();
}
function placeShadow() {
  if (!shadow) return;
  const a = document.querySelector(CFG.shadowOf).getBoundingClientRect(), hr = host.getBoundingClientRect();
  const [ox, oy, sw] = CFG.shadowAt || [0.12, 0.62, 0.7];
  const sx = a.left - hr.left + a.width * (0.5 + ox), sy = a.top - hr.top + a.height * (0.5 + oy);
  ray.setFromCamera(new THREE.Vector2((sx / w) * 2 - 1, -(sy / h) * 2 + 1), camera);
  if (!ray.ray.intersectPlane(plane, hit)) return;
  const d = hit.distanceTo(camera.position);
  const worldPerPx = (2 * d * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / h;
  shadow.position.set(hit.x, 0.08, hit.z);
  shadow.scale.set(a.width * sw * worldPerPx, 1, a.width * sw * worldPerPx);
}
function frame() {
  raf = 0;
  if (scrollY > innerHeight * 1.4) return;
  px += (tx - px) * 0.08; py += (ty - py) * 0.08;
  const sp = still ? 0 : Math.min(1, scrollY / innerHeight);
  camera.position.set(C.x + px * CFG.parallax[0], C.y + py * CFG.parallax[1] + sp * 5, C.z - sp * 10);
  camera.lookAt(C.lx + px * 1.2, C.ly - sp * 2, C.lz);
  camera.updateMatrixWorld();
  placeShadow();
  renderer.render(scene, camera);
  if (Math.abs(tx - px) > 0.001 || Math.abs(ty - py) > 0.001) ask();
}
const ask = () => { if (!raf) raf = requestAnimationFrame(frame); };
if (!still) {
  addEventListener("pointermove", (e) => { tx = (e.clientX / innerWidth - 0.5) * 2; ty = (e.clientY / innerHeight - 0.5) * 2; ask(); }, { passive: true });
  addEventListener("scroll", ask, { passive: true });
}
addEventListener("resize", () => { size(); ask(); });
size();
frame();
document.querySelector(".hero").classList.add("has-yard");

window.__yard = { renderNow() { frame(); return canvas; }, boxes: boxes.length };
