#!/usr/bin/env python3
"""Ghép bảng thông số từng căn Ocean Park 2 / 3 (DT đất, DTXD từng tầng, tum, tổng, hướng, mặt tiền, số tầng)
từ các tab thông số trong bảng hàng đại lý (link ở tab OCP2 & 3 của CHECK ĐL HUONG).
Ưu tiên Mayhomes (tab "XD OCP2", "XD OCP3" – anh Hiếu chỉ định), ô nào trống thì lấy bổ sung từ file khác.
Dùng: python3 tools/build_thong_so_ocean.py thư_mục_xlsx   (tên file = id Google Drive .xlsx)"""
import json, os, re, sys, collections, warnings
import openpyxl
warnings.filterwarnings('ignore')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = [('Mayhomes', '1-KcwSLpuSQGhqOZ8BycoRLeE3DUrawan'), ('SSM', '15LLM3FyMvESjGMkqk7huCAp4E4w4tR3npqWLeuCB2Kk'),
       ('Newstarland', '1FDnt60-5OeQdy0tFfzrsLhYGAge2i-AjtX0vr1LZMa4'), ('MICC', '1stAchuTAuKDwJg3adUdAWXJQI1m9GFilcASiOnUlM6o'),
       ('Phúc Lộc', '1fjsSdxl4vjIYsZV-qHhegCjuYUVAzSdD'), ('Đất Việt', '18myJM1bcuRYM0f3s8siAysu5CGOCJREHqpGgGhTOdqQ')]
CODE = re.compile(r'^[A-ZĐ]{1,5}\d{0,2}-\d{1,3}$')
F = ['dt', 't1', 't2', 't3', 't4', 't5', 'tum', 'tong', 'tang', 'huong', 'mattien', 'mau']
HP = [('ma', r'^mã căn|^mã căn tm|^mã căn mới'), ('dt', r'^dt đất|^diện tích đất'), ('t1', r'tầng 1$|^t1$'), ('t2', r'tầng 2$|^t2$'),
      ('t3', r'tầng 3$|^t3$'), ('t4', r'tầng 4$|^t4$'), ('t5', r'tầng 5$|^t5$'), ('tum', r'^tum'), ('tong', r'^tổng (dtxd|sàn)'),
      ('tang', r'^số tầng|^tầng$'), ('huong', r'^hướng'), ('mattien', r'^mặt tiền|^kích thước'), ('mau', r'^mẫu căn|^tên mẫu nhà')]
TAB = re.compile(r'(?i)thông số|^xd ocp|dtxd|diện tích')


def num(x):
    try:
        v = float(str(x).replace(',', '.').strip())
        return round(v, 2) if v > 0 else None
    except (TypeError, ValueError):
        return None


def norm_mt(s):
    s = str(s or '').strip()
    m = re.match(r'^\s*([\d.,]+)\s*[xX×]\s*([\d.,]+)', s)
    if not m: return None
    def f(t):
        t = t.replace(',', '.').strip('.')
        t = re.sub(r'\.(?=.*\.)', '', t) if t.count('.') > 1 else t   # '7.5.0' -> '75.0'? giữ phần đầu
        try: return ('%g' % float(t)).replace('.', ',')
        except ValueError: return None
    a, b = f(m.group(1)), f(m.group(2))
    return f'{a} x {b} m' if a and b else None


def read(path):
    wb = openpyxl.load_workbook(path, data_only=True)
    out = {}
    for ws in wb.worksheets:
        if not TAB.search(ws.title.strip()): continue
        segs = None
        for row in ws.iter_rows(values_only=True):
            low = [re.sub(r'\s+', ' ', str(x)).strip().lower() if x is not None else '' for x in row]
            starts = [i for i, x in enumerate(low) if re.match(HP[0][1], x)]
            if starts and any(re.search(r'tầng 1|^t1$', x) for x in low):
                segs = []
                for k, s in enumerate(starts):
                    e = starts[k + 1] if k + 1 < len(starts) else len(low)
                    col = {'ma': s}
                    for f, pat in HP[1:]:
                        for i in range(s, e):
                            if low[i] and re.search(pat, low[i]) and f not in col: col[f] = i
                    segs.append(col)
                continue
            if not segs: continue
            for col in segs:
                c = str(row[col['ma']] or '').strip().upper().replace(' ', '') if col['ma'] < len(row) else ''
                if not CODE.match(c): continue
                g = lambda f: row[col[f]] if f in col and col[f] < len(row) else None
                r = {f: num(g(f)) for f in ('dt', 't1', 't2', 't3', 't4', 't5', 'tum', 'tong')}
                t = num(g('tang')); r['tang'] = int(t) if t and t < 10 else None
                h = str(g('huong') or '').replace('\n', ' ').strip(); r['huong'] = re.sub(r'\s+', ' ', h) if h and h != 'None' else None
                r['mattien'] = norm_mt(g('mattien'))
                m = str(g('mau') or '').strip(); r['mau'] = m if m and m != 'None' else None
                out.setdefault(c, r)
    return out


def main():
    d = sys.argv[1]
    data, src_n = {}, collections.Counter()
    conflicts = collections.Counter()
    for name, fid in SRC:
        p = os.path.join(d, fid + '.xlsx')
        if not os.path.exists(p): print('thiếu', name); continue
        rows = read(p); print(name, len(rows), 'căn có thông số')
        for c, r in rows.items():
            cur = data.setdefault(c, {})
            for f in F:
                v = r.get(f)
                if v is None: continue
                if cur.get(f) is None: cur[f] = v; src_n[(name, f)] += 1
                elif f in ('dt', 'tong') and abs(float(cur[f]) - float(v)) > 1: conflicts[(name, f)] += 1
    for c, r in data.items():      # tổng = cộng tầng khi thiếu; tum = tổng - các tầng khi thiếu
        fl = [r.get(f) or 0 for f in ('t1', 't2', 't3', 't4', 't5')]
        if not r.get('tong') and sum(fl): r['tong'] = round(sum(fl) + (r.get('tum') or 0), 2)
        if r.get('tong') and not r.get('tum') and sum(fl) and r['tong'] - sum(fl) > 3: r['tum'] = round(r['tong'] - sum(fl), 2)
    print('nguồn điền:', sorted(src_n.items())); print('lệch DT/tổng giữa file (giữ Mayhomes):', dict(conflicts))
    for dir_, khu in (('vinhomes-ocean-park-2', 'ocean-park-2'), ('vinhomes-ocean-park-3', 'ocean-park-3')):
        L = {l[0] for l in json.load(open(os.path.join(ROOT, 'du-an', dir_, f'lots-{khu}.json'), encoding='utf-8'))['lots']}
        o = {c: [data[c].get(f) for f in F] for c in sorted(L) if c in data}
        json.dump({'cols': F, 'd': o}, open(os.path.join(ROOT, 'du-an', dir_, 'thong-so.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
        miss = {f: sum(1 for v in o.values() if v[i] is None) for i, f in enumerate(F)}
        print(dir_, 'có thông số', len(o), '/', len(L), 'thiếu từng trường:', miss)


if __name__ == '__main__':
    main()
