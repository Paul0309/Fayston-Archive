import { prisma } from "@/lib/prisma";

export interface PersonalPagePayload {
  user: {
    id: string;
    name: string | null;
    username: string | null;
    email: string | null;
    role: string;
  };
  page: {
    headline: string;
    bio: string;
    graduationYear: string;
    targetMajors: string[];
    targetColleges: string[];
    transcriptNote: string;
    transcripts: {
      id: string;
      term: string;
      course: string;
      grade: string;
      notes: string;
      sortOrder: number;
    }[];
    projects: {
      id: string;
      title: string;
      year: string;
      summary: string;
      link: string;
      status: string;
      sortOrder: number;
    }[];
  };
}

export async function getOrCreatePersonalPageByUserId(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      personalPage: {
        include: {
          transcripts: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
          projects: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  if (user.personalPage) {
    return user;
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      personalPage: {
        create: {},
      },
    },
    include: {
      personalPage: {
        include: {
          transcripts: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
          projects: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
        },
      },
    },
  });
}

export function serializePersonalPage(
  user: Awaited<ReturnType<typeof getOrCreatePersonalPageByUserId>>,
): PersonalPagePayload | null {
  if (!user || !user.personalPage) {
    return null;
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    page: {
      headline: user.personalPage.headline ?? "",
      bio: user.personalPage.bio ?? "",
      graduationYear: user.personalPage.graduationYear ?? "",
      targetMajors: user.personalPage.targetMajors,
      targetColleges: user.personalPage.targetColleges,
      transcriptNote: user.personalPage.transcriptNote ?? "",
      transcripts: user.personalPage.transcripts.map((item) => ({
        id: item.id,
        term: item.term,
        course: item.course,
        grade: item.grade,
        notes: item.notes ?? "",
        sortOrder: item.sortOrder,
      })),
      projects: user.personalPage.projects.map((item) => ({
        id: item.id,
        title: item.title,
        year: item.year ?? "",
        summary: item.summary,
        link: item.link ?? "",
        status: item.status ?? "",
        sortOrder: item.sortOrder,
      })),
    },
  };
}
