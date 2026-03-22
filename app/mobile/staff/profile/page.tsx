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
import { SignOutButton } from "@/components/features/shared/SignOutButton";

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
    <div className="space-y-5">
      <ProfileCard user={user} teamName={teamName} />
      <ProfileEditForm
        user={user}
        onSubmit={updateProfileAction}
      />
      <ChangePasswordForm onSubmit={changePasswordAction} />
      <div className="pt-4">
        <SignOutButton variant="destructive" className="w-full h-14 text-lg" />
      </div>
    </div>
  );
}

/**
 * Mobile staff profile page — single-column stacked layout.
 */
export default function MobileStaffProfilePage() {
  return (
    <div className="px-4 py-6 pb-24">
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          โปรไฟล์ของฉัน
        </h1>
        <p className="mt-1 text-[15px] text-gray-500">
          จัดการข้อมูลส่วนตัวและรหัสผ่าน
        </p>
      </div>

      <Suspense fallback={<ProfilePageSkeleton />}>
        <ProfileContent />
      </Suspense>
    </div>
  );
}
