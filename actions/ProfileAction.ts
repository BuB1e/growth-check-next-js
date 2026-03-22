import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type { UserResponse, UpdateUserDto } from "@/dto";

// TODO: Replace ChangePasswordDto with BetterAuth's built-in type when auth is activated
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

/**
 * Server-side action for current user profile operations.
 * Uses MOCK_USER_ID for development; ready for BetterAuth session when activated.
 */
export class ProfileAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT || "";
  // Helper to get the base URL for API calls
  private static getBaseUrl(): string {
    return typeof window === 'undefined' ? this.BACKEND_ENDPOINT : "/api";
  }

  /**
   * Get the current authenticated user's ID.
   * TODO: Replace with BetterAuth session lookup when auth is activated.
   */
  private static getCurrentUserId(): string {
    const mockUserId = EnvConfig.MOCK_USER_ID;
    if (!mockUserId) {
      throw new Error(
        "No authenticated user found. MOCK_USER_ID is not set and BetterAuth session is not active.",
      );
    }
    return mockUserId;
  }

  /**
   * Fetch the current user's profile data.
   */
  static async getCurrentUser(): Promise<UserResponse> {
    const userId = this.getCurrentUserId();
    const response = await axios.get(
      `${this.getBaseUrl()}/users/getById/${userId}`,
    );
    return response.data as UserResponse;
  }

  /**
   * Update the current user's profile (firstName, lastName, email, image).
   */
  static async updateCurrentUser(
    data: UpdateUserDto,
  ): Promise<UserResponse> {
    const userId = this.getCurrentUserId();
    const response = await axios.patch(
      `${this.getBaseUrl()}/users/${userId}`,
      data,
    );
    return response.data as UserResponse;
  }

  /**
   * Change the current user's password via BetterAuth endpoint.
   * TODO: Implement when BetterAuth is activated.
   */
  static async changePassword(data: ChangePasswordDto): Promise<void> {
    // TODO: Call BetterAuth change-password endpoint
    // await axios.post(`${this.AUTH_ENDPOINT}/api/auth/change-password`, data);
    console.warn(
      "ProfileAction.changePassword: BetterAuth not active — password change is a no-op.",
    );
    void data;
  }
}
