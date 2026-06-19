export type Period = "today" | "week" | "month" | "year";

export interface PeriodSummary {
  revenue: number;
  expenses: number;
  payrollExpenses: number;
  profit: number;
  productsSold: number;
  appointments: number;
  activePlans: number;
  productsPurchased: number;
  uniqueClients: number;
  salesCount: number;
  purchasesCount: number;
  avgTicket: number;
}

export interface MonthlyData {
  month: string;
  ingresos: number;
  gastos: number;
}

export interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

export interface WeekdayData {
  day: string;
  citas: number;
}

export interface RecentSale {
  id: number;
  clientName: string;
  total: number;
  itemsCount: number;
  createdAt: Date;
}

export interface RecentPurchase {
  id: number;
  concept: string;
  total: number;
  createdAt: Date;
}

export interface UpcomingAppointment {
  id: number;
  clientName: string;
  date: Date;
  time: string;
  status: string;
  type: string;
}
