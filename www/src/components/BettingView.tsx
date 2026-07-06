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
}

export const BettingView = component$<Props>(({ apiBaseUrl }) => {
  useStyles$(`
  .data__bar { display: flex; align-items: flex-end; gap: 1rem; }
  .data__pick { display: flex; flex-direction: column; gap: 0.4rem; }
  .dd { position: relative; }
  .dd__btn {
    display: inline-flex; align-items: center; gap: 0.8rem; min-width: 240px;
    justify-content: space-between;
    background: var(--slate-100); color: var(--ink-100);
    border: 1px solid var(--slate-200); border-radius: var(--radius);
    padding: 0.6rem 0.8rem; cursor: pointer; font: inherit;
  }
  .dd__btn:hover { border-color: var(--amber-dim); }
  .dd__btn [data-empty="true"] { color: var(--ink-500); }
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
  .dd__check { color: var(--amber); }
  .dd__opt--admin { color: var(--amber); font-weight: 600; }
  .dd__divider { height: 1px; background: var(--slate-200); margin: 0.3rem 0.2rem; }
  .dd__hint { font-family: var(--font-mono); font-size: 0.66rem; color: var(--ink-500); padding: 0.4rem 0.5rem 0.2rem; }
  .data__panel { margin-top: 1.25rem; }
  .tabs { display: flex; gap: 0.3rem; border-bottom: 1px solid var(--slate-150); margin-bottom: 1rem; }
  .tab {
    background: transparent; border: none; border-bottom: 2px solid transparent;
    color: var(--ink-500); font: inherit; font-weight: 500;
    padding: 0.6rem 0.9rem; cursor: pointer; margin-bottom: -1px;
  }
  .tab:hover { color: var(--ink-100); }
  .tab[data-active="true"] { color: var(--amber); border-bottom-color: var(--amber); }
  .table { background: var(--slate-050); border: 1px solid var(--slate-150); border-radius: var(--radius); overflow: hidden; }
  .table__head, .table__row {
    display: grid; grid-template-columns: 2fr 1.4fr 1fr 1fr 1.2fr; gap: 1rem;
    padding: 0.7rem 1.1rem; align-items: center;
  }
  .table__head--admin, .table__row--admin { grid-template-columns: 1.2fr 2fr 1.4fr 1fr 1fr 1.2fr; }
  .table__head {
    border-bottom: 1px solid var(--slate-150);
    font-family: var(--font-mono); font-size: var(--step--1);
    letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-500);
  }
  .table__row { border-bottom: 1px solid var(--slate-100); font-size: var(--step-0); }
  .table__row:last-child { border-bottom: none; }
  .table__row .mono { color: var(--ink-300); }
  .cell-user { font-weight: 600; }`);

  const ADMIN_USER_SELECTED: number = -2;
  const NO_USER_SELECTED: number = -1;

  function selectionLabel(
    sel: string,
    a: string | null,
    b: string | null,
  ): string {
    if (sel === "TEAM_A_WIN") {
      return a ?? "Team A";
    }
    if (sel === "TEAM_B_WIN") {
      return b ?? "Team B";
    }
    if (sel === "DRAW") {
      return "Draw";
    }
    return sel;
  }

  function fmtTime(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const dd = String(date.getDate()).padStart(2, "0");
    const mo = String(date.getMonth() + 1).padStart(2, "0"); // getMonth is 0-based so adding 0 shows the correct month
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");

    return `${dd}/${mo} ${hh}:${mi}`;
  }

  const userOpen = useSignal(false);
  const users = useSignal<User[]>([]);
  const state = useStore({
    userIndex: NO_USER_SELECTED,
    tab: "bets" as "bets" | "settlements",
  });

  const bets = useSignal<BetRow[]>([]);
  const settlements = useSignal<SettlementRow[]>([]);
  const loading = useSignal(false);
  const error = useSignal(false);

  useVisibleTask$(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/users`);
      if (response.ok) {
        users.value = (await response.json()) as User[];
      }
    } catch {}
  });

  const isAdmin = state.userIndex === ADMIN_USER_SELECTED;
  const chosen = state.userIndex >= 0 || isAdmin;

  const currentLabel = isAdmin
    ? "All Users"
    : state.userIndex >= 0
      ? (users.value[state.userIndex]?.fullName ?? "Select a user")
      : "Select a user";

  const loadData = $(async () => {
    error.value = false;
    loading.value = true;

    bets.value = [];
    settlements.value = [];

    let query = "";
    const admin = state.userIndex === ADMIN_USER_SELECTED;
    if (!admin && state.userIndex >= 0) {
      const uid = users.value[state.userIndex]?.id;
      if (uid != null) {
        query = `?userId=${uid}`;
      }
    }

    try {
      const [betsRequest, settlementsRequest] = await Promise.all([
        fetch(`${apiBaseUrl}/api/bets${query}`),
        fetch(
          `${apiBaseUrl}/api/settlements${query ? `${query}&` : "?"}limit=100`,
        ),
      ]);

      if (betsRequest.ok) {
        bets.value = (await betsRequest.json()) as BetRow[];
      } else {
        error.value = true;
      }

      if (settlementsRequest.ok) {
        settlements.value =
          (await settlementsRequest.json()) as SettlementRow[];
      } else {
        error.value = true;
      }
    } catch {
      error.value = true;
    } finally {
      loading.value = false;
    }
  });

  const pick = $(async (idx: number) => {
    state.userIndex = idx;
    userOpen.value = false;
    await loadData();
  });

  const toggleUserOpen = $(() => {
    userOpen.value = !userOpen.value;
  });
  const switchTab = $((newTab: "bets" | "settlements") => {
    state.tab = newTab;
  });

  return (
    <div class="data">
      <div class="data__bar">
        <div class="data__pick">
          <span class="eyebrow">Viewing data for</span>
          <div class="dd">
            <button
              type="button"
              class="dd__btn"
              aria-haspopup="listbox"
              aria-expanded={userOpen.value}
              onClick$={toggleUserOpen}
            >
              <span data-empty={!chosen}>{currentLabel}</span>
              <span class="dd__chev" data-open={userOpen.value}>
                ▾
              </span>
            </button>
            {userOpen.value && (
              <ul class="dd__menu">
                <li aria-selected={isAdmin}>
                  <button
                    type="button"
                    class="dd__opt dd__opt--admin"
                    onClick$={() => pick(-2)}
                  >
                    <span>Admin - All Users</span>
                    {isAdmin && <span class="dd__check">✓</span>}
                  </button>
                </li>
                <li class="dd_divider" />
                {users.value.length === 0 ? (
                  <li class="dd__hint">No users available</li>
                ) : (
                  users.value.map((user, idx) => (
                    <li key={user.id} aria-selected={state.userIndex === idx}>
                      <button
                        type="button"
                        class="dd__opt"
                        onClick$={() => pick(idx)}
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

      {!chosen ? (
        <div class="empty" style="margin-top:1.25rem;">
          <strong>Pick a user to inspect</strong>
          Choose a user above to see their bets and settlements.
        </div>
      ) : (
        <div class="data__panel">
          <div class="tabs">
            <button
              type="button"
              class="tab"
              data-active={state.tab === "bets" ? "true" : "false"}
              onClick$={() => switchTab("bets")}
            >
              Bets
            </button>
            <button
              type="button"
              class="tab"
              data-active={state.tab === "settlements" ? "true" : "false"}
              onClick$={() => switchTab("settlements")}
            >
              Settlements
            </button>
          </div>

          {loading.value ? (
            <div class="empty" style="border: none; padding: 2.5rem 1rem;">
              <strong>Loading . . .</strong>
            </div>
          ) : error.value ? (
            <div class="empty" style="border: none; padding: 2.5rem 1rem;">
              <strong>Couldn't load data</strong>
              The betting service isn't reachable right now.
            </div>
          ) : state.tab === "bets" ? (
            <div class="table">
              <div
                class={
                  isAdmin ? "table__head table__head--admin" : "table__head"
                }
              >
                {isAdmin && <span>User</span>}
                <span>Event</span>
                <span>Selection</span>
                <span>Stake</span>
                <span>Status</span>
                <span>Placed</span>
              </div>
              {bets.value.length === 0 ? (
                <div class="empty" style="border: none; padding: 2.5rem 1rem;">
                  <strong>No bets</strong>
                  {isAdmin
                    ? "No bets have been placed yet."
                    : "This user has no bets."}
                </div>
              ) : (
                bets.value.map((bet) => (
                  <div
                    key={bet.id}
                    class={
                      isAdmin ? "table__row table__row--admin" : "table__row"
                    }
                  >
                    {isAdmin && (
                      <span class="cell-user">{bet.userFullName ?? "-"}</span>
                    )}
                    <span>{`${bet.teamA ?? "Team A"} vs ${bet.teamB ?? "Team B"}`}</span>
                    <span>
                      {selectionLabel(bet.selection, bet.teamA, bet.teamB)}
                    </span>
                    <span class="mono">SEK{bet.stake.toFixed(2)}</span>
                    <span>{bet.state}</span>
                    <span class="mono">{fmtTime(bet.placedAt)}</span>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div class="table">
              <div
                class={
                  isAdmin ? "table__head table__head--admin" : "table__head"
                }
              >
                {isAdmin && <span>User</span>}
                <span>Event</span>
                <span>Selection</span>
                <span>Payout</span>
                <span>Result</span>
                <span>Settled</span>
              </div>
              {settlements.value.length === 0 ? (
                <div class="empty" style="border: none; padding: 2.5rem 1rem;">
                  <strong>No settlements</strong>
                  {isAdmin
                    ? "No settlements yet."
                    : "This user has no settlements."}
                </div>
              ) : (
                settlements.value.map((settlement) => (
                  <div
                    key={settlement.id}
                    class={
                      isAdmin ? "table__row table__row--admin" : "table__row"
                    }
                  >
                    {isAdmin && (
                      <span class="cell-user">
                        {settlement.userFullName ?? "-"}
                      </span>
                    )}
                    <span>{`${settlement.teamA ?? "Team A"} vs ${settlement.teamB ?? "Team B"}`}</span>
                    <span>
                      {selectionLabel(
                        settlement.selection,
                        settlement.teamA,
                        settlement.teamB,
                      )}
                    </span>
                    <span class="mono">SEK{settlement.payout.toFixed(2)}</span>
                    <span>{settlement.state}</span>
                    <span class="mono">{fmtTime(settlement.settledAt)}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default BettingView;
