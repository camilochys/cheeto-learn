<div align="center">

<img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
<img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
<img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
<img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />

# CheetoLearn 🐈

**Adaptive Learning Platform — LMS**

*Final Degree Project · Web Application Development · Prometeo by thePower*

</div>

---

## Description

CheetoLearn is an educational web platform of type **LMS (Learning Management System)** designed to personalize learning through an **adaptive engine**. The system evaluates student performance in real time and automatically adjusts the difficulty of multiple-choice exercises according to their knowledge level (scale from 1 to 5).

The platform allows **teachers** to manage courses, lessons, questions, and assignments, and to monitor student progress through detailed statistics. **Students** practice with questions adapted to their actual level, receive immediate feedback after each answer, and track their progress over time.

> CheetoLearn addresses the main limitation of traditional educational systems: all students receive the same difficulty level regardless of their abilities, which creates frustration for some and boredom for others.

---

## Main features

| Module | Description |
|---|---|
|  **Authentication** | Registration and login with JWT + Bcrypt (12 salt rounds) |
|  **Differentiated roles** | Role-based access and views for `STUDENT` and `TEACHER` |
|  **Content management** | Full CRUD for courses, lessons, and multiple-choice questions |
|  **Adaptive engine** | Automatic difficulty adjustment based on the last 5 answers |
|  **Immediate feedback** | Correct answer and result displayed after each question |
|  **Student progress** | Answer history, current level, and course statistics |
|  **Teacher panel** | Performance metrics, enrolled students, and most frequently missed questions |
|  **Assignments and submissions** | Assignment creation with due date, submissions, and grading by the teacher |
|  **File management** | Upload of resources to Supabase Storage with automatic cleanup on deletion |
|  **Contact form** | Sending transactional emails through Resend |

---

##  Adaptive Engine

The core of CheetoLearn evaluates the **last 5 answers** of the student in a specific course and automatically adjusts their level (`currentLevel`):

```

If correct answers > 70%  →  currentLevel = min(currentLevel + 1, 5)  ⬆ Increase
If correct answers < 40%  →  currentLevel = max(currentLevel - 1, 1)  ⬇ Decrease
If 40% ≤ correct answers ≤ 70%  →  currentLevel unchanged           ➡ Remains

```

- **Levels:** from 1 (easiest) to 5 (hardest)
- **Initial enrollment level:** 3 (intermediate)
- The system also avoids repeating the last 10 questions already answered
- If there are no questions at the exact level, it searches adjacent levels

---

##  Technology stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js (Turbopack) | App Router + API Routes |
| Frontend | React + TypeScript | Strict end-to-end typing |
| Styling | TailwindCSS | Utility-first, responsive |
| UI Components | shadcn/ui | Based on Radix UI |
| Backend | Next.js API Routes | REST, serverless |
| Database | PostgreSQL | Hosted on Supabase |
| ORM | Prisma v7 | Typed models, migrations |
| DB Hosting | Supabase | Storage + automatic backups |
| Authentication | JWT | Stateless sessions |
| Encryption | Bcrypt | 12 salt rounds |
| Validation | Zod | Schema validation in frontend |
| Forms | React Hook Form | Integrated with Zod |
| Charts | Recharts | Statistics and progress |
| Email | Resend | Contact form |
| Version control | Git / GitHub | Conventional commits |
| Deployment | Vercel | Automatic CI/CD from `main` |

---

##  API Reference

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/login` | Log in and obtain JWT | N/R |

### Courses

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/courses` | List courses by role | `TEACHER/STUDENT` |
| `POST` | `/api/courses` | Create course | `TEACHER` |

### Lessons

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/lessons?courseId=` | Course lessons | `TEACHER/STUDENT` |
| `POST` | `/api/lessons` | Create lesson | `TEACHER` |

### Questions

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/questions?courseId=` | Course questions | `TEACHER/STUDENT` |
| `POST` | `/api/questions` | Create question | `TEACHER` |
| `GET` | `/api/questions/next?courseId=` | Get next adaptive question | `STUDENT` |

### Enrollments

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/enrollments` | Student enrollments | `TEACHER/STUDENT` |
| `POST` | `/api/enrollments` | Enroll in a course | `STUDENT` |

### Answers

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/answers` | Submit answer + update level | `STUDENT` |

### Statistics

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/stats/course/:courseId` | Course metrics | `TEACHER` |

---

##  Database model

The database is composed of **9 relational entities**:

```

User ──────────┬── Course ──┬── Lesson ──── File
│            ├── Question
│            ├── Assignment ── Submission
└── Enrollment (currentLevel)
│
Answer

````

- **`User`** — Students and teachers (field `role`: `STUDENT` | `TEACHER`)
- **`Course`** — Created by a `TEACHER`, contains lessons and questions
- **`Lesson`** — Theoretical content ordered by `order`
- **`File`** — Resources attached to lessons (managed by Supabase Storage)
- **`Question`** — 4 options, 1 correct, `difficultyLevel` from 1 to 5
- **`Enrollment`** — Student-course relationship with adaptive `currentLevel`
- **`Answer`** — Record of each answer: selected option, `isCorrect`, `responseTime`
- **`Assignment`** — Assignments created by the teacher with optional due date
- **`Submission`** — Student submissions with status, grade, and feedback

---

##  Local installation

### Prerequisites

- Node.js 18+
- An account on [Supabase](https://supabase.com) (PostgreSQL database)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/camilochys/cheeto-learn.git
cd cheeto-learn

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Edit .env with your credentials (see next section)

# 4. Generate the Prisma client
npx prisma generate

# 5. Run migrations
npx prisma migrate dev

# 6. Start the development server
npm run dev
````

Access [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment variables

Create a `.env` file in the project root with the following variables:

```env
# Database (Supabase)
DATABASE_URL="postgresql://..."

# Authentication
JWT_SECRET="your_secure_secret_key"

# Supabase (Storage and client)
NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# Email (Resend)
RESEND_API_KEY="re_xxxx"
```

> ⚠️ Never expose these variables in the repository. The `.env` file is included in `.gitignore`.

---

##  Testing

The project includes **35 documented and manually executed functional tests**, organized by requirement:

| Requirement | Description                     | Tests  |
| ----------- | ------------------------------- | ------ |
| R01         | Authentication and security     | 10     |
| R02         | Role-based access control       | 3      |
| R03         | Educational content management  | 6      |
| R04         | Adaptive system and enrollments | 7      |
| R05         | Answers and immediate feedback  | 4      |
| R06         | Teacher dashboard               | 2      |
| R07         | Deployment and production       | 3      |
| **Total**   |                                 | **35** |

---

##  Navigation flow

```
Home (public)
    └── Login
          ├── [TEACHER] → Teacher Dashboard
          │       ├── Course management
          │       ├── Lesson management
          │       ├── Question management
          │       ├── Assignment management
          │       └── Student statistics
          └── [STUDENT] → Student Dashboard
                  ├── My courses
                  ├── Lessons
                  ├── Adaptive practice  ←── core of the system
                  ├── Assignments and submissions
                  └── My progress
```

---

##  Production deployment

The project is deployed on **Vercel** with continuous integration from the `main` branch.

### Minimum end-user requirements

* Browser: Chrome v100+, Firefox v95+, or Edge
* Connection: minimum 5 Mbps
* Hardware: minimum 4 GB of RAM

### Disaster recovery plans (DRP)

* **Data:** Supabase performs daily database backups (RTO ≈ 1 hour)
* **Deployment:** Vercel allows instant rollback to any previous state
* **Availability:** Serverless architecture with automatic traffic redirection between regions

---

##  Team

| Member | Role      | GitHub                                         |
| ------ | --------- | ---------------------------------------------- |
| Andrea | Developer | [@andreafb816](https://github.com/andreafb816) |
| Camilo | Developer | [@camilochys](https://github.com/camilochys)   |

---
# License
Project developed as a **Final Degree Project** for the *Web Application Development* program at **Prometeo by thePower Business School**.
