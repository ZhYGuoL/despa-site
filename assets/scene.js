// The container: a 20 ft shipping container drawn live with three.js.
// It sits in the hero, is lowered onto the document band as you scroll, opens its doors,
// and the shipment's four documents come out and line up. Scroll is the only clock: nothing moves on its own.
// Positions come from invisible anchor elements in the page ([data-anchor]), so CSS owns the layout.

import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const root = document.documentElement;
const canvas = document.getElementById("scene");
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
} catch (e) {
  root.classList.add("no-3d");
  throw e;
}
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.5;
scene.add(new THREE.HemisphereLight(0xfffaf0, 0xb8b0a0, 1.1));
const sun = new THREE.DirectionalLight(0xffffff, 2.4);
sun.position.set(-700, 1100, 900);
scene.add(sun);
const fill = new THREE.DirectionalLight(0xfff1e6, 0.6);
fill.position.set(900, -200, 600);
scene.add(fill);

const camera = new THREE.PerspectiveCamera(22, 1, 1, 10000);

// ---------- materials ----------
const ORANGE = 0xff5b1f;
const paint = new THREE.MeshStandardMaterial({ color: ORANGE, roughness: 0.55, metalness: 0.15 });
const framePaint = new THREE.MeshStandardMaterial({ color: 0xe8501a, roughness: 0.6, metalness: 0.15 });
const steel = new THREE.MeshStandardMaterial({ color: 0xc4c8cc, roughness: 0.35, metalness: 0.85 });
const casting = new THREE.MeshStandardMaterial({ color: 0x2b2f33, roughness: 0.7, metalness: 0.4 });
const inside = new THREE.MeshStandardMaterial({ color: 0x5a524a, roughness: 0.95, metalness: 0, side: THREE.BackSide });
const wood = new THREE.MeshStandardMaterial({ color: 0x7a5636, roughness: 0.9 });

// ---------- geometry ----------
// Real 20 ft outside dimensions, metres.
const L = 6.058, W = 2.438, H = 2.591;

// A corrugated wall panel: trapezoid profile along x, extruded up y, peaks facing +z.
// UVs are planar (x along u, y along v) so a painted mark follows the corrugation.
function corrugated(len, height, pitch, amp, thick) {
  const s = new THREE.Shape();
  const n = Math.max(1, Math.round(len / pitch));
  const p = len / n;
  const x0 = -len / 2;
  s.moveTo(x0, -thick);
  s.lineTo(x0, 0);
  for (let i = 0; i < n; i++) {
    const a = x0 + i * p;
    s.lineTo(a + p * 0.12, 0);
    s.lineTo(a + p * 0.32, amp);
    s.lineTo(a + p * 0.62, amp);
    s.lineTo(a + p * 0.82, 0);
  }
  s.lineTo(x0 + len, 0);
  s.lineTo(x0 + len, -thick);
  s.lineTo(x0, -thick);
  const g = new THREE.ExtrudeGeometry(s, { depth: height, bevelEnabled: false, curveSegments: 1 });
  g.rotateX(Math.PI / 2);
  g.translate(0, height / 2, 0);
  const pos = g.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = (pos.getX(i) + len / 2) / len;
    uv[i * 2 + 1] = (pos.getY(i) + height / 2) / height;
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return g;
}
const boxM = (w, h, d, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  return m;
};

const box = new THREE.Group();      // the container, centred on its own middle
const pose = new THREE.Group();     // carries position/rotation/scale
pose.add(box);
scene.add(pose);

const PANEL_L = L - 0.32, PANEL_H = H - 0.36;
const sideGeo = corrugated(PANEL_L, PANEL_H, 0.278, 0.045, 0.02);
const sideZ = W / 2 - 0.05;
const sideA = new THREE.Mesh(sideGeo, paint); sideA.position.z = sideZ; box.add(sideA);
const sideB = new THREE.Mesh(sideGeo, paint); sideB.rotation.y = Math.PI; sideB.position.z = -sideZ; box.add(sideB);
const endGeo = corrugated(W - 0.32, PANEL_H, 0.3, 0.032, 0.02);
const back = new THREE.Mesh(endGeo, paint); back.rotation.y = -Math.PI / 2; back.position.x = -(L / 2 - 0.05); box.add(back);

// roof with shallow dents, floor, inside lining
box.add(boxM(L - 0.2, 0.04, W - 0.16, paint, 0, H / 2 - 0.05, 0));
for (let i = 0; i < 9; i++) box.add(boxM(0.36, 0.012, W - 0.34, framePaint, -L / 2 + 0.55 + i * ((L - 1.1) / 8), H / 2 - 0.025, 0));
box.add(boxM(L - 0.3, 0.05, W - 0.3, wood, 0, -H / 2 + 0.2, 0));
const lining = new THREE.Mesh(new THREE.BoxGeometry(L - 0.26, H - 0.42, W - 0.26), inside);
lining.position.set(-0.02, -0.01, 0);
box.add(lining);

// frame: corner posts, rails, castings
for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
  box.add(boxM(0.17, H - 0.1, 0.17, framePaint, sx * (L / 2 - 0.085), 0, sz * (W / 2 - 0.085)));
  for (const sy of [-1, 1]) box.add(boxM(0.19, 0.12, 0.17, casting, sx * (L / 2 - 0.09), sy * (H / 2 - 0.06), sz * (W / 2 - 0.085)));
}
for (const sz of [-1, 1]) {
  box.add(boxM(L - 0.36, 0.13, 0.11, framePaint, 0, H / 2 - 0.08, sz * (W / 2 - 0.06)));
  box.add(boxM(L - 0.36, 0.2, 0.13, framePaint, 0, -H / 2 + 0.11, sz * (W / 2 - 0.07)));
}
box.add(boxM(0.12, 0.14, W - 0.36, framePaint, -(L / 2 - 0.06), H / 2 - 0.08, 0));
box.add(boxM(0.14, 0.22, W - 0.36, framePaint, -(L / 2 - 0.07), -H / 2 + 0.12, 0));
box.add(boxM(0.18, 0.28, W - 0.36, framePaint, L / 2 - 0.09, H / 2 - 0.15, 0));   // door header
box.add(boxM(0.18, 0.22, W - 0.36, framePaint, L / 2 - 0.09, -H / 2 + 0.12, 0));  // door sill

// doors: two leaves hinged at the corner posts
const OPEN_Z = W / 2 - 0.17;
const DOOR_W = OPEN_Z - 0.006, DOOR_H = H - 0.52, DOOR_Y = -0.02, DOOR_X = L / 2 - 0.045;
function leaf(sign) {
  // sign +1: hinge at +z, leaf runs toward -z. sign -1: mirror.
  const hinge = new THREE.Group();
  hinge.position.set(DOOR_X, DOOR_Y, sign * OPEN_Z);
  const g = new THREE.Group();
  g.position.z = -sign * DOOR_W / 2;
  hinge.add(g);
  g.add(boxM(0.045, DOOR_H, DOOR_W, paint));
  for (const yy of [-0.36, -0.12, 0.12, 0.36]) g.add(boxM(0.03, 0.05, DOOR_W * 0.94, framePaint, 0.03, yy * DOOR_H * 1.9 / 2, 0));
  for (const zz of [-0.25, 0.25]) {
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, DOOR_H * 1.04, 10), steel);
    rod.position.set(0.075, 0, zz * DOOR_W);
    g.add(rod);
    for (const yy of [-0.47, -0.2, 0.2, 0.47]) g.add(boxM(0.06, 0.05, 0.08, steel, 0.055, yy * DOOR_H, zz * DOOR_W));
    g.add(boxM(0.04, 0.04, 0.32, steel, 0.1, -0.05, zz * DOOR_W + 0.13));
  }
  box.add(hinge);
  return { hinge, face: g };
}
const leafA = leaf(1), leafB = leaf(-1);

// ---------- painted marks ----------
function canvasTex(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.redraw = () => { const x = c.getContext("2d"); x.clearRect(0, 0, w, h); draw(x, w, h); tex.needsUpdate = true; };
  tex.redraw();
  return tex;
}
function drawMark(x, cx, cy, size, color) {
  const bars = [[12, 56.18], [28.1, 70.42], [44.2, 74], [60.3, 70.42], [76.4, 56.18]];
  x.fillStyle = color;
  const k = size / 100;
  for (const [y, w] of bars) { x.beginPath(); x.roundRect(cx + 14 * k, cy + y * k, w * k, 11.6 * k, 2.5 * k); x.fill(); }
}
// side: "despa" in white, on the corrugation
const sideTex = canvasTex(2560, 1024, (x, w, h) => {
  const s = 300;
  const cy = h * 0.30;
  drawMark(x, 360, cy, s, "#ffffff");
  x.fillStyle = "#ffffff";
  x.font = `600 ${s * 1.02}px Geist, Helvetica, Arial, sans-serif`;
  x.textBaseline = "alphabetic";
  try { x.letterSpacing = `${-s * 0.03}px`; } catch {}
  x.fillText("despa", 360 + s * 0.98, cy + s * 0.86);
});
const decalMat = new THREE.MeshStandardMaterial({ map: sideTex, transparent: true, roughness: 0.6, metalness: 0.1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
const sideMark = new THREE.Mesh(sideGeo, decalMat);
sideMark.position.z = sideZ + 0.002;
box.add(sideMark);

// door code, ISO 6346: owner DSP, category U, serial 241170, check digit computed
function iso6346(code) {
  const v = {}; let n = 10;
  for (const ch of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") { if (n % 11 === 0) n++; v[ch] = n++; }
  let sum = 0;
  [...code].forEach((ch, i) => { sum += (/\d/.test(ch) ? +ch : v[ch]) * 2 ** i; });
  return (sum % 11) % 10;
}
const CODE = "DSPU241170";
const codeTex = canvasTex(1024, 512, (x) => {
  x.fillStyle = "#ffffff";
  x.font = `500 96px "Geist Mono", Menlo, monospace`;
  x.fillText(`${CODE.slice(0, 4)} ${CODE.slice(4)}`, 40, 150);
  x.lineWidth = 6; x.strokeStyle = "#ffffff";
  const d = String(iso6346(CODE));
  x.strokeRect(40 + x.measureText(`${CODE.slice(0, 4)} ${CODE.slice(4)} `).width - 6, 64, 80, 108);
  x.fillText(d, 40 + x.measureText(`${CODE.slice(0, 4)} ${CODE.slice(4)} `).width + 4, 150);
  x.fillText("22G1", 40, 290);
  x.font = `400 44px "Geist Mono", Menlo, monospace`;
  x.fillText("MAX GROSS  30,480 KG", 40, 400);
  x.fillText("TARE        2,200 KG", 40, 456);
});
const codePlane = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.43), new THREE.MeshStandardMaterial({ map: codeTex, transparent: true, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -2 }));
codePlane.rotation.y = Math.PI / 2;
codePlane.position.set(0.025, DOOR_H * 0.3, 0.02);
leafB.face.add(codePlane);

// soft contact shadow under the box
const shadowTex = canvasTex(256, 256, (x, w, h) => {
  const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, "rgba(15,29,43,0.55)"); g.addColorStop(0.55, "rgba(15,29,43,0.22)"); g.addColorStop(1, "rgba(15,29,43,0)");
  x.fillStyle = g; x.fillRect(0, 0, w, h);
});
const shadow = new THREE.Mesh(new THREE.PlaneGeometry(L * 1.35, W * 2.1), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.55 }));
shadow.rotation.x = -Math.PI / 2;
shadow.position.y = -H / 2 - 0.015;
box.add(shadow);

// ---------- the four documents (made-up sample shipment BST-24117) ----------
const DOCS = [
  { title: "COMMERCIAL INVOICE", no: "No. BST-24117", k1: "TO", v1: ["ANDES JUGUETES SPA", "AV. LAS CONDES 9460", "SANTIAGO, CHILE"], k2: "TERMS · PORT OF LOADING", v2: ["FOB · NINGBO, CHINA"], head: ["DESCRIPTION", "CTNS", "AMOUNT"], rows: [["PLUSH TOYS", "520", "18,720.00"], ["WOODEN PUZZLES", "380", "9,880.00"], ["KITES", "340", "4,420.00"]], total: ["TOTAL", "1,240", "33,020.00"] },
  { title: "PACKING LIST", no: "No. BST-24117", k1: "TO", v1: ["ANDES JUGUETES SPA", "AV. LAS CONDES 9460", "SANTIAGO, CHILE"], k2: "", v2: [], head: ["DESCRIPTION", "CTNS", "G.W. (KGS)"], rows: [["PLUSH TOYS", "520", "3,420.000"], ["WOODEN PUZZLES", "380", "4,980.000"], ["KITES", "340", "2,466.000"]], total: ["TOTAL", "1,240", "10,866.000"], flag: true },
  { title: "BILL OF LADING", no: "B/L No. NGBVAP2411", k1: "CONSIGNEE", v1: ["ANDES JUGUETES SPA", "AV. LAS CONDES 9460", "OF. 1204", "SANTIAGO, CHILE"], k2: "PORT OF DISCHARGE", v2: ["SAN ANTONIO, CHILE"], head: ["GOODS", "PKGS", "G.W."], rows: [["PLUSH TOYS / WOODEN PUZZLES", "1,240", "8,655.000"]], total: null },
  { title: "CERTIFICATE OF ORIGIN", no: "FORM F · BST-24117", k1: "EXPORTER", v1: ["NINGBO, CHINA"], k2: "CONSIGNEE", v2: ["ANDES JUGUETES SPA", "SANTIAGO, CHILE"], head: ["DESCRIPTION OF GOODS", "", "H.S."], rows: [["PLUSH TOYS", "", "9503.00"], ["WOODEN PUZZLES", "", "9503.00"]], total: null },
];
const DOC_W = 1.5, DOC_H = DOC_W * 297 / 210;
function drawDoc(d) {
  return (x, w, h) => {
    x.fillStyle = "#ffffff"; x.fillRect(0, 0, w, h);
    const m = 44; let y = 76;
    x.fillStyle = "#1b1b1b";
    x.font = `700 30px "Times New Roman", Times, serif`;
    x.fillText(d.title, m, y);
    x.font = `400 18px "Times New Roman", Times, serif`;
    x.textAlign = "right"; x.fillText(d.no, w - m, y); x.textAlign = "left";
    y += 16; x.fillRect(m, y, w - 2 * m, 3);
    const block = (k, vs) => {
      if (!k) return;
      y += 38; x.fillStyle = "#777"; x.font = `400 14px "Times New Roman", Times, serif`; x.fillText(k, m, y);
      x.fillStyle = "#1b1b1b"; x.font = `400 18px "Times New Roman", Times, serif`;
      for (const v of vs) { y += 24; x.fillText(v, m, y); }
    };
    block(d.k1, d.v1); block(d.k2, d.v2);
    y += 34;
    const cols = [m, w - m - 220, w - m];
    const rowH = 34;
    const line = () => { x.fillStyle = "#d4d4d4"; x.fillRect(m, y, w - 2 * m, 1.5); };
    line();
    x.fillStyle = "#f3f3f3"; x.fillRect(m, y + 1.5, w - 2 * m, rowH - 1.5);
    x.fillStyle = "#1b1b1b"; x.font = `700 13px "Times New Roman", Times, serif`;
    const cell = (r) => { x.textAlign = "left"; x.fillText(r[0], cols[0] + 8, y + 23); x.textAlign = "right"; x.fillText(r[1], cols[1] + 60, y + 23); x.fillText(r[2], cols[2] - 8, y + 23); x.textAlign = "left"; };
    cell(d.head); y += rowH; line();
    x.font = `400 16px "Times New Roman", Times, serif`;
    for (const r of d.rows) { x.fillStyle = "#1b1b1b"; cell(r); y += rowH; line(); }
    if (d.total) {
      x.font = `700 16px "Times New Roman", Times, serif`; x.fillStyle = "#1b1b1b"; cell(d.total);
      if (d.flag) {
        const tw = x.measureText(d.total[2]).width;
        x.fillStyle = "rgba(217,45,32,0.12)"; x.fillRect(cols[2] - 8 - tw - 8, y + 4, tw + 16, rowH - 8);
        x.strokeStyle = "#d92d20"; x.lineWidth = 3; x.strokeRect(cols[2] - 8 - tw - 8, y + 4, tw + 16, rowH - 8);
      }
      y += rowH; line();
    }
    // the rest of the page: grey text lines
    x.fillStyle = "#e6e6e6";
    for (let i = 0; i < 7 && y < h - 120; i++) { y += 28; x.fillRect(m, y, (w - 2 * m) * (i % 3 === 2 ? 0.55 : 0.9), 9); }
    x.fillStyle = "#999"; x.font = `400 13px "Times New Roman", Times, serif`; x.textAlign = "right";
    x.fillText(d.title === "PACKING LIST" || d.title === "COMMERCIAL INVOICE" ? "PAGE 2 / 2" : "PAGE 1 / 1", w - m, h - 40); x.textAlign = "left";
  };
}
const docGeo = new THREE.PlaneGeometry(DOC_W, DOC_H);
const docs = DOCS.map((d) => {
  const tex = canvasTex(600, 848, drawDoc(d));
  const m = new THREE.Mesh(docGeo, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, metalness: 0, side: THREE.DoubleSide }));
  m.visible = false;
  scene.add(m);
  return { mesh: m, tex };
});
document.fonts.ready.then(() => { sideTex.redraw(); codeTex.redraw(); docs.forEach((d) => d.tex.redraw()); frame(); });

// ---------- choreography ----------
const $ = (s) => document.querySelector(s);
const heroA = $('[data-anchor="hero"]'), landA = $('[data-anchor="land"]');
const docAs = [0, 1, 2, 3].map((i) => $(`[data-anchor="doc${i}"]`));
const stage = $("[data-stage]"), land = $(".land"), names = $(".docs-names");

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const lerp = (a, b, t) => a + (b - a) * t;

const HERO_POSE = { rx: 0.34, ry: -0.6 };
const LAND_POSE = { rx: 0.14, ry: -0.98 };
let vw = 0, vh = 0;

function resize() {
  vw = innerWidth; vh = innerHeight;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setSize(vw, vh, false);
  camera.aspect = vw / vh;
  camera.fov = 22;
  camera.position.set(0, 0, (vh / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
  camera.near = 10; camera.far = camera.position.z * 3;
  camera.updateProjectionMatrix();
}

// screen rect -> scale that fits the box in it
// Projected footprint of the rotated box, so it fills the anchor without spilling out of it.
const fitScale = (r, rx, ry) => {
  const pw = L * Math.abs(Math.cos(ry)) + W * Math.abs(Math.sin(ry));
  const ph = H * Math.cos(rx) + (L * Math.abs(Math.sin(ry)) + W * Math.abs(Math.cos(ry))) * Math.sin(rx);
  return Math.min((r.width * 0.86) / pw, (r.height * 0.86) / ph);
};
const toWorld = (cx, cy, z = 0) => new THREE.Vector3(cx - vw / 2, vh / 2 - cy, z);

const state = { p: 0, q: 0, door: 0 };
const qTmp = new THREE.Quaternion(), qDocIn = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
const v1 = new THREE.Vector3(), v2 = new THREE.Vector3();

function update() {
  const heroR = heroA.getBoundingClientRect();
  const aR = landA.getBoundingClientRect();
  const sR = stage.getBoundingClientRect();
  const landTop = land.getBoundingClientRect().top + scrollY;
  const p = still ? 0 : clamp(scrollY / Math.max(1, landTop));
  const q = still ? 0 : clamp((scrollY - landTop) / Math.max(1, land.offsetHeight - vh));
  state.p = p; state.q = q;

  // where the box is on screen
  let cx, cy, sc, rx, ry, rz = 0;
  const pinned = { cx: aR.left + aR.width / 2, cy: aR.top - sR.top + aR.height / 2 };
  const heroC = { cx: heroR.left + heroR.width / 2, cy: heroR.top + heroR.height / 2 };
  if (p < 1) {
    const e = ease(p);
    cx = lerp(heroC.cx, pinned.cx, e);
    cy = lerp(heroC.cy, pinned.cy, e);
    sc = lerp(fitScale(heroR, HERO_POSE.rx, HERO_POSE.ry), fitScale(aR, LAND_POSE.rx, LAND_POSE.ry), e);
    rx = lerp(HERO_POSE.rx, LAND_POSE.rx, e);
    ry = lerp(HERO_POSE.ry, LAND_POSE.ry, e);
    rz = Math.sin(Math.PI * p) * 0.06;          // a little swing on the way down, like a crane load
  } else {
    cx = aR.left + aR.width / 2;
    cy = aR.top + aR.height / 2;
    sc = fitScale(aR, LAND_POSE.rx, LAND_POSE.ry);
    rx = LAND_POSE.rx;
    ry = LAND_POSE.ry - 0.12 * smooth(0, 0.2, q);   // turn the doors toward you
  }
  pose.position.copy(toWorld(cx, cy));
  pose.rotation.set(rx, ry, rz);
  pose.scale.setScalar(sc);

  // doors
  const door = smooth(0.1, 0.42, q);
  state.door = door;
  leafA.hinge.rotation.y = -door * Math.PI * 0.8;
  leafB.hinge.rotation.y = door * Math.PI * 0.8;

  // documents: out of the doors, up into a row
  pose.updateMatrixWorld(true);
  pose.getWorldQuaternion(qTmp);
  let last = 0;
  docs.forEach((d, i) => {
    const t = smooth(0.34 + i * 0.07, 0.68 + i * 0.07, q);
    last = t;
    d.mesh.visible = t > 0.001 && door > 0.3;
    if (!d.mesh.visible) return;
    const r = docAs[i].getBoundingClientRect();
    const end = toWorld(r.left + r.width / 2, r.top + r.height / 2, 60);
    const start = v1.set(L / 2 - 0.9 - i * 0.12, -0.05, (i - 1.5) * 0.14).applyMatrix4(pose.matrixWorld);
    const mid = v2.set(L / 2 + 2.6, 0.6, (i - 1.5) * 0.35).applyMatrix4(pose.matrixWorld);
    const e = ease(t);
    const a = start.clone().lerp(mid, e), b = mid.clone().lerp(end, e);
    d.mesh.position.copy(a.lerp(b, e));
    const qStart = qTmp.clone().multiply(qDocIn);
    const qEnd = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), (i - 1.5) * -0.025);
    d.mesh.quaternion.slerpQuaternions(qStart, qEnd, e);
    d.mesh.scale.setScalar(lerp(sc, r.width / DOC_W, e));
  });
  stage.style.setProperty("--names", smooth(0.85, 1, last).toFixed(3));
  stage.style.setProperty("--head", (1 - smooth(0.2, 0.36, q)).toFixed(3));
}

let raf = 0, shown = false;
function frame() {
  raf = 0;
  update();
  renderer.render(scene, camera);
  if (!shown) { shown = true; root.classList.remove("no-3d"); }
}
const ask = () => { if (!raf) raf = requestAnimationFrame(frame); };
addEventListener("scroll", ask, { passive: true });
addEventListener("resize", () => { resize(); ask(); });
addEventListener("despa:lang", ask);
resize();
frame();

// For checks and for making the static poster (assets/container.png).
window.__despa = {
  state,
  renderNow() { update(); renderer.render(scene, camera); return canvas; },
  poster(w = 1600, h = 1000) {
    const keep = [vw, vh];
    renderer.setPixelRatio(1); renderer.setSize(w, h, false);
    vw = w; vh = h;
    camera.aspect = w / h; camera.position.set(0, 0, (h / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))); camera.far = camera.position.z * 3; camera.updateProjectionMatrix();
    pose.position.set(0, h * 0.04, 0); pose.rotation.set(HERO_POSE.rx, HERO_POSE.ry, 0); pose.scale.setScalar(0.9 * fitScale({ width: w, height: h }, HERO_POSE.rx, HERO_POSE.ry));
    leafA.hinge.rotation.y = 0; leafB.hinge.rotation.y = 0; docs.forEach((d) => (d.mesh.visible = false));
    renderer.render(scene, camera);
    const url = canvas.toDataURL("image/png");
    [vw, vh] = keep; resize(); frame();
    return url;
  },
};
