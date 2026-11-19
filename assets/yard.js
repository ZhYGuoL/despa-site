// The hero's back layer: a container yard in haze, behind the headline.
// Depth comes from three things: atmospheric perspective (fog to the sky colour), a real ground plane in perspective,
// and parallax (the camera drifts a little with the pointer and with scroll). Nothing moves on its own.

import * as THREE from "three";

const hero = document.querySelector(".hero");
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

const HAZE = new THREE.Color("#ebe5d7");   // the horizon: fog and the bottom of the sky are this colour
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(HAZE, -50, 290);

// sky: a vertical gradient on a big sphere, so the horizon line lands wherever the camera puts it
const skyTex = (() => {
  const c = document.createElement("canvas"); c.width = 4; c.height = 512;
  const x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, "#d9dfe0");
  g.addColorStop(0.42, "#ece9e0");
  g.addColorStop(0.5, "#ebe5d7");
  g.addColorStop(1, "#ebe5d7");
  x.fillStyle = g; x.fillRect(0, 0, 4, 512);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false, depthWrite: false }));
scene.add(sky);

scene.add(new THREE.HemisphereLight(0xf6f1e6, 0x9d9584, 1.5));
const sun = new THREE.DirectionalLight(0xfff3df, 2.2);
sun.position.set(-60, 80, 40);
scene.add(sun);

// ground: paved yard, a touch darker than the haze, with faint lane lines
const ground = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400), new THREE.MeshStandardMaterial({ color: "#d9d2c2", roughness: 1 }));
ground.rotation.x = -Math.PI / 2;
scene.add(ground);
const laneMat = new THREE.MeshBasicMaterial({ color: "#f3efe6" });
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

// corrugation: vertical stripes, multiplied by each box's own colour
const ribTex = (() => {
  const c = document.createElement("canvas"); c.width = 256; c.height = 8;
  const x = c.getContext("2d");
  for (let i = 0; i < 32; i++) { x.fillStyle = i % 2 ? "#ffffff" : "#d8d8d8"; x.fillRect(i * 8, 0, 8, 8); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
})();

// stacks: rows of 40 ft and 20 ft boxes, 1-4 high, receding into the haze. Seeded so the yard is the same every visit.
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const COLORS = ["#a3afb6", "#bcc4c0", "#cbbba3", "#b5a69b", "#9caab5", "#d2c8b7", "#aab7ae", "#c4a593", "#93a2ae", "#d6b796"];
const boxes = [];
for (let row = 0; row < 14; row++) {
  const z = -38 - row * 22 - rnd() * 4;
  for (let x = -210; x < 210;) {
    const forty = rnd() > 0.35;
    const len = forty ? 12.19 : 6.06;
    if (Math.abs(x + len / 2) < 9 && row < 3) { x += 18; continue; }   // keep an aisle in the middle near the camera
    const h = 1 + Math.floor(rnd() * (row < 2 ? 3 : 4));
    for (let k = 0; k < h; k++) boxes.push({ x: x + len / 2, y: 1.3 + k * 2.6, z: z + (rnd() - 0.5) * 0.4, len, c: COLORS[Math.floor(rnd() * COLORS.length)] });
    x += len + 0.35 + (rnd() > 0.85 ? 6 + rnd() * 10 : 0);
  }
}
const boxGeo = new THREE.BoxGeometry(1, 2.59, 2.44);
const boxMat = new THREE.MeshStandardMaterial({ map: ribTex, roughness: 0.85, metalness: 0.05 });
const inst = new THREE.InstancedMesh(boxGeo, boxMat, boxes.length);
const m4 = new THREE.Matrix4(), col = new THREE.Color();
boxes.forEach((b, i) => {
  m4.compose(new THREE.Vector3(b.x, b.y, b.z), new THREE.Quaternion(), new THREE.Vector3(b.len, 1, 1));
  inst.setMatrixAt(i, m4);
  inst.setColorAt(i, col.set(b.c));
});
scene.add(inst);

// ship-to-shore gantry cranes on the far quay
const craneMat = new THREE.MeshStandardMaterial({ color: "#8d9493", roughness: 0.9 });
const beam = (w, h, d, x, y, z, parent) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), craneMat); m.position.set(x, y, z); parent.add(m); return m; };
function crane(x, z, s) {
  const g = new THREE.Group();
  for (const lx of [-9, 9]) for (const lz of [-7, 7]) beam(1.1, 44, 1.1, lx, 22, lz, g);
  beam(20, 1.4, 1.4, 0, 44, -7, g); beam(20, 1.4, 1.4, 0, 44, 7, g);
  beam(1.4, 1.6, 86, 0, 47, 18, g);                       // the boom, reaching over the water
  beam(1.2, 18, 1.2, 0, 54, -4, g);                       // apex
  const stay = beam(0.5, 0.5, 40, 0, 52, 14, g); stay.rotation.x = -0.32;
  beam(14, 1.2, 1.2, 0, 14, -7, g); beam(14, 1.2, 1.2, 0, 14, 7, g);
  g.position.set(x, 0, z); g.scale.setScalar(s); g.rotation.y = Math.PI;
  scene.add(g);
}
crane(-120, -360, 1.15); crane(-40, -390, 1.15); crane(55, -370, 1.15); crane(150, -400, 1.15);

// ---------- camera, parallax ----------
const camera = new THREE.PerspectiveCamera(30, 1, 0.5, 2000);
const BASE = { x: 0, y: 9, z: 34 }, LOOK = new THREE.Vector3(0, 1.6, -80);
let tx = 0, ty = 0, px = 0, py = 0, raf = 0, w = 0, h = 0;

function size() {
  const r = hero.getBoundingClientRect();
  w = Math.max(1, Math.round(r.width)); h = Math.max(1, Math.round(r.height));
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w / h < 0.8 ? 46 : 30;    // phones: wider lens so the yard still reads
  camera.updateProjectionMatrix();
}
function frame() {
  raf = 0;
  const visible = scrollY < innerHeight * 1.4;
  if (!visible) return;
  // ease the pointer toward its target; keep asking for frames until it settles
  px += (tx - px) * 0.08; py += (ty - py) * 0.08;
  const sp = still ? 0 : Math.min(1, scrollY / innerHeight);
  camera.position.set(BASE.x + px * 3.2, BASE.y + py * 1.4 + sp * 5, BASE.z - sp * 10);
  camera.lookAt(LOOK.x + px * 1.2, LOOK.y - sp * 2, LOOK.z);
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
hero.classList.add("has-yard");

window.__yard = { renderNow() { frame(); return canvas; }, boxes: boxes.length };
