export interface SettlementRow {
  id: number;
  betId: number;
  userFullName: string | null;
  teamA: string | null;
  teamB: string | null;
  selection: string;
  payout: number;
  state: string;
  settledAt: string;
}
