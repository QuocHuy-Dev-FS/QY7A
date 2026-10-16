import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "feedbacks.json");

const SEED_FEEDBACKS = [
  {
    id: "FB-7A-101",
    patientCode: "BN-7A-8821",
    isAnonymous: false,
    department: "Khoa Khám Bệnh",
    departmentKey: "KhamBenh",
    scores: {
      c1_access: 4,
      c2_transparency: 5,
      c3_facilities: 4,
      c4_attitude: 5,
      c5_outcome: 5,
    },
    csatPercent: 92,
    npsScore: 10,
    npsCategory: "Promoter",
    urgentFeedback: "",
    comment:
      "Bác sĩ phòng khám tim mạch giải thích phác đồ rất tỉ mỉ, thái độ quân y mẫu mực, tôi rất an tâm khi khám tại 7A.",
    hasUrgentAlert: false,
    status: "resolved",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    timeAgo: "45 phút trước",
  },
  {
    id: "FB-7A-102",
    patientCode: "Ẩn danh",
    isAnonymous: true,
    department: "Khoa Cấp Cứu",
    departmentKey: "CapCuu",
    scores: {
      c1_access: 4,
      c2_transparency: 4,
      c3_facilities: 3,
      c4_attitude: 4,
      c5_outcome: 4,
    },
    csatPercent: 76,
    npsScore: 8,
    npsCategory: "Passive",
    urgentFeedback:
      "Khu vực sảnh chờ xét nghiệm cận lâm sàng vào buổi sáng quá đông, cần thêm ghế ngồi chờ và quầy nước uống.",
    comment: "Đội ngũ y bác sĩ cấp cứu phản ứng nhanh, kịp thời.",
    hasUrgentAlert: true,
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    timeAgo: "2 giờ trước",
  },
  {
    id: "FB-7A-103",
    patientCode: "CCCD-079093012345",
    isAnonymous: false,
    department: "Khoa Phụ Sản An Đông",
    departmentKey: "SanAnDong",
    scores: {
      c1_access: 5,
      c2_transparency: 5,
      c3_facilities: 5,
      c4_attitude: 5,
      c5_outcome: 5,
    },
    csatPercent: 100,
    npsScore: 10,
    npsCategory: "Promoter",
    urgentFeedback: "",
    comment:
      "Khoa Sản An Đông dịch vụ xuất sắc, phòng sinh gia đình tiện nghi, nữ hộ sinh chăm sóc bé sơ sinh rất nhẹ nhàng.",
    hasUrgentAlert: false,
    status: "resolved",
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    timeAgo: "5 giờ trước",
  },
  {
    id: "FB-7A-104",
    patientCode: "BN-7A-4190",
    isAnonymous: false,
    department: "Khoa B1 - Chấn thương Chỉnh hình",
    departmentKey: "B1_CTCH",
    scores: {
      c1_access: 4,
      c2_transparency: 5,
      c3_facilities: 4,
      c4_attitude: 5,
      c5_outcome: 5,
    },
    csatPercent: 92,
    npsScore: 9,
    npsCategory: "Promoter",
    urgentFeedback: "",
    comment:
      "Phẫu thuật nối dây chằng khớp gối thành công tốt đẹp, bác sĩ giải thích phương pháp tập phục hồi chức năng chu đáo.",
    hasUrgentAlert: false,
    status: "resolved",
    createdAt: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    timeAgo: "Hôm qua",
  },
];

let memoryFeedbacks = [...SEED_FEEDBACKS];

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(SEED_FEEDBACKS, null, 2), "utf8");
    }
  } catch {
    // Fallback to memory
  }
}

export function getAllFeedbacks() {
  ensureDataFile();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf8");
      const list = JSON.parse(data);
      if (Array.isArray(list) && list.length > 0) {
        memoryFeedbacks = list;
        return list;
      }
    }
  } catch {
    // Return memory fallback
  }
  return memoryFeedbacks;
}

export function saveFeedback(newRecord) {
  ensureDataFile();
  const feedbacks = getAllFeedbacks();
  const idNumber = feedbacks.length + 101;
  const item = {
    id: `FB-7A-${idNumber}`,
    ...newRecord,
    status: "pending",
    timeAgo: "Vừa xong",
  };

  feedbacks.unshift(item);
  memoryFeedbacks = feedbacks;

  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(feedbacks, null, 2), "utf8");
  } catch {
    // Keep in memory
  }

  return item;
}

export function updateFeedbackStatus(id, newStatus) {
  ensureDataFile();
  const feedbacks = getAllFeedbacks();
  const target = feedbacks.find((f) => f.id === id);
  if (target) {
    target.status = newStatus;
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(feedbacks, null, 2), "utf8");
    } catch {
      // Keep in memory
    }
    return true;
  }
  return false;
}
