import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type { UserResponse, UpdateUserDto } from "@/dto";
import { getCurrentUserId } from "@/lib/auth/auth-guard";

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export class ProfileAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT || "";
  static API_ENDPOINT = "/users";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getCurrentUser(): Promise<UserResponse> {
    const userId = await getCurrentUserId();
    let activeHeaders = undefined;
    if (typeof window === 'undefined') {
      const { getForwardHeaders } = await import("@/lib/auth/header-utils.server");
      activeHeaders = await getForwardHeaders();
    }
    const response = await axios.get(
      `${this.ACTION_ENDPOINT}/getById/${userId}`,
      { headers: activeHeaders }
    );
    return response.data;
  }
  static async updateCurrentUser(
    data: UpdateUserDto,
  ): Promise<UserResponse> {
    const userId = await getCurrentUserId();
    let activeHeaders = undefined;
    if (typeof window === 'undefined') {
      const { getForwardHeaders } = await import("@/lib/auth/header-utils.server");
      activeHeaders = await getForwardHeaders();
    }
    const response = await axios.patch(
      `${this.ACTION_ENDPOINT}/${userId}`,
      data,
      { headers: activeHeaders }
    );
    return response.data;
  }


  static async changePassword(data: ChangePasswordDto): Promise<void> {
    // TODO: Implement when BetterAuth is activated
    throw new Error("Password change not yet implemented");
  }
}
