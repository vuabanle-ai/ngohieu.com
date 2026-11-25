#!/usr/bin/env python3
"""Cập nhật quỹ hàng sa bàn Ocean City (OCP2 + OCP3) từ bảng hàng Joy Homes (chạy trên GitHub Actions).

Nguồn: sheet "TH VIN2 & VIN3" của Joy Homes (link công khai, tải dạng xlsx).
Đọc các tab tổng hợp (TH_OCP2, TH_OCP3) và quỹ độc quyền (ĐỘC QUYỀN OCP2/OCP3):
  * Dòng có mã căn đầy đủ (VD: KĐ8-63, VTĐ-25, ĐLBM-174) = còn hàng. Mã che (PB10-3x, ĐLSH-14x) bỏ qua.
  * Giá hoặc ngày ký ghi "Check admin" -> check hàng (chưa bán, hỏi lại admin).
  * Ô mã căn tô đỏ / gạch ngang, hoặc dòng ghi "đã bán / đã cọc" -> đã bán.
  * Căn lần trước còn hàng mà nay không còn trên bảng hàng -> đã bán ("không còn trên bảng hàng").
Dùng:  python3 tools/auto_sync_ocean_city.py [file.xlsx]
"""
import io, json, os, re, sys, datetime, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'du-an', 'Ocean-City', 'quy-hang.json')
SHEET = '1k9kgWCY7D4o7suOBSP8uxi28q3vk5V6N8k9oLcXbBBk'
CODE = re.compile(r'^[A-ZĐ]{1,5}\d{0,2}-\d{1,3}$')
SOLD_TXT = re.compile(r'ĐÃ\s*(BÁN|CỌC)|\bSOLD\b')
TAB = re.compile(r'(✅\s*TH_OCP[23]$)|(ĐỘC QUYỀN OCP[23])', re.I)


def norm_code(t):
    t = re.sub(r'\s+', '', str(t or '')).upper().replace('DLBM', 'ĐLBM').replace('DLHD', 'ĐLHĐ')
    return t


def money(v):
    """'29,300,000,000' / '32.495.766.341' -> đồng; '10.317' / '34.273' (tỷ, kiểu nghìn triệu) -> đồng."""
    if v is None: return None
    if isinstance(v, (int, float)):
        n = float(v)
    else:
        s = str(v).strip()
        if not re.search(r'\d', s): return None
        s = re.sub(r'[^\d.,]', '', s)
        if re.fullmatch(r'\d{1,3}([.,]\d{3}){2,}', s): n = float(re.sub(r'[.,]', '', s))
        elif re.fullmatch(r'\d{1,3}[.,]\d{3}', s): n = float(re.sub(r'[.,]', '', s)) * 1e6   # triệu
        else:
            try: n = float(s.replace(',', '.'))
            except ValueError: return None
    if n < 1e3: n *= 1e9          # tỷ
    elif n < 1e6: n *= 1e6        # triệu
    return int(round(n)) if n > 1e8 else None


def rows_from_xlsx(data):
    import openpyxl
    wb = openpyxl.load_workbook(io.BytesIO(data), data_only=True)
    out = {}
    for ws in wb.worksheets:
        if not TAB.search(ws.title.strip()) or ws.sheet_state != 'visible': continue
        rows = []
        for row in ws.iter_rows():
            r = []
            for c in row:
                red = False
                try:
                    f = c.fill
                    if f is not None and f.fill_type == 'solid' and f.fgColor.type == 'rgb' and f.fgColor.rgb and len(f.fgColor.rgb) == 8:
                        R, G, B = (int(f.fgColor.rgb[i:i + 2], 16) / 255 for i in (2, 4, 6)); red = R > .55 and G < .45 and B < .45
                except Exception: pass
                r.append((c.value, red, bool(c.font and c.font.strike)))
            rows.append(r)
        out[ws.title.strip()] = rows
    return out


def rows_from_grid(path):
    d = json.load(open(path, encoding='utf-8')); d = d.get('content', d)
    out = {}
    for sh in d['sheets']:
        t = sh['properties']['title'].strip()
        if not TAB.search(t): continue
        rows = []
        for r in sh['data'][0].get('rowData', []):
            row = []
            for v in r.get('values', []):
                bg = v.get('effectiveFormat', {}).get('backgroundColor', {})
                red = bg.get('red', 0) > .55 and bg.get('green', 0) < .45 and bg.get('blue', 0) < .45
                row.append((v.get('formattedValue'), red, v.get('effectiveFormat', {}).get('textFormat', {}).get('strikethrough', False)))
            rows.append(row)
        out[t] = rows
    return out


H = {'phan_khu': r'^phân khu', 'ma': r'^mã căn', 'loai': r'^loại hình$|^loại hình\s*$', 'huong': r'^hướng', 'dt': r'^dt đất',
     'dtxd': r'^dtxd$|^dt ?xd$|^dtxd\s*$', 'gia': r'^giá full|^tổng giá', 'tts': r'^giá tts', 'tttd': r'^giá tttđ', 'htls': r'^htls',
     'tcbg': r'^tcbg', 'csbh': r'^csbh', 'quy': r'^quỹ', 'ky': r'^loại hình ký|^ngày ký', 'nh': r'^ngân hàng', 'don_gia': r'^đơn giá'}


def parse(tabs):
    avail, check, sold, listed = {}, {}, {}, set()
    for title, rows in tabs.items():
        dq = 'ĐỘC QUYỀN' in title.upper()
        col = None
        for row in rows:
            vals = [str(v[0]).strip() if v[0] is not None else '' for v in row]
            low = [re.sub(r'\s+', ' ', x).lower() for x in vals]
            if any(re.match(H['ma'], x) for x in low):
                col = {}
                for k, pat in H.items():
                    for i, x in enumerate(low):
                        if re.match(pat, x) and k not in col: col[k] = i
                continue
            if not col or 'ma' not in col or col['ma'] >= len(row): continue
            code = norm_code(vals[col['ma']])
            if not CODE.match(code): continue
            g = lambda k: vals[col[k]] if k in col and col[k] < len(vals) else ''
            listed.add(code)
            txt = ' '.join(vals).upper()
            cell = row[col['ma']]
            q = {'src': ['JH'], 'quy': ('Độc quyền JH · ' if dq else '') + (g('quy') or '').strip()}
            for k in ('loai', 'huong', 'tcbg', 'csbh'):
                if g(k): q[k] = g(k).replace('\n', ' ').strip()
            if g('dt'): q['dt'] = g('dt')
            if g('dtxd') and g('dtxd') != '-': q['dtxd'] = g('dtxd')
            gia = money(g('gia')); bg = {}
            for k in ('tts', 'htls', 'tttd', 'don_gia'):
                m = money(g(k)) if k != 'don_gia' else None
                if m: bg[k if k != 'htls' else 'vay'] = m
            if gia: q['gia'] = gia
            if bg: q['bg'] = bg
            if not q.get('quy', '').strip(' ·'): q.pop('quy', None)
            if cell[1] or cell[2] or SOLD_TXT.search(txt):
                sold[code] = {**q, 'why': 'bảng hàng Joy Homes đánh dấu đã bán'}; continue
            if re.search(r'CHECK\s*ADMIN', txt):
                check[code] = {**q, 'why': 'bảng hàng Joy Homes ghi Check admin'}; continue
            old = avail.get(code)
            if old:   # trùng mã: giữ giá thấp nhất, lưu giá các dòng
                offers = old.setdefault('offers', [{'src': 'JH', 'gia': old.get('gia'), 'tcbg': old.get('tcbg')}])
                offers.append({'src': 'JH', 'gia': q.get('gia'), 'tcbg': q.get('tcbg')})
                if q.get('gia') and (not old.get('gia') or q['gia'] < old['gia']):
                    q['offers'] = offers; avail[code] = q
                continue
            avail[code] = q
    for c in list(check):
        if c in avail: check.pop(c)
    return avail, check, sold, listed


def main():
    if len(sys.argv) > 1 and sys.argv[1].endswith('.json'): tabs = rows_from_grid(sys.argv[1])
    else:
        if len(sys.argv) > 1: data = open(sys.argv[1], 'rb').read()
        else:
            url = f'https://docs.google.com/spreadsheets/d/{SHEET}/export?format=xlsx'
            data = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 ngohieu-sync'}), timeout=90).read()
        if data[:2] != b'PK': print('Không tải được bảng hàng Joy Homes'); sys.exit(1)
        tabs = rows_from_xlsx(data)
    if not tabs: print('Không thấy tab TH_OCP / ĐỘC QUYỀN'); sys.exit(1)
    avail, check, sold, listed = parse(tabs)
    try: prev = json.load(open(OUT, encoding='utf-8'))
    except Exception: prev = {'available': {}, 'sold': {}, 'check': {}}
    now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7)))
    # căn trước còn hàng, nay không còn trên bảng hàng -> đã bán
    for c, q in prev.get('available', {}).items():
        if c not in listed and c not in sold:
            sold[c] = {**q, 'why': 'không còn trên bảng hàng Joy Homes từ ' + now.strftime('%d/%m/%Y')}
    for c, q in prev.get('sold', {}).items():
        if c not in listed and c not in sold: sold[c] = q
    for c in list(sold):
        if c in avail or c in check: sold.pop(c)
    out = {'updated': now.strftime('%H:%M %d/%m/%Y'), 'nguon': 'Joy Homes – TH VIN2 & VIN3',
           'available': dict(sorted(avail.items())), 'check': dict(sorted(check.items())), 'sold': dict(sorted(sold.items()))}
    changed = {k: prev.get(k) for k in ('available', 'check', 'sold')} != {k: out[k] for k in ('available', 'check', 'sold')}
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(('THAY ĐỔI' if changed else 'KHÔNG ĐỔI'), f"còn {len(avail)} · check {len(check)} · đã bán {len(sold)}")


if __name__ == '__main__':
    main()
