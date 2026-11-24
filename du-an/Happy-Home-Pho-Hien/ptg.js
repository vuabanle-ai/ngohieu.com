// Phiếu tính giá tạm tính Phố Hiến – công thức theo CSBH 20/11/2026 (đối chiếu khớp các PTG đại lý).
export const CSBH = '20/11/2026';
const LAND = 25920114;                       // đơn giá đất không chịu VAT (đ/m²)
const LOAN = { 18: 1.035, 24: 1.08, 30: 1.135, 36: 1.195 };
const R = Math.round;
export function base(p) {                     // p: {tot, dt, pre?}
  const L = R(p.dt * LAND);
  const P0 = p.pre || R((p.tot + 0.1 * L) / 1.105);
  return { L, P0, KP: R(P0 * 0.005) };
}
export function plan(p, key) {               // key: 'tdc' | 'tts' | 'v18' | 'v24' | 'v30' | 'v36'
  const { L, P0, KP } = base(p);
  const isV = key[0] === 'v', m = isV ? +key.slice(1) : 0;
  const Pv = isV ? R(P0 * LOAN[m]) : P0;
  const ck = key === 'tts' ? 0.075 : 0;
  const P = R(Pv * (1 - ck) * (1 - 0.005));
  const VAT = R((P - L) * 0.1), TV = P + VAT, TOT = TV + KP;
  const lines = [['Giá gồm VAT + KPBT (niêm yết)', p.tot], ['Tổng giá chưa VAT trước giảm trừ', P0]];
  if (isV) lines.push([`Tổng giá vay ${m} tháng chưa giảm trừ`, Pv]);
  lines.push(['Chiết khấu thanh toán sớm', ck ? '7,5%' : '0%'], ['Chiết khấu bảo lãnh ngân hàng', '0,5%'],
    ['Tổng giá chưa VAT sau giảm trừ', P], ['Thuế VAT', VAT], ['Tổng giá gồm VAT sau giảm trừ', TV], ['Kinh phí bảo trì (KPBT)', KP]);
  let pay;
  if (key === 'tdc') pay = [['Lần 1', 'Ký TTKQ (T)', '', 300e6], ['Lần 2', 'T+10 ngày – ký HĐMB (D)', '10% có VAT', R(TV * .1) - 300e6], ['', '', '5% không VAT', R(P * .05)],
    ['Lần 3', 'D+15', '15% có VAT', R(TV * .15)], ['Lần 4', 'D+60', '15% có VAT', R(TV * .15)], ['Lần 5', 'D+120', '15% có VAT', R(TV * .15)], ['Lần 6', 'D+180', '15% có VAT', R(TV * .15)],
    ['Lần 7', 'Theo thông báo bàn giao', '25% có VAT + KPBT', R(TV * .25) + KP], ['', '', 'VAT 5%', R(VAT * .05)]];
  else if (key === 'tts') pay = [['Lần 1', 'Ký TTKQ (T)', '', 300e6], ['Lần 2', 'T+10 ngày – ký HĐMB (D)', '10% có VAT', R(TV * .1) - 300e6], ['', '', '5% không VAT', R(P * .05)],
    ['Lần 3', 'D+15', '85% có VAT', R(TV * .85)], ['', '', 'VAT 5%', R(VAT * .05)], ['Lần 4', 'Theo thông báo bàn giao', 'KPBT', KP]];
  else pay = [['Lần 1', 'Ký TTKQ (T)', '', 300e6], ['Lần 2', 'T+10 ngày – ký HĐMB (D)', '10% có VAT', R(TV * .1) - 300e6], ['', '', '5% không VAT', R(P * .05)],
    ['Lần 3', 'D+14', '15% có VAT', R(TV * .15)], ['Lần 4', 'Ngân hàng giải ngân D+15', '70% có VAT', R(TV * .7)], ['Lần 5', 'Theo thông báo bàn giao', 'VAT 5% + KPBT', R(VAT * .05) + KP]];
  return { name: { tdc: 'Tiến độ chuẩn', tts: 'Thanh toán sớm' }[key] || `Vay HTLS ${m} tháng`, lines, pay, TOT };
}
export const PLANS = ['tdc', 'tts', 'v18', 'v24', 'v30', 'v36'];
const vnd = n => typeof n === 'number' ? n.toLocaleString('vi-VN') : n;
export function draw(code, p, key) {          // ảnh phiếu tính giá (canvas 1080 px)
  const pl = plan(p, key), W = 1080, pad = 56, rowH = 50;
  const H = 520 + pl.lines.length * rowH + pl.pay.length * rowH + 150;
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const F = (w, s) => `${w} ${s}px "Be Vietnam Pro",Arial,sans-serif`;
  g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#e31b23'; g.fillRect(0, 0, W, 170);
  g.fillStyle = '#fff'; g.font = F(800, 40); g.fillText('PHIẾU TÍNH GIÁ TẠM TÍNH', pad, 78);
  g.font = F(500, 26); g.fillText('Phố Hiến Heritage Collection · CSBH ' + CSBH, pad, 126);
  let y = 240; g.fillStyle = '#24272b'; g.font = F(800, 56); g.fillText('Căn ' + code, pad, y);
  g.font = F(700, 28); g.fillStyle = '#e31b23'; const tw = g.measureText(pl.name).width;
  g.strokeStyle = '#e31b23'; g.lineWidth = 4; g.beginPath(); g.roundRect(W - pad - tw - 40, y - 44, tw + 40, 58, 29); g.stroke(); g.fillText(pl.name, W - pad - tw - 20, y - 4);
  y += 50; g.font = F(500, 26); g.fillStyle = '#666c73';
  g.fillText(`Diện tích đất ${String(p.dt).replace('.', ',')} m²` + (p.x ? `  ·  DTXD ${String(p.x).replace('.', ',')} m²` : '') + `  ·  ${p.tc || 'Thô'}`, pad, y);
  y += 40;
  const row = (k, v, bold, col) => { g.fillStyle = bold ? '#f4f5f7' : '#fff'; if (bold) g.fillRect(pad - 12, y - 34, W - 2 * pad + 24, rowH - 4);
    g.fillStyle = '#24272b'; g.font = F(bold ? 700 : 500, 26); g.fillText(k, pad, y);
    g.font = F(bold ? 800 : 600, 26); g.fillStyle = col || '#24272b'; const t = vnd(v); g.fillText(t, W - pad - g.measureText(t).width, y);
    g.strokeStyle = '#e4e6e9'; g.lineWidth = 1; g.beginPath(); g.moveTo(pad, y + 14); g.lineTo(W - pad, y + 14); g.stroke(); y += rowH };
  y += 30; pl.lines.forEach(([k, v]) => row(k, v, /sau giảm trừ/.test(k)));
  y += 10; g.fillStyle = '#e31b23'; g.fillRect(pad - 12, y - 40, W - 2 * pad + 24, 70);
  g.fillStyle = '#fff'; g.font = F(800, 32); g.fillText('TỔNG GIÁ TẠM TÍNH', pad + 8, y + 6); const tt = vnd(pl.TOT) + ' đ'; g.fillText(tt, W - pad - 8 - g.measureText(tt).width, y + 6);
  y += 90; g.fillStyle = '#24272b'; g.font = F(800, 30); g.fillText('Tiến độ thanh toán', pad, y); y += 46;
  pl.pay.forEach(([a, b, cpt, v]) => { g.font = F(700, 24); g.fillStyle = '#24272b'; g.fillText(a, pad, y); g.font = F(500, 24); g.fillStyle = '#666c73'; g.fillText([b, cpt].filter(Boolean).join(' · '), pad + 110, y);
    g.font = F(700, 25); g.fillStyle = '#24272b'; const t = vnd(v); g.fillText(t, W - pad - g.measureText(t).width, y);
    g.strokeStyle = '#e4e6e9'; g.beginPath(); g.moveTo(pad, y + 14); g.lineTo(W - pad, y + 14); g.stroke(); y += rowH });
  y += 20; g.font = F(500, 21); g.fillStyle = '#666c73';
  ['Phiếu tính giá mang tính tham khảo, tính theo chính sách bán hàng ngày ' + CSBH + '.', 'Số liệu chính thức theo bảng tính giá tại Hợp đồng mua bán của Chủ đầu tư.', 'Đơn vị: đồng. ngohieu.com']
    .forEach(t => { g.fillText(t, pad, y); y += 32 });
  return c;
}
