import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import * as PTG from './ptg.js?v=1795593815';
{
// ===== Sa bàn 2D Vinhomes Global Gate Hạ Long (Hạ Long Xanh) – Vịnh Bình Minh 1 + Thiên Đường Nhiệt Đới 1 =====
// lots-dao-ngoc.json: {meta:{w,h} (mét), lots:[[mã, loại Y|P|K, [[x,z]…] (mét, gốc góc trên-trái ảnh nền)]]}
// quy-hang.json: {updated, available:{mã:{src,tcbg,loai,dt,dtxd,gia,huong}}, sold:{}}
const $ = id => document.getElementById(id);
const KHU = 'ha-long-xanh';
const ZNAME = { BM: 'Vịnh Bình Minh 1', TD: 'Thiên Đường Nhiệt Đới 1' }; let ZN = 'Hạ Long Xanh';
const small = matchMedia('(max-width:900px)').matches;
const TYPE = {
  Y: { name: 'Nhà liền kề', short: 'LK', h: 15, roof: 0xf2d35b },
  P: { name: 'Biệt thự song lập', short: 'SL', h: 12.5, roof: 0x8f86d6 },
  K: { name: 'Biệt thự đơn lập', short: 'ĐL', h: 11.5, roof: 0xf07fb5 }
};
const WALL = new THREE.Color(0xfbf8f2), AV = new THREE.Color(0x12b336), SD = new THREE.Color(0x7d8085), CK = new THREE.Color(0xffd000), DIM = new THREE.Color(0xe4e2dc), SEL = new THREE.Color(0xe31b23);
const SRC = { MV: 'Mai Việt Land', RBS: 'RBS', MH: 'Mayhomes', TP: 'Trường Phát (CEN)', RM: 'Roman', VHS: 'VHS' }; // tên khác hiển thị nguyên văn
const VN = n => n.toLocaleString('vi-VN');
const ty = n => (n / 1e9).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' tỷ';

try { await Promise.race([document.fonts.load('800 25px "Be Vietnam Pro"'), new Promise(r => setTimeout(r, 2500))]) } catch (_) {}
const [data, quy] = await Promise.all([
  fetch(`lots-${KHU}.json?v=4`).then(r => r.json()),
  fetch('quy-hang.json?v=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.json() : {}).catch(() => ({}))
]);
const W = data.meta.w, H = data.meta.h;
const AVL = quy.available || {}, SOLD = quy.sold || {}, CHK = quy.check || {};

// ---------- scene ----------
const canvas = $('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, logarithmicDepthBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcfe0e6);
scene.fog = new THREE.Fog(0xcfe0e6, 6000, 11000);
const camera = new THREE.PerspectiveCamera(42, 1, 2, 60000);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; controls.dampingFactor = .08;
controls.maxPolarAngle = Math.PI * .46; controls.minDistance = 40; controls.maxDistance = 24000;
controls.screenSpacePanning = false; controls.zoomToCursor = true;
// chế độ xem: 'flat' = mặt bằng nhìn thẳng từ trên xuống (mặc định), '3d' = góc nghiêng xoay được
let FLAT = true; const FP = .0005, FOV_FLAT = 18, FOV_3D = 42;
const KF = () => .82 * Math.tan(21 * Math.PI / 180) / Math.tan(FOV_FLAT * Math.PI / 360);
function applyMode() {
  camera.fov = FLAT ? FOV_FLAT : FOV_3D; camera.updateProjectionMatrix();
  if (scene.fog) { scene.fog.near = FLAT ? 40000 : 6000; scene.fog.far = FLAT ? 60000 : 11000 }
  if (FLAT) {
    controls.enableRotate = false; controls.screenSpacePanning = true;
    controls.minPolarAngle = controls.maxPolarAngle = FP; controls.minAzimuthAngle = controls.maxAzimuthAngle = 0;
    controls.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
    controls.touches = { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_PAN };
  } else {
    controls.enableRotate = true; controls.screenSpacePanning = false;
    controls.minPolarAngle = 0; controls.maxPolarAngle = Math.PI * .46; controls.minAzimuthAngle = -Infinity; controls.maxAzimuthAngle = Infinity;
    controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
    controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
  }
}
applyMode();
scene.add(new THREE.HemisphereLight(0xffffff, 0x8a9a7a, 1.15));
const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(-600, 900, 500); scene.add(sun);

// ground: mặt bằng làm nền
// nền: bản đồ Khu 1 Vịnh Thiên Đường (2 nửa ảnh trên máy tính, 1 ảnh nhỏ trên điện thoại)
const parts = small ? [[`nen-${KHU}-nho.jpg?v=2`, 0, 1]] : [[`nen-${KHU}-a.jpg?v=2`, 0, .5], [`nen-${KHU}-b.jpg?v=2`, .5, .5]];
let nTex = 0; const TEXS = [];
for (const [f, u0, uw] of parts) {
  const t = new THREE.TextureLoader().load(f, () => { if (++nTex === parts.length) { hideLoad(); if (curL) extras(curL, curQ) } });
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); TEXS.push([t, u0, uw]);
  const g = new THREE.Mesh(new THREE.PlaneGeometry(W * uw, H), new THREE.MeshLambertMaterial({ map: t }));
  g.rotation.x = -Math.PI / 2; g.position.x = -W / 2 + W * (u0 + uw / 2); scene.add(g);
}
const sea = new THREE.Mesh(new THREE.PlaneGeometry(W * 4, H * 4), new THREE.MeshBasicMaterial({ color: 0x8ec3cf }));
sea.rotation.x = -Math.PI / 2; sea.position.y = -0.6; scene.add(sea);

// ---------- lots ----------
const X = x => x - W / 2, Z = z => z - H / 2;
const lots = []; const geos = []; let vtx = 0;
const byCode = new Map();
for (const [code, t, poly, zone] of data.lots) {
  const pts = poly.map(([x, z]) => new THREE.Vector2(X(x), -Z(z)));
  // thu nhỏ nhẹ quanh tâm để tách các căn
  let cx = 0, cz = 0; pts.forEach(p => { cx += p.x; cz += p.y }); cx /= pts.length; cz /= pts.length;
  const sh = new THREE.Shape(pts);
  const h = .3; // 2D: lớp phủ mỏng, giữ nguyên màu bản đồ bên dưới
  const g = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false, curveSegments: 1 });
  g.rotateX(-Math.PI / 2);
  const n = g.attributes.position.count;
  // màu đỉnh: mái = các đỉnh trên cùng có pháp tuyến hướng lên
  const col = new Float32Array(n * 4);
  g.setAttribute('color', new THREE.BufferAttribute(col, 4));
  geos.push(g);
  const area = Math.abs(THREE.ShapeUtils.area(pts));
  const L = { zone: zone || 'BM', poly, ax: lotAxis(poly.map(([x, z]) => [X(x), Z(z)])), code, t, i: lots.length, start: vtx, n, cx, cz: -cz, h, area, pre: code.split('-')[0], av: !!AVL[code], sd: !!SOLD[code], ck: !!CHK[code] };
  lots.push(L); byCode.set(code, L); vtx += n;
}
const merged = mergeGeometries(geos, false); geos.forEach(g => g.dispose());
const lotOf = new Int32Array(vtx); lots.forEach(L => lotOf.fill(L.i, L.start, L.start + L.n));
const normals = merged.attributes.normal, colors = merged.attributes.color;
const mesh = new THREE.Mesh(merged, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false }));
mesh.renderOrder = 1; scene.add(mesh);
const edges = new THREE.LineSegments(new THREE.EdgesGeometry(merged, 30), new THREE.LineBasicMaterial({ color: 0x5b5146, transparent: true, opacity: .35 }));
edges.visible = false;
$('nLots').textContent = VN(lots.length) + ' căn';
// viền căn còn hàng (xanh) / check hàng (cam): co đều từng cạnh vào trong
function inset(pts, d) {
  const n = pts.length, A = THREE.ShapeUtils.area(pts) > 0 ? 1 : -1, L = [];
  for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n], dx = q.x - p.x, dy = q.y - p.y, l = Math.hypot(dx, dy) || 1, nx = -dy / l * A, ny = dx / l * A;
    L.push([p.x + nx * d, p.y + ny * d, dx, dy]) }
  const out = [];
  for (let i = 0; i < n; i++) { const [x1, y1, a1, b1] = L[(i + n - 1) % n], [x2, y2, a2, b2] = L[i], den = a1 * b2 - b1 * a2;
    if (Math.abs(den) < 1e-6) { out.push(new THREE.Vector2(x2, y2)); continue }
    const t = ((x2 - x1) * b2 - (y2 - y1) * a2) / den; out.push(new THREE.Vector2(x1 + a1 * t, y1 + b1 * t)) }
  return out;
}

let mode = 'mo-ban', sel = -1, hov = -1;
// 2D giữ màu gốc bản đồ: chỉ phủ mờ căn đã bán / căn đang chọn, căn còn hàng & check hàng có viền
function fillOf(L) {
  if (L.i === sel) return [SEL, .55];
  if (L.i === hov) return [SEL, .25];
  if (L.av) return [AV, .88];      // còn hàng: bôi xanh
  if (L.ck) return [CK, .9];     // check admin: bôi vàng
  if (L.sd) return [SD, .85];      // đã bán: bôi xám
  return [SD, 0];                 // còn lại: giữ nguyên màu chủ đầu tư
}
function paint(L) {
  const [c, a] = fillOf(L);
  for (let k = L.start; k < L.start + L.n; k++) colors.setXYZW(k, c.r, c.g, c.b, a);
}
function paintAll() { lots.forEach(paint); colors.needsUpdate = true; legend(); drawRoofs() }


// ---------- mã căn + giá in trên mái (atlas canvas) ----------
const roofMeshes = [];
function lotAxis(poly) {
  let mx = 0, mz = 0; poly.forEach(([x, z]) => { mx += x; mz += z }); mx /= poly.length; mz /= poly.length;
  let a = 0, b = 0, c = 0; poly.forEach(([x, z]) => { const dx = x - mx, dz = z - mz; a += dx * dx; b += dx * dz; c += dz * dz });
  let th = .5 * Math.atan2(2 * b, a - c); let ux = Math.cos(th), uz = Math.sin(th);
  let lo = 1e9, hi = -1e9, wl = 1e9, wh = -1e9;
  poly.forEach(([x, z]) => { const p = (x - mx) * ux + (z - mz) * uz, q = -(x - mx) * uz + (z - mz) * ux; lo = Math.min(lo, p); hi = Math.max(hi, p); wl = Math.min(wl, q); wh = Math.max(wh, q) });
  if (ux < 0) { ux = -ux; uz = -uz }
  return { ux, uz, len: hi - lo, wid: wh - wl };
}
// giá thanh toán theo tiến độ (TTTĐ): lấy cột TTTĐ của đại lý nếu có, không thì giá niêm yết gồm VAT & KPBT
const tttd = q => q ? (q.bg?.tttd || q.gia) : null;
const F = px => `800 ${px}px "Be Vietnam Pro",Arial,sans-serif`;
function atlas(list, CW, CH, linesOf) {
  const COLS = Math.floor(2048 / CW), ROWS = Math.floor(2048 / CH), PER = COLS * ROWS;
  for (let p0 = 0; p0 < list.length; p0 += PER) {
    const part = list.slice(p0, p0 + PER), rows = Math.ceil(part.length / COLS);
    const cn = document.createElement('canvas'); cn.width = CW * COLS; cn.height = CH * rows; const g = cn.getContext('2d');
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    const pos = [], uv = [], idx = [];
    part.forEach((L, k) => {
      const x0 = (k % COLS) * CW, y0 = ((k / COLS) | 0) * CH, lines = linesOf(L);
      lines.forEach(([t, color, frac, size], j) => {
        let px = Math.round(CH * size); g.font = F(px);
        while (g.measureText(t).width > CW - 10 && px > 10) { px--; g.font = F(px) }
        const y = y0 + CH * frac;
        if (color === '#chk') { const w = g.measureText(t).width + 14; g.fillStyle = '#f5c518'; g.strokeStyle = '#b58900'; g.lineWidth = 3; g.beginPath(); g.roundRect(x0 + (CW - w) / 2, y - px * .62, w, px * 1.24, px * .3); g.fill(); g.stroke(); color = '#1c1d21' }
        else if (color === '#fff') { const w = g.measureText(t).width + 14; g.fillStyle = '#c8102e'; g.beginPath(); g.roundRect(x0 + (CW - w) / 2, y - px * .62, w, px * 1.24, px * .3); g.fill() }
        else { g.lineWidth = Math.max(3, px * .2); g.strokeStyle = 'rgba(255,255,255,.95)'; g.strokeText(t, x0 + CW / 2, y) }
        g.fillStyle = color; g.fillText(t, x0 + CW / 2, y);
      });
      const A = L.ax, w = Math.min(A.len * .9, A.wid * .92 * CW / CH), h = w * CH / CW;
      const vx = -A.uz, vz = A.ux, y = L.h + .1, cx = L.cx, cz = L.cz, base = pos.length / 3;
      for (const [s, t] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) pos.push(cx + A.ux * s * w / 2 + vx * t * h / 2, y, cz + A.uz * s * w / 2 + vz * t * h / 2);
      const u0 = x0 / cn.width, u1 = (x0 + CW) / cn.width, v0 = 1 - (y0 + CH) / cn.height, v1 = 1 - y0 / cn.height;
      uv.push(u0, v1, u1, v1, u1, v0, u0, v0); idx.push(base, base + 2, base + 1, base, base + 3, base + 2);
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx);
    const t = new THREE.CanvasTexture(cn); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
    m.renderOrder = 2; scene.add(m); roofMeshes.push(m);
  }
}
function drawRoofs() {} // mặt bằng gốc của chủ đầu tư đã có mã căn
// ---------- biển giá nổi trên căn (như sa bàn Phố Hiến): nền trắng, viền đỏ, số giá to ----------
const badges = [];
{ const stickR = new THREE.MeshBasicMaterial({ color: 0xd7261e }), stickY = new THREE.MeshBasicMaterial({ color: 0xf2b705 });
  const stickG = new THREE.CylinderGeometry(.35, .35, 1, 6);
  for (const L of lots) {
    const q = AVL[L.code] || CHK[L.code], gia = q && (AVL[L.code] ? tttd(q) : (q.bg?.tttd || q.gia));
    if (!gia || SOLD[L.code]) continue;
    const chk = !AVL[L.code], cn = document.createElement('canvas'); cn.width = 512; cn.height = 200; const g = cn.getContext('2d');
    const t = (gia / 1e9).toFixed(2).replace('.', ',') + ' tỷ';
    g.fillStyle = chk ? '#fff6cc' : '#fff'; g.strokeStyle = chk ? '#f2b705' : '#d7261e'; g.lineWidth = 22;
    g.beginPath(); g.roundRect(14, 14, 484, 172, 86); g.fill(); g.stroke();
    let px = 118; g.font = `800 ${px}px "Be Vietnam Pro",Arial,sans-serif`;
    while (g.measureText(t).width > 420 && px > 60) { px -= 4; g.font = `800 ${px}px "Be Vietnam Pro",Arial,sans-serif` }
    g.fillStyle = chk ? '#8a6a00' : '#c8102e'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, 256, 104);
    const tex = new THREE.CanvasTexture(cn); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthWrite: false, depthTest: false }));
    sp.center.set(.5, 0); sp.renderOrder = 6; sp.userData.lot = L.i; scene.add(sp);
    const st = new THREE.Mesh(stickG, chk ? stickY : stickR); st.renderOrder = 5; scene.add(st);
    badges.push({ sp, st, L, gia, chk });
  }
  badges.sort((a, b) => (b.chk - a.chk) || (a.gia - b.gia));
}
function placeBadges() {
  const d = camera.position.distanceTo(controls.target) / (FLAT ? KF() / .82 : 1);
  const w = Math.max(14, Math.min(170, d * .045)), h = w * 200 / 512, lift = FLAT ? 1 : Math.max(8, w * .35);
  const show = d < 6500 && mode === 'mo-ban';
  // chống chồng biển: biển nào đè lên biển đã hiện thì ẩn (phóng gần sẽ hiện đủ)
  const cw = canvas.clientWidth, chh = canvas.clientHeight, ppu = chh / (2 * camera.position.distanceTo(controls.target) * Math.tan(camera.fov * Math.PI / 360));
  const bw = w * ppu + 4, bhh = h * ppu + 3, kept = [], pv = new THREE.Vector3();
  for (const b of badges) {
    let vis = show && !SOLD[b.L.code];
    if (vis) {
      pv.set(b.L.cx, b.L.h + lift, b.L.cz).project(camera);
      const x = (pv.x + 1) / 2 * cw, y = (1 - pv.y) / 2 * chh;
      if (x < -bw || x > cw + bw || y < -bhh || y > chh + bhh) vis = false;
      else if (kept.some(([kx, ky]) => Math.abs(kx - x) < bw && Math.abs(ky - y) < bhh)) vis = false;
      else kept.push([x, y]);
    }
    b.sp.visible = vis; b.st.visible = vis && !FLAT;
    if (!vis) continue;
    b.sp.scale.set(w, h, 1); b.sp.position.set(b.L.cx, b.L.h + lift, b.L.cz);
    b.st.scale.set(Math.max(.4, w / 40), lift, Math.max(.4, w / 40)); b.st.position.set(b.L.cx, b.L.h + lift / 2, b.L.cz);
  }
}

// ---------- labels ----------
const lbBox = $('labels'); const labels = [];
function addLabel(cls, text, x, y, z, minD = 0, maxD = 1e9) {
  const el = document.createElement('div'); el.className = 'lb ' + cls; el.textContent = text; lbBox.appendChild(el);
  labels.push({ el, p: new THREE.Vector3(x, y, z), minD, maxD }); return el;
}
// nhãn dãy (tiền tố) tại tâm nhóm
const groups = new Map();
lots.forEach(L => { const g = groups.get(L.pre) || { x: 0, z: 0, n: 0 }; g.x += L.cx; g.z += L.cz; g.n++; groups.set(L.pre, g) });

const AMEN0 = [];
// toạ độ tiện ích theo ảnh nền 2048px -> mét
const k2m = W / 2048;
for (const [t, x, z] of data.meta.amen || []) addLabel('zone tv', t, X(x), 30, Z(z), 0, 3400);
for (const [t, x, z] of data.meta.zones || []) addLabel('zone', 'Khu ' + t, X(x), 40, Z(z), 900, 9000);

const v = new THREE.Vector3();
function placeLabels() {
  const w = canvas.clientWidth, h = canvas.clientHeight, d = camera.position.distanceTo(controls.target) / (FLAT ? KF() / .82 : 1);
  for (const o of labels) {
    v.copy(o.p).project(camera);
    const vis = v.z < 1 && d >= o.minD && d <= o.maxD && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1;
    o.el.style.display = vis ? '' : 'none';
    if (vis) o.el.style.transform = `translate(-50%,-50%) translate(${(v.x + 1) / 2 * w}px,${(1 - v.y) / 2 * h}px)`;
  }

}

// ---------- camera moves ----------
let anim = null;
function flyTo(tx, tz, dist, pol = .9, az = .35) {
  if (FLAT) { pol = FP; az = 0; dist *= KF() }
  const t0 = performance.now(), fromT = controls.target.clone(), fromP = camera.position.clone();
  const to = new THREE.Vector3(tx, 0, tz);
  const p = new THREE.Vector3(Math.sin(az) * Math.sin(pol), Math.cos(pol), Math.cos(az) * Math.sin(pol)).multiplyScalar(dist).add(to);
  anim = s => { const k = Math.min(1, (s - t0) / 1100), e = k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
    controls.target.lerpVectors(fromT, to, e); camera.position.lerpVectors(fromP, p, e); if (k >= 1) anim = null };
}
function bbox(L) { let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; L.forEach(l => { x0 = Math.min(x0, l.cx); x1 = Math.max(x1, l.cx); z0 = Math.min(z0, l.cz); z1 = Math.max(z1, l.cz) }); return [x0, x1, z0, z1] }
function boxView(L, k, minD) {
  if (!L.length) return; const [x0, x1, z0, z1] = bbox(L), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  if (FLAT) {
    const t = Math.tan(camera.fov * Math.PI / 360), w = canvas.clientWidth, sideW = w > 900 ? 360 : 0, aw = Math.max(300, w - sideW) / w;
    const d = Math.max((z1 - z0 + 80) * 1.12, (x1 - x0 + 80) * 1.12 / (camera.aspect * aw)) / (2 * t);
    const off = sideW ? -(sideW / 2) / w * 2 * d * t * camera.aspect : 0;   // dịch sang phải để không bị bảng bên trái che
    flyTo(cx + off, cz, Math.max(minD * .7 * KF(), d) / KF());
  } else flyTo(cx, cz, Math.max(minD, Math.hypot(x1 - x0, z1 - z0) * k), .85);
}
const groupView = prefixes => boxView(lots.filter(l => prefixes.some(p => l.pre.startsWith(p))), 1.15, 260);
const zoneView = z => boxView(lots.filter(l => l.zone === z), 1.05, 0);
const exactView = p => () => boxView(lots.filter(l => l.pre === p), 1.2, 240);
const VIEWS = {
  'toan-canh': () => FLAT ? boxView(lots, 1, 0) : flyTo(-500, -150, 4100, .8, 0),
  'z-BM': () => zoneView('BM'), 'z-TD': () => zoneView('TD')
};
{ const ps = [...new Set(lots.map(l => l.pre))].sort((a, b) => a.localeCompare(b, 'vi', { numeric: true }));
  ps.forEach(p => VIEWS['d-' + p] = exactView(p));
  $('chips').innerHTML = `<button data-v="toan-canh" class="on">Toàn dự án</button><button data-v="z-TD">Thiên Đường Nhiệt Đới 1</button><button data-v="z-BM">Vịnh Bình Minh 1</button><i class="zs"></i><select id="daySel" aria-label="Chọn dãy"><option value="">Chọn dãy…</option>${ps.map(p => `<option value="${p}">Dãy ${p}</option>`).join('')}</select>`;
  $('daySel').onchange = e => { if (e.target.value) VIEWS['d-' + e.target.value]() };
  document.querySelector('.brand span').textContent = 'Bình Minh 1 · Nhiệt Đới 1 · Sa bàn 2D'; document.title = 'Sa bàn Vinhomes Global Gate Hạ Long';
  const kv = $('side').querySelectorAll('.kv strong'); kv[0].textContent = '2 khu';
  $('q').placeholder = 'Tìm mã căn, VD: BM3-10, TĐ10-04' }
$('chips').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.v === 'soon') { $('qm').textContent = 'Phân khu ' + b.textContent.replace('sắp có', '').trim() + ' đang được dựng, anh chị quay lại sau nhé.'; openSide(); return }
  document.querySelectorAll('#chips button').forEach(x => x.classList.toggle('on', x === b));
  window.__track && window.__track('xem_khu', { view: b.dataset.v });
  VIEWS[b.dataset.v]?.();
});

// ---------- card / selection ----------
function fmtArea(a) { return a.toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' m²' }
function select(L, fly) {
  const prev = lots[sel]; sel = L ? L.i : -1; if (prev) paint(prev); if (L) paint(L); colors.needsUpdate = true;
  if (!L) { $('card').classList.remove('show'); return }
  window.__track && window.__track('xem_can', { code: L.code });
  const sd = SOLD[L.code], ck = CHK[L.code], q = AVL[L.code] || sd || ck;
  $('cTag').textContent = AVL[L.code] ? 'Còn hàng' : sd ? 'Đã bán' : ck ? 'Check hàng' : TYPE[L.t].name;
  $('card').classList.toggle('chk', !!ck);
  $('card').classList.toggle('open', !!AVL[L.code]); $('card').classList.toggle('sold', !!sd);
  $('cTitle').textContent = L.code;
  $('cText').textContent = AVL[L.code] ? 'Còn trên bảng hàng của ' + q.src.map(s => SRC[s] || s).join(', ') + '.' : sd ? 'Đã bán: ' + (sd.why || '') + '.' : ck ? 'Cần check lại với admin: ' + (ck.why || '') + '.' : 'Chưa thấy trên bảng hàng đại lý đang theo dõi.';
  const rows = [['Phân khu', ZNAME[L.zone]], ['Dãy', L.pre], ['Loại hình', q?.loai ? q.loai + ' · ' + TYPE[L.t].name : TYPE[L.t].name]];
  if (q?.dt) rows.push(['DT đất', q.dt + ' m²']); else rows.push(['DT đất (ước tính)', '≈ ' + fmtArea(L.area / .81)]);
  if (q?.dtxd) rows.push(['DT xây dựng', q.dtxd + ' m²']);
  if (q?.so_tang) rows.push(['Số tầng', q.so_tang]);
  if (q?.mat_tien) rows.push(['Mặt tiền', q.mat_tien + ' m']);
  if (q?.tcbg) rows.push(['Tiêu chuẩn bàn giao', q.tcbg]);
  { const c = window.HLX_CSBH && window.HLX_CSBH(q?.tcbg, L.zone); if (c) rows.push(['CSBH áp dụng', `<button type="button" class="csbhLink" data-i="${c.i}">${c.name} · xem</button>`]) }
  if (q?.huong) rows.push(['Hướng', q.huong]);
  let html = rows.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('');
  const bg = q?.bg || {}, d = n => n ? VN(n) : '–';
  if (q?.gia || Object.keys(bg).length) {
    html += `<dt class="h">Bảng giá</dt><dd class="h">${sd ? 'giá lúc mở bán' : 'đ, tạm tính'}</dd>`;
    const P = [['Thanh toán theo tiến độ', AVL[L.code] || ck ? tttd(q) : bg.tttd, 'big'], ['Giá gồm VAT & KPBT (niêm yết)', q.gia], ['Giá chưa VAT', bg.chua_vat], ['VAT', bg.vat], ['Kinh phí bảo trì', bg.kpbt],
      ['Đơn giá / m² đất', bg.don_gia], ['Tổng tiền xây', bg.tong_xay], ['Tổng tiền đất', bg.tong_dat],
      ['Thanh toán sớm', bg.tts], ['Giá vay', bg.vay]];
    for (const [a, v, c] of P) if (v) html += `<dt>${a}</dt><dd${c ? ' class="big"' : ''}>${d(v)}</dd>`;
    if (q.offers?.length > 1) html += `<dt class="h">Giá theo đại lý</dt><dd class="h"></dd>` + q.offers.map(o => `<dt>${SRC[o.src] || o.src}</dt><dd>${ty(o.gia)}${o.tcbg ? ' · ' + o.tcbg : ''}</dd>`).join('');
  }
  $('cRows').innerHTML = html;
  extras(L, q);
  $('card').classList.add('show');
  if (fly) flyTo(L.cx, L.cz, 260, .9, controls.getAzimuthalAngle());
}
$('cardX').onclick = () => select(null);

// ---------- phiếu tính giá + ảnh chỉ căn ----------
let curL = null, curQ = null, ptgKey = 'tttd';
function extras(L, q) {
  if (q) q = { ...q, _z: L.zone };
  curL = L; curQ = q;
  const can = !!PTG.ZC[L.zone] && q?.gia && !SOLD[L.code];
  $('ptg').hidden = !can;
  if (can) {
    const ks = PTG.plans(q); if (!ks.includes(ptgKey)) ptgKey = 'tttd';
    $('ptgTabs').innerHTML = ks.map(k => `<button data-k="${k}" class="${k === ptgKey ? 'on' : ''}">${PTG.NAME[k]}</button>`).join('');
    $('ptgBody').innerHTML = PTG.html(L.code, q, ptgKey);
  }
  const img = chiCan(L); $('ccImg').src = img.toDataURL('image/jpeg', .9);
  const links = (q?.anh || []).map((u, i) => `<a href="${u}" target="_blank" rel="noopener">Ảnh căn ${q.anh.length > 1 ? i + 1 : ''} ›</a>`).join(' ');
  $('ccLinks').innerHTML = links;
}
$('ptgTabs').onclick = e => { const b = e.target.closest('button'); if (!b) return; ptgKey = b.dataset.k; extras(curL, curQ); window.__track && window.__track('xem_ptg', { code: curL.code, plan: ptgKey }) };
async function save(cn, name) {
  const blob = await new Promise(r => cn.toBlob(r, 'image/png'));
  const file = new File([blob], name, { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [file] }) && matchMedia('(pointer:coarse)').matches) { try { await navigator.share({ files: [file], title: name }); return } catch (_) {} }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
$('ptgDl').onclick = () => { save(PTG.png(curL.code, curQ, ptgKey), `PTG-${curL.code}-${ptgKey}.png`); window.__track && window.__track('tai_ptg', { code: curL.code, plan: ptgKey }) };
$('ccDl').onclick = () => { save(chiCan(curL, 1600), `Chi-can-${curL.code}.png`); window.__track && window.__track('tai_chi_can', { code: curL.code }) };
$('ccImg').onclick = () => $('ccDl').click();
// ảnh chỉ căn: cắt mặt bằng quanh căn, khoanh đỏ căn và ghi mã
function chiCan(L, size = 900) {
  if (!TEXS.length || TEXS.some(([t]) => !t.image || !t.image.width)) { const c = document.createElement('canvas'); c.width = 4; c.height = 3; return c } const R = 70;   // bán kính ~70 m quanh căn
  let mx = 0, mz = 0; L.poly.forEach(([x, z]) => { mx += x; mz += z }); mx /= L.poly.length; mz /= L.poly.length;
  const cn = document.createElement('canvas'), Hh = Math.round(size * .75); cn.width = size; cn.height = Hh; const g = cn.getContext('2d');
  const swm = R * 2, shm = swm * .75, sxm = mx - swm / 2, sym = mz - shm / 2, s = size / swm;
  g.fillStyle = '#cfe0e6'; g.fillRect(0, 0, size, Hh);
  for (const [t, u0, uw] of TEXS) {   // vẽ phần giao của khung với từng nửa ảnh nền
    const im = t.image, k = im.width / (W * uw), a0 = Math.max(sxm, u0 * W), a1 = Math.min(sxm + swm, (u0 + uw) * W);
    if (a1 <= a0) continue;
    const b0 = Math.max(0, sym), b1 = Math.min(H, sym + shm);
    try { g.drawImage(im, (a0 - u0 * W) * k, b0 * k, (a1 - a0) * k, (b1 - b0) * k, (a0 - sxm) * s, (b0 - sym) * s, (a1 - a0) * s, (b1 - b0) * s) } catch (_) {}
  }
  const P = ([x, z]) => [(x - sxm) * s, (z - sym) * s];
  // làm mờ nhẹ phần còn lại
  g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(0, 0, size, Hh);
  g.beginPath(); L.poly.forEach((p, i) => { const [x, y] = P(p); i ? g.lineTo(x, y) : g.moveTo(x, y) }); g.closePath();
  g.fillStyle = 'rgba(227,27,35,.55)'; g.fill(); g.lineWidth = size / 160; g.strokeStyle = '#e31b23'; g.stroke();
  const [cx, cy] = P([mx, mz]), fs = Math.round(size / 22);
  g.font = `800 ${fs}px "Be Vietnam Pro",Arial,sans-serif`; const tw = g.measureText(L.code).width;
  const bx = Math.min(size - tw - 40, Math.max(10, cx - tw / 2 - 14)), by = Math.max(10, cy - fs * 2.8);
  g.fillStyle = '#e31b23'; g.beginPath(); g.roundRect(bx, by, tw + 28, fs * 1.5, 10); g.fill();
  g.beginPath(); g.moveTo(cx - 10, by + fs * 1.5); g.lineTo(cx + 10, by + fs * 1.5); g.lineTo(cx, cy - 4); g.fill();
  g.fillStyle = '#fff'; g.fillText(L.code, bx + 14, by + fs * 1.1);
  g.fillStyle = 'rgba(28,29,33,.78)'; g.fillRect(0, Hh - fs * 1.3, size, fs * 1.3);
  g.fillStyle = '#fff'; g.font = `600 ${Math.round(fs * .55)}px "Be Vietnam Pro",Arial,sans-serif`;
  g.fillText(`Vinhomes Global Gate Hạ Long · ${ZNAME[L.zone]} · Dãy ${L.pre} · ${TYPE[L.t].name}`, 16, Hh - fs * .45);
  // la bàn
  g.font = `800 ${Math.round(fs * .6)}px "Be Vietnam Pro",Arial,sans-serif`; g.fillStyle = '#fff'; g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 4;
  g.strokeText('B ↑', size - fs * 2.2, fs * 1.1); g.fillText('B ↑', size - fs * 2.2, fs * 1.1);
  return cn;
}

// ---------- picking ----------
const ray = new THREE.Raycaster(), mp = new THREE.Vector2(); let down = null;
function pick(e) {
  const r = canvas.getBoundingClientRect(); mp.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
  ray.setFromCamera(mp, camera);
  const bh = ray.intersectObjects(badges.filter(b => b.sp.visible).map(b => b.sp))[0]; if (bh) return lots[bh.object.userData.lot];
  const hit = ray.intersectObject(mesh)[0];
  return hit ? lots[lotOf[hit.face.a]] : null;
}
canvas.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; stopRot() });
canvas.addEventListener('pointerup', e => { if (down && Math.hypot(e.clientX - down[0], e.clientY - down[1]) < 6) select(pick(e), false); down = null });
const tip = $('tip');
canvas.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse') return;
  const L = pick(e); const old = lots[hov]; hov = L ? L.i : -1;
  if (old !== L) { if (old) paint(old); if (L) paint(L); colors.needsUpdate = true }
  if (!L) { tip.style.display = 'none'; canvas.style.cursor = 'grab'; return }
  canvas.style.cursor = 'pointer'; const q = AVL[L.code] || SOLD[L.code] || CHK[L.code];
  tip.innerHTML = `<b>${L.code}</b>${AVL[L.code] ? '<i>Còn hàng</i>' : SOLD[L.code] ? '<i class="sold">Đã bán</i>' : CHK[L.code] ? '<i class="chk">Check hàng</i>' : ''}<span class="s">${TYPE[L.t].name}${AVL[L.code] && tttd(q) ? ' · TTTĐ ' + ty(tttd(q)) : ''}</span>`;
  tip.style.display = 'block'; tip.style.left = (e.clientX + 14) + 'px'; tip.style.top = (e.clientY + 14) + 'px';
});
canvas.addEventListener('pointerleave', () => tip.style.display = 'none');

// ---------- search & quỹ ----------
const norm = s => s.toUpperCase().replace(/\s+/g, '').replace(/^DL/, 'ĐL').replace(/^ĐLDN/, 'ĐLĐN');
$('srch').onsubmit = e => {
  e.preventDefault(); const q = norm($('q').value); if (!q) return;
  const L = byCode.get(q) || lots.find(l => l.code.replace('-', '') === q.replace('-', ''));
  $('qm').textContent = L ? '' : `Chưa tìm thấy căn ${q} trên sa bàn.`;
  if (L) { select(L, true); window.__track && window.__track('tim_can', { code: L.code }) }
};
const avl = Object.entries(AVL).sort((a, b) => (tttd(a[1]) || 9e15) - (tttd(b[1]) || 9e15));
const onMap = avl.filter(([c]) => byCode.has(c)), off = [...Object.keys(AVL), ...Object.keys(CHK), ...Object.keys(SOLD)].filter(c => !byCode.has(c)).map(c => [c]);
$('quyN').textContent = onMap.length; $('quyD').textContent = quy.updated || '';
$('quy').innerHTML = onMap.map(([c, q]) => `<li><button data-c="${c}"><b>${c}</b><span>${q.loai || ''} · ${q.dt || '?'} m²</span><em${tttd(q) ? '' : ' class="g"'}>${tttd(q) ? ty(tttd(q)) : 'liên hệ'}</em></button></li>`).join('');
const ckl = Object.entries(CHK).filter(([c]) => byCode.has(c));
$('ckN').textContent = ckl.length;
$('chk').innerHTML = ckl.map(([c, q]) => `<li><button data-c="${c}"><b>${c}</b><span>${q.loai || ''} · ${q.dt || '?'} m²</span><em class="o">${q.gia ? ty(q.gia) : 'check'}</em></button></li>`).join('');
$('chk').onclick = e => { const b = e.target.closest('button'); if (b) select(byCode.get(b.dataset.c), true) };
const sdl = Object.entries(SOLD).filter(([c]) => byCode.has(c));
$('sdN').textContent = sdl.length;
$('sold').innerHTML = sdl.map(([c, q]) => `<li><button data-c="${c}"><b>${c}</b><span>${q.loai || ''} · ${q.dt || '?'} m²</span><em class="g">Đã bán</em></button></li>`).join('');
$('sold').onclick = e => { const b = e.target.closest('button'); if (b) select(byCode.get(b.dataset.c), true) };
if (off.length) { $('nopos').hidden = false; $('nopos').textContent = 'Chưa định vị trên sa bàn: ' + off.map(x => x[0]).join(', ') + '.' }
$('quy').onclick = e => { const b = e.target.closest('button'); if (b) select(byCode.get(b.dataset.c), true) };

// ---------- legend ----------
function legend() {
  const items = [[AV.getStyle(), 'Còn hàng', lots.filter(l => l.av).length], [CK.getStyle(), 'Check admin', lots.filter(l => l.ck && !l.av).length],
    [SD.getStyle(), 'Đã bán', lots.filter(l => l.sd && !l.av && !l.ck).length]];
  $('lgItems').innerHTML = items.map(([c, t, n]) => `<li><i style="background:${c};opacity:.85"></i>${t}<b>${VN(n)}</b></li>`).join('');
}
// ---------- tools ----------
let rot = false;
function stopRot() { rot = false }
$('bRot').style.display = 'none'; $('bRot').textContent = 'Xem 3D'; $('bRot').title = 'Chuyển giữa mặt bằng nhìn thẳng và góc nghiêng 3D';
$('bRot').onclick = () => { FLAT = !FLAT; applyMode(); $('bRot').textContent = FLAT ? 'Xem 3D' : 'Mặt bằng'; $('bRot').classList.toggle('on', !FLAT); $('bRot').setAttribute('aria-pressed', !FLAT);
  const d = camera.position.distanceTo(controls.target); flyTo(controls.target.x, controls.target.z, FLAT ? d * 1.25 : d * .5, .85, .35) };
function openSide() { $('side').classList.add('open') }
$('bInfo').onclick = () => $('side').classList.toggle('open');

// ---------- loop ----------
function size() { const w = canvas.clientWidth, h = canvas.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix() }
addEventListener('resize', size); size();
camera.position.set(500, 2400, 2300); controls.target.set(0, 0, 0);
paintAll(); VIEWS['toan-canh']();
let loaded = false;
function hideLoad() { if (loaded) return; loaded = true; const l = $('load'); l.style.opacity = 0; setTimeout(() => l.remove(), 700) }
setTimeout(hideLoad, 6000);
renderer.setAnimationLoop(t => {
  if (anim) anim(t);
  if (rot && !anim) { const a = .0012, o = camera.position.clone().sub(controls.target); o.applyAxisAngle(new THREE.Vector3(0, 1, 0), a); camera.position.copy(controls.target).add(o) }
  controls.update(); placeBadges(); renderer.render(scene, camera); placeLabels();
});
// mở theo #mã-căn
const hc = decodeURIComponent(location.hash.slice(1)); if (hc && byCode.has(norm(hc))) setTimeout(() => select(byCode.get(norm(hc)), true), 1300);
}
