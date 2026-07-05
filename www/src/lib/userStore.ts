export interface ActiveUser {
  id: number;
  fullName: string;
}

const KEY = "betting.activeUser";
const EVENT = "betting:activeUserChanged";

export function getActiveUser(): ActiveUser | null {
  if (typeof localStorage === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.id === "number" &&
      typeof parsed?.fullName === "string"
    ) {
      return parsed as ActiveUser;
    }

    return null;
  } catch {
    return null;
  }
}

export function setActiveUser(user: ActiveUser): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem(KEY, JSON.stringify(user));

  window.dispatchEvent(new CustomEvent(EVENT, { detail: user }));
}

export function clearActiveUser(): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent(EVENT, { detail: null }));
}

export function subscribeActiveUser(
  callback: (user: ActiveUser | null) => void,
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const onCustom = (e: Event) => {
    callback((e as CustomEvent).detail as ActiveUser | null);
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      callback(getActiveUser());
    }
  };

  window.addEventListener(EVENT, onCustom);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}
