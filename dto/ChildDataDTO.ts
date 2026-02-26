export interface ChildDataResponse {
  id: number;
  childId: number;
  locationId: number;
  height: number;
  weight: number;
  heightDevelopmentId: number;
  weightDevelopmentId: number;
  index: number;
  heightDate: Date;
  userCreated: string;
  userUpdated: string;
  createdAt: Date;
  updatedAt: Date;
  deleteStatus: boolean;
  status: "IN_AREA" | "OUT_AREA" | "UNKNOWN" | "DIED";
  heightDevelopment?: import("./DevelopmentDTO").DevelopmentResponse;
  weightDevelopment?: import("./DevelopmentDTO").DevelopmentResponse;
}
