import {
  AcademyCourse,
  OfficialCertification,
  OfficialHireProfile,
  DisputeRequest,
  LivestreamChannel,
} from "@/lib/types";

// ==========================================
// 1. ACADEMY COURSES & EXAMS MOCK DATA
// ==========================================

export const mockAcademyCourses: AcademyCourse[] = [
  {
    id: "course-lvl1-table",
    title: "Level 1: Table Official Fundamentals & FIBA 24-Second Rules",
    level: "LEVEL_1",
    levelDisplay: "ระดับ 1: พื้นฐานกรรมการโต๊ะเทคนิค",
    durationMinutes: 180,
    modulesCount: 6,
    enrolledCount: 342,
    badgeName: "Certified Table Official (Level 1)",
    description:
      "หลักสูตรเรียนรู้งานโต๊ะเทคนิคบาสเกตบอลตามกติกา FIBA 2026: การนับช็อตคล็อก 24/14 วินาที, การสลับครองบอล (Alternating Possession Arrow), การบันทึกใบบันทึกคะแนนอิเล็กทรอนิกส์ และสัญญาณมือผู้ตัดสิน",
    examRequired: true,
    isCompleted: false,
  },
  {
    id: "course-lvl2-console",
    title: "Level 2: StatCourt Courtside Console & Live Event Timestamping",
    level: "LEVEL_2",
    levelDisplay: "ระดับ 2: ผู้ควบคุมระบบ Console สดข้างสนาม",
    durationMinutes: 240,
    modulesCount: 8,
    enrolledCount: 188,
    badgeName: "StatCourt Certified Console Operator",
    description:
      "เจาะลึกการใช้ระบบ StatCourt Console ในสภาวะ Offline-First (IndexedDB), การซิงค์วิดีโอคลิป 0-Second Latency, การตรวจแก้เหตุการณ์ย้อนหลัง (Audit Trail) และการคำนวณ FIBA Efficiency แบบเรียลไทม์",
    examRequired: true,
    isCompleted: true,
  },
  {
    id: "course-lvl3-commissioner",
    title: "Level 3: Match Commissioner & Instant Video Review Protocol",
    level: "LEVEL_3",
    levelDisplay: "ระดับ 3: ผู้ตรวจประเมินแมตช์และระบบชาเลนจ์วิดีโอ",
    durationMinutes: 300,
    modulesCount: 10,
    enrolledCount: 64,
    badgeName: "Senior Match Commissioner & Video Reviewer",
    description:
      "ขั้นตอนการตัดสินข้อพิพาท (Dispute Resolution Protocol), กฎการตรวจสอบ Instant Replay System (IRS), การบริหารจัดการความประพฤติ และการตรวจเช็กคุณสมบัตินักกีฬาผ่าน Digital Pass",
    examRequired: true,
    isCompleted: false,
  },
];

export interface ExamQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const mockExamQuestions: ExamQuestion[] = [
  {
    id: 1,
    question: "กรณีที่ลูกบอลกระทบห่วง (Rim) หลังการพยายามยิงประตู และทีมบุกสามารถแย่งลูกรีบาวด์เกมรุก (Offensive Rebound) ได้ ช็อตคล็อก (Shot Clock) จะต้องรีเซ็ตเป็นกี่วินาที?",
    options: ["24 วินาที", "14 วินาที", "ไม่รีเซ็ต ปล่อยให้เวลาเดินต่อ", "รีเซ็ตตามดุลยพินิจของผู้ตัดสิน"],
    correctIndex: 1,
    explanation: "ตามกติกา FIBA มาตรฐาน เมื่อลูกบอลสัมผัสห่วงแล้วทีมฝ่ายรุกแย่งรีบาวด์ได้ในแดนหน้า ช็อตคล็อกจะรีเซ็ตที่ 14 วินาที",
  },
  {
    id: 2,
    question: "เมื่อเกิดสถานการณ์ลูกยึด (Held Ball / Jump Ball) ทิศทางการครอบครองบอลครั้งถัดไปจะถูกกำหนดโดยสิ่งใด?",
    options: [
      "กระโดดแย่งบอลใหม่ที่วงกลมกลางสนามทุกครั้ง",
      "ลูกศรสลับการครอบครองบอล (Alternating Possession Arrow)",
      "ทีมที่เป็นเจ้าบ้านได้สิทธิ์ครองบอล",
      "ทีมที่เสียฟาวล์น้อยกว่าในควอเตอร์นั้น",
    ],
    correctIndex: 1,
    explanation: "FIBA ใช้ระบบลูกศรสลับการครอบครองบอล (Possession Arrow) เพื่อความรวดเร็วและเป็นธรรม",
  },
  {
    id: 3,
    question: "หากผู้เล่นยิงประตู 3 แต้ม ปลายเท้าเหยียบสัมผัสเส้นโค้ง 3 คะแนนเพียงเล็กน้อยขณะปล่อยบอล จะนับเป็นแต้มประเภทใดหากลูกลงห่วง?",
    options: [
      "3 คะแนนเต็ม เพราะตัวลอยอยู่ในอากาศ",
      "2 คะแนน เพราะเท้าสัมผัสเส้นซึ่งถือเป็นส่วนหนึ่งของพื้นที่ 2 คะแนน",
      "ไม่อนุญาตให้นับแต้มและถือเป็น Turnover",
      "ผู้ตัดสินต้องหยุดเวลาและเป่า Jump Ball ทันที",
    ],
    correctIndex: 1,
    explanation: "เส้น 3 คะแนนถือเป็นส่วนหนึ่งของพื้นที่ 2 คะแนน หากส่วนใดของร่างกายสัมผัสเส้นขณะปล่อยบอล ให้นับเป็น 2 คะแนน",
  },
  {
    id: 4,
    question: "ในระบบ StatCourt Console หากสัญญาณอินเทอร์เน็ตที่โรงยิมดับกระทันหัน ข้อมูลสถิติของโต๊ะเทคนิคจะสูญหายหรือไม่?",
    options: [
      "สูญหายทันที ต้องเริ่มบันทึกใหม่ทั้งหมด",
      "ไม่สูญหาย เพราะระบบจัดเก็บแบบ Offline-Ready บน IndexedDB และซิงค์ขึ้น Cloud อัตโนมัติเมื่อเน็ตกลับมา",
      "สูญหายเฉพาะวิดีโอคลิป แต่ตัวเลขสถิติยังอยู่",
      "ระบบจะล็อกหน้าจอไม่ให้ใช้งานต่อจนกว่าจะมีสัญญาณ Wi-Fi",
    ],
    correctIndex: 1,
    explanation: "StatCourt Console ออกแบบตามหลัก Offline-First Architecture ข้อมูล 100% บันทึกลง Local IndexedDB และมี Reversible Audit Trail",
  },
  {
    id: 5,
    question: "โค้ชทีมมีสิทธิ์ยื่นคำร้องประท้วงข้อผิดพลาดของแต้มหรือฟาวล์ (Dispute / Protest) ได้ภายในเวลาเท่าใดหลังสิ้นสุดสัญญาณเสียงจบเกม?",
    options: [
      "ภายใน 15 นาที พร้อมให้กัปตันทีมลงนามในใบบันทึกทางการ",
      "ภายใน 24 ชั่วโมงผ่านทางอีเมล",
      "ไม่สามารถยื่นได้หากเกมจบลงแล้ว",
      "ต้องยื่นในระหว่างเวลาพักครึ่งเท่านั้น",
    ],
    correctIndex: 0,
    explanation: "ตามระเบียบการแข่งขัน FIBA กัปตันทีมต้องลงนามประท้วงในช่องที่กำหนดทันทีหลังเกมจบ และยื่นหลักฐานภายใน 15 นาที",
  },
];

// ==========================================
// 2. CERTIFIED OFFICIALS DIRECTORY
// ==========================================

export const mockOfficialsRoster: OfficialHireProfile[] = [
  {
    id: "off-01",
    name: "วิชัย ศรีเจริญสุข (Wichai S.)",
    licenseNumber: "BSAT-OFF-2026-0042",
    tier: "NATIONAL_A",
    rating: 4.95,
    matchesOfficiated: 148,
    dailyRateThb: 1500,
    province: "กรุงเทพมหานคร",
    isAvailable: true,
    specialization: "Chief Table Commissioner & 24s Shot Clock Lead",
  },
  {
    id: "off-02",
    name: "สุธีรา ปัญญาไพศาล (Sutheera P.)",
    licenseNumber: "BSAT-OFF-2026-0089",
    tier: "NATIONAL_A",
    rating: 4.90,
    matchesOfficiated: 112,
    dailyRateThb: 1200,
    province: "กรุงเทพมหานคร",
    isAvailable: true,
    specialization: "FIBA LiveStats & Official Electronic Scoresheet",
  },
  {
    id: "off-03",
    name: "กิตติศักดิ์ ชัยชนะ (Kittisak C.)",
    licenseNumber: "BSAT-OFF-2026-0155",
    tier: "REGIONAL_B",
    rating: 4.82,
    matchesOfficiated: 76,
    dailyRateThb: 1000,
    province: "นนทบุรี",
    isAvailable: false,
    specialization: "Game Clock & Fouls / Substitution Control",
  },
  {
    id: "off-04",
    name: "ธนวัฒน์ รุ่งอรุณ (Thanawat R.)",
    licenseNumber: "BSAT-OFF-2026-0210",
    tier: "REGIONAL_B",
    rating: 4.78,
    matchesOfficiated: 54,
    dailyRateThb: 900,
    province: "ปทุมธานี",
    isAvailable: true,
    specialization: "StatCourt Console Operator & Instant Video Tagger",
  },
];

// ==========================================
// 3. DISPUTE & VIDEO REVIEW REQUESTS MOCK
// ==========================================

export const mockDisputeRequests: DisputeRequest[] = [
  {
    id: "disp-2026-0881",
    matchId: "match-bcc-ds-01",
    tournamentName: "TOA Youth Basketball League Thailand 2026",
    requestingTeam: "Debsirin School",
    quarter: 4,
    gameClock: "00:01",
    videoElapsedSec: 425,
    disputeType: "CLOCK_EXPIRATION",
    description:
      "ขอตรวจสอบว่าลูกยิง 2 คะแนนของ #7 BCC ปล่อยบอลออกจากมือก่อนสัญญาณไฟสีแดงของ Shot Clock สว่างขึ้นหรือไม่ในช่วง 1.5 วินาทีสุดท้าย",
    status: "UPHELD_CALL_STANDS",
    commissionerNotes:
      "คณะกรรมการได้เปิดดู Replay เฟรมต่อเฟรมที่ความเร็ว 60fps พบว่าลูกบอลหลุดออกจากปลายนิ้วผู้เล่น ณ เวลาเหลือ 0.2 วินาที ก่อนสัญญาณไฟสีแดงติด การตัดสินในสนามถูกต้อง ให้คะแนนคงเดิม 78-76",
    resolvedAt: "2026-09-24 17:45",
  },
  {
    id: "disp-2026-0882",
    matchId: "match-act-ds-02",
    tournamentName: "TOA Youth Basketball League Thailand 2026",
    requestingTeam: "Assumption College Thonburi",
    quarter: 2,
    gameClock: "04:15",
    videoElapsedSec: 182,
    disputeType: "FOOT_ON_LINE_3PT",
    description:
      "ตรวจสอบลูกยิง 3 คะแนนของฝ่ายตรงข้ามว่าเท้าสัมผัสเส้นโค้ง 3 คะแนนหรือไม่ เพื่อปรับแก้จาก 3 คะแนนเป็น 2 คะแนน",
    status: "ADJUSTED_OVERTURNED",
    commissionerNotes:
      "กล้องฝั่ง Floor Cam บันทึกเห็นชัดเจนว่าส้นเท้าขวาสัมผัสเส้นขอบสีขาว คณะกรรมการจึงปรับแก้ใน StatCourt Console จาก 3 แต้มเป็น 2 แต้ม พร้อมลงบันทึก Audit Log ทางการ",
    resolvedAt: "2026-09-22 15:10",
  },
];

// ==========================================
// 4. LIVESTREAM & DIGITAL PROGRAM MOCK
// ==========================================

export const mockLivestreamChannel: LivestreamChannel = {
  id: "live-toa-quarterfinal-01",
  matchId: "match-bcc-ds-01",
  matchTitle: "Bangkok Christian College vs Debsirin School (Quarterfinals)",
  tournamentName: "TOA Youth Basketball League Thailand 2026",
  isLive: true,
  viewersCount: 2840,
  priceThb: 0, // Free Broadcast supported by TOA
  currentScore: {
    home: 75,
    away: 63,
    quarter: 4,
    clock: "05:20",
  },
  arenaLocation: "อาคารนิมิบุตร สนามกีฬาแห่งชาติ ปทุมวัน กรุงเทพฯ",
  availableAngles: [
    { id: "cam-main", name: "กล้องหลักมุมกว้าง (Tactical High Wide)", isSelected: true },
    { id: "cam-floor", name: "กล้องระดับคอร์ท (Courtside Floor Cam)", isSelected: false },
    { id: "cam-hoop", name: "กล้องหลังแป้นบาส (Behind Rim Action)", isSelected: false },
  ],
};
