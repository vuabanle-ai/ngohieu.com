// Nút "Về trang chủ" (hình ngôi nhà) cho các trang bên trong ngohieu.com
(function () {
  if (location.pathname === '/' || location.pathname === '/index.html') return;
  function add() {
    if (document.getElementById('nutTrangChu')) return;
    var a = document.createElement('a');
    a.id = 'nutTrangChu'; a.href = '/'; a.title = 'Về trang chủ ngohieu.com'; a.setAttribute('aria-label', 'Về trang chủ');
    a.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M3 10.6 12 3l9 7.6V21a1 1 0 0 1-1 1h-5.5v-6.5h-5V22H4a1 1 0 0 1-1-1z" fill="currentColor"/></svg>';
    var st = document.createElement('style');
    st.textContent = '#nutTrangChu{flex:none;display:inline-grid;place-items:center;width:44px;height:44px;border-radius:12px;background:#e31b23;color:#fff;box-shadow:0 6px 20px rgba(227,27,35,.3);text-decoration:none;pointer-events:auto;z-index:50}#nutTrangChu:hover{background:#c8102e}#nutTrangChu:focus-visible{outline:3px solid #5d636b;outline-offset:2px}#nutTrangChu.noi{position:static;margin:12px 0 0 12px;display:grid}#nutTrangChu.trang{background:#fff;color:#e31b23;box-shadow:0 4px 14px rgba(0,0,0,.18)}#nutTrangChu.trang:hover{background:#fdecee}@media(max-width:600px){#nutTrangChu{width:38px;height:38px;border-radius:10px}#nutTrangChu svg{width:19px;height:19px}}';
    document.head.appendChild(st);
    // sa bàn: trước ô tên dự án; trang danh sách / tìm căn rẻ: đầu thanh menu; trang khác: nổi góc trên trái
    var brand = document.querySelector('header.top > .brand');
    var wrap = document.querySelector('header.top > .wrap, header.hd > .wrap');
    if (brand) brand.parentNode.insertBefore(a, brand);
    else if (wrap) {
      a.style.marginRight = innerWidth < 600 ? '6px' : '10px'; wrap.insertBefore(a, wrap.firstChild);
      if (wrap.querySelector('.logo span')) st.textContent += '@media(max-width:600px){header.top .logo span{display:none}}';
      // đầu trang nền đỏ: đổi nút sang nền trắng cho dễ thấy
      var bg = getComputedStyle(wrap.parentNode).backgroundColor.match(/\d+/g);
      if (bg && +bg[0] > 150 && +bg[1] < 90 && +bg[2] < 90) a.classList.add('trang');
    }
    else { a.className = 'noi'; document.body.insertBefore(a, document.body.firstChild) }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add); else add();
})();
