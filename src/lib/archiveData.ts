export type ProjectCategory = "AWARD" | "CAPSTONE" | "RESEARCH" | "PERSONAL";

export interface ArchiveProject {
  id: number;
  title: string;
  description: string;
  projectYear: number;
  category: ProjectCategory;
  githubUrl?: string;
  members: string[];
  tags: string[];
  status: "pending" | "approved" | "rejected";
}

export interface Award {
  id: number;
  title: string;
  awardDate: string;
  level: string;
  category: string;
  organizer: string;
  recipients: string[];
}

export interface VarsityTeam {
  id: number;
  name: string;
  sportType: string;
  varsity: boolean;
  coach: string;
  achievements: string[];
}

export interface CourseAnnouncement {
  id: number;
  courseCode: string;
  title: string;
  department: string;
  semester: string;
  announcedAt: string;
  summary: string;
}

export interface ClubReport {
  id: number;
  organization: string;
  period: string;
  leaders: string[];
  reportTitle: string;
  reportUrl: string;
}

export interface SchoolEvent {
  id: number;
  title: string;
  type: "upcoming" | "past";
  eventDate: string;
  location: string;
  materials: string[];
}

export interface Publication {
  id: number;
  type: "student-handbook" | "weekly-letter";
  title: string;
  issue: string;
  publishDate: string;
  fileUrl: string;
}

export interface SchoolProfile {
  id: number;
  academicYear: string;
  title: string;
  summary: string;
  fileUrl: string;
}

export interface BuildingHistory {
  id: number;
  buildingName: string;
  timelineYear: number;
  changeType: "construction" | "renovation" | "repurpose";
  note: string;
}

export interface AlumniProfile {
  id: number;
  name: string;
  graduationYear: number;
  major: string;
  currentRole: string;
  linkedinUrl?: string;
  snsUrl?: string;
  consentToShare: boolean;
}

export interface GradeTask {
  id: number;
  grade: string;
  taskTitle: string;
  dueDate: string;
  owner: string;
  status: "todo" | "in-progress" | "done";
}

export const projects: ArchiveProject[] = [
  {
    id: 1,
    title: "AI Cafeteria Recommendation",
    description:
      "Meal recommendation service using preference and nutrition signals.",
    projectYear: 2025,
    category: "CAPSTONE",
    githubUrl: "https://github.com/example/fayston-meal-ai",
    members: ["Minjun Kim", "Seoyeon Lee", "Doyun Park"],
    tags: ["AI", "Web", "Python"],
    status: "approved",
  },
  {
    id: 2,
    title: "Secondhand Textbook Marketplace",
    description: "Mobile-first platform for student textbook exchange.",
    projectYear: 2025,
    category: "PERSONAL",
    githubUrl: "https://github.com/example/fayston-book-market",
    members: ["Eunwoo Choi"],
    tags: ["Mobile", "Marketplace", "Firebase"],
    status: "approved",
  },
  {
    id: 3,
    title: "Logistics Optimizer for Programming Contest",
    description: "Graph-based route optimization solution with bronze award.",
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
    title: "National Collegiate Programming Challenge",
    awardDate: "2024-11-03",
    level: "Bronze",
    category: "Academic",
    organizer: "K-ICPC Foundation",
    recipients: ["Hayoon Jung", "Jiho Yoon"],
  },
  {
    id: 2,
    title: "Regional Robotics Showcase",
    awardDate: "2025-05-16",
    level: "Gold",
    category: "Engineering",
    organizer: "Seoul STEM Council",
    recipients: ["Fayston Robotics Varsity"],
  },
];

export const varsityTeams: VarsityTeam[] = [
  {
    id: 1,
    name: "Fayston Robotics Varsity",
    sportType: "Robotics",
    varsity: true,
    coach: "David Han",
    achievements: ["2025 Regional Robotics Showcase - Gold"],
  },
  {
    id: 2,
    name: "Fayston Debate Team",
    sportType: "Debate",
    varsity: true,
    coach: "Grace Park",
    achievements: ["2025 National Youth Debate - Top 8"],
  },
];

export const courseAnnouncements: CourseAnnouncement[] = [
  {
    id: 1,
    courseCode: "CS-241",
    title: "Applied Data Engineering",
    department: "Computer Science",
    semester: "2026 Spring",
    announcedAt: "2026-01-12",
    summary: "New elective focused on ETL, warehousing, and analytics ops.",
  },
  {
    id: 2,
    courseCode: "HUM-110",
    title: "Writing for Public Narratives",
    department: "Humanities",
    semester: "2026 Spring",
    announcedAt: "2026-01-20",
    summary: "Cross-grade writing studio with publication-based evaluation.",
  },
];

export const clubReports: ClubReport[] = [
  {
    id: 1,
    organization: "Student Council",
    period: "2025 Q4",
    leaders: ["Chair: Jisoo Kim", "Secretary: Ryan Lee"],
    reportTitle: "Campus Policy Feedback Summary",
    reportUrl: "/files/student-council-2025q4.pdf",
  },
  {
    id: 2,
    organization: "Media Club",
    period: "2025 Q4",
    leaders: ["Lead Editor: Mina Choi"],
    reportTitle: "Weekly Letter Production Retrospective",
    reportUrl: "/files/media-club-2025q4.pdf",
  },
];

export const schoolEvents: SchoolEvent[] = [
  {
    id: 1,
    title: "Spring Festival",
    type: "upcoming",
    eventDate: "2026-04-25",
    location: "Main Field",
    materials: ["Program Schedule", "Booth Guide"],
  },
  {
    id: 2,
    title: "Winter Capstone Expo",
    type: "past",
    eventDate: "2025-12-10",
    location: "Innovation Hall",
    materials: ["Presentation Slides", "Winners List", "Photo Archive"],
  },
];

export const publications: Publication[] = [
  {
    id: 1,
    type: "student-handbook",
    title: "Student Handbook 2026",
    issue: "v2026.1",
    publishDate: "2026-02-01",
    fileUrl: "/files/student-handbook-2026.pdf",
  },
  {
    id: 2,
    type: "weekly-letter",
    title: "Weekly Student Letter",
    issue: "Week 07",
    publishDate: "2026-02-20",
    fileUrl: "/files/weekly-letter-2026-w07.pdf",
  },
];

export const schoolProfiles: SchoolProfile[] = [
  {
    id: 1,
    academicYear: "2024-2025",
    title: "School Profile 2024-2025",
    summary: "Academic outcomes, curriculum highlights, and student activities.",
    fileUrl: "/files/school-profile-2024-2025.pdf",
  },
  {
    id: 2,
    academicYear: "2025-2026",
    title: "School Profile 2025-2026",
    summary: "Updated school metrics, admissions context, and program overview.",
    fileUrl: "/files/school-profile-2025-2026.pdf",
  },
];

export const buildingHistory: BuildingHistory[] = [
  {
    id: 1,
    buildingName: "Innovation Hall",
    timelineYear: 2021,
    changeType: "construction",
    note: "Opened as the main interdisciplinary project venue.",
  },
  {
    id: 2,
    buildingName: "Library East Wing",
    timelineYear: 2024,
    changeType: "renovation",
    note: "Converted into digital archive and collaboration space.",
  },
];

export const alumniProfiles: AlumniProfile[] = [
  {
    id: 1,
    name: "Yuna Seo",
    graduationYear: 2022,
    major: "Computer Science",
    currentRole: "ML Engineer at NovaAI",
    linkedinUrl: "https://linkedin.com/in/yuna-seo",
    snsUrl: "https://x.com/yunaseo",
    consentToShare: true,
  },
  {
    id: 2,
    name: "Daniel Cho",
    graduationYear: 2021,
    major: "Design",
    currentRole: "Product Designer at Orbital",
    linkedinUrl: "https://linkedin.com/in/daniel-cho",
    consentToShare: true,
  },
];

export const gradeTasks: GradeTask[] = [
  {
    id: 1,
    grade: "Grade 9",
    taskTitle: "History reflection essay",
    dueDate: "2026-03-10",
    owner: "Humanities Dept.",
    status: "todo",
  },
  {
    id: 2,
    grade: "Grade 11",
    taskTitle: "Capstone milestone #2 submission",
    dueDate: "2026-03-04",
    owner: "STEM Program",
    status: "in-progress",
  },
  {
    id: 3,
    grade: "Grade 12",
    taskTitle: "University counseling packet upload",
    dueDate: "2026-03-01",
    owner: "Counseling Office",
    status: "todo",
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
