export interface LocationCreateRequestResponse {
  id: number;
  userId: string;
  locationName: string;
  locationMap: string;
  province: string;
  district: string;
  sub_district: string;
  zip_code: string;
  status: "APPROVE" | "REJECT" | "WAITING";
  handledBy: string;
  createdAt: Date;
  updatedAt: Date;
  deleteStatus: boolean;
}
