import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
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
const WALL = new THREE.Color(0xfbf8f2), AV = new THREE.Color(0x25b768), SD = new THREE.Color(0x8a8c90), DIM = new THREE.Color(0xe4e2dc), SEL = new THREE.Color(0xe31b23);
const SRC = { MV: 'Mai Việt Land', RBS: 'RBS', MH: 'Mayhomes', TP: 'Trường Phát (CEN)', RM: 'Roman' };
const VN = n => n.toLocaleString('vi-VN');
const ty = n => (n / 1e9).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' tỷ';

const [data, quy] = await Promise.all([
  fetch('lots-dao-ngoc.json').then(r => r.json()),
  fetch('quy-hang.json?v=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.json() : { available: {} }).catch(() => ({ available: {} }))
]);
const W = data.meta.w, H = data.meta.h;
const AVL = quy.available || {}, SOLD = quy.sold || {};

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
const tex = new THREE.TextureLoader().load(small ? 'nen-dao-ngoc-nho.jpg' : 'nen-dao-ngoc.jpg', () => hideLoad());
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
  const L = { code, t, i: lots.length, start: vtx, n, cx, cz: -cz, h, area, pre: code.split('-')[0], av: !!AVL[code], sd: !!SOLD[code] };
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
  if (mode === 'mo-ban') return L.av ? AV : L.sd ? SD : DIM;
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
function paintAll() { lots.forEach(paint); colors.needsUpdate = true; legend() }

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
// mã căn: chỉ hiện khi phóng gần (tạo lười theo khung nhìn)
const codeLabels = lots.map(L => ({ L, el: null }));
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
  const show = d < 420; let shown = 0;
  for (const o of codeLabels) {
    let vis = false;
    if (show && shown < 260) {
      v.set(o.L.cx, o.L.h + 1, o.L.cz).project(camera);
      vis = v.z < 1 && Math.abs(v.x) < 1 && Math.abs(v.y) < 1;
    }
    if (vis) {
      if (!o.el) { o.el = document.createElement('div'); o.el.className = 'lb code' + (o.L.av ? ' av' : o.L.sd ? ' sd' : ''); o.el.textContent = o.L.code; lbBox.appendChild(o.el) }
      o.el.style.display = ''; o.el.style.transform = `translate(-50%,-50%) translate(${(v.x + 1) / 2 * w}px,${(1 - v.y) / 2 * h}px)`; shown++;
    } else if (o.el) o.el.style.display = 'none';
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
  const sd = SOLD[L.code], q = AVL[L.code] || sd;
  $('cTag').textContent = AVL[L.code] ? 'Còn hàng' : sd ? 'Đã bán' : TYPE[L.t].name;
  $('card').classList.toggle('open', !!AVL[L.code]); $('card').classList.toggle('sold', !!sd);
  $('cTitle').textContent = L.code;
  $('cText').textContent = AVL[L.code] ? 'Còn trên bảng hàng của ' + q.src.map(s => SRC[s] || s).join(', ') + '.' : sd ? 'Đã bán: ' + (sd.why || '').replace(/MV|RBS|MH|TP|RM/g, m => SRC[m]) + '.' : 'Chưa thấy trên bảng hàng đại lý đang theo dõi.';
  const rows = [['Phân khu', 'Đảo Ngọc'], ['Dãy', L.pre], ['Loại hình', q?.loai ? q.loai + ' · ' + TYPE[L.t].name : TYPE[L.t].name]];
  if (q?.dt) rows.push(['DT đất', q.dt + ' m²']); else rows.push(['DT đất (ước tính)', '≈ ' + fmtArea(L.area / .81)]);
  if (q?.dtxd) rows.push(['DT xây dựng', q.dtxd + ' m²']);
  if (q?.tcbg) rows.push(['Tiêu chuẩn bàn giao', q.tcbg]);
  if (q?.huong) rows.push(['Hướng', q.huong]);
  if (q?.gia) rows.push(['Giá gồm VAT & KPBT', VN(q.gia) + ' đ']);
  $('cRows').innerHTML = rows.map(([a, b]) => `<dt>${a}</dt><dd${a.startsWith('Giá') ? ' class="big"' : ''}>${b}</dd>`).join('');
  $('card').classList.add('show');
  if (fly) flyTo(L.cx, L.cz, 260, .9, controls.getAzimuthalAngle());
}
$('cardX').onclick = () => select(null);

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
  canvas.style.cursor = 'pointer'; const q = AVL[L.code] || SOLD[L.code];
  tip.innerHTML = `<b>${L.code}</b>${AVL[L.code] ? '<i>Còn hàng</i>' : SOLD[L.code] ? '<i class="sold">Đã bán</i>' : ''}<span class="s">${TYPE[L.t].name}${q?.gia ? ' · ' + ty(q.gia) : ''}</span>`;
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
const avl = Object.entries(AVL).sort((a, b) => (a[1].gia || 9e15) - (b[1].gia || 9e15));
const onMap = avl.filter(([c]) => byCode.has(c)), off = avl.filter(([c]) => !byCode.has(c));
$('quyN').textContent = avl.length; $('quyD').textContent = quy.updated || '';
$('quy').innerHTML = onMap.map(([c, q]) => `<li><button data-c="${c}"><b>${c}</b><span>${q.loai || ''} · ${q.dt || '?'} m²</span><em${q.gia ? '' : ' class="g"'}>${q.gia ? ty(q.gia) : 'liên hệ'}</em></button></li>`).join('');
const sdl = Object.entries(SOLD).filter(([c]) => byCode.has(c));
$('sdN').textContent = sdl.length;
$('sold').innerHTML = sdl.map(([c, q]) => `<li><button data-c="${c}"><b>${c}</b><span>${q.loai || ''} · ${q.dt || '?'} m²</span><em class="g">Đã bán</em></button></li>`).join('');
$('sold').onclick = e => { const b = e.target.closest('button'); if (b) select(byCode.get(b.dataset.c), true) };
if (off.length) { $('nopos').hidden = false; $('nopos').textContent = 'Chưa định vị trên sa bàn: ' + off.map(x => x[0]).join(', ') + '.' }
$('quy').onclick = e => { const b = e.target.closest('button'); if (b) select(byCode.get(b.dataset.c), true) };

// ---------- legend ----------
function legend() {
  const items = mode === 'mo-ban'
    ? [[AV.getStyle(), 'Còn hàng', lots.filter(l => l.av).length], [SD.getStyle(), 'Đã bán', lots.filter(l => l.sd).length], [DIM.getStyle(), 'Chưa có trên bảng hàng', lots.filter(l => !l.av && !l.sd).length]]
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
