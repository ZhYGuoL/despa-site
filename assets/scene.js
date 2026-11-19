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
renderer.toneMappingExposure = (window.SCENE && window.SCENE.exposure) || 1.0;

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
box.add(boxM(L - 0.34, 0.05, W - 0.34, wood, -0.02, -H / 2 + 0.2, 0));
const lining = new THREE.Mesh(new THREE.BoxGeometry(L - 0.26, H - 0.42, W - 0.26), inside);
lining.position.set(-0.02, -0.01, 0);
box.add(lining);

// frame: corner posts, rails, castings
for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
  box.add(boxM(0.17, H - 0.1, 0.17, framePaint, sx * (L / 2 - 0.085), 0, sz * (W / 2 - 0.085)));
  // corner castings stand 12 mm proud of every frame face, so no face of theirs shares a plane with the posts (no z-fighting)
  for (const sy of [-1, 1]) box.add(boxM(0.2, 0.13, 0.2, casting, sx * (L / 2 + 0.012 - 0.1), sy * (H / 2 + 0.012 - 0.065), sz * (W / 2 + 0.012 - 0.1)));
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

// spreader and crane cables: the box hangs from them in the hero, and they let go as it lands
const rigMat = new THREE.MeshStandardMaterial({ color: 0x3a4148, roughness: 0.6, metalness: 0.5, transparent: true });
const spreader = new THREE.Group();
spreader.add(boxM(L * 0.94, 0.16, 0.16, rigMat, 0, 0, W * 0.4));
spreader.add(boxM(L * 0.94, 0.16, 0.16, rigMat, 0, 0, -W * 0.4));
spreader.add(boxM(0.22, 0.2, W * 0.88, rigMat, 0, 0.02, 0));
for (const sx of [-1, 1]) spreader.add(boxM(0.2, 0.18, W * 0.88, rigMat, sx * L * 0.45, 0, 0));
spreader.position.y = H / 2 + 0.34;
box.add(spreader);
const RIG = [[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b]) => new THREE.Vector3(a * L * 0.38, H / 2 + 0.42, b * W * 0.4));
const cableGeo = new THREE.BufferGeometry();
cableGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(8 * 3), 3));
const cableMat = new THREE.LineBasicMaterial({ color: 0x2b333b, transparent: true });
const cables = new THREE.LineSegments(cableGeo, cableMat);
cables.frustumCulled = false;
scene.add(cables);

// ---------- the four documents ----------
// Drawn as characters, not as legible forms: each one is a single picture and one value you can read
// at the size it ends up on screen. The HTML labels under the row name them (and translate).
const INK = "#0f1d2b", GREY = "#858c95", BAR = "#e4e0d6";
const DOC_W = 1.5, DOC_H = DOC_W * 297 / 210;
const TW = 1024, TH = 1448;
const rr = (x, X, Y, w, h, r) => { x.beginPath(); x.roundRect(X, Y, w, h, r); };
function paperBase(x, ref) {
  x.fillStyle = "#fffdf8"; x.fillRect(0, 0, TW, TH);
  x.strokeStyle = "rgba(15,29,43,0.14)"; x.lineWidth = 6; x.strokeRect(3, 3, TW - 6, TH - 6);
  x.fillStyle = GREY; x.font = `500 46px "Geist Mono", Menlo, monospace`; x.textBaseline = "alphabetic";
  x.fillText(ref, 80, 128);
  // the rest of the page, as plain bars
  x.fillStyle = BAR;
  [[0.82, 1170], [0.64, 1222], [0.74, 1274], [0.4, 1326]].forEach(([f, y]) => { rr(x, 80, y, (TW - 160) * f, 24, 12); x.fill(); });
}
function keyValue(x, text, y, flag) {
  x.font = `500 ${text.length > 9 ? 104 : 120}px "Geist Mono", Menlo, monospace`;
  const w = x.measureText(text).width;
  if (flag) {
    x.fillStyle = "#fbe7e4"; rr(x, 64, y - 112, w + 48, 148, 18); x.fill();
    x.strokeStyle = "#d92d20"; x.lineWidth = 10; rr(x, 64, y - 112, w + 48, 148, 18); x.stroke();
  }
  x.fillStyle = flag ? "#b4231a" : INK;
  x.fillText(text, 88, y);
}
const DOCS = [
  { // commercial invoice: line items and a total
    draw(x) {
      paperBase(x, "BST-24117");
      x.fillStyle = INK;
      for (let i = 0; i < 4; i++) {
        const y = 250 + i * 110;
        x.fillStyle = INK; rr(x, 80, y, [430, 360, 300, 0][i] || 0, 34, 17); x.fill();
        rr(x, TW - 80 - [190, 150, 170, 0][i], y, [190, 150, 170, 0][i], 34, 17); x.fill();
        x.fillStyle = BAR; x.fillRect(80, y + 70, TW - 160, 5);
      }
      x.fillStyle = INK; x.fillRect(80, 640, TW - 160, 12);
      rr(x, 80, 690, 220, 44, 22); x.fill(); rr(x, TW - 80 - 300, 690, 300, 44, 22); x.fill();
      keyValue(x, "US$ 33,020", 960, false);
    },
  },
  { // packing list: cartons, and the gross weight that is wrong
    draw(x) {
      paperBase(x, "BST-24117");
      const s = 200, g = 44, x0 = (TW - (3 * s + 2 * g)) / 2;
      for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
        const X = x0 + c * (s + g), Y = 230 + r * (s + g);
        x.fillStyle = r === 0 && c === 1 ? INK : "#efe9dc"; rr(x, X, Y, s, s, 16); x.fill();
        x.strokeStyle = INK; x.lineWidth = 10; rr(x, X, Y, s, s, 16); x.stroke();
        x.fillStyle = r === 0 && c === 1 ? "#fffdf8" : INK; x.fillRect(X + s / 2 - 14, Y, 28, s * 0.42);
      }
      keyValue(x, "10,866 KG", 960, true);
    },
  },
  { // bill of lading: the ship, and its B/L number with a barcode
    draw(x) {
      paperBase(x, "B/L");
      x.fillStyle = INK;
      const cw = 118, ch = 74, bx = 214;
      const shades = [INK, "#ff5b1f", INK, "#5b6672", "#5b6672", INK, "#ff5b1f", INK];
      for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) {
        x.fillStyle = shades[(r * 5 + c) % shades.length]; rr(x, bx + c * (cw + 8), 300 + r * (ch + 8), cw, ch, 6); x.fill();
      }
      x.fillStyle = INK;
      x.beginPath(); x.moveTo(120, 470); x.lineTo(TW - 120, 470); x.lineTo(TW - 220, 600); x.lineTo(200, 600); x.closePath(); x.fill();
      rr(x, TW - 300, 330, 70, 140, 8); x.fill();
      x.fillStyle = BAR; for (let i = 0; i < 3; i++) { rr(x, 140 + i * 40, 640 + i * 26, TW - 280 - i * 80, 10, 5); x.fill(); }
      x.font = `500 96px "Geist Mono", Menlo, monospace`; x.fillStyle = INK; x.fillText("NGBVAP2411", 88, 930);
      for (let i = 0, X = 88; X < TW - 120; i++) { const w = [6, 14, 6, 22, 10, 6, 18][i % 7]; x.fillRect(X, 980, w, 90); X += w + [10, 8, 14, 8][i % 4]; }
    },
  },
  { // certificate of origin (Form F): the stamp
    draw(x) {
      paperBase(x, "FORM F");
      const cx = TW / 2, cy = 460;
      x.strokeStyle = INK; x.lineWidth = 16; x.beginPath(); x.arc(cx, cy, 230, 0, Math.PI * 2); x.stroke();
      x.lineWidth = 6; x.beginPath(); x.arc(cx, cy, 186, 0, Math.PI * 2); x.stroke();
      x.fillStyle = INK; x.textAlign = "center";
      x.font = `600 128px Geist, Helvetica, Arial, sans-serif`; x.fillText("FTA", cx, cy + 44);
      x.font = `500 44px "Geist Mono", Menlo, monospace`; x.fillText("CHINA", cx, cy - 92); x.fillText("CHILE", cx, cy + 128);
      x.textAlign = "left";
      x.lineWidth = 10; x.lineCap = "round"; x.beginPath(); x.moveTo(300, 820);
      x.bezierCurveTo(360, 740, 420, 900, 480, 800); x.bezierCurveTo(530, 730, 560, 880, 640, 790); x.bezierCurveTo(680, 750, 700, 820, 740, 800); x.stroke();
      keyValue(x, "ORIGIN: CN", 1060, false);
    },
  },
];
const docGeo = new THREE.PlaneGeometry(DOC_W, DOC_H);
const maxAniso = renderer.capabilities.getMaxAnisotropy();
const docs = DOCS.map((d) => {
  const tex = canvasTex(TW, TH, (x) => d.draw(x));
  tex.anisotropy = maxAniso;
  const m = new THREE.Mesh(docGeo, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, metalness: 0, side: THREE.DoubleSide }));
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
  // a tight depth range: everything drawn sits within ~1,600 px of the page plane, so depth precision stays high
  camera.near = Math.max(10, camera.position.z - 1600); camera.far = camera.position.z + 1600;
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
const SWAY = !still && !!(window.SCENE && window.SCENE.sway);
const DOC_IN = 0.74;   // document size inside the box: 1.57 m tall, the door opening is 2.0 m
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
    // optional ambient loop (window.SCENE.sway): the load sways slowly on its cables while it waits in the hero.
    // sine in-out, about 7 s a cycle, under a degree, fades out as the flight starts, off under reduced motion
    if (SWAY) rz += Math.sin(performance.now() / 7000 * Math.PI * 2) * 0.011 * (1 - smooth(0, 0.15, p));
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

  // cables: from the spreader up to one block far above the top of the screen; released between p 0.72 and 0.92
  const rig = 1 - smooth(0.72, 0.92, p);
  rigMat.opacity = rig; cableMat.opacity = rig * 0.85;
  spreader.visible = rig > 0.01; cables.visible = rig > 0.01;
  if (rig > 0.01) {
    pose.updateMatrixWorld(true);
    const apex = new THREE.Vector3(pose.position.x, vh / 2 + vh * 0.9, 0);
    const arr = cableGeo.attributes.position.array;
    RIG.forEach((pt, i) => {
      const w = pt.clone().applyMatrix4(box.matrixWorld);
      const top = apex.clone().add(new THREE.Vector3((pt.x > 0 ? 1 : -1) * 6 * sc / 30, 0, (pt.z > 0 ? 1 : -1) * 4 * sc / 30));
      arr.set([w.x, w.y, w.z, top.x, top.y, top.z], i * 6);
    });
    cableGeo.attributes.position.needsUpdate = true;
  }

  // doors
  const door = smooth(0.1, 0.42, q);
  state.door = door;
  leafA.hinge.rotation.y = -door * Math.PI * 0.8;
  leafB.hinge.rotation.y = door * Math.PI * 0.8;

  // documents. Two legs so they never cut through the box:
  // 1) slide straight out along the container's own axis, small enough to clear the door header;
  // 2) once clear of the doors and in front of the box, rise and turn to face you, ending in the row.
  pose.updateMatrixWorld(true);
  pose.getWorldQuaternion(qTmp);
  const D = camera.position.z;
  const front = ((L / 2) * Math.abs(Math.sin(ry)) + (W / 2) * Math.abs(Math.cos(ry))) * Math.cos(rx) + (H / 2) * Math.sin(rx);
  const zEnd = (front + 0.45) * sc;
  const qStart = qTmp.clone().multiply(qDocIn);
  let last = 0;
  docs.forEach((d, i) => {
    const t = smooth(0.34 + i * 0.07, 0.76 + i * 0.07, q);
    last = t;
    d.mesh.visible = t > 0.001 && door > 0.6;
    if (!d.mesh.visible) return;
    const t1 = ease(clamp(t / 0.38)), t2 = ease(clamp((t - 0.38) / 0.62));
    const zl = (i - 1.5) * 0.16;
    const xIn = L / 2 - 1.1 - i * 0.2, xOut = L / 2 + 1.6;
    const r = docAs[i].getBoundingClientRect();
    const f = (D - zEnd) / D;
    const end = new THREE.Vector3((r.left + r.width / 2 - vw / 2) * f, (vh / 2 - (r.top + r.height / 2)) * f, zEnd);
    const endScale = (r.width / DOC_W) * f;
    const out = v2.set(xOut, -0.1, zl).applyMatrix4(pose.matrixWorld).clone();
    if (t2 === 0) {
      d.mesh.position.copy(v1.set(lerp(xIn, xOut, t1), -0.1, zl).applyMatrix4(pose.matrixWorld));
      d.mesh.quaternion.copy(qStart);
      d.mesh.scale.setScalar(sc * DOC_IN);
    } else {
      const ctrl = new THREE.Vector3(out.x, end.y, Math.max(out.z, zEnd));
      const a1 = out.clone().lerp(ctrl, t2), b1 = ctrl.clone().lerp(end, t2);
      d.mesh.position.copy(a1.lerp(b1, t2));
      const qEnd = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), (i - 1.5) * -0.02);
      d.mesh.quaternion.slerpQuaternions(qStart, qEnd, t2);
      d.mesh.scale.setScalar(lerp(sc * DOC_IN, endScale, t2));
    }
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
  if (SWAY && state.p < 0.15) ask();
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
  // Coplanar check: pairs of box parts whose same-facing faces sit within 3 mm of each other and overlap (z-fighting).
  coplanar() {
    const parts = [];
    box.children.forEach((m) => {
      if (!m.isMesh || m.geometry.type !== "BoxGeometry" || m.rotation.x || m.rotation.y || m.rotation.z) return;
      const p = m.geometry.parameters, c = m.position;
      parts.push({ name: m.material === casting ? "casting" : m.material === framePaint ? "frame" : m.material === paint ? "paint" : "other",
        min: [c.x - p.width / 2, c.y - p.height / 2, c.z - p.depth / 2], max: [c.x + p.width / 2, c.y + p.height / 2, c.z + p.depth / 2] });
    });
    const hits = [];
    for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) {
      const a = parts[i], b = parts[j];
      for (let ax = 0; ax < 3; ax++) for (const side of ["min", "max"]) {
        if (Math.abs(a[side][ax] - b[side][ax]) > 0.003) continue;
        const o = [0, 1, 2].filter((k) => k !== ax);
        const ov = o.every((k) => Math.min(a.max[k], b.max[k]) - Math.max(a.min[k], b.min[k]) > 0.001);
        if (ov) hits.push(`${a.name}#${i} vs ${b.name}#${j} on ${"xyz"[ax]}.${side}`);
      }
    }
    return hits;
  },
  clip() {
    update();
    box.updateMatrixWorld(true);
    const inv = box.matrixWorld.clone().invert();
    const hits = [];
    const p = new THREE.Vector3();
    docs.forEach((d, i) => {
      if (!d.mesh.visible) return;
      d.mesh.updateMatrixWorld(true);
      for (let u = -1; u <= 1.001; u += 0.125) for (let v = -1; v <= 1.001; v += 0.125) {
        p.set(u * DOC_W / 2, v * DOC_H / 2, 0).applyMatrix4(d.mesh.matrixWorld).applyMatrix4(inv);
        const inBox = Math.abs(p.x) < L / 2 && Math.abs(p.y) < H / 2 && Math.abs(p.z) < W / 2;
        const inCavity = p.x > -L / 2 + 0.12 && p.y > -H / 2 + 0.225 && p.y < H / 2 - 0.29 && Math.abs(p.z) < W / 2 - 0.17;
        if (inBox && !inCavity) { hits.push({ doc: i, x: +p.x.toFixed(2), y: +p.y.toFixed(2), z: +p.z.toFixed(2) }); return; }
      }
    });
    return hits;
  },
  renderNow() { update(); renderer.render(scene, camera); return canvas; },
  poster(w = 1600, h = 1000) {
    const keep = [vw, vh];
    renderer.setPixelRatio(1); renderer.setSize(w, h, false);
    vw = w; vh = h;
    camera.aspect = w / h; camera.position.set(0, 0, (h / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))); camera.near = Math.max(10, camera.position.z - 1600); camera.far = camera.position.z + 1600; camera.updateProjectionMatrix();
    pose.position.set(0, h * 0.04, 0); pose.rotation.set(HERO_POSE.rx, HERO_POSE.ry, 0); pose.scale.setScalar(0.9 * fitScale({ width: w, height: h }, HERO_POSE.rx, HERO_POSE.ry));
    leafA.hinge.rotation.y = 0; leafB.hinge.rotation.y = 0; docs.forEach((d) => (d.mesh.visible = false));
    spreader.visible = false; cables.visible = false;
    renderer.render(scene, camera);
    const url = canvas.toDataURL("image/png");
    [vw, vh] = keep; resize(); frame();
    return url;
  },
};
