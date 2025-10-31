import { useEffect, useState } from "react";

export type Candidate = {
  id: string;
  name: string;
  email: string;
  stage: "applied" | "screen" | "tech" | "offer" | "hired" | "rejected";
};

type MirageListResponse = { candidates: Candidate[] };

export function useCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/candidates");
        const data = (await res.json()) as MirageListResponse;
        if (mounted) setCandidates(data.candidates);
      } catch (err) {
        console.error("Failed to fetch candidates:", err);
        if (mounted) setCandidates([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { candidates, loading };
}
