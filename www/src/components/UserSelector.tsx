import { component$, useSignal, useStore, $ } from "@builder.io/qwik";

const PLACEHOLDER_USERS = ["—", "—", "—"];

export const UserSelector = component$(() => {
  const open = useSignal(false);
  const state = useStore({ index: -1 });

  const choose = $((i: number) => {
    state.index = i;
    open.value = false;
  });

  const chosen = state.index >= 0;

  return (
    <div class="usel">
      <button
        class="usel__btn"
        aria-haspopup="listbox"
        aria-expanded={open.value}
        onClick$={() => (open.value = !open.value)}
      >
        <span class="usel__avatar" data-empty={!chosen}></span>
        <span class="usel__meta">
          <span class="usel__eyebrow">Betting as</span>
          <span class="usel__name" data-empty={!chosen}>
            {chosen ? `User ${state.index + 1}` : "Choose user"}
          </span>
        </span>
        <span class="usel__chev" data-open={open.value}>▾</span>
      </button>

      {open.value && (
        <ul class="usel__menu" role="listbox">
          {PLACEHOLDER_USERS.map((_, i) => (
            <li key={i} role="option" aria-selected={state.index === i}>
              <button class="usel__opt" onClick$={() => choose(i)}>
                <span class="usel__avatar usel__avatar--sm"></span>
                <span>User {i + 1}</span>
                {state.index === i && <span class="usel__check">✓</span>}
              </button>
            </li>
          ))}
          <li class="usel__hint">Real users load here later</li>
        </ul>
      )}

      <style
        dangerouslySetInnerHTML={`
          .usel { position: relative; padding: 0.7rem 0.6rem; border-bottom: 1px solid var(--slate-150); }
          .usel__btn {
            width: 100%; display: flex; align-items: center; gap: 0.6rem;
            background: var(--slate-100); color: var(--ink-100);
            border: 1px solid var(--slate-200); border-radius: var(--radius);
            padding: 0.55rem 0.6rem; cursor: pointer; text-align: left;
          }
          .usel__btn:hover { border-color: var(--amber-dim); }
          .usel__avatar {
            width: 26px; height: 26px; border-radius: 50%; flex: none;
            background: linear-gradient(135deg, var(--amber), var(--amber-dim));
          }
          .usel__avatar[data-empty="true"] { background: var(--slate-200); }
          .usel__avatar--sm { width: 20px; height: 20px; }
          .usel__meta { display: flex; flex-direction: column; line-height: 1.15; min-width: 0; flex: 1; }
          .usel__eyebrow {
            font-family: var(--font-mono); font-size: 0.66rem; letter-spacing: 0.14em;
            text-transform: uppercase; color: var(--ink-500);
          }
          .usel__name { font-weight: 600; font-size: var(--step-0); }
          .usel__name[data-empty="true"] { color: var(--ink-500); font-weight: 500; }
          .usel__chev { color: var(--ink-500); transition: transform 0.15s; }
          .usel__chev[data-open="true"] { transform: rotate(180deg); }
          .usel__menu {
            position: absolute; left: 0.6rem; right: 0.6rem; top: calc(100% - 0.3rem);
            z-index: 20; list-style: none;
            background: var(--slate-100); border: 1px solid var(--slate-200);
            border-radius: var(--radius); padding: 0.3rem;
            box-shadow: 0 12px 30px rgba(0,0,0,0.45);
          }
          .usel__opt {
            width: 100%; display: flex; align-items: center; gap: 0.55rem;
            background: transparent; color: var(--ink-100); border: none;
            padding: 0.5rem 0.5rem; border-radius: 3px; cursor: pointer; font: inherit;
          }
          .usel__opt:hover { background: var(--slate-150); }
          .usel__check { margin-left: auto; color: var(--amber); }
          .usel__hint {
            font-family: var(--font-mono); font-size: 0.66rem; color: var(--ink-500);
            padding: 0.4rem 0.5rem 0.2rem; letter-spacing: 0.04em;
          }
        `}
      ></style>
    </div>
  );
});

export default UserSelector;
