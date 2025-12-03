// TripSplit domain primitives -------------------------------------------------

export type TripSplitId = string;

export type TripSplitCurrencyCode = 'CHF' | 'EUR' | 'USD';

export type TripSplitSplitMode = 'equal' | 'singlePayer' | 'custom';

// Participants ----------------------------------------------------------------

export type TripSplitParticipant = {
  id: TripSplitId;
  name: string;
  email?: string;
};

export type TripSplitNewParticipantInput = {
  name: string;
  email?: string;
};

// Expenses --------------------------------------------------------------------

export type TripSplitExpenseSplit = {
  participantId: TripSplitId;
  share: number; // Betrag in der Gruppenwaehrung
};

export type TripSplitExpense = {
  id: TripSplitId;
  groupId: TripSplitId;
  description: string;
  amount: number;
  currency: TripSplitCurrencyCode;
  paidBy: TripSplitId; // participantId
  splits: TripSplitExpenseSplit[];
  splitMode: TripSplitSplitMode;
  createdAt: string; // ISO Timestamp
};

export type TripSplitNewExpenseInput = {
  description: string;
  amount: number;
  currency: TripSplitCurrencyCode;
  paidBy: TripSplitId;
  splits: TripSplitExpenseSplit[];
  splitMode?: TripSplitSplitMode;
};

// Groups ----------------------------------------------------------------------

export type TripSplitGroup = {
  id: TripSplitId;
  name: string;
  participants: TripSplitParticipant[];
  expenses: TripSplitExpense[];
  createdAt: string;
  updatedAt: string;
};

export type TripSplitNewGroupInput = {
  name: string;
};

export type TripSplitGroupsState = TripSplitGroup[];

// Balances --------------------------------------------------------------------

export type TripSplitBalance = {
  participantId: TripSplitId;
  net: number;
};

export type TripSplitSettlement = {
  fromParticipantId: TripSplitId;
  toParticipantId: TripSplitId;
  amount: number;
};
