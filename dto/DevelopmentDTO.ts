export interface DevelopmentResponse {
  id: number;
  status: string;
  metric: "WA" | "HA" | "BMI" | "WH" | "WL";
  detail: string | null;
  minAge: number;
  maxAge: number;
  suggestion: string;
  createdAt: Date;
  updatedAt: Date;
  deleteStatus: boolean;
}
