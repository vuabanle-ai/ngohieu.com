// Tóm tắt chính sách bán hàng Phố Hiến Heritage Collection – CSBH 20/11/2026
// (tổng hợp từ phiếu tính giá đại lý theo CSBH 20/11/2026; chỉ mang tính tham khảo)
const CSBH = '20/11/2026';
const SEC = [
 ['Chiết khấu', [
  ['Thanh toán sớm', 'Chiết khấu 7,5% vào giá trước VAT'],
  ['Không nhận BL ngân hàng', 'Chiết khấu 0,5% vào giá trước VAT'],
  ['VinClub', 'Theo hạng thành viên (nếu có) – kiểm tra với đại lý'] ]],
 ['Ưu đãi khác', [
  ['Phí dịch vụ', 'Miễn phí dịch vụ quản lý 2 năm (24 tháng) đầu'],
  ['Voucher', 'Giá trị voucher tối đa được áp khoảng 30% giá căn (tạm tính theo bảng hàng, tùy đối tượng đủ điều kiện)'],
  ['Bàn giao · Pháp lý', 'Bàn giao thô · Sở hữu lâu dài'] ]],
 ['Phương án 1 · Tiến độ chuẩn', [
  ['Đặt cọc (T)', 'Ký TTKQ: 300.000.000 đ/căn'],
  ['Lần 2 · T+10 (D)', 'Ký HĐMB: 10% giá có VAT (gồm cọc) + 5% không VAT'],
  ['Lần 3 · D+15', '15% giá có VAT'],
  ['Lần 4 · D+60', '15% giá có VAT'],
  ['Lần 5 · D+120', '15% giá có VAT'],
  ['Lần 6 · D+180', '15% giá có VAT'],
  ['Lần 7 · Bàn giao', '25% giá có VAT + KPBT + VAT phần 5%'] ]],
 ['Phương án 2 · Thanh toán sớm (CK 7,5%)', [
  ['Đặt cọc (T)', 'Ký TTKQ: 300.000.000 đ/căn'],
  ['Lần 2 · T+10 (D)', 'Ký HĐMB: 10% giá có VAT (gồm cọc) + 5% không VAT'],
  ['Lần 3 · D+15', '85% giá có VAT + VAT phần 5%'],
  ['Lần 4 · Bàn giao', 'Kinh phí bảo trì (KPBT)'] ]],
 ['Phương án 3 · Vay hỗ trợ lãi suất 70%', [
  ['Giá vay cộng thêm', 'HTLS 18T +3,5% · 24T +8% · 30T +13,5% · 36T +19,5% (vào giá trước VAT)'],
  ['Đặt cọc (T)', 'Ký TTKQ: 300.000.000 đ/căn'],
  ['Lần 2 · T+10 (D)', 'Ký HĐMB: 10% giá có VAT (gồm cọc) + 5% không VAT'],
  ['Lần 3 · D+14', '15% giá có VAT'],
  ['Lần 4 · D+15', 'Ngân hàng giải ngân 70% giá có VAT'],
  ['Lần 5 · Bàn giao', 'VAT phần 5% + KPBT'] ]],
 ['Lãi suất cố định tạm tính (tham khảo)', [
  ['18 · 24 · 30 tháng', '3% · 4,5% · 6% /năm'],
  ['36 · 48 · 60 tháng', '7,5% · 8,5% · 9% /năm'] ]]
];
function draw() {
  const W = 1080, pad = 56, F = (w, s) => `${w} ${s}px "Be Vietnam Pro",Arial,sans-serif`;
  const meas = document.createElement('canvas').getContext('2d');
  const wrap = (t, w, font) => { meas.font = font; const out = []; let line = '';
    for (const word of t.split(' ')) { const tt = line ? line + ' ' + word : word; if (meas.measureText(tt).width > w && line) { out.push(line); line = word } else line = tt }
    out.push(line); return out };
  const KX = pad, VX = pad + 330, VW = W - pad - VX;
  let H = 250; SEC.forEach(([, rows]) => { H += 74; rows.forEach(([, v]) => H += Math.max(1, wrap(v, VW, F(500, 25)).length) * 34 + 16) }); H += 80;
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); g.fillStyle = '#e31b23'; g.fillRect(0, 0, W, 170);
  g.fillStyle = '#fff'; g.font = F(800, 40); g.fillText('TÓM TẮT CHÍNH SÁCH BÁN HÀNG', pad, 80);
  g.font = F(500, 26); g.fillText('Phố Hiến Heritage Collection · CSBH ' + CSBH, pad, 128);
  let y = 230;
  SEC.forEach(([h, rows]) => {
    g.fillStyle = '#24272b'; g.font = F(800, 30); g.fillText(h, pad, y); g.fillStyle = '#e31b23'; g.fillRect(pad, y + 14, 60, 4); y += 58;
    rows.forEach(([k, v]) => { g.fillStyle = '#666c73'; g.font = F(600, 24); g.fillText(k, KX, y);
      const ls = wrap(v, VW, F(500, 25)); g.fillStyle = '#24272b'; g.font = F(600, 25); ls.forEach((l, i) => g.fillText(l, VX, y + i * 34));
      y += ls.length * 34 + 16; g.strokeStyle = '#e4e6e9'; g.beginPath(); g.moveTo(pad, y - 26); g.lineTo(W - pad, y - 26); g.stroke() });
    y += 16 });
  g.fillStyle = '#666c73'; g.font = F(500, 21);
  ['Thông tin tóm tắt, mang tính tham khảo theo chính sách bán hàng ngày ' + CSBH + '.', 'Chi tiết và số liệu chính thức theo CSBH, HĐMB của Chủ đầu tư.'].forEach(t => { g.fillText(t, pad, y); y += 32 });
  return c;
}
const v = document.getElementById('csbhView'), img = document.getElementById('csbhImg');
document.getElementById('bCsbh').onclick = () => { if (!img.src) img.src = draw().toDataURL('image/png'); v.hidden = false; window.__track && window.__track('xem_csbh', {}) };
v.onclick = e => { if (e.target === v || e.target.id === 'csbhX') v.hidden = true };
document.getElementById('csbhDl').onclick = async e => { e.stopPropagation(); window.__track && window.__track('tai_csbh', {});
  const blob = await new Promise(r => draw().toBlob(r, 'image/png')), name = 'CSBH-Pho-Hien-' + CSBH.replace(/\//g, '-') + '.png';
  try { const file = new File([blob], name, { type: 'image/png' });
    if (navigator.maxTouchPoints > 1 && navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Chính sách bán hàng Phố Hiến' }); return } }
  catch (err) { if (err && err.name === 'AbortError') return }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove() }, 1500) };
