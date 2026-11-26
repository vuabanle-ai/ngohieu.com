// Ô "Tìm mã căn" trong từng sa bàn: gõ tiêu chí (VD "60m2 rẻ nhất", "liền kề dưới 8 tỷ hướng Đông Nam")
// → hiện 3 căn còn hàng rẻ nhất / rẻ nhì / rẻ ba của dự án đang xem. Gõ mã căn thì sa bàn tìm như cũ.
// Cách gắn: <script src="/assets/tim-3-can-re.js" data-quy="quy-hang.json,..." data-ma="^(VX|SB)" data-ten="Ocean Park 3"></script>
(() => {
  const me = document.currentScript, Q = document.getElementById('q');
  if (!me || !Q) return;
  const FILES = (me.dataset.quy || 'quy-hang.json').split(',').map(s => s.trim()).filter(Boolean);
  const MA = me.dataset.ma ? new RegExp(me.dataset.ma, 'u') : null, TEN = me.dataset.ten || 'dự án';
  const bo = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const num = s => { if (typeof s === 'number') return s; const v = parseFloat(String(s || '').replace(',', '.')); return isFinite(v) ? v : null };
  const ty = v => { const t = v / 1e9; return (t >= 10 ? t.toFixed(2) : t.toFixed(3)).replace(/\.?0+$/, '').replace('.', ',') + ' tỷ' };
  const loaiChuan = s => { const x = bo(s);
    if (/don lap|btdl|^dl$/.test(x)) return 'Đơn lập'; if (/song lap|btsl|^sl$/.test(x)) return 'Song lập'; if (/tu lap/.test(x)) return 'Tứ lập';
    if (/shop|^sh|nha pho thuong mai|^kd/.test(x)) return 'Shophouse'; if (/lien ke|^lk|nha pho/.test(x)) return 'Liền kề';
    if (/vuon|vbcn/.test(x)) return 'Biệt thự vườn'; if (/biet thu/.test(x)) return 'Biệt thự'; if (/can ho|\dpn|studio/.test(x)) return 'Căn hộ'; return s || '' };
  const median = a => { a = a.filter(v => v > 0).sort((x, y) => x - y); const n = a.length; return !n ? 0 : n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2 };

  // ---------- đọc quỹ căn còn hàng của dự án ----------
  let KHO = null;
  async function napKho() {
    if (KHO) return KHO;
    const out = new Map();
    await Promise.all(FILES.map(async f => { let d; try { d = await (await fetch(f + (f.includes('?') ? '&' : '?') + 'v=' + Date.now(), { cache: 'no-store' })).json() } catch (_) { return }
      const pr = d.price || {};
      const add = (ma, o, tt) => { if (MA && !MA.test(ma)) return; if (out.has(ma) && out.get(ma).tt === 'con') return;
        if (Array.isArray(o)) o = { src: o, gia: pr[ma]?.tot, dt: pr[ma]?.dt };   // Phố Hiến: giá nằm ở bảng price
        const offers = (o.offers || []).filter(x => x.gia > 0), bg = Object.values(o.bg || {}).filter(v => v > 0);
        const cands = [num(o.gia), ...offers.map(x => x.gia)].filter(v => v > 0), ref = median([...cands, ...bg]);
        const ok = v => v >= .55 * ref, good = cands.filter(ok), gb = bg.filter(ok);   // bỏ giá lệch xa (tiền đợt/cọc ghi nhầm cột)
        const gia = good.length ? Math.min(...good) : gb.length ? Math.min(...gb) : null;
        out.set(ma, { ma, tt, gia, dt: num(o.dt), loai: loaiChuan(o.loai), huong: o.huong || '', tcbg: o.tcbg || '' }) };
      for (const [ma, o] of Object.entries(d.available || {})) add(ma, o, 'con');
      for (const [ma, o] of Object.entries(d.check || {})) if (!(d.available || {})[ma]) add(ma, typeof o === 'object' && !Array.isArray(o) ? o : (d.available || {})[ma] || {}, 'check');
    }));
    return KHO = [...out.values()];
  }

  // ---------- hiểu tiêu chí ----------
  const HUONG = { 'dong bac': 'DB', 'dong nam': 'DN', 'tay bac': 'TB', 'tay nam': 'TN', 'dong': 'D', 'tay': 'T', 'nam': 'N', 'bac': 'B' };
  const LOAI = [[/lien ke|\blk\b|nha pho\b/, 'Liền kề'], [/shop|\bsh\b|thuong mai/, 'Shophouse'], [/song lap|\bsl\b/, 'Song lập'], [/don lap|\bdl\b/, 'Đơn lập'], [/tu lap/, 'Tứ lập'], [/biet thu vuon|vuon/, 'Biệt thự vườn'], [/biet thu/, 'Biệt thự'], [/can ho|chung cu/, 'Căn hộ']];
  const laMaCan = s => /^\s*[A-Za-zĐđ]{1,6}\d{0,3}\s*[-.]?\s*\d{1,3}[A-Za-z]?\s*$/.test(s);
  function hieu(raw) {
    const x = bo(raw).replace(/m²/g, 'm2').replace(/,/g, '.'), c = { txt: [] };
    let m;
    if ((m = x.match(/(\d+(?:\.\d+)?)\s*(?:-|den|toi|~)\s*(\d+(?:\.\d+)?)\s*(?:m2|m\b|met)/))) { c.dtMin = +m[1]; c.dtMax = +m[2]; c.txt.push(`${m[1]}–${m[2]} m²`) }
    else if ((m = x.match(/(tren|tu|hon|>=?|it nhat|toi thieu)\s*(\d+(?:\.\d+)?)\s*(?:m2|m\b|met)/))) { c.dtMin = +m[2]; c.txt.push(`từ ${m[2]} m²`) }
    else if ((m = x.match(/(duoi|nho hon|<=?|toi da)\s*(\d+(?:\.\d+)?)\s*(?:m2|m\b|met)/))) { c.dtMax = +m[2]; c.txt.push(`đến ${m[2]} m²`) }
    else if ((m = x.match(/(\d+(?:\.\d+)?)\s*(?:m2|met vuong|m\b)/))) { c.dt = +m[1]; c.txt.push(`khoảng ${m[1]} m²`) }
    if ((m = x.match(/(\d+(?:\.\d+)?)\s*(?:-|den|toi)\s*(\d+(?:\.\d+)?)\s*(?:ty|ti)\b/))) { c.gMin = +m[1] * 1e9; c.gMax = +m[2] * 1e9; c.txt.push(`${m[1]}–${m[2]} tỷ`) }
    else if ((m = x.match(/(duoi|nho hon|<=?|toi da|khong qua|max)\s*(\d+(?:\.\d+)?)\s*(?:ty|ti)\b/))) { c.gMax = +m[2] * 1e9; c.txt.push(`dưới ${m[2]} tỷ`) }
    else if ((m = x.match(/(tren|tu|>=?|hon)\s*(\d+(?:\.\d+)?)\s*(?:ty|ti)\b/))) { c.gMin = +m[2] * 1e9; c.txt.push(`từ ${m[2]} tỷ`) }
    else if ((m = x.match(/(?:khoang|tam|~)?\s*(\d+(?:\.\d+)?)\s*(?:ty|ti)\b/))) { c.gMax = +m[1] * 1e9 * 1.05; c.txt.push(`khoảng ${m[1]} tỷ`) }
    for (const [re, l] of LOAI) if (re.test(x)) { c.loai = l; c.txt.push(l); break }
    if ((m = x.match(/huong\s+(dong bac|dong nam|tay bac|tay nam|dong|tay|nam|bac)/))) { c.huong = HUONG[m[1]]; c.txt.push('hướng ' + raw.match(new RegExp('h(ướ|uo)ng\\s+([\\p{L} ]+?)(?=$|,|\\s+(?:dưới|trên|từ|giá|\\d))', 'iu'))?.[2] || m[1]) }
    if (/m2|met|dien tich/.test(x) && /(gia|don gia).{0,6}(m2|met)|\/m2|tren m2/.test(x)) { c.theoDonGia = true; c.txt.push('xếp theo giá/m²') }
    // dãy / tiền tố mã (VD "VX3", "TD7", "dãy HK")
    if ((m = raw.match(/(?:dãy|day|khu)\s*([A-Za-zĐđ]{1,5}\d{0,3})\b/i) || raw.match(/\b([A-ZĐ]{1,5}\d{1,3})\b/u))) { c.day = m[1].toUpperCase(); c.txt.push('dãy ' + c.day) }
    c.laTieuChi = c.txt.length > 0 || /\bre\b|re nhat|gia tot|tim can|can nao/.test(x);
    return c;
  }
  const hopHuong = (h, want) => { let s = bo(h); for (const [k, v] of Object.entries(HUONG)) s = s.replace(new RegExp(k, 'g'), v.toLowerCase());   // "Đông Nam" → "dn"
    return s.toUpperCase().split(/[^A-Z]+/).some(t => t === want) };
  function chon(list, c, noi) {
    const tol = noi ? Math.max(6, (c.dt || 0) * .12) : Math.max(3, (c.dt || 0) * .05);
    return list.filter(u => u.gia && (!c.loai || u.loai === c.loai || (c.loai === 'Biệt thự' && /Biệt thự|lập/.test(u.loai)))
      && (!c.day || u.ma.toUpperCase().replace('Đ', 'D').startsWith(c.day.replace('Đ', 'D')))
      && (c.dt == null || (u.dt && Math.abs(u.dt - c.dt) <= tol)) && (c.dtMin == null || (u.dt && u.dt >= c.dtMin)) && (c.dtMax == null || (u.dt && u.dt <= c.dtMax))
      && (c.gMin == null || u.gia >= c.gMin) && (c.gMax == null || u.gia <= c.gMax) && (!c.huong || hopHuong(u.huong, c.huong)))
      .sort((a, b) => c.theoDonGia && a.dt && b.dt ? a.gia / a.dt - b.gia / b.dt : a.gia - b.gia || (a.tt === 'con' ? -1 : 1));
  }

  // ---------- khung kết quả ----------
  const css = document.createElement('style');
  css.textContent = `#t3{position:fixed;z-index:60;left:12px;top:132px;width:min(440px,calc(100vw - 24px));max-height:calc(100vh - 150px);overflow:auto;background:#fff;border-radius:18px;box-shadow:0 12px 40px rgba(0,0,0,.25);padding:14px 14px 12px;font:15px/1.45 "Be Vietnam Pro",system-ui,sans-serif;color:#1d1d1f}
#t3[hidden]{display:none}#t3 h4{margin:0 34px 4px 0;font-size:17px}#t3 .x{position:absolute;right:10px;top:8px;width:32px;height:32px;border:0;border-radius:50%;background:#f1f1f1;font-size:18px;cursor:pointer}
#t3 .tc{color:#666;font-size:13px;margin-bottom:10px}#t3 .it{display:grid;grid-template-columns:44px 1fr auto;gap:4px 10px;align-items:center;padding:10px;border-radius:14px;background:#f7f7f7;margin-top:8px;cursor:pointer}
#t3 .it:hover{background:#fdeceb}#t3 .md{font-size:28px;text-align:center;grid-row:span 2}#t3 .ma{font-weight:800;font-size:17px}#t3 .gi{font-weight:800;color:#d71920;font-size:17px;text-align:right}
#t3 .sb{grid-column:2/4;color:#555;font-size:13px}#t3 .rk{font-size:12px;font-weight:700;color:#d71920;text-transform:uppercase;letter-spacing:.03em}#t3 .ck{display:inline-block;background:#fff4cc;color:#8a6500;border-radius:6px;padding:0 6px;font-size:12px;font-weight:700;margin-left:4px}
#t3 .nt{color:#888;font-size:12.5px;margin-top:10px}#t3 .em{padding:10px;background:#f7f7f7;border-radius:12px}`;
  document.head.appendChild(css);
  const P = document.createElement('div'); P.id = 't3'; P.hidden = true; P.setAttribute('role', 'dialog'); P.setAttribute('aria-label', 'Căn rẻ nhất theo tiêu chí');
  document.body.appendChild(P);
  P.addEventListener('click', e => { if (e.target.closest('.x')) { P.hidden = true; return }
    const it = e.target.closest('[data-ma]'); if (it) { P.hidden = true; moCan(it.dataset.ma) } });

  let busy = false;
  function moCan(ma) {   // giao lại cho bộ tìm mã căn có sẵn của sa bàn
    busy = true; Q.value = ma;
    Q.dispatchEvent(new Event('input', { bubbles: true }));
    Q.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
    const f = Q.form; if (f && f.requestSubmit) try { f.requestSubmit() } catch (_) {}
    busy = false }

  async function timBa(raw) {
    const c = hieu(raw);
    P.hidden = false; P.innerHTML = `<button class="x" type="button" aria-label="Đóng">×</button><h4>Đang tìm…</h4>`;
    const all = await napKho(), con = all.filter(u => u.gia); all.forEach(u => delete u.gan);
    let kq = chon(con, c, false), noi = false;
    if (kq.length < 3 && c.dt != null) {   // chưa đủ 3 căn đúng diện tích → bổ sung căn gần diện tích nhất (±12%)
      const them = chon(con, c, true).filter(u => !kq.includes(u)); if (them.length) { noi = true; them.forEach(u => u.gan = true); kq = [...kq, ...them] } }
    const MED = ['🥇', '🥈', '🥉'], RK = ['Rẻ nhất', 'Rẻ nhì', 'Rẻ ba'];
    const tc = c.txt.length ? c.txt.join(' · ') : 'mọi căn';
    let html = `<button class="x" type="button" aria-label="Đóng">×</button><h4>3 căn rẻ nhất · ${esc(TEN)}</h4><div class="tc">Tiêu chí: ${esc(tc)}${noi ? ' (thêm căn diện tích gần nhất ±12%)' : ''}</div>`;
    if (!all.length) html += `<div class="em">Dự án này chưa có quỹ căn đang bán trên sa bàn.</div>`;
    else if (!kq.length) html += `<div class="em">Không có căn còn hàng khớp tiêu chí. Thử bỏ bớt điều kiện, VD chỉ gõ <b>${esc(c.dt ? c.dt + 'm2 rẻ nhất' : 'rẻ nhất')}</b>.</div>`;
    else html += kq.slice(0, 3).map((u, i) => `<div class="it" data-ma="${esc(u.ma)}" role="button" tabindex="0"><div class="md">${MED[i]}</div>
      <div><div class="rk">${RK[i]}</div><span class="ma">${esc(u.ma)}</span>${u.tt === 'check' ? '<span class="ck">Check admin</span>' : ''}${u.gan ? '<span class="ck" style="background:#eef3ff;color:#2a4a9a">DT gần</span>' : ''}</div><div class="gi">${ty(u.gia)}</div>
      <div class="sb">${[u.loai, u.dt ? String(u.dt).replace('.', ',') + ' m²' : '', u.dt ? Math.round(u.gia / u.dt / 1e6).toLocaleString('vi-VN') + ' tr/m²' : '', u.huong ? 'Hướng ' + u.huong : '', u.tcbg].filter(Boolean).map(esc).join(' · ')}</div></div>`).join('')
      + `<div class="nt">Có ${kq.filter(u => !u.gan).length.toLocaleString('vi-VN')} căn khớp đúng tiêu chí. Giá là giá thấp nhất các đại lý đang chào. Bấm vào căn để xem trên sa bàn.</div>`;
    P.innerHTML = html;
  }

  // chặn trước bộ tìm mã căn của sa bàn khi nội dung là tiêu chí
  const laTC = v => v.trim().length > 0 && !laMaCan(v) && hieu(v).laTieuChi;
  Q.addEventListener('keydown', e => { if (busy || e.key !== 'Enter') return; if (laTC(Q.value)) { e.preventDefault(); e.stopImmediatePropagation(); timBa(Q.value) } }, true);
  Q.form && Q.form.addEventListener('submit', e => { if (!busy && laTC(Q.value)) { e.preventDefault(); e.stopImmediatePropagation(); timBa(Q.value) } }, true);
  Q.addEventListener('input', e => { if (!busy && laTC(Q.value)) e.stopImmediatePropagation() }, true);   // không để sa bàn báo "không thấy mã căn" khi đang gõ tiêu chí
  const ph = Q.getAttribute('placeholder') || ''; if (!/tiêu chí/.test(ph)) Q.setAttribute('placeholder', ph.replace('Tìm mã căn', 'Mã căn hoặc tiêu chí').replace(/VD: .*/, 'VD: 60m2 rẻ nhất'));
  Q.title = 'Gõ mã căn, hoặc tiêu chí: "60m2 rẻ nhất", "liền kề dưới 8 tỷ", "shophouse hướng Đông Nam" rồi Enter';
  addEventListener('keydown', e => { if (e.key === 'Escape') P.hidden = true });
})();
