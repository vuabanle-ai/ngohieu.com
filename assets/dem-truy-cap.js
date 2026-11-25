// Bộ đếm truy cập ngohieu.com (ẩn danh, không thu thông tin cá nhân).
// Mỗi ngày (giờ Việt Nam) một bản ghi stats/YYYY-MM-DD trên Firebase: lượt xem trang, người truy cập,
// người mới / người quay lại, nguồn truy cập, lượt xem từng trang, số căn được bấm xem trên sa bàn.
import { FIREBASE } from '/firebase-config.js?v=2';
{
  const V = '10.12.2';
  const store = {
    get: k => { try { return localStorage.getItem(k) } catch (_) { return null } },
    set: (k, v) => { try { localStorage.setItem(k, v) } catch (_) {} }
  };
  const day = () => new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);  // ngày theo giờ VN
  const slug = (location.pathname.replace(/\/index\.html$/, '').replace(/^\/|\/$/g, '') || 'trang-chu')
    .replace(/[^\w-]+/g, '_').slice(0, 60);
  const source = () => {
    const r = document.referrer, q = new URLSearchParams(location.search);
    const s = (q.get('utm_source') || q.get('fbclid') && 'facebook' || '').toLowerCase();
    const h = s || (r ? new URL(r).hostname : '');
    if (!h) return 'truc_tiep';
    if (h.includes('ngohieu.com')) return null;                       // chuyển trang trong web, không tính nguồn
    for (const [k, re] of [['facebook', /facebook|fb\.|messenger/], ['tiktok', /tiktok/], ['zalo', /zalo/],
                           ['google', /google/], ['youtube', /youtube|youtu\.be/]]) if (re.test(h)) return k;
    return 'khac';
  };

  let F, ref, ready;
  const init = () => ready || (ready = (async () => {
    if (!FIREBASE || !FIREBASE.apiKey) return false;
    const [{ initializeApp }, Fs] = await Promise.all([
      import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`),
      import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore-lite.js`)]);
    F = Fs; ref = F.doc(F.getFirestore(initializeApp(FIREBASE, 'dem')), 'stats', day());
    return true;
  })().catch(() => false));
  const bump = async data => { try { if (await init()) await F.setDoc(ref, data, { merge: true }) } catch (_) {} };

  const today = day(), inc = n => F.increment(n);
  init().then(ok => {
    if (!ok) return;
    const data = { views: inc(1), pages: { [slug]: inc(1) } };
    if (store.get('nh_ngay') !== today) {                            // lần đầu trong ngày trên máy này
      const first = store.get('nh_lan_dau');
      data.visitors = inc(1);
      if (first && first < today) data.returning = inc(1); else data.newV = inc(1);
      if (!first) store.set('nh_lan_dau', today);
      store.set('nh_ngay', today);
      const src = source(); if (src) data.src = { [src]: inc(1) };
    }
    bump(data);
  });

  // Sa bàn: đếm số căn được bấm xem
  window.__track = (type) => { if (type === 'xem_can' || type === 'tim_can') init().then(ok => ok && bump({ units: inc(1) })) };
}
