# LedgerPilot — AI Finance Controller

> **Reconcile. Investigate. Control.**  
> Built for **Razorpay Buildathon — Track 04: AI Finance Controller**

---

## 1. Problem Statement

Finance operations teams spend hundreds of hours manually cross-referencing internal order books against payment gateway webhooks and bank nodal settlement feeds. Minor rounding variances, dropped webhooks, duplicate debit events, and banking deductions cause reconciliation backlogs. Existing tools either rely on brittle manual spreadsheets or hallucination-prone LLM scripts that guess accounting figures.

## 2. The Solution

**LedgerPilot** is a production-grade AI-assisted Finance Operations Controller. It automates 3-way financial reconciliation across 120+ multi-source synthetic records (`Orders` → `Payments` → `Settlements`), guarantees deterministic mathematical accuracy, measures actual runtime throughput and match rates against ground truth, scores exception severities, and leverages **Groq AI (`llama-3.3-70b-versatile`)** strictly for evidence-grounded investigations and operational explanations.

---

## 3. Product Positioning & Critical AI Safety Rule

> *"LedgerPilot is NOT an AI that does accounting. It is an AI-assisted finance operations controller that automates reconciliation and investigation while keeping financial truth deterministic, auditable, and mathematically sound."*

### Strict Architectural Separation:
* **Deterministic Core (Python / Pandas / SQLite)**: Record matching, amount delta comparisons, tolerance thresholds, duplicate detection, missing record detection, date discrepancy detection, match rates, ground-truth accuracy, precision, recall, F1, and throughput benchmarks.
* **AI Layer (Groq SDK - `llama-3.3-70b-versatile`)**: Structured transaction investigations, root cause hypotheses, natural-language copilot intelligence, and remediation recommendations. **The LLM never invents or alters financial values.**

---

## 4. System Architecture

```
                                  +---------------------------------------+
                                  |     Synthetic Multi-Source Feeds      |
                                  |   Orders | Payments | Settlements    |
                                  |            (120 Records)              |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |       Data Normalization Layer        |
                                  |    (IDs, Currencies, Dates, Casing)   |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |  Deterministic Reconciliation Engine  |
                                  |      - 3-Way Multi-Point Matching     |
                                  |      - Configurable Tolerance (₹10)   |
                                  |      - Duplicate & Missing Detector   |
                                  +---------+-------------------+---------+
                                            |                   |
                     +----------------------+                   +---------------------+
                     v                                                                v
   +------------------------------------+                           +------------------------------------+
   |   Metrics & Evaluation Engine      |                           |     Exception Scoring Engine       |
   | - Match Rate (% Calculated)        |                           | - Severity (Critical/High/Med/Low) |
   | - Accuracy vs Ground Truth (%)     |                           | - Auto-Resolved vs Human Review    |
   | - Measured Throughput (recs/sec)   |                           | - Baseline Audit Explanations      |
   +-----------------+------------------+                           +-----------------+------------------+
                     |                                                                |
                     +----------------------+                   +---------------------+
                                            |                   |
                                            v                   v
                                  +---------------------------------------+
                                  |     SQLite Audit Persistence Layer    |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |          FastAPI REST Backend         |
                                  |    (/reconcile, /transactions, /ai)   |
                                  +---------+-------------------+---------+
                                            |                   |
                     +----------------------+                   +---------------------+
                     v                                                                v
   +------------------------------------+                           +------------------------------------+
   |     Groq AI Intelligence Layer     |                           |    Modern React Control Center     |
   | - Model: llama-3.3-70b-versatile   |                           | - Executive KPI Grid               |
   | - Strict Non-Inventive Guardrails  |                           | - 3-Way Flow Visualizer            |
   | - Grounded Context Only            |                           | - Interactive AI Copilot           |
   | - Graceful Fallback Engine         |                           | - Audit Reports (CSV/JSON/Print)   |
   +------------------------------------+                           +------------------------------------+
```

---

## 5. Core Features

1. **3-Way Multi-Source Matching**: Reconciles `Orders` (Internal Ledger) → `Payments` (Gateway) → `Settlements` (Bank Nodal).
2. **Deterministic Status Classification**:
   * `MATCHED`: Exact 3-way reconciliation (₹0 variance).
   * `MATCHED_WITH_TOLERANCE`: Variance within configurable threshold (default ₹10.00).
   * `AMOUNT_MISMATCH`: Material variance requiring fee audit or investigation.
   * `MISSING_PAYMENT`: Order recorded without gateway transaction.
   * `MISSING_SETTLEMENT`: Gateway capture without bank settlement.
   * `DUPLICATE`: Colliding transaction IDs flagged for dual-debit audit.
   * `DATE_MISMATCH`: Abnormal settlement timing or lifecycle drift.
   * `UNRESOLVED`: Multi-point conflicts requiring manual operator intervention.
3. **Ground-Truth Dynamic Evaluation**: Real-time calculation of Classification Accuracy, Precision, Recall, F1 Score, and Exception Recall against `ground_truth.csv`.
4. **Measured Throughput & Runtime**: Actual `perf_counter` latency in milliseconds and records/second throughput.
5. **Interactive 3-Way Flow Visualizer**: Step-by-step visual audit trail (`Order` → `Payment` → `Settlement`) with difference calculations.
6. **Groq AI Investigation**: 1-click structured investigation returning Summary, Evidence citations, Likely Causes, and Recommended Remediation.
7. **AI Finance Copilot**: Natural-language chat grounded in active batch metrics and top exceptions.
8. **Audit Reports & Export**: Complete executive reconciliation brief with downloadable CSV, JSON, and printable formats.
9. **Configurable Tolerance Rules**: Instant live tolerance slider to re-evaluate batch and observe auto-match rate shifts.

---

## 6. Tech Stack

* **Frontend**: React 18, Vite, Tailwind CSS, Lucide React icons, Recharts
* **Backend**: Python 3.13, FastAPI, Pydantic v2, Pandas, SQLAlchemy
* **Database**: SQLite (ACID compliant audit logs)
* **AI / LLM**: Groq SDK (`llama-3.3-70b-versatile` with deterministic fallback)
* **Testing**: Pytest automated unit tests

---

## 7. Quickstart Setup Guide

### Step 1: Backend Setup
```bash
cd backend

# Create virtual environment (optional)
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and enter your GROQ_API_KEY (optional, fallback engine active if omitted)

# Run automated tests
pytest tests/ -v

# Start FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend API will be available at: `http://127.0.0.1:8000` (Swagger docs at `/docs`).

### Step 2: Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Frontend application will be available at: `http://localhost:5173`.

---

## 8. Verified Benchmark Metrics (120 Records Synthetic Batch)

| Metric | Measured Value | Description |
| :--- | :--- | :--- |
| **Total Records** | **120** | Multi-source synthetic dataset |
| **Match Rate** | **~70.8%** | Exact matches + tolerance matches |
| **Controller Accuracy** | **100.0%** | Verified against Ground Truth |
| **Exception Recall** | **100.0%** | Zero false clears on ground truth exceptions |
| **Throughput** | **> 3,500 recs/sec** | Measured deterministic engine speed |
| **Processing Time** | **< 35 ms** | Sub-second full batch reconciliation |
| **Auto-Resolution Rate** | **~74.2%** | Exact + tolerance + duplicate flags |

---

## 9. AI Safety & Guardrails Summary

LedgerPilot enforces strict guardrails for production financial environments:
1. Financial calculations are **100% deterministic**; LLMs are never allowed to calculate differences or classify financial truth.
2. The AI is fed only sanitized, structured transaction context or aggregate batch statistics to preserve token efficiency and prevent data leakage.
3. Fallback engine ensures uninterrupted finance operations even if third-party LLM APIs experience outages or rate limits.

---

## 10. License

Built for **Razorpay Buildathon — Track 04: AI Finance Controller**. MIT License.
