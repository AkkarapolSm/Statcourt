import { NewsArticle, PowerRankingItem, POTWData } from "@/lib/types";

export const mockNewsArticles: NewsArticle[] = [
  {
    id: "news-1",
    title: "'THIS TEAM IS SCARY' | RECAP: 2026 HIGH SCHOOL DERBY CLUTCH FINISH",
    slug: "bcc-debsirin-derby-recap-2026",
    category: "MATCH_RECAP",
    categoryDisplay: "MATCH RECAP",
    coverImage:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80",
    excerpt:
      "กรุงเทพคริสเตียน เฉือนชนะ เทพศิรินทร์ สุดระทึก 78-76 ใน 1.5 วินาทีสุดท้าย จากลูกซ้ำรีบาวด์เกมรุกของ Thanakorn ท่ามกลางเสียงเชียร์กึกก้องสนามนิมิบุตร",
    content: `
# 'THIS TEAM IS SCARY' | สรุปบิ๊กแมตช์ TOA U18 LEAGUE 2026

เกมบิ๊กแมตช์แห่งศักดิ์ศรีคู่เปิดฤดูกาล TOA Youth Basketball League Thailand 2026 ระหว่าง **กรุงเทพคริสเตียนวิทยาลัย (BCC)** พบกับ **โรงเรียนเทพศิรินทร์ (DS)** จบลงด้วยความมันระดับ 5 ดาว เมื่อ BCC เฉือนเอาชนะไปด้วยคะแนน **78 - 76**

### ไฮไลต์ช็อตตัดสินเกม (Game-Winning Play)
ช่วงเวลา 12 วินาทีสุดท้าย ขณะที่สกอร์เสมอกันอยู่ที่ 76-76 BCC ได้ครองบอลเปิดเกมบุก พอยต์การ์ดตัวเก่ง **ธนากร ศิริพันธุ์ (#7)** เล่นพิคแอนด์โรลเจาะเข้ากลาง ก่อนดีดบอลออกมุมขวา แม้จังหวะยิงสามแต้มแรกจะกระดอนแป้น แต่ธนากรที่สปรินต์ตามเข้ามา สลัดตัวประกบกระโดดคว้า Offensive Rebound กลางอากาศ และทิปอินลงไปขณะที่นาฬิกาเหลือเพียง **1.5 วินาที** ปลิดชีพคู่แข่งคว้าชัยชนะนัดประวัติศาสตร์

### สถิติสำคัญประจำเกม:
- **ธนากร ศิริพันธุ์ (BCC):** 28 แต้ม, 9 แอสซิสต์, 8 รีบาวด์, 4 สตีล (FIBA EFF: 34.0)
- **ณัฐภัทร สุขประเสริฐ (DS):** 31 แต้ม, 5 สามแต้ม, 6 รีบาวด์
- **คะแนนจากจังหวะ Fastbreak:** BCC 22 - DS 14
- **Rebounds รวม:** BCC 46 - DS 41
    `,
    author: "กองบรรณาธิการ StatCourt News",
    authorRole: "Senior Basketball Analyst",
    publishedAt: "28 นาทีที่แล้ว",
    readTime: "4 นาที",
    isFeatured: true,
    featuredHeroOrder: 1,
    relatedMatchId: "match-bcc-ds-01",
    clutchPlay: {
      quarterClock: "Q4 • 00:01.5",
      opponent: "เทพศิรินทร์ [Debsirin]",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      description: "ธนากร รีบาวด์เกมรุกพร้อมพัตแบ็กจังหวะสองในเสี้ยววินาทีสุดท้าย นำทีมเก็บชัยชนะ",
    },
  },
  {
    id: "news-2",
    title: "PLAYER OF THE WEEK: ธนากร ศิริพันธุ์ คว้าดาราเด่น U18 ค่า EFF ทะลุ 34.0",
    slug: "potw-thanakorn-siriphan-week-3",
    category: "PLAYER_SPOTLIGHT",
    categoryDisplay: "PLAYER OF THE WEEK",
    coverImage:
      "https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=800&q=80",
    excerpt:
      "พอยต์การ์ดกัปตันทีม BCC ระเบิดฟอร์มทำสถิติเฉลี่ย 24.5 PPG, 8.5 APG และค่า FIBA Efficiency สูงสุดในประเทศสัปดาห์นี้ พร้อมนำทีมไร้พ่าย 4 นัดรวด",
    content: `
ผลงานระดับมาสเตอร์พีซตลอด 2 เกมในสัปดาห์ที่ผ่านมา ทำให้ **ธนากร ศิริพันธุ์ (BCC)** ได้รับการคัดเลือกเป็น **StatCourt Player of the Week** ประจำสัปดาห์ที่ 3 ของการแข่งขัน TOA Youth Basketball League Thailand

เจ้าของเสื้อหมายเลข 7 วัย 18 ปี ไม่เพียงแต่ทำแต้มเฉลี่ยสูงถึง 24.5 แต้มต่อเกม แต่ยังมีอัตราการจ่ายบอลแอสซิสต์ต่อการเสียเทิร์นโอเวอร์ (AST/TO) สูงถึง 3.17 ซึ่งเป็นมาตรฐานระดับโปรลีก
    `,
    author: "BSAT Technical Committee",
    authorRole: "FIBA Certified Evaluator",
    publishedAt: "2 ชั่วโมงที่แล้ว",
    readTime: "3 นาที",
    isFeatured: true,
    featuredHeroOrder: 2,
    potwData: {
      athleteId: "ath-1",
      athleteName: "ธนากร ศิริพันธุ์ (Thanakorn)",
      athleteSchool: "Bangkok Christian College",
      ageCategory: "U18",
      avatarUrl:
        "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=400&q=80",
      effPerGame: 34.0,
      ppg: 28.0,
      rpg: 8.0,
      apg: 9.0,
      spg: 4.0,
      bpg: 1.0,
      fgPct: 56.4,
      quote:
        "ชัยชนะของทีมสำคัญกว่าตัวเลขสถิติส่วนตัวเสมอ เรามุ่งมั่นเพื่อตั๋วโควตากีฬา TCAS และแชมป์ระดับประเทศ",
    },
  },
  {
    id: "news-3",
    title: "TEAM POWER RANKINGS ประจำเดือนกันยายน: สวนกุหลาบฯ ฟอร์มดุพุ่งขึ้นท็อป 3",
    slug: "highschool-power-rankings-september-2026",
    category: "POWER_RANKING",
    categoryDisplay: "POWER RANKINGS",
    coverImage:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
    excerpt:
      "อัปเดตอันดับ 10 ทีมโรงเรียนมัธยมปลายฟอร์มแรงทั่วประเทศ กรุงเทพคริสเตียนยังครองบัลลังก์เบอร์ 1 ขณะที่สวนกุหลาบฯ ขยับขึ้น 2 อันดับหลังชนะรวด 5 เกม",
    content: `
การประเมินอันดับทีมฟอร์มแรงประจำเดือนกันยายน 2026 คำนวณจากสูตรสถิติเชิงลึก: สถิติชนะ-แพ้, ค่าผลต่างคะแนนสุทธิ (Net Differential), และความยากง่ายของโปรแกรมการแข่งขัน (Strength of Schedule)
    `,
    author: "StatCourt Analytics Group",
    authorRole: "Data Science & Scouting",
    publishedAt: "5 ชั่วโมงที่แล้ว",
    readTime: "5 นาที",
    isFeatured: true,
    featuredHeroOrder: 3,
  },
  {
    id: "news-4",
    title: "SPORTS SCIENCE: 5 ท่าฝึกเพิ่มแรงกระโดด (Vertical Jump) เสริม 4 นิ้วใน 8 สัปดาห์",
    slug: "vertical-jump-plyometrics-blueprint",
    category: "SPORTS_SCIENCE",
    categoryDisplay: "SPORTS SCIENCE",
    coverImage:
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80",
    excerpt:
      "เจาะลึกโปรแกรมฝึกแบบ Plyometrics และ Rate of Force Development (RFD) ที่วิจัยโดยสถาบันวิทยาศาสตร์การกีฬา สำหรับนักบาสเกตบอลเยาวชนไทย",
    content: `
การกระโดดให้สูงขึ้นไม่ได้ขึ้นอยู่กับความแข็งแรงของกล้ามเนื้อเพียงอย่างเดียว แต่ขึ้นอยู่กับความเร็วในการถ่ายเทพลังงานผ่านระบบประสาทและเส้นเอ็น (Tendon Elastic Recoil)

### 5 แบบฝึกแกนหลัก:
1. **Depth Jumps (30cm Box):** เน้นลดเวลาเท้าสัมผัสพื้น (Ground Contact Time < 0.2 วินาที)
2. **Trap Bar Deadlift Jumps:** เสริมพลังกระชากข้อต่อสะโพก (Hip Hinge Power)
3. **Pogo Hops (Single & Double Leg):** เสริมความแข็งแกร่งของเอ็นร้อยหวาย ป้องกันข้อเท้าพลิก
4. **Approach Jump Kaden Box Touches:** ฝึกจังหวะเข้าทำแบบ 1-2 Footwork ให้เหมือนจังหวะดังก์หรือรีบาวด์จริง
5. **Isometric Tibialis & Calf Raises:** สร้างเกราะกำบังหน้าแข้ง ป้องกัน Shin Splints
    `,
    author: "อ.ภาคภูมิ กายภาพบำบัด",
    authorRole: "Head of Sports Performance",
    publishedAt: "1 วันที่แล้ว",
    readTime: "6 นาที",
    isFeatured: false,
  },
  {
    id: "news-5",
    title: "คู่มือโภชนาการนักกีฬาวัยรุ่น: กินอย่างไรเพื่อเพิ่มความสูง & ซ่อมแซมกล้ามเนื้อหลังแข่ง",
    slug: "youth-basketball-nutrition-guide",
    category: "SPORTS_SCIENCE",
    categoryDisplay: "NUTRITION",
    coverImage:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80",
    excerpt:
      "ตารางคำนวณโปรตีน แคลเซียม และสัดส่วนคาร์โบไฮเดรตช่วง Growth Spurt ของนักกีฬาอายุ 13-18 ปี เพื่อยืดช่วงตัวและพัฒนาความหนาของกระดูก",
    content: `
ช่วงเวลาทองของนักบาสเกตบอลเยาวชนคือช่วงอายุ 13-18 ปี หากได้รับโภชนาการที่ถูกต้องควบคู่กับการนอนหลับลึก (Deep Sleep) โอกาสในการเพิ่มความสูงให้ทะลุ 190+ ซม. จะเพิ่มขึ้นอย่างมีนัยสำคัญ
    `,
    author: "ภก.ดร. นันทวัน เกียรติวิทยา",
    authorRole: "Clinical Sports Dietitian",
    publishedAt: "2 วันที่แล้ว",
    readTime: "5 นาที",
    isFeatured: false,
  },
  {
    id: "news-6",
    title: "สวนกุหลาบฯ แซงท้ายเกมเฉือนอัสสัมชัญ 82-81 คว้าตั๋วรอบสองสายกรุงเทพฯ",
    slug: "suankularb-beats-assumption-thriller",
    category: "MATCH_RECAP",
    categoryDisplay: "MATCH RECAP",
    coverImage:
      "https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=800&q=80",
    excerpt:
      "การ์ดจ่ายสวนกุหลาบฯ รัว 8 แต้มรวดใน 2 นาทีสุดท้าย พลิกแซงคว้าชัยเหนืออัสสัมชัญต่อหน้าแฟนบาสเกตบอลกว่าพันคน",
    content: `
อีกหนึ่งเกมสุดระทึกในสัปดาห์นี้ เมื่อโรงเรียนสวนกุหลาบวิทยาลัย แสดงความนิ่งในสถานการณ์กดดัน พลิกจากตามหลัง 7 แต้มช่วงควอเตอร์ที่ 4 แซงเอาชนะโรงเรียนอัสสัมชัญ 82-81 ในวินาทีสุดท้าย
    `,
    author: "สตาฟฟ์นักข่าวกีฬาเยาวชน",
    authorRole: "Courtside Reporter",
    publishedAt: "3 วันที่แล้ว",
    readTime: "3 นาที",
    isFeatured: false,
  },
  {
    id: "news-7",
    title: "BSAT ประกาศรายชื่อ 24 ขุนพลแคมป์เก็บตัวทีมชาติไทยชุดเยาวชน U18 ประจำปี 2026",
    slug: "thailand-u18-national-camp-roster-announcement",
    category: "TOURNAMENT_NEWS",
    categoryDisplay: "OFFICIAL ANNOUNCEMENT",
    coverImage:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
    excerpt:
      "สมาคมกีฬาบาสเกตบอลแห่งประเทศไทย เรียกตัวนักกีฬาช้างเผือกจาก 14 โรงเรียนทั่วประเทศ เข้าทดสอบสมรรถภาพ Draft Combine เตรียมลุยศึกชิงแชมป์เอเชีย",
    content: `
สมาคมกีฬาบาสเกตบอลแห่งประเทศไทย (BSAT) ร่วมกับ StatCourt Thailand ประกาศรายชื่อนักกีฬาเยาวชนรุ่นอายุไม่เกิน 18 ปี จำนวน 24 คน เพื่อเข้าร่วมการทดสอบสมรรถภาพร่างกายและเก็บตัวฝึกซ้อม ณ ศูนย์วิทยาศาสตร์การกีฬา กกท. หัวหมาก
    `,
    author: "BSAT Media Relations",
    authorRole: "Official Press Release",
    publishedAt: "4 วันที่แล้ว",
    readTime: "4 นาที",
    isFeatured: false,
  },
];

export const mockPowerRankings: PowerRankingItem[] = [
  {
    rank: 1,
    previousRank: 1,
    trend: "STEADY",
    change: 0,
    teamName: "กรุงเทพคริสเตียนวิทยาลัย",
    schoolCode: "BCC",
    primaryColor: "#4B0082",
    wins: 9,
    losses: 0,
    pointDiff: +18.4,
    last5: ["W", "W", "W", "W", "W"],
    editorialNotes:
      "ยังคงไร้พ่ายด้วยเกมรุกที่หลากหลายและระบบ Pick & Roll สุดเฉียบคม เสียคะแนนเฉลี่ยเพียง 62.4 แต้มต่อเกม",
  },
  {
    rank: 2,
    previousRank: 3,
    trend: "UP",
    change: 1,
    teamName: "โรงเรียนเทพศิรินทร์",
    schoolCode: "DS",
    primaryColor: "#15803D",
    wins: 8,
    losses: 1,
    pointDiff: +14.2,
    last5: ["W", "W", "W", "W", "L"],
    editorialNotes:
      "แม้พ่าย BCC หวุดหวิด 2 แต้ม แต่ขุมกำลังวงนอกและการชูต 3 แต้มยังคงน่ากลัวที่สุดในลีก (เฉลี่ย 11.2 ลูก/เกม)",
  },
  {
    rank: 3,
    previousRank: 5,
    trend: "UP",
    change: 2,
    teamName: "โรงเรียนสวนกุหลาบวิทยาลัย",
    schoolCode: "SK",
    primaryColor: "#E11D48",
    wins: 7,
    losses: 2,
    pointDiff: +9.8,
    last5: ["W", "W", "W", "W", "W"],
    editorialNotes:
      "ฟอร์มแรงขึ้นเรื่อยๆ ชนะรวด 5 เกมติดต่อกัน เกมรับแบบ Full-court Press บีบคู่แข่งเสียเทิร์นโอเวอร์เฉลี่ย 19 ครั้งต่อเกม",
  },
  {
    rank: 4,
    previousRank: 2,
    trend: "DOWN",
    change: 2,
    teamName: "โรงเรียนอัสสัมชัญ (บางรัก)",
    schoolCode: "AC",
    primaryColor: "#DC2626",
    wins: 7,
    losses: 2,
    pointDiff: +10.1,
    last5: ["W", "W", "L", "W", "L"],
    editorialNotes:
      "สะดุดพ่าย 2 จาก 3 เกมหลังสุดด้วยแต้มสูสี ปัญหาหลักอยู่ที่เปอร์เซ็นต์ลูกโทษท้ายเกมที่ตกลงเหลือ 58%",
  },
  {
    rank: 5,
    previousRank: 4,
    trend: "DOWN",
    change: 1,
    teamName: "สาธิตมหาวิทยาลัยเชียงใหม่",
    schoolCode: "CMU-DEMO",
    primaryColor: "#0284C7",
    wins: 6,
    losses: 3,
    pointDiff: +7.5,
    last5: ["W", "L", "W", "W", "W"],
    editorialNotes:
      "ราชาบาสเกตบอลสายเหนือ เซ็นเตอร์ตัวยักษ์ครองสถิติบล็อกสูงสุดในทัวร์นาเมนต์ (เฉลี่ย 5.8 บล็อก/เกม)",
  },
  {
    rank: 6,
    previousRank: 7,
    trend: "UP",
    change: 1,
    teamName: "โรงเรียนไตรมิตรวิทยาลัย",
    schoolCode: "TM",
    primaryColor: "#CA8A04",
    wins: 5,
    losses: 3,
    pointDiff: +3.2,
    last5: ["L", "W", "W", "W", "L"],
    editorialNotes: "ทีมม้ามืดประจำซีซัน มีตัวทำคะแนนฉายเดี่ยวที่สามารถกด 25+ แต้มได้ทุกค่ำคืน",
  },
  {
    rank: 7,
    previousRank: 6,
    trend: "DOWN",
    change: 1,
    teamName: "โรงเรียนเบญจมราชูทิศ ราชบุรี",
    schoolCode: "BR",
    primaryColor: "#2563EB",
    wins: 5,
    losses: 4,
    pointDiff: +1.8,
    last5: ["W", "L", "L", "W", "W"],
    editorialNotes: "จังหวะ Fastbreak ดุดัน แต่เกมรับใต้แป้นยังมีช่องโหว่เมื่อเจอกับผู้เล่นสรีระเกิน 195 ซม.",
  },
  {
    rank: 8,
    previousRank: 9,
    trend: "UP",
    change: 1,
    teamName: "โรงเรียนหาดใหญ่วิทยาลัย",
    schoolCode: "HYW",
    primaryColor: "#059669",
    wins: 4,
    losses: 4,
    pointDiff: -0.5,
    last5: ["W", "W", "L", "L", "W"],
    editorialNotes: "ตัวแทนภาคใต้สุดแกร่ง เกมเหย้าที่หาดใหญ่ไม่เคยแพ้ใครด้วยเสียงเชียร์แฟนบอลเต็มยิมเนเซียม",
  },
  {
    rank: 9,
    previousRank: 8,
    trend: "DOWN",
    change: 1,
    teamName: "โรงเรียนสาธิต มศว ประสานมิตร",
    schoolCode: "SWU-DEMO",
    primaryColor: "#9333EA",
    wins: 4,
    losses: 5,
    pointDiff: -2.3,
    last5: ["L", "W", "L", "W", "L"],
    editorialNotes: "ระบบการเล่น 5-Out ไร้ตำแหน่งชัดเจน หากสามแต้มทำงานพร้อมล้มได้ทุกทีมในลีก",
  },
  {
    rank: 10,
    previousRank: 10,
    trend: "STEADY",
    change: 0,
    teamName: "โรงเรียนขอนแก่นวิทยายน",
    schoolCode: "KKW",
    primaryColor: "#EA580C",
    wins: 3,
    losses: 5,
    pointDiff: -4.1,
    last5: ["L", "L", "W", "W", "L"],
    editorialNotes: "ยังรั้งอันดับ 10 ไว้ได้ ด้วยการเฉือนชนะแมตช์สำคัญหนีโซนตกชั้นในสัปดาห์ก่อน",
  },
];

export const mockPOTWDivisions: POTWData[] = [
  {
    athleteId: "ath-1",
    athleteName: "ธนากร ศิริพันธุ์",
    athleteSchool: "Bangkok Christian College",
    ageCategory: "U18",
    avatarUrl:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=400&q=80",
    effPerGame: 34.0,
    ppg: 28.0,
    rpg: 8.0,
    apg: 9.0,
    spg: 4.0,
    bpg: 1.0,
    fgPct: 56.4,
    quote: "ความกดดันคือสิ่งที่เราฝึกซ้อมมาเพื่อก้าวผ่านมันไปให้ได้ ชัยชนะนี้เป็นของเพื่อนร่วมทีมทุกคน",
  },
  {
    athleteId: "ath-8",
    athleteName: "ณัฐภัทร สุขประเสริฐ",
    athleteSchool: "Debsirin School",
    ageCategory: "U16",
    avatarUrl:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=400&q=80",
    effPerGame: 29.5,
    ppg: 26.5,
    rpg: 5.5,
    apg: 4.0,
    spg: 2.5,
    bpg: 0.5,
    fgPct: 51.2,
    quote: "การยิง 3 แต้มคือการฝึกซ้อมซ้ำๆ ทุกวัน วันละ 400 ลูก เมื่อลงสนามจริงเราเพียงแค่ปล่อยให้กล้ามเนื้อทำงาน",
  },
  {
    athleteId: "ath-11",
    athleteName: "ศุภณัฐ ธนวุฒิ",
    athleteSchool: "Suankularb Wittayalai",
    ageCategory: "U14",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    effPerGame: 24.8,
    ppg: 19.0,
    rpg: 11.2,
    apg: 3.5,
    spg: 3.0,
    bpg: 2.8,
    fgPct: 58.0,
    quote: "ผมดูคลิปเกมรับของรุ่นพี่ในระบบ StatCourt ทุกคืนก่อนนอน เพื่อเรียนรู้มุมการยืนและการตัดบอล",
  },
];
