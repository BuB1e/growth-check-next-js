export interface AiPredictionResponse {
  id: number;
  childId: number;
  heightDevelopmentId: number;
  weightDevelopmentId: number;
  dataMonthsUsed: number;
  modelUsed: string;
  modelVersion: string;
  dateTime: Date;
  month: number;
  height: number;
  weight: number;
  createdAt: Date;
}
