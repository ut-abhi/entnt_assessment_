import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { Candidate } from "../hooks/useCandidates";

type TimelineEntry = { id: string; stage: string; date: string };

export default function CandidateProfilePage() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);

  useEffect(() => {
    (async () => {
      const r1 = await fetch(`/api/candidates/${id}`);
      const data = await r1.json();
      setCandidate(data.candidate ?? data);

      const r2 = await fetch(`/api/candidates/${id}/timeline`);
      const t = await r2.json();
      setTimeline(t.timeline ?? t);
    })();
  }, [id]);

  if (!candidate)
    return (
      <div className="p-10 text-center text-gray-500 animate-pulse">
        Loading candidate profile...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-indigo-50 px-8 py-10">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow border p-8">
        <Link to="/candidates" className="text-indigo-600 hover:underline text-sm">
          ← Back to list
        </Link>

        <h2 className="text-2xl font-bold mt-4 mb-2 text-slate-800">
          {candidate.name}
        </h2>
        <p className="text-slate-500 mb-6">{candidate.email}</p>

        <div className="mb-8">
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              candidate.stage === "hired"
                ? "bg-green-100 text-green-700"
                : candidate.stage === "rejected"
                ? "bg-rose-100 text-rose-700"
                : "bg-indigo-100 text-indigo-700"
            }`}
          >
            Current Stage: {candidate.stage}
          </span>
        </div>

        <h3 className="font-semibold text-slate-700 mb-3">Status Timeline</h3>
        <ul className="space-y-3">
          {timeline.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-3 text-sm text-slate-600"
            >
              <span className="w-2 h-2 bg-indigo-500 rounded-full" />
              {t.stage} — <span className="text-slate-400">{t.date}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
