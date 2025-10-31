import React from "react";
import { v4 as uuidv4 } from "uuid";
import type { Assessment, Question } from "../hooks/useAssessments";
import AssessmentPreview from "./AssessmentPreview";

interface Props {
  assessment: Assessment;
  setAssessment: React.Dispatch<React.SetStateAction<Assessment | null>>;
  onSave: () => void;
}

export default function AssessmentBuilder({ assessment, setAssessment, onSave }: Props) {
  if (!assessment) return null;

  const addSection = () => {
    const newSection = {
      id: uuidv4(),
      title: "New Section",
      questions: [] as Question[],
    };
    setAssessment({
      ...assessment,
      sections: [...assessment.sections, newSection],
    });
  };

  const addQuestion = (sid: string) => {
    const newQuestion: Question = {
      id: uuidv4(),
      type: "short-text",
      label: "Enter your question here",
    };
    setAssessment({
      ...assessment,
      sections: assessment.sections.map((s) =>
        s.id === sid ? { ...s, questions: [...s.questions, newQuestion] } : s
      ),
    });
  };

  const handleSave = () => {
    onSave();
    alert("✅ Assessment saved successfully!");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* LEFT: Builder */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-semibold text-slate-800">Assessment Builder</h3>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:opacity-90"
          >
            Save
          </button>
        </div>

        {assessment.sections.map((section) => (
          <div key={section.id} className="border rounded-lg p-4 shadow-sm bg-white">
            <input
              value={section.title}
              onChange={(e) =>
                setAssessment({
                  ...assessment,
                  sections: assessment.sections.map((s) =>
                    s.id === section.id ? { ...s, title: e.target.value } : s
                  ),
                })
              }
              className="font-semibold text-lg w-full border-b mb-3 focus:outline-none"
              placeholder="Section title (e.g., Technical Skills)"
            />

            {section.questions.map((q) => (
              <div key={q.id} className="p-2 border rounded mb-2 bg-slate-50">
                <input
                  value={q.label}
                  onChange={(e) =>
                    setAssessment({
                      ...assessment,
                      sections: assessment.sections.map((s) =>
                        s.id === section.id
                          ? {
                              ...s,
                              questions: s.questions.map((qq) =>
                                qq.id === q.id ? { ...qq, label: e.target.value } : qq
                              ),
                            }
                          : s
                      ),
                    })
                  }
                  className="w-full border-b focus:outline-none text-sm"
                  placeholder="Enter question text"
                />
                <select
                  value={q.type}
                  onChange={(e) =>
                    setAssessment({
                      ...assessment,
                      sections: assessment.sections.map((s) =>
                        s.id === section.id
                          ? {
                              ...s,
                              questions: s.questions.map((qq) =>
                                qq.id === q.id
                                  ? { ...qq, type: e.target.value as Question["type"] }
                                  : qq
                              ),
                            }
                          : s
                      ),
                    })
                  }
                  className="mt-2 border rounded px-2 py-1 text-sm"
                >
                  <option value="short-text">Short Text (e.g., Describe your role)</option>
                  <option value="long-text">Long Text (e.g., Explain a project)</option>
                  <option value="single-choice">Single Choice (e.g., Yes / No)</option>
                  <option value="multi-choice">Multiple Choice (e.g., Select skills)</option>
                  <option value="numeric">Numeric (e.g., Years of experience)</option>
                  <option value="file">File Upload (e.g., Resume upload)</option>
                </select>
              </div>
            ))}

            <button
              onClick={() => addQuestion(section.id)}
              className="mt-3 text-sm text-indigo-600 hover:underline"
            >
              + Add Question
            </button>
          </div>
        ))}

        <button onClick={addSection} className="text-indigo-600 hover:underline text-sm">
          + Add Section
        </button>
      </div>

      {/* RIGHT: Preview */}
      <AssessmentPreview assessment={assessment} />
    </div>
  );
}
