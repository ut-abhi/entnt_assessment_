# 💼 TalentFlow — HR Management Dashboard

**TalentFlow** is a full-stack simulation project built with **React + TypeScript + Tailwind CSS**, designed to manage **jobs, candidates, and skill assessments**.  
It uses **MirageJS** to emulate a backend API, making it fully runnable in the browser without any external server.

---

## 🚀 Features

### 🧩 Job Management
- View, create, edit, archive, and reorder jobs.
- Manage job titles, slugs, and tags.
- Drag-and-drop job reordering (powered by `@hello-pangea/dnd`).

### 👥 Candidate Management
- Browse, search, and filter candidates by hiring stage.
- Infinite scrolling for smooth performance.
- Candidate profile pages with detailed **timeline** and **status badges**.

### 📝 Assessment Builder
- Build and preview assessment forms per job.
- Supports multiple question types (short text, long text, choice, numeric, file).
- Save assessment definitions locally (Mirage + LocalStorage).

### 🧠 Assessment Runtime
- Interactive assessment form for candidates to submit answers.
- Local response storage (mock submission).

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | React 19 + TypeScript |
| **Routing** | React Router DOM v6 |
| **Styling** | Tailwind CSS |
| **Animation** | Framer Motion |
| **Form Handling** | React Hook Form |
| **Mock Backend** | MirageJS + Faker |
| **Drag & Drop** | @hello-pangea/dnd |

---

## 📂 Folder Structure

