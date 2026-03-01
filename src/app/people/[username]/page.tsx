import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import PersonalPageEditor from "@/components/PersonalPageEditor";
import { authOptions } from "@/lib/auth";
import { getOrCreatePersonalPageByUserId, serializePersonalPage } from "@/lib/personalPage";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";

export default async function PrivateUserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { username } = await params;
  const targetUser = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
    },
  });

  if (!targetUser) {
    notFound();
  }

  const isOwner = targetUser.id === session.user.id;
  const isAdmin = isAdminRole(session.user.role);

  if (!isOwner && !isAdmin) {
    redirect("/me");
  }

  const user = await getOrCreatePersonalPageByUserId(targetUser.id);
  const payload = serializePersonalPage(user);

  if (!payload) {
    notFound();
  }

  return (
    <main className="px-4 py-8">
      <div className="mx-auto w-full max-w-6xl">
        <PersonalPageEditor
          initialPayload={payload}
          endpoint={`/api/people/${username}/page`}
          canManage
          viewingAsAdmin={!isOwner && isAdmin}
        />
      </div>
    </main>
  );
}
