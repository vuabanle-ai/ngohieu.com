// Chống sao chép nội dung ngohieu.com: chặn bôi đen, chuột phải, kéo ảnh, phím tắt copy / lưu / in / xem mã nguồn / DevTools.
// Ô nhập liệu (form đăng ký, đăng nhập) vẫn gõ, dán bình thường.
(() => {
  const isField = el => !!(el && el.closest && el.closest('input, textarea, select, [contenteditable="true"]'));
  const block = e => { if (!isField(e.target)) { e.preventDefault(); return false; } };

  const css = document.createElement('style');
  css.textContent = 'html,body{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}' +
    'input,textarea,select,[contenteditable="true"]{-webkit-user-select:text;user-select:text}' +
    'img{-webkit-user-drag:none;user-drag:none}' +
    '@media print{body{display:none!important}}';
  (document.head || document.documentElement).appendChild(css);

  ['contextmenu', 'selectstart', 'copy', 'cut', 'dragstart'].forEach(t => document.addEventListener(t, block, true));

  document.addEventListener('keydown', e => {
    const k = (e.key || '').toLowerCase(), mod = e.ctrlKey || e.metaKey;
    if (k === 'f12') return e.preventDefault();
    if (mod && e.shiftKey && ['i', 'j', 'c', 'k'].includes(k)) return e.preventDefault();   // DevTools
    if (mod && e.altKey && ['i', 'j', 'c', 'u'].includes(k)) return e.preventDefault();     // DevTools trên Mac
    if (mod && ['u', 's', 'p'].includes(k)) return e.preventDefault();                       // xem nguồn, lưu trang, in
    if (mod && ['c', 'x', 'a'].includes(k) && !isField(e.target)) return e.preventDefault(); // copy, cắt, chọn tất cả
  }, true);
})();
