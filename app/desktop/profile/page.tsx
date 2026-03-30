import { Suspense } from "react";
import { ProfileAction } from "@/actions/ProfileAction";
import { TeamAction } from "@/actions/TeamAction";
import { ProfileCard } from "@/components/features/shared/ProfileCard";
import { ProfileEditForm } from "@/components/features/shared/ProfileEditForm";
import { ChangePasswordForm } from "@/components/features/shared/ChangePasswordForm";
import { ProfilePageSkeleton } from "@/components/features/shared/ProfilePageSkeleton";
import {
  updateProfileAction,
  changePasswordAction,
} from "@/actions/profileServerActions";

/**
 * RSC wrapper that fetches profile data server-side.
 */
async function ProfileContent() {
  const user = await ProfileAction.getCurrentUser();

  // Fetch team name if user belongs to a team
  let teamName: string | undefined;
  if (user.teamId) {
    try {
      const teamsResponse = await TeamAction.getTeams({ limit: 100 });
      const teams = Array.isArray(teamsResponse)
        ? teamsResponse
        : teamsResponse?.data ?? [];
      const team = teams.find((t) => t.id === user.teamId);
      teamName = team?.name;
    } catch {
      // TODO: Log error to monitoring when team fetch fails
      teamName = undefined;
    }
  }

  return (
    <div className="space-y-6">
      <ProfileCard user={user} teamName={teamName} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileEditForm
          user={user}
          onSubmit={updateProfileAction}
        />
        <ChangePasswordForm onSubmit={changePasswordAction} />
      </div>
    </div>
  );
}

/**
 * Desktop profile page — two-column layout for edit and password forms.
 */
export default function DesktopProfilePage() {
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          โปรไฟล์ของฉัน
        </h1>
        <p className="mt-1 text-base text-gray-500">
          จัดการข้อมูลส่วนตัวและรหัสผ่านของคุณ
        </p>
      </div>

      <Suspense fallback={<ProfilePageSkeleton />}>
        <ProfileContent />
      </Suspense>
    </div>
  );
}
