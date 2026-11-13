# Aegis — Institutional Disaster Preparedness & Crisis Communication Platform

A full-stack campus safety web application that connects educational institutions with students during emergencies. It combines interactive disaster preparedness training (bilingual 3D flipbooks, interactive safety briefing theaters, and module assessments) with an institutional command center for live GDACS disaster telemetry, student cohort readiness tracking, and emergency broadcasts to students and their guardians.

---

## The Problem

Most colleges and schools run disaster drills on paper once a year. When an actual flood, earthquake, or fire incident occurs:
1. Students have never walked through realistic, actionable protocols beyond "run outside".
2. College administrations have zero visibility into who is actually trained or certified across departments.
3. There is no direct, verifiable channel to broadcast emergency notices simultaneously to students and their registered guardians without relying on congested social media.

Aegis bridges that gap by turning disaster preparedness into a trackable institutional workflow.

---

## Core Capabilities

### 1. Student Training & Certification Modules
- **8 Dedicated Hazards**: Earthquake, Flood, Landslide, Tsunami, Drought, Cyclone, Heat Wave, and Forest Fire.
- **Bilingual 3D Flipbooks**: English & Hindi illustrated survival chapters with realistic page-turning physics built with CSS 3D transforms.
- **Visual Safety Briefings**: Slide-by-slide before/during/after crisis response theater with interactive slide controls.
- **Evaluations & Dynamic Badges**: 10-question scenario-based quizzes per module that log best scores to MongoDB Atlas and unlock persistent profile badges.

### 2. Institutional Command Center (College Portal)
- **Readiness KPIs**: Real-time cohort metrics (enrolled students, institutional readiness score %, fully certified ratio, and lowest completion area).
- **Search & Inspection**: Searchable student roster with drill-down views into individual module scores.
- **Live GDACS Feed**: Real-time global disaster telemetry fetched from the Global Disaster Alert and Coordination System (GDACS SEARCH API). Administrators can inspect active hazard events (Earthquakes, Floods, Tropical Cyclones) and pre-fill campus warnings with one click.
- **Emergency Broadcast Dispatcher**: Dispatches emergency notices and drill instructions via Nodemailer (Gmail SMTP) simultaneously to enrolled students and their emergency guardian contacts (`emgMail`), while persisting alerts to the student dashboard.

### 3. Aegis AI Emergency Assistant
- Floating protocol-grounded chatbot powered by Gemini (`gemini-2.5-flash`).
- Retrieves verified NDMA (National Disaster Management Authority) and FEMA emergency protocols rather than generic LLM hallucinations.
- Surfaces Indian emergency helplines (`112` National Emergency, `108` Ambulance, `101` Fire, `1078` NDRF) with high-priority triage prompts (60-second earthquake checklist, severe bleeding / CPR, go-bag essentials).

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | HTML5, Tailwind CSS, Vanilla JS, GSAP (animations), Vite (multi-page build) |
| **Backend** | Node.js, Express.js (REST API, JWT cookie & Bearer token auth) |
| **Database** | MongoDB Atlas with Mongoose ODM |
| **Integrations** | Google Gemini API, GDACS Global Disaster API, Nodemailer (Gmail SMTP) |
| **Security** | bcrypt password hashing, HTTP-only authentication cookies, input sanitization |

---

## Project Structure

```
aegis/
├── backend/
│   ├── config/             # MongoDB Atlas connection & seeding
│   ├── controllers/        # Auth, College dashboard, Quiz, Chatbot, Student
│   ├── middlewares/        # JWT role verification (Student & College)
│   ├── models/             # Mongoose schemas (Student, College, Alert)
│   ├── routes/             # REST endpoints (/college, /student, /aegis)
│   ├── util/               # GDACS fetcher, NDMA protocols, Nodemailer mailer
│   └── app.js              # Express app entry & static frontend server
├── frontend/
│   ├── public/assets/      # Badges, disaster illustrations, video assets
│   ├── src/                # Styles, GSAP animations, dynamic module renderers
│   ├── index.html          # Public landing page
│   ├── student.html        # Student dashboard & live alerts drawer
│   ├── account.html        # Student profile, badge showcase & quiz scores
│   ├── college.html        # College institutional command center
│   ├── module.html         # Dynamic disaster flipbook viewer
│   ├── video.html          # Interactive safety theater
│   ├── quiz.html           # 10-question evaluation runner
│   └── vite.config.js      # Multi-page Rollup bundle config
└── package.json            # Root deployment & start scripts
```

---

## Getting Started

### Prerequisites
- Node.js (v20 or higher)
- npm
- MongoDB Atlas cluster URI (or local MongoDB)

### 1. Clone the repository
```bash
git clone https://github.com/shivangguptaaa/aegis.git
cd aegis
```

### 2. Configure Environment Variables
Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
GOOGLE_API_KEY=your_gemini_api_key
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
```

### 3. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Run Locally
Run both servers in separate terminals:

```bash
# Terminal 1 — Backend API (port 5000)
cd backend
npm start

# Terminal 2 — Frontend Dev Server (port 5173)
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Production Build
To build and run the full stack from a single Node process:

```bash
# Build frontend and install production backend dependencies
npm run build

# Start single-origin server
npm start
```

---

## Author
- **Shivang Gupta** ([@shivangguptaaa](https://github.com/shivangguptaaa))
