export interface UserCreateStatusResponse {
  id: string;
  userId: string;
  requestStatus: "APPROVE" | "REJECT" | "WAITING";
  rejectReason: string | null;
  updatedBy: string | null;
  updatedAt: Date | null;
  createdAt: Date;
}
