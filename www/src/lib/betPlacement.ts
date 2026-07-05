const PENDING_KEY = "betting.pendingPlacement";

interface PendingPlacement
{
    requestId: string;
    eventId: string;
    selection: string;
    stake: number;
    userId: number;
}

export interface PlaceResult
{
    ok: boolean;
    betId?: number;
    state?: string;
    checksum?: string;
    error?: string;
}

function newRequestId(): string
{
    if (typeof crypto !== "undefined" && crypto.randomUUID) { return crypto.randomUUID(); }
    return `request-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function savePending(p: PendingPlacement): void
{
    if (typeof localStorage === "undefined") { return; }
    localStorage.setItem(PENDING_KEY, JSON.stringify(p));
}

function clearPending(): void
{
    if (typeof localStorage === "undefined") { return; }
    localStorage.removeItem(PENDING_KEY);
}

function readPending(): PendingPlacement | null
{
    if (typeof localStorage === "undefined") { return null; }
    try
    {
        const raw = localStorage.getItem(PENDING_KEY);
        return raw ? (JSON.parse(raw) as PendingPlacement) : null;
    }
    catch
    {
        return null;
    }
}

export async function placeBet(apiBase: string,
                               args: { eventId: string; selection: string; stake: number; userId: number }): Promise<PlaceResult> 
{
    const existing = readPending();
    const sameIntent = existing &&
                       existing.eventId === args.eventId &&
                       existing.selection === args.selection &&
                       existing.stake === args.stake &&
                       existing.userId === args.userId;

    const requestId = sameIntent ? existing.requestId : newRequestId();

    savePending({ requestId, ...args });

    let placed: { id: number; checksum: string; state: string };
    try
    {
        const res = await fetch(`${apiBase}/api/bets`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({userId: args.userId,
                                  eventId: args.eventId,
                                  selection: args.selection,
                                  stake: args.stake,
                                  requestId}),
        });
        if (!res.ok)
        {
            const msg = await safeError(res);
            return { ok: false, error: msg };
        }
        placed = (await res.json()) as { id: number; checksum: string; state: string };
    }
    catch (errno)
    {
        return { ok: false, error: "Network error placing bet — you can retry." };
    }

    clearPending();

    try
    {
        const res = await fetch(`${apiBase}/api/bets/consume`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ checksum: placed.checksum }),
        });
        if (!res.ok)
        {
            const msg = await safeError(res);
            return { ok: false,
                     betId: placed.id,
                     state: placed.state,
                     checksum: placed.checksum,
                     error: `Placed but not confirmed: ${msg}`};
        }

        const consumed = (await res.json()) as { betId: number; state: string };

        return { ok: true,
                 betId: consumed.betId,
                 state: consumed.state,
                 checksum: placed.checksum };
    }
    catch
    {
        return { ok: false,
                 betId: placed.id,
                 state: placed.state,
                 checksum: placed.checksum,
                 error: "Placed but confirmation failed — it may expire."};
  }
}

async function safeError(response: Response): Promise<string>
{
    try
    {
        const body = await response.json();
        return body?.message ?? `HTTP ${response.status}`;
    }
    catch
    {
        return `HTTP ${response.status}`;
    }
}
