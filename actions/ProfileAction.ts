import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type { UserResponse, UpdateUserDto } from "@/dto";
import { getCurrentUserId } from "@/lib/auth/auth-guard";

export class ProfileAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT || "";
  // Helper to get the base URL for API calls
  private static getBaseUrl(): string {
    return typeof window === 'undefined' ? this.BACKEND_ENDPOINT : "/api";
  }

  /**
   * Fetch the current user's profile data.
   */
  static async getCurrentUser(): Promise<UserResponse> {
    const userId = await getCurrentUserId();
    let activeHeaders = undefined;
    if (typeof window === 'undefined') {
      const { getForwardHeaders } = await import("@/lib/auth/header-utils");
      activeHeaders = await getForwardHeaders();
    }
    const response = await axios.get(
      `${this.getBaseUrl()}/users/getById/${userId}`,
      { headers: activeHeaders }
    );
    return response.data as UserResponse;
  }

  /**
   * Update the current user's profile (firstName, lastName, email, image).
   */
  static async updateCurrentUser(
    data: UpdateUserDto,
  ): Promise<UserResponse> {
    const userId = await getCurrentUserId();
    let activeHeaders = undefined;
    if (typeof window === 'undefined') {
      const { getForwardHeaders } = await import("@/lib/auth/header-utils");
      activeHeaders = await getForwardHeaders();
    }
    const response = await axios.patch(
      `${this.getBaseUrl()}/users/${userId}`,
      data,
      { headers: activeHeaders }
    );
    return response.data as UserResponse;
  }

  /**
   * Change the current user's password via BetterAuth endpoint.
   * TODO: Implement when BetterAuth is activated.
   */
}
