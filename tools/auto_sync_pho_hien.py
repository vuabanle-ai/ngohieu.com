#!/usr/bin/env python3
"""Tự động cập nhật quỹ hàng sa bàn Phố Hiến từ link bảng hàng đại lý (chạy trên GitHub Actions 5 phút/lần).

Tải từng bảng hàng (link công khai) dạng xlsx, đọc ô mã căn (nền đỏ / gạch ngang / dòng ghi "đã bán", "đã cọc" = đã bán),
ghi ra file grid rồi gọi tools/sync_quy_hang.py để áp quy tắc quỹ hàng (độc quyền, Check admin, mất khỏi bảng hàng...).
Dùng:  python3 tools/auto_sync_pho_hien.py   (in THAY ĐỔI / KHÔNG ĐỔI)
"""
import io, json, os, re, subprocess, sys, tempfile, urllib.request
import openpyxl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'du-an', 'Happy-Home-Pho-Hien', 'quy-hang.json')
CFG = json.load(open(os.path.join(ROOT, 'tools', 'nguon-pho-hien.json'), encoding='utf-8'))
CODE = re.compile(r'^(HK|TC[123]|ĐLTC|DLTC|TP|TV)-\d+$')
SOLD_TXT = re.compile(r'ĐÃ\s*(BÁN|CỌC)|\bSOLD\b')
UA = {'User-Agent': 'Mozilla/5.0 ngohieu-sync'}

def fetch(fid):
    urls = [f'https://docs.google.com/spreadsheets/d/{fid}/export?format=xlsx',
            f'https://drive.google.com/uc?export=download&id={fid}']
    for u in urls:
        try:
            data = urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60).read()
            if data[:2] == b'PK': return data
        except Exception as e:
            print('  lỗi tải', u.split('/')[2], e, file=sys.stderr)
    return None

def auto_tab(ten, title):
    t = title.upper()
    if re.search(r'DS CĂN|GIÁ|BANK|STK|CSBH|TÓM TẮT|^BG$|LINK|OCP|TOÀ|TÒA|BIỂU MẪU|BOOKING|THÔNG SỐ|^TT$|CHÍNH SÁCH', t): return None
    if re.search(r'ĐQ|ĐỘC QUYỀN|DOC QUYEN', t): return ten + ':dq'
    if re.search(r'CHUNG|\bQC\b', t): return ten + 'QC'
    if re.search(r'QUỸ|BẢNG HÀNG|\bBH\b|THẤP TẦNG|LIỀN KỀ|PHỐ HIẾN|LOCK', t): return ten
    return None

def red(c):
    try:
        f = c.fill
        if f is None or f.fill_type != 'solid': return False
        v = f.fgColor
        if v.type == 'rgb' and v.rgb and len(v.rgb) == 8:
            r, g, b = (int(v.rgb[i:i + 2], 16) / 255 for i in (2, 4, 6))
            return r > .55 and g < .45 and b < .45
    except Exception: pass
    return False

def grid(ws):
    rows = []
    for row in ws.iter_rows():
        txt = ' '.join(str(c.value) for c in row if c.value is not None).upper()
        sold_row = bool(SOLD_TXT.search(txt))
        for c in row:
            v = c.value
            if isinstance(v, str) and CODE.match(v.strip().upper()):
                m = red(c) or bool(c.font and c.font.strike) or sold_row
                rows.append({'values': [{'formattedValue': v.strip(), 'effectiveFormat': {
                    'backgroundColor': {'red': 1, 'green': 0, 'blue': 0} if m else {'red': 1, 'green': 1, 'blue': 1},
                    'textFormat': {'strikethrough': False}}}]})
    return rows

def manual(path):
    d = json.load(open(os.path.join(ROOT, 'tools', path), encoding='utf-8'))
    mk = lambda cs, m: [{'values': [{'formattedValue': c, 'effectiveFormat': {
        'backgroundColor': {'red': 1, 'green': 0, 'blue': 0} if m else {'red': 1, 'green': 1, 'blue': 1}}}]} for c in cs]
    return mk(d.get('dq', []), False), mk(d.get('qc', []), False) + mk(d.get('da_ban', []), True)

def main():
    tmp = tempfile.mkdtemp(); args = []
    def emit(name, rows):
        dq = name.endswith(':dq'); base = name[:-3] if dq else name
        p = os.path.join(tmp, re.sub(r'\W', '_', base) + '.json')
        if os.path.exists(p):                       # hai tab cùng tên nguồn -> gộp
            old = json.load(open(p))['sheets'][0]['data'][0]['rowData']; rows = old + rows
        json.dump({'sheets': [{'data': [{'rowData': rows}]}]}, open(p, 'w'), ensure_ascii=False)
        a = f'{base}={p}' + (':dq' if dq else '')
        args[:] = [x for x in args if not x.startswith(base + '=')] + [a]
    for n in CFG['nguon']:
        ten = n['ten']; data = fetch(n['id'])
        if not data: print('BỎ QUA', ten, '(không tải được)', file=sys.stderr); continue
        try: wb = openpyxl.load_workbook(io.BytesIO(data))
        except Exception as e: print('BỎ QUA', ten, e, file=sys.stderr); continue
        tabs = n.get('tabs')
        for ws in wb.worksheets:
            name = (tabs or {}).get(ws.title) if tabs else auto_tab(ten, ws.title)
            if not name: continue
            rows = grid(ws)
            print(f'  {ten} | {ws.title} -> {name}: {len(rows)} căn', file=sys.stderr)
            emit(name, rows)
    for ten, path in CFG.get('thu_cong', {}).items():
        dq, qc = manual(path); emit(ten + ':dq', dq); emit(ten + 'QC', qc)
    if not args: print('KHÔNG ĐỌC ĐƯỢC NGUỒN NÀO'); sys.exit(1)
    r = subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'sync_quy_hang.py'), OUT] + args,
                       capture_output=True, text=True)
    sys.stderr.write(r.stderr); print(r.stdout.strip()); sys.exit(r.returncode)

main()
