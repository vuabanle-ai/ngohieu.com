import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
{
// ===== Sa bàn 3D Vinhomes King Park – Bắc Ninh: tổng mặt bằng + từng căn phân khu Thời Đại & Hưng Thịnh =====
// lots-dao-ngoc.json: {meta:{w,h} (mét), lots:[[mã, loại Y|P|K, [[x,z]…] (mét, gốc góc trên-trái ảnh nền)]]}
// quy-hang.json: {updated, available:{mã:{src,tcbg,loai,dt,dtxd,gia,huong}}, sold:{}}
const $ = id => document.getElementById(id);
const KHU = 'king-park';
const ZNAME = { TD: 'Thời Đại', HT: 'Hưng Thịnh' };
const duAn = () => 'Vinhomes King Park';
const small = matchMedia('(max-width:900px)').matches;
const TYPE = {
  Y: { name: 'Nhà liền kề', short: 'LK', h: 15, roof: 0xf2d35b },
  S: { name: 'Shophouse', short: 'SH', h: 17, roof: 0x6a80cc },
  P: { name: 'Biệt thự song lập', short: 'SL', h: 12.5, roof: 0xa59fd0 },
  K: { name: 'Biệt thự đơn lập', short: 'ĐL', h: 11.5, roof: 0xf07f9f }
};
const WALL = new THREE.Color(0xfbf8f2), WHITE = new THREE.Color(0xffffff), AV = new THREE.Color(0x25b768), SD = new THREE.Color(0x8a8c90), CK = new THREE.Color(0xf5a623), DIM = new THREE.Color(0xe4e2dc), SEL = new THREE.Color(0xe31b23);
const SRC = {}; // tên khác hiển thị nguyên văn
const VN = n => n.toLocaleString('vi-VN');
const ty = n => (n / 1e9).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' tỷ';

try { await Promise.race([document.fonts.load('800 25px "Be Vietnam Pro"'), new Promise(r => setTimeout(r, 2500))]) } catch (_) {}
const [data, quy] = await Promise.all([
  fetch(`lots-${KHU}.json?v=5`).then(r => r.json()),
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
  const t = new THREE.TextureLoader().load(`${g.img}${small ? '-nho' : ''}.webp?v=1`, () => { if (++nTex === data.meta.grounds.length) hideLoad() });
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); texs.push(t);
  const c = g.corners, geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(c.flatMap(([x, z]) => [x - W / 2, 0, z - H / 2]), 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1, 1, 1, 1, 0, 0, 0], 2)); geo.setIndex([0, 2, 1, 0, 3, 2]);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, alphaTest: .02 }));
  m.position.y = gi * .02; m.renderOrder = -10 + gi; scene.add(m);
}
// ---------- lots: nhà theo kiến trúc tân cổ điển (theo phối cảnh CĐT) ----------
// mặt đứng vẽ bằng canvas: mỗi cột atlas = 1 bước cột (bay); thân nhà + mái mansard xám đá có cửa sổ áp mái
const ARCH = {   // số tầng thân (chưa tính tầng áp mái), chiều cao thân (m), cột atlas mặt tiền, bước cột (m)
  Y: { fl: 4, hb: 14.3, col: 0, bay: 5.5, man: 3.2 },   // mặt đứng CĐT: tầng 1 4,1m + 3 tầng × 3,4m; tầng 5 áp mái 3,2m → 17,5m
  S: { fl: 4, hb: 14.3, col: 1, bay: 6, man: 3.2 },
  P: { fl: 3, hb: 11.55, col: 2, bay: 7.5, man: 3.7 },   // SL1: 0,45 + 4,1 + 3,5 + 3,5; áp mái 3,5 → 15,25m
  K: { fl: 3, hb: 11.55, col: 2, bay: 7.5, man: 3.7 }
};
const ZARCH = { TD: 'Hiện đại', HT: 'Tân cổ điển' };   // theo tài liệu CĐT: PK1 Thời Đại kiến trúc hiện đại, PK2 Hưng Thịnh kiến trúc tân cổ điển
const MODERN = z => z === 'TD';
const HTB = new Set(['HT', 'HT10', 'HT11', 'HT12', 'HT15', 'HT16', 'HT17']);   // khu 3B (Hưng Thịnh - B): LKE, SHA, SL1, ĐL
// chọn cột mặt đứng / tường hồi / mái theo mẫu nhà từng dãy
function arch(zone, t, code) { const pre = code.split('-')[0], n = parseInt(code.split('-')[1]) || 0;
  if (zone === 'TD') return { f: t === 'S' ? 9 : 8, s: 11, r: t === 'S' ? 12 : 10, m: t === 'S' ? 'SHB/SHD' : 'LKB' };
  if (HTB.has(pre)) return (t === 'P' || t === 'K') ? { f: 2, s: 3, r: 5, m: t === 'K' ? 'ĐL' : 'SL1' } : { f: 13, s: 3, r: 7, m: t === 'S' ? 'SHA' : 'LKE' };
  return t === 'S' ? { f: 1, s: 3, r: n % 4 < 2 ? 4 : 14, m: 'SHC' } : { f: 0, s: 3, r: n % 4 < 2 ? 4 : 14, m: 'LKA' } }
const MAN = 3.2, MIN = 1.1;   // mái mansard: cao 3,2 m, lùi vào 1,1 m
const NCOL = 15, CW_ = 256, CH_ = 1024;   // atlas: 0 LK, 1 SH, 2 BT, 3 tường hồi, 4 mái mansard, 5–7 trắng (mặt mái), 8 LK hiện đại, 9 SH hiện đại, 10 mái dốc kim loại hiện đại, 11 tường hồi hiện đại
const facade = (() => {
  const cn = document.createElement('canvas'); cn.width = CW_ * NCOL; cn.height = CH_ * 3; const g = cn.getContext('2d');
  const CREAM = '#f4eee3', LINE = '#ddd2bf', GLASS = '#4f6272', FRAME = '#fbf9f4', IRON = '#26292d';
  const win = (x, y, w, h, arch) => { g.fillStyle = FRAME; g.beginPath(); if (arch) { g.moveTo(x - 6, y + h + 6); g.lineTo(x - 6, y + w / 2); g.arc(x + w / 2, y + w / 2, w / 2 + 6, Math.PI, 0); g.lineTo(x + w + 6, y + h + 6) } else g.rect(x - 6, y - 6, w + 12, h + 12); g.fill();
    g.fillStyle = GLASS; g.beginPath(); if (arch) { g.moveTo(x, y + h); g.lineTo(x, y + w / 2); g.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w, y + h) } else g.rect(x, y, w, h); g.fill();
    g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x + 4, y + 4, w * .35, h - 8); g.fillStyle = FRAME; g.fillRect(x + w / 2 - 2, y, 4, h); g.fillRect(x, y + h * .55, w, 4) };
  const cornice = (y, t = 14) => { g.fillStyle = '#fffdf8'; g.fillRect(0, y, CW_, t); g.fillStyle = LINE; g.fillRect(0, y + t, CW_, 4) };
  const rail = (x, y, w) => { g.fillStyle = '#e9e2d4'; g.fillRect(x - 10, y + 30, w + 20, 10); g.fillStyle = IRON; for (let k = x; k <= x + w; k += 9) g.fillRect(k, y, 3, 30); g.fillRect(x - 4, y, w + 8, 4) };
  const body = (c, floors, ground) => { const x0 = c * CW_; g.save(); g.translate(x0, 0);
    g.fillStyle = CREAM; g.fillRect(0, 0, CW_, CH_);
    // gờ trụ hai bên
    g.fillStyle = '#ece4d4'; g.fillRect(0, 0, 10, CH_); g.fillRect(CW_ - 10, 0, 10, CH_);
    const gh = CH_ * ground, fh = (CH_ - gh - 40) / (floors - 1);
    cornice(0, 26);                       // diềm mái trên cùng
    for (let k = 0; k < floors - 1; k++) { const y = 40 + k * fh; win(70, y + fh * .16, 116, fh * .66, k === 0); if (k < floors - 2) rail(70, y + fh * .56, 116); cornice(y + fh - 10, 10) }
    // tầng 1
    const y1 = CH_ - gh;
    if (c === 1) { g.fillStyle = '#e8dfcd'; g.fillRect(0, y1, CW_, gh); win(26, y1 + gh * .12, 204, gh * .86, true); g.fillStyle = '#3b3f44'; g.fillRect(14, y1 + 6, CW_ - 28, 16) }   // shophouse: cửa kính vòm lớn + mái hiên
    else { g.fillStyle = '#ebe3d2'; g.fillRect(0, y1, CW_, gh); for (let k = y1 + 18; k < CH_; k += 22) { g.fillStyle = '#e1d7c4'; g.fillRect(0, k, CW_, 3) } win(62, y1 + gh * .18, 132, gh * .8, true) }
    g.restore() };
  body(0, 4, .27); body(1, 4, .31); body(2, 3, .34);
  // tường hồi: trơn, có gờ tầng và ô cửa nhỏ
  { const x0 = 3 * CW_; g.fillStyle = CREAM; g.fillRect(x0, 0, CW_, CH_); for (let k = 1; k < 4; k++) { g.fillStyle = LINE; g.fillRect(x0, k * CH_ / 4, CW_, 6) } g.fillStyle = '#fffdf8'; g.fillRect(x0, 0, CW_, 26) }
  // mái mansard: ngói đá xám + cửa sổ áp mái
  { const x0 = 4 * CW_; g.fillStyle = '#4d535b'; g.fillRect(x0, 0, CW_, CH_); g.fillStyle = 'rgba(0,0,0,.18)'; for (let k = 0; k < CH_; k += 26) g.fillRect(x0, k, CW_, 3);
    g.fillStyle = '#f6f2ea'; g.fillRect(x0 + 78, 300, 100, 560); g.beginPath(); g.moveTo(x0 + 66, 310); g.lineTo(x0 + 128, 230); g.lineTo(x0 + 190, 310); g.fill(); g.fillStyle = GLASS; g.fillRect(x0 + 92, 330, 72, 500); g.fillStyle = '#f6f2ea'; g.fillRect(x0 + 126, 330, 4, 500) }
  { const x0 = 5 * CW_; g.fillStyle = '#ffffff'; g.fillRect(x0, 0, CW_ * 3, CH_) }
  // ---- kiến trúc hiện đại (Thời Đại, theo mặt đứng mẫu LKA/LKB/SHB/SHD): khung trắng, kính khổ lớn, gờ sàn ngang, lan can kính, chân đế ốp gỗ/đồng ----
  const modern = (c, floors, ground, shop) => { const x0 = c * CW_; g.save(); g.translate(x0, 0);
    const WHITE2 = '#f7f7f4', GREY = '#d9dcdf', DARKG = '#3a4047', MGLASS = '#5d7080';
    g.fillStyle = WHITE2; g.fillRect(0, 0, CW_, CH_);
    const gh = CH_ * ground, fh = (CH_ - gh - 30) / (floors - 1), y1 = CH_ - gh;
    g.fillStyle = DARKG; g.fillRect(0, 0, CW_, 30);                          // diềm mái mỏng tối màu
    for (let k = 0; k < floors - 1; k++) { const y = 30 + k * fh;
      g.fillStyle = MGLASS; g.fillRect(22, y + fh * .1, CW_ - 44, fh * .78);   // kính khổ lớn gần kín tầng
      g.fillStyle = 'rgba(255,255,255,.16)'; g.fillRect(30, y + fh * .12, (CW_ - 60) * .28, fh * .74);
      g.fillStyle = WHITE2; g.fillRect(CW_ / 2 - 3, y + fh * .1, 6, fh * .78);   // đố kính
      g.fillStyle = 'rgba(220,235,240,.55)'; g.fillRect(22, y + fh * .62, CW_ - 44, fh * .26);   // lan can kính
      g.fillStyle = '#fbfbf9'; g.fillRect(0, y + fh - 14, CW_, 14); g.fillStyle = GREY; g.fillRect(0, y + fh, CW_, 4) }   // gờ sàn ngang
    g.fillStyle = GREY; g.fillRect(0, 0, 14, CH_ - gh); g.fillRect(CW_ - 14, 0, 14, CH_ - gh);   // khung đứng hai bên
    // tầng 1: chân đế ốp tông đồng/gỗ ấm, cửa kính sát đất
    g.fillStyle = shop ? '#a8865c' : '#b99a72'; g.fillRect(0, y1, CW_, gh);
    g.fillStyle = MGLASS; g.fillRect(shop ? 16 : 40, y1 + gh * .14, shop ? CW_ - 32 : CW_ - 80, gh * .82);
    g.fillStyle = 'rgba(255,230,180,.25)'; g.fillRect(shop ? 16 : 40, y1 + gh * .5, shop ? CW_ - 32 : CW_ - 80, gh * .46);   // ánh đèn cửa hàng
    g.fillStyle = DARKG; g.fillRect(0, y1, CW_, 12); g.restore() };
  modern(8, 4, .27, false); modern(9, 4, .31, true);

  { const x0 = 10 * CW_; g.fillStyle = '#3f454c'; g.fillRect(x0, 0, CW_, CH_); g.fillStyle = 'rgba(255,255,255,.07)'; for (let k = 8; k < CW_; k += 22) g.fillRect(x0 + k, 0, 3, CH_);   // mái kim loại sóng đứng
    g.fillStyle = '#5d7080'; g.fillRect(x0 + 40, 260, CW_ - 80, 520); g.fillStyle = '#f7f7f4'; g.fillRect(x0 + 34, 254, CW_ - 68, 8); g.fillRect(x0 + 34, 778, CW_ - 68, 8) }   // ô kính lớn tầng tum
  { const x0 = 11 * CW_; g.fillStyle = '#f2f2ef'; g.fillRect(x0, 0, CW_, CH_); for (let k = 1; k < 4; k++) { g.fillStyle = '#dcdfe2'; g.fillRect(x0, k * CH_ / 4, CW_, 5) } g.fillStyle = '#3a4047'; g.fillRect(x0, 0, CW_, 30) }


  // ======== mặt ngoài theo mẫu nhà CĐT (tài liệu đào tạo 09/11/2026) — vẽ đè lên các cột cũ ========
  const clr = (c, col) => { g.fillStyle = col; g.fillRect(c * CW_, 0, CW_, CH_) };
  const box = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h) };
  const glass = (x, y, w, h, fr = '#2b2f33', gl = '#6f8796') => { box(x - 5, y - 5, w + 10, h + 10, fr); box(x, y, w, h, gl); box(x + 4, y + 4, w * .3, h - 8, 'rgba(255,255,255,.18)'); box(x + w / 2 - 2, y, 4, h, fr) };
  const iron = (x, y, w, hh = 34) => { box(x - 4, y, w + 8, 5, '#1f2226'); for (let k = x; k <= x + w; k += 8) box(k, y, 3, hh, '#1f2226'); box(x - 4, y + hh, w + 8, 5, '#1f2226') };
  const archWin = (x, y, w, h, fr, gl) => { g.fillStyle = fr; g.beginPath(); g.moveTo(x - 7, y + h + 7); g.lineTo(x - 7, y + w / 2); g.arc(x + w / 2, y + w / 2, w / 2 + 7, Math.PI, 0); g.lineTo(x + w + 7, y + h + 7); g.fill();
    g.fillStyle = gl; g.beginPath(); g.moveTo(x, y + h); g.lineTo(x, y + w / 2); g.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w, y + h); g.fill(); box(x + w / 2 - 2, y + w / 2, 4, h - w / 2, fr) };
  const shopGround = (x0, gh, wall, door) => { const y1 = CH_ - gh; box(x0, y1, CW_, gh, wall); box(x0, y1, CW_, 14, 'rgba(0,0,0,.25)'); glass(x0 + 30, y1 + gh * .2, CW_ - 60, gh * .76, door, '#7d97a6') };
  // HT-A · mẫu LKA (liền kề tân cổ điển): thân trắng, cửa sổ ô kính đen, ban công sắt, tầng 1 ốp nâu gỗ
  { const c = 0, x0 = c * CW_, gh = CH_ * .23, fh = (CH_ - gh) / 4; clr(c, '#f6f3ee');
    for (let k = 0; k < 4; k++) { const y = k * fh; box(x0, y + fh - 12, CW_, 12, '#e6e0d6'); glass(x0 + 48, y + fh * .16, 64, fh * .66); glass(x0 + 144, y + fh * .16, 64, fh * .66); if (k < 2) iron(x0 + 36, y + fh * .6, 184) }
    box(x0, 0, 10, CH_ - gh, '#ebe6dd'); box(x0 + CW_ - 10, 0, 10, CH_ - gh, '#ebe6dd'); shopGround(x0, gh, '#8b5e3c', '#3a2a1e') }
  // HT-A · mẫu SHC (shophouse tân cổ điển): như LKA, tầng 1–2 khung nâu (cổng thương mại 2 tầng)
  { const c = 1, x0 = c * CW_, gh = CH_ * .4, fh = (CH_ - gh) / 3; clr(c, '#f6f3ee');
    for (let k = 0; k < 3; k++) { const y = k * fh; box(x0, y + fh - 12, CW_, 12, '#e6e0d6'); glass(x0 + 48, y + fh * .16, 64, fh * .66); glass(x0 + 144, y + fh * .16, 64, fh * .66); if (k === 0) iron(x0 + 36, y + fh * .6, 184) }
    const y1 = CH_ - gh; box(x0, y1, CW_, gh, '#7e5434'); glass(x0 + 34, y1 + 30, CW_ - 68, gh * .36, '#3a2a1e', '#88a3b1'); box(x0, y1 + gh * .46, CW_, 22, '#2c2420'); glass(x0 + 34, y1 + gh * .56, CW_ - 68, gh * .4, '#3a2a1e', '#88a3b1') }
  // HT-B · mẫu SL1 (song lập/đơn lập): biệt thự trắng 3 tầng, tầng 1 kem, ban công sắt
  { const c = 2, x0 = c * CW_, gh = CH_ * .32, fh = (CH_ - gh) / 2; clr(c, '#f8f6f1');
    for (let k = 0; k < 2; k++) { const y = k * fh; box(x0, y + fh - 14, CW_, 14, '#e7e2d8'); glass(x0 + 70, y + fh * .14, 116, fh * .7); iron(x0 + 50, y + fh * .58, 156) }
    const y1 = CH_ - gh; box(x0, y1, CW_, gh, '#efe5cf'); for (let k = y1 + 24; k < CH_; k += 26) box(x0, k, CW_, 3, '#e2d6bc'); glass(x0 + 60, y1 + gh * .22, 136, gh * .7, '#3b3f44') }
  // TĐ · mẫu LKA/LKB (liền kề hiện đại): tường trắng, khung cửa xám đậm, ban công lan can sắt mảnh, lam gỗ dọc
  { const c = 8, x0 = c * CW_, gh = CH_ * .23, fh = (CH_ - gh) / 4; clr(c, '#f7f7f5');
    for (let k = 0; k < 4; k++) { const y = k * fh; box(x0, y + fh - 16, CW_, 16, '#fbfbfa'); box(x0, y + fh, CW_, 4, '#cfd2d5');
      glass(x0 + 26, y + fh * .12, 150, fh * .74, '#3c4248', '#5f7684'); iron(x0 + 22, y + fh * .58, 158, 26);
      box(x0 + 192, y + 6, 46, fh - 16, '#a77b52'); for (let q = x0 + 196; q < x0 + 236; q += 9) box(q, y + 6, 3, fh - 16, '#7a5534') }   // lam gỗ
    shopGround(x0, gh, '#5b5f63', '#2e3236') }
  // TĐ · mẫu SHB/SHD (shophouse hiện đại): thân xám than, khung hộp trắng nhô ra ôm tầng 2–4, lam gỗ, tầng 1 kính thương mại
  { const c = 9, x0 = c * CW_, gh = CH_ * .27, fh = (CH_ - gh) / 4; clr(c, '#4c5662');
    box(x0 + 14, fh * .9, CW_ - 70, fh * 3.05, '#f3f3f1'); box(x0 + 34, fh * 1.0, CW_ - 110, fh * 2.85, '#4c5662');   // khung hộp trắng
    for (let k = 0; k < 4; k++) { const y = k * fh; glass(x0 + 44, y + fh * .14, CW_ - 130, fh * .72, '#2a2f35', '#6d8594'); box(x0 + 40, y + fh * .62, CW_ - 122, fh * .24, 'rgba(210,228,236,.5)') }
    box(x0 + CW_ - 52, 0, 40, CH_ - gh, '#b48756'); for (let q = x0 + CW_ - 50; q < x0 + CW_ - 14; q += 8) box(q, 0, 3, CH_ - gh, '#7d5733');   // lam gỗ dọc
    const y1 = CH_ - gh; box(x0, y1 - 18, CW_, 18, '#8c7a62'); box(x0, y1, CW_, gh, '#3b3e42'); glass(x0 + 18, y1 + gh * .24, CW_ - 36, gh * .72, '#2b2b2b', '#8aa4b2'); box(x0 + 18, y1 + gh * .08, CW_ - 36, gh * .12, '#2d3135') }
  // TĐ · mái: tầng tum lùi, mái dốc kim loại xám đậm (LKB) / tầng kính lùi + mái bằng (SHB)
  { const c = 12, x0 = c * CW_; clr(c, '#3d434a'); glass(x0 + 30, 200, CW_ - 60, 600, '#2a2f35', '#647b89'); box(x0, 0, CW_, 40, '#2b3036'); box(x0, CH_ - 30, CW_, 30, '#8c7a62') }
  // HT-B · mẫu LKE: thân màu be-taupe, vòm trắng cao chạy suốt tầng 2–5, tầng 1 xám đậm
  { const c = 13, x0 = c * CW_, gh = CH_ * .23, top = 30; clr(c, '#cdbfae');
    g.fillStyle = '#faf8f4'; g.beginPath(); g.moveTo(x0 + 40, CH_ - gh); g.lineTo(x0 + 40, top + 88); g.arc(x0 + 128, top + 88, 88, Math.PI, 0); g.lineTo(x0 + 216, CH_ - gh); g.lineTo(x0 + 196, CH_ - gh); g.lineTo(x0 + 196, top + 88); g.arc(x0 + 128, top + 88, 68, 0, Math.PI, true); g.lineTo(x0 + 60, CH_ - gh); g.fill();
    const fh = (CH_ - gh - top - 30) / 4; for (let k = 0; k < 4; k++) { const y = top + 30 + k * fh; box(x0 + 60, y + fh - 10, 136, 10, '#9d9184'); glass(x0 + 76, y + fh * .14, 104, fh * .7, '#2a2d31', '#6c8492'); iron(x0 + 70, y + fh * .58, 116, 24) }
    shopGround(x0, gh, '#4f5357', '#2b2e31') }
  // mái mansard có cửa sổ áp mái vòm (LKA xen kẽ, LKE, SL1)
  { const c = 14, x0 = c * CW_; clr(c, '#4b5159'); g.fillStyle = 'rgba(0,0,0,.18)'; for (let k = 0; k < CH_; k += 26) g.fillRect(x0, k, CW_, 3);
    archWin(x0 + 78, 260, 100, 600, '#f6f2ea', '#4f6272') }
  const t = new THREE.CanvasTexture(cn); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.generateMipmaps = true;
  // ảnh mặt đứng thật của CĐT, cắt TỪNG CĂN theo đúng thứ tự trên bản vẽ (2 hàng dưới của atlas, ô rộng 128px)
  const im = new Image(); im.onload = () => { g.drawImage(im, 0, CH_); t.needsUpdate = true }; im.src = 'mat-tien.webp?v=2';
  return t;
})();
const X = x => x - W / 2, Z = z => z - H / 2;
const lots = []; let vtx = 0;
const byCode = new Map();
const P_ = [], N_ = [], U_ = [], C_ = [];
const SLOT = {"LKA": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], "SHC": [10, 11, 12, 13, 14, 15], "LKE": [16, 17, 18, 19, 20, 21, 22, 23, 24], "SL1": [25, 26], "SHB": [27, 28, 29, 30, 31, 32], "LKB": [33, 34, 35, 36], "SHD": [37, 38, 39]};   // mẫu → các ô ảnh mặt tiền từng căn, theo thứ tự trái → phải trên mặt đứng CĐT
const IU = (sl, a, v) => { const r = Math.floor(sl / 30), c = sl % 30; return [(c * 128 + 2 + a * 124) / (CW_ * NCOL), (2 - r) / 3 - 1 / 3 + (.004 + v * .992) / 3, 1] };
// thứ tự căn trong một dãy: cùng tiền tố + cùng chẵn/lẻ là một hàng nhà liền nhau
const ROWN = new Map(); for (const [c] of data.lots) { const [p, n] = c.split('-'), k = p + '|' + (parseInt(n) % 2); ROWN.set(k, Math.max(ROWN.get(k) || 0, Math.floor((parseInt(n) - 1) / 2))) }
function unitSlot(m, code) { const seq = SLOT[m]; if (!seq) return -1; const [p, ns] = code.split('-'), n = parseInt(ns) || 0, k = Math.floor((n - 1) / 2), last = ROWN.get(p + '|' + (n % 2)) || 0, N = seq.length;
  if (N <= 2) return seq[k % N];
  if (k === 0) return seq[0]; if (k === last) return seq[N - 1]; return seq[1 + (k - 1) % (N - 2)] }
const U = (c, a) => (c * CW_ + 3 + a * (CW_ - 6)) / (CW_ * NCOL);   // u trong một cột atlas (chừa mép chống loang)
const faceDot = (a, b, c, n) => { const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  return (uy * vz - uz * vy) * n[0] + (uz * vx - ux * vz) * n[1] + (ux * vy - uy * vx) * n[2] };
function tri(A, B, C, n) { if (faceDot(A[0], B[0], C[0], n) < 0) [B, C] = [C, B];   // mặt trước luôn quay theo pháp tuyến
  for (const [p, q] of [A, B, C]) { P_.push(...p); N_.push(...n); U_.push(q[0], q.length > 2 ? q[1] : 2 / 3 + q[1] / 3); C_.push(1, 1, 1) } }
function quad(a, b, c, d, n, uv) { tri([a, uv[0]], [b, uv[1]], [c, uv[2]], n); tri([a, uv[0]], [c, uv[2]], [d, uv[3]], n) }
function inset(poly, D) {   // lùi từng cạnh đa giác lồi vào trong D[i] mét
  const n = poly.length; let cx = 0, cz = 0; poly.forEach(p => { cx += p[0]; cz += p[1] }); cx /= n; cz /= n;
  const lines = poly.map((p, i) => { const q = poly[(i + 1) % n]; let dx = q[0] - p[0], dz = q[1] - p[1]; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
    let nx = -dz, nz = dx; if ((cx - p[0]) * nx + (cz - p[1]) * nz < 0) { nx = -nx; nz = -nz } return { x: p[0] + nx * D[i], z: p[1] + nz * D[i], dx, dz, l } });
  const out = lines.map((L1, i) => { const L0 = lines[(i + n - 1) % n]; const den = L0.dx * L1.dz - L0.dz * L1.dx;
    if (Math.abs(den) < 1e-3) return [L1.x, L1.z]; const t = ((L1.x - L0.x) * L1.dz - (L1.z - L0.z) * L1.dx) / den; return [L0.x + L0.dx * t, L0.z + L0.dz * t] });
  const ok = out.every(([x, z]) => Math.hypot(x - cx, z - cz) < 60) && Math.abs(THREE.ShapeUtils.area(out.map(p => new THREE.Vector2(...p)))) > 4;
  return ok ? out : poly.map(([x, z]) => [cx + (x - cx) * .75, cz + (z - cz) * .75]);
}
for (const [code, t, poly, zone, dt] of data.lots) {
  const start = P_.length / 3;
  let cx = 0, cz = 0; poly.forEach(([x, z]) => { cx += X(x); cz += Z(z) }); cx /= poly.length; cz /= poly.length;
  // co nhẹ để tách từng căn
  let base = poly.map(([x, z]) => [cx + (X(x) - cx) * .94, cz + (Z(z) - cz) * .94]);
  if (THREE.ShapeUtils.area(base.map(p => new THREE.Vector2(p[0], p[1]))) < 0) base = base.reverse();
  const AR = arch(zone, t, code), A = ARCH[t] || ARCH.Y, mk = AR.m === 'SHB/SHD' ? (code.split('-')[0] === 'TD' ? 'SHD' : 'SHB') : AR.m === 'SHA' ? 'LKE' : AR.m === 'ĐL' ? 'SL1' : AR.m, sl = unitSlot(mk, code), ax = lotAxis(base), hb = A.hb, isFront = (p, q) => { const dx = q[0] - p[0], dz = q[1] - p[1], l = Math.hypot(dx, dz) || 1; return Math.abs((dx * ax.ux + dz * ax.uz) / l) < .5 },
    top = inset(base, base.map((p, i) => isFront(p, base[(i + 1) % base.length]) ? MIN : 0)), h = hb + (A.man || MAN), vb = hb / h;
  const n = base.length;
  // tường thân: chia theo bước cột; cạnh ngang lô (mặt tiền/mặt hậu) dùng mặt đứng, cạnh dọc dùng tường hồi
  for (let i = 0; i < n; i++) { const p = base[i], q = base[(i + 1) % n]; const dx = q[0] - p[0], dz = q[1] - p[1], len = Math.hypot(dx, dz); if (len < .2) continue;
    let nx = dz / len, nz = -dx / len; if (((p[0] + q[0]) / 2 - cx) * nx + ((p[1] + q[1]) / 2 - cz) * nz < 0) { nx = -nx; nz = -nz }
    const front = Math.abs((dx * ax.ux + dz * ax.uz) / len) < .5, col = front ? AR.f : AR.s, img = front && sl >= 0, nb = img ? 1 : Math.max(1, Math.round(len / (front ? A.bay : 4)));
    for (let k = 0; k < nb; k++) { const a0 = k / nb, a1 = (k + 1) / nb, x0 = p[0] + dx * a0, z0 = p[1] + dz * a0, x1 = p[0] + dx * a1, z1 = p[1] + dz * a1;
      quad([x0, 0, z0], [x1, 0, z1], [x1, hb, z1], [x0, hb, z0], [nx, 0, nz], img ? [IU(sl, 0, 0), IU(sl, 1, 0), IU(sl, 1, vb), IU(sl, 0, vb)] : [[U(col, 0), 0], [U(col, 1), 0], [U(col, 1), 1], [U(col, 0), 1]]) } }
  // mái mansard: mặt nghiêng từ mép thân lên đỉnh lùi vào
  for (let i = 0; i < n; i++) { const p = base[i], q = base[(i + 1) % n], r = top[(i + 1) % n], s2 = top[i];
    const dx = q[0] - p[0], dz = q[1] - p[1], len = Math.hypot(dx, dz); if (len < .2) continue;
    let nx = dz / len, nz = -dx / len; if (((p[0] + q[0]) / 2 - cx) * nx + ((p[1] + q[1]) / 2 - cz) * nz < 0) { nx = -nx; nz = -nz }
    const front = Math.abs((dx * ax.ux + dz * ax.uz) / len) < .5, ny = front ? MIN / (A.man || MAN) : 0, nl = Math.hypot(nx, ny, nz), img = front && sl >= 0, nb = img ? 1 : front ? Math.max(1, Math.round(len / A.bay)) : 1;
    for (let k = 0; k < nb; k++) { const a0 = k / nb, a1 = (k + 1) / nb, L = (P, Q, a) => [P[0] + (Q[0] - P[0]) * a, P[1] + (Q[1] - P[1]) * a];
      const b0 = L(p, q, a0), b1 = L(p, q, a1), t1 = L(s2, r, a1), t0 = L(s2, r, a0), c = front ? AR.r : AR.s;
      quad([b0[0], hb, b0[1]], [b1[0], hb, b1[1]], [t1[0], h, t1[1]], [t0[0], h, t0[1]], [nx / nl, ny / nl, nz / nl], img ? [IU(sl, 0, vb), IU(sl, 1, vb), IU(sl, 1, 1), IU(sl, 0, 1)] : [[U(c, 0), 0], [U(c, 1), 0], [U(c, 1), 1], [U(c, 0), 1]]) } }
  // mặt mái trên cùng (tô màu loại căn / tình trạng)
  { const v2 = top.map(p => new THREE.Vector2(p[0], p[1])), tr = THREE.ShapeUtils.triangulateShape(v2, []);
    const uw = [U(6, .5), .5]; for (const [a, b, c] of tr) tri([[top[a][0], h, top[a][1]], uw], [[top[b][0], h, top[b][1]], uw], [[top[c][0], h, top[c][1]], uw], [0, 1, 0]) }
  const cnt = P_.length / 3 - start;
  const area = Math.abs(THREE.ShapeUtils.area(poly.map(([x, z]) => new THREE.Vector2(x, z))));
  let tx = 0, tz = 0; top.forEach(p => { tx += p[0]; tz += p[1] }); tx /= top.length; tz /= top.length;
  const L = { zone: zone || '?', dt, poly, ax: lotAxis(top), code, t, i: lots.length, start, n: cnt, cx: tx, cz: tz, h, area, pre: code.split('-')[0], av: !!AVL[code], sd: !!SOLD[code], ck: !!CHK[code] };
  lots.push(L); byCode.set(code, L); vtx += cnt;
}
const merged = new THREE.BufferGeometry();
merged.setAttribute('position', new THREE.Float32BufferAttribute(P_, 3)); merged.setAttribute('normal', new THREE.Float32BufferAttribute(N_, 3));
merged.setAttribute('uv', new THREE.Float32BufferAttribute(U_, 2)); merged.setAttribute('color', new THREE.Float32BufferAttribute(C_, 3));
const lotOf = new Int32Array(vtx); lots.forEach(L => lotOf.fill(L.i, L.start, L.start + L.n));
const normals = merged.attributes.normal, colors = merged.attributes.color;
const mesh = new THREE.Mesh(merged, new THREE.MeshLambertMaterial({ vertexColors: true, map: facade }));
scene.add(mesh);
const edges = new THREE.LineSegments(new THREE.EdgesGeometry(merged, 30), new THREE.LineBasicMaterial({ color: 0x5b5146, transparent: true, opacity: .35 }));
scene.add(edges);
$('nLots').textContent = VN(lots.length) + ' căn';

let mode = (Object.keys(AVL).length + Object.keys(SOLD).length) ? 'mo-ban' : 'loai', sel = -1, hov = -1;
function roofCol(L) {
  if (L.i === sel) return SEL;
  if (mode === 'mo-ban') return L.av ? AV : L.sd ? SD : L.ck ? CK : DIM;
  if (L.sd) return SD;
  return new THREE.Color(TYPE[L.t].roof);
}
function paint(L) {
  const r = roofCol(L), w = L.i === sel ? SEL : (mode === 'mo-ban' && !L.av && !L.ck ? DIM : WHITE);
  const hv = L.i === hov ? 1.12 : 1;
  for (let k = L.start; k < L.start + L.n; k++) {
    const c = normals.getY(k) > .99 ? r : w;
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


// ---------- đường: thảm nhựa, vỉa hè, dải phân cách, vạch kẻ làn, xe chạy ----------
const ROADS = (data.meta.roads || []).map(r => {
  const pts = r.p.map(([x, z]) => new THREE.Vector2(X(x), Z(z))), w = r.w;
  const div = w >= 32, med = div ? (w >= 40 ? 4 : 3) : 0;
  const sw = w <= 10 ? 1.8 : w * (div ? .16 : .22);
  const cw = div ? (w - 2 * sw - med) / 2 : w - 2 * sw;
  const n = div ? Math.max(2, Math.floor(cw / 3.1)) : (cw >= 12 ? 4 : 2);
  const segs = []; let L = 0;
  for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], l = a.distanceTo(b); if (l < .1) continue;
    segs.push({ a, l, s0: L, ux: (b.x - a.x) / l, uz: (b.y - a.y) / l }); L += l }
  return { ...r, pts, w, div, med, sw, cw, n, segs, L };
});
const dm = new THREE.Object3D();
function strip(pts, w, y) {   // dải phẳng rộng w dọc polyline, nối góc bằng pháp tuyến trung bình
  const pos = [], idx = [];
  pts.forEach((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let dx = b.x - a.x, dz = b.y - a.y; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
    pos.push(p.x - dz * w / 2, y, p.y + dx * w / 2, p.x + dz * w / 2, y, p.y - dx * w / 2);
    if (i) { const k = i * 2; idx.push(k - 2, k, k - 1, k - 1, k, k + 1) } });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
// điểm trên đường tại quãng s, lệch ngang off (dương = bên phải chiều đi)
function at(r, s) { let g = r.segs[0]; for (const q of r.segs) { if (s >= q.s0) g = q } const t = Math.min(g.l, Math.max(0, s - g.s0)); return { x: g.a.x + g.ux * t, z: g.a.y + g.uz * t, ux: g.ux, uz: g.uz } }
// điểm (x,z) có nằm trong lòng một đường khác không (để cắt vạch kẻ, dải phân cách tại nút giao)
function inOther(r0, x, z, pad) {
  for (const r of ROADS) { if (r === r0) continue;
    for (const g of r.segs) { const dx = x - g.a.x, dz = z - g.a.y, t = dx * g.ux + dz * g.uz; if (t < -pad || t > g.l + pad) continue;
      if (Math.abs(-dx * g.uz + dz * g.ux) < r.w / 2 - r.sw + pad) return true } }
  return false;
}
const roadGrp = new THREE.Group(); scene.add(roadGrp);
{ const walkM = new THREE.MeshLambertMaterial({ color: 0xd8d3c8 }), asphM = new THREE.MeshLambertMaterial({ color: 0x2b2e33 });
  ROADS.forEach(r => { const m = new THREE.Mesh(strip(r.pts, r.w, .12), walkM); m.renderOrder = 1; roadGrp.add(m) });
  ROADS.forEach(r => { const offs = r.div ? [-(r.med + r.cw) / 2, (r.med + r.cw) / 2] : [0];
    offs.forEach(o => { const sh = r.pts.map((p, i) => { const a = r.pts[Math.max(0, i - 1)], b = r.pts[Math.min(r.pts.length - 1, i + 1)]; let dx = b.x - a.x, dz = b.y - a.y; const l = Math.hypot(dx, dz) || 1;
      return new THREE.Vector2(p.x - dz / l * o, p.y + dx / l * o) });
      const m = new THREE.Mesh(strip(sh, r.cw, .2), asphM); m.renderOrder = 1; roadGrp.add(m) }) });
  // vạch sơn: [quãng s, lệch ngang, màu, kiểu]
  const W1 = [], Y1 = [];
  ROADS.forEach(r => { const lw = r.cw / r.n, step = 1.5;
    const lines = [];   // [offset, 'dash'|'solid', 'w'|'y']
    if (r.div) { for (const sd of [-1, 1]) { const base = sd * r.med / 2;
        for (let k = 1; k < r.n; k++) lines.push([base + sd * k * lw, 'dash', 'w']);
        lines.push([base + sd * .4, 'solid', 'w'], [base + sd * (r.cw - .4), 'solid', 'w']) } }
    else { if (r.n >= 4) { lines.push([-.18, 'solid', 'y'], [.18, 'solid', 'y']); for (const sd of [-1, 1]) lines.push([sd * lw, 'dash', 'w']) }
      else lines.push([0, 'dash', 'w']);
      lines.push([-(r.cw / 2 - .35), 'solid', 'w'], [r.cw / 2 - .35, 'solid', 'w']) }
    for (let s = 0, i = 0; s < r.L; s += step, i++) { const p = at(r, s), nx = -p.uz, nz = p.ux;
      for (const [o, kind, c] of lines) { if (kind === 'dash' && (i % 4) > 1) continue;
        const x = p.x + nx * o, z = p.z + nz * o; if (inOther(r, x, z, .5)) continue; (c === 'y' ? Y1 : W1).push([x, z, p]) } } });
  const inst = (list, geo, mat, y) => { if (!list.length) return; const im = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach(([x, z, p], i) => { dm.position.set(x, y, z); dm.rotation.set(0, Math.atan2(p.ux, p.uz), 0); dm.scale.set(1, 1, 1); dm.updateMatrix(); im.setMatrixAt(i, dm.matrix) });
    im.renderOrder = 2; roadGrp.add(im) };
  inst(W1, new THREE.BoxGeometry(.16, .04, 1.55), new THREE.MeshBasicMaterial({ color: 0xf4f2ea }), .24);
  inst(Y1, new THREE.BoxGeometry(.14, .04, 1.55), new THREE.MeshBasicMaterial({ color: 0xf2c230 }), .24);
  // dải phân cách: bó vỉa + thảm cỏ + cây
  const medG = [], treeL = [];
  ROADS.filter(r => r.div).forEach(r => { for (let s = 1.5; s < r.L; s += 3) { const p = at(r, s); if (inOther(r, p.x, p.z, 1.5)) continue; medG.push([p.x, p.z, p, r.med]); if (Math.round(s / 3) % 4 === 0) treeL.push([p.x, p.z]) } });
  if (medG.length) { const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, .35, 3.05), new THREE.MeshLambertMaterial({ color: 0x6f9e4f }), medG.length);
    medG.forEach(([x, z, p, w], i) => { dm.position.set(x, .3, z); dm.rotation.set(0, Math.atan2(p.ux, p.uz), 0); dm.scale.set(w, 1, 1); dm.updateMatrix(); im.setMatrixAt(i, dm.matrix) }); roadGrp.add(im) }
  // cây hai bên vỉa hè + dải phân cách
  ROADS.forEach(r => { if (r.w < 13) return; for (let s = 6; s < r.L; s += 9) { const p = at(r, s); for (const sd of [-1, 1]) { const o = sd * (r.w / 2 - r.sw * .45), x = p.x - p.uz * o, z = p.z + p.ux * o; if (!inOther(r, x, z, 1)) treeL.push([x, z]) } } });
  if (treeL.length) { const crown = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1.6, 0), new THREE.MeshLambertMaterial({ color: 0x4f8a3a, flatShading: true }), treeL.length);
    const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(.18, .22, 2.2, 5), new THREE.MeshLambertMaterial({ color: 0x7a5a3c }), treeL.length);
    treeL.forEach(([x, z], i) => { const k = .85 + ((i * 37) % 10) / 25; dm.rotation.set(0, i, 0); dm.position.set(x, 1.1, z); dm.scale.set(1, 1, 1); dm.updateMatrix(); trunk.setMatrixAt(i, dm.matrix);
      dm.position.set(x, 3.1 * k, z); dm.scale.set(k, k * 1.1, k); dm.updateMatrix(); crown.setMatrixAt(i, dm.matrix) }); roadGrp.add(trunk, crown) }
}
// xe ô tô chạy theo làn (đi bên phải), quay đầu ở cuối đường
const movers = []; let carBody = null, carGlass = null;
{ let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  ROADS.forEach(r => { const lw = r.cw / r.n, per = r.div ? r.n : r.n / 2;
    for (const dir of [1, -1]) for (let k = 0; k < per; k++) {
      const off = (r.div ? r.med / 2 : 0) + (k + .5) * lw;
      const cnt = Math.max(1, Math.round(r.L / (r.w >= 22 ? 32 : 55) * (.6 + rnd() * .6)));
      for (let c = 0; c < cnt; c++) movers.push({ r, dir, off, s: rnd() * r.L, v: (r.w >= 22 ? 9 : 5.5) + rnd() * 4 - k * 1.2 }) } });
  const body = new THREE.BoxGeometry(1.9, .9, 4.5); body.translate(0, .75, 0);
  const glass = new THREE.BoxGeometry(1.72, .62, 2.4); glass.translate(0, 1.48, -.2);
  carBody = new THREE.InstancedMesh(body, new THREE.MeshLambertMaterial({ color: 0xffffff }), movers.length);
  carGlass = new THREE.InstancedMesh(glass, new THREE.MeshLambertMaterial({ color: 0x27313b }), movers.length);
  const COL = [0xf4f4f2, 0xc8102e, 0x1f4fa0, 0x8e9499, 0x1d1f22, 0xf4f4f2, 0x2a7fbf, 0xe8e6df, 0xd9a400, 0x5b6770];
  movers.forEach((m, i) => carBody.setColorAt(i, new THREE.Color(COL[i % COL.length])));
  scene.add(carBody, carGlass);
}
function updateCars(dt) {
  if (!carBody || !carBody.visible) return;
  movers.forEach((m, i) => { const r = m.r; m.s += m.dir * m.v * dt;
    if (m.s > r.L) { m.s = r.L; m.dir = -1 } else if (m.s < 0) { m.s = 0; m.dir = 1 }   // tới cuối đường thì quay đầu sang làn bên kia
    const p = at(r, m.s), o = m.off * m.dir, x = p.x - p.uz * o, z = p.z + p.ux * o;
    dm.position.set(x, .22, z); dm.rotation.set(0, Math.atan2(p.ux * m.dir, p.uz * m.dir), 0); dm.scale.set(1, 1, 1); dm.updateMatrix();
    carBody.setMatrixAt(i, dm.matrix); carGlass.setMatrixAt(i, dm.matrix) });
  carBody.instanceMatrix.needsUpdate = true; carGlass.instanceMatrix.needsUpdate = true;
}
updateCars(0);

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
for (const [n, t, x, z] of data.meta.pins || []) { const el = addLabel('pin', n, X(x), 26, Z(z), 0, 9000); el.dataset.t = t; el.title = t;
  el.onclick = () => { document.querySelectorAll('.lb.pin.act').forEach(e => e.classList.remove('act')); el.classList.add('act') } }
for (const [t, x, z] of data.meta.zones || []) addLabel('zone', t, X(x), 40, Z(z), 500, 7500);
for (const r of ROADS) if (!r.dup && !/nối dài|cổng chào/.test(r.name)) addLabel('road', r.name, X(r.at[0]), 4, Z(r.at[1]), 0, r.w >= 30 ? 1600 : 650);
for (const [t, x, z] of data.meta.rzones || []) addLabel('zone tv', t + ' · sắp mở bán', X(x), 40, Z(z), 300, 30000);

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
const ZORD = ['TD', 'HT'];
const VIEWS = {
  'toan-canh': () => { if (FLAT) { const t = Math.tan(camera.fov * Math.PI / 360); flyTo(0, 0, Math.max(H * 1.02, W * 1.02 / camera.aspect) / (2 * t) / KF()) } else flyTo(0, 0, Math.hypot(W, H) * .75, .85) },
  'mo-ban': () => zoneView(ZORD)
};
for (const z of ZORD) VIEWS['z-' + z] = () => zoneView(z);
{ const ps = [...new Set(lots.map(l => l.pre))].sort((a, b) => a.localeCompare(b, 'vi', { numeric: true }));
  ps.forEach(p => VIEWS['d-' + p] = exactView(p));
  const RZ = data.meta.rzones || [];
  RZ.forEach(([n, x, z], i) => { VIEWS['r-' + i] = () => flyTo(X(x), Z(z), 900, .85) });
  $('chips').innerHTML = `<button data-v="toan-canh" class="on">Toàn dự án</button><button data-v="mo-ban">Đang mở bán</button>`
    + ZORD.map(z => `<button data-v="z-${z}">${ZNAME[z]}</button>`).join('')
    + RZ.map(([n], i) => `<button class="soon" data-v="r-${i}" title="Chưa mở bán">${n}<small>sắp mở</small></button>`).join('')
    + `<select id="daySel" aria-label="Chọn dãy"><option value="">Chọn dãy…</option>${ps.map(p => `<option>${p}</option>`).join('')}</select>`;
  $('daySel').onchange = e => { if (e.target.value) VIEWS['d-' + e.target.value]() };
}
$('chips').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
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
  { const A = ARCH[L.t] || ARCH.Y, st = ZARCH[L.zone] || 'Tân cổ điển'; rows.push(['Kiến trúc', `${st} · mẫu ${arch(L.zone, L.t, L.code).m} · ${A.fl} tầng + 1 tầng ${MODERN(L.zone) ? 'tum' : 'áp mái'} <small style="color:var(--mut);font-weight:400">(theo tài liệu CĐT)</small>`]) }
  if (q?.quy) rows.push(['Quỹ', q.quy]);
  if (q?.dt || L.dt) rows.push(['DT đất', (q?.dt || L.dt) + ' m²']); else rows.push(['DT đất (ước tính)', '≈ ' + fmtArea(L.area / .81)]);
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
  mauNha(L);
  extras(L, q);
  $('card').classList.add('show');
  if (fly) flyTo(L.cx, L.cz, 260, .9, controls.getAzimuthalAngle());
}
$('cardX').onclick = () => select(null);

// ---------- ảnh kiến trúc mặt tiền theo mẫu nhà CĐT ----------
const MAU = {   // m → [ảnh phối cảnh, ảnh mặt đứng, ghi chú]
  'LKB': ['LKB', null, 'Phân khu Thời Đại · mẫu LKB · mặt tiền 6m'],
  'SHB/SHD': ['SHB', 'SHB-2', 'Phân khu Thời Đại · mẫu SHB (căn góc 2 mặt tiền: SHD) · mặt tiền 6m'],
  'LKA': ['LKA', 'LKA-md', 'Hưng Thịnh A · mẫu LKA · mặt tiền 5m · cao 17,5m'],
  'SHC': ['SHC', 'SHC-md', 'Hưng Thịnh A · mẫu SHC · mặt tiền 6m · cao 17,5m'],
  'LKE': ['LKE', 'LKE-md', 'Hưng Thịnh B · mẫu LKE · mặt tiền 5m · cao 17,5m'],
  'SHA': ['LKE', 'LKE-md', 'Hưng Thịnh B · mẫu SHA, cùng ngôn ngữ kiến trúc dãy LKE'],
  'SL1': ['SL1', 'SL1-md', 'Hưng Thịnh B · biệt thự song lập mẫu SL1-SL1M · cao 15,25m'],
  'ĐL': ['SL1', 'SL1-md', 'Biệt thự đơn lập · minh họa theo ngôn ngữ kiến trúc mẫu SL1']
};
function mauNha(L) {
  const m = arch(L.zone, L.t, L.code).m, M = MAU[m], el = $('mn');
  if (!M) { el.hidden = true; return }
  el.hidden = false;
  const shd = m === 'SHB/SHD' && L.pre === 'TD';   // dãy góc phía nam Thời Đại: mẫu SHD 2 mặt tiền
  const p = shd ? 'SHD' : M[0];
  $('mnT').textContent = 'Kiến trúc mặt tiền · mẫu ' + (shd ? 'SHD' : m);
  $('mnImg').src = 'mau-nha/' + p + '.jpg'; $('mnImg').alt = 'Phối cảnh mẫu nhà ' + p;
  $('mnA').href = 'mau-nha/' + p + '.jpg';
  $('mnMd').hidden = !M[1]; if (M[1]) { $('mnMd').src = 'mau-nha/' + M[1] + '.jpg'; $('mnB').href = 'mau-nha/' + M[1] + '.jpg' } $('mnB').hidden = !M[1];
  $('mnNote').textContent = (shd ? 'Phân khu Thời Đại · mẫu SHD · căn góc 2 mặt tiền 6m' : M[2]) + ' · ảnh minh họa của CĐT';
}

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
  g.fillText(`Vinhomes King Park · Phân khu ${ZNAME[L.zone] || L.zone} · Dãy ${L.pre} · ${TYPE[L.t].name}`, 16, Hh - fs * .45);
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
const norm = s => s.toUpperCase().replace(/\s+/g, '').replace(/^TĐ/, 'TD').replace(/^ĐLTH/, 'DLTH');
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
document.querySelectorAll('#lgModes button').forEach(x => x.classList.toggle('on', x.dataset.m === mode));
paintAll(); VIEWS['toan-canh']();
let loaded = false;
function hideLoad() { if (loaded) return; loaded = true; const l = $('load'); l.style.opacity = 0; setTimeout(() => l.remove(), 700) }
setTimeout(hideLoad, 6000);
renderer.setAnimationLoop(t => {
  if (anim) anim(t);
  if (rot && !anim) { const a = .0012, o = camera.position.clone().sub(controls.target); o.applyAxisAngle(new THREE.Vector3(0, 1, 0), a); camera.position.copy(controls.target).add(o) }
  controls.update();
  { const d = camera.position.distanceTo(controls.target) / (FLAT ? KF() / .82 : 1); edges.material.opacity = .35 * Math.max(0, Math.min(1, (3500 - d) / 2500)); edges.visible = edges.material.opacity > .01 }
  { const d = camera.position.distanceTo(controls.target) / (FLAT ? KF() / .82 : 1), on = d < 3200; carBody.visible = carGlass.visible = on;
    const dt = Math.min(.1, (t - (window.__lt || t)) / 1000); window.__lt = t; if (on) updateCars(dt) }
  placeBadges(); renderer.render(scene, camera); placeLabels();
});
// mở theo #mã-căn
const hc = decodeURIComponent(location.hash.slice(1)); if (hc && byCode.has(norm(hc))) setTimeout(() => select(byCode.get(norm(hc)), true), 1300);
}
