export type Participant = {
  id: string;
  name: string;
};

export type ApiExpense = {
  id: string;
  tripId: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  description: string;
  paidByParticipantId: string;
  splitBetweenAll: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ApiTrip = {
  id: string;
  userId: string | null;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  /**
   * Backend liefert aktuell entweder `budget` (neues Feld) oder `totalBudget` (Legacy).
   * Das Frontend mappt beides nach StoreTrip.budget, damit das UI nur einen Wert nutzt.
   */
  totalBudget?: number;
  budget?: number;
  currency: string;
  status: string;
  participants: Participant[];
  createdAt: string;
  updatedAt: string;
  // optional nested expenses for some responses
  expenses?: ApiExpense[];
};

export type StoreExpense = ApiExpense;

export type StoreTrip = {
  id: string;
  name: string;
  destination: string;
  flag: string;
  startDate: string;
  endDate: string;
  /** Kanonisches Budgetfeld fuer das komplette UI. */
  budget: number;
  /**
   * Legacy-Abbild aus der API, nur noch fuer Debug/Logging. UI verwendet ausschliesslich `budget`.
   */
  totalBudget?: number;
  currency: string;
  status: string;
  participants: Participant[];
  expenses: StoreExpense[];
  createdAt: string;
  updatedAt: string;
};
