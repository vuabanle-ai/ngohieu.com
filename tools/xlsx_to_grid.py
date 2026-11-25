# Chuyển xlsx -> định dạng grid như Sheets API (mã căn + nền + gạch ngang), mỗi sheet 1 file; in tóm tắt
import sys,re,json,openpyxl
CODE=re.compile(r'^(HK|TC[123]|ĐLTC|DLTC|TP|TV)-\d+$')
def rgb(c):
    try:
        if c.fill and c.fill.fill_type=='solid':
            v=c.fill.fgColor
            if v.type=='rgb' and v.rgb and len(v.rgb)==8: h=v.rgb[2:];return {'red':int(h[0:2],16)/255,'green':int(h[2:4],16)/255,'blue':int(h[4:6],16)/255}
            if v.type=='theme' or v.type=='indexed': return {'theme':v.theme if v.type=='theme' else v.indexed}
    except Exception: pass
    return {'red':1,'green':1,'blue':1}
wb=openpyxl.load_workbook(sys.argv[1])
for ws in wb.worksheets:
    rows=[]
    for row in ws.iter_rows():
        for c in row:
            v=c.value
            if isinstance(v,str) and CODE.match(v.strip().upper()):
                rows.append({'values':[{'formattedValue':v.strip(),'effectiveFormat':{'backgroundColor':rgb(c),'textFormat':{'strikethrough':bool(c.font and c.font.strike)}},'_txt':(c.font.color.rgb if c.font and c.font.color and c.font.color.type=='rgb' else None)}]})
    if rows:
        out=sys.argv[1].replace('.xlsx','')+'__'+re.sub(r'\W+','_',ws.title)+'.json'
        json.dump({'sheets':[{'data':[{'rowData':rows}]}]},open(out,'w'),ensure_ascii=False)
        print(ws.title,'|',len(rows),'|',ws.sheet_state,'->',out.split('/')[-1])
