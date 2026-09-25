import {
  PlaybookPlay,
  PracticeSession,
  OppositionReport,
  PlayerWorkload,
  InjuryLogItem,
  Position,
} from "@/lib/types";

// ==========================================
// 1. DIGITAL 2D ANIMATED PLAYBOOK MOCK DATA
// ==========================================

export const mockPlaybookPlays: PlaybookPlay[] = [
  {
    id: "play-horns-flare",
    title: "Horns Flare 3-Point Action",
    category: "OFFENSE",
    tags: ["Early Offense", "Flare Screen", "3-Point Creation", "Horns Set"],
    description:
      "เซ็ต Horns วางผู้เล่นเบอร์ 4 และ 5 ไว้ที่ข้อศอก (Elbows) ตัวถือบอล (1) จ่ายให้ 4 แล้วสกรีน Flare ให้ 2 สลับขึ้นมายิง 3 แต้มตรงหัวกะโหลก",
    keyCoachingPoint:
      "เบอร์ 5 ต้องตั้งสกรีนค้างให้แน่น และเบอร์ 2 ต้องหลอกสปีดสับขาตัดขึ้นมุม 45 องศาเพื่อสร้าง Catch-and-Shoot Rhythm",
    steps: [
      {
        stepIndex: 1,
        title: "Initial Horns Alignment",
        description: "1 ถือบอลหัวกะโหลก, 4 และ 5 ยืนที่ข้อศอกทั้งสองข้าง, 2 และ 3 ประจำที่มุมคอร์ท (Corners)",
        ballCarrierId: "1",
        players: [
          { id: "1", label: "1 (PG)", isOffense: true, x: 50, y: 78, action: "DRIBBLE" },
          { id: "2", label: "2 (SG)", isOffense: true, x: 12, y: 70, action: "SPOT_UP" },
          { id: "3", label: "3 (SF)", isOffense: true, x: 88, y: 70, action: "SPOT_UP" },
          { id: "4", label: "4 (PF)", isOffense: true, x: 35, y: 48, action: "SPOT_UP" },
          { id: "5", label: "5 (C)", isOffense: true, x: 65, y: 48, action: "SPOT_UP" },
          { id: "x1", label: "x1", isOffense: false, x: 50, y: 72 },
          { id: "x2", label: "x2", isOffense: false, x: 16, y: 65 },
          { id: "x4", label: "x4", isOffense: false, x: 38, y: 42 },
          { id: "x5", label: "x5", isOffense: false, x: 62, y: 42 },
        ],
      },
      {
        stepIndex: 2,
        title: "Entry Pass to Elbow & Flare Screen Action",
        description: "1 จ่ายบอลให้ 4 ที่ Elbow ซ้าย จากนั้น 5 วิ่งข้ามมาตั้ง Flare Screen ให้ 2 ที่วิ่งตัดขึ้นมา",
        ballCarrierId: "4",
        players: [
          { id: "1", label: "1 (PG)", isOffense: true, x: 42, y: 65, action: "PASS" },
          { id: "2", label: "2 (SG)", isOffense: true, x: 30, y: 62, action: "CUT" },
          { id: "3", label: "3 (SF)", isOffense: true, x: 90, y: 72, action: "SPOT_UP" },
          { id: "4", label: "4 (PF)", isOffense: true, x: 35, y: 46, action: "SPOT_UP" },
          { id: "5", label: "5 (C)", isOffense: true, x: 42, y: 55, action: "SCREEN" },
          { id: "x1", label: "x1", isOffense: false, x: 40, y: 60 },
          { id: "x2", label: "x2", isOffense: false, x: 26, y: 56 },
          { id: "x5", label: "x5", isOffense: false, x: 50, y: 50 },
        ],
      },
      {
        stepIndex: 3,
        title: "Catch & Shoot / Roll to Basket",
        description: "4 จ่ายบอล Skip Pass ให้ 2 ชูต 3 แต้มว่างๆ หรือถ้าตัวประกบ Switch เบอร์ 5 จะ Slip ว่างใต้แป้นทันที",
        ballCarrierId: "2",
        players: [
          { id: "1", label: "1 (PG)", isOffense: true, x: 20, y: 72, action: "SPOT_UP" },
          { id: "2", label: "2 (SG)", isOffense: true, x: 48, y: 72, action: "SPOT_UP" },
          { id: "3", label: "3 (SF)", isOffense: true, x: 92, y: 72, action: "SPOT_UP" },
          { id: "4", label: "4 (PF)", isOffense: true, x: 32, y: 44, action: "SPOT_UP" },
          { id: "5", label: "5 (C)", isOffense: true, x: 50, y: 25, action: "CUT" },
          { id: "x1", label: "x1", isOffense: false, x: 24, y: 66 },
          { id: "x2", label: "x2", isOffense: false, x: 44, y: 64 },
          { id: "x5", label: "x5", isOffense: false, x: 52, y: 32 },
        ],
      },
    ],
  },
  {
    id: "play-spain-pnr",
    title: "Spain Pick & Roll (Stack Action)",
    category: "OFFENSE",
    tags: ["High PnR", "Back Screen", "Spain Action", "Rim Attack"],
    description:
      "การเล่นพิคแอนด์โรลระดับสูง 1 เล่นกับ 5 บนยอดหัวกะโหลก ขณะที่ 2 วิ่งขึ้นมาตั้ง Back Screen สกัดตัวประกบของ 5 ที่กำลังโรลเข้าหาห่วง",
    keyCoachingPoint:
      "สร้างความสับสน 3 ทางให้คู่แข่ง: 1 ไดรฟ์เข้าหาแป้น, 5 โรลโล่งๆ รับแอลลีย์อูป, หรือ 2 ป๊อปออกมายิง 3 แต้ม",
    steps: [
      {
        stepIndex: 1,
        title: "Initiation: Ball Screen & Stack Setup",
        description: "1 ถือบอลหัวกะโหลก 5 ขึ้นมาตั้งสกรีนหน้า ขณะที่ 2 ยืนซ้อนหลัง (Stack) เตรียมสกรีนตัวประกบของ 5",
        ballCarrierId: "1",
        players: [
          { id: "1", label: "1 (PG)", isOffense: true, x: 50, y: 80, action: "DRIBBLE" },
          { id: "2", label: "2 (SG)", isOffense: true, x: 50, y: 55, action: "SPOT_UP" },
          { id: "3", label: "3 (SF)", isOffense: true, x: 10, y: 68, action: "SPOT_UP" },
          { id: "4", label: "4 (PF)", isOffense: true, x: 90, y: 68, action: "SPOT_UP" },
          { id: "5", label: "5 (C)", isOffense: true, x: 54, y: 70, action: "SCREEN" },
          { id: "x1", label: "x1", isOffense: false, x: 48, y: 74 },
          { id: "x5", label: "x5", isOffense: false, x: 56, y: 64 },
          { id: "x2", label: "x2", isOffense: false, x: 46, y: 50 },
        ],
      },
      {
        stepIndex: 2,
        title: "Backscreen Collision & Triple Threat Exit",
        description: "1 ไดรฟ์ฉีกขวา 5 โรลเข้าหาแป้นชนสกรีนของ 2 ส่งผลให้ตัวป้องกันห่วงของคู่แข่งสะดุดล้มหรือตามไม่ทัน",
        ballCarrierId: "1",
        players: [
          { id: "1", label: "1 (PG)", isOffense: true, x: 68, y: 52, action: "DRIBBLE" },
          { id: "2", label: "2 (SG)", isOffense: true, x: 48, y: 72, action: "CUT" },
          { id: "3", label: "3 (SF)", isOffense: true, x: 10, y: 68, action: "SPOT_UP" },
          { id: "4", label: "4 (PF)", isOffense: true, x: 88, y: 68, action: "SPOT_UP" },
          { id: "5", label: "5 (C)", isOffense: true, x: 52, y: 22, action: "CUT" },
          { id: "x1", label: "x1", isOffense: false, x: 62, y: 54 },
          { id: "x5", label: "x5", isOffense: false, x: 52, y: 44 },
          { id: "x2", label: "x2", isOffense: false, x: 45, y: 62 },
        ],
      },
    ],
  },
  {
    id: "play-blob-elevator",
    title: "BLOB Elevator Door Screen",
    category: "INBOUND",
    tags: ["Baseline Out of Bounds", "Elevator Screen", "Shooter Release"],
    description:
      "แผนส่งบอลจากใต้แป้นฝั่งรุก 2 วิ่งแทรกทะลุผ่านช่องระหว่าง 4 และ 5 ก่อนที่ทั้งคู่จะปิดประตูกระแทกสกัดตัวประกบของ 2",
    keyCoachingPoint:
      "ตัวส่งบอล (3) ต้องมองหลอกที่ห่วงก่อนสะบัดข้อมือส่งข้ามหัวให้ 2 ที่หลุดออกมาโล่งตรงหัวกะโหลก",
    steps: [
      {
        stepIndex: 1,
        title: "Box Alignment on Baseline",
        description: "3 ถือบอลส่งใต้แป้น, 1 และ 2 ยืนแถวหน้า, 4 และ 5 ยืนแถวหลังพร้อมเป็นประตูกล",
        ballCarrierId: "3",
        players: [
          { id: "3", label: "3 (SF)", isOffense: true, x: 50, y: 4, action: "PASS" },
          { id: "1", label: "1 (PG)", isOffense: true, x: 25, y: 25, action: "SPOT_UP" },
          { id: "2", label: "2 (SG)", isOffense: true, x: 50, y: 20, action: "CUT" },
          { id: "4", label: "4 (PF)", isOffense: true, x: 44, y: 50, action: "SCREEN" },
          { id: "5", label: "5 (C)", isOffense: true, x: 56, y: 50, action: "SCREEN" },
        ],
      },
      {
        stepIndex: 2,
        title: "Doors Close & Shoot",
        description: "2 วิ่งพุ่งผ่าน 4 และ 5 ทันทีที่ผ่าน 4 กับ 5 ขยับหนีบติดกันปิดประตูลิฟต์ ปล่อย 2 รับบอลยิง 3 แต้มไร้ตัวประกบ",
        ballCarrierId: "2",
        players: [
          { id: "3", label: "3 (SF)", isOffense: true, x: 45, y: 10, action: "SPOT_UP" },
          { id: "1", label: "1 (PG)", isOffense: true, x: 15, y: 35, action: "SPOT_UP" },
          { id: "2", label: "2 (SG)", isOffense: true, x: 50, y: 72, action: "SPOT_UP" },
          { id: "4", label: "4 (PF)", isOffense: true, x: 48, y: 52, action: "SCREEN" },
          { id: "5", label: "5 (C)", isOffense: true, x: 52, y: 52, action: "SCREEN" },
        ],
      },
    ],
  },
];

// ==========================================
// 2. PRACTICE & ATTENDANCE MOCK DATA
// ==========================================

export const mockPracticeSessions: PracticeSession[] = [
  {
    id: "prac-2026-09-24",
    title: "Tactical Walkthrough & Set Plays Review",
    date: "2026-09-24",
    timeDisplay: "16:30 - 18:30 (120 นาที)",
    sessionType: "TACTICAL",
    location: "โรงยิมเนเซียมบาสเกตบอล 1 อาคารสิรินธร ร.ร.กรุงเทพคริสเตียนวิทยาลัย",
    coachInCharge: "โค้ชธีรพงศ์ อัศวชัย",
    roster: [
      {
        athleteId: "ath-1",
        athleteName: "Thanakorn Siriphan",
        jerseyNumber: 7,
        position: "POINT_GUARD" as Position,
        status: "PRESENT",
        checkInTime: "16:15",
        disciplineRating: 98.5,
      },
      {
        athleteId: "ath-2",
        athleteName: "Chayanon Wattana",
        jerseyNumber: 11,
        position: "SHOOTING_GUARD" as Position,
        status: "PRESENT",
        checkInTime: "16:22",
        disciplineRating: 95.0,
      },
      {
        athleteId: "ath-3",
        athleteName: "Kittipong Rattanachai",
        jerseyNumber: 24,
        position: "SMALL_FORWARD" as Position,
        status: "PRESENT",
        checkInTime: "16:10",
        disciplineRating: 100.0,
      },
      {
        athleteId: "ath-4",
        athleteName: "Wuttichai Somboon",
        jerseyNumber: 33,
        position: "POWER_FORWARD" as Position,
        status: "LATE",
        checkInTime: "16:42 (ติดสอบแล็บ)",
        disciplineRating: 90.0,
      },
      {
        athleteId: "ath-5",
        athleteName: "Sarun Pongpat",
        jerseyNumber: 45,
        position: "CENTER" as Position,
        status: "EXCUSED",
        checkInTime: "-",
        disciplineRating: 92.5,
      },
    ],
  },
  {
    id: "prac-2026-09-22",
    title: "Strength & Conditioning + Core Stability",
    date: "2026-09-22",
    timeDisplay: "06:30 - 08:00 (90 นาที)",
    sessionType: "STRENGTH_CONDITIONING",
    location: "ศูนย์เสริมสร้างสมรรถภาพทางกาย (BCC Fitness Center)",
    coachInCharge: "อ.ภาคภูมิ กายภาพบำบัด",
    roster: [
      {
        athleteId: "ath-1",
        athleteName: "Thanakorn Siriphan",
        jerseyNumber: 7,
        position: "POINT_GUARD" as Position,
        status: "PRESENT",
        checkInTime: "06:20",
        disciplineRating: 98.5,
      },
      {
        athleteId: "ath-2",
        athleteName: "Chayanon Wattana",
        jerseyNumber: 11,
        position: "SHOOTING_GUARD" as Position,
        status: "PRESENT",
        checkInTime: "06:25",
        disciplineRating: 95.0,
      },
      {
        athleteId: "ath-3",
        athleteName: "Kittipong Rattanachai",
        jerseyNumber: 24,
        position: "SMALL_FORWARD" as Position,
        status: "PRESENT",
        checkInTime: "06:18",
        disciplineRating: 100.0,
      },
      {
        athleteId: "ath-4",
        athleteName: "Wuttichai Somboon",
        jerseyNumber: 33,
        position: "POWER_FORWARD" as Position,
        status: "PRESENT",
        checkInTime: "06:28",
        disciplineRating: 90.0,
      },
      {
        athleteId: "ath-5",
        athleteName: "Sarun Pongpat",
        jerseyNumber: 45,
        position: "CENTER" as Position,
        status: "PRESENT",
        checkInTime: "06:22",
        disciplineRating: 92.5,
      },
    ],
  },
];

// ==========================================
// 3. OPPOSITION SCOUTING & TENDENCIES MOCK
// ==========================================

export const mockOppositionReport: OppositionReport = {
  id: "scout-rep-debsirin",
  targetMatchId: "match-bcc-ds-01",
  opponentTeam: "Debsirin School (โรงเรียนเทพศิรินทร์)",
  opponentShortName: "DS",
  tournamentName: "TOA Youth Basketball League Thailand 2026",
  matchDate: "2026-09-26 15:30",
  driveTendency: { rightPct: 74, leftPct: 26 },
  transitionPacePpg: 24.6,
  q3RatingDrop: -18.4,
  vulnerabilities: [
    "จุดบอดควอเตอร์ 3 (Q3 Slump): สถิติชี้ชัดว่าเกมรุกของเทพศิรินทร์แต้มตกฮวบ -18.4 ในควอเตอร์ 3 เมื่อผู้เล่นตัวหลักเริ่มล้าและม้านั่งสำรองทำแต้มไม่ต่อเนื่อง",
    "จุดอ่อนการป้องกัน Pick & Roll: ตัวประกบวงในถอยลึก (Deep Drop Coverage) ทำให้เปิดพื้นที่โล่งระยะ Mid-Range 15-18 ฟุต",
    "เสีย Turnover สูงเมื่อถูกดักแทร็ปขอบสนาม (Sideline Trap): การ์ดจ่ายมีแนวโน้มหยุดดริบเบิลเร็วเมื่อเจอการเพรสซิ่งแดนหน้า",
  ],
  keyPersonnel: [
    {
      number: 23,
      name: "Nattapat Sukprasert",
      position: "SG / SF (ตัวทำแต้มหลัก)",
      ppg: 22.4,
      eff: 24.1,
      keyTendency: "ชอบไดรฟ์มือขวา 82% และสเต็ปแบ็กยิง 3 แต้มถ้าถูกกันเลนวงใน",
      defensiveAssignment: "บีบให้ออกซ้าย (Force Left) และส่งตัวช่วยดับเบิลทีมทันทีเมื่อเขาดริบเบิลเข้าหาขอบเขตโทษ",
    },
    {
      number: 34,
      name: "Teerawat Prasertkul",
      position: "PF (รีบาวด์และตัดวงใน)",
      ppg: 15.2,
      eff: 21.6,
      keyTendency: "เล่นเกมรุกใต้แป้นแข็งแกร่ง มีอัตราการรีบาวด์เกมรุก (Off-Reb) เฉลี่ย 4.8 ครั้ง/เกม",
      defensiveAssignment: "Box-out อย่างเคร่งครัด ห้ามปล่อยให้วิ่งโฉบชาร์จกระดานเด็ดขาด",
    },
    {
      number: 1,
      name: "Korapat Wichaidit",
      position: "PG (ผู้คุมจังหวะ)",
      ppg: 6.8,
      eff: 11.2,
      keyTendency: "จ่ายบอลฉลาดแต่ความเร็วถอยลงเมื่อเข้าสู่ควอเตอร์ 4",
      defensiveAssignment: "เพรสซิ่งฟูลคอร์ทกดดันตั้งแต่นาทีแรกเพื่อผลาญพลังงาน",
    },
  ],
  gameplanRules: [
    { id: "rule-1", rule: "บีบให้เบอร์ 23 Nattapat เลี้ยงเข้ามือซ้ายตลอดเกม", isMustFollow: true },
    { id: "rule-2", rule: "เร่งสปีดเกม Transition ในช่วง 5 นาทีแรกของควอเตอร์ 3 เพื่อทิ้งห่างแต้ม", isMustFollow: true },
    { id: "rule-3", rule: "ใช้การป้องกัน Drop Screen แล้วคอนเทสต์ระยะยิง 3 แต้มมุมคอร์ท", isMustFollow: false },
    { id: "rule-4", rule: "Box-out หนักทุกเพลย์เพื่อจำกัดโอกาสทำแต้ม Second-Chance", isMustFollow: true },
  ],
};

// ==========================================
// 4. SPORTS SCIENCE: MINUTES, FATIGUE & INJURY
// ==========================================

export const mockPlayerWorkloads: PlayerWorkload[] = [
  {
    athleteId: "ath-1",
    athleteName: "Thanakorn Siriphan",
    jerseyNumber: 7,
    position: "POINT_GUARD" as Position,
    minutesLast7Days: 104,
    minutesLast14Days: 198,
    gamesPlayedLast7Days: 3,
    fatigueRisk: "HIGH",
    overuseWarning: "ลงเล่นเกิน 100 นาทีในรอบ 7 วัน (เสี่ยงกล้ามเนื้อต้นขาด้านหลัง Hamstring ล้าสะสม)",
    recoveryScore: 68,
  },
  {
    athleteId: "ath-2",
    athleteName: "Chayanon Wattana",
    jerseyNumber: 11,
    position: "SHOOTING_GUARD" as Position,
    minutesLast7Days: 78,
    minutesLast14Days: 142,
    gamesPlayedLast7Days: 3,
    fatigueRisk: "MODERATE",
    recoveryScore: 82,
  },
  {
    athleteId: "ath-3",
    athleteName: "Kittipong Rattanachai",
    jerseyNumber: 24,
    position: "SMALL_FORWARD" as Position,
    minutesLast7Days: 62,
    minutesLast14Days: 118,
    gamesPlayedLast7Days: 3,
    fatigueRisk: "LOW",
    recoveryScore: 92,
  },
  {
    athleteId: "ath-4",
    athleteName: "Wuttichai Somboon",
    jerseyNumber: 33,
    position: "POWER_FORWARD" as Position,
    minutesLast7Days: 72,
    minutesLast14Days: 130,
    gamesPlayedLast7Days: 3,
    fatigueRisk: "LOW",
    recoveryScore: 88,
  },
  {
    athleteId: "ath-5",
    athleteName: "Sarun Pongpat",
    jerseyNumber: 45,
    position: "CENTER" as Position,
    minutesLast7Days: 48,
    minutesLast14Days: 95,
    gamesPlayedLast7Days: 2,
    fatigueRisk: "LOW",
    recoveryScore: 95,
  },
];

export const mockInjuryLogs: InjuryLogItem[] = [
  {
    id: "inj-01",
    athleteId: "ath-4",
    athleteName: "Wuttichai Somboon",
    jerseyNumber: 33,
    injuryType: "Mild Right Ankle Inversion Sprain (ข้อเท้าขวาพลิก)",
    severity: "MILD",
    bodyPart: "Right Ankle",
    occurredDate: "2026-09-20",
    expectedReturnDate: "2026-09-27 (พร้อมลงแข่งแบบจำกัดนาที)",
    status: "QUESTIONABLE",
    treatmentProtocol: "ประคบเย็น R.I.C.E., พันเทปพยุง Kinesio Taping, ฝึกบริหาร Proprioception Balance Board",
  },
  {
    id: "inj-02",
    athleteId: "ath-5",
    athleteName: "Sarun Pongpat",
    jerseyNumber: 45,
    injuryType: "Left Knee Contusion (เข่าซ้ายฟกช้ำจากการปะทะ)",
    severity: "MILD",
    bodyPart: "Left Knee",
    occurredDate: "2026-09-18",
    expectedReturnDate: "2026-09-23 (ผ่านการประเมินทางการแพทย์แล้ว)",
    status: "RECOVERED",
    treatmentProtocol: "กายภาพบำบัดอัลตราซาวด์ลดอาการอักเสบ + สวมปลอกเข่า Neoprene Sleeve",
  },
];
