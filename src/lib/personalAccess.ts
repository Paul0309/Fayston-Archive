import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";

export async function resolvePersonalPageAccess(params: {
  username?: string;
  sessionUserId: string;
  sessionRole?: string | null;
}) {
  if (!params.username) {
    return prisma.user.findUnique({
      where: { id: params.sessionUserId },
      include: {
        personalPage: {
          include: {
            transcripts: {
              orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            },
            transcriptDocs: {
              orderBy: [{ createdAt: "desc" }],
            },
            projects: {
              orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            },
          },
        },
      },
    });
  }

  const target = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      personalPage: {
        include: {
          transcripts: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
          transcriptDocs: {
            orderBy: [{ createdAt: "desc" }],
          },
          projects: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
        },
      },
    },
  });

  if (!target) {
    return null;
  }

  const isOwner = target.id === params.sessionUserId;
  if (!isOwner && !isAdminRole(params.sessionRole)) {
    return "FORBIDDEN" as const;
  }

  return target;
}
