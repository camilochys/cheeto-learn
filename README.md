# CheetoLearn — Adaptive Learning Management System 🐱

CheetoLearn is a web-based LMS (Learning Management System) that personalizes learning through an adaptive difficulty engine. The system evaluates student performance in real time and automatically adjusts exercise difficulty based on their knowledge level.

---

## Features

-  JWT Authentication with role-based access (Student / Teacher).
-  Course, lesson and question management.
-  Adaptive difficulty engine (levels 1–5).
-  Student progress tracking.
-  Teacher dashboard with performance metrics.
-  Feedback after every answer.

---

##  Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TailwindCSS, shadcn/ui |
| Backend | Next.js API Routes, Node.js |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| Auth | JSON Web Token + Bcrypt |
| Charts | Recharts |
| Deployment | Vercel + Supabase |

---

##  Project Structure
```
cheeto-learn/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── courses/
│   │   ├── lessons/
│   │   ├── questions/
│   │   │   └── next/
│   │   ├── enrollments/
│   │   └── answers/
│   ├── login/
│   ├── dashboard/
│   └── teacher/
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── middleware.ts
├── prisma/
│   └── schema.prisma
└── docs/
    ├── testing.md
    └── screenshots/
```

---

##  Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (Supabase recommended)

### Installation
```bash
# Clone the repository
git clone https://github.com/camilochys/cheeto-learn.git
cd cheeto-learn

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your DATABASE_URL and JWT_SECRET

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

##  Environment Variables

Create a `.env` file in the root with the following variables:
```env
DATABASE_URL="your-supabase-connection-string"
JWT_SECRET="your-secret-key"
```

---

##  API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | /api/auth/register | Register new user | NO |
| POST | /api/auth/login | Login and get JWT token | NO |

### Courses
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | /api/courses | Get all courses | YES |
| POST | /api/courses | Create course | TEACHER |

### Lessons
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | /api/lessons?courseId= | Get lessons by course | YES |
| POST | /api/lessons | Create lesson | TEACHER |

### Questions
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | /api/questions?courseId= | Get questions by course | YES |
| POST | /api/questions | Create question | TEACHER |
| GET | /api/questions/next?courseId= | Get next adaptive question | STUDENT |

### Enrollments
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | /api/enrollments | Get student enrollments | STUDENT |
| POST | /api/enrollments | Enroll in course | STUDENT |

### Answers
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | /api/answers | Submit answer + update level | STUDENT |

---

##  Adaptive Engine

The adaptive engine evaluates the last 5 answers from the student and adjusts their level automatically:

- **> 70% correct** → Level increases (max 5)
- **< 40% correct** → Level decreases (min 1)
- **Between 40–70%** → Level stays the same

---

##  Team

| Member | Role | GitHub |
|---|---|---|
| Camilo | Developer | @camilochys |
| Andrea | Developer | @andreafb816 |

---

##  License

This project was developed as a Final Degree Project (TFG) for Prometeo FP by thePower Business School.
