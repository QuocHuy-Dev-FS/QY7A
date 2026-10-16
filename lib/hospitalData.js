export const HOSPITAL_INFO = {
  name: "BỆNH VIỆN QUÂN Y 7A",
  subName: "CỤC HẬU CẦN - QUÂN KHU 7",
  rank: "Bệnh viện Đa khoa Tuyến cuối - Hạng I",
  slogan: "Hiện đại • Chuyên sâu • Thân thiện",
  address: "Số 466 Nguyễn Trãi, Phường 8, Quận 5, TP. Hồ Chí Minh",
  hotline: "028 38366789",
  emergencyHotline: "028 39234675",
  email: "tocskhbv7a@gmail.com",
  website: "http://bvquany7a.vn",
  logo: "/assets/images/logo-bv-quan-y-7a-tight.png",
  workingHours: "Thứ 2 - Thứ 6: 07:00 - 16:30 | Cấp cứu: Trực 24/24",
  description:
    "Bệnh viện Quân y 7A là bệnh viện đa khoa hạng I trực thuộc Cục Hậu cần Quân khu 7. Bệnh viện có nhiệm vụ khám bệnh, thu dung điều trị cho cán bộ, chiến sĩ LLVT Quân khu, các đơn vị quân đội đóng quân trên địa bàn và nhân dân khu vực phía Nam.",
  highlights: [
    "Khám chữa bệnh BHYT đúng tuyến & thông tuyến toàn quốc cho mọi đối tượng nhân dân",
    "Khu Chẩn đoán và Điều trị Kỹ thuật cao với trang thiết bị thế hệ mới (MRI, CT 128 dãy, nội soi không đau)",
    "Đơn vị Phụ sản An Đông uy tín hàng đầu khu vực",
    "Trung tâm Chấn thương chỉnh hình và Phẫu thuật nội soi chuyên sâu",
  ],
};

export const DEPARTMENTS = [
  {
    value: "KhamBenh",
    label: "Khoa Khám Bệnh",
    description: "Tiếp đón, phân loại, khám BHYT và dịch vụ theo yêu cầu",
    code: "KB",
  },
  {
    value: "CapCuu",
    label: "Khoa Cấp Cứu",
    description: "Cấp cứu 24/7, hồi sức cấp cứu ban đầu",
    code: "CC",
  },
  {
    value: "B1_CTCH",
    label: "Khoa B1 - Chấn thương Chỉnh hình",
    description: "Phẫu thuật cơ xương khớp, thay khớp, nội soi khớp",
    code: "B1",
  },
  {
    value: "B2_NgoaiChung",
    label: "Khoa B2 - Ngoại Chung",
    description: "Ngoại tiêu hóa, gan mật tụy, ngoại tiết niệu, phẫu thuật nội soi",
    code: "B2",
  },
  {
    value: "A1_TimThan",
    label: "Khoa A1 - Nội Tim - Thận - Khớp & Lọc Máu",
    description: "Điều trị tim mạch, thận nhân tạo, bệnh lý khớp chuyên sâu",
    code: "A1",
  },
  {
    value: "A2_TieuHoa",
    label: "Khoa A2 - Nội Tiêu Hóa & Bệnh Máu",
    description: "Nội soi tiêu hóa, bệnh lý gan mật tụy và huyết học",
    code: "A2",
  },
  {
    value: "A3_ThanKinh",
    label: "Khoa A3 - Nội Thần Kinh",
    description: "Bệnh lý mạch máu não, thần kinh ngoại biên, đau đầu mãn tính",
    code: "A3",
  },
  {
    value: "A4_TruyenNhiem",
    label: "Khoa A4 - Truyền Nhiễm & Da Liễu",
    description: "Chăm sóc điều trị các bệnh truyền nhiễm và da liễu",
    code: "A4",
  },
  {
    value: "A5_YhocCoTruyen",
    label: "Khoa A5 - Y Học Cổ Truyền",
    description: "Châm cứu, bấm huyệt, phục hồi chức năng kết hợp y học hiện đại",
    code: "A5",
  },
  {
    value: "SanAnDong",
    label: "Khoa Phụ Sản An Đông",
    description: "Khám thai, sinh dịch vụ, chăm sóc mẹ và bé chất lượng cao",
    code: "AD",
  },
  {
    value: "LienChuyenKhoa",
    label: "Khoa Mắt - Tai Mũi Họng - Răng Hàm Mặt",
    description: "Khám và điều trị kỹ thuật cao các chuyên khoa lẻ",
    code: "LCK",
  },
  {
    value: "CDHA_XetNghiem",
    label: "Khoa Chẩn Đoán Hình Ảnh & Xét Nghiệm",
    description: "Chụp MRI, CT-Scanner, siêu âm màu 4D, xét nghiệm sinh hóa - miễn dịch",
    code: "CLS",
  },
  {
    value: "KyThuatCao",
    label: "Khu Điều Trị Kỹ Thuật Cao",
    description: "Chăm sóc theo yêu cầu, phòng bệnh tiện nghi, dịch vụ toàn diện",
    code: "KTC",
  },
];

export const DEPARTMENT_GROUPS = [
  {
    id: "tiepdon",
    name: "Khối Khám bệnh & Cấp cứu",
    description: "Khoa Khám Bệnh, Khoa Cấp Cứu ban đầu",
    deptValues: ["KhamBenh", "CapCuu"],
  },
  {
    id: "noi",
    name: "Khối Nội khoa",
    description: "Nội Tim - Thận, Tiêu hóa, Thần kinh, Truyền nhiễm, Y học cổ truyền",
    deptValues: ["A1_TimThan", "A2_TieuHoa", "A3_ThanKinh", "A4_TruyenNhiem", "A5_YhocCoTruyen"],
  },
  {
    id: "ngoai_san",
    name: "Khối Ngoại khoa & Sản - Chuyên khoa",
    description: "Chấn thương chỉnh hình, Ngoại tiêu hóa, Phụ sản An Đông, Mắt - TMH - RHM",
    deptValues: ["B1_CTCH", "B2_NgoaiChung", "SanAnDong", "LienChuyenKhoa"],
  },
  {
    id: "canlamsang",
    name: "Khối Cận lâm sàng & Kỹ thuật cao",
    description: "Chẩn đoán hình ảnh (MRI, CT), Xét nghiệm, Khu kỹ thuật cao",
    deptValues: ["CDHA_XetNghiem", "KyThuatCao"],
  },
];

export const CRITERIA_GROUPS = [
  {
    id: "c1_access",
    title: "1. Khả năng tiếp cận & Thời gian chờ",
    subtitle: "Chỉ dẫn, đón tiếp & thời gian làm thủ tục",
    description:
      "Biển chỉ dẫn rõ ràng, nhân viên lễ tân hướng dẫn tận tình, thời gian chờ khám và xét nghiệm hợp lý.",
  },
  {
    id: "c2_transparency",
    title: "2. Minh bạch thông tin & Chi phí",
    subtitle: "Giải thích bệnh án, chi phí BHYT & viện phí",
    description:
      "Bác sĩ tư vấn rõ ràng về phác đồ, công khai đơn thuốc và chi phí khám chữa bệnh minh bạch.",
  },
  {
    id: "c3_facilities",
    title: "3. Cơ sở vật chất & Môi trường",
    subtitle: "Vệ sinh, ghế chờ, máy lạnh & trật tự",
    description:
      "Không gian thoáng mát, phòng vệ sinh sạch sẽ, trang thiết bị máy móc hiện đại và tiện nghi.",
  },
  {
    id: "c4_attitude",
    title: "4. Thái độ phục vụ & Giao tiếp",
    subtitle: "Y bác sĩ & điều dưỡng quân y chu đáo, nhã nhặn",
    description:
      "Tinh thần trách nhiệm của người lính quân y: ân cần, tôn trọng, giải thích chu đáo cho người bệnh.",
  },
  {
    id: "c5_outcome",
    title: "5. Kết quả & Hài lòng chung",
    subtitle: "Hiệu quả điều trị & mức độ an tâm",
    description:
      "Sự an tâm khi điều trị tại Bệnh viện Quân y 7A và niềm tin vào chất lượng y tế của Quân đội.",
  },
];

export const QUICK_TAGS_POSITIVE = [
  "Bác sĩ tận tâm, chuyên môn giỏi",
  "Điều dưỡng chu đáo, hòa nhã",
  "Cơ sở khang trang, sạch sẽ",
  "Chỉ dẫn đón tiếp rõ ràng",
  "Thủ tục BHYT nhanh chóng",
  "Phòng khám mát mẻ, tiện nghi",
  "Giải thích đơn thuốc kỹ lưỡng",
  "Trang thiết bị hiện đại",
];

export const QUICK_TAGS_IMPROVEMENT = [
  "Thời gian chờ kết quả xét nghiệm còn lâu",
  "Cần bổ sung thêm ghế ngồi chờ tại sảnh",
  "Khu vệ sinh cần dọn dẹp thường xuyên hơn",
  "Bãi giữ xe cần biển chỉ dẫn rõ hơn",
  "Cần thêm quầy hướng dẫn phát số tự động",
  "Loa gọi tên ở khu vực đông người khó nghe",
  "Mong muốn thêm bình nước uống miễn phí",
];
