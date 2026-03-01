import { prisma } from "@/lib/prisma";

export interface PublicStudentProfile {
  username: string;
  name: string;
  gradeLevel: string;
  graduationYear: string;
  headline: string;
  bio: string;
  targetMajors: string[];
}

export async function getPublicStudentProfiles() {
  const users = await prisma.user.findMany({
    where: {
      personalPage: {
        is: {
          profileVisibility: "DIRECTORY",
        },
      },
    },
    select: {
      username: true,
      name: true,
      personalPage: {
        select: {
          gradeLevel: true,
          graduationYear: true,
          headline: true,
          bio: true,
          targetMajors: true,
          profileVisibility: true,
        },
      },
    },
  });

  return users
    .filter((user) => user.username && user.personalPage?.profileVisibility === "DIRECTORY")
    .map((user) => ({
      username: user.username as string,
      name: user.name || user.username || "Student",
      gradeLevel: user.personalPage?.gradeLevel || "Unspecified",
      graduationYear: user.personalPage?.graduationYear || "",
      headline: user.personalPage?.headline || "",
      bio: user.personalPage?.bio || "",
      targetMajors: user.personalPage?.targetMajors || [],
    }))
    .sort((a, b) => {
      const gradeCompare = a.gradeLevel.localeCompare(b.gradeLevel);
      if (gradeCompare !== 0) return gradeCompare;
      return a.name.localeCompare(b.name);
    });
}

export async function getPublicStudentProfile(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      username: true,
      name: true,
      personalPage: {
        select: {
          gradeLevel: true,
          graduationYear: true,
          headline: true,
          bio: true,
          targetMajors: true,
          profileVisibility: true,
        },
      },
    },
  });

  if (!user?.username || user.personalPage?.profileVisibility !== "DIRECTORY") {
    return null;
  }

  return {
    username: user.username,
    name: user.name || user.username || "Student",
    gradeLevel: user.personalPage?.gradeLevel || "Unspecified",
    graduationYear: user.personalPage?.graduationYear || "",
    headline: user.personalPage?.headline || "",
    bio: user.personalPage?.bio || "",
    targetMajors: user.personalPage?.targetMajors || [],
  };
}

export function groupStudentsByGrade(students: PublicStudentProfile[]) {
  return students.reduce<Record<string, PublicStudentProfile[]>>((acc, student) => {
    const key = student.gradeLevel || "Unspecified";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(student);
    return acc;
  }, {});
}
