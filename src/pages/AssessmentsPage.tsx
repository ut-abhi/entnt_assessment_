import React from "react";
import { Link } from "react-router-dom";
import { useJobs } from "../hooks/useJobs";

export default function AssessmentsPage() {
  const { jobs, loading } = useJobs();

  if (loading)
    return <div className="text-center py-20 text-slate-500">Loading assessments...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-indigo-600">Assessments</h2>
      <table className="w-full bg-white shadow rounded-xl border border-gray-200">
        <thead className="bg-slate-100 text-left text-sm font-semibold text-slate-700">
          <tr>
            <th className="px-6 py-3">Job Title</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {jobs.map((job) => (
            <tr key={job.id}>
              <td className="px-6 py-4 font-medium">{job.title}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{job.status}</td>
              <td className="px-6 py-4 text-right space-x-3">
                <Link
                  to={`/assessments/${job.id}`}
                  className="text-indigo-600 hover:underline text-sm"
                >
                  Build Assessment
                </Link>
                <Link
                  to={`/assessments/${job.id}/fill`}
                  className="text-blue-500 hover:underline text-sm"
                >
                  Fill Assessment
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
