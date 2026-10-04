# สถิติและกราฟตามมาตรฐาน FIBA สำหรับหน้าเว็บ

## 1. สถิติพื้นฐาน (Box Score ตาม FIBA)

| กลุ่ม | ตัวชี้วัด |
|---|---|
| เวลา/คะแนน | MIN, PTS |
| การยิง | FGM/FGA, 2PM/2PA, 3PM/3PA, FTM/FTA และ % ของแต่ละแบบ |
| รีบาวด์ | OREB, DREB, REB |
| เกมรุก/รับ | AST, STL, BLK, TO |
| ฟาวล์ | PF (ทำฟาวล์), FD (ถูกฟาวล์) |
| รวม | +/-, **PIR (Performance Index Rating)** |

> **PIR** คือค่าประสิทธิภาพของ FIBA = (PTS + REB + AST + STL + BLK + FD) − (FG พลาด + FT พลาด + TO + ถูกบล็อก + PF)

## 2. สถิติขั้นสูง (Advanced)

| ตัวชี้วัด | สูตร/ความหมาย |
|---|---|
| **eFG%** | (FGM + 0.5×3PM) / FGA |
| **TS%** | PTS / (2 × (FGA + 0.44×FTA)) |
| **Possessions** | FGA − OREB + TO + 0.44×FTA |
| **ORtg / DRtg / Net Rtg** | คะแนนได้/เสียต่อ 100 possessions |
| **Pace** | จำนวน possessions ต่อ **40 นาที** (FIBA เล่น 4×10 นาที ไม่ใช่ 48) |
| **Four Factors** | eFG%, TOV%, ORB%, FT Rate (FTA/FGA) |
| **AST/TO ratio** | คุณภาพการจัดการบอล |
| **Usage %** | สัดส่วนการจบ possession ของผู้เล่น |

สถิติทีมที่ FIBA แสดงใน box score ด้วย ได้แก่ Points in the Paint, Fast Break Points, Second Chance Points, Points off Turnovers, Bench Points, Biggest Lead, Lead Changes และ Times Tied

## 3. กราฟที่ควรใช้ (จับคู่กับสถิติ)

| สถิติ | ชนิดกราฟ | เหตุผล |
|---|---|---|
| ตำแหน่งการยิง | **Shot Chart** (zone/hexbin) | เห็นจุดที่ยิงเข้า/พลาด |
| ความต่างคะแนนตลอดเกม | **Line/Area chart (Lead Tracker)** | เห็นจังหวะแซง/ทิ้งห่าง |
| คะแนนรายควอเตอร์ | **Grouped / Stacked bar** | เทียบ 4 ควอเตอร์ของสองทีม |
| เทียบสองทีม (Head-to-Head) | **Butterfly bar** (ซ้าย-ขวา) | อ่านง่ายที่สุดสำหรับ box score |
| ภาพรวมผู้เล่น | **Radar chart** | PTS/REB/AST/STL/BLK ในรูปเดียว |
| ที่มาของคะแนน | **Donut / Stacked bar** | สัดส่วน Paint / 3PT / FT / Fast Break |
| ทีมเกมรุก vs รับ | **Scatter (ORtg vs DRtg)** แบ่ง 4 quadrant | หาทีมที่เก่งสองฝั่ง |
| อันดับผู้เล่น | **Horizontal bar / Lollipop** | Top scorer, PIR leaderboard |
| ฟอร์มย้อนหลัง | **Sparkline / Line** (5-10 เกมล่าสุด) | เห็นแนวโน้ม |
| ความสม่ำเสมอ | **Box plot** | การกระจายของคะแนน/PIR ต่อเกม |
| ผลของ lineup | **Heatmap / Table** | Net Rating ของ 5 คนที่ลงพร้อมกัน |
| เหตุการณ์ในเกม | **Timeline (Play-by-Play)** | แสดงช่วงสำคัญ, run, timeout |
| ตารางคะแนนลีก | **Table + conditional color** | W-L, Point Diff |

## 4. โครงหน้าเว็บที่แนะนำ

| หน้า | องค์ประกอบ |
|---|---|
| **Game page** | Scoreboard, Lead Tracker, Quarter bar, Head-to-Head butterfly, Box score, Shot Chart, Play-by-Play |
| **Player page** | Season averages, Radar, Sparkline ฟอร์ม, Shot Chart, Game log, ค่า per 40 min |
| **Team page** | Four Factors, ORtg/DRtg, Donut ที่มาของคะแนน, Lineup table |
| **League page** | Standings, Leaderboards, Scatter ORtg vs DRtg |

## 5. จุดที่ต่างจาก NBA (ต้องระวัง)

| หัวข้อ | FIBA | ผลต่อเว็บ |
|---|---|---|
| เวลาเกม | 4×10 นาที (40 นาที) | ใช้ **per 40** ไม่ใช่ per 36/48 |
| ฟาวล์ | 5 ครั้งออกจากเกม | แสดง foul trouble ที่ 4 |
| Team foul | ครบ 5/ควอเตอร์ = bonus | แสดง team fouls รายควอเตอร์ |
| เส้น 3 คะแนน | 6.75 ม. | ระวังถ้านำ zone/สถิติจาก NBA มาเทียบตรงๆ |
| ฟาวล์พิเศษ | มี Unsportsmanlike / Disqualifying | เก็บแยกประเภทใน data model |

## 6. ลำดับที่แนะนำให้ทำ

1. Box score + Quarter bar + Lead Tracker (ใช้ข้อมูลน้อย ได้ผลมาก)
2. Head-to-Head + Four Factors + PIR leaderboard
3. Player page (Radar, Sparkline)
4. Shot Chart (ต้องมีพิกัดการยิงในข้อมูล)
5. Lineup analysis (ต้องมี play-by-play + substitution)

---

# Library และ Skill สำหรับสร้างกราฟ (เว็บสถิติบาส)

## 7. Library ที่แนะนำ (ใช้ในเว็บจริง)

| Library | จุดเด่น | เหมาะกับกราฟ | ข้อควรระวัง |
|---|---|---|---|
| **Apache ECharts** | ครอบคลุมที่สุด, ข้อมูลเยอะก็ลื่น, มี radar, heatmap, boxplot, scatter, custom series ในตัว | Radar, Butterfly, Heatmap, Box plot, Scatter 4 quadrant, Lead Tracker | ไฟล์ค่อนข้างใหญ่ (import เฉพาะส่วนที่ใช้ได้) |
| **Recharts** | เขียนแบบ React component อ่านง่าย | Quarter bar, Line, Radar, Donut, Leaderboard | ข้อมูลหลักพันจุดขึ้นไปจะเริ่มช้า |
| **D3.js** | ควบคุมได้ทุกอย่าง | **Shot Chart (วาดสนาม FIBA เอง)**, Play-by-Play timeline | เรียนรู้ยาก เขียนโค้ดเยอะ |
| **Visx** (Airbnb) | D3 ในรูปแบบ React component | Shot chart, timeline แบบ custom | community เล็กกว่า |
| **Chart.js** | ง่าย เบา | Bar, Line, Donut พื้นฐาน | Radar/Heatmap/Shot chart ต้องใช้ plugin เพิ่ม |
| **uPlot / Tremor** | เบา, เร็ว | Sparkline, KPI card | ชนิดกราฟจำกัด |
| **Plotly.js** | interactive เยอะ, ส่งออกภาพได้ | Box plot, Scatter, Heatmap | ไฟล์ใหญ่มาก |

## 8. จับคู่กราฟกับ Library

| กราฟ | แนะนำ |
|---|---|
| Shot Chart | **D3/Visx** (วาดสนามเป็น SVG แล้ววางจุดยิงตามพิกัด) |
| Lead Tracker | ECharts (area + markLine) |
| Quarter bar / Butterfly | Recharts หรือ ECharts |
| Radar ผู้เล่น | ECharts |
| Scatter ORtg vs DRtg | ECharts (markArea แบ่ง quadrant) |
| Box plot / Heatmap lineup | ECharts |
| Sparkline | uPlot หรือ Recharts |
| Play-by-Play timeline | D3 |

## 9. Skill ที่ให้ AI ใช้ช่วยสร้างกราฟ

| Skill | ใช้เมื่อ |
|---|---|
| **`data:build-dashboard`** | อยากได้ dashboard HTML ไฟล์เดียว มี chart, filter, table, KPI card พร้อมใช้ (เหมาะทำต้นแบบเร็ว) |
| **`frontend-design`** | ทำหน้าเว็บให้ดูมีเอกลักษณ์ ไม่เป็น template (ใช้คู่กับ build-dashboard) |
| **`data:create-viz`** / **`data:data-visualization`** | ทำกราฟด้วย Python (matplotlib/plotly) สำหรับวิเคราะห์ ทำรายงาน หรือส่งออกเป็นรูป |
| **`data:validate-data`** | ตรวจสูตรสถิติ (eFG%, TS%, PIR, Possessions) ก่อนขึ้นกราฟ |
| **`design:accessibility-review`** | ตรวจสี contrast และการอ่านบนมือถือ |

## 10. ข้อเสนอแนะ

| เป้าหมาย | วิธีที่ควรใช้ |
|---|---|
| ทำต้นแบบ/ดูภาพรวมเร็วๆ | `data:build-dashboard` + `frontend-design` |
| เว็บจริงแบบ React/Next.js | **ECharts (ตัวหลัก) + D3 (เฉพาะ Shot Chart)** |
| วิเคราะห์ข้อมูลก่อนทำเว็บ | Python + `data:statistical-analysis` + `data:create-viz` |
| ต้องการเบาและเร็วที่สุด | Recharts + uPlot |

**ชุดที่แนะนำ:** ECharts + D3 (Shot Chart) + TanStack Table สำหรับ box score เพราะครอบคลุมกราฟเกือบทั้งหมดในรายการ FIBA โดยใช้ library น้อยตัว
