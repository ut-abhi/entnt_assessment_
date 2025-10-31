import React from "react";
import { Routes, Route, Link, useParams } from "react-router-dom";
import JobsPage from "./pages/Jobs";
import CandidatesPage from "./pages/CandidatesPage";
import CandidateProfilePage from "./pages/CandidateProfilePage";
import AssessmentsPage from "./pages/AssessmentsPage";
import AssessmentFormRuntime from "./pages/AssessmentFormRuntime";
import AssessmentBuilder from "./components/AssessmentBuilder";
import { useAssessments } from "./hooks/useAssessments";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold tracking-wide">TalentFlow</div>
            <nav className="hidden md:flex gap-4 items-center text-sm opacity-90">
              <Link to="/jobs" className="hover:underline">
                Jobs
              </Link>
              <Link to="/candidates" className="hover:underline opacity-80">
                Candidates
              </Link>
              <Link to="/assessments" className="hover:underline opacity-80">
                Assessments
              </Link>
            </nav>
          </div>
          <div className="text-sm opacity-90">HR Dashboard</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Routes>
          {/* Existing routes */}
          <Route path="/" element={<JobsPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/candidates" element={<CandidatesPage />} />
          <Route path="/candidates/:id" element={<CandidateProfilePage />} />

          {/* ✅ New Assessment Routes */}
          <Route path="/assessments" element={<AssessmentsPage />} />
          <Route path="/assessments/:jobId" element={<AssessmentBuilderWrapper />} />
          <Route path="/assessments/:jobId/fill" element={<AssessmentFormRuntime />} />
        </Routes>
      </main>
    </div>
  );
}

/* ✅ Small helper component (kept inside same file to avoid structure changes) */
function AssessmentBuilderWrapper() {
  const { jobId } = useParams();
  const { assessment, loading, saveAssessment, setAssessment } = useAssessments(jobId);

  if (loading)
    return <div className="text-center py-20 text-slate-500">Loading builder...</div>;
  if (!assessment)
    return <div className="text-center py-20 text-rose-500">No assessment found</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <AssessmentBuilder
        assessment={assessment}
        setAssessment={setAssessment}
        onSave={() => saveAssessment(assessment)}
      />
    </div>
  );
}
