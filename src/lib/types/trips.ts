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

export type TripStatus = 'planning' | 'planned' | 'active' | 'completed' | 'cancelled';

export type ApiTrip = {
  id: string;
  userId: string | null;
  name: string;
  title: string;
  destinationName: string;
  destinationLat?: number;
  destinationLon?: number;
  destinationCountry?: string;
  cityName?: string;
  countryName?: string;
  latitude?: number;
  longitude?: number;
  heroImageUrl?: string | null;
  weatherPreview?: WeatherPreview | null;
  startDate: string;
  endDate: string;
  /**
   * Backend liefert aktuell entweder `budget` (neues Feld) oder `totalBudget` (Legacy).
   * Das Frontend mappt beides nach StoreTrip.budget, damit das UI nur einen Wert nutzt.
   */
  totalBudget?: number;
  budget?: number;
  currency: string;
  status: TripStatus;
  participants: Participant[];
  createdAt: string;
  updatedAt: string;
  // optional nested expenses for some responses
  expenses?: ApiExpense[];
};

export type WeatherPreview = {
  minTemp?: number;
  maxTemp?: number;
  description?: string;
  updatedAt?: string;
} | null;

export type StoreExpense = ApiExpense;

export type StoreTrip = {
  id: string;
  userId: string | null;
  name: string;
  title: string;
  destinationName: string;
  destinationLat?: number;
  destinationLon?: number;
  destinationCountry?: string;
  cityName?: string;
  countryName?: string;
  latitude?: number;
  longitude?: number;
  heroImageUrl?: string | null;
  weatherPreview?: WeatherPreview;
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
  status: TripStatus;
  participants: Participant[];
  expenses: StoreExpense[];
  createdAt: string;
  updatedAt: string;
};

export type TripPayload = {
  name: string;
  title?: string;
  destinationName: string;
  destinationLat?: number;
  destinationLon?: number;
  destinationCountry?: string;
  cityName?: string;
  countryName?: string;
  latitude?: number;
  longitude?: number;
  heroImageUrl?: string | null;
  weatherPreview?: WeatherPreview;
  startDate: string;
  endDate: string;
  status?: TripStatus;
  budget?: number;
  totalBudget?: number;
  currency: string;
  participants?: Participant[];
};
