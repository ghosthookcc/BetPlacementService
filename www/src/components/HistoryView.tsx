import {
  $,
  component$,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";

import { useStyles$ } from "@builder.io/qwik";

import type { BetRow, SettlementRow, User } from "src/types";

interface Props {
  apiBaseUrl: string;
  limit?: number;
}

const POLL_EVERY_MS: number = 10_000;
const SHOW_ALL_USERS_DATA: number = -1;

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
  const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth is 0-based so adding 0 shows the correct month

  return `${day}/${month} ${hh}:${mm}`;
}

function settleTag(state: string): string {
  if (state === "WON") {
    return "tag--win";
  }
  if (state === "LOST") {
    return "tag--lost";
  }
  return "tag--pending";
}

export const HistoryFeed = component$<Props>(({ apiBaseUrl, limit }) => {
  useStyles$(`
  .hx__bar { display: flex; align-items: flex-end; gap: 1rem; margin-bottom: 1.25rem; }
  .hx__pick { display: flex; flex-direction: column; gap: 0.4rem; }
  .dd { position: relative; }
  .dd__btn {
    display: inline-flex; align-items: center; gap: 0.8rem; min-width: 240px;
    justify-content: space-between; background: var(--slate-100); color: var(--ink-100);
    border: 1px solid var(--slate-200); border-radius: var(--radius);
    padding: 0.6rem 0.8rem; cursor: pointer; font: inherit;
  }
  .dd__btn:hover { border-color: var(--amber-dim); }
  .dd__chev { color: var(--ink-500); transition: transform 0.15s; }
  .dd__chev[data-open="true"] { transform: rotate(180deg); }
  .dd__menu {
    position: absolute; left: 0; right: 0; top: calc(100% + 4px); z-index: 20;
    list-style: none; background: var(--slate-100);
    border: 1px solid var(--slate-200); border-radius: var(--radius);
    padding: 0.3rem; box-shadow: 0 12px 30px rgba(0,0,0,0.45);
  }
  .dd__opt {
    width: 100%; display: flex; align-items: center; justify-content: space-between;
    background: transparent; color: var(--ink-100); border: none;
    padding: 0.5rem; border-radius: 3px; cursor: pointer; font: inherit;
  }
  .dd__opt:hover { background: var(--slate-150); }
  .dd__opt--all { color: var(--amber); font-weight: 600; }
  .dd__check { color: var(--amber); }
  .dd__divider { height: 1px; background: var(--slate-200); margin: 0.3rem 0.2rem; }
  .dd__hint { font-family: var(--font-mono); font-size: 0.66rem; color: var(--ink-500); padding: 0.4rem 0.5rem; }

  .hx__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; align-items: start; }
  @media (max-width: 900px) { .hx__grid { grid-template-columns: 1fr; } }

  .hx__panel { background: var(--slate-050); border: 1px solid var(--slate-150); border-radius: var(--radius); }
  .hx__head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.85rem 1.1rem; border-bottom: 1px solid var(--slate-150);
  }
  .hx__body { padding: 0.4rem; max-height: 70vh; overflow-y: auto; }

  .ticket { padding: 0.75rem 0.8rem; border-radius: var(--radius); }
  .ticket + .ticket { border-top: 1px solid var(--slate-100); }
  .ticket__top { display: flex; justify-content: space-between; align-items: baseline; gap: 0.5rem; }
  .ticket__who { font-weight: 600; font-size: var(--step-0); }
  .ticket__when { font-size: var(--step--1); color: var(--ink-500); }
  .ticket__match { color: var(--ink-300); font-size: var(--step--1); margin-top: 0.2rem; }
  .ticket__line { display: flex; justify-content: space-between; align-items: center; margin-top: 0.45rem; }
  .ticket__amt { font-size: var(--step--1); color: var(--ink-300); }`);

  const userOpen = useSignal(false);
  const users = useSignal<User[]>([]);
  const state = useStore({ userIndex: SHOW_ALL_USERS_DATA });

  const bets = useSignal<BetRow[]>([]);
  const settlements = useSignal<SettlementRow[]>([]);

  const loaded = useSignal(false);
  const now = useSignal(Date.now());

  const toggleUserOpen = $(() => {
    userOpen.value = !userOpen.value;
  });

  const pickUser = $(async (idx: number) => {
    state.userIndex = idx;
    userOpen.value = false;
    loaded.value = false;

    const uid =
      idx === SHOW_ALL_USERS_DATA ? null : (users.value[idx]?.id ?? null);

    const query = uid != null ? `?userId=${uid}` : "";
    const settlementsQuery =
      uid != null ? `?userId=${uid}&limit=${limit}` : `?limit=${limit}`;

    try {
      const [betsRequest, settlementsRequest] = await Promise.all([
        fetch(`${apiBaseUrl}/api/bets${query}`),
        fetch(`${apiBaseUrl}/api/settlements${settlementsQuery}`),
      ]);

      if (betsRequest.ok) {
        bets.value = (await betsRequest.json()) as BetRow[];
      }
      if (settlementsRequest.ok) {
        settlements.value =
          (await settlementsRequest.json()) as SettlementRow[];
      }
    } catch {
    } finally {
      loaded.value = true;
    }
  });

  useVisibleTask$(({ cleanup }) => {
    let active = true;

    const loadUsers = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/users`);
        if (active && response.ok) {
          users.value = (await response.json()) as User[];
        }
      } catch {}
    };

    const loadData = async () => {
      const uid =
        state.userIndex === SHOW_ALL_USERS_DATA
          ? null
          : (users.value[state.userIndex]?.id ?? null);
      const query = uid != null ? `?userId=${uid}` : "";
      const settlementQuery =
        uid != null ? `?userId=${uid}&limit=${limit}` : `?limit=${limit}`;

      try {
        const [betsRequest, settlementsRequest] = await Promise.all([
          fetch(`${apiBaseUrl}/api/bets${query}`),
          fetch(`${apiBaseUrl}/api/settlements${settlementQuery}`),
        ]);

        if (!active) {
          return;
        }

        if (betsRequest.ok) {
          bets.value = (await betsRequest.json()) as BetRow[];
        }
        if (settlementsRequest.ok) {
          settlements.value =
            (await settlementsRequest.json()) as SettlementRow[];
        }
      } catch {
      } finally {
        if (active) {
          loaded.value = true;
        }
      }
    };

    function updateNow() {
      now.value = Date.now();
    }

    loadUsers();
    loadData();

    updateNow();

    const poll = setInterval(loadData, POLL_EVERY_MS);
    const tick = setInterval(updateNow, 30_000);

    cleanup(() => {
      active = false;
      clearInterval(poll);
      clearInterval(tick);
    });
  });

  return (
    <div class="hx">
      <div class="hx__bar">
        <div class="hx__pick">
          <span class="eyebrow">Showing activity for</span>
          <div class="dd">
            <button
              type="button"
              class="dd__btn"
              aria-haspopup="listbox"
              aria-expanded={userOpen.value}
              onClick$={toggleUserOpen}
            >
              <span>
                {state.userIndex === SHOW_ALL_USERS_DATA
                  ? "All users"
                  : (users.value[state.userIndex]?.fullName ?? "All Users")}
              </span>
              <span class="dd__chev" data-open={userOpen.value}>
                ▾
              </span>
            </button>
            {userOpen.value && (
              <ul class="dd__menu">
                <li aria-selected={state.userIndex === SHOW_ALL_USERS_DATA}>
                  <button
                    type="button"
                    class="dd__opt dd__opt--all"
                    onClick$={() => pickUser(SHOW_ALL_USERS_DATA)}
                  >
                    <span>Admin - All Users</span>
                    {state.userIndex === SHOW_ALL_USERS_DATA && (
                      <span class="dd__check">✓</span>
                    )}
                  </button>
                </li>
                <li class="dd__divider" />
                {users.value.length === 0 ? (
                  <li class="dd__hint">No users available</li>
                ) : (
                  users.value.map((user, idx) => (
                    <li key={user.id} aria-selected={state.userIndex === idx}>
                      <button
                        type="button"
                        class="dd__opt"
                        onClick$={() => pickUser(idx)}
                      >
                        {user.fullName}
                        {state.userIndex === idx && (
                          <span class="dd__check">✓</span>
                        )}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div class="hx__grid">
        <div class="hx__panel">
          <div class="hx__head">
            <span class="eyebrow">Latest bets</span>
            <div class="feed__live">
              <span class="feed__pulse" />
              <span class="eyebrow" style="letter-spacing: 0.1em;">
                live
              </span>
            </div>
          </div>
          <div class="hx__body">
            {!loaded.value ? (
              <div class="empty" style="margin: 0.6rem;">
                <strong>Loading . . .</strong>
              </div>
            ) : bets.value.length === 0 ? (
              <div class="empty" style="margin: 0.6rem;">
                <strong>No bets</strong>
                Nothing to show for this selection.
              </div>
            ) : (
              bets.value.map((bets) => (
                <div key={bets.id} class="ticket">
                  <div class="ticket__top">
                    <span class="ticket__who">
                      {bets.userFullName ?? "Unknown"}
                    </span>
                    <span class="ticket__when mono">
                      {timeLabel(bets.placedAt, now.value)}
                    </span>
                  </div>
                  <div class="ticket__match">{`${bets.teamA ?? "Team A"} vs ${bets.teamB ?? "Team B"}`}</div>
                  <div class="ticket__line">
                    <span class="tag tag--sel">
                      {selectionLabel(bets.selection, bets.teamA, bets.teamB)}
                    </span>
                    <span class="ticket__amt mono">
                      SEK{bets.stake.toFixed(2)} @ {bets.odds.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div class="hx__panel">
          <div class="hx__head">
            <span class="eyebrow">Latest settlements</span>
            <div class="feed__live">
              <span class="feed__pulse" />
              <span class="eyebrow" style="letter-spacing: 0.1em;">
                live
              </span>
            </div>
          </div>
          <div class="hx__body">
            {!loaded.value ? (
              <div class="empty" style="margin: 0.6rem;">
                <strong>Loading . . .</strong>
              </div>
            ) : settlements.value.length === 0 ? (
              <div class="empty" style="margin: 0.6rem;">
                <strong>No settlements</strong>
                Settlements will appear here once bets are settled.
              </div>
            ) : (
              settlements.value.map((settlement) => (
                <div key={settlement.id} class="ticket">
                  <div class="ticket__top">
                    <span class="ticket__who">
                      {settlement.userFullName ?? "Unknown"}
                    </span>
                    <span class="ticket__when mono">
                      {timeLabel(settlement.settledAt, now.value)}
                    </span>
                  </div>
                  <div class="ticket__match">{`${settlement.teamA ?? "Team A"} vs ${settlement.teamB ?? "Team B"}`}</div>
                  <div class="ticket__line">
                    <span class={`tag ${settleTag(settlement.state)}`}>
                      {settlement.state}
                    </span>
                    <span class="ticket__amt mono">
                      SEK{settlement.payout.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default HistoryFeed;
