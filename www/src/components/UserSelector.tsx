import {
  $,
  component$,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";

import { useStyles$ } from "@builder.io/qwik";

import {
  type ActiveUser,
  getActiveUser,
  setActiveUser,
} from "../lib/userStore";

interface User {
  id: number;
  fullName: string;
}

interface Props {
  apiBaseUrl: string;
}

export const UserSelector = component$<Props>(({ apiBaseUrl }) => {
  useStyles$(`
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
    .usel__name { font-weight: 600; font-size: var(--step-0); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
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
      padding: 0.4rem 0.5rem; letter-spacing: 0.04em;
    }`);
  const open = useSignal(false);
  const users = useSignal<User[]>([]);
  const chosen = useSignal<ActiveUser | null>(null);

  useVisibleTask$(async () => {
    chosen.value = getActiveUser();

    try {
      const response = await fetch(`${apiBaseUrl}/api/users`);
      if (response.ok) {
        users.value = (await response.json()) as User[];
      }
    } catch {}
  });

  const toggleUserSelectorOpen = $(() => {
    open.value = !open.value;
  });

  const choose = $((user: User) =>
  {
    const active: ActiveUser = { id: user.id, fullName: user.fullName };
    setActiveUser(active);
    chosen.value = active;
    open.value = false;
  });

  const isChosen = chosen.value !== null;

  return (
    <div class="usel">
      <button
        type="button"
        class="usel__btn"
        aria-haspopup="listbox"
        aria-expanded={open.value}
        onClick$={() => toggleUserSelectorOpen()}
      >
        <span class="usel__avatar" data-empty={!isChosen} />
        <span class="usel__meta">
          <span class="usel__eyebrow">Betting as</span>
          <span class="usel__name" data-empty={!isChosen}>
            {isChosen ? chosen.value?.fullName : "Choose user"}
          </span>
        </span>
        <span class="usel__chev" data-open={open.value}>
          ▾
        </span>
      </button>

      {open.value && (
        <ul class="usel__menu">
          {users.value.length === 0 ? (
            <li class="usel__hint">No users available</li>
          ) : (
            users.value.map((user) => (
              <li key={user.id} aria-selected={chosen.value?.id === user.id}>
                <button
                  type="button"
                  class="usel__opt"
                  onClick$={() => choose(user)}
                >
                  <span class="usel__avatar usel__avatar--sm" />
                  <span>{user.fullName}</span>
                  {chosen.value?.id === user.id && (
                    <span class="usel__check">✓</span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
});

export default UserSelector;
