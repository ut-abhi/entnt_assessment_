import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAssessments } from "../hooks/useAssessments";

export default function AssessmentFormRuntime() {
  const { jobId } = useParams();
  const { assessment, loading, submitResponse } = useAssessments(jobId);
  const [responses, setResponses] = useState<Record<string, string>>({});

  useEffect(() => {
    if (assessment) setResponses({});
  }, [assessment]);

  if (loading) return <div className="text-center py-20">Loading form...</div>;
  if (!assessment) return <div>No assessment found</div>;

  const handleChange = (qid: string, value: string) => {
    setResponses((r) => ({ ...r, [qid]: value }));
  };

  const handleSubmit = async () => {
    await submitResponse(assessment.jobId, responses);
    alert("Response submitted locally ✅");
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">Fill Assessment</h2>
      {assessment.sections.map((section) => (
        <div key={section.id} className="mb-6">
          <h3 className="font-semibold mb-3">{section.title}</h3>
          {section.questions.map((q) => (
            <div key={q.id} className="mb-4">
              <label className="block mb-1 font-medium">{q.label}</label>
              {q.type === "short-text" && (
                <input
                  value={responses[q.id] || ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                  className="border rounded px-2 py-1 w-full"
                />
              )}
              {q.type === "long-text" && (
                <textarea
                  value={responses[q.id] || ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                  className="border rounded px-2 py-1 w-full"
                />
              )}
              {q.type === "numeric" && (
                <input
                  type="number"
                  value={responses[q.id] || ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                  className="border rounded px-2 py-1 w-full"
                />
              )}
              {q.type === "file" && <input type="file" />}
            </div>
          ))}
        </div>
      ))}
      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:opacity-90"
      >
        Submit
      </button>
    </div>
  );
}
