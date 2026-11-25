"""Cập nhật video mới cho mục "Kênh truyền thông" trên trang chủ ngohieu.com.
- YouTube Zenland TV: lấy từ RSS chính thức của kênh.
- TikTok @cohieuvoinha: thử API tikwm, rồi đọc trang hồ sơ TikTok. Lỗi thì giữ danh sách cũ.
Ghi ra assets/kenh.json (bài mới nhất đứng đầu)."""
import json, re, sys, urllib.request, xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / 'assets' / 'kenh.json'
YT_CHANNEL = 'UCw1KeM2qTfXaDLHFoUCa2Ew'   # @zenlandtv
TT_USER = 'cohieuvoinha'
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      'Accept-Language': 'vi-VN,vi;q=0.9'}


def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=25) as r:
        return r.read().decode('utf-8', 'replace')


def youtube():
    ns = {'a': 'http://www.w3.org/2005/Atom', 'yt': 'http://www.youtube.com/xml/schemas/2015'}
    root = ET.fromstring(get(f'https://www.youtube.com/feeds/videos.xml?channel_id={YT_CHANNEL}'))
    items = [{'id': e.find('yt:videoId', ns).text, 't': e.find('a:title', ns).text or '',
              'd': (e.find('a:published', ns).text or '')[:10]} for e in root.findall('a:entry', ns)]
    items.sort(key=lambda x: x['d'], reverse=True)
    return items[:16]


def tiktok():
    ids = []
    try:
        j = json.loads(get(f'https://www.tikwm.com/api/user/posts?unique_id={TT_USER}&count=20'))
        ids = [{'id': str(v['video_id']), 't': (v.get('title') or '')[:160]} for v in j['data']['videos']]
    except Exception as e:
        print('tikwm lỗi:', e)
    if not ids:
        try:
            h = get(f'https://www.tiktok.com/@{TT_USER}')
            found = re.findall(rf'/@{TT_USER}/video/(\d+)', h)
            ids = [{'id': i, 't': ''} for i in dict.fromkeys(found)]
        except Exception as e:
            print('tiktok lỗi:', e)
    ids.sort(key=lambda x: int(x['id']), reverse=True)   # ID TikTok tăng theo thời gian → mới nhất lên đầu
    return ids[:16]


def main():
    old = json.loads(OUT.read_text('utf-8')) if OUT.exists() else {}
    new = dict(old)
    for key, fn in (('youtube', youtube), ('tiktok', tiktok)):
        try:
            got = fn()
            if got:
                # giữ tiêu đề cũ nếu nguồn mới không có
                titles = {x['id']: x.get('t', '') for x in old.get(key, [])}
                for x in got:
                    x['t'] = x.get('t') or titles.get(x['id'], '')
                if key == 'tiktok':
                    # TikTok đôi khi chỉ trả vài video: gộp với danh sách cũ, sắp theo thời gian, không làm mất video
                    seen = {x['id'] for x in got}
                    got = sorted(got + [x for x in old.get(key, []) if x['id'] not in seen],
                                 key=lambda x: int(x['id']), reverse=True)[:16]
                new[key] = got
                print(key, len(got), 'mục')
            else:
                print(key, 'không lấy được, giữ dữ liệu cũ')
        except Exception as e:
            print(key, 'lỗi, giữ dữ liệu cũ:', e)
    if {k: v for k, v in new.items() if k != 'updated'} != {k: v for k, v in old.items() if k != 'updated'}:
        new['updated'] = datetime.now(timezone.utc).isoformat(timespec='minutes')
        OUT.write_text(json.dumps(new, ensure_ascii=False, indent=1), 'utf-8')
        print('Đã ghi', OUT)
    else:
        print('Không có video mới')


if __name__ == '__main__':
    sys.exit(main())
