import { useEffect, useState } from "react";

export interface Question {
  id: string;
  type: "single-choice" | "multi-choice" | "short-text" | "long-text" | "numeric" | "file";
  label: string;
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
  condition?: { questionId: string; equals: string };
}

export interface Assessment {
  jobId: string;
  sections: {
    id: string;
    title: string;
    questions: Question[];
  }[];
}

export function useAssessments(jobId?: string) {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;
    (async () => {
      try {
        const res = await fetch(`/api/assessments/${jobId}`);
        const data = await res.json();
        setAssessment(data.assessment);
      } catch (err) {
        console.error("Failed to fetch assessment", err);
        setAssessment({ jobId, sections: [] });
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId]);

  async function saveAssessment(a: Assessment) {
    const res = await fetch(`/api/assessments/${a.jobId}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(a),
    });
    const data = await res.json();
    setAssessment(data.assessment);
  }

  async function submitResponse(jobId: string, response: Record<string, unknown>) {
    await fetch(`/api/assessments/${jobId}/submit`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(response),
    });
  }

  return { assessment, loading, saveAssessment, submitResponse, setAssessment };
}
