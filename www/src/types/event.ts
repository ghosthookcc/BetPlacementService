export interface Event {
  id: string; // UUID
  categoryId: number;
  teamA: string;
  teamB: string;
  oddsTeamA: number;
  oddsDraw: number;
  oddsTeamB: number;
  state: string;
  startsAt: string | null;
}
