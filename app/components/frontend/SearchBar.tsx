"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Destination {
  name: string;
  type: "city" | "state" | "destination";
  state?: string;
  country: string;
  slug: string;
  emoji: string;
  tags: string[];
  _score?: number;
}

interface SearchResult {
  success: boolean;
  query: string;
  results: Destination[];
  popular?: boolean;
}

// Highlight matched text within a string
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-transparent font-bold" style={{ color: "#2fa3f2" }}>
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

const TYPE_LABEL: Record<string, { label: string; color: string }> = {
  city:        { label: "City",        color: "bg-sky-100 text-sky-700" },
  state:       { label: "State",       color: "bg-violet-100 text-violet-700" },
  destination: { label: "Destination", color: "bg-emerald-100 text-emerald-700" },
};

interface SearchBarProps {
  placeholder?: string;
  showButton?: boolean;
  className?: string;
}

export default function SearchBar({
  placeholder = "Where do you want to go?",
  showButton = true,
  className = "",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery]         = useState("");
  const [results, setResults]     = useState<Destination[]>([]);
  const [loading, setLoading]     = useState(false);
  const [open, setOpen]           = useState(false);
  const [popular, setPopular]     = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const inputRef     = useRef<HTMLInputElement>(null);
  const dropdownRef  = useRef<HTMLDivElement>(null);
  const debounceRef  = useRef<ReturnType<typeof setTimeout>>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data: SearchResult = await res.json();
      if (data.success) {
        setResults(data.results);
        setPopular(!!data.popular);
      }
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setActiveIdx(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 280);
  };

  const handleFocus = () => {
    setOpen(true);
    if (!query && results.length === 0) fetchSuggestions("");
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getUrl = (dest: Destination) => {
    if (dest.type === "state")  return `/locations?q=${encodeURIComponent(dest.name)}`;
    return `/packages?destination=${encodeURIComponent(dest.name)}`;
  };

  const selectDest = (dest: Destination) => {
    setQuery(dest.name);
    setOpen(false);
    router.push(getUrl(dest));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIdx >= 0 && results[activeIdx]) {
      selectDest(results[activeIdx]);
      return;
    }
    if (query.trim()) {
      router.push(`/packages?destination=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    } else {
      router.push("/packages");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((p) => (p + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((p) => (p - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      selectDest(results[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIdx(-1);
    }
  };

  const showDropdown = open && (results.length > 0 || loading || (query.length > 0 && !loading));

  return (
    <div className={`relative w-full z-30 ${className}`}>
      {/* ── Search Input Bar ──────────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className={`flex flex-col sm:flex-row gap-3 rounded-2xl p-2 border border-white/20 ${!showButton ? "sm:flex-col" : ""}`}
        style={{ background: "rgba(255,255,255,0.10)", backdropFilter: "blur(12px)" }}
      >
        <div className={`flex-1 flex items-center gap-3 px-4 py-1 relative ${!showButton ? "py-2" : ""}`}>
          <svg className="w-5 h-5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.5)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            id="hero-search"
            value={query}
            onChange={handleChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            className="flex-1 bg-transparent text-sm text-white placeholder-white/50 outline-none min-w-0"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); setResults([]); setOpen(false); inputRef.current?.focus(); }}
              className="flex-shrink-0 transition-colors"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {loading && (
            <svg className="w-4 h-4 animate-spin flex-shrink-0 text-[#2fa3f2]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          )}
        </div>

        {showButton && (
          <button
            type="submit"
            className="px-8 py-3 font-bold rounded-xl transition-all duration-200 text-sm whitespace-nowrap text-white hover:shadow-lg hover:-translate-y-0.5"
            style={{ background: "#2fa3f2", boxShadow: "0 4px 15px rgba(47,163,242,0.4)" }}
          >
            Search Packages
          </button>
        )}
      </form>

      {/* ── Suggestions Dropdown ──────────────────────────────────────────── */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-3 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] z-[100] overflow-hidden"
          style={{
            background: "#0c1e28",
            border: "1px solid rgba(255,255,255,0.15)",
            animation: "dropdownIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-8 text-center bg-[#0c1e28]">
                <svg className="w-6 h-6 animate-spin mx-auto text-[#2fa3f2] mb-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <p className="text-xs text-white/40">Searching destinations...</p>
              </div>
            ) : results.length > 0 ? (
              <>
                {/* Dropdown Header */}
                <div className="px-4 py-3 flex items-center justify-between sticky top-0 z-10 bg-[#0c1e28] shadow-sm"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#2fa3f2]">
                    {popular ? "✨ Popular Choices" : "📍 Suggestions"}
                  </span>
                  <span className="text-[10px] text-white/30 font-medium">
                    {results.length} Found
                  </span>
                </div>

                {/* List Items */}
                <ul className="py-1">
                  {results.map((dest, i) => {
                    const typeInfo = TYPE_LABEL[dest.type] || TYPE_LABEL.destination;
                    const isActive = i === activeIdx;
                    const subtitle = [dest.state, dest.country].filter(Boolean).join(", ");
                    return (
                      <li key={`${dest.slug}-${i}`}>
                        <button
                          type="button"
                          onClick={() => selectDest(dest)}
                          onMouseEnter={() => setActiveIdx(i)}
                          className="w-full flex items-center gap-4 px-5 py-3.5 text-left transition-all duration-150"
                          style={{
                            background: isActive ? "rgba(47,163,242,0.15)" : "transparent",
                          }}
                        >
                          <span className="text-2xl w-8 text-center flex-shrink-0">{dest.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-bold text-white leading-none">
                                <Highlight text={dest.name} query={query} />
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${typeInfo.color}`}>
                                {typeInfo.label}
                              </span>
                            </div>
                            {subtitle && (
                              <p className="text-xs text-white/40 truncate">
                                <Highlight text={subtitle} query={query} />
                              </p>
                            )}
                          </div>
                          <svg
                            className={`w-4 h-4 transition-all ${isActive ? "text-[#2fa3f2] translate-x-1" : "text-white/10"}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        {i < results.length - 1 && (
                          <div className="mx-5 h-[1px] bg-white/5" />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : query.length > 0 && (
              /* No Results State */
              <div className="p-12 text-center bg-[#0c1e28]">
                <div className="text-4xl mb-4 opacity-50">🏝️</div>
                <p className="text-sm font-bold text-white mb-1">No destinations found</p>
                <p className="text-xs text-white/40 mb-6">We couldn't find &ldquo;{query}&rdquo;. Try another name?</p>
                <button
                  onClick={() => router.push(`/packages?destination=${encodeURIComponent(query)}`)}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all bg-[#2fa3f2]/10 border border-[#2fa3f2]/30 hover:bg-[#2fa3f2]/20"
                >
                  Search all packages for &ldquo;{query}&rdquo;
                </button>
              </div>
            )}
          </div>

          {/* Fixed Footer Hint */}
          <div className="px-5 py-3.5 bg-[#09171f] border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-white/20 font-medium">Use ↑↓ to navigate</span>
              <span className="w-1 h-1 rounded-full bg-white/10" />
              <span className="text-[10px] text-white/20 font-medium">Enter to select</span>
            </div>
            <span className="text-[10px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded">Esc to close</span>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-12px) scale(0.99); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
