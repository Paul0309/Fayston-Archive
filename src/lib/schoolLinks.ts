export interface SchoolLink {
  id: number;
  name: string;
  type: "official" | "student-made" | "community";
  url: string;
  note: string;
  owner: string;
  updatedAt: string;
}

export const schoolLinks: SchoolLink[] = [
  {
    id: 1,
    name: "Fayston Official Website",
    type: "official",
    url: "https://fayston.org",
    note: "Main school portal and announcements.",
    owner: "School Administration",
    updatedAt: "2026-02-25",
  },
  {
    id: 2,
    name: "Fayston Archive API",
    type: "official",
    url: "/api/archive",
    note: "Structured archive data endpoint.",
    owner: "Archive Team",
    updatedAt: "2026-02-26",
  },
  {
    id: 3,
    name: "SchoolBOJ",
    type: "student-made",
    url: "https://faystonoj.vercel.app",
    note: "Student-made problem solving platform.",
    owner: "Student Dev Team",
    updatedAt: "2026-02-20",
  },
  {
    id: 4,
    name: "Fayston GitHub Organization",
    type: "community",
    url: "https://github.com/fayston",
    note: "Open projects and collaboration repos.",
    owner: "Community Maintainers",
    updatedAt: "2026-02-19",
  },
];
