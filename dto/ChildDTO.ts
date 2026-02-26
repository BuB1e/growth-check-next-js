export interface ChildResponse {
  id: number;
  first_name: string;
  last_name: string;
  location_id: number;
  birth_date: Date;
  gender: "male" | "female";
  created_by_user: string;
  created_at: Date;
  updated_at: Date;
  status: "In_Area" | "Out_Area" | "Unknown" | "die";
  delete_status: boolean;
}

export interface CreateChildRequest {
  firstName: string;
  lastName: string;
  birthDate: Date;
  locationId: number;
  weight: number;
  height: number;
}
