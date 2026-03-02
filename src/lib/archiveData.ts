import type { LocalizedText } from "@/lib/localized";
import { localized } from "@/lib/localized";

export type ProjectCategory = "AWARD" | "CAPSTONE" | "RESEARCH" | "PERSONAL";

export interface ArchiveProject {
  id: number;
  title: LocalizedText;
  description: LocalizedText;
  projectYear: number;
  category: ProjectCategory;
  githubUrl?: string;
  members: string[];
  tags: string[];
  status: "pending" | "approved" | "rejected";
}

export interface Award {
  id: number;
  title: LocalizedText;
  awardDate: string;
  level: LocalizedText;
  category: LocalizedText;
  organizer: LocalizedText;
  recipients: string[];
}

export interface VarsityTeam {
  id: number;
  name: LocalizedText;
  sportType: LocalizedText;
  varsity: boolean;
  coach: string;
  achievements: LocalizedText[];
}

export interface CourseAnnouncement {
  id: number;
  courseCode: string;
  title: LocalizedText;
  department: LocalizedText;
  semester: LocalizedText;
  announcedAt: string;
  summary: LocalizedText;
}

export interface ClubReport {
  id: number;
  organization: LocalizedText;
  period: string;
  leaders: LocalizedText[];
  reportTitle: LocalizedText;
  reportUrl: string;
}

export interface SchoolEvent {
  id: number;
  title: LocalizedText;
  type: "upcoming" | "past";
  eventDate: string;
  location: LocalizedText;
  materials: LocalizedText[];
}

export interface Publication {
  id: number;
  type: "student-handbook" | "weekly-letter";
  title: LocalizedText;
  issue: string;
  publishDate: string;
  fileUrl: string;
}

export interface SchoolProfile {
  id: number;
  academicYear: string;
  title: LocalizedText;
  summary: LocalizedText;
  fileUrl: string;
}

export interface BuildingHistory {
  id: number;
  buildingName: LocalizedText;
  timelineYear: number;
  changeType: "construction" | "renovation" | "repurpose";
  note: LocalizedText;
}

export interface AlumniProfile {
  id: number;
  name: string;
  graduationYear: number;
  major: LocalizedText;
  currentRole: LocalizedText;
  linkedinUrl?: string;
  snsUrl?: string;
  consentToShare: boolean;
}

export interface GradeTask {
  id: number;
  grade: LocalizedText;
  taskTitle: LocalizedText;
  dueDate: string;
  owner: LocalizedText;
  status: LocalizedText;
}

export const projects: ArchiveProject[] = [
  {
    id: 1,
    title: localized("AI Cafeteria Recommendation", "AI 급식 추천 시스템"),
    description: localized(
      "Meal recommendation service using preference and nutrition signals.",
      "선호도와 영양 정보를 활용한 급식 추천 서비스입니다.",
    ),
    projectYear: 2025,
    category: "CAPSTONE",
    githubUrl: "https://github.com/example/fayston-meal-ai",
    members: ["Minjun Kim", "Seoyeon Lee", "Doyun Park"],
    tags: ["AI", "Web", "Python"],
    status: "approved",
  },
  {
    id: 2,
    title: localized("Secondhand Textbook Marketplace", "중고 교재 마켓플레이스"),
    description: localized(
      "Mobile-first platform for student textbook exchange.",
      "학생 간 교재 거래를 위한 모바일 우선 플랫폼입니다.",
    ),
    projectYear: 2025,
    category: "PERSONAL",
    githubUrl: "https://github.com/example/fayston-book-market",
    members: ["Eunwoo Choi"],
    tags: ["Mobile", "Marketplace", "Firebase"],
    status: "approved",
  },
  {
    id: 3,
    title: localized("Logistics Optimizer for Programming Contest", "프로그래밍 대회 물류 최적화"),
    description: localized(
      "Graph-based route optimization solution with bronze award.",
      "동상 수상으로 이어진 그래프 기반 경로 최적화 솔루션입니다.",
    ),
    projectYear: 2024,
    category: "AWARD",
    githubUrl: "https://github.com/example/fayston-logistics-opt",
    members: ["Hayoon Jung", "Jiho Yoon"],
    tags: ["Algorithm", "C++", "Competition"],
    status: "approved",
  },
];

export const awards: Award[] = [
  {
    id: 1,
    title: localized("National Collegiate Programming Challenge", "전국 대학 프로그래밍 챌린지"),
    awardDate: "2024-11-03",
    level: localized("Bronze", "동상"),
    category: localized("Academic", "학술"),
    organizer: localized("K-ICPC Foundation", "K-ICPC 재단"),
    recipients: ["Hayoon Jung", "Jiho Yoon"],
  },
  {
    id: 2,
    title: localized("Regional Robotics Showcase", "지역 로보틱스 쇼케이스"),
    awardDate: "2025-05-16",
    level: localized("Gold", "금상"),
    category: localized("Engineering", "공학"),
    organizer: localized("Seoul STEM Council", "서울 STEM 협의회"),
    recipients: ["Fayston Robotics Varsity"],
  },
];

export const varsityTeams: VarsityTeam[] = [
  {
    id: 1,
    name: localized("Fayston Robotics Varsity", "페이스튼 로보틱스 대표팀"),
    sportType: localized("Robotics", "로보틱스"),
    varsity: true,
    coach: "David Han",
    achievements: [localized("2025 Regional Robotics Showcase - Gold", "2025 지역 로보틱스 쇼케이스 - 금상")],
  },
  {
    id: 2,
    name: localized("Fayston Debate Team", "페이스튼 디베이트팀"),
    sportType: localized("Debate", "디베이트"),
    varsity: true,
    coach: "Grace Park",
    achievements: [localized("2025 National Youth Debate - Top 8", "2025 전국 청소년 디베이트 - Top 8")],
  },
];

export const courseAnnouncements: CourseAnnouncement[] = [
  {
    id: 1,
    courseCode: "CS-241",
    title: localized("Applied Data Engineering", "응용 데이터 엔지니어링"),
    department: localized("Computer Science", "컴퓨터과학"),
    semester: localized("2026 Spring", "2026 봄학기"),
    announcedAt: "2026-01-12",
    summary: localized(
      "New elective focused on ETL, warehousing, and analytics ops.",
      "ETL, 데이터 웨어하우스, 분석 운영을 다루는 신규 선택과목입니다.",
    ),
  },
  {
    id: 2,
    courseCode: "HUM-110",
    title: localized("Writing for Public Narratives", "공공 서사를 위한 글쓰기"),
    department: localized("Humanities", "인문학"),
    semester: localized("2026 Spring", "2026 봄학기"),
    announcedAt: "2026-01-20",
    summary: localized(
      "Cross-grade writing studio with publication-based evaluation.",
      "출판 중심 평가를 적용하는 학년 통합 글쓰기 스튜디오입니다.",
    ),
  },
];

export const clubReports: ClubReport[] = [
  {
    id: 1,
    organization: localized("Student Council", "학생회"),
    period: "2025 Q4",
    leaders: [localized("Chair: Jisoo Kim", "회장: 김지수"), localized("Secretary: Ryan Lee", "서기: Ryan Lee")],
    reportTitle: localized("Campus Policy Feedback Summary", "캠퍼스 정책 피드백 요약"),
    reportUrl: "/files/student-council-2025q4.pdf",
  },
  {
    id: 2,
    organization: localized("Media Club", "미디어 클럽"),
    period: "2025 Q4",
    leaders: [localized("Lead Editor: Mina Choi", "편집장: 최미나")],
    reportTitle: localized("Weekly Letter Production Retrospective", "위클리 레터 제작 회고"),
    reportUrl: "/files/media-club-2025q4.pdf",
  },
];

export const schoolEvents: SchoolEvent[] = [
  {
    id: 1,
    title: localized("Spring Festival", "봄 축제"),
    type: "upcoming",
    eventDate: "2026-04-25",
    location: localized("Main Field", "메인 운동장"),
    materials: [localized("Program Schedule", "프로그램 일정표"), localized("Booth Guide", "부스 안내")],
  },
  {
    id: 2,
    title: localized("Winter Capstone Expo", "겨울 캡스톤 엑스포"),
    type: "past",
    eventDate: "2025-12-10",
    location: localized("Innovation Hall", "이노베이션 홀"),
    materials: [
      localized("Presentation Slides", "발표 슬라이드"),
      localized("Winners List", "수상자 명단"),
      localized("Photo Archive", "사진 아카이브"),
    ],
  },
];

export const publications: Publication[] = [
  {
    id: 1,
    type: "student-handbook",
    title: localized("Student Handbook 2026", "학생 핸드북 2026"),
    issue: "v2026.1",
    publishDate: "2026-02-01",
    fileUrl: "/files/student-handbook-2026.pdf",
  },
  {
    id: 2,
    type: "weekly-letter",
    title: localized("Weekly Student Letter", "주간 학생 레터"),
    issue: "Week 07",
    publishDate: "2026-02-20",
    fileUrl: "/files/weekly-letter-2026-w07.pdf",
  },
];

export const schoolProfiles: SchoolProfile[] = [
  {
    id: 1,
    academicYear: "2024-2025",
    title: localized("School Profile 2024-2025", "학교 프로필 2024-2025"),
    summary: localized(
      "Academic outcomes, curriculum highlights, and student activities.",
      "학업 성과, 커리큘럼 하이라이트, 학생 활동을 정리한 문서입니다.",
    ),
    fileUrl: "/files/school-profile-2024-2025.pdf",
  },
  {
    id: 2,
    academicYear: "2025-2026",
    title: localized("School Profile 2025-2026", "학교 프로필 2025-2026"),
    summary: localized(
      "Updated school metrics, admissions context, and program overview.",
      "최신 학교 지표, 입학 맥락, 프로그램 개요를 담은 문서입니다.",
    ),
    fileUrl: "/files/school-profile-2025-2026.pdf",
  },
];

export const buildingHistory: BuildingHistory[] = [
  {
    id: 1,
    buildingName: localized("Innovation Hall", "이노베이션 홀"),
    timelineYear: 2021,
    changeType: "construction",
    note: localized(
      "Opened as the main interdisciplinary project venue.",
      "융합 프로젝트의 핵심 공간으로 신축 개관했습니다.",
    ),
  },
  {
    id: 2,
    buildingName: localized("Library East Wing", "도서관 동관"),
    timelineYear: 2024,
    changeType: "renovation",
    note: localized(
      "Converted into digital archive and collaboration space.",
      "디지털 아카이브 및 협업 공간으로 리노베이션했습니다.",
    ),
  },
];

export const alumniProfiles: AlumniProfile[] = [
  {
    id: 1,
    name: "Yuna Seo",
    graduationYear: 2022,
    major: localized("Computer Science", "컴퓨터과학"),
    currentRole: localized("ML Engineer at NovaAI", "NovaAI 머신러닝 엔지니어"),
    linkedinUrl: "https://linkedin.com/in/yuna-seo",
    snsUrl: "https://x.com/yunaseo",
    consentToShare: true,
  },
  {
    id: 2,
    name: "Daniel Cho",
    graduationYear: 2021,
    major: localized("Design", "디자인"),
    currentRole: localized("Product Designer at Orbital", "Orbital 프로덕트 디자이너"),
    linkedinUrl: "https://linkedin.com/in/daniel-cho",
    consentToShare: true,
  },
];

export const gradeTasks: GradeTask[] = [
  {
    id: 1,
    grade: localized("Grade 9", "9학년"),
    taskTitle: localized("History reflection essay", "역사 성찰 에세이"),
    dueDate: "2026-03-10",
    owner: localized("Humanities Dept.", "인문학부"),
    status: localized("todo", "할 일"),
  },
  {
    id: 2,
    grade: localized("Grade 11", "11학년"),
    taskTitle: localized("Capstone milestone #2 submission", "캡스톤 마일스톤 #2 제출"),
    dueDate: "2026-03-04",
    owner: localized("STEM Program", "STEM 프로그램"),
    status: localized("in-progress", "진행 중"),
  },
  {
    id: 3,
    grade: localized("Grade 12", "12학년"),
    taskTitle: localized("University counseling packet upload", "대입 상담 패킷 업로드"),
    dueDate: "2026-03-01",
    owner: localized("Counseling Office", "카운슬링 오피스"),
    status: localized("todo", "할 일"),
  },
];

export const archiveDataset = {
  projects,
  awards,
  varsityTeams,
  courseAnnouncements,
  clubReports,
  schoolEvents,
  publications,
  schoolProfiles,
  buildingHistory,
  alumniProfiles,
  gradeTasks,
};

export type ArchiveSection = keyof typeof archiveDataset;
