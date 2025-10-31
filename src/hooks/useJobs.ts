// src/hooks/useJobs.ts
import { useEffect, useState } from "react";

export type Job = {
  id: string;
  title: string;
  slug: string;
  status: "active" | "archived";
  tags: string[];
  order: number;
};

type MirageListResponse = { jobs: Job[] };

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch("/api/jobs");
        const data = (await r.json()) as MirageListResponse;
        // ensure order
        data.jobs.sort((a, b) => a.order - b.order);
        if (mounted) setJobs(data.jobs);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
        if (mounted) setJobs([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function createJob(payload: Partial<Job>) {
    const resp = await fetch("/api/jobs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await resp.json(); // Mirage returns { job: { ... } }
    // some Mirage configs return { job } while others { jobs: [...] } — guard both
    const newJob: Job = j.job ?? j;
    setJobs((prev) => {
      const next = prev ? [...prev, newJob] : [newJob];
      next.sort((a, b) => a.order - b.order);
      return next;
    });
    return newJob;
  }

  async function updateJob(id: string, patch: Partial<Job>) {
    const resp = await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    const j = await resp.json();
    const updatedJob: Job = j.job ?? j;
    setJobs((prev) => (prev ? prev.map((x) => (x.id === id ? updatedJob : x)) : [updatedJob]));
    return updatedJob;
  }

  // reorder: update local order fields and call /reorder endpoint (server persists)
  async function reorderJobs(newJobs: Job[]) {
    // Update local state first (optimistic)
    setJobs(newJobs);

    try {
      // call server reorder endpoint for each job (or one endpoint — depends on your server)
      await Promise.all(
        newJobs.map((job) =>
          fetch(`/api/jobs/${job.id}/reorder`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ order: job.order }),
          })
        )
      );
    } catch (err) {
      // rollback: refetch server list if something fails
      console.error("Reorder failed:", err);
      try {
        const r = await fetch("/api/jobs");
        const data = (await r.json()) as MirageListResponse;
        data.jobs.sort((a, b) => a.order - b.order);
        setJobs(data.jobs);
      } catch (e) {
        console.error("Failed to reload jobs after reorder error:", e);
      }
      throw err;
    }
  }

  return { jobs, loading, createJob, updateJob, reorderJobs, setJobs };
}
