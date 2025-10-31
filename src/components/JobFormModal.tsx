// src/components/JobFormModal.tsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Job } from "../hooks/useJobs";

type FormValues = { title: string; slug: string; tags: string; };

type Props = {
  job: Job | null;
  onClose: () => void;
  onCreate: (data: { title: string; slug: string; tags: string[] }) => Promise<void>;
  onSave: (id: string, patch: Partial<Job>) => Promise<void>;
};

export default function JobFormModal({ job, onClose, onCreate, onSave }: Props) {
  const { register, handleSubmit, reset, setValue } = useForm<FormValues>({ defaultValues: { title: "", slug: "", tags: "" } });

  useEffect(() => {
    if (job) {
      setValue("title", job.title ?? "");
      setValue("slug", job.slug ?? "");
      setValue("tags", (job.tags ?? []).join(", "));
    } else {
      reset();
    }
  }, [job, reset, setValue]);

  async function onSubmitCreate(values: FormValues) {
    const tags = values.tags.split(",").map(s => s.trim()).filter(Boolean);
    await onCreate({ title: values.title, slug: values.slug, tags });
    reset();
  }

  async function onSubmitSave(values: FormValues) {
    if (!job) return;
    const tags = values.tags.split(",").map(s => s.trim()).filter(Boolean);
    await onSave(job.id, { title: values.title, slug: values.slug, tags });
  }

  return (
    <div>
      <div className="flex items-start gap-4">
        <div className="w-full">
          <h3 className="text-lg font-semibold mb-4">{job ? "Edit Job" : "Create Job"}</h3>
          <form onSubmit={handleSubmit(job ? onSubmitSave : onSubmitCreate)} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Title</label>
              <input {...register("title", { required: true })} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Slug (unique)</label>
              <input {...register("slug", { required: true })} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Tags (comma separated)</label>
              <input {...register("tags")} className="w-full border rounded px-3 py-2" />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => { reset(); onClose(); }} className="px-4 py-2 border rounded">Cancel</button>
              <button type="submit" className="btn-primary">{job ? "Save" : "Create"}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
