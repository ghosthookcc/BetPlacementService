import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { useStyles$ } from "@builder.io/qwik";

interface EventRow {
  id: string;
  categoryId: number;
  teamA: string;
  teamB: string;
  oddsTeamA: number;
  oddsDraw: number;
  oddsTeamB: number;
  state: string;
  startsAt: string | null;
}

interface Props {
  apiBaseUrl: string;
}

export const AdminView = component$<Props>(({ apiBaseUrl }) => {
  useStyles$(`
  .adm { display: flex; flex-direction: column; gap: 1rem; }
  .adm__msg { padding: 0.7rem 1rem; border-radius: var(--radius); font-size: var(--step-0); }
  .adm__msg--ok { background: rgba(80,200,120,0.12); color: var(--win, #6ee7a0); border: 1px solid rgba(80,200,120,0.3); }
  .adm__msg--err { background: rgba(240,90,90,0.12); color: var(--lose, #f08a8a); border: 1px solid rgba(240,90,90,0.3); }

  .ev-card {
    background: var(--slate-050); border: 1px solid var(--slate-150);
    border-radius: var(--radius); padding: 1rem 1.1rem;
    display: flex; flex-direction: column; gap: 0.8rem;
  }
  .ev-card__top { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
  .ev-card__teams { font-family: var(--font-display); font-weight: 600; font-size: var(--step-1); }
  .ev-card__vs { color: var(--ink-500); font-weight: 400; font-size: var(--step-0); }
  .ev-card__meta { display: flex; align-items: center; gap: 0.7rem; }
  .ev-card__odds { font-size: var(--step--1); color: var(--ink-500); }

  .state-badge {
    font-family: var(--font-mono); font-size: 0.66rem; letter-spacing: 0.1em;
    text-transform: uppercase; padding: 0.25rem 0.55rem; border-radius: 3px;
    border: 1px solid var(--slate-200); color: var(--ink-300);
  }
  .state-badge[data-state="UPCOMING"] { color: var(--amber); border-color: var(--amber-dim); }
  .state-badge[data-state="LIVE"] { color: var(--live, #ff5a5a); border-color: var(--live, #ff5a5a); }

  .adm__actions { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
  .adm__group { display: flex; gap: 0.3rem; align-items: center; padding: 0.2rem; border: 1px solid var(--slate-150); border-radius: var(--radius); }
  .adm__group-label { font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-500); padding: 0 0.4rem; }

  .btn {
    background: var(--slate-100); color: var(--ink-100); border: 1px solid var(--slate-200);
    border-radius: 3px; padding: 0.45rem 0.7rem; cursor: pointer; font: inherit;
    font-size: var(--step--1); font-weight: 500;
  }
  .btn:hover:not(:disabled) { border-color: var(--amber-dim); color: var(--amber); }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn--live:hover:not(:disabled) { border-color: var(--live, #ff5a5a); color: var(--live, #ff5a5a); }
  .btn--cancel:hover:not(:disabled) { border-color: var(--lose, #f08a8a); color: var(--lose, #f08a8a); }
  .btn--win { background: var(--slate-100); }`);

  const events = useSignal<EventRow[]>([]);
  const loaded = useSignal(false);
  const error = useSignal(false);
  const busy = useSignal(false);
  const msg = useSignal<string | null>(null);
  const msgOk = useSignal(false);

  const load = $(async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/events?actionable=true`);
      if (res.ok) {
        events.value = (await res.json()) as EventRow[];
        error.value = false;
      } else {
        error.value = true;
      }
    } catch {
      error.value = true;
    } finally {
      loaded.value = true;
    }
  });

  useVisibleTask$(async () => {
    await load();
  });

  const doTransition = $(
    async (eventId: string, target: string, result?: string) => {
      busy.value = true;
      msg.value = null;
      try {
        const body: Record<string, string> = { target };
        if (result) {
          body.result = result;
        }
        const res = await fetch(`${apiBaseUrl}/api/events/${eventId}/state`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const data = (await res.json()) as {
            newState: string;
            betsSettled: number;
            betsVoided: number;
            betsExpired: number;
          };
          msgOk.value = true;
          msg.value =
            `Event -> ${data.newState}. ` +
            `Settled ${data.betsSettled}, voided ${data.betsVoided}, expired ${data.betsExpired}.`;
          await load();
        } else {
          const err = await res.json().catch(() => ({}));
          msgOk.value = false;
          msg.value = err?.message ?? `Transition failed (${res.status}).`;
        }
      } catch {
        msgOk.value = false;
        msg.value = "Network error during transition.";
      } finally {
        busy.value = false;
      }
    },
  );

  return (
    <div class="adm">
      {msg.value && (
        <div
          class={`adm__msg ${msgOk.value ? "adm__msg--ok" : "adm__msg--err"}`}
        >
          {msg.value}
        </div>
      )}

      {!loaded.value ? (
        <div class="empty">
          <strong>Loading events…</strong>
        </div>
      ) : error.value ? (
        <div class="empty">
          <strong>Couldn't load events</strong>
          The betting service isn't reachable right now.
        </div>
      ) : events.value.length === 0 ? (
        <div class="empty">
          <strong>No actionable events</strong>
          Every event is finished or cancelled — nothing to transition.
        </div>
      ) : (
        events.value.map((e) => (
          <div key={e.id} class="ev-card">
            <div class="ev-card__top">
              <div class="ev-card__teams">
                {e.teamA} <span class="ev-card__vs">vs</span> {e.teamB}
              </div>
              <div class="ev-card__meta">
                <span class="ev-card__odds mono">
                  {e.oddsTeamA.toFixed(2)} · {e.oddsDraw.toFixed(2)} ·{" "}
                  {e.oddsTeamB.toFixed(2)}
                </span>
                <span class="state-badge" data-state={e.state}>
                  {e.state}
                </span>
              </div>
            </div>

            <div class="adm__actions">
              {e.state === "UPCOMING" && (
                <button
                  type="button"
                  class="btn btn--live"
                  disabled={busy.value}
                  onClick$={() => doTransition(e.id, "LIVE")}
                >
                  Set LIVE
                </button>
              )}

              <div class="adm__group">
                <span class="adm__group-label">Finish</span>
                <button
                  type="button"
                  class="btn btn--win"
                  disabled={busy.value}
                  onClick$={() => doTransition(e.id, "FINISHED", "TEAM_A_WIN")}
                >
                  {e.teamA}
                </button>
                <button
                  type="button"
                  class="btn btn--win"
                  disabled={busy.value}
                  onClick$={() => doTransition(e.id, "FINISHED", "DRAW")}
                >
                  Draw
                </button>
                <button
                  type="button"
                  class="btn btn--win"
                  disabled={busy.value}
                  onClick$={() => doTransition(e.id, "FINISHED", "TEAM_B_WIN")}
                >
                  {e.teamB}
                </button>
              </div>

              <button
                type="button"
                class="btn btn--cancel"
                disabled={busy.value}
                onClick$={() => doTransition(e.id, "CANCELLED")}
              >
                Cancel
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
});

export default AdminView;
