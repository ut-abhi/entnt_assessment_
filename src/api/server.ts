// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { createServer, Model, RestSerializer, Response, Factory } from "miragejs";
import { faker } from "@faker-js/faker";

const STORAGE_KEY = "talentflow_jobs_v1";
const CANDIDATE_STORAGE = "talentflow_candidates_v1";
const ASSESSMENT_STORAGE = "talentflow_assessments_v1";
const ASSESSMENT_RESPONSES = "talentflow_assessment_responses_v1";

function loadFromStorage<T>(key: string): T[] {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}
function saveToStorage<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function makeServer({ environment = "development" } = {}) {
  return createServer({
    environment,
    serializers: { application: RestSerializer },

    models: {
      job: Model,
      candidate: Model,
    },

    factories: {
      candidate: Factory.extend({
        name() {
          return faker.person.fullName();
        },
        email() {
          return faker.internet.email();
        },
        stage() {
          return faker.helpers.arrayElement([
            "applied",
            "screen",
            "tech",
            "offer",
            "hired",
            "rejected",
          ]);
        },
        jobId() {
          const jobs = loadFromStorage(STORAGE_KEY);
          if (jobs.length > 0) {
            return faker.helpers.arrayElement(jobs).id;
          }
          return faker.string.uuid();
        },
      }),
    },

    routes() {
      this.namespace = "api";
      this.timing = 300 + Math.floor(Math.random() * 700);

      // ---------- JOBS ----------
      this.get("/jobs", (schema) => ({
        jobs: schema.all("job").models.map((m) => m.attrs),
      }));

      this.post("/jobs", (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        if (!attrs.id) attrs.id = String(Date.now());
        schema.create("job", attrs);
        const all = schema.all("job").models.map((m) => m.attrs);
        saveToStorage(STORAGE_KEY, all);
        return { job: attrs };
      });

      this.patch("/jobs/:id", (schema, request) => {
        const id = request.params.id;
        const attrs = JSON.parse(request.requestBody);
        const job = schema.find("job", id);
        if (!job) return new Response(404, {}, { error: "Not found" });
        job.update(attrs);
        const all = schema.all("job").models.map((m) => m.attrs);
        saveToStorage(STORAGE_KEY, all);
        return { job: job.attrs };
      });

      this.patch("/jobs/:id/reorder", (schema) => {
        if (Math.random() < 0.1) {
          return new Response(500, {}, { error: "Random failure" });
        }
        const all = schema.all("job").models.map((m) => m.attrs);
        saveToStorage(STORAGE_KEY, all);
        return { ok: true };
      });

      // ---------- CANDIDATES ----------
      this.get("/candidates", (schema) => ({
        candidates: schema.all("candidate").models.map((m) => m.attrs),
      }));

      this.get("/candidates/:id", (schema, req) => {
        const candidate = schema.find("candidate", req.params.id);
        if (!candidate) return new Response(404, {}, { error: "Not found" });
        return { candidate: candidate.attrs };
      });

      this.patch("/candidates/:id", (schema, req) => {
        const id = req.params.id;
        const data = JSON.parse(req.requestBody);
        const c = schema.find("candidate", id);
        if (!c) return new Response(404, {}, { error: "Not found" });
        c.update(data);
        const all = schema.all("candidate").models.map((m) => m.attrs);
        saveToStorage(CANDIDATE_STORAGE, all);
        return { candidate: c.attrs };
      });

      this.get("/candidates/:id/timeline", (schema, req) => {
        const candidate = schema.find("candidate", req.params.id);
        if (!candidate) return new Response(404, {}, { error: "Not found" });

        const fakeTimeline = Array.from({ length: 4 }, (_, i) => ({
          id: String(i),
          stage: faker.helpers.arrayElement([
            "applied",
            "screen",
            "tech",
            "offer",
            "hired",
            "rejected",
          ]),
          date: faker.date.recent({ days: 30 }).toLocaleDateString(),
        }));
        return { timeline: fakeTimeline };
      });

      // ---------- ASSESSMENTS ----------
      this.get("/assessments/:jobId", (_, req) => {
        const jobId = req.params.jobId;
        const all = loadFromStorage(ASSESSMENT_STORAGE);
        const found = all.find((a: { jobId: string }) => a.jobId === jobId);
        if (!found)
          return {
            assessment: { jobId, sections: [] },
          };
        return { assessment: found };
      });

      this.put("/assessments/:jobId", (_, req) => {
        const jobId = req.params.jobId;
        const data = JSON.parse(req.requestBody);
        const all = loadFromStorage(ASSESSMENT_STORAGE);
        const existingIndex = all.findIndex((a: { jobId: string }) => a.jobId === jobId);
        if (existingIndex >= 0) {
          all[existingIndex] = data;
        } else {
          all.push(data);
        }
        saveToStorage(ASSESSMENT_STORAGE, all);
        return { assessment: data };
      });

      this.post("/assessments/:jobId/submit", (_, req) => {
        const jobId = req.params.jobId;
        const response = JSON.parse(req.requestBody);
        const allResponses = loadFromStorage(ASSESSMENT_RESPONSES);
        allResponses.push({ jobId, response, date: new Date().toISOString() });
        saveToStorage(ASSESSMENT_RESPONSES, allResponses);
        return { ok: true };
      });
    },

    seeds(server) {
      // Jobs
      const persistedJobs = loadFromStorage(STORAGE_KEY);
      if (persistedJobs && persistedJobs.length > 0) {
        persistedJobs.forEach((j) => server.create("job", j));
      } else {
        for (let i = 0; i < 10; i++) {
          const title = faker.lorem.words(3);
          const slug = title.toLowerCase().replace(/\s+/g, "-") + "-" + i;
          server.create("job", {
            id: String(i + 1),
            title,
            slug,
            status: Math.random() > 0.2 ? "active" : "archived",
            tags: faker.helpers.arrayElements(
              ["frontend", "backend", "design", "ml", "product"],
              2
            ),
            order: i,
          });
        }
        const allJobs = server.schema.all("job").models.map((m) => m.attrs);
        saveToStorage(STORAGE_KEY, allJobs);
      }

      // Candidates
      const persistedCandidates = loadFromStorage(CANDIDATE_STORAGE);
      if (persistedCandidates && persistedCandidates.length > 0) {
        persistedCandidates.forEach((c) => server.create("candidate", c));
      } else {
        for (let i = 0; i < 1000; i++) server.create("candidate");
        const allCandidates = server.schema
          .all("candidate")
          .models.map((m) => m.attrs);
        saveToStorage(CANDIDATE_STORAGE, allCandidates);
      }

      // Initialize Assessments storage
      const persistedAssessments = loadFromStorage(ASSESSMENT_STORAGE);
      if (!persistedAssessments) saveToStorage(ASSESSMENT_STORAGE, []);
    },
  });
}
