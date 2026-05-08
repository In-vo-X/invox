"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { alertNotifications, demoPools } from "@/lib/mock-data";

export function Topbar() {
  const [showAlerts, setShowAlerts] = useState(false);
  const [query, setQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = useMemo(
    () => alertNotifications.filter((item) => item.tone !== "success").length,
    [],
  );

  const searchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    return demoPools
      .filter((pool) => {
        const searchable = [
          pool.issuer,
          pool.originator,
          pool.debtor,
          pool.spv,
          pool.txSig,
        ].join(" ")
          .toLowerCase();

        return searchable.includes(normalizedQuery);
      })
      .slice(0, 6);
  }, [query]);

  const toneClasses = {
    info: "bg-[var(--brand-100)] text-[var(--brand-600)]",
    success: "bg-[rgba(94,215,198,0.18)] text-[rgba(37,144,128,1)]",
    warning: "bg-[rgba(255,155,135,0.2)] text-[rgba(217,99,72,1)]",
  } as const;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!searchRef.current?.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    setShowSearchResults(false);
    setShowAlerts(false);
  }, [pathname]);

  function openPool(poolId: string) {
    setShowSearchResults(false);
    setQuery("");
    router.push(`/pools/${poolId}`);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (searchResults[0]) {
      openPool(searchResults[0].id);
    }
  }

  return (
    <div className="relative z-30 flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/88 px-5 py-4 shadow-[0_18px_48px_rgba(127,139,176,0.12)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
      <div className="relative flex flex-1 items-center gap-4" ref={searchRef}>
        <form
          className="flex w-full items-center gap-3 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--ink-500)] lg:max-w-[48rem]"
          onSubmit={handleSearchSubmit}
        >
          <Search className="h-4 w-4 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setShowSearchResults(false);
              }
            }}
            placeholder="Search pools, issuers, tx signatures"
            className="w-full bg-transparent text-[var(--ink-700)] outline-none placeholder:text-[var(--ink-500)]"
            aria-label="Search pools, issuers, tx signatures"
          />
        </form>

        {showSearchResults ? (
          <div className="absolute left-0 top-[calc(100%+0.75rem)] z-[70] w-full rounded-[1.75rem] border border-white/90 bg-white/96 p-4 shadow-[0_24px_60px_rgba(127,139,176,0.18)] backdrop-blur-xl lg:max-w-[48rem]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Search</p>
                <p className="mt-2 text-base font-semibold text-[var(--ink-900)]">
                  Find pools by issuer, originator, or tx signature
                </p>
              </div>
              <button
                type="button"
                className="text-sm font-medium text-[var(--ink-500)] transition hover:text-[var(--ink-900)]"
                onClick={() => setShowSearchResults(false)}
              >
                Close
              </button>
            </div>

            {query.trim() ? (
              searchResults.length ? (
                <div className="mt-4 space-y-3">
                  {searchResults.map((pool) => (
                    <button
                      key={pool.id}
                      type="button"
                      onClick={() => openPool(pool.id)}
                      className="block w-full rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface-soft)] p-4 text-left transition hover:-translate-y-0.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[var(--ink-900)]">
                            {pool.issuer}
                          </p>
                          <p className="mt-1 text-sm text-[var(--ink-500)]">
                            {pool.originator} · Debtor {pool.debtor}
                          </p>
                        </div>
                        <span className="metric-chip">{pool.dueLabel}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-[var(--ink-500)]">
                        <span>TX {pool.txSig}</span>
                        <span>Status {pool.status}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface-soft)] p-4 text-sm leading-6 text-[var(--ink-500)]">
                  No pools matched “{query.trim()}”. Try an issuer, originator,
                  debtor, or transaction signature.
                </div>
              )
            ) : (
              <div className="mt-4 rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface-soft)] p-4 text-sm leading-6 text-[var(--ink-500)]">
                Try searches like <span className="font-semibold text-[var(--ink-700)]">Jakarta</span>, <span className="font-semibold text-[var(--ink-700)]">FlowPay Originator PH</span>, or <span className="font-semibold text-[var(--ink-700)]">5msuT3</span>.
              </div>
            )}
          </div>
        ) : null}
      </div>
      <div className="relative flex items-center gap-3">
        <button
          aria-expanded={showAlerts}
          aria-haspopup="dialog"
          className="pill relative text-[var(--ink-600)]"
          type="button"
          onClick={() => setShowAlerts((current) => !current)}
        >
          <Bell className="h-4 w-4" />
          Alerts
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--coral-500)] px-1.5 text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        </button>
        {showAlerts ? (
          <div className="absolute right-0 top-[calc(100%+0.75rem)] z-[70] w-[22rem] rounded-[1.75rem] border border-white/90 bg-white/96 p-4 shadow-[0_24px_60px_rgba(127,139,176,0.18)] backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Alerts</p>
                <p className="mt-2 text-base font-semibold text-[var(--ink-900)]">
                  Market watchlist updates
                </p>
              </div>
              <button
                className="text-sm font-medium text-[var(--ink-500)] transition hover:text-[var(--ink-900)]"
                type="button"
                onClick={() => setShowAlerts(false)}
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {alertNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface-soft)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--ink-900)]">
                      {notification.title}
                    </p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${toneClasses[notification.tone]}`}
                    >
                      {notification.timeLabel}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-500)]">
                    {notification.body}
                  </p>
                  {notification.ctaLabel ? (
                    <Link
                      href={notification.id === "alert-2" ? "/ai-assist" : "/marketplace"}
                      className="mt-3 inline-flex text-sm font-semibold text-[var(--brand-600)] transition hover:text-[var(--brand-700)]"
                      onClick={() => setShowAlerts(false)}
                    >
                      {notification.ctaLabel}
                    </Link>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <WalletMultiButton className="!h-12 !rounded-full !bg-[linear-gradient(135deg,#5f72dd,#7287ff)] !px-5 !font-semibold !shadow-[0_18px_32px_rgba(114,135,255,0.24)]" />
      </div>
    </div>
  );
}
