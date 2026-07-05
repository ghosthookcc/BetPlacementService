import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";

import { useStyles$ } from "@builder.io/qwik";

import type { BetSummary } from "src/types";

interface Props {
  apiBaseUrl: string;
  limit?: number;
}

const POLL_EVERY_MS = 10_000;

function selectionLabel(
  sel: string,
  teamA: string | null,
  teamB: string | null,
): string {
  switch (sel) {
    case "TEAM_A_WIN":
      return teamA ?? "Team A";
    case "TEAM_B_WIN":
      return teamB ?? "Team B";
    case "DRAW":
      return "Draw";
    default:
      return sel;
  }
}

function timeLabel(iso: string, nowMs: number): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) {
    return "";
  }
  const diffMs = nowMs - then;
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMs < 60_000) {
    return "just now";
  }
  if (diffMin < 10) {
    return `${diffMin}m ago`;
  }
  const date = new Date(then);
  const now = new Date(nowMs);
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  if (sameDay) {
    return `${hh}:${mm}`;
  }
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month} ${hh}:${mm}`;
}

export const HistoryFeed = component$<Props>(({ apiBaseUrl, limit = 20 }) => {
  useStyles$(`
  .tickets { display: flex; flex-direction: column; min-width: 0; }
  .ticket { padding: 0.75rem 0.8rem; border-radius: var(--radius); min-width: 0; }
  .ticket + .ticket { border-top: 1px solid var(--slate-100); }
  .ticket__top { display: flex; justify-content: space-between; align-items: baseline; gap: 0.5rem; min-width: 0; }
  .ticket__who { font-weight: 600; font-size: var(--step-0); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ticket__when { font-size: var(--step--1); color: var(--ink-500); flex: none; }
  .ticket__match { color: var(--ink-300); font-size: var(--step--1); margin-top: 0.2rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ticket__line { display: flex; justify-content: space-between; align-items: center; margin-top: 0.45rem; gap: 0.5rem; min-width: 0; }
  .ticket__line .tag { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ticket__amt { font-size: var(--step--1); color: var(--ink-300); flex: none; white-space: nowrap; }`);

  const bets = useSignal<BetSummary[]>([]);
  const loaded = useSignal(false);
  const error = useSignal(false);
  const now = useSignal(Date.now());

  useVisibleTask$(({ cleanup }) => {
    let active = true;

    const load = async () => {
      if (!active) {
        return;
      }
      try {
        const res = await fetch(`${apiBaseUrl}/api/bets/latest?limit=${limit}`);
        if (!active) {
          return;
        }
        if (res.ok) {
          bets.value = (await res.json()) as BetSummary[];
          error.value = false;
        } else {
          error.value = true;
        }
      } catch {
        if (active) {
          error.value = true;
        }
      } finally {
        if (active) {
          loaded.value = true;
        }
      }
    };

    const updateNow = () => {
      now.value = Date.now();
    };

    load();
    const poll = setInterval(load, POLL_EVERY_MS);
    const tick = setInterval(updateNow, 30_000);

    cleanup(() => {
      active = false;
      clearInterval(poll);
      clearInterval(tick);
    });
  });

  const list = bets.value;

  return (
    <div class="feed__scroll">
      {!loaded.value ? (
        <div class="empty" style="margin: 0.6rem;">
          <strong>Loading . . .</strong>
          Fetching the latest bets.
        </div>
      ) : error.value && list.length === 0 ? (
        <div class="empty" style="margin: 0.6rem;">
          <strong>Feed unavailable</strong>
          Couldn't reach the betting service.
        </div>
      ) : list.length === 0 ? (
        <div class="empty" style="margin: 0.6rem;">
          <strong>No bets yet</strong>
          New bets will stream in here as they're placed.
        </div>
      ) : (
        <div class="tickets">
          {list.map((b) => (
            <div key={b.id} class="ticket">
              <div class="ticket__top">
                <span class="ticket__who">{b.userFullName ?? "Unknown"}</span>
                <span class="ticket__when mono">
                  {timeLabel(b.placedAt, now.value)}
                </span>
              </div>
              <div class="ticket__match">{`${b.teamA ?? "Team A"} vs ${b.teamB ?? "Team B"}`}</div>
              <div class="ticket__line">
                <span class="tag tag--sel">
                  {selectionLabel(b.selection, b.teamA, b.teamB)}
                </span>
                <span class="ticket__amt mono">
                  SEK{b.stake.toFixed(2)} @ {b.odds.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default HistoryFeed;
