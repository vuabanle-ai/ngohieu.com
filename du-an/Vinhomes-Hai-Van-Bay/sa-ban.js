import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import * as PTG from './ptg.js?v=1795548000';
{
// ===== Sa bàn 3D Vinhomes Hải Vân Bay – khu Đảo Ngọc =====
// lots-dao-ngoc.json: {meta:{w,h} (mét), lots:[[mã, loại Y|P|K, [[x,z]…] (mét, gốc góc trên-trái ảnh nền)]]}
// quy-hang.json: {updated, available:{mã:{src,tcbg,loai,dt,dtxd,gia,huong}}, sold:{}}
const $ = id => document.getElementById(id);
const small = matchMedia('(max-width:900px)').matches;
const TYPE = {
  Y: { name: 'Nhà liền kề', short: 'LK', h: 15, roof: 0xf2d35b },
  P: { name: 'Biệt thự song lập', short: 'SL', h: 12.5, roof: 0x8f86d6 },
  K: { name: 'Biệt thự đơn lập', short: 'ĐL', h: 11.5, roof: 0xf07fb5 }
};
const WALL = new THREE.Color(0xfbf8f2), AV = new THREE.Color(0x25b768), SD = new THREE.Color(0x8a8c90), CK = new THREE.Color(0xf5a623), DIM = new THREE.Color(0xe4e2dc), SEL = new THREE.Color(0xe31b23);
const SRC = { MV: 'Mai Việt Land', RBS: 'RBS', MH: 'Mayhomes', TP: 'Trường Phát (CEN)', RM: 'Roman', VHS: 'VHS' };
const VN = n => n.toLocaleString('vi-VN');
const ty = n => (n / 1e9).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' tỷ';

try { await Promise.race([document.fonts.load('800 25px "Be Vietnam Pro"'), new Promise(r => setTimeout(r, 2500))]) } catch (_) {}
const [data, quy] = await Promise.all([
  fetch('lots-dao-ngoc.json').then(r => r.json()),
  fetch('quy-hang.json?v=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.json() : { available: {} }).catch(() => ({ available: {} }))
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
scene.fog = new THREE.Fog(0xcfe0e6, 2600, 5200);
const camera = new THREE.PerspectiveCamera(42, 1, 2, 12000);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; controls.dampingFactor = .08;
controls.maxPolarAngle = Math.PI * .46; controls.minDistance = 40; controls.maxDistance = 3200;
controls.screenSpacePanning = false;
scene.add(new THREE.HemisphereLight(0xffffff, 0x8a9a7a, 1.15));
const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(-600, 900, 500); scene.add(sun);

// ground: mặt bằng làm nền
const tex = new THREE.TextureLoader().load(small ? 'nen-dao-ngoc-nho.jpg' : 'nen-dao-ngoc.jpg', () => { hideLoad(); if (curL) extras(curL, curQ) });
tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
const ground = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshLambertMaterial({ map: tex }));
ground.rotation.x = -Math.PI / 2; scene.add(ground);
const sea = new THREE.Mesh(new THREE.PlaneGeometry(W * 4, H * 4), new THREE.MeshBasicMaterial({ color: 0x8ec3cf }));
sea.rotation.x = -Math.PI / 2; sea.position.y = -0.6; scene.add(sea);

// ---------- lots ----------
const X = x => x - W / 2, Z = z => z - H / 2;
const lots = []; const geos = []; let vtx = 0;
const byCode = new Map();
for (const [code, t, poly] of data.lots) {
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
  const L = { poly, ax: lotAxis(poly.map(([x, z]) => [X(x), Z(z)])), code, t, i: lots.length, start: vtx, n, cx, cz: -cz, h, area, pre: code.split('-')[0], av: !!AVL[code], sd: !!SOLD[code], ck: !!CHK[code] };
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
const AMEN = [['VinWonders Hải Vân', 760, 330], ['Botanica Park', 430, 1138], ['Pearl Park', 642, 980], ['Emerald Boulevard', 1392, 937], ['Vinpearl Legend Lux Làng Vân', 1658, 875], ['Hệ thống trường học', 1755, 790], ['Sunlight Park', 1850, 600]];
// toạ độ tiện ích theo ảnh nền 2048px -> mét
const k2m = W / 2048;
for (const [t, px, pz] of AMEN) addLabel('zone tv', t, X(px * k2m), 30, Z(pz * k2m), 0, 2600);

const v = new THREE.Vector3();
function placeLabels() {
  const w = canvas.clientWidth, h = canvas.clientHeight, d = camera.position.distanceTo(controls.target);
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
  const t0 = performance.now(), fromT = controls.target.clone(), fromP = camera.position.clone();
  const to = new THREE.Vector3(tx, 0, tz);
  const p = new THREE.Vector3(Math.sin(az) * Math.sin(pol), Math.cos(pol), Math.cos(az) * Math.sin(pol)).multiplyScalar(dist).add(to);
  anim = s => { const k = Math.min(1, (s - t0) / 1100), e = k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
    controls.target.lerpVectors(fromT, to, e); camera.position.lerpVectors(fromP, p, e); if (k >= 1) anim = null };
}
function groupView(prefixes) {
  const L = lots.filter(l => prefixes.some(p => l.pre.startsWith(p)));
  if (!L.length) return;
  let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
  L.forEach(l => { x0 = Math.min(x0, l.cx); x1 = Math.max(x1, l.cx); z0 = Math.min(z0, l.cz); z1 = Math.max(z1, l.cz) });
  flyTo((x0 + x1) / 2, (z0 + z1) / 2, Math.max(260, Math.hypot(x1 - x0, z1 - z0) * 1.15), .85);
}
const VIEWS = {
  'toan-canh': () => flyTo(-140, -80, 1500, .9, -.25),
  ln: () => groupView(['LN']), lp: () => groupView(['LP']), an: () => groupView(['AN']),
  sv: () => groupView(['SV']), hc: () => groupView(['HC']), lv: () => groupView(['LV', 'ĐLĐN'])
};
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
  const rows = [['Phân khu', 'Đảo Ngọc'], ['Dãy', L.pre], ['Loại hình', q?.loai ? q.loai + ' · ' + TYPE[L.t].name : TYPE[L.t].name]];
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
  const can = q?.gia && !SOLD[L.code];
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
  const im = tex.image; if (!im || !im.width) { const c = document.createElement('canvas'); c.width = 4; c.height = 3; return c } const k = im.width / W, R = 70;   // bán kính ~70 m quanh căn
  let mx = 0, mz = 0; L.poly.forEach(([x, z]) => { mx += x; mz += z }); mx /= L.poly.length; mz /= L.poly.length;
  const cn = document.createElement('canvas'), Hh = Math.round(size * .75); cn.width = size; cn.height = Hh; const g = cn.getContext('2d');
  const sw = R * 2 * k, sh = sw * .75, sx = mx * k - sw / 2, sy = mz * k - sh / 2;
  g.fillStyle = '#cfe0e6'; g.fillRect(0, 0, size, Hh);
  try { g.drawImage(im, sx, sy, sw, sh, 0, 0, size, Hh) } catch (_) {}
  const s = size / sw, P = ([x, z]) => [(x * k - sx) * s, (z * k - sy) * s];
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
  g.fillText(`Vinhomes Hải Vân Bay · Đảo Ngọc · Dãy ${L.pre} · ${TYPE[L.t].name}`, 16, Hh - fs * .45);
  // la bàn
  g.font = `800 ${Math.round(fs * .6)}px "Be Vietnam Pro",Arial,sans-serif`; g.fillStyle = '#fff'; g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 4;
  g.strokeText('B ↑', size - fs * 2.2, fs * 1.1); g.fillText('B ↑', size - fs * 2.2, fs * 1.1);
  return cn;
}

// ---------- picking ----------
const ray = new THREE.Raycaster(), mp = new THREE.Vector2(); let down = null;
function pick(e) {
  const r = canvas.getBoundingClientRect(); mp.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
  ray.setFromCamera(mp, camera); const hit = ray.intersectObject(mesh)[0];
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
  $('qm').textContent = L ? '' : `Chưa tìm thấy căn ${q} trên sa bàn Đảo Ngọc.`;
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
function stopRot() { rot = false; $('bRot').classList.remove('on'); $('bRot').setAttribute('aria-pressed', 'false') }
$('bRot').onclick = () => { rot = !rot; $('bRot').classList.toggle('on', rot); $('bRot').setAttribute('aria-pressed', rot) };
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
  controls.update(); renderer.render(scene, camera); placeLabels();
});
// mở theo #mã-căn
const hc = decodeURIComponent(location.hash.slice(1)); if (hc && byCode.has(norm(hc))) setTimeout(() => select(byCode.get(norm(hc)), true), 1300);
}
