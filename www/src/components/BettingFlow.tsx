import { $, component$, useStore } from "@builder.io/qwik";

import { useStyles$ } from "@builder.io/qwik";

export interface Category {
  id: number;
  name: string;
  glyph: string | null;
}

interface Props {
  categories: Category[];
  loadError?: boolean;
}

const PLACEHOLDER_EVENTS = [0, 1, 2, 3];

type Selection = "A" | "draw" | "B" | null;

export const BettingFlow = component$<Props>(({ categories, loadError }) => {
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

  /* Category grid */
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

  /* Event list */
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
  .ev__live { width: 7px; height: 7px; border-radius: 50%; background: var(--live); }
  .ev__teams { display: flex; align-items: center; gap: 0.55rem; }
  .ev__team { font-weight: 500; }
  .ev__vs { color: var(--ink-500); font-size: var(--step--1); }
  .ev__meta { color: var(--ink-500); font-size: var(--step--1); }
  .ev__go { color: var(--ink-500); font-size: 1.2rem; }

  /* Slip */
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
    background: var(--slate-100); border: 1px solid var(--slate-200);
    border-radius: var(--radius); padding: 0.6rem 0.5rem; cursor: pointer;
    color: var(--ink-300); font: inherit; font-weight: 500;
  }
  .seg__opt:hover { color: var(--ink-100); }
  .seg__opt[data-active="true"] { border-color: var(--amber); color: var(--amber); background: var(--amber-wash); }

  .stake { display: flex; align-items: center; gap: 0.5rem; background: var(--slate-100); border: 1px solid var(--slate-200); border-radius: var(--radius); padding: 0.2rem 0.7rem; }
  .stake:focus-within { border-color: var(--amber-dim); }
  .stake__cur { color: var(--ink-500); font-size: var(--step-1); }
  .stake__input { flex: 1; background: transparent; border: none; color: var(--ink-100); font-size: var(--step-2); padding: 0.5rem 0; }
  .stake__input:focus { outline: none; }
  .stake__input::placeholder { color: var(--slate-200); }

  .slip__place {
    background: var(--amber); color: #1a1305; border: none;
    border-radius: var(--radius); padding: 0.8rem; font-family: var(--font-display);
    font-weight: 600; font-size: var(--step-0); cursor: pointer;
  }
  .slip__place:hover:not(:disabled) { background: #ffb733; }
  .slip__place:disabled { background: var(--slate-200); color: var(--ink-500); cursor: not-allowed; }
  .slip__note { font-size: var(--step--1); color: var(--ink-500); text-align: center; }

  @media (max-width: 560px) {
    .cat-grid { grid-template-columns: repeat(2, 1fr); }
  }`);

  const s = useStore({
    categoryId: null as number | null,
    event: null as number | null,
    selection: null as Selection,
    stake: "" as string | "",
  });

  const pickCategory = $((id: number) => {
    s.categoryId = id;
    s.event = null;
    s.selection = null;
    s.stake = "";
  });
  const pickEvent = $((id: number) => {
    s.event = id;
    s.selection = null;
    s.stake = "";
  });
  const reset = $(() => {
    s.categoryId = null;
    s.event = null;
    s.selection = null;
    s.stake = "";
  });

  const setStakesInput = $((newStake: string) => {
    s.stake = newStake;
  });
  const changeBetSelectionInput = $((newSelection: Selection) => {
    s.selection = newSelection;
  });

  const returnToCategoryBetPlacementStep = $(() => {
    s.event = null;
    return s.categoryId;
  });

  const categoryLabel = categories.find((c) => c.id === s.categoryId)?.name ?? "";

  return (
    <div class="flow">
      <div class="flow__crumbs">
        <button
          type="button"
          class="crumb"
          data-active={s.categoryId === null}
          onClick$={reset}
        >
          <span class="crumb__n mono">1</span> Category
        </button>
        <span class="crumb__sep">/</span>
        <button
          type="button"
          class="crumb"
          data-active={s.categoryId !== null && s.event === null}
          data-disabled={s.categoryId === null}
          onClick$={() => returnToCategoryBetPlacementStep()}
        >
          <span class="crumb__n mono">2</span> Event
        </button>
        <span class="crumb__sep">/</span>
        <span
          class="crumb"
          data-active={s.event !== null}
          data-disabled={s.event === null}
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
                data-active={s.categoryId === c.id}
                onClick$={() => pickCategory(c.id)}
              >
                <span class="cat__glyph">{c.glyph}</span>
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
          <div class="ev-list">
            {PLACEHOLDER_EVENTS.map((idx) => (
              <button
                type="button"
                key={idx}
                class="ev"
                data-active={s.event === idx}
                onClick$={() => pickEvent(idx)}
              >
                <span class="ev__live" />
                <span class="ev__teams">
                  <span class="ev__team">Team A</span>
                  <span class="ev__vs">vs</span>
                  <span class="ev__team">Team B</span>
                </span>
                <span class="ev__meta mono">— · —</span>
                <span class="ev__go">›</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {s.event !== null && (
        <section class="flow__step">
          <header class="flow__step-head">
            <span class="eyebrow">Step 3 — place your bet</span>
          </header>

          <div class="slip">
            <div class="slip__match">
              <span class="tag">{categoryLabel}</span>
              <span class="slip__teams">
                Team A <span class="slip__vs">vs</span> Team B
              </span>
            </div>

            <div class="field">
              <label for="placeBetButton" class="field__label">
                Selection
              </label>
              <div class="seg">
                <button
                  type="button"
                  class="seg__opt"
                  data-active={s.selection === "A"}
                  onClick$={() => changeBetSelectionInput("A")}
                >
                  Team A win
                </button>
                <button
                  type="button"
                  class="seg__opt"
                  data-active={s.selection === "draw"}
                  onClick$={() => changeBetSelectionInput("draw")}
                >
                  Draw
                </button>
                <button
                  type="button"
                  class="seg__opt"
                  data-active={s.selection === "B"}
                  onClick$={() => changeBetSelectionInput("B")}
                >
                  Team B win
                </button>
              </div>
            </div>

            <div class="field">
              <label class="field__label" for="stake">
                Stake
              </label>
              <div class="stake">
                <span class="stake__cur mono">¤</span>
                <input
                  id="stake"
                  class="stake__input mono"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={s.stake}
                  onInput$={(_, element) => setStakesInput(element.value)}
                />
              </div>
            </div>

            <button
              name="placeBetButton"
              type="button"
              class="slip__place"
              disabled={!s.selection || s.stake.trim() === ""}
              onClick$={() => {}}
            >
              Place bet
            </button>
            <p class="slip__note">Placing bets is wired up in a later step.</p>
          </div>
        </section>
      )}
    </div>
  );
});

export default BettingFlow;
