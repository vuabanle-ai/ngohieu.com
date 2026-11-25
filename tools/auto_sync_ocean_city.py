#!/usr/bin/env python3
"""Cập nhật quỹ hàng sa bàn Ocean City (OCP2 + OCP3) từ các link bảng hàng đại lý (chạy trên GitHub Actions).

Nguồn: danh sách link ở tools/nguon-ocean-city.json = tab "OCP2 & 3" của sheet CHECK ĐL HUONG.
Mỗi bảng hàng tải dạng xlsx (link công khai). Đọc các tab đang hiện có mã căn (bỏ tab thông số, diện tích,
giỏ bank, STK, KPTM, danh sách chính sách...). Quy tắc giống sa bàn Phố Hiến:
  * Ô mã căn tô đỏ / gạch ngang, hoặc dòng ghi "đã bán / đã cọc" -> đại lý đó báo đã bán.
  * Mã căn có trên bảng hàng, không bị đánh dấu -> còn hàng (ghi tên các đại lý đang có căn).
  * Căn trong quỹ độc quyền (tab ĐQ) chưa bôi mà đại lý khác bôi đỏ -> Check hàng (hỏi admin).
  * Dòng ghi "Check admin" -> Check hàng.
  * Căn lần trước còn hàng, nay không đại lý nào còn (và các nguồn cũ của nó đều đọc được) -> đã bán.
  * Mã che (PB10-3x, ĐLSH-14x...) bỏ qua.
Giá: cột "Tổng giá gồm VAT & KPBT / giá full" (gia), "TTTĐ / tiến độ" (bg.tttd), "TTS" (bg.tts), "vay" (bg.vay);
nhiều đại lý thì lấy giá của quỹ độc quyền, không có thì giá thấp nhất, kèm danh sách giá từng đại lý.
Dùng:  python3 tools/auto_sync_ocean_city.py [thư_mục_xlsx_thử]   (in THAY ĐỔI / KHÔNG ĐỔI)
"""
import io, json, os, re, sys, datetime, urllib.request
import openpyxl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'du-an', 'Ocean-City', 'quy-hang.json')
CFG = json.load(open(os.path.join(ROOT, 'tools', 'nguon-ocean-city.json'), encoding='utf-8'))
PRE = r'(?:ĐLBM|ĐLHĐ|ĐLSH|ĐLNT|VTĐ|ĐĐD|HĐ|TĐ|AD|PB|VT|VX|ĐN|SB|CX|CL|KĐ|SH|HA|ĐD|NT|BX)'
CODE = re.compile(r'^' + PRE + r'\d{0,2}-\d{1,3}$')
SOLD_TXT = re.compile(r'ĐÃ\s*(BÁN|CỌC)|\bSOLD\b')
CHECK_TXT = re.compile(r'CHECK\s*ADMIN')
SKIP_TAB = re.compile(r'THÔNG SỐ|THONG SO|DIỆN TÍCH|DIEN TICH|GIỎ|BANK|STK|KPTM|ELITE|CSDL|^TK|DS K|TEST|BIỂU MẪU|CÂU TRẢ LỜI|'
                      r'NGƯỜI NƯỚC NGOÀI|NNN|TMDV|\(CŨ\)|\bCŨ\b|CSBH|CHÍNH SÁCH|PTG|PHIẾU|NHẬN TIỀN|NỘP TIỀN|TRC|KHÔNG ÁP DỤNG|TCBG|BÀN GIAO|FULLTON', re.I)
UA = {'User-Agent': 'Mozilla/5.0 ngohieu-sync'}
VER = 5


def norm_code(t):
    t = re.sub(r'\s+', '', str(t or '')).upper()
    for a, b in (('^DLBM', 'ĐLBM'), ('^DLHD', 'ĐLHĐ'), ('^DLSH', 'ĐLSH'), ('^DLNT', 'ĐLNT'), ('^VTD', 'VTĐ'), ('^DDD', 'ĐĐD'),
                 (r'^HD(?=\d)', 'HĐ'), (r'^TD(?=\d)', 'TĐ'), (r'^DN(?=\d)', 'ĐN'), (r'^KD(?=\d|-)', 'KĐ'), (r'^DD(?=\d)', 'ĐD')):
        t = re.sub(a, b, t)
    m = re.match(r'^(.*-)(\d)$', t)          # KĐ5-7 -> KĐ5-07
    return m.group(1) + '0' + m.group(2) if m else t


def money(v):
    """số đồng; nhận '29,300,000,000', '32.495.766.341', 32495766341, 34883.07 (triệu), 34.27 (tỷ)."""
    if v is None or isinstance(v, (datetime.date, datetime.datetime)): return None
    if isinstance(v, (int, float)): n = float(v)
    else:
        s = re.sub(r'[^\d.,]', '', str(v))
        if not s: return None
        if re.fullmatch(r'\d{1,3}([.,]\d{3}){2,}', s): n = float(re.sub(r'[.,]', '', s))
        elif re.fullmatch(r'\d{1,3}[.,]\d{3}', s): n = float(re.sub(r'[.,]', '', s))
        else:
            try: n = float(s.replace(',', '.'))
            except ValueError: return None
    if n <= 0: return None
    if n < 1e3: n *= 1e9
    elif n < 1e6: n *= 1e6
    return int(round(n)) if 2e9 <= n <= 4e11 else None


def fetch(fid):
    for u in (f'https://docs.google.com/spreadsheets/d/{fid}/export?format=xlsx',
              f'https://drive.google.com/uc?export=download&id={fid}'):
        try:
            data = urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=90).read()
            if data[:2] == b'PK': return data
        except Exception as e:
            print('  lỗi tải', u.split('/')[2], e, file=sys.stderr)
    return None


def red_cell(c):
    try:
        f = c.fill
        if f is not None and f.fill_type == 'solid' and f.fgColor.type == 'rgb' and f.fgColor.rgb and len(f.fgColor.rgb) == 8:
            R, G, B = (int(f.fgColor.rgb[i:i + 2], 16) / 255 for i in (2, 4, 6))
            return R > .55 and G < .45 and B < .45
    except Exception: pass
    return False


HDR = [('gia', r'(gi[áa]|gía).*(gồm|full|niêm yết|bao gồm|sau vat)|tổng giá|giá bán gồm'), ('tttd', r'tttđ|tiến độ'),
       ('tts', r'\btts\b|thanh toán sớm'), ('vay', r'vay|htls|70%'), ('dt', r'^dt\s*đất|diện tích đất|^dt\s*\(?m'),
       ('dtxd', r'dtxd|dt\s*xd|diện tích xây|tổng sàn'), ('loai', r'loại\s*(hình|căn|sp)'), ('tcbg', r'tcbg|bàn giao'),
       ('huong', r'^hướng'), ('tt', r'tình trạng|trạng thái')]


def sanity(q):
    """Bỏ giá vô lý: đơn giá/m² đất ngoài 80–600 triệu, hoặc TTTĐ/TTS/vay lệch quá xa giá gồm VAT."""
    try: dt = float(str(q.get('dt', '')).replace(',', '.'))
    except ValueError: dt = 0
    ok = lambda v: v and (not dt or 8e7 <= v / dt <= 6e8)
    for k in ('gia', 'tttd', 'tts', 'vay'):
        if k in q and not ok(q[k]): q.pop(k)
    ref = q.get('gia') or q.get('tttd')
    for k in ('tttd', 'tts', 'vay'):
        if k in q and ref and not (.7 <= q[k] / ref <= 1.35): q.pop(k)


def read_tab(ws):
    """-> list of (code, marked, check, info dict)"""
    out, col = [], {}
    for row in ws.iter_rows():
        vals = ['' if c.value is None else str(c.value).strip() for c in row]
        low = [re.sub(r'\s+', ' ', v).lower() for v in vals]
        if any(re.fullmatch(r'mã( căn)?( được phân bổ)?|mã sp|mã sản phẩm|ma can', x) for x in low):
            col = {'_': -1}
            for k, pat in HDR:
                for i, x in enumerate(low):
                    if x and re.search(pat, x) and k not in col and i not in col.values(): col[k] = i
            continue
        if not col: continue                     # chưa gặp dòng tiêu đề "Mã căn" -> không phải bảng hàng
        txt = ' '.join(vals).upper()
        for c in row:
            v = c.value
            if not isinstance(v, str): continue
            code = norm_code(v)
            if not CODE.match(code): continue
            q = {}
            g = lambda k: row[col[k]].value if k in col and col[k] < len(row) else None
            for k in ('gia', 'tttd', 'tts', 'vay'):
                m = money(g(k))
                if m: q[k] = m
            for k in ('dt', 'dtxd', 'loai', 'tcbg', 'huong'):
                x = g(k)
                if x not in (None, '', '-') and not isinstance(x, (datetime.date, datetime.datetime)):
                    q[k] = str(x).replace('\n', ' ').strip()[:40]
            sanity(q)
            st = str(g('tt') or '').upper()
            marked = red_cell(c) or bool(c.font and c.font.strike) or bool(SOLD_TXT.search(txt)) or bool(SOLD_TXT.search(st))
            out.append((code, marked, bool(CHECK_TXT.search(txt)), q))
            break                                # một mã căn mỗi dòng
    return out


def read_source(n, data):
    wb = openpyxl.load_workbook(io.BytesIO(data), data_only=True)
    res = []
    for ws in wb.worksheets:
        t = ws.title.strip(); tabs = n.get('tabs')
        if tabs:
            name = tabs.get(t)
            if not name: continue
        else:
            if ws.sheet_state != 'visible' or SKIP_TAB.search(t): continue
            name = n['ten'] + (':dq' if re.search(r'ĐQ|ĐỘC QUYỀN|DOC QUYEN|\bDQ\b', t, re.I) else '')
        rows = read_tab(ws)
        if re.search(r'ĐÃ BÁN|DA BAN|SOLD', t, re.I): rows = [(c, True, k, q) for c, m, k, q in rows]   # tab "căn đã bán"
        if not rows or len(rows) > 1500: continue            # bảng thông số toàn dự án -> bỏ
        print(f'  {n["ten"]} | {t} -> {name}: {len(rows)} căn', file=sys.stderr)
        res.append((name, rows))
    return res


def main():
    local = sys.argv[1] if len(sys.argv) > 1 else None
    now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7))); today = now.strftime('%d/%m/%Y')
    ok, listed, marked, dq_ok, chk_txt, info = set(), {}, {}, set(), set(), {}
    for n in CFG['nguon']:
        ten = n['ten']
        if local:
            p = os.path.join(local, n['id'] + '.xlsx')
            data = open(p, 'rb').read() if os.path.exists(p) else None
        else: data = fetch(n['id'])
        if not data: print('BỎ QUA', ten, '(không tải được)', file=sys.stderr); continue
        try: tabs = read_source(n, data)
        except Exception as e: print('BỎ QUA', ten, e, file=sys.stderr); continue
        ok.add(ten)
        for name, rows in tabs:
            dq = name.endswith(':dq')
            for code, m, ck, q in rows:
                if m: marked.setdefault(code, set()).add(ten); continue
                listed.setdefault(code, set()).add(ten)
                if dq: dq_ok.add(code)
                if ck: chk_txt.add(code)
                info.setdefault(code, []).append((ten, dq, q))
    try: prev = json.load(open(OUT, encoding='utf-8'))
    except Exception: prev = {}
    if prev.get('ver') != VER: prev = {}            # đổi nguồn / đổi cách đọc: làm lại từ đầu

    def merge(code, srcs):
        rows = info.get(code, [])
        dqr = [r for r in rows if r[1]]
        base = dqr or rows
        priced = [r for r in base if r[2].get('gia') or r[2].get('tttd')]
        best = min(priced, key=lambda r: r[2].get('gia') or r[2].get('tttd')) if priced else (base[0] if base else None)
        q0 = best[2] if best else {}
        q = {'src': sorted(srcs)}
        for k in ('loai', 'dt', 'dtxd', 'tcbg', 'huong'):
            v = q0.get(k) or next((r[2][k] for r in rows if r[2].get(k)), None)
            if v: q[k] = v
        if q0.get('gia'): q['gia'] = q0['gia']
        bg = {k: q0[k] for k in ('tttd', 'tts', 'vay') if q0.get(k)}
        if not q.get('gia') and bg.get('tttd'): q['gia'] = bg['tttd']
        if bg: q['bg'] = bg
        if dqr: q['quy'] = 'Độc quyền ' + ', '.join(sorted({r[0] for r in dqr}))
        offs = {}
        for t, d, r in rows:
            g = r.get('gia') or r.get('tttd')
            if g and (t not in offs or g < offs[t]['gia']): offs[t] = {'src': t, 'gia': g, **({'tcbg': r['tcbg']} if r.get('tcbg') else {})}
        if len(offs) > 1: q['offers'] = sorted(offs.values(), key=lambda o: o['gia'])
        return q

    avail, check, sold = {}, {}, dict(prev.get('sold') or {})
    for c, srcs in listed.items():
        if c in marked and c not in dq_ok: continue
        if c in chk_txt: check[c] = {**merge(c, srcs), 'why': 'bảng hàng ghi Check admin'}; continue
        avail[c] = merge(c, srcs)
    for c in dq_ok:
        if c in marked:
            q = avail.pop(c, None) or merge(c, listed.get(c, []))
            check[c] = {**q, 'why': 'quỹ độc quyền chưa bôi nhưng ' + ', '.join(sorted(marked[c])) + ' bôi đỏ'}
    for c, srcs in marked.items():
        if c in avail or c in check: continue
        if c not in sold or sold[c].get('why', '').startswith('không còn'):
            sold[c] = {'since': today, 'why': 'đại lý bôi đỏ / ghi đã bán: ' + ', '.join(sorted(srcs))}
    for c, q in (prev.get('available') or {}).items():
        if c in avail or c in check or c in marked: continue
        srcs = set(q.get('src', []))
        if srcs and not srcs <= ok:                  # nguồn cũ lỗi -> chưa kết luận
            avail[c] = q; continue
        sold.setdefault(c, {**{k: q[k] for k in ('loai', 'dt', 'gia') if k in q}, 'since': today, 'why': 'không còn trên bảng hàng đại lý'})
    for c in list(sold):
        if sold[c].get('why') == 'báo thủ công': avail.pop(c, None); check.pop(c, None); continue
        if c in avail or c in check: del sold[c]
    out = {'ver': VER, 'updated': now.strftime('%H:%M %d/%m/%Y'), 'nguon': 'Bảng hàng đại lý – tab OCP2 & 3, sheet CHECK ĐL HUONG',
           'doc_duoc': sorted(ok), 'available': dict(sorted(avail.items())), 'check': dict(sorted(check.items())), 'sold': dict(sorted(sold.items()))}
    changed = {k: prev.get(k) for k in ('available', 'check', 'sold')} != {k: out[k] for k in ('available', 'check', 'sold')}
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(('THAY ĐỔI' if changed else 'KHÔNG ĐỔI'), f'còn {len(avail)} · check {len(check)} · đã bán {len(sold)} · đọc được {len(ok)}/{len(CFG["nguon"])} nguồn')


if __name__ == '__main__':
    main()
