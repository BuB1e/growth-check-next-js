import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import { getForwardHeaders } from "./header-utils.server";
import { Role } from "@/types";
import { Session } from "@/types/auth";

export async function getCurrentSession(): Promise<Session | null> {
  const backendUrl = EnvConfig.BACKEND_ENDPOINT || "";
  const headers = await getForwardHeaders();

  try {
    const response = await axios.get(`${backendUrl}/api/auth/get-session`, {
      headers,
    });
    return response.data;
  } catch {
    return null;
  }
}
