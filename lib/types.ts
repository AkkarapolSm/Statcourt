export type Role = "ATHLETE" | "COACH" | "OFFICIAL" | "ADMIN" | "FAN";

export type Position =
  | "POINT_GUARD"
  | "SHOOTING_GUARD"
  | "SMALL_FORWARD"
  | "POWER_FORWARD"
  | "CENTER";

export type OfficialApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export type MatchStatus =
  | "SCHEDULED"
  | "LIVE"
  | "HALF_TIME"
  | "COMPLETED"
  | "DISPUTED"
  | "POSTPONED"
  | "CANCELLED";

export type EventType =
  | "TWO_POINT_MADE"
  | "TWO_POINT_MISSED"
  | "THREE_POINT_MADE"
  | "THREE_POINT_MISSED"
  | "FREE_THROW_MADE"
  | "FREE_THROW_MISSED"
  | "OFFENSIVE_REBOUND"
  | "DEFENSIVE_REBOUND"
  | "ASSIST"
  | "STEAL"
  | "BLOCK"
  | "TURNOVER"
  | "PERSONAL_FOUL"
  | "TECHNICAL_FOUL";

export interface User {
  id: string;
  email: string;
  phoneNumber?: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface AthleteProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  primaryPosition: Position;
  secondaryPosition?: Position | null;
  heightCm: number;
  weightKg?: number | null;
  wingspanCm?: number | null;
  standingReachCm?: number | null;
  schoolOrClub: string;
  province: string;
  jerseyNumber?: number | null;
  bio?: string | null;
  avatarUrl?: string;
  tcasReferenceCode?: string;
  lastAttended?: string;
  country?: string;
}

export interface CoachProfile {
  id: string;
  userId: string;
  fullName: string;
  organization: string;
  phoneNumber: string;
  idVerificationUrl?: string | null;
  isVerified: boolean;
}

export interface OfficialProfile {
  id: string;
  userId: string;
  fullName: string;
  licensingBody: string;
  licenseNumber?: string | null;
  approvalStatus: OfficialApprovalStatus;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  institution: string;
  logoUrl?: string;
  primaryColor?: string;
  coachId?: string;
  roster: RosterPlayer[];
}

export interface RosterPlayer {
  athleteId: string;
  jerseyNumber: number;
  firstName: string;
  lastName: string;
  position: Position;
  heightCm: number;
  fouls: number;
  points: number;
  isOnCourt: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  category: "U14" | "U16" | "U18" | "Open";
}

export interface MatchEvent {
  id: string;
  matchId: string;
  officialId: string;
  athleteId?: string | null;
  teamId: string;
  eventType: EventType;
  points: number;
  quarter: number;
  gameClockDisplay: string;
  videoElapsedSec?: number | null;
  isVerified: boolean;
  createdAt: string;
  athleteName?: string;
  jerseyNumber?: number;
}

export interface Match {
  id: string;
  resultStatus?: "DRAFT" | "PENDING_APPROVAL" | "FINAL";
  tournamentId: string;
  tournamentName?: string;
  homeTeamId: string;
  homeTeam: Team;
  awayTeamId: string;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  currentQuarter: number;
  gameClockSec: number;
  status: MatchStatus;
  scheduledAt?: string | null;
  venue?: string | null;
  courtName?: string | null;
  round?: string | null;
  postponedReason?: string | null;
  rawVideoUrl?: string | null;
  scoresheetPhotoUrl?: string | null;
  events: MatchEvent[];
  createdAt: string;
}

export interface MarketplaceItem {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerSchool: string;
  isSellerVerified: boolean;
  isProSeller?: boolean;
  title: string;
  brand: string;
  model: string;
  size: string;
  condition: "Brand New" | "Mint 9.5/10" | "Good 8.5/10" | "Used 7/10";
  priceThb: number;
  isSold: boolean;
  category: "Footwear" | "Protective Braces" | "Training Equipment" | "Uniforms";
  imageUrls: string[];
  cardBgColor?: string;
  wornByAthletes: {
    id: string;
    name: string;
    team: string;
    jerseyNumber: number;
    position: Position;
  }[];
  createdAt: string;
}

export interface AthleteSeasonStats {
  athleteId: string;
  firstName: string;
  lastName: string;
  jerseyNumber: number;
  schoolOrClub: string;
  province: string;
  position: Position;
  ageCategory: "U14" | "U16" | "U18" | "Open";
  season?: string;
  tournamentId?: string | null;
  heightCm?: number;
  weightKg?: number;
  lastAttended?: string;
  country?: string;
  gamesPlayed: number;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  fgMade: number;
  fgMissed: number;
  ftMade: number;
  ftMissed: number;
  fg3Made: number;
  fg3Missed: number;
  avatarUrl?: string;
  // FIBA Standard Metrics (FIBA LiveStats Standard)
  eff: number; // Total FIBA EFF
  effPerGame: number; // FIBA EFF / Game (Official Ranking Metric)
  efgPct: number; // Effective Field Goal Percentage (eFG%)
  tsPct: number; // True Shooting Percentage (TS%)
  astToRatio: number; // Assist to Turnover Ratio
  // Computed per game and rates
  per: number;
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  fgPct: number;
  ftPct: number;
  // Radar metrics (0 - 100)
  scoringRating: number;
  playmakingRating: number;
  defenseRating: number;
  athleticismRating: number;
  // Match Experience & Continuity Index
  matchesLast30d?: number;
  matchesLast6m?: number;
  matchesLast1y?: number;
  matchesAllTime?: number;
}

export type SubscriptionTier = "FREE" | "PRO";

export interface ShotCoordinate {
  id: string;
  x: number; // 0 to 100 percentage of court width
  y: number; // 0 to 100 percentage of court depth
  made: boolean;
  zone: "PAINT_RESTRICTED" | "MID_RANGE" | "CORNER_3_LEFT" | "CORNER_3_RIGHT" | "ABOVE_BREAK_3";
  quarter?: number;
  gameClock?: string;
  points: 2 | 3;
}

export interface ShotZoneData {
  zone: "PAINT_RESTRICTED" | "MID_RANGE" | "CORNER_3_LEFT" | "CORNER_3_RIGHT" | "ABOVE_BREAK_3";
  zoneNameTh: string;
  zoneNameEn: string;
  made: number;
  attempted: number;
  percentage: number;
}

export interface PlayerStatsResponse {
  // Free fields (Traditional Box Score & FIBA EFF)
  athleteId: string;
  firstName: string;
  lastName: string;
  jerseyNumber: number;
  schoolOrClub: string;
  province: string;
  position: Position;
  ageCategory: string;
  gamesPlayed: number;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  fgMade: number;
  fgMissed: number;
  ftMade: number;
  ftMissed: number;
  eff: number;
  effPerGame: number;
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  fgPct: number;
  ftPct: number;

  // Pro-only fields (Sanitized to null or undefined for FREE tier)
  trueShootingPct?: number | null;
  effectiveFgPct?: number | null;
  astToRatio?: number | null;
  shotChartData?: ShotCoordinate[] | null;
  shotZones?: ShotZoneData[] | null;
  effTrendHistory?: { gameIndex: number; eff: number; opponent: string }[] | null;
  isProGated: boolean;
}

// Match Experience & Activity Index Types (ดัชนีวัดประสบการณ์และความต่อเนื่อง)
export type ActivityTimeframe = "1M" | "6M" | "1Y" | "ALL";

export interface ActivitySummary {
  timeframe: ActivityTimeframe;
  matchCount: number;
  tournamentCount: number;
  avgMinutesPerGame?: number;
}

export interface AthleteActivityMetrics {
  last1Month: ActivitySummary;
  last6Months: ActivitySummary;
  last1Year: ActivitySummary;
  allTime: ActivitySummary;
}

export interface MatchParticipantData {
  id: string;
  matchId: string;
  athleteId: string;
  isStarter: boolean;
  minutesPlayed: number;
  createdAt: string;
  tournamentId?: string;
  tournamentName?: string;
  opponentTeamName?: string;
}

// ==========================================
// PHASE 2: SCOUTING, ACADEMICS & TCAS TYPES
// ==========================================

export interface AcademicRecord {
  id: string;
  athleteId: string;
  schoolYear: number; // e.g. 2568, 2569
  gradeLevel: string; // "ม.4", "ม.5", "ม.6"
  semester: 1 | 2;
  gpa: number; // e.g. 3.75
  credits: number;
  isVerified: boolean;
  transcriptUrl?: string;
  verifiedBy?: string;
}

export interface TargetUniversityWish {
  id: string;
  universityName: string;
  faculty: string;
  quotaType: string;
  minGpaxRequired: number;
  currentGpax: number;
  isEligible: boolean;
  scholarshipCoverage: string;
  deadlineDate: string;
  notes: string;
}

export interface ScoutProfileViewItem {
  id: string;
  scoutName: string;
  scoutRole: string; // e.g. "Head Coach", "Scouting Director", "Talent Scout"
  institution: string; // e.g. "Chulalongkorn University", "Hi-Tech Club"
  institutionBadge?: string;
  viewCount: number;
  lastViewedAt: string;
  actionTaken: "VIEWED_FILM" | "DOWNLOADED_DOSSIER" | "ADDED_TO_SHORTLIST" | "VIEWED_BIOMETRICS";
  isVerifiedScout: boolean;
}

export interface OpportunityPosting {
  id: string;
  title: string;
  institution: string;
  institutionLogo?: string;
  level: "HIGH_SCHOOL" | "UNIVERSITY" | "SEMI_PRO";
  levelDisplay: string;
  scholarshipType: "FULL_100" | "PARTIAL_50" | "QUOTA_ONLY";
  scholarshipDisplay: string;
  province: string;
  region: "BANGKOK" | "CENTRAL" | "NORTH" | "NORTHEAST" | "SOUTH";
  deadline: string;
  quotaCount: number;
  minGpax?: number;
  ageRequirement: string;
  stipendNotes: string;
  status: "OPEN" | "CLOSING_SOON" | "CLOSED";
  description: string;
  requirements: string[];
  contactEmail: string;
  contactPhone: string;
}

export interface HighlightClipItem {
  id: string;
  matchId: string;
  quarter: number;
  timestampDisplay: string;
  elapsedSec: number;
  eventType: EventType;
  title: string;
  description: string;
  videoUrl?: string;
  durationSec: number;
  isSelected?: boolean;
}

// ==========================================
// PHASE 3: TEAM OPERATIONS, PLAYBOOK & SPORTS SCIENCE
// ==========================================

export interface PlaybookPlayerCoord {
  id: string; // "1", "2", "3", "4", "5", "x1", "x2"
  label: string;
  isOffense: boolean;
  x: number; // 0-100 percentage of half court
  y: number; // 0-100 percentage of half court
  action?: "DRIBBLE" | "PASS" | "SCREEN" | "CUT" | "SPOT_UP";
}

export interface PlaybookStep {
  stepIndex: number;
  title: string;
  description: string;
  ballCarrierId: string;
  players: PlaybookPlayerCoord[];
}

export interface PlaybookPlay {
  id: string;
  title: string;
  category: "OFFENSE" | "DEFENSE" | "INBOUND" | "PRESS_BREAK";
  tags: string[];
  description: string;
  keyCoachingPoint: string;
  steps: PlaybookStep[];
}

export interface PracticeAttendanceItem {
  athleteId: string;
  athleteName: string;
  jerseyNumber: number;
  position: Position;
  status: "PRESENT" | "LATE" | "EXCUSED" | "ABSENT";
  checkInTime?: string;
  disciplineRating: number; // percentage e.g. 96.5%
  notes?: string;
}

export interface PracticeSession {
  id: string;
  title: string;
  date: string;
  timeDisplay: string;
  sessionType: "TACTICAL" | "STRENGTH_CONDITIONING" | "SHOOTAROUND" | "FILM_STUDY";
  location: string;
  coachInCharge: string;
  roster: PracticeAttendanceItem[];
}

export interface OppositionPersonnel {
  number: number;
  name: string;
  position: string;
  ppg: number;
  eff: number;
  keyTendency: string;
  defensiveAssignment: string;
}

export interface OppositionReport {
  id: string;
  targetMatchId: string;
  opponentTeam: string;
  opponentShortName: string;
  tournamentName: string;
  matchDate: string;
  driveTendency: { rightPct: number; leftPct: number };
  transitionPacePpg: number;
  q3RatingDrop: number;
  vulnerabilities: string[];
  keyPersonnel: OppositionPersonnel[];
  gameplanRules: { id: string; rule: string; isMustFollow: boolean }[];
}

export interface PlayerWorkload {
  athleteId: string;
  athleteName: string;
  jerseyNumber: number;
  position: Position;
  minutesLast7Days: number;
  minutesLast14Days: number;
  gamesPlayedLast7Days: number;
  fatigueRisk: "LOW" | "MODERATE" | "HIGH";
  overuseWarning?: string;
  recoveryScore: number; // 0 - 100
}

export interface InjuryLogItem {
  id: string;
  athleteId: string;
  athleteName: string;
  jerseyNumber: number;
  injuryType: string;
  severity: "MILD" | "MODERATE" | "SEVERE";
  bodyPart: string;
  occurredDate: string;
  expectedReturnDate: string;
  status: "ACTIVE" | "QUESTIONABLE" | "RECOVERED";
  treatmentProtocol: string;
}

// ==========================================
// PHASE 4: ACADEMY, EDGE AI & MATCH ECOSYSTEM
// ==========================================

export interface AcademyCourse {
  id: string;
  title: string;
  level: "LEVEL_1" | "LEVEL_2" | "LEVEL_3";
  levelDisplay: string;
  durationMinutes: number;
  modulesCount: number;
  enrolledCount: number;
  badgeName: string;
  description: string;
  examRequired: boolean;
  isCompleted?: boolean;
}

export interface OfficialCertification {
  id: string;
  officialName: string;
  certLevel: string;
  certHash: string;
  issuedDate: string;
  expiresDate: string;
  licensingBody: string;
  scorePercent: number;
}

export interface OfficialHireProfile {
  id: string;
  name: string;
  licenseNumber: string;
  tier: "NATIONAL_A" | "REGIONAL_B" | "PROVISIONAL";
  rating: number;
  matchesOfficiated: number;
  dailyRateThb: number;
  province: string;
  isAvailable: boolean;
  specialization: string;
}

export interface DisputeRequest {
  id: string;
  matchId: string;
  tournamentName: string;
  requestingTeam: string;
  quarter: number;
  gameClock: string;
  videoElapsedSec: number;
  disputeType:
    | "CLOCK_EXPIRATION"
    | "FOOT_ON_LINE_3PT"
    | "OUT_OF_BOUNDS"
    | "UNSPORTSMANLIKE_FOUL"
    | "SCORE_DISCREPANCY";
  description: string;
  status: "UNDER_REVIEW" | "ADJUSTED_OVERTURNED" | "UPHELD_CALL_STANDS";
  commissionerNotes: string;
  resolvedAt?: string;
  evidenceClipUrl?: string;
}

export interface LivestreamChannel {
  id: string;
  matchId: string;
  matchTitle: string;
  tournamentName: string;
  isLive: boolean;
  viewersCount: number;
  priceThb: number;
  currentScore: { home: number; away: number; quarter: number; clock: string };
  availableAngles: { id: string; name: string; isSelected: boolean }[];
  arenaLocation: string;
}

// ==========================================
// PHASE 5: NEWS, RECAPS, POTW & POWER RANKINGS
// ==========================================

export type NewsCategory =
  | "MATCH_RECAP"
  | "PLAYER_SPOTLIGHT"
  | "POWER_RANKING"
  | "TOURNAMENT_NEWS"
  | "SPORTS_SCIENCE";

export interface POTWData {
  athleteId: string;
  athleteName: string;
  athleteSchool: string;
  ageCategory: "U18" | "U16" | "U14" | "OPEN";
  avatarUrl: string;
  effPerGame: number;
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg?: number;
  fgPct?: number;
  quote: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  category: NewsCategory;
  categoryDisplay: string;
  coverImage: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole: string;
  publishedAt: string;
  readTime: string;
  isFeatured: boolean;
  featuredHeroOrder?: number;
  relatedMatchId?: string;
  potwData?: POTWData;
  clutchPlay?: {
    quarterClock: string;
    opponent: string;
    videoUrl: string;
    description: string;
  };
}

export interface PowerRankingItem {
  rank: number;
  previousRank: number;
  trend: "UP" | "DOWN" | "STEADY";
  change: number;
  teamName: string;
  schoolCode: string;
  primaryColor: string;
  logoUrl?: string;
  wins: number;
  losses: number;
  pointDiff: number;
  last5: ("W" | "L")[];
  editorialNotes: string;
}

// ==========================================
// ACADEMY VIDEO COURSES & CLINICS (IMAGE 3)
// ==========================================

export type CourseCategory =
  | "TABLE_OFFICIALS"
  | "COACHING_TACTICS"
  | "ATHLETE_DEVELOPMENT"
  | "SPORTS_SCIENCE";

export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  isFreePreview: boolean;
  notes?: string;
}

export interface AcademyVideoCourse {
  id: string;
  category: CourseCategory;
  categoryDisplay: string;
  title: string;
  subtitle: string;
  instructorName: string;
  instructorTitle: string;
  instructorAvatar: string;
  instructorBadge: string;
  priceThb: number;
  originalPriceThb?: number;
  isFree: boolean;
  rating: number;
  reviewCount: number;
  duration: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";
  thumbnailUrl: string;
  videoPreviewUrl: string;
  lessonsCount: number;
  syllabus: CourseLesson[];
  keyOutcomes: string[];
  equipmentNeeded: string[];
  enrolledCount: number;
  createdByRole: "ADMIN" | "COACH";
  createdAt: string;
}

export interface TournamentRegistration {
  id: string;
  tournamentId: string;
  teamId: string;
  teamName?: string;
  teamShortName?: string;
  teamLogo?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rosterJson: string;
  isRosterLocked: boolean;
  notes?: string | null;
  submittedAt: string;
  reviewedAt?: string | null;
  reviewerNotes?: string | null;
}

export interface TournamentStanding {
  id: string;
  tournamentId: string;
  teamId: string;
  teamName: string;
  teamShortName?: string;
  teamLogo?: string | null;
  groupName: string;
  rank: number;
  played: number;
  won: number;
  lost: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDiff: number;
  points: number;
  streak: string;
}

export interface DataPrivacyConsent {
  id: string;
  userId: string;
  consentType: string;
  isAccepted: boolean;
  guardianName?: string | null;
  guardianPhone?: string | null;
  ipAddress?: string | null;
  acceptedAt: string;
}


