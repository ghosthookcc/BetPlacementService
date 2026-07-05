export interface BetSummary {
  id: number;
  userFullName: string | null;
  teamA: string | null;
  teamB: string | null;
  selection: string;
  stake: number;
  odds: number;
  state: string;
  placedAt: string; // ISO timestamp
}

export interface BetRow {
  id: number;
  userFullName: string | null;
  teamA: string | null;
  teamB: string | null;
  selection: string;
  stake: number;
  odds: number;
  state: string;
  placedAt: string;
}
