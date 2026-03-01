import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import PersonalPageEditor from "@/components/PersonalPageEditor";
import { authOptions } from "@/lib/auth";
import { getOrCreatePersonalPageByUserId, serializePersonalPage } from "@/lib/personalPage";

export default async function MyPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await getOrCreatePersonalPageByUserId(session.user.id);
  const payload = serializePersonalPage(user);

  if (!payload) {
    redirect("/");
  }

  return (
    <main className="px-4 py-8">
      <div className="mx-auto w-full max-w-6xl">
        <PersonalPageEditor
          initialPayload={payload}
          endpoint="/api/me/page"
          counselorEndpoint="/api/me/counselor"
          canManage
        />
      </div>
    </main>
  );
}
