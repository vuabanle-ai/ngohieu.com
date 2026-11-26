// Phiếu tính giá tạm tính – Vinhomes Hải Vân Bay, khu Đảo Ngọc
// Theo CSBH quỹ giãn xây phân khu Đảo Ngọc áp dụng từ 20/09/2026 (bảng CSBH của đại lý).
// Số liệu đất/xây/VAT/KPBT lấy từ bảng hàng đại lý; chỗ thiếu thì ước tính và ghi rõ "ước tính".
export const CSBH = '20/09/2026';
// Tham số CSBH từng phân khu (bảng CSBH của đại lý Vision Realty / Trường Phát)
export const ZC = {
  DN: { ten: 'Đảo Ngọc', csbh: '20/09/2026', loan: { 18: .035, 24: .08, 30: .135, 36: .195 } },
  BV: { ten: 'Bạch Vân', csbh: '21/07/2026', loan: { 18: .035, 24: .08, 30: .135, 36: .195 }, ckTTS: .075 },
  VM: { ten: 'Vịnh Mây', csbh: '12/09/2026', loan: { 24: .045, 30: .09, 36: .14, 60: .25 }, ckTTS: .075 },
};
const zc = q => ZC[q._z] || ZC.DN;
const R = Math.round;
const XAY_M2 = 8.7e6;                         // đơn giá xây trước VAT theo bảng hàng (đ/m² sàn)
const LOAN = { 18: .035, 24: .08, 30: .135, 36: .195 }; // HTLS PA1: tỷ lệ trả thêm so với giá gốc
const COC = 200e6;

export function base(q) {
  const bg = q.bg || {}, est = [];
  const gia = q.gia;
  let KP = bg.kpbt; if (!KP) { KP = R(gia / 1.09 * .005); est.push('KPBT') }
  const hoanThien = /hoàn thiện/i.test(q.tcbg || '');
  let XV;
  if (bg.tong_xay) XV = bg.tong_xay - KP;
  else if (hoanThien) XV = 0;
  else { XV = R(parseFloat(String(q.dtxd || 0).replace(',', '.')) * XAY_M2 * 1.1); est.push('tiền xây') }
  const TV = gia - KP - XV;                     // giá trị QSD đất & TM gồm VAT
  let P = bg.dat_truoc, V = bg.dat_vat;
  if (!P || !V) { P = R(TV / 1.0847); V = TV - P; est.push('VAT đất') }
  return { gia, KP, XV, TV, P, V, est, hoanThien };
}

export function plans(q) {
  const ks = ['tttd']; if (q.bg?.tts || zc(q).ckTTS) ks.push('tts'); Object.keys(zc(q).loan).forEach(m => ks.push('v' + m)); return ks;
}
export const NAME = { tttd: 'Tiến độ chuẩn', tts: 'Thanh toán sớm', v18: 'Vay 70% · 18 th', v24: 'Vay 70% · 24 th', v30: 'Vay 70% · 30 th', v36: 'Vay 70% · 36 th', v60: 'Vay 70% · 60 th' };

export function plan(q, key) {
  const b = base(q); let { TV, P, V, KP, XV } = b;
  const head = [['Giá niêm yết gồm VAT & KPBT', b.gia]];
  let pay, tot;
  const xayLine = XV ? [['', 'Tiền xây gồm VAT', b.hoanThien ? '' : 'Giãn theo TCBG (' + (q.tcbg || '') + ')', XV]] : [];
  if (key[0] === 'v') {
    const m = +key.slice(1), r = zc(q).loan[m];
    const TVv = R(TV * (1 + r)), Pv = R(P * (1 + r)), Vv = TVv - Pv;
    head.push([`Giá trị đất & TM gồm VAT (vay ${m} tháng, +${(r * 100).toLocaleString('vi-VN')}%)`, TVv]);
    pay = [['Đợt 1', 'Cọc, ký TTĐC (ngày T)', '', COC],
      ['Đợt 2', 'T+15 hoặc ký HĐMB (ngày D)', '10% gồm VAT + 5% không VAT', R(TVv * .1) - COC + R(Pv * .05)],
      ['Đợt 3', 'D+14 · vốn tự có', '15% gồm VAT', R(TVv * .15)],
      ['', 'D+15 · ngân hàng giải ngân', '70% gồm VAT', R(TVv * .7)],
      ['Đợt 4', 'Theo TB bàn giao', 'VAT của 5% giá trị', R(Vv * .05)],
      ['Đợt 5', 'Theo TB CĐT', '5% không VAT – trừ từ TTĐC', 0], ...xayLine,
      ['', 'Kinh phí bảo trì', 'Khi bàn giao', KP]];
    tot = TVv + XV + KP;
    head.push(['Khách tự trả (không tính khoản vay)', tot - R(TVv * .7)]);
  } else if (key === 'tts') {
    const ck = q.bg?.tts ? 0 : zc(q).ckTTS;
    tot = q.bg?.tts || R(TV * (1 - ck)) + XV + KP; const land = tot - XV - KP;
    const d2 = R(TV * .1) - COC + R(P * .05);
    pay = [['Đợt 1', 'Cọc, ký TTĐC (ngày T)', '', COC], ['Đợt 2', 'T+15 hoặc ký HĐMB (ngày D)', '10% gồm VAT + 5% không VAT', d2],
      ['Đợt 3', 'D+15', '100% đất & TM sau chiết khấu − đã trả', land - COC - d2], ...xayLine, ['', 'Kinh phí bảo trì', 'Khi bàn giao', KP]];
    head.push([ck ? `Chiết khấu TTS ${(ck * 100).toLocaleString('vi-VN')}% giá trị đất & TM` : 'Chiết khấu TTS (11%/năm trên số tiền trả trước hạn)', b.gia - tot]);
  } else {
    pay = [['Đợt 1', 'Cọc, ký TTĐC (ngày T)', '', COC],
      ['Đợt 2', 'T+15 hoặc ký HĐMB (ngày D)', '10% gồm VAT + 5% không VAT', R(TV * .1) - COC + R(P * .05)],
      ['Đợt 3', 'D+15', '15% gồm VAT', R(TV * .15)], ['Đợt 4', 'D+60', '15% gồm VAT', R(TV * .15)],
      ['Đợt 5', 'D+120', '15% gồm VAT', R(TV * .15)], ['Đợt 6', 'D+180', '15% gồm VAT', R(TV * .15)],
      ['Đợt 7', 'Theo TB bàn giao', '25% gồm VAT + VAT của 5%', R(TV * .25) + R(V * .05)],
      ['Đợt 8', 'Theo TB CĐT', '5% không VAT – trừ từ TTĐC', 0], ...xayLine, ['', 'Kinh phí bảo trì', 'Khi bàn giao', KP]];
    tot = TV + XV + KP;
  }
  head.push(['Giá trị đất & TM gồm VAT', TV], ['Tiền xây gồm VAT', XV], ['Kinh phí bảo trì', KP]);
  return { head, pay, tot, est: b.est };
}

const VN = n => R(n).toLocaleString('vi-VN');
export function html(code, q, key) {
  const p = plan(q, key);
  return `<table class="pt"><tbody>${p.head.map(([a, v]) => `<tr><td colspan="2">${a}</td><td>${VN(v)}</td></tr>`).join('')}
<tr class="tt"><td colspan="2">Tổng thanh toán · ${NAME[key]}</td><td>${VN(p.tot)}</td></tr>
${p.pay.map(([d, w, c, v]) => `<tr><td><b>${d}</b> ${w}</td><td>${c}</td><td>${v ? VN(v) : '–'}</td></tr>`).join('')}</tbody></table>
<p class="ptn">Tạm tính theo CSBH ${zc(q).ten} áp dụng từ ${zc(q).csbh}${p.est.length ? '; ước tính: ' + p.est.join(', ') : ''}. Chưa trừ VinClub, voucher. Số chính thức theo PTG của CĐT.</p>`;
}

export function png(code, q, key) {
  const p = plan(q, key), W = 900, rowH = 40, rows = p.head.length + 1 + p.pay.length;
  const cn = document.createElement('canvas'); cn.width = W; cn.height = 170 + rows * rowH + 90; const g = cn.getContext('2d');
  const F = (w, s) => `${w} ${s}px "Be Vietnam Pro",Arial,sans-serif`;
  g.fillStyle = '#fff'; g.fillRect(0, 0, W, cn.height);
  g.fillStyle = '#e31b23'; g.fillRect(0, 0, W, 110);
  g.fillStyle = '#fff'; g.font = F(800, 34); g.fillText('PHIẾU TÍNH GIÁ TẠM TÍNH · ' + code, 32, 52);
  g.font = F(500, 20); g.fillText(`Vinhomes Hải Vân Bay · ${zc(q).ten} · ${NAME[key]} · CSBH ${zc(q).csbh}`, 32, 88);
  let y = 150;
  const line = (a, b, v, bold, color) => {
    g.fillStyle = color || '#26282b'; g.font = F(bold ? 800 : 500, 19);
    g.fillText(a, 32, y); if (b) { g.fillStyle = '#6b7077'; g.fillText(b, 420, y) }
    g.fillStyle = color || '#26282b'; g.font = F(bold ? 800 : 600, 19); g.textAlign = 'right'; g.fillText(v, W - 32, y); g.textAlign = 'left';
    g.strokeStyle = '#e3e5e8'; g.beginPath(); g.moveTo(32, y + 14); g.lineTo(W - 32, y + 14); g.stroke(); y += rowH;
  };
  p.head.forEach(([a, v]) => line(a, '', VN(v)));
  line('Tổng thanh toán', '', VN(p.tot), true, '#c8102e');
  p.pay.forEach(([d, w, c, v]) => line((d ? d + ' · ' : '') + w, c, v ? VN(v) : '–'));
  g.fillStyle = '#6b7077'; g.font = F(500, 15);
  g.fillText('Tạm tính, chưa trừ VinClub/voucher' + (p.est.length ? '; ước tính: ' + p.est.join(', ') : '') + '. Số chính thức theo PTG của CĐT.', 32, y + 10);
  g.fillText('ngohieu.com/du-an/Vinhomes-Global-Gate-Ha-Long', 32, y + 36);
  return cn;
}
