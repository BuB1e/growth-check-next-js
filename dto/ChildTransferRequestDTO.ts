export interface ChildTransferRequestResponse {
  id: number;
  userId: string;
  childId: number;
  fromLocation: number;
  toLocation: number;
  handledBy: string;
  createdAt: Date;
  updatedAt: Date;
  deleteStatus: boolean;
}
