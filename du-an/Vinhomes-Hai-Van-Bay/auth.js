// Đăng ký / đăng nhập bằng số điện thoại + mật khẩu (không gửi SMS), ghi nhận lượt dùng sa bàn.
// Cấu hình Firebase nằm ở ../../firebase-config.js. Khi chưa có cấu hình, sa bàn mở tự do như cũ.
import { FIREBASE, ADMIN_PHONE } from '../../firebase-config.js?v=2';
{
const gate = document.getElementById('gate');
const track = () => {};
window.__track = track;
if (!FIREBASE || !FIREBASE.apiKey) { gate.remove(); }
else {
const V = '10.12.2';
const [{ initializeApp }, A, F] = await Promise.all([
  import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`),
  import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`),
  import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`)]);
const app = initializeApp(FIREBASE);
const auth = A.getAuth(app); auth.languageCode = 'vi';
await A.setPersistence(auth, A.browserLocalPersistence);           // lưu đăng nhập trên máy
const db = F.getFirestore(app);
const $ = id => document.getElementById(id);
const KEY = 'nh_da_dang_ky';
const store = { get: k => { try { return localStorage.getItem(k) } catch (_) { return null } }, set: (k, v) => { try { localStorage.setItem(k, v) } catch (_) {} } };

const toE164 = raw => { let d = String(raw || '').replace(/\D/g, ''); if (d.startsWith('84')) d = d.slice(2); if (d.startsWith('0')) d = d.slice(1); return /^\d{9}$/.test(d) ? '+84' + d : null };
const mailOf = e164 => e164.slice(1) + '@u.ngohieu.com';
const phoneOf = u => (u && u.email ? '+' + u.email.split('@')[0] : '');
const say = (id, t, ok) => { const el = $(id); el.textContent = t || ''; el.classList.toggle('ok', !!ok) };
const busy = (btn, on, label) => { btn.disabled = on; if (label) btn.dataset.l = btn.dataset.l || btn.textContent; btn.textContent = on ? 'Đang xử lý…' : (btn.dataset.l || btn.textContent) };
const show = step => { gate.querySelectorAll('[data-step]').forEach(s => s.hidden = s.dataset.step !== step); const f = gate.querySelector(`[data-step="${step}"] input:not([type=checkbox])`); if (f) setTimeout(() => f.focus(), 60) };
const ERR = c => ({
  'auth/email-already-in-use': 'Số này đã đăng ký rồi, anh/chị đăng nhập bằng mật khẩu nhé.',
  'auth/invalid-credential': 'Số điện thoại hoặc mật khẩu chưa đúng.',
  'auth/wrong-password': 'Mật khẩu chưa đúng.',
  'auth/user-not-found': 'Số này chưa đăng ký, mời anh/chị đăng ký.',
  'auth/too-many-requests': 'Thao tác quá nhiều lần, vui lòng thử lại sau ít phút.',
  'auth/weak-password': 'Mật khẩu cần ít nhất 6 ký tự.',
  'auth/network-request-failed': 'Mạng đang chập chờn, anh/chị kiểm tra kết nối rồi thử lại.'
}[c] || `Có lỗi xảy ra, vui lòng thử lại (mã: ${String(c || 'khong-ro').replace('auth/', '')}).`);

// --- Đăng ký: số điện thoại + mật khẩu (bắt buộc), họ tên + đại lý (không bắt buộc)
$('gReg').addEventListener('submit', async ev => {
  ev.preventDefault(); const b = $('gSend');
  const e164 = toE164($('gPhone').value), pw = $('gPw').value;
  const name = $('gName').value.trim(), agency = $('gAgency').value.trim();
  if (!e164) return say('gMsg1', 'Số điện thoại gồm 10 số, ví dụ 0912 345 678.');
  if (pw.length < 6) return say('gMsg1', 'Mật khẩu cần ít nhất 6 ký tự.');
  if (!$('gAgree').checked) return say('gMsg1', 'Anh/chị tích đồng ý chính sách bảo mật để tiếp tục.');
  say('gMsg1', ''); busy(b, true, 1);
  try {
    const c = await A.createUserWithEmailAndPassword(auth, mailOf(e164), pw);
    await F.setDoc(F.doc(db, 'users', c.user.uid), { name, agency, phone: e164, createdAt: F.serverTimestamp() }, { merge: true });
    store.set(KEY, '1'); await enter(c.user, true);
  } catch (e) {
    say('gMsg1', ERR(e.code));
    if (e.code === 'auth/email-already-in-use') { $('gLPhone').value = $('gPhone').value; setTimeout(() => show('login'), 1400) }
  } finally { busy(b, false) }
});
gate.querySelectorAll('.eye').forEach(btn => btn.onclick = () => { const i = btn.previousElementSibling; i.type = i.type === 'password' ? 'text' : 'password'; btn.textContent = i.type === 'password' ? 'Hiện' : 'Ẩn' });

// --- Đăng nhập: số điện thoại + mật khẩu
$('gLoginForm').addEventListener('submit', async ev => {
  ev.preventDefault(); const e164 = toE164($('gLPhone').value), pw = $('gLPw').value, b = $('gLogin');
  if (!e164) return say('gMsg4', 'Số điện thoại gồm 10 số.');
  busy(b, true, 1);
  try { const c = await A.signInWithEmailAndPassword(auth, mailOf(e164), pw); store.set(KEY, '1'); await enter(c.user, true) }
  catch (e) { say('gMsg4', ERR(e.code)) } finally { busy(b, false) }
});
gate.querySelectorAll('[data-go]').forEach(a => a.onclick = e => { e.preventDefault(); show(a.dataset.go) });

// --- Vào sa bàn + ghi nhận lượt dùng
let profile = {};
async function enter(u, fresh) {
  try {
    const ref = F.doc(db, 'users', u.uid); const snap = await F.getDoc(ref); profile = snap.exists() ? snap.data() : {};
    if (fresh || !sessionStorage.getItem('nh_ss')) { sessionStorage.setItem('nh_ss', '1'); await F.setDoc(ref, { lastLogin: F.serverTimestamp(), loginCount: F.increment(1), phone: profile.phone || phoneOf(u) }, { merge: true }); log('mo_sa_ban') }
  } catch (_) {}
  gate.classList.add('done'); setTimeout(() => gate.remove(), 450);
  const po = document.getElementById('panelOut'); if (po) po.hidden = false;
  const who = document.getElementById('who'); if (who) { who.hidden = false; who.querySelector('b').textContent = profile.name || 'Tài khoản' }
}
function log(type, extra = {}) { const u = auth.currentUser; if (!u) return; F.addDoc(F.collection(db, 'events'), { uid: u.uid, name: profile.name || '', agency: profile.agency || '', phone: profile.phone || phoneOf(u), type, page: location.pathname, ts: F.serverTimestamp(), ...extra }).catch(() => {}) }
let last = '';
window.__track = (type, extra) => { const k = type + JSON.stringify(extra || {}); if (k === last) return; last = k; log(type, extra) };
const out = document.getElementById('logout'); if (out) out.onclick = async () => { await A.signOut(auth); location.reload() };

let first = true;
A.onAuthStateChanged(auth, u => {
  if (!first) return; first = false;
  if (u && u.providerData.some(p => p.providerId === 'password')) enter(u, false);
  else {
    // Dùng thử miễn phí 5 phút (tính từ lần đầu mở bất kỳ sa bàn nào trên máy này), hết giờ mới hiện khung đăng ký
    const TRIAL = 5 * 60 * 1000; let t0 = +store.get('nh_thu_tu') || 0;
    if (!t0) { t0 = Date.now(); store.set('nh_thu_tu', String(t0)) }
    const left = t0 + TRIAL - Date.now();
    const open = () => { if (gate.classList.contains('done')) return; gate.classList.add('ready'); show(store.get(KEY) ? 'login' : 'reg') };
    if (left > 0) setTimeout(open, left); else open();
  }
});
}
}
