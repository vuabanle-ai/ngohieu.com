// Danh mục dự án hiển thị trên ngohieu.com. Sửa/thêm dự án tại đây.
// type: 'thap' (thấp tầng) | 'cao' (cao tầng) | 'ca-hai'; tags: 'hot' | 'moi' | 'sap-mo-ban'; saban: đường dẫn sa bàn 3D nếu có
export const PROJECTS = [
 {id:'pho-hien',name:'Phố Hiến Heritage Collection',dev:'Vinhomes',area:'Phố Hiến, Hưng Yên',type:'thap',tags:['hot','moi'],img:'/du-an/Happy-Home-Pho-Hien/img/phoi-canh-tren-cao.jpg',saban:'/du-an/Happy-Home-Pho-Hien/',note:'303 căn liền kề shophouse · sở hữu lâu dài'},
 {id:'ocp23',name:'Vinhomes Ocean Park 2 & 3',dev:'Vinhomes',area:'Văn Giang – Văn Lâm, Hưng Yên',type:'thap',tags:['hot']},
 {id:'global-gate',name:'Vinhomes Global Gate',dev:'Vinhomes',area:'Đông Anh, Hà Nội',type:'thap',tags:['hot']},
 {id:'wonder-city',name:'Vinhomes Wonder City',dev:'Vinhomes',area:'Đan Phượng, Hà Nội',type:'thap',tags:[]},
 {id:'green-paradise',name:'Vinhomes Green Paradise',dev:'Vinhomes',area:'Cần Giờ, TP. Hồ Chí Minh',type:'thap',tags:['hot']},
 {id:'hai-van-bay',name:'Vinhomes Hải Vân Bay',dev:'Vinhomes',area:'Đà Nẵng',type:'thap',tags:['moi'],img:'/du-an/Vinhomes-Hai-Van-Bay/anh-dao-ngoc.jpg',saban:'/du-an/Vinhomes-Hai-Van-Bay/',note:'Khu Đảo Ngọc · hơn 2.300 căn có mã trên sa bàn'},
 {id:'ha-long-xanh',name:'Vinhomes Global Gate Hạ Long',dev:'Vinhomes',area:'Hạ Long, Quảng Ninh',type:'thap',tags:[]},
 {id:'lumiere-spring-bay',name:'Lumière Spring Bay',dev:'Masterise Homes',area:'Vinhomes Ocean Park 2, Hưng Yên',type:'cao',tags:[]},
 {id:'masteri-lakeside',name:'Masteri Lakeside',dev:'Masterise Homes',area:'Vinhomes Ocean Park 1, Hà Nội',type:'cao',tags:[]},
 {id:'masteri-trinity',name:'Masteri Trinity Square',dev:'Masterise Homes',area:'Vinhomes Ocean Park 2, Hưng Yên',type:'cao',tags:[]},
 {id:'masteri-sky-quarter',name:'Masteri Sky Quarter',dev:'Masterise Homes',area:'Vinhomes Wonder City, Đan Phượng',type:'cao',tags:['moi']},
 {id:'masteri-era',name:'Masteri Era Landmark',dev:'Masterise Homes',area:'Vinhomes Ocean Park 3, Hưng Yên',type:'cao',tags:[]},
 {id:'masteri-ocp2',name:'Masteri Ocean Park 2',dev:'Masterise Homes',area:'Vinhomes Ocean Park 2, Hưng Yên',type:'cao',tags:[]},
 {id:'cao-xa-la',name:'Masterise Cao Xà Lá',dev:'Masterise Homes',area:'Thanh Xuân, Hà Nội',type:'cao',tags:['sap-mo-ban']},
 {id:'lumiere-prime-hills',name:'Lumière Prime Hills',dev:'Masterise Homes',area:'Cổ Loa, Đông Anh, Hà Nội',type:'cao',tags:[]},
 {id:'lumiere-orient-pearl',name:'Lumière Orient Pearl',dev:'Masterise Homes',area:'',type:'cao',tags:[]},
 {id:'lumiere-ocean-crest',name:'Lumière Ocean Crest',dev:'Masterise Homes',area:'',type:'cao',tags:[]},
 {id:'senique',name:'The Senique',dev:'CapitaLand',area:'Hà Nội',type:'cao',tags:[]},
 {id:'fullton',name:'The Fullton',dev:'CapitaLand',area:'Hà Nội',type:'cao',tags:[]},
 {id:'sunshine-legend',name:'Sunshine Legend City',dev:'Sunshine Group',area:'Hà Nội',type:'cao',tags:[]},
 {id:'alluvia',name:'Alumi & Alluvia Xuân Cầu',dev:'',area:'Xuân Cầu, Văn Giang, Hưng Yên',type:'ca-hai',tags:[]},
 {id:'harbor-skyline',name:'The Harbor Skyline Vũ Yên',dev:'MIK Group',area:'Vũ Yên, Hải Phòng',type:'cao',tags:[]},
 {id:'imperia-ocean-city',name:'Imperia Ocean City',dev:'MIK Group',area:'Vinhomes Ocean Park 2, Hưng Yên',type:'cao',tags:[]},
 {id:'cosmopolitan',name:'The Cosmopolitan',dev:'MIK Group',area:'',type:'cao',tags:[]},
 {id:'magnolia',name:'The Magnolia',dev:'MIK Group',area:'Phố Nối, Hưng Yên',type:'cao',tags:[]},
 {id:'imperia-sky-park',name:'Imperia Sky Park',dev:'MIK Group',area:'',type:'cao',tags:[]},
 {id:'imperia-holiday',name:'Imperia Holiday Hạ Long',dev:'MIK Group',area:'Hạ Long, Quảng Ninh',type:'cao',tags:[]},
 {id:'imperia-signature',name:'Imperia Signature Cổ Loa',dev:'MIK Group',area:'Cổ Loa, Đông Anh, Hà Nội',type:'cao',tags:[]},
 {id:'matrix-one',name:'The Matrix One',dev:'MIK Group',area:'Nam Từ Liêm, Hà Nội',type:'cao',tags:[]},
 {id:'ninety',name:'The Ninety Complex',dev:'',area:'90 Đường Láng, Hà Nội',type:'cao',tags:[]},
 {id:'eco-central-park',name:'Eco Central Park',dev:'Ecopark',area:'Nghệ An',type:'thap',tags:[]},
 {id:'eco-retreat',name:'Eco Retreat',dev:'Ecopark',area:'Long An',type:'thap',tags:[]},
 {id:'haus-coastal',name:'Haus Coastal Quảng Ngãi',dev:'',area:'Quảng Ngãi',type:'thap',tags:[]}
];
export const TYPE={thap:'Thấp tầng',cao:'Cao tầng','ca-hai':'Thấp & cao tầng'};
export const TAG={hot:'HOT',moi:'Mới','sap-mo-ban':'Sắp mở bán'};
