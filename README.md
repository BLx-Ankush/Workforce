# Workforce Intelligence AI
> **Right People. Balanced Teams. Resilient Projects.**  
> Built for AMC Hack Attack 2026 — Theme: Web & App Development / Workforce Management / HR Tech / Data Analytics

---

## 🌟 Executive Summary

Traditional workforce systems display static employee records and descriptive workload charts. **Workforce Intelligence AI** is an intelligent, full-stack enterprise workforce management platform that uses mathematical constraint optimization to:

1. **Construct Complementary Teams**: Formulates teams based on collective skill coverage rather than independent employee rankings.
2. **Protect Against Fatigue & Burnout**: Transparent Workload Risk Index (0–100) that blocks assignments exceeding safety policies (e.g. Risk $\ge 90$).
3. **Generate Pre-Evaluated Backup Teams**: Synthesizes Primary Teams alongside pre-evaluated Backup Teams A & B using combinatorial diversity cuts.
4. **Emergency Project Recovery**: What-if contingency simulator that detects unexpected employee absence, preserves unaffected team members, and re-staffs vacancies in real time.
5. **GitHub-Backed Skill Verification**: Synchronizes repository commits and pull requests, detects technical skills, and issues verified credentials through an Admin review queue.
6. **Dynamic Resume & Portfolio**: Automatically synthesizes verified achievements into an exportable professional resume.
7. **Practical Mentorship Engine**: Identifies organizational skill shortages and pairs junior talent with verified senior mentors on supervised mini-projects.
8. **Explainable AI Decisions**: Clear, deterministic and generative explanations for every staffing recommendation.

---

## 🏛️ System Architecture

```
                          ┌──────────────────────────────────────────────┐
                          │         React 18 + Vite + Tailwind CSS       │
                          │   (Manager Portal | Employee | Admin Portal) │
                          └──────────────────────┬───────────────────────┘
                                                 │ HTTP / WebSocket (Socket.IO)
                                                 ▼
                          ┌──────────────────────────────────────────────┐
                          │           Node.js + Express REST API         │
                          │  (Auth, Business Logic, DB Services, JWT)    │
                          └──────┬───────────────────────────────┬───────┘
                                 │                               │
                    JSON / HTTP  ▼                               ▼ Mongoose / Resilient Engine
                  ┌──────────────────────┐            ┌──────────────────────┐
                  │ Python FastAPI Micro │            │   MongoDB Database   │
                  │ Google OR-Tools      │            │ (100 Employees,      │
                  │ CP-SAT Engine        │            │  Projects, Audits)   │
                  └──────────────────────┘            └──────────────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **Python**: 3.10+ (tested on Python 3.11 with `ortools`, `fastapi`, `uvicorn`, `pydantic`)
- **MongoDB**: Optional (Connects automatically to MongoDB Atlas/Local if available, or activates the embedded zero-config datastore out-of-the-box!)

### 1. Install & Seed
```bash
# In project root:
npm --prefix backend install
npm --prefix backend run seed
npm --prefix frontend install
```

### 2. Run All 3 Services Concurrently

#### Terminal 1 — Python CP-SAT Optimizer (Port 8001):
```bash
python optimizer/main.py
```

#### Terminal 2 — Node.js REST API & Socket.IO (Port 5000):
```bash
npm --prefix backend run dev
```

#### Terminal 3 — React Frontend (Port 5173):
```bash
npm --prefix frontend run dev
```

Access the UI at: **`http://localhost:5173/`**

---

## 🎭 1-Click Role Switcher & Demo Credentials

Switch roles in 1 click using the header switcher, or log in with credentials:

| Role | Demo Email | Password | Primary Experience |
|---|---|---|---|
| **Manager** | `manager@workforce.ai` | `demo123` | Overview, Team Optimizer, Approval, What-If Emergency Recovery |
| **Employee** | `employee@workforce.ai` | `demo123` | Rahul Sharma: Workload Gauge, GitHub Sync, Verified Resume, Mentorship |
| **Admin** | `admin@workforce.ai` | `demo123` | Verification Queue, Policy Tuning, Immutable Audit Trail |

---

## 🎬 8-Act Hackathon Demonstration Script

### Act 1 — Workforce Overview (Manager Portal)
- Open `http://localhost:5173/` as **Manager**.
- Inspect live KPI cards calculated from real database records: 100 Employees, Active Projects, Overloaded Staff.
- Review the Department Capacity chart and the Fatigue-Aware Workload Distribution pie chart.

### Act 2 — Create or Inspect Project
- Navigate to **Projects & Staffing**.
- Inspect `Enterprise Cloud Analytics Platform` requiring:
  - Cloud Solutions Architect (AWS $\ge 4$)
  - Lead Data Engineer (Python $\ge 4$)
  - Frontend Architect (React $\ge 4$)

### Act 3 — Execute Team Optimizer (CP-SAT)
- Navigate to **Team Optimizer** and click **Find Best Team**.
- Watch Google OR-Tools CP-SAT execute in **~110ms** directly against 100 employee records.
- Observe:
  - **Primary Team**: Rahul Sharma (AWS), Priya Patel (Python), Anita Desai (React) — 100% mandatory compliance.
  - **Backup Team A** & **Backup Team B**: Viable contingency alternatives generated using diversity cuts.
  - **Complementary Matrix**: Shows which employee covers which skill.

### Act 4 — Demonstrate Fatigue-Aware Workload Protection
- Click **Inspect Blocked vs Alternatives**.
- Notice **Arjun Verma** (5/5 Python, 5/5 AWS): Blocked because his Workload Risk is **94/100** (exceeds policy threshold 90).
- The system automatically selected healthy alternatives instead of overloading Arjun.

### Act 5 — Manager Approval
- Click **Approve & Commit Team**.
- Observe the confirmation badge. Assignments are committed to the database, project status changes to `STAFFED`, and workloads recalculate live.

### Act 6 — What-If Emergency Recovery Simulator
- Navigate to **Emergency Recovery**.
- Select `Priya Patel` as becoming unavailable (sick leave / emergency).
- Click **Trigger Absence & Reoptimize**.
- Observe live resilience: CP-SAT preserves unaffected team members (Rahul & Anita) and instantly recommends the optimal replacement.
- Click **Approve Recovery & Commit Replacement** to restore project status to `STAFFED`.

### Act 7 — Employee Portfolio & GitHub Verification
- Switch to **Employee Portal** via the header switcher.
- Observe Rahul Sharma's live capacity meter (Allocated hours vs Available bandwidth).
- Click **GitHub Contributions** and hit **Sync GitHub** to see detected commit evidence.
- Click **Verified Resume & Portfolio** to view the auto-updating resume draft with verified badges.

### Act 8 — Admin Verification Queue & Audit Logs
- Switch to **Admin Portal**.
- Open **Verification Queue**: Review pending GitHub commit evidence and click **Approve & Issue Badge**.
- Open **Workload Safety Policies**: Adjust the blocking threshold (e.g. from 90 to 85) and enforce.
- Open **Audit Logs**: View the tamper-evident history recording all approvals, optimizations, and badge grants.

---

## 📊 Algorithmic Benchmark Results

Tested across 30 optimization trials with 100-employee workforces:

| Metric | Weighted Ranking | Greedy Selection | Google OR-Tools CP-SAT |
|---|---|---|---|
| **Feasible-Solution Rate** | 56.7% | 93.3% | **100.0%** (under valid bounds) |
| **Constraint Violations** | 0.63 / project | 0.07 / project | **0.00 / project** |
| **Team Suitability Score** | 86.8 / 100 | 86.0 / 100 | **86.2 / 100** |
| **Execution Latency** | 1.66 ms | 0.43 ms | **42.75 ms** |

Run the benchmark anytime:
```bash
python benchmarks/benchmark_comparison.py
```

---

## 🧪 Automated Test Suites

Run all tests:
```bash
npm test
```
- **CP-SAT Optimizer Tests**: `python -m unittest test_optimizer.py` (3/3 passing)
- **Backend Services & DB Tests**: `npm --prefix backend test` (3/3 passing)
- **Frontend Type & Bundle Build**: `npm --prefix frontend run build` (Clean build in 2.69s)

---

## 🏆 Compliance with AMC Hack Attack Criteria

- **Matching Accuracy**: Verified mandatory skill thresholds and proficiency levels.
- **Team Optimization**: CP-SAT solves complementary multi-skill team combinations.
- **Skill Gap Analysis**: Identifies critical workforce shortages and pairs junior talent with mentors.
- **Workload Balancing**: Fatigue-aware risk index (0–100) blocks high-risk staff and prevents double-booking.
- **Technical Implementation**: Full-stack integration (React + TypeScript + Vite + Tailwind CSS + Node.js + Python FastAPI + Google OR-Tools + MongoDB).
- **Dashboard Usability**: Polished SaaS aesthetics, KPI cards, interactive video meeting rooms, and live notifications.
- **Practical Impact**: Solves real-world workforce turnover, project deadlines, and staffing emergency recovery.
