import React, { useMemo, useState, useEffect, useRef } from "react";
import { useCandidates } from "../hooks/useCandidates";
import { useNavigate } from "react-router-dom";


export default function CandidatesPage() {
  const { candidates, loading } = useCandidates();
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("all");
  const navigate = useNavigate();

  const stages = ["applied", "screen", "tech", "offer", "hired", "rejected"];

  // Filtered results
  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return candidates.filter((c) => {
      const matchesSearch =
        !s ||
        c.name.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s);
      const matchesStage = stage === "all" || c.stage === stage;
      return matchesSearch && matchesStage;
    });
  }, [candidates, search, stage]);

  // Lazy render visible chunk of items manually
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(40);

  useEffect(() => {
    const div = containerRef.current;
    if (!div) return;

    const onScroll = () => {
      if (div.scrollTop + div.clientHeight >= div.scrollHeight - 200) {
        setVisible((v) => Math.min(v + 30, filtered.length));
      }
    };
    div.addEventListener("scroll", onScroll);
    return () => div.removeEventListener("scroll", onScroll);
  }, [filtered.length]);

  if (loading)
    return (
      <div className="py-20 text-center text-gray-500 animate-pulse">
        Loading candidates...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 px-8 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
              Candidates
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage applicants and track hiring stages
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              aria-label="search"
              placeholder="🔍 Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-3 py-2 w-64 shadow-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none"
            />
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="border rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none"
            >
              <option value="all">All stages</option>
              {stages.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scrollable List */}
        <div
          ref={containerRef}
          className="rounded-xl bg-white shadow border border-gray-200 overflow-y-auto max-h-[500px]"
        >
          {filtered.slice(0, visible).map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between border-b px-6 py-3 hover:bg-slate-50 transition cursor-pointer"
              onClick={() => navigate(`/candidates/${c.id}`)}
            >
              <div>
                <div className="font-medium text-slate-800">{c.name}</div>
                <div className="text-sm text-slate-500">{c.email}</div>
              </div>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  c.stage === "hired"
                    ? "bg-green-100 text-green-700"
                    : c.stage === "rejected"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-indigo-100 text-indigo-700"
                }`}
              >
                {c.stage}
              </span>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="p-8 text-center text-slate-500">No candidates found</div>
          )}
        </div>
      </div>
    </div>
  );
}
