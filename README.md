# ThePrepRoom 🎓

> **Know the drill. Before you face it.**  
> Real placement experiences, interview questions, and prep insights from students who've been there.

---

## 🌟 Overview

**ThePrepRoom** is a modern, student-centric placement intelligence platform. It solves the fragmentation of college placement prep by providing a structured, verified archive of campus interview experiences, categorized by company, role, interview year, and recruitment round.

### Key Capabilities

- **⚡ End-to-End Selection Pipeline**: Detailed breakdowns of each round (Online Assessment, Technical Rounds, System Design, HR/Managerial).
- **🧠 Canonical Question Deduplication**: Intelligent text normalization and deduplication algorithm that links similar questions across companies to build accurate frequency metrics.
- **📊 Real Data & Analytics**: Verified placement stats, asked-in question counters, and company hiring trends with zero synthetic inflation.
- **🎯 Preparation Hub**: Curated syllabus, high-yield topic checklists, and interview guides across Core CS, System Design, and Behavioral rounds.
- **🛡️ Community Moderation & Quality**: Multi-stage review workflow (Pending, Approved, Rejected) with moderation triage, report resolution, and admin management.
- **🔖 Student Revision Hub**: Save experiences, questions, and companies for quick last-minute revision before placement drives.
- **🌓 Modern Obsidian Dark Theme**: Clean high-contrast dark aesthetic with smooth micro-interactions, responsive typography, and mobile-friendly navigation.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Server Actions)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database & ORM**: [Prisma ORM](https://www.prisma.io/) with SQLite (zero external infra required)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Fonts**: Plus Jakarta Sans (Headings) & Inter (Body) via `next/font/google`

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/VedKalantri/ThePrepRoom.git
cd ThePrepRoom
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Contents:
```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="thepreproom-super-secret-development-key-change-in-production-2026"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 4. Initialize database & seed sample data
```bash
npx prisma db push
npm run seed
```

### 5. Start the development server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

Run the automated verification suite to test canonical deduplication, public status filters, interview/graduation year constraints, and company-role consistency:

```bash
npx tsx test-verify.ts
```

All 14 automated test assertions verify:
1. Punctuation stripping & case normalization for questions.
2. Deduplication into canonical question IDs.
3. Strict public visibility guarantee (`status === 'APPROVED'`).
4. Real count integrity and exact question link tracking.
5. Role and company relation validation.
6. Year separation (`interviewYear` vs `graduationYear`).

---

## 👥 Demo Credentials

For testing admin and student accounts, use the quick demo switcher in the navigation bar or log in with:

- **Admin Account**: `admin@campus.edu` / `Admin@123`
- **Student Account**: `rahul.sharma@campus.edu` / `Student@123`

---

## 📄 License

MIT License. Built for students and campus placement preparation.
