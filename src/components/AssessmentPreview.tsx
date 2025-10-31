import React from "react";
import type { Assessment } from "../hooks/useAssessments";

export default function AssessmentPreview({ assessment }: { assessment: Assessment }) {
  return (
    <div className="p-4 border rounded-lg bg-slate-50">
      <h3 className="text-2xl font-semibold mb-4">Live Preview</h3>
      {assessment.sections.map((section) => (
        <div key={section.id} className="mb-6">
          <h4 className="font-semibold text-lg mb-3">{section.title}</h4>
          {section.questions.map((q) => (
            <div key={q.id} className="mb-3">
              <label className="block font-medium mb-1">{q.label}</label>
              {q.type === "short-text" && <input className="border rounded px-2 py-1 w-full" />}
              {q.type === "long-text" && <textarea className="border rounded px-2 py-1 w-full" />}
              {q.type === "numeric" && <input type="number" className="border rounded px-2 py-1 w-full" />}
              {q.type === "file" && <input type="file" />}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
