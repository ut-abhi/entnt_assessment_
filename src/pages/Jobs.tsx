import React, { useState, useMemo } from "react";
import { useJobs } from "../hooks/useJobs";
import type { Job } from "../hooks/useJobs";
import JobFormModal from "../components/JobFormModal";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";

export default function JobsPage() {
  const { jobs, loading, createJob, updateJob, reorderJobs } = useJobs();
  const [showModal, setShowModal] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return jobs;
    return jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(s) ||
        j.slug.toLowerCase().includes(s) ||
        j.tags.join(" ").toLowerCase().includes(s)
    );
  }, [jobs, search]);

  if (loading)
    return (
      <div className="py-20 text-center text-gray-500 animate-pulse">
        Loading jobs...
      </div>
    );

  async function onCreate(data: { title: string; slug: string; tags: string[] }) {
    await createJob({ ...data, status: "active", order: jobs.length });
    setShowModal(false);
  }

  async function onSave(id: string, patch: Partial<Job>) {
    await updateJob(id, patch);
    setShowModal(false);
  }

  async function onDragEnd(result: DropResult) {
    const { source, destination } = result;
    if (!destination || source.index === destination.index) return;

    const next = Array.from(jobs);
    const [moved] = next.splice(source.index, 1);
    next.splice(destination.index, 0, moved);

    const withOrder = next.map((j, idx) => ({ ...j, order: idx }));
    try {
      await reorderJobs(withOrder);
    } catch {
      alert("Reorder failed — list reloaded");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 px-8 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
              TalentFlow — Jobs Dashboard
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage roles, tags, and job visibility
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              aria-label="search"
              placeholder="🔍 Search jobs, tags or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-3 py-2 w-72 shadow-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none"
            />
            <button
              onClick={() => {
                setEditJob(null);
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium bg-gradient-to-r from-indigo-600 to-blue-500 shadow hover:opacity-95 transition"
            >
              + Create Job
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-hidden rounded-xl bg-white shadow border border-gray-200">
          <DragDropContext onDragEnd={onDragEnd}>
            <table className="min-w-full">
              <thead className="bg-slate-100 text-slate-700 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">#</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Slug</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Tags</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>

              <Droppable droppableId="jobs-table">
                {(provided) => (
                  <tbody
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="divide-y divide-gray-100"
                  >
                    {filtered.map((job, index) => (
                      <Draggable key={job.id} draggableId={job.id} index={index}>
                        {(prov) => (
                          <tr
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            style={{
                              ...(prov.draggableProps.style as React.CSSProperties),
                            }}
                            className={`hover:bg-slate-50 transition ${
                              job.status === "archived" ? "opacity-70" : ""
                            }`}
                          >
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {index + 1}
                            </td>

                            <td className="px-6 py-4 font-medium text-slate-800">
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center gap-2"
                              >
                                <span
                                  {...prov.dragHandleProps}
                                  className="text-slate-400 cursor-grab select-none"
                                  title="Drag to reorder"
                                >
                                  ☰
                                </span>
                                <span>{job.title}</span>
                              </motion.div>
                            </td>

                            <td className="px-6 py-4 text-sm text-slate-500">
                              {job.slug}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {job.tags.join(", ")}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  job.status === "active"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-200 text-gray-600"
                                }`}
                              >
                                {job.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right space-x-3">
                              <button
                                className="text-sm text-indigo-600 hover:underline"
                                onClick={() => {
                                  setEditJob(job);
                                  setShowModal(true);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="text-sm text-rose-600 hover:underline"
                                onClick={() =>
                                  updateJob(job.id, {
                                    status:
                                      job.status === "active"
                                        ? "archived"
                                        : "active",
                                  })
                                }
                              >
                                {job.status === "active"
                                  ? "Archive"
                                  : "Unarchive"}
                              </button>
                            </td>
                          </tr>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </tbody>
                )}
              </Droppable>
            </table>
          </DragDropContext>

          {filtered.length === 0 && (
            <div className="p-8 text-center text-slate-500">No jobs found</div>
          )}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-start justify-center pt-20 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl mx-4"
              >
                <JobFormModal
                  job={editJob}
                  onClose={() => setShowModal(false)}
                  onCreate={onCreate}
                  onSave={onSave}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
