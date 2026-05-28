# 📄 AI Resume Screening Module

An intelligent, AI-powered resume screening extension for the Resume-Project MERN application. This module enables bulk resume uploads, automated scoring against a job description using the **Cohere AI** API, and exportable ranked candidate reports.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Database Setup (PostgreSQL)](#database-setup-postgresql)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Frontend Pages](#frontend-pages)
- [File Support](#file-support)
- [Exporting Results](#exporting-results)
- [Troubleshooting](#troubleshooting)

---

## Overview

The screening module adds the following capabilities to the existing Resume-Project:

| Feature | Description |
|---|---|
| **Multi-Resume Upload** | Upload up to 10 resumes (PDF / DOCX) at once via drag-and-drop |
| **Job Description Input** | Provide a JD as plain text or upload a JD file (PDF / DOCX) |
| **AI Scoring** | Each resume is scored 0-100 against the JD using Cohere's `command` model |
| **Candidate Ranking** | Candidates are automatically ranked by match score |
| **Skill Gap Analysis** | Matching and missing skills are extracted per candidate |
| **Session History** | All screening runs are persisted and browsable |
| **CSV / Excel Export** | Download ranked results as `.csv` or `.xlsx` |

---

## Architecture

```
Resume-Project/
├── backend_ai/                   # Express.js backend
│   ├── Controllers/
│   │   └── screeningController.js    # Core AI screening logic
│   ├── Models/
│   │   ├── index.js                  # Sequelize associations & sync
│   │   ├── ScreeningSession.js       # Session model
│   │   └── ScreeningCandidate.js     # Candidate model
│   ├── Routes/
│   │   └── screening.js             # Screening API endpoints
│   ├── utils/
│   │   └── screeningMulter.js        # Multer config for file uploads
│   ├── conn.js                       # PostgreSQL (Sequelize) connection
│   ├── index.js                      # Express entry point
│   └── .env                          # Environment variables
│
└── mern_ai/                      # React (Vite) frontend
    └── src/
        ├── component/Screening/
        │   ├── ScreeningPage.jsx          # Main upload & screen page
        │   ├── ScreeningHistoryPage.jsx   # Past sessions overview
        │   └── ScreeningResultsPage.jsx   # Detailed session results
        ├── components/screening/
        │   ├── DropzoneUploader.jsx        # Drag-and-drop file picker
        │   ├── ScoreRing.jsx              # Radial score visualization
        │   ├── CandidateCard.jsx          # Expandable candidate card
        │   ├── LoadingOverlay.jsx         # Animated loading spinner
        │   └── ScreeningToolbar.jsx       # Sort, filter & export bar
        ├── services/
        │   └── screeningService.js        # Axios API calls
        └── App.jsx                        # Route definitions
```

---

## Prerequisites

| Requirement | Version |
|---|---|
| **Node.js** | v18 or later |
| **npm** | v9 or later |
| **PostgreSQL** | v14 or later |
| **Cohere API Key** | Free tier works — [Get one here](https://dashboard.cohere.com/api-keys) |

---

## Environment Variables

Create or update the file `backend_ai/.env`:

```env
# PostgreSQL connection
DB_HOST=localhost
DB_PORT=5432
DB_NAME=resume_screening
DB_USER=postgres
DB_PASSWORD=your_password_here

# Cohere AI
COHERE_API_KEY=your_cohere_api_key_here
```

> **Important**: Replace `your_password_here` and `your_cohere_api_key_here` with your actual credentials.

---

## Database Setup (PostgreSQL)

### 1. Create the database

Open a terminal or use **pgAdmin** to create the database:

```sql
CREATE DATABASE resume_screening;
```

### 2. Automatic schema sync

The application uses **Sequelize** with `sync({ alter: true })`, which means:
- Tables are created automatically on first startup.
- Schema changes are applied non-destructively on subsequent starts.

**No manual migrations are required.** Just start the backend and Sequelize handles the rest.

### Database Tables Created

| Table | Description |
|---|---|
| `Users` | User accounts |
| `Resumes` | Individual resume records |
| `ScreeningSessions` | Each screening run (stores the JD text, session name, timestamps) |
| `ScreeningCandidates` | Per-resume scoring results linked to a session |

---

## Running the Application

### 1. Install backend dependencies

```bash
cd backend_ai
npm install
```

### 2. Install frontend dependencies

```bash
cd mern_ai
npm install
```

### 3. Start the backend (port 4000)

```bash
cd backend_ai
npm start
```

You should see:
```
backend is running on port 4000
Database Connected Successfully
All models synced successfully
```

### 4. Start the frontend (port 5173)

```bash
cd mern_ai
npm run dev
```

The Vite dev server will start on `http://localhost:5173`. The Vite proxy configuration automatically forwards all `/api` requests to `http://localhost:4000`.

### 5. Open in browser

Navigate to **http://localhost:5173/screen** to access the Resume Screener.

---

## API Reference

All endpoints are prefixed with `/api/screening`.

### `POST /api/screening/screen`

Screen multiple resumes against a job description.

**Content-Type**: `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `resumes` | File[] | ✅ | Up to 10 resume files (PDF/DOCX) |
| `jdFile` | File | ❌ | Optional JD file (PDF/DOCX) |
| `jobDescription` | String | ❌* | Job description as plain text |
| `sessionName` | String | ❌ | Custom name for this screening run |

> *Either `jobDescription` (text) or `jdFile` must be provided.

**Response**: `200 OK`
```json
{
  "message": "Screening complete",
  "data": {
    "id": 1,
    "sessionName": "...",
    "jobDescription": "...",
    "candidates": [ ... ]
  }
}
```

---

### `GET /api/screening/history`

Returns all past screening sessions with candidate counts and top scores.

**Response**: `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "sessionName": "Frontend Hiring",
      "candidateCount": 5,
      "topScore": 87,
      "createdAt": "2026-05-28T..."
    }
  ]
}
```

---

### `GET /api/screening/session/:id`

Returns full details for a single screening session with all candidates.

---

### `GET /api/screening/export/csv/:sessionId`

Downloads ranked candidates as a `.csv` file.

---

### `GET /api/screening/export/excel/:sessionId`

Downloads ranked candidates as an `.xlsx` file.

---

## Frontend Pages

| Route | Page | Description |
|---|---|---|
| `/screen` | **Resume Screener** | Upload resumes, input/upload JD, name the session, and run screening |
| `/screen/history` | **Screening History** | Browse all past screening sessions |
| `/screen/results/:sessionId` | **Screening Results** | View ranked candidates for a specific session |

### Navigation

The sidebar includes two new links:
- **Resume Screener** → `/screen`
- **Screening History** → `/screen/history`

---

## File Support

| Format | Extension | Library Used |
|---|---|---|
| PDF | `.pdf` | `pdf-parse` |
| Word Document | `.docx`, `.doc` | `mammoth` |

Uploaded files are temporarily stored in `backend_ai/uploads/screening/` and cleaned up automatically after processing.

---

## Exporting Results

From the **Screening Results** page, you can export the ranked candidate list:

- **CSV Export** — lightweight, opens in any spreadsheet application
- **Excel Export** — formatted `.xlsx` with preset column widths

Exported columns include: Rank, Candidate Name, File Name, Match Score, Matching Skills, Missing Skills, Experience Relevance, Education Alignment, and Summary.

---

## Troubleshooting

### "Database Connected Successfully" does not appear

- Verify PostgreSQL is running on the configured `DB_HOST` and `DB_PORT`.
- Check that the `resume_screening` database exists.
- Confirm `DB_USER` and `DB_PASSWORD` in `.env` are correct.

### "Unsupported file type" error

Only `.pdf`, `.doc`, and `.docx` files are supported. Plain text and other formats are not accepted.

### Cohere API errors

- Ensure `COHERE_API_KEY` is valid and active.
- The free tier has rate limits — if processing many resumes, add small delays between requests or upgrade your plan.

### Frontend can't reach the backend

- Make sure the backend is running on port **4000** before starting the frontend.
- The Vite dev proxy (`vite.config.js`) routes `/api` requests to `http://localhost:4000`.
- If deploying to production, update the proxy or use environment-based API URLs.
