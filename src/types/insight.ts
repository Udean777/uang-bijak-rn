export type InsightType = "warning" | "info" | "success" | "danger";

export interface SmartInsight {
  id: string;
  type: InsightType;
  title: string;
  message: string;
  icon: string;
  category?: string;
  percentage?: number;
}
