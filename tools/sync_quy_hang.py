#!/usr/bin/env python3
"""Cập nhật quỹ hàng sa bàn Phố Hiến từ các bảng hàng đại lý.

Dùng:  python3 tools/sync_quy_hang.py OUT.json  TEN=grid.json[:dq] ...
  grid.json: kết quả Sheets API spreadsheets.get(includeGridData) chỉ cột mã căn,
             fields = formattedValue, effectiveFormat.backgroundColor, effectiveFormat.textFormat.strikethrough
  :dq      : danh sách độc quyền — căn không bôi ở đây được coi là còn hàng dù nơi khác bôi đỏ.
Quy tắc:
  * Ô mã căn nền đỏ (R>0.55, G<0.45, B<0.45) hoặc gạch ngang  -> đã bán.
  * Căn lần trước còn trên bảng hàng, lần này không còn ở nguồn nào (mà các nguồn cũ của nó đều đọc được) -> đã bán.
  * Căn đã bán do "mất khỏi bảng hàng" mà xuất hiện lại không bôi -> còn hàng lại.
  * why='báo thủ công' (anh Hiếu báo trực tiếp) -> luôn giữ là đã bán.
"""
import json, re, sys, datetime
CODE = re.compile(r'^(HK|TC[123]|ĐLTC|TP|TV)-\d+$')

def load(p):
    d = json.load(open(p, encoding='utf-8'))
    if isinstance(d, list): d = json.loads(d[0]['text'])
    return d.get('content', d)

def cells(p):
    for sh in load(p)['sheets']:
        for blk in sh.get('data', []):
            for row in blk.get('rowData', []):
                for v in row.get('values', []):
                    t = (v.get('formattedValue') or '').strip().upper().replace('DLTC', 'ĐLTC')
                    if not CODE.match(t): continue
                    f = v.get('effectiveFormat', {}); bg = f.get('backgroundColor', {})
                    r, g, b = bg.get('red', 0), bg.get('green', 0), bg.get('blue', 0)
                    yield t, (r > .55 and g < .45 and b < .45) or f.get('textFormat', {}).get('strikethrough', False)

def main():
    out = sys.argv[1]; now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7)))
    today = now.strftime('%d/%m/%Y')
    try: prev = json.load(open(out, encoding='utf-8'))
    except Exception: prev = {'available': {}, 'sold': {}}
    if isinstance(prev.get('available'), list): prev['available'] = {c: [] for c in prev['available']}
    ok, listed, marked, dq_ok = set(), {}, {}, set()
    for a in sys.argv[2:]:
        name, path = a.split('=', 1); dq = path.endswith(':dq'); path = path[:-3] if dq else path
        try: cs = list(cells(path))
        except Exception as e:
            print('BỎ QUA nguồn', name, e, file=sys.stderr); continue
        ok.add(name)
        for c, m in cs:
            if m: marked.setdefault(c, set()).add(name)
            else:
                listed.setdefault(c, set()).add(name)
                if dq: dq_ok.add(c)
    sold = dict(prev.get('sold', {}))
    avail = {}
    for c, srcs in listed.items():
        if c in marked and c not in dq_ok: continue
        avail[c] = sorted(srcs)
    for c in marked:
        if c in dq_ok: continue
        if c not in sold or sold[c].get('why') != 'bôi đỏ':
            sold[c] = {'since': today, 'why': 'bôi đỏ'}
    for c, srcs in prev.get('available', {}).items():
        if c in avail or c in marked: continue
        if srcs and not set(srcs) <= ok: continue          # nguồn cũ lỗi -> chưa kết luận
        sold.setdefault(c, {'since': today, 'why': 'không còn trên bảng hàng'})
    for c in list(sold):
        if sold[c].get('why') == 'báo thủ công': avail.pop(c, None); continue   # anh Hiếu báo đã bán -> giữ nguyên
        if c in avail: del sold[c]                           # xuất hiện lại, không bôi -> còn hàng
    res = {'updated': now.strftime('%H:%M %d/%m/%Y'), 'available': dict(sorted(avail.items())),
           'sold': dict(sorted(sold.items()))}
    changed = json.dumps({k: res[k] for k in ('available', 'sold')}, sort_keys=True) != \
              json.dumps({k: prev.get(k) for k in ('available', 'sold')}, sort_keys=True)
    json.dump(res, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('THAY ĐỔI' if changed else 'KHÔNG ĐỔI', 'còn', len(avail), 'đã bán', len(sold), 'nguồn', sorted(ok))
main()
