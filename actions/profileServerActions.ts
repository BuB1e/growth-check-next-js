"use server";

import { ProfileAction } from "@/actions/ProfileAction";
import type { UpdateUserDto } from "@/dto";
import type { ChangePasswordDto } from "@/actions/ProfileAction";

/**
 * Server action: update current user's profile.
 * Called from ProfileEditForm via form submit.
 */
export async function updateProfileAction(data: UpdateUserDto): Promise<void> {
  await ProfileAction.updateCurrentUser(data);
}

/**
 * Server action: change current user's password.
 * Called from ChangePasswordForm via form submit.
 */
export async function changePasswordAction(
  data: ChangePasswordDto,
): Promise<void> {
  await ProfileAction.changePassword(data);
}
