import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
{
// ================= DỮ LIỆU =================
// Ảnh mẫu nhà – đổi đường dẫn ở đây khi có ảnh mới
const MAU = {
  goc:     {img:'img/shophouse-goc.jpg',  name:'Shophouse căn góc', text:'Căn góc hai mặt thoáng, tầng trệt kinh doanh, hợp làm cửa hàng, café, showroom.'},
  matduong:{img:'img/pho-thuong-mai.jpg', name:'Liền kề mặt đường lớn', text:'Mặt tiền hướng trục đường chính, tầng trệt kinh doanh, các tầng trên để ở.'},
  congvien:{img:'img/view-cong-vien.jpg', name:'Liền kề view công viên', text:'Nhìn thẳng ra công viên trung tâm: sân pickleball, sân chơi trẻ em, vườn BBQ, đường chạy bộ.'},
  noikhu:  {img:'img/cong-vien-san-the-thao.jpg', name:'Liền kề nội khu', text:'Dãy phố yên tĩnh trong nội khu, vài bước chân tới công viên trung tâm.'},
  toa:     {img:'img/phoi-canh-tren-cao.jpg', name:'Tòa căn hộ Hạnh Phúc', text:'Nhà ở xã hội cao tầng, loại căn Studio, 1PN, 2PN, 3PN.'}
};
const GAL = [
 ['tong-quan','Tổng mặt bằng Happy Home Phố Hiến'],['phoi-canh-tren-cao','Phối cảnh toàn khu'],['cong-vien-san-the-thao','Công viên trung tâm Thịnh Vượng'],
 ['san-pickleball','Sân pickleball & đường chạy bộ'],['san-choi-tre-em','Sân chơi trẻ em'],['vuon-bbq','Vườn BBQ ngoài trời'],
 ['view-cong-vien','View công viên từ ban công'],['pho-thuong-mai','Phố thương mại Thịnh Vượng'],['shophouse-goc','Shophouse căn góc'],
 ['mat-bang-thinh-vuong','Mặt bằng mã căn khu Thịnh Vượng'],['lien-ket-vung','Kết nối nội tỉnh Hưng Yên']];
// [số, tên, x, z] – toạ độ thế giới (mét)
const AMEN = [
 [1,'Công trình văn hóa',260,147],[2,'Bãi đỗ xe ngoài trời',393,167],[3,'Sân chơi trẻ em',113,134],[4,'Vườn BBQ ngoài trời',73,132],
 [5,'Sân pickleball',95,203],[6,'Sân bóng chuyền hơi',72,166],[7,'Sân tập GYM',113,170],[8,'Bãi cỏ sự kiện',148,-38],
 [9,'Tổ hợp thương mại',27,-33],[10,'Trạm y tế',237,-45],[11,'Tòa văn phòng',237,-9],[12,'Bãi đỗ xe có trụ sạc',80,-42],
 [13,'Vị trí đỗ xe PCCC',217,41],[14,'Vườn thư giãn',240,84],[15,'Sân bóng rổ',114,-34],[16,'Trường mầm non',257,-145],[17,'Đường dạo cảnh quan',332,128]];
// 303 mã căn theo mặt bằng: [dãy, nửa, khối, [[mã, m²]]]
const LOTS = [[1,"w",0,[["HK-01",97.0],["HK-03",70.0],["HK-05",70.0],["HK-07",70.0],["HK-09",70.0],["HK-11",70.0],["HK-13",70.0],["HK-15",70.0],["HK-17",70.0],["HK-19",112.1],["HK-21",112.1],["HK-23",70.0],["HK-25",70.0],["HK-27",70.1],["HK-29",70.1],["HK-31",70.1],["HK-33",70.1],["HK-35",70.1],["HK-37",97.0]]],[1,"e",0,[["TC1-02",97.0],["TC1-04",70.0],["TC1-06",70.0],["TC1-08",70.0],["TC1-10",70.0],["TC1-12",70.0],["TC1-14",70.0],["TC1-16",70.0],["TC1-18",70.0],["TC1-20",112.0],["TC1-22",112.0],["TC1-24",70.0],["TC1-26",70.0],["TC1-28",70.0],["TC1-30",70.0],["TC1-32",70.0],["TC1-34",70.0],["TC1-36",70.0],["TC1-38",97.0]]],[1,"w",1,[["HK-39",97.2],["HK-41",70.1],["HK-43",70.1],["HK-45",70.1],["HK-47",70.1],["HK-49",70.1],["HK-51",112.2],["HK-53",112.2],["HK-55",70.1],["HK-57",70.1],["HK-59",70.1],["HK-61",70.1],["HK-63",70.2],["HK-65",70.2],["HK-67",112.3],["HK-69",112.3],["HK-71",70.1],["HK-73",70.0],["HK-75",69.1],["HK-77",67.9],["HK-79",66.2],["HK-81",64.5],["HK-83",62.6],["HK-85",109.2]]],[1,"e",1,[["TC1-40",97.0],["TC1-42",70.0],["TC1-44",70.0],["TC1-46",70.0],["TC1-48",70.0],["TC1-50",70.0],["TC1-52",112.0],["TC1-54",112.0],["TC1-56",70.0],["TC1-58",70.0],["TC1-60",70.0],["TC1-62",70.0],["TC1-64",70.0],["TC1-66",70.0],["TC1-68",112.0],["TC1-70",112.0],["TC1-72",70.0],["TC1-74",70.0],["TC1-76",70.0],["TC1-78",70.0],["TC1-80",70.0],["TC1-82",70.0],["TC1-84",70.0],["TC1-86",70],["TP-64",107.4]]],[2,"w",0,[["TC1-01",97.0],["TC1-03",70.0],["TC1-05",70.0],["TC1-07",70.0],["TC1-09",70.0],["TC1-11",70.0],["TC1-13",70.0],["TC1-15",70.0],["TC1-17",70.0],["TC1-19",70.0],["TC1-21",97.0]]],[2,"e",0,[["TC2-02",97.0],["TC2-04",70.0],["TC2-06",70.0],["TC2-08",70.0],["TC2-10",70.0],["TC2-12",70.0],["TC2-14",70.0],["TC2-16",70.0],["TC2-18",70.0],["TC2-20",70.0],["TC2-22",97.0]]],[2,"w",1,[["TC1-23",97.0],["TC1-25",70.0],["TC1-27",70.0],["TC1-29",70.0],["TC1-31",70.0],["TC1-33",70.0],["TC1-35",112.0],["TC1-37",112.0],["TC1-39",70.0],["TC1-41",70.0],["TC1-43",70.0],["TC1-45",70.0],["TC1-47",70.0],["TC1-49",70.0],["TP-62",134.5]]],[2,"e",1,[["TC2-24",97.0],["TC2-26",70.0],["TC2-28",70.0],["TC2-30",70.0],["TC2-32",70.0],["TC2-34",70.0],["TC2-36",112.0],["TC2-38",112.0],["TC2-40",70.0],["TC2-42",70.0],["TC2-44",70.0],["TC2-46",70.0],["TC2-48",70.0],["TP-60",144.1]]],[3,"w",0,[["TC2-01",97.0],["TC2-03",70.0],["TC2-05",70.0],["TC2-07",70.0],["TC2-09",70.0],["TC2-11",70.0],["TC2-13",70.0],["TC2-15",70.0],["TC2-17",70.0],["TC2-19",70.0],["TC2-21",97.0]]],[3,"e",0,[["TC3-02",97.0],["TC3-04",70.0],["TC3-06",70.0],["TC3-08",70.0],["TC3-10",70.0],["TC3-12",70.0],["TC3-14",70.0],["TC3-16",70.0],["TC3-18",70.0],["TC3-20",70.0],["TC3-22",97.0]]],[3,"w",1,[["TC2-23",97.0],["TC2-25",70.0],["TC2-27",70.0],["TC2-29",70.0],["TC2-31",70.0],["TC2-33",70.0],["TC2-35",112.0],["TC2-37",112.0],["TC2-39",70.0],["TC2-41",70.0],["TC2-43",70.0],["TP-58",126.9]]],[3,"e",1,[["TC3-24",97.0],["TC3-26",70.0],["TC3-28",70.0],["TC3-30",70.0],["TC3-32",70.0],["TC3-34",70.0],["TC3-36",112.0],["TC3-38",112.0],["TC3-40",70.0],["TC3-42",70.0],["TP-56",124.2]]],[4,"w",0,[["TC3-01",97.0],["TC3-03",70.0],["TC3-05",70.0],["TC3-07",70.0],["TC3-09",70.0],["TC3-11",70.0],["TC3-13",70.0],["TC3-15",70.0],["TC3-17",70.0],["TC3-19",112.0],["TC3-21",112.0],["TC3-23",70.0],["TC3-25",70.0],["TC3-27",70.0],["TC3-29",70.0],["TC3-31",70.0],["TC3-33",70.0],["TC3-35",70.0],["TC3-37",97.0]]],[4,"e",0,[["ĐLTC-02",104.5],["ĐLTC-04",75.0],["ĐLTC-06",75.0],["ĐLTC-08",75.0],["ĐLTC-10",75.0],["ĐLTC-12",75.0],["ĐLTC-14",75.0],["ĐLTC-16",75.0],["ĐLTC-18",75.0],["ĐLTC-20",120.0],["ĐLTC-22",120.0],["ĐLTC-24",75.0],["ĐLTC-26",75.0],["ĐLTC-28",75.0],["ĐLTC-30",75.0],["ĐLTC-32",75.0],["ĐLTC-34",75.0],["ĐLTC-36",75.0],["ĐLTC-38",104.5]]],[4,"w",1,[["TC3-39",97.0],["TC3-41",70.0],["TC3-43",70.0],["TC3-45",70.0],["TC3-47",70.0],["TC3-49",70.0],["TC3-51",70.0],["TC3-53",70.0],["TC3-55",112.0],["TC3-57",112.0],["TC3-59",70.0],["TC3-61",70.0],["TC3-63",70.0],["TC3-65",70.0],["TC3-67",70.0],["TC3-69",70.0],["TC3-71",70],["TP-54",115.0]]],[4,"e",1,[["ĐLTC-40",104.5],["ĐLTC-42",75.0],["ĐLTC-44",75.0],["ĐLTC-46",75.0],["ĐLTC-48",75.0],["ĐLTC-50",75.0],["ĐLTC-52",75.0],["ĐLTC-54",75.0],["ĐLTC-56",120.0],["ĐLTC-58",120.0],["ĐLTC-60",75.0],["ĐLTC-62",75.0],["ĐLTC-64",75.0],["ĐLTC-66",75.0],["ĐLTC-68",75.0],["TP-52",193.0]]],[5,"n",0,[["TV-45",172.5],["TV-43",80.0],["TV-41",80.0],["TV-39",80.0],["TV-37",80.0],["TV-35",80.0],["TV-33",80.0],["TV-31",128.0],["TV-29",128.0],["TV-27",80.0],["TV-25",80.0],["TV-23",80.0],["TV-21",80.0],["TV-19",80.0],["TV-17",80.0],["TV-15",80.0],["TV-13",141.9],["TV-11",128.0],["TV-09",80.0],["TV-07",80.0],["TV-05",80.0],["TV-03",80.0],["TV-01",191.6]]],[5,"s",0,[["TP-50",112.9],["TP-48",80.0],["TP-46",80.0],["TP-44",80.0],["TP-42",80.0],["TP-40",80.0],["TP-38",80.0],["TP-36",80.0],["TP-34",80.0],["TP-32",128.0],["TP-30",128.0],["TP-28",80.0],["TP-26",80.0],["TP-24",80.0],["TP-22",80.0],["TP-20",80.0],["TP-18",80.0],["TP-16",80.0],["TP-14",132.7],["TP-12",128.0],["TP-10",80.0],["TP-08",80.0],["TP-06",80.0],["TP-04",80.0],["TP-02",178.8]]]];
// Chi tiết từng căn theo bảng hàng: [hướng, đặc điểm vị trí, đường trước nhà, tổng DTXD, tiện ích lân cận]
const DET = {"HK-01":["Tây Bắc - Đông Bắc","Căn góc đầu hồi (Giao đường Thương Cảng)","Đường Hoàng Kim 17m",232.0,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m) & Tổ hợp thương mại (09)"],"HK-03":["Tây Bắc","Áp góc","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m) & Tổ hợp thương mại (09)"],"HK-05":["Tây Bắc","Căn thường","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m) & Tổ hợp thương mại (09)"],"HK-07":["Tây Bắc","Căn thường","Đường Hoàng Kim 17m",232.7,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-09":["Tây Bắc","Căn thường","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-11":["Tây Bắc","Căn thường","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-13":["Tây Bắc","Căn thường","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-15":["Tây Bắc","Căn thường","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-17":["Tây Bắc","Căn thường","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-19":["Tây Bắc / Xẻ khe","Xẻ khe","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-21":["Tây Bắc / Xẻ khe","Xẻ khe","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-23":["Tây Bắc","Căn thường","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-25":["Tây Bắc","Căn thường","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-27":["Tây Bắc","Căn thường","Đường Hoàng Kim 17m",232.9,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-29":["Tây Bắc","Căn thường","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-31":["Tây Bắc","Căn thường","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-33":["Tây Bắc","Căn thường","Đường Hoàng Kim 17m",232.7,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-35":["Tây Bắc","Áp góc","Đường Hoàng Kim 17m",232.9,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-37":["Tây Bắc - Tây Nam","Căn góc đầu hồi","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"TC1-02":["Đông Nam - Đông Bắc","Căn góc đầu hồi (Giao đường Thương Cảng)","Đường Thương Cảng 1 - 15m",null,"Kế cận Tổ hợp thương mại (09)"],"TC1-04":["Đông Nam","Áp Góc","Đường Thương Cảng 1 - 15m",null,"Kế cận Tổ hợp thương mại (09)"],"TC1-06":["Đông Nam","Căn thường","Đường Thương Cảng 1 - 15m",null,"Kế cận Tổ hợp thương mại (09)"],"TC1-08":["Đông Nam","Căn thường","Đường Thương Cảng 1 - 15m",null,"Kế cận Tổ hợp thương mại (09)"],"TC1-10":["Đông Nam","Căn thường","Đường Thương Cảng 1 - 15m",null,"Kế cận Tổ hợp thương mại (09)"],"TC1-12":["Đông Nam","Căn thường","Đường Thương Cảng 1 - 15m",null,"Kế cận Tổ hợp thương mại (09)"],"TC1-14":["Đông Nam","Căn thường","Đường Thương Cảng 1 - 15m",232.9,"Kế cận Tổ hợp thương mại (09)"],"TC1-16":["Đông Nam","Căn thường","Đường Thương Cảng 1 - 15m",null,"Kế cận Tổ hợp thương mại (09)"],"TC1-18":["Đông Nam","Áp góc","Đường Thương Cảng 1 - 15m",null,"Trực diện Lõi công viên trung tâm (04, 06)"],"TC1-20":["Đông Nam / Xẻ khe","Xẻ khe","Đường Thương Cảng 1 - 15m",null,"Trực diện Lõi công viên trung tâm (04, 06)"],"TC1-22":["Đông Nam / Xẻ khe","Xẻ khe","Đường Thương Cảng 1 - 15m",null,"Trực diện Lõi công viên trung tâm (04, 06)"],"TC1-24":["Đông Nam","Đường nội khu đâm thẳng hông","Đường Thương Cảng 1 - 15m",null,"Kế cận Tổ hợp thương mại (09)"],"TC1-26":["Đông Nam","Đường nội khu đâm thẳng hông","Đường Thương Cảng 1 - 15m",null,"Kế cận Tổ hợp thương mại (09)"],"TC1-28":["Đông Nam","Căn thường","Đường Thương Cảng 1 - 15m",null,"Kế cận Tổ hợp thương mại (09)"],"TC1-30":["Đông Nam","View công viên","Đường Thương Cảng 1 - 15m",null,"Kế cận Tổ hợp thương mại (09)"],"TC1-32":["Đông Nam","View công viên","Đường Thương Cảng 1 - 15m",null,"Kế cận Tổ hợp thương mại (09)"],"TC1-34":["Đông Nam","View công viên","Đường Thương Cảng 1 - 15m",232.7,"Kế cận Tổ hợp thương mại (09)"],"TC1-36":["Đông Nam","View công viên","Đường Thương Cảng 1 - 15m",232.9,"Kế cận Tổ hợp thương mại (09)"],"TC1-38":["Đông Nam - Tây Nam","Căn góc đầu hồi / View trực diện Công Viên & Vườn hoa lõi trung tâm","Đường Thương Cảng 1 - 15m",null,"Gần công viên trung tâm"],"HK-39":["Tây Bắc - Đông Bắc","Căn góc đầu hồi","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-41":["Tây Bắc","Áp góc","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-43":["Tây Bắc","Căn thường","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-45":["Tây Bắc","Căn thường","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-47":["Tây Bắc","Căn thường","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-49":["Tây Bắc","Căn thường","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-51":["Tây Bắc / Xẻ khe","Xẻ khe","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-53":["Tây Bắc / Xẻ khe","Xẻ khe","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-55":["Tây Bắc","Căn thường","Đường Hoàng Kim 17m",241.4,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-57":["Tây Bắc","Căn thường","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-59":["Tây Bắc","Căn thường","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-61":["Tây Bắc","Căn thường","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-63":["Tây Bắc","Căn thường","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-65":["Tây Bắc","Căn thường","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-67":["Tây Bắc / Xẻ khe","Xẻ khe","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-69":["Tây Bắc / Xẻ khe","Xẻ khe","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-71":["Tây Bắc","Căn thường","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-73":["Tây Bắc","Căn thường","Đường Hoàng Kim 17m",239.4,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-75":["Tây Bắc","Căn thường","Đường Hoàng Kim 17m",218.4,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-77":["Tây Bắc","Căn thường","Đường Hoàng Kim 17m",219.8,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-79":["Tây Bắc","Căn thường","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-81":["Tây Bắc","Căn thường","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-83":["Tây Bắc","Áp góc","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"HK-85":["Tây Bắc - Góc 2 mặt tiền","Căn góc đầu hồi (Mặt tiền bo cong)","Đường Hoàng Kim 17m",null,"Tiếp giáp ĐCT Hưng Yên - Thái Bình (80.5m)"],"TC1-40":["Đông Nam - Đông Bắc","Căn góc đầu hồi / View trực diện Công Viên & Vườn hoa lõi trung tâm","Đường Thương Cảng 1 - 15m",null,"Kế cận Tổ hợp thương mại (09)"],"TC1-42":["Đông Nam","View công viên","Đường Thương Cảng 1 - 15m",null,"Kế cận Tổ hợp thương mại (09)"],"TC1-44":["Đông Nam","View công viên","Đường Thương Cảng 1 - 15m",null,"Kế cận Tổ hợp thương mại (09)"],"TC1-46":["Đông Nam","View công viên","Đường Thương Cảng 1 - 15m",null,"Kế cận Tổ hợp thương mại (09)"],"TC1-48":["Đông Nam","View công viên","Đường Thương Cảng 1 - 15m",null,"Kế cận Tổ hợp thương mại (09)"],"TC1-50":["Đông Nam","Căn thường","Đường Thương Cảng 1 - 15m",null,"Kế cận Tổ hợp thương mại (09)"],"TC1-52":["Đông Nam / Xẻ khe","Xẻ khe, Đường nội khu đâm thẳng hông","Đường Thương Cảng 1 - 15m",null,"Kế cận Tổ hợp thương mại (09)"],"TC1-54":["Đông Nam / Xẻ khe","Xẻ khe, Đường nội khu đâm thẳng hông","Đường Thương Cảng 1 - 15m",null,"Kế cận Tổ hợp thương mại (09)"],"TC1-56":["Đông Nam","Căn thường","Đường Thương Cảng 1 - 15m",null,"Kế cận Tổ hợp thương mại (09)"],"TC1-58":["Đông Nam","Căn thường","Đường Thương Cảng 1 - 15m",null,"Kế cận Tổ hợp thương mại (09)"],"TC1-60":["Đông Nam","Căn thường","Đường Thương Cảng 1 - 15m",null,"Kế cận Tổ hợp thương mại (09)"],"TC1-62":["Đông Nam","Căn thường","Đường Thương Cảng 1 - 15m",null,"Kế cận Tổ hợp thương mại (09)"],"TC1-64":["Đông Nam","Căn thường","Đường Thương Cảng 1 - 15m",null,"Kế cận Tổ hợp thương mại (09)"],"TC1-66":["Đông Nam","Căn thường","Đường Thương Cảng 1 - 15m",241.4,"Kế cận Tổ hợp thương mại (09)"],"TC1-68":["Đông Nam / Xẻ khe","Căn góc / Xẻ khe","Đường Thương Cảng 1 - 15m",259.5,"Kế cận Tổ hợp thương mại (09)"],"TC1-70":["Đông Nam / Xẻ khe","Căn góc / Xẻ khe","Đường Thương Cảng 1 - 15m",null,"Kế cận Tổ hợp thương mại (09)"],"TC1-72":["Đông Nam","Căn thường","Đường Thương Cảng 1 - 15m",241.4,"Kế cận Tổ hợp thương mại (09)"],"TC1-74":["Đông Nam","Căn thường","Đường Thương Cảng 1 - 15m",null,"Kế cận Tổ hợp thương mại (09)"],"TC1-76":["Đông Nam","Căn thường","Đường Thương Cảng 1 - 15m",null,"Kế cận Tổ hợp thương mại (09)"],"TC1-78":["Đông Nam","Căn thường","Đường Thương Cảng 1 - 15m",null,"Kế cận Tổ hợp thương mại (09)"],"TC1-80":["Đông Nam","Căn thường","Đường Thương Cảng 1 - 15m",null,"Kế cận Tổ hợp thương mại (09)"],"TC1-82":["Đông Nam","Căn thường","Đường Thương Cảng 1 - 15m",null,"Kế cận Tổ hợp thương mại (09)"],"TC1-84":["Đông Nam","Áp góc","Đường Thương Cảng 1 - 15m",238.0,"Kế cận Tổ hợp thương mại (09)"],"TC1-86":["","","",null,""],"TP-64":["Đông Nam - Tây Nam","Căn góc đại lộ (Mặt bo cong)","Đường Thành Phố 47m",null,"Trục Đại lộ sầm uất 47m kết nối xuyên tâm"],"TC1-01":["Tây Bắc - Đông Bắc","Căn góc đầu hồi (Giao đường Thương Cảng)","Đường Thương Cảng 1 - 15m",null,"Liền kề Tổ hợp thương mại (09)"],"TC1-03":["Tây Bắc","Áp góc","Đường Thương Cảng 1 - 15m",null,"Liền kề Tổ hợp thương mại (09)"],"TC1-05":["Tây Bắc","Căn thường","Đường Thương Cảng 1 - 15m",null,"Liền kề Tổ hợp thương mại (09)"],"TC1-07":["Tây Bắc","Căn thường","Đường Thương Cảng 1 - 15m",null,"Tiếp cận lõi tiện ích trung tâm"],"TC1-09":["Tây Bắc","Căn thường","Đường Thương Cảng 1 - 15m",232.9,"Tiếp cận lõi tiện ích trung tâm"],"TC1-11":["Tây Bắc","Căn thường","Đường Thương Cảng 1 - 15m",null,"Tiếp cận lõi tiện ích trung tâm"],"TC1-13":["Tây Bắc","Căn thường","Đường Thương Cảng 1 - 15m",232.9,"Tiếp cận lõi tiện ích trung tâm"],"TC1-15":["Tây Bắc","Căn thường","Đường Thương Cảng 1 - 15m",null,"Tiếp cận lõi tiện ích trung tâm"],"TC1-17":["Tây Bắc","Căn thường","Đường Thương Cảng 1 - 15m",null,"Tiếp cận lõi tiện ích trung tâm"],"TC1-19":["Tây Bắc","Áp góc","Đường Thương Cảng 1 - 15m",null,"Tiếp cận lõi tiện ích trung tâm"],"TC1-21":["Tây Bắc - Tây Nam","Căn góc đầu hồi / View trực diện Công Viên & Vườn hoa lõi trung tâm","Đường Thương Cảng 1 - 15m",null,"Tiếp cận lõi tiện ích trung tâm"],"TC2-02":["Đông Nam - Đông Bắc","Căn góc đầu hồi (Giao đường Thương Cảng)","Đường Thương Cảng 2 - 15m",null,"Bãi đỗ xe ngoài trời (02) & Sân bóng rổ (15)"],"TC2-04":["Đông Nam","Áp góc","Đường Thương Cảng 2 - 15m",null,"Bãi đỗ xe ngoài trời (02) & Sân bóng rổ (15)"],"TC2-06":["Đông Nam","Căn thường","Đường Thương Cảng 2 - 15m",null,"Bãi đỗ xe ngoài trời (02) & Sân bóng rổ (15)"],"TC2-08":["Đông Nam","Căn thường","Đường Thương Cảng 2 - 15m",null,"Bãi đỗ xe ngoài trời (02) & Sân bóng rổ (15)"],"TC2-10":["Đông Nam","Căn thường","Đường Thương Cảng 2 - 15m",null,"Bãi đỗ xe ngoài trời (02) & Sân bóng rổ (15)"],"TC2-12":["Đông Nam","Căn thường","Đường Thương Cảng 2 - 15m",null,"Bãi đỗ xe ngoài trời (02) & Sân bóng rổ (15)"],"TC2-14":["Đông Nam","Căn thường","Đường Thương Cảng 2 - 15m",null,"Bãi đỗ xe ngoài trời (02) & Sân bóng rổ (15)"],"TC2-16":["Đông Nam","Căn thường","Đường Thương Cảng 2 - 15m",null,"Bãi đỗ xe ngoài trời (02) & Sân bóng rổ (15)"],"TC2-18":["Đông Nam","Căn thường","Đường Thương Cảng 2 - 15m",null,"Bãi đỗ xe ngoài trời (02) & Sân bóng rổ (15)"],"TC2-20":["Đông Nam","Áp góc","Đường Thương Cảng 2 - 15m",null,"Bãi đỗ xe ngoài trời (02) & Sân bóng rổ (15)"],"TC2-22":["Đông Nam - Tây Nam","Căn góc đầu hồi / View trực diện Công Viên & Vườn hoa lõi trung tâm","Đường Thương Cảng 2 - 15m",null,"Trọn bộ tiện ích lõi (04,06,05,07)"],"TC1-23":["Tây Bắc - Đông Bắc","Căn góc đầu hồi / View trực diện Công Viên & Vườn hoa lõi trung tâm","Đường Thương Cảng 1 - 15m",null,"Tiếp cận lõi tiện ích trung tâm"],"TC1-25":["Tây Bắc","Áp góc","Đường Thương Cảng 1 - 15m",null,"Tiếp cận lõi tiện ích trung tâm"],"TC1-27":["Tây Bắc","Căn thường","Đường Thương Cảng 1 - 15m",null,"Tiếp cận lõi tiện ích trung tâm"],"TC1-29":["Tây Bắc","Căn thường","Đường Thương Cảng 1 - 15m",238.0,"Tiếp cận lõi tiện ích trung tâm"],"TC1-31":["Tây Bắc","Căn thường","Đường Thương Cảng 1 - 15m",null,"Tiếp cận lõi tiện ích trung tâm"],"TC1-33":["Tây Bắc","Căn thường","Đường Thương Cảng 1 - 15m",null,"Tiếp cận lõi tiện ích trung tâm"],"TC1-35":["Tây Bắc / Xẻ Khe","Xẻ khe","Đường Thương Cảng 1 - 15m",null,"Tiếp cận lõi tiện ích trung tâm"],"TC1-37":["Tây Bắc / Xẻ Khe","Xẻ khe","Đường Thương Cảng 1 - 15m",null,"Tiếp cận lõi tiện ích trung tâm"],"TC1-39":["Tây Bắc","Căn thường","Đường Thương Cảng 1 - 15m",null,"Tiếp cận lõi tiện ích trung tâm"],"TC1-41":["Tây Bắc","Căn thường","Đường Thương Cảng 1 - 15m",null,"Tiếp cận lõi tiện ích trung tâm"],"TC1-43":["Tây Bắc","Căn thường","Đường Thương Cảng 1 - 15m",null,"Tiếp cận lõi tiện ích trung tâm"],"TC1-45":["Tây Bắc","Căn thường","Đường Thương Cảng 1 - 15m",null,"Tiếp cận lõi tiện ích trung tâm"],"TC1-47":["Tây Bắc","Căn thường","Đường Thương Cảng 1 - 15m",null,"Tiếp cận lõi tiện ích trung tâm"],"TC1-49":["Tây Bắc","Áp góc","Đường Thương Cảng 1 - 15m",null,"Tiếp cận lõi tiện ích trung tâm"],"TP-62":["Tây Bắc - Đông Nam","Căn góc đại lộ (Mặt bo cong)","Đường Thành Phố 47m",null,"Trục Đại lộ sầm uất 47m kết nối xuyên tâm"],"TC2-24":["Đông Nam - Đông Bắc","Căn góc đầu hồi / View trực diện Công Viên & Vườn hoa lõi trung tâm","Đường Thương Cảng 2 - 15m",null,"Trọn bộ tiện ích lõi (04,06,05,07)"],"TC2-26":["Đông Nam","Áp góc","Đường Thương Cảng 2 - 15m",238.0,"Bãi đỗ xe ngoài trời (02) & Sân bóng rổ (15)"],"TC2-28":["Đông Nam","Căn thường","Đường Thương Cảng 2 - 15m",239.8,"Bãi đỗ xe ngoài trời (02) & Sân bóng rổ (15)"],"TC2-30":["Đông Nam","Căn thường","Đường Thương Cảng 2 - 15m",null,"Bãi đỗ xe ngoài trời (02) & Sân bóng rổ (15)"],"TC2-32":["Đông Nam","Căn thường","Đường Thương Cảng 2 - 15m",null,"Bãi đỗ xe ngoài trời (02) & Sân bóng rổ (15)"],"TC2-34":["Đông Nam","Căn thường","Đường Thương Cảng 2 - 15m",null,"Bãi đỗ xe ngoài trời (02) & Sân bóng rổ (15)"],"TC2-36":["Đông Nam / Xẻ khe","Xẻ khe","Đường Thương Cảng 2 - 15m",null,"Bãi đỗ xe ngoài trời (02) & Sân bóng rổ (15)"],"TC2-38":["Đông Nam / Xẻ khe","Xẻ khe","Đường Thương Cảng 2 - 15m",null,"Bãi đỗ xe ngoài trời (02) & Sân bóng rổ (15)"],"TC2-40":["Đông Nam","Căn thường","Đường Thương Cảng 2 - 15m",null,"Bãi đỗ xe ngoài trời (02) & Sân bóng rổ (15)"],"TC2-42":["Đông Nam","Căn thường","Đường Thương Cảng 2 - 15m",null,"Bãi đỗ xe ngoài trời (02) & Sân bóng rổ (15)"],"TC2-44":["Đông Nam","Căn thường","Đường Thương Cảng 2 - 15m",238.0,"Bãi đỗ xe ngoài trời (02) & Sân bóng rổ (15)"],"TC2-46":["Đông Nam","Căn thường","Đường Thương Cảng 2 - 15m",239.8,"Bãi đỗ xe ngoài trời (02) & Sân bóng rổ (15)"],"TC2-48":["Đông Nam","Áp góc","Đường Thương Cảng 2 - 15m",null,"Bãi đỗ xe ngoài trời (02) & Sân bóng rổ (15)"],"TP-60":["Đông Nam - Tây Nam","Căn góc đại lộ (Mặt bo cong)","Đường Thành Phố 47m",null,"Trục Đại lộ sầm uất 47m kết nối xuyên tâm"],"TC2-01":["Tây Bắc - Đông Bắc","Căn góc đầu hồi (Giao đường Thương Cảng)","Đường Thương Cảng 2 - 15m",null,"Kế cận Tổ hợp thương mại & Bãi đỗ xe (02)"],"TC2-03":["Tây Bắc","Áp góc","Đường Thương Cảng 2 - 15m",null,"Kế cận Tổ hợp thương mại & Bãi đỗ xe (02)"],"TC2-05":["Tây Bắc","Căn thường","Đường Thương Cảng 2 - 15m",null,"Kế cận Tổ hợp thương mại & Bãi đỗ xe (02)"],"TC2-07":["Tây Bắc","Căn thường","Đường Thương Cảng 2 - 15m",null,"Kế cận Tổ hợp thương mại & Bãi đỗ xe (02)"],"TC2-09":["Tây Bắc","Căn thường","Đường Thương Cảng 2 - 15m",null,"Kế cận Tổ hợp thương mại & Bãi đỗ xe (02)"],"TC2-11":["Tây Bắc","Căn thường","Đường Thương Cảng 2 - 15m",null,"Kế cận Tổ hợp thương mại & Bãi đỗ xe (02)"],"TC2-13":["Tây Bắc","Căn thường","Đường Thương Cảng 2 - 15m",null,"Kế cận Tổ hợp thương mại & Bãi đỗ xe (02)"],"TC2-15":["Tây Bắc","Căn thường","Đường Thương Cảng 2 - 15m",null,"Kế cận Tổ hợp thương mại & Bãi đỗ xe (02)"],"TC2-17":["Tây Bắc","Căn thường","Đường Thương Cảng 2 - 15m",null,"Kế cận Tổ hợp thương mại & Bãi đỗ xe (02)"],"TC2-19":["Tây Bắc","Áp góc","Đường Thương Cảng 2 - 15m",null,"Kế cận Tổ hợp thương mại & Bãi đỗ xe (02)"],"TC2-21":["Tây Bắc - Tây Nam (View công viên)","Căn góc đầu hồi / View trực diện Công Viên & Vườn hoa lõi trung tâm","Đường Thương Cảng 2 - 15m",null,"View trực diện Lõi công viên (04, 06, 05, 07)"],"TC3-02":["Đông Nam - Đông Bắc","Căn góc đầu hồi (Giao đường Thương Cảng)","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Vườn thư giãn (14)"],"TC3-04":["Đông Nam","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Vườn thư giãn (14)"],"TC3-06":["Đông Nam","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Vườn thư giãn (14)"],"TC3-08":["Đông Nam","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Vườn thư giãn (14)"],"TC3-10":["Đông Nam","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Vườn thư giãn (14)"],"TC3-12":["Đông Nam","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Vườn thư giãn (14)"],"TC3-14":["Đông Nam","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Vườn thư giãn (14)"],"TC3-16":["Đông Nam","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Vườn thư giãn (14)"],"TC3-18":["Đông Nam","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Vườn thư giãn (14)"],"TC3-20":["Đông Nam","Áp góc","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Vườn thư giãn (14)"],"TC3-22":["Đông Nam - Tây Nam","Căn góc đầu hồi / View trực diện Công Viên & Vườn hoa lõi trung tâm","Đường Thương Cảng 3 - 15m",null,"Tiếp giáp Công Viên (07)"],"TC2-23":["Tây Bắc - Tây Nam (View công viên)","Căn góc đầu hồi / View trực diện Công Viên & Vườn hoa lõi trung tâm","Đường Thương Cảng 2 - 15m",null,"View trực diện Lõi công viên (04, 06, 05, 07)"],"TC2-25":["Tây Bắc","Áp góc","Đường Thương Cảng 2 - 15m",null,"Kế cận Tổ hợp thương mại & Bãi đỗ xe (02)"],"TC2-27":["Tây Bắc","Căn thường","Đường Thương Cảng 2 - 15m",null,"Kế cận Tổ hợp thương mại & Bãi đỗ xe (02)"],"TC2-29":["Tây Bắc","Căn thường","Đường Thương Cảng 2 - 15m",null,"Kế cận Tổ hợp thương mại & Bãi đỗ xe (02)"],"TC2-31":["Tây Bắc","Căn thường","Đường Thương Cảng 2 - 15m",null,"Kế cận Tổ hợp thương mại & Bãi đỗ xe (02)"],"TC2-33":["Tây Bắc","Căn thường","Đường Thương Cảng 2 - 15m",null,"Kế cận Tổ hợp thương mại & Bãi đỗ xe (02)"],"TC2-35":["Tây Bắc / Xẻ khe","Xẻ khe","Đường Thương Cảng 2 - 15m",null,"Kế cận Tổ hợp thương mại & Bãi đỗ xe (02)"],"TC2-37":["Tây Bắc / Xẻ khe","Xẻ khe","Đường Thương Cảng 2 - 15m",null,"Kế cận Tổ hợp thương mại & Bãi đỗ xe (02)"],"TC2-39":["Tây Bắc","Căn thường","Đường Thương Cảng 2 - 15m",null,"Kế cận Tổ hợp thương mại & Bãi đỗ xe (02)"],"TC2-41":["Tây Bắc","Căn thường","Đường Thương Cảng 2 - 15m",null,"Kế cận Tổ hợp thương mại & Bãi đỗ xe (02)"],"TC2-43":["Tây Bắc","Áp góc","Đường Thương Cảng 2 - 15m",null,"Kế cận Tổ hợp thương mại & Bãi đỗ xe (02)"],"TP-58":["Tây Bắc - Đông Nam","Căn góc đại lộ (Mặt bo cong)","Đường Thành Phố 47m",null,"Trục Đại lộ sầm uất 47m kết nối xuyên tâm"],"TC3-24":["Đông Nam - Đông Bắc","Căn góc đầu hồi / View trực diện Công Viên & Vườn hoa lõi trung tâm","Đường Thương Cảng 3 - 15m",null,"Tiếp giáp Công Viên (07)"],"TC3-26":["Đông Nam","Áp góc","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Vườn thư giãn (14)"],"TC3-28":["Đông Nam","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Vườn thư giãn (14)"],"TC3-30":["Đông Nam","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Vườn thư giãn (14)"],"TC3-32":["Đông Nam","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Vườn thư giãn (14)"],"TC3-34":["Đông Nam","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Vườn thư giãn (14)"],"TC3-36":["Đông Nam / Xẻ khe","Xẻ khe","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Vườn thư giãn (14)"],"TC3-38":["Đông Nam / Xẻ khe","Xẻ khe","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Vườn thư giãn (14)"],"TC3-40":["Đông Nam","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Vườn thư giãn (14)"],"TC3-42":["Đông Nam","Áp góc","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Vườn thư giãn (14)"],"TP-56":["Đông Nam - Tây Nam","Căn góc đại lộ (Mặt bo cong)","Đường Thành Phố 47m",null,"Trục Đại lộ sầm uất 47m kết nối xuyên tâm"],"TC3-01":["Tây Nam - Tây Bắc","Căn góc đầu hồi (Giao đường Thương Cảng)","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-03":["Tây Bắc","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-05":["Tây Bắc","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-07":["Tây Bắc","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-09":["Tây Bắc","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-11":["Tây Bắc","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-13":["Tây Bắc","Căn thường","Đường Thương Cảng 3 - 15m",232.9,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-15":["Tây Bắc","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-17":["Tây Bắc","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-19":["Tây Bắc","Xẻ khe","Đường Thương Cảng 3 - 15m",null,"Gần Lõi công viên trung tâm"],"TC3-21":["Tây Bắc","Xẻ khe","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-23":["Tây Bắc","Đường nội khu đâm trực diện hông","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-25":["Tây Bắc","Đường nội khu đâm trực diện hông","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-27":["Tây Bắc","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-29":["Tây Bắc","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-31":["Tây Bắc","Căn thường","Đường Thương Cảng 3 - 15m",232.7,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-33":["Tây Bắc","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-35":["Tây Bắc","Áp góc","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-37":["Tây Bắc - Tây Nam","Căn góc đầu hồi / View trực diện Công Viên & Vườn hoa lõi trung tâm","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"ĐLTC-02":["Đông Nam - Đông Bắc","Căn góc đại lộ (Giao đường Thương Cảng 15m)","Đại lộ Thương Cảng 34m",null,"Kề Sân chơi trẻ em (03) & Bãi cỏ sự kiện (08)"],"ĐLTC-04":["Đông Nam","Áp góc mặt Đại lộ","Đại lộ Thương Cảng 34m",null,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"ĐLTC-06":["Đông Nam","Căn thường mặt Đại lộ","Đại lộ Thương Cảng 34m",null,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"ĐLTC-08":["Đông Nam","Căn thường mặt Đại lộ","Đại lộ Thương Cảng 34m",null,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"ĐLTC-10":["Đông Nam","Căn thường mặt Đại lộ","Đại lộ Thương Cảng 34m",null,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"ĐLTC-12":["Đông Nam","Căn thường mặt Đại lộ","Đại lộ Thương Cảng 34m",null,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"ĐLTC-14":["Đông Nam","Căn thường mặt Đại lộ","Đại lộ Thương Cảng 34m",null,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"ĐLTC-16":["Đông Nam","Căn thường mặt Đại lộ","Đại lộ Thương Cảng 34m",null,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"ĐLTC-18":["Đông Nam","Căn thường mặt Đại lộ","Đại lộ Thương Cảng 34m",null,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"ĐLTC-20":["Đông Nam / Xẻ khe","Xẻ khe mặt Đại lộ","Đại lộ Thương Cảng 34m",null,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"ĐLTC-22":["Đông Nam / Xẻ khe","Xẻ khe mặt Đại lộ","Đại lộ Thương Cảng 34m",null,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"ĐLTC-24":["Đông Nam","Căn thường mặt Đại lộ","Đại lộ Thương Cảng 34m",null,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"ĐLTC-26":["Đông Nam","Căn thường mặt Đại lộ","Đại lộ Thương Cảng 34m",null,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"ĐLTC-28":["Đông Nam","Căn thường mặt Đại lộ","Đại lộ Thương Cảng 34m",null,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"ĐLTC-30":["Đông Nam","Căn thường mặt Đại lộ","Đại lộ Thương Cảng 34m",null,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"ĐLTC-32":["Đông Nam","Căn thường mặt Đại lộ, đường đâm hông nhà","Đại lộ Thương Cảng 34m",null,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"ĐLTC-34":["Đông Nam","Căn thường mặt Đại lộ, đường đâm chính diện","Đại lộ Thương Cảng 34m",null,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"ĐLTC-36":["Đông Nam","Áp góc mặt Đại lộ, đường đâm hông nhà","Đại lộ Thương Cảng 34m",null,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"ĐLTC-38":["Đông Nam - Tây Nam","Căn góc đại lộ","Đại lộ Thương Cảng 34m",null,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"TC3-39":["Tây Bắc - Đông Bắc","Căn góc đầu hồi / View trực diện Công Viên & Vườn hoa lõi trung tâm","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-41":["Tây Bắc","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-43":["Tây Bắc","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-45":["Tây Bắc","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-47":["Tây Bắc","Căn thường","Đường Thương Cảng 3 - 15m",239.8,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-49":["Tây Bắc","Căn thường","Đường Thương Cảng 3 - 15m",238.0,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-51":["Tây Bắc","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-53":["Tây Bắc","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-55":["Tây Bắc / Xẻ khe","Xẻ khe","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-57":["Tây Bắc / Xẻ khe","Xẻ khe","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-59":["Tây Bắc","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-61":["Tây Bắc","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-63":["Tây Bắc","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-65":["Tây Bắc","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-67":["Tây Bắc","Căn thường","Đường Thương Cảng 3 - 15m",238.0,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-69":["Tây Bắc","Căn thường","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TC3-71":["Tây Bắc","Áp góc","Đường Thương Cảng 3 - 15m",null,"Sân bóng rổ (15) & Bãi cỏ sự kiện (08)"],"TP-54":["Tây Bắc - Đông Nam","Căn góc đại lộ (Mặt bo cong)","Đường Thành Phố 47m",null,"Trục Đại lộ sầm uất 47m kết nối xuyên tâm"],"ĐLTC-40":["Đông Nam - Đông Bắc","Căn góc đại lộ","Đại lộ Thương Cảng 34m",null,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"ĐLTC-42":["Đông Nam","Áp góc mặt Đại lộ","Đại lộ Thương Cảng 34m",null,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"ĐLTC-44":["Đông Nam","Căn thường mặt Đại lộ","Đại lộ Thương Cảng 34m",null,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"ĐLTC-46":["Đông Nam","Căn thường mặt Đại lộ","Đại lộ Thương Cảng 34m",null,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"ĐLTC-48":["Đông Nam","Căn thường mặt Đại lộ","Đại lộ Thương Cảng 34m",null,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"ĐLTC-50":["Đông Nam","Căn thường mặt Đại lộ","Đại lộ Thương Cảng 34m",null,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"ĐLTC-52":["Đông Nam","Căn thường mặt Đại lộ","Đại lộ Thương Cảng 34m",null,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"ĐLTC-54":["Đông Nam","Căn thường mặt Đại lộ","Đại lộ Thương Cảng 34m",null,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"ĐLTC-56":["Đông Nam / Xẻ khe","Xẻ khe mặt Đại lộ","Đại lộ Thương Cảng 34m",281.3,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"ĐLTC-58":["Đông Nam / Xẻ khe","Xẻ khe mặt Đại lộ, đường đâm","Đại lộ Thương Cảng 34m",281.3,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"ĐLTC-60":["Đông Nam","Căn thường mặt Đại lộ, đường đâm","Đại lộ Thương Cảng 34m",null,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"ĐLTC-62":["Đông Nam","Căn thường mặt Đại lộ","Đại lộ Thương Cảng 34m",null,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"ĐLTC-64":["Đông Nam","Căn thường mặt Đại lộ","Đại lộ Thương Cảng 34m",null,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"ĐLTC-66":["Đông Nam","Căn thường mặt Đại lộ","Đại lộ Thương Cảng 34m",null,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"ĐLTC-68":["Đông Nam","Áp góc","Đại lộ Thương Cảng 34m",null,"Trục Đại lộ thương mại 34m, Vườn thư giãn (14)"],"TP-52":["Đông Nam - Tây Nam","Căn góc đại lộ","Đường Thành Phố 47m",null,"Trục Đại lộ sầm uất 47m kết nối xuyên tâm"],"TV-45":["Tây Bắc - Góc 2 mặt tiền","Căn góc VIP đại lộ (Giao ĐL Thương Cảng 34m)","Đường Thịnh Vượng 15m",null,"View trực diện Công trình văn hóa (01) & Công viên (03, 07)"],"TV-43":["Tây Bắc","Áp góc","Đường Thịnh Vượng 15m",null,"View trực diện Công trình văn hóa (01) & Công viên (03, 07)"],"TV-41":["Tây Bắc","Căn thường","Đường Thịnh Vượng 15m",null,"View trực diện Công trình văn hóa (01) & Công viên (03, 07)"],"TV-39":["Tây Bắc","Căn thường","Đường Thịnh Vượng 15m",null,"View trực diện Công trình văn hóa (01) & Công viên (03, 07)"],"TV-37":["Tây Bắc","Căn thường","Đường Thịnh Vượng 15m",null,"View trực diện Công trình văn hóa (01) & Công viên (03, 07)"],"TV-35":["Tây Bắc","Căn thường","Đường Thịnh Vượng 15m",null,"View trực diện Công trình văn hóa (01) & Công viên (03, 07)"],"TV-33":["Tây Bắc","Căn thường","Đường Thịnh Vượng 15m",null,"View trực diện Công trình văn hóa (01) & Công viên (03, 07)"],"TV-31":["Tây Bắc","Căn xẻ khe","Đường Thịnh Vượng 15m",null,"View trực diện Công trình văn hóa (01) & Công viên (03, 07)"],"TV-29":["Tây Bắc","Căn xẻ khe","Đường Thịnh Vượng 15m",null,"View trực diện Công trình văn hóa (01) & Công viên (03, 07)"],"TV-27":["Tây Bắc","Căn thường","Đường Thịnh Vượng 15m",null,"View trực diện Công trình văn hóa (01) & Công viên (03, 07)"],"TV-25":["Tây Bắc","Căn thường","Đường Thịnh Vượng 15m",null,"View trực diện Công trình văn hóa (01) & Công viên (03, 07)"],"TV-23":["Tây Bắc","Căn thường","Đường Thịnh Vượng 15m",null,"View trực diện Công trình văn hóa (01) & Công viên (03, 07)"],"TV-21":["Tây Bắc","Căn thường","Đường Thịnh Vượng 15m",null,"View trực diện Công trình văn hóa (01) & Công viên (03, 07)"],"TV-19":["Tây Bắc","Căn thường","Đường Thịnh Vượng 15m",null,"View trực diện Công trình văn hóa (01) & Công viên (03, 07)"],"TV-17":["Tây Bắc","Căn thường","Đường Thịnh Vượng 15m",null,"View trực diện Công trình văn hóa (01) & Công viên (03, 07)"],"TV-15":["Tây Bắc","Căn thường","Đường Thịnh Vượng 15m",null,"View trực diện Công trình văn hóa (01) & Công viên (03, 07)"],"TV-13":["Tây Bắc","Căn xẻ khe","Đường Thịnh Vượng 15m",null,"View trực diện Công trình văn hóa (01) & Công viên (03, 07)"],"TV-11":["Tây Bắc","Căn xẻ khe","Đường Thịnh Vượng 15m",null,"View trực diện Công trình văn hóa (01) & Công viên (03, 07)"],"TV-09":["Tây Bắc","Căn thường","Đường Thịnh Vượng 15m",null,"View trực diện Công trình văn hóa (01) & Công viên (03, 07)"],"TV-07":["Tây Bắc","Căn thường","Đường Thịnh Vượng 15m",null,"View trực diện Công trình văn hóa (01) & Công viên (03, 07)"],"TV-05":["Tây Bắc","Căn thường","Đường Thịnh Vượng 15m",null,"View trực diện Công trình văn hóa (01) & Công viên (03, 07)"],"TV-03":["Tây Bắc","Áp góc","Đường Thịnh Vượng 15m",null,"View trực diện Công trình văn hóa (01) & Công viên (03, 07)"],"TV-01":["Tây Bắc - Đông Bắc","Căn góc siêu VIP (Đầu hồi Đông ngã 3 TV - TP, view công trình công cộng)","Đường Thịnh Vượng 15m",null,"Bãi đỗ xe (02) & Công trình văn hóa (01)"],"TP-50":["Đông Nam - Tây Bắc","Căn góc đại lộ (Giao ĐL Thương Cảng 34m)","Đường Thành Phố 47m",null,"Trục Đại lộ sầm uất 47m kết nối xuyên tâm"],"TP-48":["Đông Nam","Áp góc mặt Đại lộ TP","Đường Thành Phố 47m",null,"Trục Đại lộ sầm uất 47m kết nối xuyên tâm"],"TP-46":["Đông Nam","Căn thường mặt Đại lộ TP","Đường Thành Phố 47m",null,"Trục Đại lộ sầm uất 47m kết nối xuyên tâm"],"TP-44":["Đông Nam","Căn thường mặt Đại lộ TP","Đường Thành Phố 47m",null,"Trục Đại lộ sầm uất 47m kết nối xuyên tâm"],"TP-42":["Đông Nam","Căn thường mặt Đại lộ TP","Đường Thành Phố 47m",null,"Trục Đại lộ sầm uất 47m kết nối xuyên tâm"],"TP-40":["Đông Nam","Căn thường mặt Đại lộ TP","Đường Thành Phố 47m",null,"Trục Đại lộ sầm uất 47m kết nối xuyên tâm"],"TP-38":["Đông Nam","Căn thường mặt Đại lộ TP","Đường Thành Phố 47m",null,"Trục Đại lộ sầm uất 47m kết nối xuyên tâm"],"TP-36":["Đông Nam","Căn thường mặt Đại lộ TP","Đường Thành Phố 47m",null,"Trục Đại lộ sầm uất 47m kết nối xuyên tâm"],"TP-34":["Đông Nam","Căn thường mặt Đại lộ TP","Đường Thành Phố 47m",null,"Trục Đại lộ sầm uất 47m kết nối xuyên tâm"],"TP-32":["Đông Nam","Căn xẻ khe mặt đại lộ","Đường Thành Phố 47m",null,"Trục Đại lộ sầm uất 47m kết nối xuyên tâm"],"TP-30":["Đông Nam","Căn xẻ khe mặt đại lộ","Đường Thành Phố 47m",null,"Trục Đại lộ sầm uất 47m kết nối xuyên tâm"],"TP-28":["Đông Nam","Căn thường mặt Đại lộ TP","Đường Thành Phố 47m",null,"Trục Đại lộ sầm uất 47m kết nối xuyên tâm"],"TP-26":["Đông Nam","Căn thường mặt Đại lộ TP","Đường Thành Phố 47m",null,"Trục Đại lộ sầm uất 47m kết nối xuyên tâm"],"TP-24":["Đông Nam","Căn thường mặt Đại lộ TP","Đường Thành Phố 47m",null,"Trục Đại lộ sầm uất 47m kết nối xuyên tâm"],"TP-22":["Đông Nam","Căn thường mặt Đại lộ TP","Đường Thành Phố 47m",null,"Trục Đại lộ sầm uất 47m kết nối xuyên tâm"],"TP-20":["Đông Nam","Căn thường mặt Đại lộ TP","Đường Thành Phố 47m",null,"Trục Đại lộ sầm uất 47m kết nối xuyên tâm"],"TP-18":["Đông Nam","Căn thường mặt Đại lộ TP","Đường Thành Phố 47m",null,"Trục Đại lộ sầm uất 47m kết nối xuyên tâm"],"TP-16":["Đông Nam","Căn thường mặt Đại lộ TP","Đường Thành Phố 47m",null,"Trục Đại lộ sầm uất 47m kết nối xuyên tâm"],"TP-14":["Đông Nam","Căn xẻ khe mặt đại lộ","Đường Thành Phố 47m",null,"Trục Đại lộ sầm uất 47m kết nối xuyên tâm"],"TP-12":["Đông Nam","Căn xẻ khe mặt đại lộ","Đường Thành Phố 47m",null,"Trục Đại lộ sầm uất 47m kết nối xuyên tâm"],"TP-10":["Đông Nam","Căn thường mặt Đại lộ TP","Đường Thành Phố 47m",null,"Trục Đại lộ sầm uất 47m kết nối xuyên tâm"],"TP-08":["Đông Nam","Căn thường mặt Đại lộ TP","Đường Thành Phố 47m",null,"Trục Đại lộ sầm uất 47m kết nối xuyên tâm"],"TP-06":["Đông Nam","Căn thường mặt Đại lộ TP","Đường Thành Phố 47m",null,"Trục Đại lộ sầm uất 47m kết nối xuyên tâm"],"TP-04":["Đông Nam","Áp góc mặt Đại lộ TP","Đường Thành Phố 47m",null,"Trục Đại lộ sầm uất 47m kết nối xuyên tâm"],"TP-02":["Đông Nam - Đông Bắc","Căn góc siêu VIP mặt đại lộ 47m (Đầu hồi Đông)","Đường Thành Phố 47m",null,"Gần Bãi đỗ xe (02)"]};
// Căn đang mở bán – cập nhật theo quỹ hàng ngày 24/11/2026 (sửa danh sách này khi quỹ thay đổi)
// Thông số & giá căn đang bán – theo quỹ hàng ngày 22–24/11/2026 (sửa bảng này khi quỹ/giá thay đổi)
// tdc: giá tiến độ chuẩn · tts: thanh toán sớm · v18..v36: vay 18–36 tháng (triệu đồng)
// d: ngày bảng hàng · tc: TCBG · dt: DT đất · x: DTXD · pre: giá trước VAT · vat · kp: KPBT · tot: tổng giá sau VAT & KPBT (allin: giá all in)
const PRICE = {"HK-07":{"d":"22/11/2026","tc":"Thô","dt":70.0,"x":232.7,"pre":7009155094,"vat":519474711,"kp":35045775,"tot":7563675580},"TC1-34":{"d":"22/11/2026","tc":"Thô","dt":70.0,"x":232.7,"pre":7834193196,"vat":601978522,"kp":39170966,"tot":8475342684},"HK-75":{"d":"22/11/2026","tc":"Thô","dt":69.3,"x":218.4,"pre":6791601567,"vat":499533767,"kp":33958008,"tot":7325093342},"TC1-84":{"d":"22/11/2026","tc":"Thô","dt":70.0,"x":238.0,"pre":6850093363,"vat":503568538,"kp":34250467,"tot":7387912368},"ĐLTC-58":{"d":"22/11/2026","tc":"Thô","dt":120.0,"x":281.3,"pre":10261134457,"vat":715072078,"kp":51305672,"tot":11027512207},"ĐLTC-56":{"d":"22/11/2026","tc":"Thô","dt":120.0,"x":281.3,"pre":10473287105,"vat":736287343,"kp":52366436,"tot":11261940884},"HK-55":{"d":"22/11/2026","tc":"Thô","dt":70.1,"x":241.4,"pre":7052372583,"vat":523537259,"kp":35261863,"tot":7611171705},"TC1-68":{"d":"22/11/2026","tc":"Thô","dt":112.0,"x":259.5,"pre":8955899957,"vat":605284719,"kp":44779500,"tot":9605964176},"HK-77":{"d":"22/11/2026","tc":"Thô","dt":67.9,"x":219.8,"pre":6706155876,"vat":494618014,"kp":33530779,"tot":7234304669,"tdc":7197,"tts":6644,"v18":7456,"v24":7788,"v30":8193,"v36":8636,"dtd":"24/11/2026"},"TC1-72":{"d":"22/11/2026","tc":"Thô","dt":70.0,"x":241.4,"pre":6797867371,"vat":498345939,"kp":33989337,"tot":7330202647},"TC2-44":{"d":"22/11/2026","tc":"Thô","dt":70.0,"x":238.0,"pre":6685085692,"vat":487067771,"kp":33425428,"tot":7205578891},"TC2-46":{"d":"22/11/2026","tc":"Thô","dt":70.0,"x":239.8,"pre":6783618974,"vat":496921099,"kp":33918095,"tot":7314458168},"TC3-67":{"d":"22/11/2026","tc":"Thô","dt":70.0,"x":238.0,"pre":6561329981,"vat":474692200,"kp":32806650,"tot":7068828831},"TC3-49":{"d":"22/11/2026","tc":"Thô","dt":70.0,"x":238.0,"pre":7510123878,"vat":569571590,"kp":37550619,"tot":8117246087},"TC3-13":{"d":"22/11/2026","tc":"Thô","dt":70.0,"x":232.9,"pre":6433409380,"vat":461900140,"kp":32167047,"tot":6927476567},"HK-73":{"d":"23/11/2026","tc":"Thô","dt":70.0,"x":239.4,"pre":7027568297,"vat":521316032,"kp":35137841,"tot":7584022170},"TC3-31":{"d":"23/11/2026","tc":"Thô","dt":70.0,"x":232.7,"pre":7545429815,"vat":573102184,"kp":37727149,"tot":8156259148},"TC2-26":{"d":"23/11/2026","tc":"Thô","dt":70.0,"x":238.0,"pre":6932597115,"vat":511818914,"kp":34662986,"tot":7479079015},"TC1-13":{"d":"24/11/2026","tc":"Thô","dt":70.0,"x":232.9,"allin":6927476567,"tot":6927476567,"tdc":6892,"tts":6361,"v18":7140,"v24":7458,"v30":7847,"v36":8272,"dtd":"24/11/2026"},"TC1-29":{"d":"24/11/2026","tc":"Thô","dt":70.0,"x":238.0,"allin":7023245509,"tot":7023245509,"tdc":6987,"tts":6449,"v18":7238,"v24":7561,"v30":7956,"v36":8386,"dtd":"24/11/2026"},"TC1-66":{"d":"24/11/2026","tc":"Thô","dt":70.0,"x":241.4,"allin":7375785970,"tot":7375785970,"tdc":7338,"tts":6774,"v18":7601,"v24":7940,"v30":8354,"v36":8805,"dtd":"24/11/2026"},"TC2-28":{"d":"24/11/2026","tc":"Thô","dt":70.0,"x":239.8,"allin":7360041491,"tot":7360041491,"tdc":7323,"tts":6759,"v18":7585,"v24":7923,"v30":8336,"v36":8786,"dtd":"24/11/2026"},"HK-27":{"d":"24/11/2026","tc":"Thô","dt":70.1,"x":232.9,"allin":7527529161,"tot":7527529161,"tdc":7489,"tts":6914,"v18":7758,"v24":8103,"v30":8525,"v36":8986,"dtd":"24/11/2026"},"TC1-09":{"d":"24/11/2026","tc":"Thô","dt":70.0,"x":232.9,"allin":7018643305,"tot":7018643305,"tdc":6983,"tts":6445,"v18":7234,"v24":7556,"v30":7950,"v36":8380,"dtd":"24/11/2026"},"TC1-14":{"d":"24/11/2026","tc":"Thô","dt":70.0,"x":232.9,"allin":7246560104,"tot":7246560104,"tdc":7210,"tts":6655,"v18":7468,"v24":7801,"v30":8208,"v36":8651,"dtd":"24/11/2026"},"TC3-47":{"d":"24/11/2026","tc":"Thô","dt":70.0,"x":239.8,"allin":8180541949,"tot":8180541949,"tdc":8139,"tts":7515,"v18":8430,"v24":8805,"v30":9263,"v36":9762,"dtd":"24/11/2026"},"HK-33":{"d":"24/11/2026","tc":"Thô","dt":70.1,"x":232.7,"allin":7616858077,"tot":7616858077,"tdc":7578,"tts":6996,"v18":7850,"v24":8199,"v30":8626,"v36":9092,"dtd":"24/11/2026"},"HK-35":{"d":"24/11/2026","tc":"Thô","dt":70.1,"x":232.9,"allin":7664474578,"tot":7664474578,"tdc":7625,"tts":7040,"v18":7899,"v24":8250,"v30":8680,"v36":9149,"dtd":"24/11/2026"}};
const OPEN_DATE='22–24/11/2026';
const OPEN = new Set(Object.keys(PRICE));
const ROADNAME={HK:'Đường Hoàng Kim',TC1:'Đường Thương Cảng 1 - 15m',TC2:'Đường Thương Cảng 2 - 15m',TC3:'Đường Thương Cảng 3 - 15m','ĐLTC':'Đại lộ Thương Cảng 34m',TV:'Đường Thịnh Vượng 15m',TP:'Đường Thành Phố 47m'};

// Toạ độ: 1 px tổng mặt bằng ≈ 1 m. x: Đông, z: Nam
const P=(cx,cy)=>new THREE.Vector3(cx-155,0,cy-1195);
const W=(x,z)=>new THREE.Vector3(x,0,z);
const diagZ=x=>415-0.4255*(x+5);
const TH=Math.atan(0.4255);

try{await Promise.race([document.fonts.load('800 64px "Be Vietnam Pro"'),new Promise(r=>setTimeout(r,2500))])}catch(_){}
// ================= KHỞI TẠO =================
const cv=document.getElementById('c');
let R;try{R=new THREE.WebGLRenderer({canvas:cv,antialias:true})}catch(err){
 const ld=document.getElementById('load');ld.innerHTML='<div style="max-width:640px;padding:20px;text-align:center"><p style="margin:0 0 12px">Thiết bị này chưa hỗ trợ xem 3D. Mời anh/chị xem mặt bằng dự án:</p><img src="img/mat-bang-thinh-vuong.jpg" alt="Mặt bằng khu Thịnh Vượng" style="width:100%;border-radius:12px"><p style="margin:14px 0 0"><a href="https://zalo.me/0914669669" style="color:#ee6a1f;font-weight:800">Nhắn Zalo Ngô Hiếu để nhận bảng hàng</a></p></div>';ld.style.overflow='auto';throw err}
R.setPixelRatio(Math.min(devicePixelRatio,2));R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
R.outputColorSpace=THREE.SRGBColorSpace;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.05;
const S=new THREE.Scene();S.background=new THREE.Color('#d6e6ec');S.fog=new THREE.Fog('#d6e6ec',1700,3800);
const cam=new THREE.PerspectiveCamera(38,1,3,30000);
const ctl=new OrbitControls(cam,cv);ctl.enableDamping=true;ctl.dampingFactor=.08;ctl.maxPolarAngle=1.38;ctl.minDistance=18;ctl.maxDistance=9500;ctl.autoRotate=true;ctl.autoRotateSpeed=.35;
ctl.touches={ONE:THREE.TOUCH.ROTATE,TWO:THREE.TOUCH.DOLLY_ROTATE};ctl.zoomToCursor=false;
S.add(new THREE.HemisphereLight('#f4f8ff','#6f8a4a',1.2));
const sun=new THREE.DirectionalLight('#fff1da',2.4);sun.position.set(-600,900,500);sun.castShadow=true;
sun.shadow.mapSize.set(4096,4096);Object.assign(sun.shadow.camera,{left:-900,right:900,top:900,bottom:-900,near:10,far:3000});sun.shadow.bias=-.0004;
sun.target.position.set(150,0,-350);S.add(sun,sun.target);
let seed=11;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
const M=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.9,...o});
const dm=new THREE.Object3D();
const box=(w,h,d,mat,x,y,z,ry=0,cast=true)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.rotation.y=ry;m.castShadow=cast;m.receiveShadow=true;S.add(m);return m};
const flat=(pts,col,y)=>{const sh=new THREE.Shape(pts.map(p=>new THREE.Vector2(p.x,-p.z)));const m=new THREE.Mesh(new THREE.ShapeGeometry(sh),M(col));m.rotation.x=-Math.PI/2;m.position.y=y;m.receiveShadow=true;S.add(m);return m};
const rect=(x0,z0,x1,z1,col,y)=>flat([W(x0,z0),W(x1,z0),W(x1,z1),W(x0,z1)],col,y);
const poly=a=>a.map(([x,y])=>P(x,y));
function strip(pts,w,y){const v=[],idx=[];const n=pts.length;
 for(let i=0;i<n;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];const dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz);const nx=-dz/l*w/2,nz=dx/l*w/2;
  v.push(pts[i].x+nx,y,pts[i].z+nz,pts[i].x-nx,y,pts[i].z-nz);if(i<n-1)idx.push(i*2,i*2+1,i*2+2,i*2+1,i*2+3,i*2+2)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(idx);g.computeVertexNormals();return g}
const ribbon=(pts,w,y,col)=>{const m=new THREE.Mesh(strip(pts,w,y),M(col,{side:THREE.DoubleSide}));m.receiveShadow=true;S.add(m);return m};
const ell=(cx,cz,rx,rz,n=48)=>{const a=[];for(let i=0;i<=n;i++){const t=i/n*Math.PI*2;a.push(W(cx+rx*Math.cos(t),cz+rz*Math.sin(t)))}return a};
// Toạ độ dọc một polyline
function along(pts,step,off){const out=[];for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];const dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz);const nx=-dz/l,nz=dx/l;
 for(let t=0;t<l;t+=step)out.push(W(a.x+dx*t/l+nx*off,a.z+dz*t/l+nz*off))}return out}

// ================= MẶT ĐẤT: thảm cỏ như sa bàn =================
{const cn=document.createElement('canvas');cn.width=cn.height=1024;const g=cn.getContext('2d');
 // ruộng lúa chia ô: xanh non, xanh đậm, vàng chín, đất cày; bờ ruộng sáng
 g.fillStyle='#c9c09a';g.fillRect(0,0,1024,1024);
 const PC=['#7fae4a','#6c9c3c','#8fbc55','#a7b85a','#c2b768','#93a94c','#5f8f37','#b0a77a'];
 for(let by=0;by<1024;by+=128)for(let bx=0;bx<1024;bx+=256){const vert=rnd()<.5;
  for(let k=0;k<(vert?8:4);k++){g.fillStyle=PC[Math.floor(rnd()*PC.length)];
   if(vert)g.fillRect(bx+k*32+1.5,by+1.5,29,125);else g.fillRect(bx+1.5,by+k*32+1.5,253,29)}}
 for(let i=0;i<4000;i++){g.fillStyle='rgba(40,70,20,.08)';g.fillRect(rnd()*1024,rnd()*1024,2,2)}
 g.fillStyle='rgba(235,228,200,.9)';for(let k=0;k<=1024;k+=128)g.fillRect(0,k-2,1024,4);for(let k=0;k<=1024;k+=256)g.fillRect(k-2,0,4,1024);
 const t=new THREE.CanvasTexture(cn);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(65,65);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;
 const gr=new THREE.Mesh(new THREE.PlaneGeometry(26000,26000),M('#fff',{map:t}));gr.rotation.x=-Math.PI/2;gr.position.set(150,-.5,-350);gr.receiveShadow=true;S.add(gr);}

const HP=poly([[108,432],[175,392],[360,282],[470,240],[545,575],[525,770],[360,852],[360,1172],[148,1172],[148,862],[108,840]]);
flat(HP,'#d8d4c9',.15);
// thảm xanh nội khu Hạnh Phúc
flat(poly([[118,445],[176,405],[200,470],[230,680],[130,690],[118,600]]),'#7fb24c',.25);
flat(poly([[300,300],[455,250],[525,560],[505,740],[420,770],[345,700],[330,520]]),'#7fb24c',.25);
flat(poly([[150,860],[350,860],[350,1170],[150,1170]]),'#7fb24c',.25);
flat(poly([[140,690],[290,690],[302,832],[140,832]]),'#86bb52',.3);           // công viên lớn Hạnh Phúc
ribbon(ell(220,-420,52,44).map(p=>p),3,.45,'#e9e1cf');
ribbon(poly([[150,760],[200,740],[250,770],[290,740]]),3,.45,'#e9e1cf');
// nền Thịnh Vượng
flat([W(-8,-6),W(212,-6),W(212,diagZ(212)),W(-8,diagZ(-8))],'#d9d4c8',.15);
flat([W(212,90),W(400,40),W(400,diagZ(400)+2),W(212,diagZ(212)+2)],'#7fb24c',.15);
flat(poly([[490,200],[650,180],[660,330],[500,345]]),'#d9d4c8',.2);

// dải cây xanh & vỉa hè đầu các dãy Thịnh Vượng
// vỉa hè bo góc bao quanh từng dãy Thịnh Vượng (theo mặt bằng)
function roundPoly(pts,r){const out=[];const n=pts.length;for(let i=0;i<n;i++){const p=pts[i],a=pts[(i+n-1)%n],b=pts[(i+1)%n];
 const da=Math.hypot(a.x-p.x,a.z-p.z),db=Math.hypot(b.x-p.x,b.z-p.z),rr=Math.min(r,da/2,db/2);
 const p1=W(p.x+(a.x-p.x)*rr/da,p.z+(a.z-p.z)*rr/da),p2=W(p.x+(b.x-p.x)*rr/db,p.z+(b.z-p.z)*rr/db);
 for(let q=0;q<=8;q++){const t=q/8,u=1-t;out.push(W(u*u*p1.x+2*u*t*p.x+t*t*p2.x,u*u*p1.z+2*u*t*p.z+t*t*p2.z))}}return out}
[[5,35,1,170],[5,35,185,'d'],[50,82.5,1,105],[50,82.5,240,'d'],[97.5,130,1,105],[97.5,130,240,'d'],[145,180,1,170],[145,180,185,'d']].forEach(([x0,x1,z0,z1])=>{
 const a=x0-4,b=x1+4,za=z0-5;const pts=z1==='d'?[W(a,za),W(b,za),W(b,diagZ(b)-4),W(a,diagZ(a)-4)]:[W(a,za),W(b,za),W(b,z1+4),W(a,z1+4)];
 flat(roundPoly(pts,11),'#d9d4c8',.33);});
// ================= ĐƯỜNG =================
const roadM=M('#3d4248',{roughness:.95,side:THREE.DoubleSide}),lineM=new THREE.MeshBasicMaterial({color:'#f3f1ea',side:THREE.DoubleSide});
function road(pts,w){const m=new THREE.Mesh(strip(pts,w,.6),roadM);m.receiveShadow=true;S.add(m)}
const DCT=poly([[92,2100],[88,1100],[75,600],[52,350],[10,0],[-40,-300]]);
const DL=poly([[175,290],[200,370],[300,820],[352,880],[352,1560]]);
const TP_ROAD=[-300,1100].map(x=>W(x,diagZ(x)+12));
const ROADS=[
 {p:DCT,w:70,name:'ĐCT Hưng Yên – Thái Bình 80,5m',at:P(78,980),l:8},
 {p:poly([[-150,450],[40,345],[250,225],[560,90],[900,-40]]),w:30,name:'QL38B',at:P(150,286),l:4},
 {p:DL,w:28,name:'Đại lộ Thương Cảng 34m',at:P(352,1000),l:4},
 {p:poly([[112,842],[362,842]]),w:22,name:'Đường Hạnh Phúc 22m',at:P(205,842),l:4},
 {p:[W(-35,-12),W(210,-12)],w:12,name:'Đường Thương Cảng',at:W(95,-12),tv:1},
 {p:[W(-8,-12),W(-8,diagZ(-8)+4)],w:13,name:'Đường Hoàng Kim 17m',at:W(-8,250),tv:1},
 {p:[W(42.5,-8),W(42.5,diagZ(42)+4)],w:13,name:'Thương Cảng 1 · 15m',at:W(42.5,140),tv:1},
 {p:[W(90,-8),W(90,116)],w:13,name:'Thương Cảng 2 · 15m',at:W(90,62),tv:1},{p:[W(90,228),W(90,diagZ(90)+4)],w:13,name:'Thương Cảng 2 · 15m',at:W(90,300),tv:1},
 {p:[W(137.5,-8),W(137.5,diagZ(137)+4)],w:13,name:'Thương Cảng 3 · 15m',at:W(137.5,140),tv:1},
 {p:[W(-8,177.5),W(49,177.5)],w:11,name:'Đường nội khu',at:W(20,177.5),tv:1},{p:[W(131,177.5),W(212,177.5)],w:11,name:'',tv:1},{p:[W(42,112),W(138,112)],w:12,name:'Đường nội khu',at:W(66,112),tv:1},{p:[W(42,232),W(138,232)],w:12,name:'Đường nội khu',at:W(66,232),tv:1},
 {p:TP_ROAD,w:30,name:'Đường Thành Phố 47m',at:W(300,diagZ(300)+10),l:4},
 {p:[208,400].map(x=>W(x,diagZ(x)-52)),w:12,name:'Đường Thịnh Vượng 15m',at:W(300,diagZ(300)-52),tv:1},
 {p:poly([[860,600],[800,950],[700,1350],[650,1700],[640,2100]]),w:20,name:'',l:2}];
ROADS.forEach(r=>road(r.p,r.w));
{const pts=[];ROADS.forEach(r=>{if(!r.l)return;for(let k=1;k<r.l;k++){const off=-r.w/2+r.w*k/r.l;if(r.l>=4&&k===r.l/2)continue;along(r.p,10,off).forEach((p,i)=>{if(!(i%2))pts.push([p,r.p])})}});
 const im=new THREE.InstancedMesh(new THREE.PlaneGeometry(.45,4.5),lineM,pts.length);
 pts.forEach(([p,pl],i)=>{let best=0,d=1e9,ang=0;for(let j=0;j<pl.length-1;j++){const a=pl[j],b=pl[j+1];const dd=Math.hypot((a.x+b.x)/2-p.x,(a.z+b.z)/2-p.z);if(dd<d){d=dd;ang=Math.atan2(b.x-a.x,b.z-a.z)}}
  dm.position.set(p.x,.7,p.z);dm.rotation.set(-Math.PI/2,0,ang);dm.scale.set(1,1,1);dm.updateMatrix();im.setMatrixAt(i,dm.matrix)});S.add(im);}
// vạch tim đường & vạch qua đường nội khu Thịnh Vượng
{const bars=[];const zebra=(x,z,dir,w)=>{for(let k=-w/2+1;k<w/2;k+=1.6)bars.push(dir?[x+k,z,0]:[x,z+k,Math.PI/2])};
 [42.5,90,137.5].forEach(x=>{[-4,104,120,165,190,224,240].forEach(z=>{if(z<diagZ(x)&&!(x===90&&z>110&&z<234))zebra(x,z,1,11)})});
 [42.5,90,137.5].forEach(x=>{for(let z=10;z<diagZ(x)-6;z+=7)if(Math.abs(z-177.5)>8&&!(z>106&&z<118)&&!(z>226&&z<238)&&!(x===90&&z>106&&z<238))bars.push([x,z,0,1])});
 [-8].forEach(x=>{[0,177.5].forEach(z=>zebra(x,z+8,1,12))});
 const im=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),lineM,bars.length);
 bars.forEach(([x,z,r,c],i)=>{dm.position.set(x,.72,z);dm.rotation.set(-Math.PI/2,0,r);c?dm.scale.set(.3,3.2,1):dm.scale.set(.7,3.2,1);dm.updateMatrix();im.setMatrixAt(i,dm.matrix)});S.add(im);}
// dải phân cách xanh
ribbon(DCT,7,.8,'#5f9a3a');ribbon(DL.slice(0,3),3,.8,'#5f9a3a');ribbon(TP_ROAD,4,.8,'#5f9a3a');
// vỉa hè
[[DCT,74],[TP_ROAD,30]].forEach(([p,w])=>{ribbon(p,w,.45,'#cfc8b9')});

// ================= KẾT CẤU MẶT ĐỨNG =================
function facade(floors,bays,base,trim,win,ground){const cn=document.createElement('canvas');cn.width=256;cn.height=256;const g=cn.getContext('2d');
 g.fillStyle=base;g.fillRect(0,0,256,256);const fh=256/floors,bw=256/bays;
 for(let f=0;f<floors;f++){g.fillStyle=trim;g.fillRect(0,f*fh,256,fh*.1);
  for(let b=0;b<bays;b++){g.fillStyle=(ground&&f===floors-1)?'#f6d9a0':win;g.fillRect(b*bw+bw*.14,f*fh+fh*.24,bw*.72,fh*(ground&&f===floors-1?.7:.56));
   if(!(ground&&f===floors-1)){g.fillStyle=trim;g.fillRect(b*bw+bw*.1,f*fh+fh*.8,bw*.8,fh*.06)}}}
 const t=new THREE.CanvasTexture(cn);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t}
const pick=[];const INFO=new Map();

// ================= TÒA CĂN HỘ HẠNH PHÚC =================
const towerTex=facade(16,8,'#f4f1ea','#ffffff','#7f95a7',false);towerTex.wrapS=towerTex.wrapT=THREE.RepeatWrapping;
const towerWall=M('#ffffff',{map:towerTex,roughness:.8}),towerRoof=M('#cfcabf');
const KHU={L:'The Link',N:'The Nest',H:'The Haven',R:'The Rise'};
const TOW=[['H1',213,885,'h',0],['H2',213,940,'h',0],['H3',213,995,'h',0],['H5',213,1050,'h',0],['H6',213,1105,'h',0],['H8',318,918,'v',0],['H9',318,1058,'v',0],
 ['L1',132,500,'v',5],['L5',178,480,'v',28],['L3',224,606,'v',28],['L2',152,655,'v',5],
 ['N1',305,355,'h',23],['N2',335,410,'h',23],['N3',360,465,'h',23],['N11',240,450,'v',26],['N10',285,580,'v',23],['N5',385,550,'h',25],['N6',447,610,'v',30],['N7',380,665,'v',23],['N8',455,735,'h',25],
 ['R1',430,295,'h',22],['R2',448,355,'h',22],['R3',465,410,'h',22],['R5',500,505,'h',22],['R6',510,560,'h',22]];
const towers=[];
TOW.forEach(([n,cx,cy,o,a])=>{const L=74,Wd=24,H=48+(n.charCodeAt(1)%3)*3;const w=o==='h'?L:Wd,d=o==='h'?Wd:L;
 const g=new THREE.BoxGeometry(w,H,d);const uv=g.attributes.uv;
 for(let f=0;f<6;f++){const fw=[d,d,w,w,w,w][f];for(let k=0;k<4;k++){const i=f*4+k;uv.setXY(i,uv.getX(i)*fw/24,uv.getY(i)*H/48)}}
 const m=new THREE.Mesh(g,[towerWall,towerWall,towerRoof,towerRoof,towerWall,towerWall]);
 const p=P(cx,cy);m.position.set(p.x,H/2,p.z);m.rotation.y=a*Math.PI/180;m.castShadow=m.receiveShadow=true;S.add(m);
 const k=KHU[n[0]];INFO.set(m,{title:'Tòa '+n,tag:'Hạnh Phúc · Khu '+k,text:MAU.toa.text,img:MAU.toa.img});
 pick.push(m);towers.push({m,n,H,a:a*Math.PI/180,w,d})});

// ================= 303 CĂN LIỀN KỀ THỊNH VƯỢNG =================
const COLX={1:[5,35],2:[50,82.5],3:[97.5,130],4:[145,180]};
const BLOCKZ={1:[[1,170],[185,'d']],2:[[1,105],[240,'d']],3:[[1,105],[240,'d']],4:[[1,170],[185,'d']]};
const lots=[];
LOTS.forEach(([col,half,blk,items])=>{
 const sumA=items.reduce((s,it)=>s+(it[1]||80),0);
 if(col<5){const [x0,x1]=COLX[col],mid=(x0+x1)/2,a=half==='w'?x0:mid,b=half==='w'?mid:x1;
  const [z0,z1r]=BLOCKZ[col][blk];const z1=z1r==='d'?diagZ((a+b)/2)-8:z1r;const L=z1-z0;let z=z0;
  items.forEach(([code,area],i)=>{const lw=L*(area||80)/sumA;const pre=code.split('-')[0];
   let type='noikhu';
   if(i===0||i===items.length-1)type='goc';
   else if((col===2||col===3)&&((blk===0&&i>=items.length-3)||(blk===1&&i<=2)))type='congvien';
   else if(pre==='HK'||pre==='ĐLTC'||pre==='TP')type='matduong';
   lots.push({code,area,x:(a+b)/2,z:z+lw/2,w:b-a-1.2,l:lw-.5,rot:0,type,face:ROADNAME[pre],col,fx:half==='w'?-1:1,end:i===0?-1:i===items.length-1?1:0,dEnd:z1r==='d'&&i===items.length-1});z+=lw})}
 else{const len=(375-222)/Math.cos(TH);let s=0;const [o1,o2]=half==='s'?[-14,-28]:[-29,-43];
  const sumS=items.reduce((t,it)=>t+(it[1]||80),0);items.forEach(([code,area],i)=>{const lw=len*(area||80)/sumS;const t=s+lw/2;const x=222+t*Math.cos(TH);const off=(o1+o2)/2;
   lots.push({code,area,x:x,z:diagZ(x)+off,w:lw-.5,l:Math.abs(o1-o2)-1,rot:TH,ew:1,type:(i===0||i===items.length-1)?'goc':(half==='s'?'matduong':'noikhu'),face:ROADNAME[code.split('-')[0]],col:5,fx:half==='n'?1:-1,end:i===0?-1:i===items.length-1?1:0});s+=lw})}});
// Phân loại căn theo bảng hàng
const CAT={goc:['Căn góc','#ef7f3c'],apgoc:['Áp góc','#f5c36b'],xekhe:['Xẻ khe','#5fbfb8'],daiLo:['Mặt đại lộ / trục lớn','#c58ad9'],congvien:['View công viên','#86c95a'],thuong:['Căn thường','#f3ede2']};
lots.forEach(L=>{const d=DET[L.code]||['','','',null,''];L.d=d;const v=d[1]||'';const pre=L.code.split('-')[0];
 L.cat=/áp góc/i.test(v)?'apgoc':/góc/i.test(v)?'goc':/xẻ khe/i.test(v)?'xekhe':(/đại lộ/i.test(v)||pre==='HK'||pre==='ĐLTC'||pre==='TP')?'daiLo':/công viên|view/i.test(v)?'congvien':(L.type==='goc'?'goc':'thuong');
 L.type={goc:'goc',apgoc:'matduong',xekhe:'noikhu',daiLo:'matduong',congvien:'congvien',thuong:'noikhu'}[L.cat];
 if(d[2])L.face=d[2];L.open=OPEN.has(L.code)});
const NL=lots.length;
// ---- Mặt đứng kiến trúc theo phối cảnh: tường be xám, trụ & gờ trắng, cửa kính khung đồng, ban công hoa, tầng trệt shophouse
function shopFacade(bays){const Wc=256*bays,Hc=640,cn=document.createElement('canvas');cn.width=Wc;cn.height=Hc;const g=cn.getContext('2d');
 const gH=Hc*4.5/15.5,fH=Hc*3.6/15.5,top=Hc-gH-3*fH;
 for(let b=0;b<bays;b++){const X=b*256;
  g.fillStyle='#b9a691';g.fillRect(X,0,256,Hc);
  g.fillStyle='#f3eee6';g.fillRect(X,0,256,top+6);g.fillRect(X,0,22,Hc);g.fillRect(X+234,0,22,Hc);   // phào mái + trụ trắng
  for(let k=0;k<3;k++){const y=top+k*fH;g.fillStyle='#f3eee6';g.fillRect(X,y+fH-10,256,12);           // gờ sàn
   for(const wx of [40,140]){const ww=76,wy=y+14,wh=fH-34;g.fillStyle='#6b5646';g.fillRect(X+wx-3,wy-3,ww+6,wh+6);
    const gr=g.createLinearGradient(0,wy,0,wy+wh);gr.addColorStop(0,'#9fb6c6');gr.addColorStop(.55,'#3c4a55');gr.addColorStop(1,'#2b333a');g.fillStyle=gr;g.fillRect(X+wx,wy,ww,wh);
    g.fillStyle='#6b5646';g.fillRect(X+wx+ww/2-2,wy,4,wh)}
   g.fillStyle='#1f2326';for(let r=0;r<2;r++)g.fillRect(X+26,y+fH-62+r*22,204,4);for(let px=30;px<230;px+=14)g.fillRect(X+px,y+fH-62,3,50); // lan can
   for(let f=0;f<16;f++){g.fillStyle=['#d9467a','#f07aa5','#4f8f36','#e85a5a'][f%4];g.beginPath();g.arc(X+34+f*12.5,y+fH-66-Math.random()*6,7,0,7);g.fill()}}
  const gy=Hc-gH;g.fillStyle='#2b2b2d';g.fillRect(X,gy,256,gH*.2);g.fillStyle='#c9a46a';g.fillRect(X+70,gy+gH*.06,116,gH*.08);   // dải biển hiệu
  const sg=g.createLinearGradient(0,gy+gH*.2,0,Hc);sg.addColorStop(0,'#f6dcae');sg.addColorStop(1,'#d9a96a');g.fillStyle=sg;g.fillRect(X+22,gy+gH*.2,212,gH*.8);
  g.fillStyle='#3a3330';for(const mx of [22,92,164,230])g.fillRect(X+mx,gy+gH*.2,5,gH*.8);g.fillRect(X+22,gy+gH*.55,212,4)}
 const t=new THREE.CanvasTexture(cn);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t}
const lotWall=M('#ffffff',{map:shopFacade(1),roughness:.8});
const lotSideFac=M('#ffffff',{map:shopFacade(3),roughness:.8});
const lotRoof=M('#ebe5da');
const body=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),[lotWall,lotWall,lotRoof,lotRoof,lotSideFac,lotSideFac],NL);
body.castShadow=body.receiveShadow=true;
const BASE=new THREE.Color('#ffffff'),GOC=new THREE.Color('#fff0dc'),HOV=new THREE.Color('#ffb27f'),SEL=new THREE.Color('#ee6a1f');
let MODE='mac-dinh';const CC={};Object.entries(CAT).forEach(([k,[,c]])=>CC[k]=new THREE.Color(c));
const OPENC=new THREE.Color('#25b768'),SOLD=new THREE.Color('#d6d1c8');
const lotCol=i=>{const L=lots[i];if(!L)return BASE;if(MODE==='loai')return CC[L.cat];if(MODE==='mo-ban')return L.open?OPENC:SOLD;return L.cat==='goc'?GOC:BASE};
lots.forEach((L,i)=>{const h=15.5;L.h=h;
 // mặt tiền luôn là trục x của hộp: dãy dọc mặt tiền quay Đông/Tây, dãy chéo quay về đường
 if(L.ew){dm.scale.set(L.l,h,L.w);dm.rotation.set(0,L.rot+Math.PI/2,0)}else{dm.scale.set(L.w,h,L.l);dm.rotation.set(0,0,0)}
 dm.position.set(L.x,h/2+.3,L.z);dm.updateMatrix();body.setMatrixAt(i,dm.matrix);body.setColorAt(i,lotCol(i))});
S.add(body);pick.push(body);
// ---- căn góc vát ở các ngã giao (thay khối hộp bằng khối vát góc phía mặt đường)
const cornerMesh={};const CW_BASE=new THREE.Color('#eadcc6');
{const roofM=M('#ebe5da');
 lots.forEach((L,i)=>{if(L.ew||!L.end)return;const w=L.w,l=L.l,h=L.h,f=L.fx,e=L.end,c=Math.min(6.5,w*.45,l*.6);
  // đa giác chân nhà (x ngang lô, y = -z dọc dãy), vát góc tại (f*w/2, e*l/2)
  const zs=x=>L.dEnd?diagZ(L.x+x)-8-L.z:l/2;
  const P=[[-w/2,-l/2],[w/2,-l/2],[w/2,zs(w/2)],[-w/2,zs(-w/2)]];
  const k=e<0?(f>0?1:0):(f>0?2:3);
  const p=P[k],pa=P[(k+3)%4],pb=P[(k+1)%4];const da=Math.hypot(pa[0]-p[0],pa[1]-p[1]),db=Math.hypot(pb[0]-p[0],pb[1]-p[1]);
  const p1=[p[0]+(pa[0]-p[0])*c/da,p[1]+(pa[1]-p[1])*c/da],p2=[p[0]+(pb[0]-p[0])*c/db,p[1]+(pb[1]-p[1])*c/db];
  const arc=[];for(let q=0;q<=10;q++){const t=q/10,u=1-t;arc.push([u*u*p1[0]+2*u*t*p[0]+t*t*p2[0],u*u*p1[1]+2*u*t*p[1]+t*t*p2[1]])}
  const poly=[...P.slice(0,k),...arc,...P.slice(k+1)];
  const sh=new THREE.Shape(poly.map(([x,z])=>new THREE.Vector2(x,-z)));
  const g=new THREE.ExtrudeGeometry(sh,{depth:h,bevelEnabled:false});g.rotateX(-Math.PI/2);
  const mat=M('#eadcc6',{roughness:.85});const m=new THREE.Mesh(g,[roofM,mat]);m.position.set(L.x,.3,L.z);m.castShadow=m.receiveShadow=true;m.userData.lot=i;S.add(m);pick.push(m);cornerMesh[i]=mat;
  // dải kính tầng trệt & cửa sổ các tầng chạy quanh mặt vát
  const gl=new THREE.MeshStandardMaterial({color:'#6f808c',roughness:.3,metalness:.2});
  for(let fl=0;fl<4;fl++){const y=fl===0?1.2:4.5+(fl-1)*3.6+1.4,hh=fl===0?2.6:1.2;
   const s2=new THREE.Shape(poly.map(([x,z])=>new THREE.Vector2(x*1.006,-z*1.006)));const gg=new THREE.ExtrudeGeometry(s2,{depth:hh,bevelEnabled:false});gg.rotateX(-Math.PI/2);
   const gm=new THREE.Mesh(gg,[new THREE.MeshBasicMaterial({visible:false}),fl===0?M('#f2d7a8',{roughness:.4}):gl]);gm.position.set(L.x,.3+y,L.z);S.add(gm)}
  dm.position.set(0,-50,0);dm.scale.set(.001,.001,.001);dm.rotation.set(0,0,0);dm.updateMatrix();body.setMatrixAt(i,dm.matrix)});
 body.instanceMatrix.needsUpdate=true;}
// ---- chi tiết khối: ban công, lan can, mái che tầng trệt, tum thang
{const slabs=[],rails=[],cans=[],tums=[];const base=new THREE.Matrix4(),loc=new THREE.Matrix4(),q=new THREE.Quaternion(),one=new THREE.Vector3(1,1,1);
 const put=(arr,x,y,z,sx,sy,sz)=>{loc.compose(new THREE.Vector3(x,y,z),new THREE.Quaternion(),new THREE.Vector3(sx,sy,sz));arr.push(base.clone().multiply(loc))};
 lots.forEach(L=>{if(L.end&&!L.ew)return;const ry=L.ew?L.rot+Math.PI/2:0;q.setFromAxisAngle(new THREE.Vector3(0,1,0),ry);base.compose(new THREE.Vector3(L.x,.3,L.z),q,one);
  const dh=(L.ew?L.l:L.w)/2,fr=L.ew?L.w:L.l,f=L.fx;
  for(let k=0;k<3;k++){const y=4.5+k*3.6;put(slabs,f*(dh+.45),y,0,.9,.18,fr*.86);put(rails,f*(dh+.88),y+.55,0,.06,1.1,fr*.86);
   if(L.cat==='goc'&&L.end){put(slabs,0,y,L.end*(fr/2+.45),dh*1.6,.18,.9);put(rails,0,y+.55,L.end*(fr/2+.88),dh*1.6,1.1,.06)}}
  put(cans,f*(dh+.8),4.25,0,1.6,.22,fr*.96);if(L.cat==='goc'&&L.end)put(cans,0,4.25,L.end*(fr/2+.8),dh*1.9,.22,1.6);
  });
 [[slabs,M('#efe9df')],[rails,M('#1f2326',{transparent:true,opacity:.85})],[cans,M('#3a3836')]].forEach(([arr,mat])=>{
  const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,arr.length);arr.forEach((m,i)=>im.setMatrixAt(i,m));im.castShadow=true;im.receiveShadow=true;S.add(im)});}
const byCode=new Map(lots.map((L,i)=>[L.code.replace('Đ','D'),i]));

// ---- mã căn in trên mái + ô giá đỏ (giá gồm VAT & KPBT, làm tròn 2 số lẻ) cạnh mã căn
{const CW=448,CH=112,COLS=9,rows=Math.ceil(NL/COLS);const cn=document.createElement('canvas');cn.width=CW*COLS;cn.height=CH*rows;const g=cn.getContext('2d');
 g.textBaseline='middle';const F=(w,px)=>`${w} ${px}px "Be Vietnam Pro",Arial,sans-serif`;
 const fit=(t,w,px,max)=>{g.font=F(800,px);while(g.measureText(t).width>max&&px>24){px-=2;g.font=F(800,px)}return px};
 lots.forEach((L,i)=>{const pp=PRICE[L.code];const x0=(i%COLS)*CW,y0=Math.floor(i/COLS)*CH,cy=y0+CH/2;
  {fit(L.code,800,70,CW-40);g.textAlign='center';g.lineWidth=10;g.strokeStyle='rgba(255,255,255,.95)';g.strokeText(L.code,x0+CW/2,cy);g.fillStyle='#7b1f1f';g.fillText(L.code,x0+CW/2,cy)}});
 const tex=new THREE.CanvasTexture(cn);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;
 const pos=[],uv=[],idx=[];const v=new THREE.Vector3(),q=new THREE.Quaternion(),mtx=new THREE.Matrix4();
 lots.forEach((L,i)=>{const ry=L.ew?L.rot+Math.PI/2:0;q.setFromAxisAngle(new THREE.Vector3(0,1,0),ry);mtx.compose(new THREE.Vector3(L.x,L.h+.36,L.z),q,new THREE.Vector3(1,1,1));
  const dh=(L.ew?L.l:L.w)/2,fr=L.ew?L.w:L.l;const b=Math.min(fr*.46,dh*.97*CH/CW),a=b*CW/CH;
  const u0=(i%COLS)/COLS,u1=u0+1/COLS,v1=1-Math.floor(i/COLS)/rows,v0=v1-1/rows;const k=pos.length/3;
  [[-a,-b,u0,v1],[a,-b,u1,v1],[a,b,u1,v0],[-a,b,u0,v0]].forEach(([x,z,uu,vv])=>{v.set(x,0,z).applyMatrix4(mtx);pos.push(v.x,v.y,v.z);uv.push(uu,vv)});
  idx.push(k,k+2,k+1,k,k+3,k+2)});
 const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));gg.setIndex(idx);
 const mm=new THREE.Mesh(gg,new THREE.MeshBasicMaterial({map:tex,transparent:true,alphaTest:.2,side:THREE.DoubleSide,depthWrite:false}));mm.renderOrder=2;S.add(mm);}

// ---- biển giá nổi trên căn có giá: nền trắng, viền đỏ dày, số giá to (gồm VAT & KPBT, làm tròn 2 số lẻ)
const badges=[];
{const stickM=new THREE.MeshBasicMaterial({color:'#d7261e'});
 lots.forEach((L,i)=>{const pp=PRICE[L.code];if(!pp)return;
  const cn=document.createElement('canvas');cn.width=512;cn.height=200;const g=cn.getContext('2d');
  const isT=!!pp.tdc;const t=((isT?pp.tdc*1e6:pp.tot)/1e9).toFixed(2).replace('.',',')+' tỷ';
  g.fillStyle='#ffffff';g.strokeStyle=isT?'#d7261e':'#8a8580';g.lineWidth=22;g.beginPath();g.roundRect(14,14,484,172,86);g.fill();g.stroke();
  let px=118;g.font=`800 ${px}px "Be Vietnam Pro",Arial,sans-serif`;while(g.measureText(t).width>420&&px>60){px-=4;g.font=`800 ${px}px "Be Vietnam Pro",Arial,sans-serif`}
  g.fillStyle=isT?'#c8102e':'#55504b';g.textAlign='center';g.textBaseline='middle';g.fillText(t,256,104);
  const tex=new THREE.CanvasTexture(cn);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,depthWrite:false}));sp.scale.set(15,5.9,1);sp.position.set(L.x,L.h+10.5,L.z);sp.renderOrder=5;sp.userData.lot=i;S.add(sp);
  const st=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,7.4,6),pp.tdc?stickM:new THREE.MeshBasicMaterial({color:'#8a8580'}));st.position.set(L.x,L.h+4,L.z);S.add(st);
  badges.push(sp);pick.push(sp)});}

// ================= TIỆN ÍCH =================
const white=M('#f4f4f1'),glass=M('#a9bfcc',{roughness:.25,metalness:.25}),greenRoof=M('#6fa53f'),thatch=M('#a8824e'),wood=M('#7a5a3a');
// công trình công cộng
[[540,250,70,140,22],[615,265,50,110,34],[440,880,75,32,15],[465,905,26,60,15],[432,962,60,42,16],[410,1050,46,82,18],[392,1150,26,20,10],[392,1186,26,26,20]].forEach(([cx,cy,w,d,h])=>{const p=P(cx,cy);box(w,h,d,h>25?glass:white,p.x,h/2,p.z)});
box(46,14,22,glass,27,7,-33);box(48,1,24,greenRoof,27,14.5,-33);                 // 09 tổ hợp thương mại
box(72,13,46,glass,260,6.5,147);box(74,1.2,48,greenRoof,260,13.6,147);box(30,2,16,white,260,15,147); // 01 văn hóa mái xanh
// bãi đỗ xe & ô tô
const cars=[];const carCol=['#ffffff','#c0392b','#2c3e50','#d4ac0d','#7f8c8d','#1f618d'];
function lot(x0,z0,x1,z1,n){rect(x0,z0,x1,z1,'#55595e',.5);for(let i=0;i<n;i++){const r=Math.floor(i/ Math.ceil(n/2)),c=i%Math.ceil(n/2);if(rnd()<.25)continue;cars.push([x0+3+c*((x1-x0-6)/Math.ceil(n/2)),r?z1-4:z0+4,Math.PI/2])}}
lot(360,150,428,186,22);lot(64,-50,98,-34,10);
for(let i=0;i<5;i++)box(.6,2,.6,M('#2e86c1'),66+i*7,1,-50.5);

{const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),M('#fff',{roughness:.4}),cars.length);cars.forEach(([x,z,r],i)=>{dm.position.set(x,1,z);dm.rotation.set(0,r,0);dm.scale.set(2,1.5,4.4);dm.updateMatrix();im.setMatrixAt(i,dm.matrix);im.setColorAt(i,new THREE.Color(carCol[i%6]))});im.castShadow=true;S.add(im)}
// 08 bãi cỏ sự kiện, 15 sân bóng rổ, 14/17 vườn
rect(128,-50,168,-24,'#8cc257',.5);
function court(cx,cz,w,d,col,surround,line='#ffffff',ry=0){const g=new THREE.Group();
 const a=new THREE.Mesh(new THREE.PlaneGeometry(w+3,d+3),M(surround));a.rotation.x=-Math.PI/2;a.position.y=.55;g.add(a);
 const b=new THREE.Mesh(new THREE.PlaneGeometry(w,d),M(col));b.rotation.x=-Math.PI/2;b.position.y=.6;g.add(b);
 const lm=new THREE.LineBasicMaterial({color:line});const e=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(w,d)),lm);e.rotation.x=-Math.PI/2;e.position.y=.65;g.add(e);
 const c=new THREE.Mesh(new THREE.PlaneGeometry(.3,d),new THREE.MeshBasicMaterial({color:line}));c.rotation.x=-Math.PI/2;c.position.y=.66;g.add(c);
 g.position.set(cx,0,cz);g.rotation.y=ry;S.add(g);return g}
court(114,-34,26,14,'#d9772b','#2e6e9e');
rect(220,70,262,100,'#86bb52',.4);ribbon(ell(241,85,14,9),2,.5,'#e9e1cf');
rect(296,108,372,172,'#86bb52',.3);ribbon([W(298,165),W(320,130),W(345,150),W(370,112)],3,.45,'#e9e1cf');

// ---------- CÔNG VIÊN TRUNG TÂM THỊNH VƯỢNG (theo phối cảnh) ----------
flat(roundPoly([W(50,118),W(130,118),W(130,226),W(50,226)],14),'#d9d4c8',.33);flat(roundPoly([W(53,121),W(127,121),W(127,223),W(53,223)],12),'#7cb94a',.36);
ribbon(ell(95,171,36,49,64),3.2,.5,'#3f7fc4');                     // đường chạy bộ xanh dương
ribbon(ell(95,171,32.5,45.5,64),2.2,.5,'#e7dfcd');                  // lối dạo lát đá
// lối dạo cong trong vườn (không xuyên qua giữa)
ribbon([W(52,150),W(60,128),W(78,121)],2.4,.52,'#e7dfcd');ribbon([W(128,196),W(122,218),W(104,224)],2.4,.52,'#e7dfcd');
// 05 pickleball: 3 sân xanh ngọc/tím trong hàng tre + lưới rào
{const cx=95,cz=203;rect(72,192,118,215,'#5aa0a0',.55);
 court(83,198,11,6.5,'#4fc0b7','#4fc0b7','#ffffff');court(107,198,11,6.5,'#b79ad6','#4fc0b7','#ffffff');court(95,209,11,6.5,'#4fc0b7','#b79ad6','#ffffff');
 const fence=new THREE.MeshStandardMaterial({color:'#2f6b2a',transparent:true,opacity:.35,side:THREE.DoubleSide});
 [[cx,191,48,0],[cx,216,48,0],[71,203.5,25,Math.PI/2],[119,203.5,25,Math.PI/2]].forEach(([x,z,l,r])=>{const f=new THREE.Mesh(new THREE.PlaneGeometry(l,4),fence);f.position.set(x,2,z);f.rotation.y=r;S.add(f)});
 const bam=M('#5c8f33');[[cx,189.5,50,1.6],[cx,217.5,50,1.6],[69.5,203.5,1.6,28],[120.5,203.5,1.6,28]].forEach(([x,z,w,d])=>box(w,3.2,d,bam,x,1.6,z)); // hàng tre
 box(9,.3,3,white,95,3.2,203.5);for(const dx of[-4,4])box(.2,3,.2,white,95+dx,1.5,203.5);  // mái che nghỉ
 for(const [x,z] of [[72,192],[118,192],[72,215],[118,215]])box(.25,6,.25,M('#333'),x,3,z);}
// 06 bóng chuyền hơi (nền cát)
court(72,166,14,8,'#e8d3a2','#d9c38f','#ffffff');box(.15,2.4,8,white,72,1.2,166,0,false);
// 04 vườn BBQ: chòi mái lá
const hut=(x,z,s=1)=>{for(const [dx,dz] of [[-1.6,-1.6],[1.6,-1.6],[-1.6,1.6],[1.6,1.6]])box(.3*s,2.6*s,.3*s,wood,x+dx*s,1.3*s,z+dz*s);
 const r=new THREE.Mesh(new THREE.ConeGeometry(3.4*s,2.4*s,4),thatch);r.position.set(x,3.6*s,z);r.rotation.y=Math.PI/4;r.castShadow=true;S.add(r);box(2*s,.2*s,1.2*s,wood,x,1,z)};
rect(62,122,86,145,'#d8cdb4',.5);hut(67,128);hut(79,127);hut(70,140,1.1);hut(82,139);
// 03 sân chơi trẻ em (theo ảnh minh hoạ): cụm tháp mái nhọn đỏ/xanh, cầu trượt vàng, ống trượt xanh, xích đu cam, bập bênh, thú nhún
{const x0=113,z0=134;rect(101,124,125,146,'#4bb3a8',.52);
 const red=M('#d93a2b'),blue=M('#2f6fd1'),yel=M('#f4c21b'),org=M('#ef7d22'),post=M('#8a6a4a');
 const tower=(x,z,c)=>{for(const [dx,dz] of [[-1,-1],[1,-1],[-1,1],[1,1]])box(.25,3,.25,post,x+dx,1.5,z+dz);box(2.4,.25,2.4,M('#c49a6c'),x,2.2,z);
  const r=new THREE.Mesh(new THREE.ConeGeometry(1.9,1.8,4),c);r.position.set(x,4,z);r.rotation.y=Math.PI/4;r.castShadow=true;S.add(r)};
 tower(x0-4,z0-4,red);tower(x0,z0-5,blue);tower(x0+4,z0-4,red);box(6,.25,1.2,M('#c49a6c'),x0-2,2.2,z0-4.5);
 const sl=box(1.2,.25,4.5,yel,x0-4,1.2,z0-.5);sl.rotation.x=-.45;
 const tube=new THREE.Mesh(new THREE.TorusGeometry(2.2,.55,8,16,Math.PI),blue);tube.position.set(x0+6.2,2.2,z0-4);tube.rotation.z=Math.PI/2;tube.castShadow=true;S.add(tube);
 for(const dx of[-2.5,2.5]){const a=box(.2,3.2,.2,org,x0-6+dx,1.6,z0+6);a.rotation.z=dx>0?-.18:.18}box(5.6,.25,.25,org,x0-6,3.2,z0+6);
 box(.15,1.6,.15,M('#333'),x0-7,1.1,z0+6);box(.15,1.6,.15,M('#333'),x0-5,1.1,z0+6);
 const sw=box(4.5,.2,.5,red,x0+1,.9,z0+5);sw.rotation.z=.15;box(.4,.7,.4,blue,x0+1,.4,z0+5);
 [[x0+5,z0+3,'#2fa4e7'],[x0+7,z0+6,'#f4c21b'],[x0+4,z0+7,'#e74c3c']].forEach(([x,z,c])=>{box(.2,.8,.2,M('#555'),x,.4,z);const s=new THREE.Mesh(new THREE.SphereGeometry(.7,10,8),M(c));s.position.set(x,1.3,z);s.castShadow=true;S.add(s)});
 const fl=new THREE.Mesh(new THREE.CylinderGeometry(1,1,.3,6),M('#7cc242'));fl.position.set(x0-9,1.2,z0);fl.rotation.x=Math.PI/2;S.add(fl);}
// 07 sân tập GYM ngoài trời
{rect(103,161,123,179,'#c9c1ae',.52);const gm=M('#2f6fd1');
 for(let i=0;i<6;i++){const x=106+(i%3)*6,z=165+Math.floor(i/3)*8;box(.25,2.2,.25,gm,x-1,1.1,z);box(.25,2.2,.25,gm,x+1,1.1,z);box(2.2,.25,.25,gm,x,2.2,z)}}
// cây cau cao giữa công viên
const bigPalm=[95,171,1.9];

// ================= CÂY XANH =================
const palms=[],trees=[],flowers=[];
const inPoly=(x,z,pl)=>{let c=false;for(let i=0,j=pl.length-1;i<pl.length;j=i++){const a=pl[i],b=pl[j];if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)c=!c}return c};
const nearTower=(x,z)=>towers.some(t=>{const dx=x-t.m.position.x,dz=z-t.m.position.z;const c=Math.cos(t.a),s=Math.sin(t.a);const u=dx*c-dz*s,v=dx*s+dz*c;return Math.abs(u)<t.w/2+6&&Math.abs(v)<t.d/2+6});
const dctX=z=>{for(let i=0;i<DCT.length-1;i++){const a=DCT[i],b=DCT[i+1];if((z<=a.z&&z>=b.z)||(z>=a.z&&z<=b.z)){return a.x+(b.x-a.x)*(z-a.z)/(b.z-a.z)}}return 0};
// cau dọc mọi tuyến phố Thịnh Vượng (như sa bàn thật)
[[-1,'v'],[37,'v'],[48,'v'],[84.5,'v'],[95.5,'v'],[132,'v'],[143,'v'],[183,'v']].forEach(([x])=>{for(let z=5;z<diagZ(x)-12;z+=11){if(z>172&&z<183)continue;if(x>40&&x<140&&((z>106&&z<118)||(z>226&&z<238)))continue;if(x>80&&x<100&&z>104&&z<240)continue;if(x>45&&x<135&&z>168&&z<187)continue;palms.push([x,z,1])}});
for(let x=2;x<210;x+=12)palms.push([x,-5,1],[x,-19,1]);
for(let x=225;x<395;x+=10){palms.push([x,diagZ(x)-45,1],[x,diagZ(x)-6,1])}
palms.push(bigPalm);
for(let i=0;i<14;i++){const t=i/14*Math.PI*2;flowers.push([95+40*Math.cos(t),171+53*Math.sin(t),.9])}  // bằng lăng tím quanh đường chạy
for(let i=0;i<40;i++){const x=58+rnd()*76,z=118+rnd()*105;const ins=(x>69&&x<121&&z>188&&z<219)||(x>100&&x<126&&z>123&&z<180)||(x>61&&x<87&&z>121&&z<172);if(!ins&&Math.abs(Math.hypot((x-95)/36,(z-171)/49)-1)>.08)trees.push([x,z,.8+rnd()*.5])}
// cây dọc ĐCT: dải giữa + hai bên vỉa hè
for(let z=-1250,k=0;z<1000;z+=14,k++){const x=dctX(z);trees.push([x,z,.55]);if(k%2===0){trees.push([x-38,z,.8]);if(x+38<-14||z<-60||z>diagZ(x)+5)trees.push([x+38,z,.8])}}
along(TP_ROAD,14,0).forEach(p=>trees.push([p.x,p.z,.5]));along(TP_ROAD,16,15).forEach(p=>trees.push([p.x,p.z,.8]));along(TP_ROAD,16,-15).forEach(p=>{if(p.x<-12||p.x>400)trees.push([p.x,p.z,.8])});
along(DL,13,13).concat(along(DL,13,-13)).forEach(p=>{if(p.z<-20)trees.push([p.x,p.z,.75]);else palms.push([p.x,p.z,1])});
along(ROADS[1].p,16,19).concat(along(ROADS[1].p,16,-19)).forEach(p=>trees.push([p.x,p.z,.8]));
// Hạnh Phúc: sân vườn giữa các tòa + công viên lớn
for(let i=0;i<4000&&trees.length<1500;i++){const x=-15+rnd()*420,z=-880+rnd()*870;if(inPoly(x,z,HP)&&!nearTower(x,z)&&rnd()<.55){(rnd()<.05?flowers:trees).push([x,z,.7+rnd()*.6])}}
// cảnh quan quanh sa bàn: cụm cây trên thảm cỏ
const off=(x,z)=>inPoly(x,z,HP)||(x>-20&&x<410&&z>-40&&z<diagZ(x)+30)||Math.abs(x-dctX(z))<48||Math.abs(z-diagZ(x)-10)<22||(x>480&&x<670&&z>-1020&&z<-850);
for(let c=0;c<120;c++){const cx=-700+rnd()*1900,cz=-1500+rnd()*2600;const n=4+Math.floor(rnd()*12);for(let k=0;k<n;k++){const x=cx+(rnd()-.5)*60,z=cz+(rnd()-.5)*60;if(!off(x,z))trees.push([x,z,.8+rnd()*.9])}}
// --- hình học cây
const canopyG=new THREE.IcosahedronGeometry(1,1);
const tr=new THREE.InstancedMesh(canopyG,M('#fff',{flatShading:true}),trees.length+flowers.length);
const trunkI=new THREE.InstancedMesh(new THREE.CylinderGeometry(.25,.35,1,5),M('#6b4f35'),trees.length+flowers.length);
const gs=['#3f7f2f','#4f8f36','#5d9b3c','#3a6f2c','#6aa543'];
[...trees.map(t=>[...t,0]),...flowers.map(t=>[...t,1])].forEach(([x,z,s,fl],i)=>{const r=(3+rnd()*2.2)*s;const th=2.4*s+1;
 dm.position.set(x,th+r*.8,z);dm.rotation.set(rnd(),rnd(),0);dm.scale.set(r,r*.9,r);dm.updateMatrix();tr.setMatrixAt(i,dm.matrix);
 tr.setColorAt(i,new THREE.Color(fl?['#b07cc6','#c48fd6','#a56bbd'][i%3]:gs[i%5]));
 dm.position.set(x,th/2,z);dm.rotation.set(0,0,0);dm.scale.set(s,th,s);dm.updateMatrix();trunkI.setMatrixAt(i,dm.matrix)});
tr.castShadow=true;S.add(tr,trunkI);
// cây cau
{const leaves=[];for(let k=0;k<8;k++){const g=new THREE.BoxGeometry(.5,.08,3.6);g.translate(0,0,1.8);g.rotateX(.45);g.rotateY(k/8*Math.PI*2);leaves.push(g)}
 const crown=mergeGeometries(leaves);
 const pc=new THREE.InstancedMesh(crown,M('#3f8a2c',{side:THREE.DoubleSide}),palms.length),pt=new THREE.InstancedMesh(new THREE.CylinderGeometry(.18,.28,1,5),M('#9a8466'),palms.length);
 palms.forEach(([x,z,s],i)=>{const h=(7+rnd()*2)*s*(s>1.5?1.6:1);dm.position.set(x,h,z);dm.rotation.set(0,rnd()*6,0);dm.scale.set(s,s,s);dm.updateMatrix();pc.setMatrixAt(i,dm.matrix);
  dm.position.set(x,h/2,z);dm.rotation.set(0,0,0);dm.scale.set(s,h,s);dm.updateMatrix();pt.setMatrixAt(i,dm.matrix)});
 pc.castShadow=pt.castShadow=true;S.add(pc,pt);}
// dải cây bụi viền dãy phố
{const hs=[];Object.entries(COLX).forEach(([c,[x0,x1]])=>BLOCKZ[c].forEach(([z0,z1r])=>{const z1=z1r==='d'?diagZ(x1)-14:z1r;hs.push([x0-1.8,(z0+z1)/2,1,z1-z0],[x1+1.8,(z0+z1)/2,1,z1-z0])}));
 const hm=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),M('#4e8a34'),hs.length);hs.forEach(([x,z,w,d],i)=>{dm.position.set(x,.9,z);dm.rotation.set(0,0,0);dm.scale.set(w,1.2,d);dm.updateMatrix();hm.setMatrixAt(i,dm.matrix)});S.add(hm);}

// ================= NHÃN =================
const LB=document.getElementById('labels');const labels=[];
const addL=(txt,cls,v,y,extra={})=>{const e=document.createElement('div');e.className='lb '+cls;e.textContent=txt;LB.appendChild(e);const o={e,p:new THREE.Vector3(v.x,y,v.z),cls,...extra};labels.push(o);return o};
addL('HẠNH PHÚC','zone',P(330,520),95,{near:220});addL('THỊNH VƯỢNG','zone tv',W(95,150),60,{near:220});
[['THE LINK',165,560],['THE NEST',350,430],['THE HAVEN',250,980],['THE RISE',470,330]].forEach(([t,x,y])=>addL(t,'sub',P(x,y),70,{near:160,far:2600}));
ROADS.forEach(r=>{if(r.name&&r.at)addL(r.name,r.tv?'road tv':'road',r.at,3,{far:r.tv?700:3000})});
towers.forEach(t=>addL(t.n,'tw',t.m.position,t.H+6,{far:900}));
const pins=AMEN.map(([n,t,x,z])=>{const o=addL(String(n).padStart(2,'0'),'pin',W(x,z),16,{far:1500});o.e.dataset.t=t;o.e.addEventListener('click',()=>flyTo(W(x,z),200,.9));return o});
const amList=document.getElementById('amList');
amList.innerHTML=AMEN.map(([n,t])=>`<li><button data-n="${n}"><span class="num">${String(n).padStart(2,'0')}</span>${t}</button></li>`).join('');
amList.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const a=AMEN[b.dataset.n-1];pins.forEach(p=>p.e.classList.remove('act'));pins[b.dataset.n-1].e.classList.add('act');flyTo(W(a[2],a[3]),200,.9)});
const tmp=new THREE.Vector3();
function placeLabels(){const Wd=innerWidth,H=innerHeight;const d=cam.position.distanceTo(ctl.target);
 for(const l of labels){if((l.far&&d>l.far)||(l.near&&d<l.near)){l.e.style.display='none';continue}
  tmp.copy(l.p).project(cam);if(!(tmp.z<1&&Math.abs(tmp.x)<1.05&&Math.abs(tmp.y)<1.05)){l.e.style.display='none';continue}
  l.e.style.display='';l.e.style.transform=`translate(${(tmp.x+1)/2*Wd}px,${(1-tmp.y)/2*H}px) translate(-50%,-50%)`}}


// ================= KẾT NỐI GIÁO DỤC (vị trí tương đối theo bản đồ liên kết vùng của CĐT) =================
const MP=(px,py)=>W(100+(px-570)*8.8,200+(py-470)*8.8);
ribbon([W(-63,905),W(290,3104),W(640,4864)],60,.6,'#3d4248');
ribbon([MP(170,820),MP(400,900),MP(640,905),MP(1000,860)],40,.6,'#3d4248');
const EDU=[
 {n:'Trường Đại học Phố Hiến',t:'5 phút',p:MP(505,483),lp:MP(470,590),w:260,d:200,c:'#e9e2d3',b:5},
 {n:'Trường Đại học Thủy Lợi Hưng Yên',t:'5 phút',p:MP(680,262),w:420,d:300,c:'#e9e2d3',b:6},
 {n:'Trường Đại học Chu Văn An',t:'',p:MP(402,845),w:420,d:300,c:'#e9e2d3',b:5},
 {n:'Học viện An ninh nhân dân & Học viện Cảnh sát nhân dân',t:'Vị trí xây dựng · 201,5ha',zone:[W(480,-980),W(1700,-800),W(1700,diagZ(1700)-35),W(480,diagZ(480)-35)]},
 {n:'Học viện An ninh nhân dân & Học viện Cảnh sát nhân dân',t:'Vị trí xây dựng · 207,6ha',zone:[W(120,diagZ(120)+50),W(1250,diagZ(1250)+50),W(1300,1250),W(260,1400)]},
 {n:'Trung tâm đào tạo an ninh mạng quốc gia',t:'66ha',zone:[MP(648,330),MP(690,320),MP(720,372),MP(690,395),MP(652,370)]},
 {n:'Khu trường bộ Công an',t:'16,5ha',lp:MP(470,410),zone:[MP(486,452),MP(520,462),MP(522,500),MP(482,505)]},
 {n:'Khu trường bộ Công an',t:'29,9ha',lp:MP(330,420),zone:[MP(375,432),MP(392,438),MP(398,495),MP(343,508)]}];
const eduLabels=[];
EDU.forEach(e=>{let c;
 if(e.zone){flat(e.zone,'#a6d884',.1);
  ribbon([...e.zone,e.zone[0]],8,.12,'#3f8a2c');c=e.zone.reduce((a,p)=>a.add(p),new THREE.Vector3()).multiplyScalar(1/e.zone.length)}
 else{c=e.p;rect(c.x-e.w/2,c.z-e.d/2,c.x+e.w/2,c.z+e.d/2,e.c,.12);
  for(let i=0;i<e.b;i++){const a=i/e.b*Math.PI*2,r=e.w*.28;const h=18+(i%3)*10;box(e.w*.3,h,e.d*.14,M('#f4efe6'),c.x+Math.cos(a)*r,h/2,c.z+Math.sin(a)*r*.7,a)}
  box(e.w*.3,30,e.d*.2,M('#d9b98a'),c.x,15,c.z);}
 const o=addL(e.n+(e.t?' · '+e.t:''),e.zone?'edu zone-edu':'edu',e.lp||c,e.zone?30:60,{near:900});eduLabels.push(o)});

// ================= LÀNG XÓM & PHỐ THỊ QUANH DỰ ÁN (dựng theo bố cục khu vực, minh hoạ) =================
{const inP=(x,z,pl)=>{let c=false;for(let i=0,j=pl.length-1;i<pl.length;j=i++){const a=pl[i],b=pl[j];if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)c=!c}return c};
 const distSeg=(x,z,pl)=>{let d=1e9;for(let i=0;i<pl.length-1;i++){const a=pl[i],b=pl[i+1];const dx=b.x-a.x,dz=b.z-a.z,l2=dx*dx+dz*dz;let t=((x-a.x)*dx+(z-a.z)*dz)/l2;t=Math.max(0,Math.min(1,t));d=Math.min(d,Math.hypot(x-a.x-t*dx,z-a.z-t*dz))}return d};
 const bigRoads=ROADS.filter(r=>r.w>=20);
 const blocked=(x,z)=>{
  if(inP(x,z,HP))return true;
  if(x>-40&&x<420&&z>-60&&z<diagZ(x)+30)return true;                 // Thịnh Vượng + Đường Thành Phố
  if(x>480&&x<680&&z>-1030&&z<-830)return true;                       // công trình công cộng phía Bắc
  for(const r of bigRoads)if(distSeg(x,z,r.p)<r.w/2+12)return true;
  for(const e of EDU){if(e.zone&&inP(x,z,e.zone))return true;if(e.p&&Math.abs(x-e.p.x)<e.w/2+10&&Math.abs(z-e.p.z)<e.d/2+10)return true}
  return false};
 const houses=[],lanes=[],gardens=[],ponds=[];
 const WALL=['#f3efe6','#efe4c8','#f2dcc0','#e9eef0','#f4e7a8','#f1d1c4','#d9e7f1','#e8e8e2','#f6f1e1','#e3d5bd'];
 // đặt dãy nhà ống hai bên một con đường
 function street(ax,az,bx,bz,setback,dens,hmin,hmax){const dx=bx-ax,dz=bz-az,L=Math.hypot(dx,dz);if(L<20)return;const ux=dx/L,uz=dz/L,nx=-uz,nz=ux,ang=Math.atan2(dx,dz);
  lanes.push([W(ax,az),W(bx,bz)]);
  for(const side of[-1,1]){let t=4;while(t<L-4){const w=4+rnd()*2.5;if(rnd()<dens){const d=11+rnd()*9;const off=setback+d/2;const cx=ax+ux*(t+w/2)+nx*side*off,cz=az+uz*(t+w/2)+nz*side*off;
     if(!blocked(cx,cz)){const fl=hmin+Math.floor(rnd()*(hmax-hmin+1));houses.push([cx,cz,w-.4,d,fl*3.4,ang,rnd()<.38]);if(rnd()<.25)gardens.push([cx+nx*side*(d/2+3),cz+nz*side*(d/2+3)])}}
    else if(rnd()<.5)gardens.push([ax+ux*t+nx*side*(setback+6),az+uz*t+nz*side*(setback+6)]);
    t+=w}}}
 // làng: một trục chính và các ngõ nhánh
 function village(cx,cz,R,dir,dens){const ux=Math.cos(dir),uz=Math.sin(dir);
  street(cx-ux*R,cz-uz*R,cx+ux*R,cz+uz*R,4,dens,2,4);
  const n=Math.max(2,Math.floor(R/45));for(let k=-n;k<=n;k++){if(rnd()<.2)continue;const px=cx+ux*k*R/n,pz=cz+uz*k*R/n,l=R*(.35+rnd()*.5),sg=rnd()<.5?1:-1;
   street(px,pz,px-uz*l*sg,pz+ux*l*sg,2.5,dens*.85,1,3)}
  if(rnd()<.6)ponds.push([cx+(rnd()-.5)*R,cz+(rnd()-.5)*R,15+rnd()*25,10+rnd()*18])}
 // phố thị Phố Hiến phía Tây ĐCT: lưới phố dày
 for(let z=-1350;z<1050;z+=95){street(-1150,z,dctX(z)-45,z,4,.85,2,5)}
 for(let x=-1100;x<-250;x+=130){street(x,-1350,x,1050,4,.75,2,5)}
 // các làng phía Bắc (Nhật Tân), phía Đông, phía Nam và quanh dự án
 [[ -50,-1250,240,.3,.85],[300,-1350,220,-.2,.8],[650,-1450,200,.1,.8],[950,-1250,230,1.3,.75],[1650,-900,260,.4,.8],[1800,-300,260,1.2,.8],
  [1750,400,260,.2,.8],[1500,900,240,1.4,.75],[1050,1500,260,.1,.8],[500,1650,260,-.3,.85],[-100,1500,260,.4,.8],[700,-650,0,0,0],
  [1250,-1650,220,.9,.75],[2100,-1100,240,.3,.7],[2200,700,240,1.1,.7],[150,2000,240,.2,.75],[-650,1700,220,.6,.85]]
  .forEach(([x,z,r,d,de])=>{if(r)village(x,z,r,d,de)});
 // ---- dựng nhà
 const N=houses.length;
 const fac=(()=>{const cn=document.createElement('canvas');cn.width=64;cn.height=128;const g=cn.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,64,128);
  for(let f=0;f<4;f++){g.fillStyle='#55606a';g.fillRect(10,f*32+8,44,16);g.fillStyle='#d8d8d8';g.fillRect(4,f*32+28,56,3)}
  const t=new THREE.CanvasTexture(cn);t.colorSpace=THREE.SRGBColorSpace;return t})();
 const hb=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),[M('#fff',{map:fac}),M('#fff',{map:fac}),M('#ddd7cc'),M('#fff'),M('#fff',{map:fac}),M('#fff',{map:fac})],N);
 const roofs=houses.filter(h=>h[6]),flats=houses.filter(h=>!h[6]);
 const roofG=new THREE.ConeGeometry(Math.SQRT1_2,1,4);roofG.rotateY(Math.PI/4);
 const hr=new THREE.InstancedMesh(roofG,M('#fff',{flatShading:true}),roofs.length);
 const ht=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),M('#e8e3d8'),flats.length);
 const RC=['#b5533c','#a8473a','#c2643f','#8f4b3b','#6f7b86','#4f6b7a'];
 let ri=0,ti=0;
 houses.forEach(([x,z,w,d,h,a,pitched],i)=>{dm.position.set(x,h/2,z);dm.rotation.set(0,a,0);dm.scale.set(w,h,d);dm.updateMatrix();hb.setMatrixAt(i,dm.matrix);hb.setColorAt(i,new THREE.Color(WALL[i%WALL.length]));
  if(pitched){dm.position.set(x,h+1.4,z);dm.rotation.set(0,a,0);dm.scale.set(w*1.1,2.8,d*1.04);dm.updateMatrix();hr.setMatrixAt(ri,dm.matrix);hr.setColorAt(ri++,new THREE.Color(RC[i%RC.length]))}
  else{dm.position.set(x,h+1.2,z);dm.rotation.set(0,a,0);dm.scale.set(w*.8,2.4,Math.min(d*.3,4));dm.updateMatrix();ht.setMatrixAt(ti++,dm.matrix)}});
 [hb,hr,ht].forEach(m=>{m.castShadow=true;m.receiveShadow=true;S.add(m)});
 // ngõ xóm bê tông
 const lg=mergeGeometries(lanes.map(([a,b])=>strip([a,b],4.5,.35)));const lm=new THREE.Mesh(lg,M('#c9c4b6',{side:THREE.DoubleSide}));lm.receiveShadow=true;S.add(lm);
 // ao làng
 ponds.forEach(([x,z,rx,rz])=>{if(!blocked(x,z)){const m=flat(ell(x,z,rx,rz,24),'#5f8ea0',.3);m.material.roughness=.25}});
 // vườn cây quanh nhà
 const gt=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),M('#fff',{flatShading:true}),gardens.length);
 gardens.forEach(([x,z],i)=>{const r=2.5+rnd()*3;dm.position.set(x,r+1,z);dm.rotation.set(rnd(),rnd(),0);dm.scale.set(r,r*1.1,r);dm.updateMatrix();gt.setMatrixAt(i,dm.matrix);gt.setColorAt(i,new THREE.Color(['#4a7f33','#5c9140','#3d6e2c','#6b9c45'][i%4]))});
 gt.castShadow=true;S.add(gt);
 window.__houses=N;}

// ================= XE ĐIỆN CHẠY TRÊN ĐƯỜNG (kiểu SUV, màu theo bảng màu xe điện phổ biến, không logo) =================
const movers=[];let carMesh=null;
{const body=new THREE.BoxGeometry(2,1.05,4.6);body.translate(0,.85,0);const cab=new THREE.BoxGeometry(1.8,.75,2.7);cab.translate(0,1.75,-.2);
 const lampF=new THREE.BoxGeometry(1.7,.18,.06);lampF.translate(0,1.05,2.31);
 const g=mergeGeometries([body,cab,lampF]);
 const COL=['#f4f4f2','#c8102e','#1f4fa0','#8e9499','#d7e24a','#1d1f22','#f4f4f2','#2a7fbf','#e8e6df'];
 const routes=ROADS.filter(r=>r.w>=9&&r.p.length>=2).map(r=>{const pts=r.p;const cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i].x-pts[i-1].x,pts[i].z-pts[i-1].z));return{pts,cum,L:cum[cum.length-1],w:r.w}}).filter(r=>r.L>60);
 routes.forEach(r=>{const n=Math.max(1,Math.round(r.L/(r.w>=20?45:70)));for(let k=0;k<n;k++){const dir=rnd()<.5?1:-1;const lanes=r.w>=28?2:1;const lane=Math.floor(rnd()*lanes);
  movers.push({r,dir,s:rnd()*r.L,v:(r.w>=20?11:6)+rnd()*5,off:dir*(r.w*.18+lane*r.w*.16)})}});
 carMesh=new THREE.InstancedMesh(g,M('#fff',{roughness:.35,metalness:.3}),movers.length);
 movers.forEach((m,i)=>carMesh.setColorAt(i,new THREE.Color(COL[i%COL.length])));
 carMesh.castShadow=true;S.add(carMesh);}
const _p=new THREE.Vector3();
function updateCars(dt){if(!carMesh)return;
 movers.forEach((m,i)=>{const r=m.r;m.s=(m.s+m.dir*m.v*dt+r.L)%r.L;
  let j=1;while(j<r.cum.length-1&&r.cum[j]<m.s)j++;const a=r.pts[j-1],b=r.pts[j],seg=r.cum[j]-r.cum[j-1]||1,t=(m.s-r.cum[j-1])/seg;
  const dx=(b.x-a.x)/seg,dz=(b.z-a.z)/seg;const x=a.x+(b.x-a.x)*t+(-dz)*m.off*-1,z=a.z+(b.z-a.z)*t+dx*m.off*-1;
  dm.position.set(x,.6,z);dm.rotation.set(0,Math.atan2(dx*m.dir,dz*m.dir),0);dm.scale.set(1,1,1);dm.updateMatrix();carMesh.setMatrixAt(i,dm.matrix)});
 carMesh.instanceMatrix.needsUpdate=true}
updateCars(0);
// ================= CAMERA =================
const VIEWS={
 'toan-canh':[W(110,150),950,.88,-.25],'hanh-phuc':[P(320,640),900,.9,-.2],'thinh-vuong':[W(110,150),520,.85,-.15],
 'the-link':[P(175,575),360,.85,-.4],'the-nest':[P(360,520),430,.85,-.1],'the-haven':[P(255,995),400,.85,-.35],'the-rise':[P(470,420),400,.85,.2],'giao-duc':[W(-150,1300),8200,.55,-.1]};
let fly=null;
function flyTo(t,dist,pol=.9,az=null){const a=az??Math.atan2(cam.position.x-ctl.target.x,cam.position.z-ctl.target.z);
 const to=new THREE.Vector3(t.x+dist*Math.sin(pol)*Math.sin(a),dist*Math.cos(pol),t.z+dist*Math.sin(pol)*Math.cos(a));
 fly={t0:performance.now(),d:matchMedia('(prefers-reduced-motion:reduce)').matches?1:1400,fp:cam.position.clone(),ft:ctl.target.clone(),tp:to,tt:t.clone()}}
function go(v){const [t,d,p,a]=VIEWS[v]||VIEWS['toan-canh'];flyTo(t,d,p,a);document.querySelectorAll('#chips button').forEach(b=>b.classList.toggle('on',b.dataset.v===v))}
document.getElementById('chips').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;try{history.replaceState(null,'','#'+b.dataset.v)}catch(_){}go(b.dataset.v)});
addEventListener('hashchange',()=>{if(VIEWS[location.hash.slice(1)])go(location.hash.slice(1))});

// ================= CHỌN CĂN =================
const ray=new THREE.Raycaster(),mp=new THREE.Vector2();let hov=-1,down=null,sel=-1;
const card=document.getElementById('card');let cur=null;
const fmt=a=>a.toFixed(1).replace('.',',');const ty=n=>(n/1e9).toFixed(2).replace('.',',')+' tỷ';const trd=m=>(m/1000).toFixed(3).replace('.',',')+' tỷ';const pv=p=>p.tdc?p.tdc*1e6:p.tot;
function show(info){cur=info;const im=document.getElementById('cImg');im.src=info.img;im.alt=info.title;
 document.getElementById('cTag').textContent=info.tag;document.getElementById('cTitle').textContent=info.title;document.getElementById('cText').textContent=info.text;document.getElementById('cRows').innerHTML=info.rows||'';card.classList.toggle('open',!!info.open);card.classList.toggle('lot',!!info.rows);card.classList.add('show')}
function paint(i,c){if(i<0)return;body.setColorAt(i,c);body.instanceColor.needsUpdate=true;if(cornerMesh[i])cornerMesh[i].color.copy(CW_BASE).multiply(c)}
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function selectLot(i,fly){paint(sel,lotCol(sel));sel=i;paint(i,SEL);const L=lots[i],m=MAU[L.type],d=L.d;
 const p=PRICE[L.code];const vnd=n=>n?n.toLocaleString('vi-VN')+' đ':'';
 const rows=[['Loại căn',(p?'LK · ':'')+CAT[L.cat][0]],['TCBG',p?p.tc:''],['Hướng',d[0]],['Vị trí',d[1]],['Mặt đường',L.face],['DT đất',(p&&p.dt?fmt(p.dt):L.area?fmt(L.area):'')+(p&&p.dt||L.area?' m²':'')],['DTXD',(p&&p.x)?fmt(p.x)+' m²':d[3]?fmt(d[3])+' m²':''],
  ['Giá trước VAT',p&&p.pre?vnd(p.pre):''],['VAT',p&&p.vat?vnd(p.vat):''],['KPBT',p&&p.kp?vnd(p.kp):''],[p&&p.allin?'Giá all in':'Tổng giá sau VAT & KPBT',p&&p.tot?vnd(p.tot):''],['Giá tiến độ (TĐC)',p&&p.tdc?trd(p.tdc):''],['Thanh toán sớm (TTS)',p&&p.tts?trd(p.tts):''],['Vay 18 tháng',p&&p.v18?trd(p.v18):''],['Vay 24 tháng',p&&p.v24?trd(p.v24):''],['Vay 30 tháng',p&&p.v30?trd(p.v30):''],['Vay 36 tháng',p&&p.v36?trd(p.v36):''],['Tiện ích lân cận',d[4]]].filter(r=>r[1]);
 show({open:L.open,title:'Căn '+L.code,tag:L.open?'Đang mở bán · '+(PRICE[L.code]?(PRICE[L.code].tdc?'Giá tiến độ ':'')+ty(pv(PRICE[L.code])):''):'Phố Hiến Heritage Collection',img:m.img,text:m.name+' – '+m.text,
  rows:rows.map(([k,v])=>`<dt>${k}</dt><dd${/TĐC/.test(k)||(!p.tdc&&/Tổng giá|all in/.test(k))?' class="big"':''}>${esc(v)}</dd>`).join('')+(p?`<dt></dt><dd class="sm">Giá theo bảng hàng ngày ${p.d}, có thể thay đổi.</dd>`:'')});
 if(fly)flyTo(W(L.x,L.z),150,.8)}
function viewFront(i){const L=lots[i];const ry=L.ew?L.rot+Math.PI/2:0;const dh=(L.ew?L.l:L.w)/2;
 const dir=new THREE.Vector3(Math.cos(ry)*L.fx,0,-Math.sin(ry)*L.fx);const t=new THREE.Vector3(L.x,7,L.z).addScaledVector(dir,dh);
 const p=t.clone().addScaledVector(dir,34);p.y=9;setRot(false);
 fly={t0:performance.now(),d:1400,fp:cam.position.clone(),ft:ctl.target.clone(),tp:p,tt:t}}
document.getElementById('cFront').onclick=()=>{if(sel>=0)viewFront(sel)};
function hit(ev){const r=cv.getBoundingClientRect();mp.set((ev.clientX-r.left)/r.width*2-1,-(ev.clientY-r.top)/r.height*2+1);ray.setFromCamera(mp,cam);return ray.intersectObjects(pick,false)[0]}
cv.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];setRot(false)});
const tip=document.getElementById('tip');
function showTip(id,e){if(id<0){tip.style.display='none';return}const L=lots[id],p=PRICE[L.code],d=L.d||[];
 const dt=(p&&p.dt)||L.area,x=(p&&p.x)||d[3];
 const rows=[['Loại căn',CAT[L.cat][0]],['Diện tích đất',dt?fmt(dt)+' m²':''],['DTXD',x?fmt(x)+' m²':''],['Hướng',d[0]],['Vị trí',d[1]],['Mặt đường',L.face],['Tiện ích',d[4]],
  ['Giá',p?(p.tdc?'TĐC '+ty(pv(p)):ty(pv(p))):'']].filter(r=>r[1]);
 tip.innerHTML=`<b>${L.code}</b>${L.open?' <i>Đang mở bán</i>':''}<dl>${rows.map(([k,v])=>`<dt>${k}</dt><dd${k==='Giá'?' class="g"':''}>${esc(v)}</dd>`).join('')}</dl>`;
 tip.style.display='block';const r=tip.getBoundingClientRect();let lx=e.clientX+14,ly=e.clientY+14;if(lx+r.width>innerWidth-8)lx=e.clientX-r.width-14;if(ly+r.height>innerHeight-8)ly=innerHeight-r.height-8;tip.style.left=lx+'px';tip.style.top=ly+'px'}
cv.addEventListener('pointerleave',()=>tip.style.display='none');
cv.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const h=hit(e);const id=h?(h.object===body?h.instanceId:(h.object.userData.lot??-1)):-1;showTip(id,e);
 if(id!==hov){if(hov>=0&&hov!==sel)paint(hov,lotCol(hov));if(id>=0&&id!==sel)paint(id,HOV);hov=id}cv.style.cursor=h?'pointer':'grab'});
cv.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6)return;const h=hit(e);if(!h)return;
 if(h.object===body)selectLot(h.instanceId,false);else if(h.object.userData.lot!==undefined)selectLot(h.object.userData.lot,false);else{paint(sel,lotCol(sel));sel=-1;show(INFO.get(h.object))}});
document.getElementById('cardX').onclick=()=>{card.classList.remove('show');paint(sel,lotCol(sel));sel=-1};
// tìm mã căn
document.getElementById('srch').addEventListener('submit',e=>{e.preventDefault();const qm=document.getElementById('qm');
 let q=document.getElementById('q').value.toUpperCase().replace(/\s+/g,'').replace('Đ','D');q=q.replace(/^([A-Z]+\d?)-?(\d+)$/,(m,a,b)=>a+'-'+b.padStart(2,'0'));
 const i=byCode.get(q);if(i===undefined){qm.textContent='Không thấy mã "'+q+'". Thử HK-01, TC2-15, DLTC-20, TV-01, TP-52.';return}
 qm.textContent='';setRot(false);selectLot(i,true);document.getElementById('side').classList.remove('open')});

// ================= TÔ MÀU SƠ ĐỒ =================
function legend(){const el=document.getElementById('lgItems');
 if(MODE==='loai'){const cnt={};lots.forEach(L=>cnt[L.cat]=(cnt[L.cat]||0)+1);el.innerHTML=Object.entries(CAT).map(([k,[n,c]])=>`<li><i style="background:${c}"></i>${n}<b>${cnt[k]||0}</b></li>`).join('')}
 else if(MODE==='mo-ban'){const n=lots.filter(L=>L.open).length;el.innerHTML=`<li><i style="background:#25b768"></i>Đang mở bán<b>${n}</b></li><li><i style="background:#d6d1c8"></i>Căn khác<b>${NL-n}</b></li><li class="sm">Theo quỹ hàng ngày ${OPEN_DATE}. Biển viền đỏ: giá tiến độ (TĐC) · viền xám: giá sau VAT & KPBT</li>`}
 else el.innerHTML=`<li><i style="background:#fff0dc"></i>Căn góc</li><li><i style="background:#ffffff"></i>Liền kề</li><li class="sm">${NL} căn · bấm vào căn để xem chi tiết</li>`}
function setMode(m){MODE=m;for(let i=0;i<NL;i++)paint(i,i===sel?SEL:lotCol(i));
 document.querySelectorAll('#lgModes button').forEach(b=>b.classList.toggle('on',b.dataset.m===m));legend()}
document.getElementById('lgModes').addEventListener('click',e=>{const b=e.target.closest('button');if(b)setMode(b.dataset.m)});
legend();
// ---- danh sách quỹ căn đang bán
{const ul=document.getElementById('quy');const arr=Object.entries(PRICE).sort((a,b)=>pv(a[1])-pv(b[1]));
 document.getElementById('quyN').textContent=arr.length;
 ul.innerHTML=arr.map(([c,p])=>`<li><button data-c="${c}"><b>${c}</b><span>${p.dt?fmt(p.dt)+' m²':''}</span><em${p.tdc?'':' class="g"'}>${ty(pv(p))}</em></button></li>`).join('');
 ul.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const i=byCode.get(b.dataset.c.replace('Đ','D'));if(i!==undefined){setRot(false);selectLot(i,true);document.getElementById('side').classList.remove('open')}})}
// ================= NÚT =================
const bRot=document.getElementById('bRot');
function setRot(on){ctl.autoRotate=on;bRot.classList.toggle('on',on);bRot.setAttribute('aria-pressed',on)}
bRot.onclick=()=>setRot(!ctl.autoRotate);
document.getElementById('bInfo').onclick=()=>document.getElementById('side').classList.toggle('open');
const gal=document.getElementById('gal'),stripEl=document.getElementById('strip');
stripEl.innerHTML=GAL.map(([f,t])=>`<figure><img loading="lazy" src="img/${f}.jpg" alt="${t}"><figcaption>${t}</figcaption></figure>`).join('');
const openGal=src=>{gal.classList.add('show');const i=Math.max(0,GAL.findIndex(g=>src&&src.includes(g[0])));stripEl.children[i].scrollIntoView({inline:'center'})};
const step=d=>{const w=stripEl.clientWidth;stripEl.scrollTo({left:Math.round(stripEl.scrollLeft/w+d)*w,behavior:'smooth'})};
document.getElementById('bGal').onclick=()=>openGal();
document.getElementById('cPic').onclick=()=>openGal(cur&&cur.img);document.getElementById('cImg').onclick=()=>openGal(cur&&cur.img);
document.getElementById('galX').onclick=()=>gal.classList.remove('show');
document.getElementById('gPrev').onclick=()=>step(-1);document.getElementById('gNext').onclick=()=>step(1);
addEventListener('keydown',e=>{if(!gal.classList.contains('show'))return;if(e.key==='ArrowLeft')step(-1);if(e.key==='ArrowRight')step(1);if(e.key==='Escape')gal.classList.remove('show')});

// ================= VÒNG LẶP =================
function size(){R.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}
addEventListener('resize',size);size();
cam.position.set(300,2600,1400);ctl.target.copy(W(110,150));
const h0=location.hash.slice(1);go(VIEWS[h0]?h0:'toan-canh');
const ease=t=>t<.5?4*t*t*t:1-(-2*t+2)**3/2;
let lastT=0;const RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
function loop(now){requestAnimationFrame(loop);{const dt=Math.min(.1,(now-(lastT||now))/1000);lastT=now;if(!RM)updateCars(dt)}
 if(fly){const k=Math.min(1,(now-fly.t0)/fly.d),e=ease(k);cam.position.lerpVectors(fly.fp,fly.tp,e);ctl.target.lerpVectors(fly.ft,fly.tt,e);if(k>=1)fly=null}
 ctl.update();{const d=cam.position.distanceTo(ctl.target);S.fog.near=Math.max(1700,d*.9);S.fog.far=Math.max(3800,d*2.6)}R.render(S,cam);placeLabels()}
requestAnimationFrame(loop);
const ld=document.getElementById('load');ld.style.opacity=0;setTimeout(()=>ld.remove(),700);
window.__lots=NL;window.__go=(x,z,d,p)=>{setRot(false);flyTo(W(x,z),d,p)};window.__sel=c=>selectLot(byCode.get(c),true);
}
