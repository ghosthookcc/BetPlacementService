import { component$ } from "@builder.io/qwik";

export const HistoryFeed = component$(() => {
  const hasData = false;

  return (
    <div class="feed__scroll">
      {!hasData ? (
        <div class="empty" style="margin:0.6rem;">
          <strong>No bets yet</strong>
          New bets will stream in here as they're placed.
        </div>
      ) : (
        <div class="tickets">{}</div>
      )}
    </div>
  );
});

export default HistoryFeed;
