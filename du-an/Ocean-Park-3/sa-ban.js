import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
{
// ===== Sa bàn 3D Vinhomes Ocean City – Ocean Park 2 & Ocean Park 3 trên một bản đồ =====
// lots-dao-ngoc.json: {meta:{w,h} (mét), lots:[[mã, loại Y|P|K, [[x,z]…] (mét, gốc góc trên-trái ảnh nền)]]}
// quy-hang.json: {updated, available:{mã:{src,tcbg,loai,dt,dtxd,gia,huong}}, sold:{}}
const $ = id => document.getElementById(id);
const KHU = 'ocean-park-3';
const ZNAME = { 'HĐ': 'Hải Đăng', 'TĐ': 'Thời Đại', AD: 'Ánh Dương', PB: 'Phố Biển', 'VTĐ': 'Vịnh Thiên Đường', VT: 'Vịnh Tây', VX: 'Vịnh Xanh', 'ĐN': 'Đảo Ngọc', BM: 'Đại lộ Bốn Mùa', SB: 'Sao Biển', CX: 'Cọ Xanh', CL: 'Chà Là', 'KĐ': 'Kinh Đô', NT: 'Đại lộ Ngọc Trai' };
const OCP3 = new Set(['HĐ', 'TĐ', 'AD', 'PB', 'VTĐ', 'VT', 'VX', 'ĐN', 'BM']);
const duAn = z => OCP3.has(z) ? 'Ocean Park 3 – The Crown' : 'Ocean Park 2 – The Empire';
// kiến trúc từng phân khu (theo CĐT & tài liệu bán hàng; Đại lộ Ngọc Trai, Đại lộ Bốn Mùa đi qua nhiều phân khu nên chưa ghi)
const ARCHZ = {
  'TĐ': 'Đông Dương', VT: 'Đông Dương', CL: 'Đông Dương',
  AD: 'Hiện đại', PB: 'Hiện đại', 'VTĐ': 'Hiện đại',
  VX: 'Hy Lạp', 'ĐN': 'Hy Lạp – Địa Trung Hải', 'HĐ': 'Hà Lan',
  CX: 'Florida (Mỹ)', SB: 'Pháp', 'KĐ': 'Pháp cổ điển (Paris)'
};
const small = matchMedia('(max-width:900px)').matches;
const TYPE = {
  Y: { name: 'Nhà liền kề', short: 'LK', h: 15, roof: 0xf2d35b },
  P: { name: 'Biệt thự song lập', short: 'SL', h: 12.5, roof: 0x8f86d6 },
  K: { name: 'Biệt thự đơn lập', short: 'ĐL', h: 11.5, roof: 0xf07fb5 },
  T: { name: 'Biệt thự tứ lập', short: 'TL', h: 12, roof: 0x2bb5bd },
  S: { name: 'Shophouse', short: 'SH', h: 17, roof: 0xf08a4b }
};
const WALL = new THREE.Color(0xfbf8f2), AV = new THREE.Color(0x25b768), SD = new THREE.Color(0x8a8c90), CK = new THREE.Color(0xf5a623), DIM = new THREE.Color(0xe4e2dc), SEL = new THREE.Color(0xe31b23);
const SRC = {}; // tên khác hiển thị nguyên văn
const VN = n => n.toLocaleString('vi-VN');
const ty = n => (n / 1e9).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' tỷ';

try { await Promise.race([document.fonts.load('800 25px "Be Vietnam Pro"'), new Promise(r => setTimeout(r, 2500))]) } catch (_) {}
const [data, quy] = await Promise.all([
  fetch(`lots-${KHU}.json?v=4`).then(r => r.json()),
  fetch('../Ocean-City/quy-hang.json?v=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.json() : {}).catch(() => ({}))
]);
const W = data.meta.w, H = data.meta.h;
const AVL = quy.available || {}, SOLD = quy.sold || {}, CHK = quy.check || {};

// ---------- scene ----------
const canvas = $('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, logarithmicDepthBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdfe7da);
scene.fog = new THREE.Fog(0xdfe7da, 9000, 16000);
const camera = new THREE.PerspectiveCamera(42, 1, 2, 60000);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; controls.dampingFactor = .08;
controls.maxPolarAngle = Math.PI * .46; controls.minDistance = 40; controls.maxDistance = 30000;
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

// nền: mặt bằng từng nguồn (OCP3 tổng, OCP2 từng phân khu) đặt đúng vị trí trên bản đồ chung
const texs = []; let nTex = 0;
const land = new THREE.Mesh(new THREE.PlaneGeometry(W * 3, H * 3), new THREE.MeshBasicMaterial({ color: 0xe6ece0 }));
land.rotation.x = -Math.PI / 2; land.position.y = -0.6; scene.add(land);
for (const [gi, g] of data.meta.grounds.entries()) {
  const t = new THREE.TextureLoader().load(`${g.img}${small ? '-nho' : ''}.webp?v=4`, () => { if (++nTex === data.meta.grounds.length) hideLoad() });
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); texs.push(t);
  const c = g.corners, geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(c.flatMap(([x, z]) => [x - W / 2, 0, z - H / 2]), 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1, 1, 1, 1, 0, 0, 0], 2)); geo.setIndex([0, 2, 1, 0, 3, 2]);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, alphaTest: .02 }));
  m.position.y = gi * .02; m.renderOrder = -10 + gi; scene.add(m);
}
// ---------- lots ----------
const X = x => x - W / 2, Z = z => z - H / 2;
const lots = []; const geos = []; let vtx = 0;
const byCode = new Map();
for (const [code, t, poly, zone] of data.lots) {
  const pts = poly.map(([x, z]) => new THREE.Vector2(X(x), -Z(z)));
  // thu nhỏ nhẹ quanh tâm để tách các căn
  let cx = 0, cz = 0; pts.forEach(p => { cx += p.x; cz += p.y }); cx /= pts.length; cz /= pts.length;
  const sh = new THREE.Shape(pts.map(p => new THREE.Vector2(cx + (p.x - cx) * .9, cz + (p.y - cz) * .9)));
  const h = TYPE[t].h * (code.startsWith('LP') || code.startsWith('ĐL') ? 1 : 1);
  const g = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false, curveSegments: 1 });
  g.rotateX(-Math.PI / 2);
  const n = g.attributes.position.count;
  // màu đỉnh: mái = các đỉnh trên cùng có pháp tuyến hướng lên
  const col = new Float32Array(n * 3);
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geos.push(g);
  const area = Math.abs(THREE.ShapeUtils.area(pts));
  const L = { zone: zone || '?', poly, ax: lotAxis(poly.map(([x, z]) => [X(x), Z(z)])), code, t, i: lots.length, start: vtx, n, cx, cz: -cz, h, area, pre: code.split('-')[0], av: !!AVL[code], sd: !!SOLD[code], ck: !!CHK[code] };
  lots.push(L); byCode.set(code, L); vtx += n;
}
const merged = mergeGeometries(geos, false); geos.forEach(g => g.dispose());
const lotOf = new Int32Array(vtx); lots.forEach(L => lotOf.fill(L.i, L.start, L.start + L.n));
const normals = merged.attributes.normal, colors = merged.attributes.color;
const mesh = new THREE.Mesh(merged, new THREE.MeshLambertMaterial({ vertexColors: true }));
scene.add(mesh);
const edges = new THREE.LineSegments(new THREE.EdgesGeometry(merged, 30), new THREE.LineBasicMaterial({ color: 0x5b5146, transparent: true, opacity: .35 }));
scene.add(edges);
$('nLots').textContent = VN(lots.length) + ' căn';

let mode = 'mo-ban', sel = -1, hov = -1;
function roofCol(L) {
  if (L.i === sel) return SEL;
  if (mode === 'mo-ban') return L.av ? AV : L.sd ? SD : L.ck ? CK : DIM;
  if (L.sd) return SD;
  return new THREE.Color(TYPE[L.t].roof);
}
function paint(L) {
  const r = roofCol(L), w = L.i === sel ? SEL : (mode === 'mo-ban' && !L.av ? DIM : WALL);
  const hv = L.i === hov ? 1.12 : 1;
  for (let k = L.start; k < L.start + L.n; k++) {
    const c = normals.getY(k) > .5 ? r : w;
    colors.setXYZ(k, Math.min(1, c.r * hv), Math.min(1, c.g * hv), Math.min(1, c.b * hv));
  }
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
        if (color === '#fff') { const w = g.measureText(t).width + 14; g.fillStyle = '#c8102e'; g.beginPath(); g.roundRect(x0 + (CW - w) / 2, y - px * .62, w, px * 1.24, px * .3); g.fill() }
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
function drawRoofs() {
  roofMeshes.forEach(m => { scene.remove(m); m.geometry.dispose(); m.material.map.dispose(); m.material.dispose() }); roofMeshes.length = 0;
  const priced = mode === 'mo-ban' ? lots.filter(L => L.av && tttd(AVL[L.code])) : [];
  const ps = new Set(priced);
  atlas(lots.filter(L => !ps.has(L)), 128, 40, L => [[L.code, L.sd ? '#3d3f44' : '#1c1d21', .5, .6]]);
  // căn còn hàng: mã căn + ô đỏ giá TTTĐ
  atlas(priced, 256, 84, L => [[L.code, '#1c1d21', .28, .44], [ty(tttd(AVL[L.code])), '#fff', .74, .4]]);
}
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
    badges.push({ sp, st, L });
  }
}
function placeBadges() {
  const d = camera.position.distanceTo(controls.target) / (FLAT ? KF() / .82 : 1);
  const w = Math.max(14, Math.min(170, d * .045)), h = w * 200 / 512, lift = FLAT ? 1 : Math.max(8, w * .35);
  const show = d < 6500 && mode === 'mo-ban';
  for (const b of badges) {
    const vis = show && !SOLD[b.L.code]; b.sp.visible = vis; b.st.visible = vis && !FLAT;
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
for (const [pre, g] of groups) if (g.n >= 3) addLabel('day', pre, g.x / g.n, 22, g.z / g.n, 0, 1500);
const AMEN0 = [['VinWonders Hải Vân', 760, 330], ['Botanica Park', 430, 1138], ['Pearl Park', 642, 980], ['Emerald Boulevard', 1392, 937], ['Vinpearl Legend Lux Làng Vân', 1658, 875], ['Hệ thống trường học', 1755, 790], ['Sunlight Park', 1850, 600]];
// toạ độ tiện ích theo ảnh nền 2048px -> mét
const k2m = W / 2048;
for (const [t, x, z] of data.meta.amen || []) addLabel('zone tv', t, X(x), 30, Z(z), 0, 3400);
for (const [t, x, z] of data.meta.zones || []) addLabel('zone', t, X(x), 40, Z(z), 500, 7500);
for (const [t, x, z] of data.meta.rzones || []) addLabel('zone tv', t + ' · ảnh mặt bằng', X(x), 40, Z(z), 500, 7500);
for (const [t, set] of [['VINHOMES OCEAN PARK 2 · THE EMPIRE', l => !OCP3.has(l.zone)], ['VINHOMES OCEAN PARK 3 · THE CROWN', l => OCP3.has(l.zone)]]) {
  const g = lots.filter(set); if (!g.length) continue; let x = 0, z = 1e9; g.forEach(l => { x += l.cx; z = Math.min(z, l.cz) }); addLabel('zone tv', t, x / g.length, 60, z - 120, 5000, 30000) }

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
const zoneView = z => boxView(lots.filter(l => (Array.isArray(z) ? z : [z]).includes(l.zone)), 1.05, 0);
const exactView = p => () => boxView(lots.filter(l => l.pre === p), 1.2, 240);
const ZORD2 = ['CX', 'SB', 'KĐ', 'CL'], ZORD3 = ['TĐ', 'VT', 'ĐN', 'BM', 'VTĐ', 'AD', 'VX', 'PB', 'HĐ'];
const VIEWS = {
  'toan-canh': () => boxView(lots, 1, 0),
  ocp2: () => zoneView(ZORD2.concat(['NT'])), ocp3: () => zoneView(ZORD3)
};
for (const z of [...ZORD2, ...ZORD3]) VIEWS['z-' + z] = () => zoneView(z);
{ const ps = [...new Set(lots.map(l => l.pre))].sort((a, b) => a.localeCompare(b, 'vi', { numeric: true }));
  ps.forEach(p => VIEWS['d-' + p] = exactView(p));
  const have = new Set(lots.map(l => l.zone)), RZ = data.meta.rzones || [];
  RZ.forEach(([n, x, z, w, h], i) => { VIEWS['r-' + i] = () => { if (FLAT) { const t = Math.tan(camera.fov * Math.PI / 360); flyTo(X(x), Z(z), Math.max(h * 1.15, w * 1.15 / camera.aspect) / (2 * t) / KF()) } else flyTo(X(x), Z(z), Math.hypot(w, h) * 1.1, .85) } });
  $('chips').innerHTML = `<button data-v="toan-canh" class="on">Toàn dự án</button><a class="chipLink" href="/du-an/Ocean-Park-2/">Sang Ocean Park 2 ›</a>`
    + [...ZORD2.filter(z => z !== 'KĐ'), ...ZORD3].filter(z => have.has(z)).map(z => `<button data-v="z-${z}">${ZNAME[z]}</button>`).join('')
    + RZ.map(([n], i) => `<button data-v="r-${i}" title="Ảnh mặt bằng, chưa bấm chọn từng căn">${n}<small>ảnh</small></button>`).join('')
    + `<select id="daySel" aria-label="Chọn dãy"><option value="">Chọn dãy…</option>${ps.map(p => `<option>${p}</option>`).join('')}</select>`;
  $('daySel').onchange = e => { if (e.target.value) VIEWS['d-' + e.target.value]() };
}
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
  const tn = TYPE[L.t].name, lo = q?.loai && q.loai.toLowerCase() !== tn.toLowerCase() ? q.loai + ' · ' + tn : tn;
  const rows = [['Dự án', duAn(L.zone)], ['Phân khu', ZNAME[L.zone] || L.zone], ['Dãy', L.pre], ['Loại hình', lo]];
  rows.push(['Kiến trúc', ARCHZ[L.zone] ? 'Phong cách ' + ARCHZ[L.zone] : '<span style="color:var(--mut)">Đang cập nhật</span>']);
  if (q?.quy) rows.push(['Quỹ', q.quy]);
  if (q?.dt) rows.push(['DT đất', q.dt + ' m²']); else rows.push(['DT đất (ước tính)', '≈ ' + fmtArea(L.area / .81)]);
  if (q?.dtxd) rows.push(['DT xây dựng', q.dtxd + ' m²']);
  if (q?.so_tang) rows.push(['Số tầng', q.so_tang]);
  if (q?.mat_tien) rows.push(['Mặt tiền', q.mat_tien + ' m']);
  if (q?.tcbg) rows.push(['Tiêu chuẩn bàn giao', q.tcbg]);
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
  curL = L; curQ = q;
  $('ptg').hidden = true;
  const img = chiCan(L); $('ccImg').src = img.toDataURL('image/jpeg', .9);
  const links = (q?.anh || []).map((u, i) => `<a href="${u}" target="_blank" rel="noopener">Ảnh căn ${q.anh.length > 1 ? i + 1 : ''} ›</a>`).join(' ');
  $('ccLinks').innerHTML = links;
}

async function save(cn, name) {
  const blob = await new Promise(r => cn.toBlob(r, 'image/png'));
  const file = new File([blob], name, { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [file] }) && matchMedia('(pointer:coarse)').matches) { try { await navigator.share({ files: [file], title: name }); return } catch (_) {} }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

$('ccDl').onclick = () => { save(chiCan(curL, 1600), `Chi-can-${curL.code}.png`); window.__track && window.__track('tai_chi_can', { code: curL.code }) };
$('ccImg').onclick = () => $('ccDl').click();
// ảnh chỉ căn: cắt mặt bằng quanh căn, khoanh đỏ căn và ghi mã
function chiCan(L, size = 900) {
  const R = 80, Hh = Math.round(size * .75), cn = document.createElement('canvas'); cn.width = size; cn.height = Hh; const g = cn.getContext('2d');
  let mx = 0, mz = 0; L.poly.forEach(([x, z]) => { mx += x; mz += z }); mx /= L.poly.length; mz /= L.poly.length;
  const s = size / (R * 2), P = ([x, z]) => [(x - mx) * s + size / 2, (z - mz) * s + Hh / 2];
  g.fillStyle = '#eef2ea'; g.fillRect(0, 0, size, Hh);
  const near = lots.filter(o => Math.abs(o.poly[0][0] - mx) < R * 1.6 && Math.abs(o.poly[0][1] - mz) < R * 1.3);
  g.textAlign = 'center'; g.textBaseline = 'middle';
  for (const o of near) {
    g.beginPath(); o.poly.forEach((p, i) => { const [x, y] = P(p); i ? g.lineTo(x, y) : g.moveTo(x, y) }); g.closePath();
    g.fillStyle = o === L ? 'rgba(227,27,35,.85)' : '#' + new THREE.Color(TYPE[o.t].roof).getHexString(); g.fill();
    g.lineWidth = 1.2; g.strokeStyle = 'rgba(60,50,40,.55)'; g.stroke();
    if (o !== L) { let cx = 0, cy = 0; o.poly.forEach(p => { const [x, y] = P(p); cx += x; cy += y }); cx /= o.poly.length; cy /= o.poly.length;
      const fz = Math.max(8, Math.min(13, Math.sqrt(o.area) * s * .22)); g.font = `600 ${fz}px "Be Vietnam Pro",Arial,sans-serif`; g.fillStyle = 'rgba(30,30,34,.75)'; g.fillText(o.code.split('-')[1] || o.code, cx, cy) }
  }
  g.lineWidth = size / 160; g.strokeStyle = '#e31b23'; g.beginPath(); L.poly.forEach((p, i) => { const [x, y] = P(p); i ? g.lineTo(x, y) : g.moveTo(x, y) }); g.closePath(); g.stroke();
  const [cx, cy] = P([mx, mz]), fs = Math.round(size / 22);
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  g.font = `800 ${fs}px "Be Vietnam Pro",Arial,sans-serif`; const tw = g.measureText(L.code).width;
  const bx = Math.min(size - tw - 40, Math.max(10, cx - tw / 2 - 14)), by = Math.max(10, cy - fs * 2.8);
  g.fillStyle = '#e31b23'; g.beginPath(); g.roundRect(bx, by, tw + 28, fs * 1.5, 10); g.fill();
  g.beginPath(); g.moveTo(cx - 10, by + fs * 1.5); g.lineTo(cx + 10, by + fs * 1.5); g.lineTo(cx, cy - 4); g.fill();
  g.fillStyle = '#fff'; g.fillText(L.code, bx + 14, by + fs * 1.1);
  g.fillStyle = 'rgba(28,29,33,.78)'; g.fillRect(0, Hh - fs * 1.3, size, fs * 1.3);
  g.fillStyle = '#fff'; g.font = `600 ${Math.round(fs * .55)}px "Be Vietnam Pro",Arial,sans-serif`;
  g.fillText(`Vinhomes Ocean City · ${ZNAME[L.zone] || L.zone} · Dãy ${L.pre} · ${TYPE[L.t].name}`, 16, Hh - fs * .45);
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
const norm = s => s.toUpperCase().replace(/\s+/g, '').replace(/^DL/, 'ĐL').replace(/^VTD/, 'VTĐ').replace(/^TD/, 'TĐ').replace(/^HD/, 'HĐ').replace(/^DN/, 'ĐN').replace(/^KD/, 'KĐ').replace(/^ĐLHD/, 'ĐLHĐ').replace(/^DDD/, 'ĐĐD');
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
  const items = mode === 'mo-ban'
    ? [[AV.getStyle(), 'Còn hàng', lots.filter(l => l.av).length], [CK.getStyle(), 'Check hàng', lots.filter(l => l.ck).length], [SD.getStyle(), 'Đã bán', lots.filter(l => l.sd).length], [DIM.getStyle(), 'Chưa có trên bảng hàng', lots.filter(l => !l.av && !l.sd && !l.ck).length]]
    : Object.entries(TYPE).map(([k, t]) => ['#' + new THREE.Color(t.roof).getHexString(), t.name, lots.filter(l => l.t === k).length]);
  $('lgItems').innerHTML = items.map(([c, t, n]) => `<li><i style="background:${c}"></i>${t}<b>${VN(n)}</b></li>`).join('');
}
$('lgModes').onclick = e => { const b = e.target.closest('button'); if (!b) return; mode = b.dataset.m;
  $('lgModes').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); paintAll() };

// ---------- tools ----------
let rot = false;
function stopRot() { rot = false }
$('bRot').textContent = 'Xem 3D'; $('bRot').title = 'Chuyển giữa mặt bằng nhìn thẳng và góc nghiêng 3D';
$('bRot').onclick = () => { FLAT = !FLAT; applyMode(); $('bRot').textContent = FLAT ? 'Xem 3D' : 'Mặt bằng'; $('bRot').classList.toggle('on', !FLAT); $('bRot').setAttribute('aria-pressed', !FLAT);
  const d = camera.position.distanceTo(controls.target); flyTo(controls.target.x, controls.target.z, FLAT ? d * 1.25 : d * .5, .85, .35) };
function openSide() { $('side').classList.add('open') }
$('bInfo').onclick = () => $('side').classList.toggle('open');

// ---------- loop ----------
function size() { const w = canvas.clientWidth, h = canvas.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix() }
addEventListener('resize', size); size();
camera.position.set(500, 4000, 3800); controls.target.set(0, 0, 0);
paintAll(); VIEWS['toan-canh'](); setTimeout(() => { if (!location.hash) VIEWS['toan-canh']() }, 900);
let loaded = false;
function hideLoad() { if (loaded) return; loaded = true; const l = $('load'); l.style.opacity = 0; setTimeout(() => l.remove(), 700) }
setTimeout(hideLoad, 6000);
renderer.setAnimationLoop(t => {
  if (anim) anim(t);
  if (rot && !anim) { const a = .0012, o = camera.position.clone().sub(controls.target); o.applyAxisAngle(new THREE.Vector3(0, 1, 0), a); camera.position.copy(controls.target).add(o) }
  controls.update();
  { const d = camera.position.distanceTo(controls.target) / (FLAT ? KF() / .82 : 1); edges.material.opacity = .35 * Math.max(0, Math.min(1, (3500 - d) / 2500)); edges.visible = edges.material.opacity > .01 }
  placeBadges(); renderer.render(scene, camera); placeLabels();
});
// mở theo #mã-căn
const hc = decodeURIComponent(location.hash.slice(1)); if (hc && byCode.has(norm(hc))) setTimeout(() => select(byCode.get(norm(hc)), true), 1300);
}
