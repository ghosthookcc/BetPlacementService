import { $, component$, useSignal, useStore } from "@builder.io/qwik";

import { useStyles$ } from "@builder.io/qwik";

import { getActiveUser } from "src/lib/userStore";
import { placeBet } from "src/lib/betPlacement";

import type { Category, Event } from "src/types";

interface Props {
  categories: Category[];
  apiBaseUrl: string;
  loadError?: boolean;
}

type Selection = "A" | "draw" | "B" | null;

export const BettingFlow = component$<Props>(
  ({ categories, apiBaseUrl, loadError }) => {
    useStyles$(`
  .flow { display: flex; flex-direction: column; gap: 1.5rem; }

  .flow__crumbs { display: flex; align-items: center; gap: 0.55rem; flex-wrap: wrap; }
  .crumb {
    display: inline-flex; align-items: center; gap: 0.4rem;
    background: transparent; border: none; color: var(--ink-500);
    font: inherit; cursor: pointer; padding: 0.2rem 0;
  }
  .crumb[data-active="true"] { color: var(--ink-100); }
  .crumb[data-disabled="true"] { opacity: 0.4; cursor: default; }
  .crumb__n {
    display: inline-grid; place-items: center; width: 18px; height: 18px;
    border: 1px solid var(--slate-200); border-radius: 3px; font-size: 0.7rem;
  }
  .crumb[data-active="true"] .crumb__n { border-color: var(--amber-dim); color: var(--amber); }
  .crumb__sep { color: var(--slate-200); }

  .flow__step-head { margin-bottom: 0.75rem; }

  .cat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.7rem; }
  .cat {
    display: flex; flex-direction: column; align-items: flex-start; gap: 0.6rem;
    background: var(--slate-050); border: 1px solid var(--slate-150);
    border-radius: var(--radius); padding: 1rem; cursor: pointer;
    color: var(--ink-100); transition: border-color 0.12s, transform 0.12s;
  }
  .cat:hover { border-color: var(--slate-200); transform: translateY(-1px); }
  .cat[data-active="true"] { border-color: var(--amber); background: var(--amber-wash); }
  .cat__glyph { font-size: 1.4rem; }
  .cat__label { font-family: var(--font-display); font-weight: 600; }

  .ev-list { display: flex; flex-direction: column; gap: 0.5rem; }
  .ev {
    display: grid;
    grid-template-columns: auto 1fr auto auto; align-items: center; gap: 0.9rem;
    background: var(--slate-050); border: 1px solid var(--slate-150);
    border-radius: var(--radius); padding: 0.8rem 1rem; cursor: pointer;
    color: var(--ink-100); text-align: left;
  }
  .ev:hover { border-color: var(--slate-200); }
  .ev[data-active="true"] { border-color: var(--amber); background: var(--amber-wash); }
  .ev__live { width: 7px; height: 7px; border-radius: 50%; background: var(--live); flex: none; }
  .ev__teams { display: flex; align-items: center; gap: 0.55rem; min-width: 0; }
  .ev__team { font-weight: 500; }
  .ev__vs { color: var(--ink-500); font-size: var(--step--1); }
  .ev__meta { color: var(--ink-500); font-size: var(--step--1); }
  .ev__go { color: var(--ink-500); font-size: 1.2rem; }

  .ev--skeleton { cursor: default; pointer-events: none; }
  .skeleton-bar {
    display: inline-block; height: 0.9rem; width: 180px; border-radius: 3px;
    background: linear-gradient(90deg, var(--slate-100), var(--slate-150), var(--slate-100));
    background-size: 200% 100%; animation: shimmer 1.2s infinite;
  }
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .slip {
    max-width: 480px;
    background: var(--slate-050); border: 1px solid var(--slate-150);
    border-radius: var(--radius); padding: 1.25rem;
    display: flex; flex-direction: column; gap: 1.1rem;
  }
  .slip__match { display: flex; align-items: center; gap: 0.7rem; }
  .slip__teams { font-family: var(--font-display); font-weight: 600; font-size: var(--step-1); }
  .slip__vs { color: var(--ink-500); font-size: var(--step-0); font-weight: 400; }

  .field { display: flex; flex-direction: column; gap: 0.5rem; }
  .field__label { font-family: var(--font-mono); font-size: var(--step--1); letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-500); }

  .seg { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.4rem; }
  .seg__opt {
    display: flex; flex-direction: column; align-items: center; gap: 0.3rem;
    background: var(--slate-100); border: 1px solid var(--slate-200);
    border-radius: var(--radius); padding: 0.6rem 0.5rem; cursor: pointer;
    color: var(--ink-300); font: inherit; font-weight: 500;
  }
  .seg__opt:hover { color: var(--ink-100); }
  .seg__opt[data-active="true"] { border-color: var(--amber); color: var(--amber); background: var(--amber-wash); }
  .seg__odds { font-size: var(--step--1); color: var(--ink-500); }
  .seg__opt[data-active="true"] .seg__odds { color: var(--amber); }

  .stake { display: flex; align-items: center; gap: 0.5rem; background: var(--slate-100); border: 1px solid var(--slate-200); border-radius: var(--radius); padding: 0.2rem 0.7rem; }
  .stake:focus-within { border-color: var(--amber-dim); }
  .stake__cur { color: var(--ink-500); font-size: var(--step-1); }
  .stake__input { flex: 1; background: transparent; border: none; color: var(--ink-100); font-size: var(--step-2); padding: 0.5rem 0; }
  .stake__input:focus { outline: none; }
  .stake__input::placeholder { color: var(--slate-200); }

  .payout { font-size: var(--step-0); color: var(--ink-300); }
  .payout strong { color: var(--amber); }

  .slip__place {
    background: var(--amber); color: #1a1305; border: none;
    border-radius: var(--radius); padding: 0.8rem; font-family: var(--font-display);
    font-weight: 600; font-size: var(--step-0); cursor: pointer;
  }
  .slip__place:hover:not(:disabled) { background: #ffb733; }
  .slip__place:disabled { background: var(--slate-200); color: var(--ink-500); cursor: not-allowed; }
  .slip__note { font-size: var(--step--1); color: var(--ink-500); text-align: center; }
  .slip__note[data-ok="true"] { color: var(--win, #38b000); }
  .slip__note[data-ok="false"] { color: var(--lose, #e5484d); }

  @media (max-width: 560px) {
    .cat-grid { grid-template-columns: repeat(2, 1fr); }
  }`);

    const s = useStore({
      categoryId: null as number | null,
      selection: null as Selection,
      stake: "" as string | "",
    });

    const events = useSignal<Event[]>([]);
    const eventsLoading = useSignal(false);
    const eventsError = useSignal(false);
    const selectedEvent = useSignal<Event | null>(null);

    const placing = useSignal(false);
    const placeMessage = useSignal<string | null>(null);
    const placeOk = useSignal(false);

    const pickCategory = $(async (id: number) => {
      s.categoryId = id;
      selectedEvent.value = null;
      s.selection = null;
      s.stake = "";

      eventsError.value = false;
      eventsLoading.value = true;
      events.value = [];
      try {
        const response = await fetch(
          `${apiBaseUrl}/api/categories/${id}/events`,
        );
        if (response.ok) {
          events.value = (await response.json()) as Event[];
        } else {
          eventsError.value = true;
        }
      } catch {
        eventsError.value = true;
      } finally {
        eventsLoading.value = false;
      }
    });

    const pickEvent = $((event: Event) => {
      selectedEvent.value = event;
      s.selection = null;
      s.stake = "";
    });
    const reset = $(() => {
      s.categoryId = null;
      selectedEvent.value = null;
      events.value = [];
      s.selection = null;
      s.stake = "";
    });

    const backToEvents = $(() => {
      selectedEvent.value = null;
      s.selection = null;
      s.stake = "";
    });

    const setStakesInput = $((newStake: string) => {
      s.stake = newStake;
    });
    const changeBetSelectionInput = $((newSelection: Selection) => {
      s.selection = newSelection;
    });

    const categoryLabel =
      categories.find((c) => c.id === s.categoryId)?.name ?? "";
    const event = selectedEvent.value;

    const oddsForSelection = (
      event: Event,
      selection: Selection,
    ): number | null => {
      if (selection === "A") {
        return event.oddsTeamA;
      }
      if (selection === "draw") {
        return event.oddsDraw;
      }
      if (selection === "B") {
        return event.oddsTeamB;
      }
      return null;
    };

    const currentOdds = event ? oddsForSelection(event, s.selection) : null;
    const stake = Number.parseFloat(s.stake);

    const potential =
      currentOdds !== null && !Number.isNaN(stake) && stake > 0
        ? (stake * currentOdds).toFixed(2)
        : null;

    const submitBet = $(async () => {
      const activeUser = getActiveUser();
      if (!activeUser) {
        placeMessage.value =
          "Choose a user in the top left before placing a bet.";
        placeOk.value = false;
        return;
      }

      const event = selectedEvent.value;
      if (!event || !s.selection) {
        return;
      }

      const stakeNum = Number.parseFloat(s.stake);
      if (Number.isNaN(stakeNum) || stakeNum <= 0) {
        placeMessage.value = "Enter a valid stake.";
        placeOk.value = false;
        return;
      }

      const apiSelection =
        s.selection === "A"
          ? "TEAM_A_WIN"
          : s.selection === "B"
            ? "TEAM_B_WIN"
            : "DRAW";

      placeMessage.value = null;
      placing.value = true;
      try {
        const result = await placeBet(apiBaseUrl, {
          eventId: event.id,
          selection: apiSelection,
          stake: stakeNum,
          userId: activeUser.id,
        });
        if (result.ok) {
          placeOk.value = true;
          placeMessage.value = `Bet placed and confirmed (#${result.betId}).`;

          s.selection = null;
          s.stake = "";
        } else {
          placeOk.value = false;
          placeMessage.value = result.error ?? "Could not place bet.";
        }
      } finally {
        placing.value = false;
      }
    });

    return (
      <div class="flow">
        <div class="flow__crumbs">
          <button
            type="button"
            class="crumb"
            data-active={s.categoryId === null ? "true" : "false"}
            onClick$={reset}
          >
            <span class="crumb__n mono">1</span> Category
          </button>
          <span class="crumb__sep">/</span>
          <button
            type="button"
            class="crumb"
            data-active={s.categoryId !== null && event === null ? "true" : "false"}
            data-disabled={s.categoryId === null ? "true" : "false"}
            onClick$={() => backToEvents}
          >
            <span class="crumb__n mono">2</span> Event
          </button>
          <span class="crumb__sep">/</span>
          <span
            class="crumb"
            data-active={event !== null ? "true" : "false"}
            data-disabled={event === null ? "true" : "false"}
          >
            <span class="crumb__n mono">3</span> Place bet
          </span>
        </div>

        <section class="flow__step">
          <header class="flow__step-head">
            <span class="eyebrow">Step 1 — pick a category</span>
          </header>
          {loadError ? (
            <div class="empty">
              <strong>Couldn't load categories</strong>
              The betting service isn't reachable right now. Try refreshing.
            </div>
          ) : categories.length === 0 ? (
            <div class="empty">
              <strong>No categories available</strong>
              There's nothing to bet on yet.
            </div>
          ) : (
            <div class="cat-grid">
              {categories.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  class="cat"
                  data-active={s.categoryId === c.id ? "true" : "false"}
                  onClick$={() => pickCategory(c.id)}
                >
                  <span class="cat__glyph">{c.glyph ?? "•"}</span>
                  <span class="cat__label">{c.name}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        {s.categoryId !== null && (
          <section class="flow__step">
            <header class="flow__step-head">
              <span class="eyebrow">
                Step 2 — ongoing {categoryLabel.toLowerCase()} events
              </span>
            </header>

            {eventsLoading.value ? (
              <div class="ev-list">
                {[0, 1, 2].map((idx) => (
                  <div key={idx} class="ev ev--skeleton">
                    <span class="ev__live" />
                    <span class="ev__teams">
                      <span class="skeleton-bar" />
                    </span>
                  </div>
                ))}
              </div>
            ) : eventsError.value ? (
              <div class="empty">
                <strong>Couldn't load events</strong>
                The betting service isn't reachable right now.
              </div>
            ) : events.value.length === 0 ? (
              <div class="empty">
                <strong>No upcoming events</strong>
                There's nothing to bet on in {categoryLabel.toLowerCase()} right
                now.
              </div>
            ) : (
              <div class="ev-list">
                {events.value.map((e) => (
                  <button
                    type="button"
                    key={e.id}
                    class="ev"
                    data-active={event?.id === e.id ? "true" : "false"}
                    onClick$={() => pickEvent(e)}
                  >
                    <span class="ev__live" />
                    <span class="ev__teams">
                      <span class="ev__team">{e.teamA}</span>
                      <span class="ev__vs"> vs </span>
                      <span class="ev__team">{e.teamB}</span>
                    </span>
                    <span class="ev__meta mono">
                      {e.oddsTeamA.toFixed(2)} · {e.oddsDraw.toFixed(2)} ·{" "}
                      {e.oddsTeamB.toFixed(2)}
                    </span>
                    <span class="ev__go">›</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {event !== null && (
          <section class="flow__step">
            <header class="flow__step-head">
              <span class="eyebrow">Step 3 - place your bet</span>
            </header>

            <div class="slip">
              <div class="slip__match">
                <span class="tag">{categoryLabel}</span>
                <span class="slip__teams">
                  {event.teamA}
                  <span class="slip__vs"> vs </span>
                  {event.teamB}
                </span>
              </div>

              <div class="field">
                <label for="placeBetSubmitButton" class="field__label">
                  Selection
                </label>
                <div class="seg">
                  <button
                    type="button"
                    class="seg__opt"
                    data-active={s.selection === "A" ? "true" : "false"}
                    onClick$={() => changeBetSelectionInput("A")}
                  >
                    {event.teamA} win
                    <span class="seg__odds mono">
                      {event.oddsTeamA.toFixed(2)}
                    </span>
                  </button>
                  <button
                    type="button"
                    class="seg__opt"
                    data-active={s.selection === "draw" ? "true" : "false"}
                    onClick$={() => changeBetSelectionInput("draw")}
                  >
                    Draw
                    <span class="seg__odds mono">
                      {event.oddsDraw.toFixed(2)}
                    </span>
                  </button>
                  <button
                    type="button"
                    class="seg__opt"
                    data-active={s.selection === "B" ? "true" : "false"}
                    onClick$={() => changeBetSelectionInput("B")}
                  >
                    {event.teamB} win
                    <span class="seg__odds mono">
                      {event.oddsTeamB.toFixed(2)}
                    </span>
                  </button>
                </div>
              </div>

              <div class="field">
                <label class="field__label" for="stake">
                  Stake
                </label>
                <div class="stake">
                  <span class="stake__cur mono">SEK</span>
                  <input
                    id="stake"
                    class="stake__input mono"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={s.stake}
                    onInput$={(_, element) => setStakesInput(element.value)}
                  />
                </div>
                {potential !== null && (
                  <div class="payout mono">
                    Potential payout: <strong>SEK{potential}</strong>
                  </div>
                )}
              </div>

              <button
                name="placeBetSubmitButton"
                type="button"
                class="slip__place"
                disabled={!s.selection || s.stake.trim() === ""}
                onClick$={submitBet}
              >
                {placing.value ? "Placing bet . . ." : "Place bet"}
              </button>
              {placeMessage.value && (
                <p class="slip__note" data-ok={placeOk.value}>
                  {placeMessage.value}
                </p>
              )}
            </div>
          </section>
        )}
      </div>
    );
  },
);

export default BettingFlow;
