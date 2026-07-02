import { component$, useSignal, useStore, $ } from "@builder.io/qwik";

const PLACEHOLDER_USERS = ["Daniel", "Fredrik", "John"];

export const DataView = component$(() => {
  const userOpen = useSignal(false);
  const state = useStore({ userIndex: -1, tab: "bets" as "bets" | "settlements" });

  const pick = $((i: number) => {
    state.userIndex = i;
    userOpen.value = false;
  });

  const chosen = state.userIndex >= 0;
  const isAdmin = state.userIndex === -2;

  const currentLabel = isAdmin
  ? "Admin - All Users"
  : state.userIndex >= 0
    ? PLACEHOLDER_USERS[state.userIndex]
    : "Select a user";

  return (
    <div class="data">
      <div class="data__bar">
        <div class="data__pick">
          <span class="eyebrow">Viewing data for</span>
          <div class="dd">
            <button
              class="dd__btn"
              aria-haspopup="listbox"
              aria-expanded={userOpen.value}
              onClick$={() => (userOpen.value = !userOpen.value)}
            >
              <span data-empty={!chosen}>{currentLabel}</span>
              <span class="dd__chev" data-open={userOpen.value}>▾</span>
            </button>
            {userOpen.value && (
              <ul class="dd__menu" role="listbox">
                <li role="option" aria-selected={isAdmin}>
                  <button class="dd__opt dd__opt--admin" onClick$={() => pick(-2)}>
                    <span>Admin - All Users</span>
                    {isAdmin && <span class="dd__check">✓</span>}
                  </button>
                </li>
                <li class="dd_divider"></li>
                {PLACEHOLDER_USERS.map((u, i) => (
                    <li key={i} role="option" aria-selected={state.userIndex === i}>
                      <button class="dd__opt" onClick$={() => pick(i)}>
                        {u}
                        {state.userIndex === i && <span class="dd__check">✓</span>}
                      </button>
                    </li>
                ))}
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
            <button class="tab" data-active={state.tab === "bets"} onClick$={() => (state.tab = "bets")}>
              Bets
            </button>
            <button class="tab" data-active={state.tab === "settlements"} onClick$={() => (state.tab = "settlements")}>
              Settlements
            </button>
          </div>

          <div class="table">
            <div class="table__head">
              {state.tab === "bets" ? (
                <>
                  <span>Event</span><span>Selection</span><span>Stake</span><span>Status</span><span>Placed</span>
                </>
              ) : (
                <>
                  <span>Bet</span><span>Result</span><span>Payout</span><span>Settled</span><span>Ref</span>
                </>
              )}
            </div>
            <div class="empty" style="border:none; padding:2.5rem 1rem;">
              <strong>No {state.tab} yet</strong>
              {isAdmin
                ? `All users' ${state.tab} will appear here.`
                : state.tab === "bets"
                  ? "This user's placed bets will appear here."
                  : "Settled outcomes for this user will appear here."}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={CSS}></style>
    </div>
  );
});

const CSS = `
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
  .table__head {
    display: grid; grid-template-columns: 2fr 1.4fr 1fr 1fr 1.2fr; gap: 1rem;
    padding: 0.7rem 1.1rem; border-bottom: 1px solid var(--slate-150);
    font-family: var(--font-mono); font-size: var(--step--1);
    letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-500);
  }
`;

export default DataView;
