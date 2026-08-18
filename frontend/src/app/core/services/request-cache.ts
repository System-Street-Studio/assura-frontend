import { Observable, of, shareReplay, tap, finalize } from 'rxjs';

interface CacheEntry<T> {
  value: T;
  fetchedAt: number;
}

/**
 * A small in-memory cache for GET requests.
 *
 * The API sits in front of a remote database (~250 ms per round-trip), so the cheapest
 * request is the one never sent. This helper gives a service three things:
 *
 * - **TTL replay** — a value younger than `ttlMs` is returned without touching the network.
 * - **De-duplication** — callers that ask while a request is already on the wire join that
 *   request instead of starting a second one.
 * - **Snapshots** — {@link snapshot} hands back the last value even after it has expired, so a
 *   page can paint real data immediately and revalidate behind it (stale-while-revalidate).
 *
 * Pick the TTL to match how the data behaves:
 * - Master data that rarely changes (categories, divisions): a real TTL, e.g. minutes.
 * - Lists users create and edit (assets): `ttlMs: 0`, so every visit still revalidates while
 *   {@link snapshot} keeps the page instant. Never serve a mutable list purely from a TTL —
 *   a record the user just created would be missing until the entry expired.
 *
 * Entries are keyed, because one service often serves several distinct result sets (for
 * example `assets?onlyMine=true` versus the full list). Callers must include anything that
 * changes the response — filters, and the signed-in user — in the key.
 *
 * This is deliberately memory-only: a full page reload starts clean, which avoids any risk of
 * showing one account's records to the next person signed in on the same browser.
 */
export class RequestCache<T> {
  private readonly entries = new Map<string, CacheEntry<T>>();
  private readonly inFlight = new Map<string, Observable<T>>();

  /**
   * @param ttlMs How long a cached value may be replayed without a request. Use 0 to always
   *   revalidate while still de-duplicating concurrent calls.
   */
  constructor(private readonly ttlMs: number) {}

  /** The last value stored for `key`, fresh or stale, or `undefined` if nothing is cached. */
  snapshot(key: string): T | undefined {
    return this.entries.get(key)?.value;
  }

  /** Whether `key` holds a value that is still within the TTL. */
  isFresh(key: string): boolean {
    const entry = this.entries.get(key);
    return !!entry && Date.now() - entry.fetchedAt < this.ttlMs;
  }

  /**
   * Returns the cached value when it is still fresh, otherwise runs `loader` and caches it.
   * @param forceRefresh Skip the TTL and always call `loader`.
   */
  get(key: string, loader: () => Observable<T>, forceRefresh = false): Observable<T> {
    if (!forceRefresh && this.isFresh(key)) {
      return of(this.entries.get(key)!.value);
    }

    const pending = this.inFlight.get(key);
    if (pending) {
      return pending;
    }

    const request = loader().pipe(
      tap((value) => this.entries.set(key, { value, fetchedAt: Date.now() })),
      finalize(() => this.inFlight.delete(key)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.inFlight.set(key, request);
    return request;
  }

  /**
   * Drops cached values so the next read goes to the network.
   * @param key Clears just that entry; omit it to clear everything.
   */
  invalidate(key?: string): void {
    if (key === undefined) {
      this.entries.clear();
    } else {
      this.entries.delete(key);
    }
  }
}
