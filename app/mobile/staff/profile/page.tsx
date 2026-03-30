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
    <div className="space-y-10">
      <ProfileCard user={user} teamName={teamName} />
      
      <div className="space-y-8 px-2">
        <div className="space-y-6">
          <h2 className="text-headline-sm font-bold text-on-surface tracking-tight">
            ข้อมูลส่วนตัว
          </h2>
          <ProfileEditForm
            user={user}
            onSubmit={updateProfileAction}
          />
        </div>

        <div className="space-y-6">
          <h2 className="text-headline-sm font-bold text-on-surface tracking-tight">
            ความปลอดภัย
          </h2>
          <ChangePasswordForm onSubmit={changePasswordAction} />
        </div>

        <div className="pt-8">
          <SignOutButton 
            variant="destructive" 
            className="w-full h-16 rounded-2xl text-headline-sm font-bold shadow-2xl shadow-error/10"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Mobile staff profile page — single-column stacked layout.
 */
export default function MobileStaffProfilePage() {
  return (
    <div className="min-h-screen bg-surface-container-lowest px-6 pt-10 pb-36">
      <div className="mb-10 space-y-2">
        <h1 className="text-display-lg font-bold text-on-surface tracking-tight">
          โปรไฟล์
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          จัดการข้อมูลส่วนตัวและรหัสผ่านของคุณให้ทันสมัย
        </p>
      </div>

      <Suspense fallback={<ProfilePageSkeleton />}>
        <ProfileContent />
      </Suspense>
    </div>
  );
}
