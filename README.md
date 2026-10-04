# Digital Lab Manual & Experiment Management System (DLME)

A full-stack web application for managing digital laboratory manuals, experiments, submissions, attendance, and marks — for both Students and Faculty.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     PRODUCTION STACK                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│    NETLIFY                                              │
│    React / Vite SPA Frontend                            │
│    https://your-site.netlify.app                        │
│              │                                          │
│              │ HTTPS (VITE_API_URL)                     │
│              ▼                                          │
│    RENDER.COM  (or any Docker/Java host)                │
│    Spring Boot 3.4 REST API                             │
│    Java 17 · Spring Security · JWT                      │
│    https://dlme-backend.onrender.com                    │
│              │                                          │
│              │ JDBC (sslmode=require)                   │
│              ▼                                          │
│    SUPABASE                                             │
│    Managed PostgreSQL Database                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Why Not Vercel for the Backend?
Vercel is designed for serverless functions and static sites. Spring Boot is a long-running JVM server application that is **not compatible** with Vercel's serverless execution model without a complete rewrite (which would destroy all existing functionality). Therefore, the backend is deployed to **Render.com**, which supports Docker containers and Java applications natively.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, Axios, React Router 7, Recharts |
| Backend | Java 17, Spring Boot 3.4, Spring Security, Spring Data JPA |
| Auth | JWT (JJWT 0.12.3), BCrypt |
| Database | PostgreSQL (Supabase managed) |
| Frontend Host | Netlify |
| Backend Host | Render.com (Docker) |
| DB Host | Supabase |

---

## Demo Credentials

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| **Faculty** | `faculty@digitallab.edu` | `password123` | Professor & HOD, CSE |
| **Student** | `student@digitallab.edu` | `password123` | Reg: 21CS101 |

> Demo accounts are only seeded when `SEED_DEMO_DATA=true` (default: `true` for H2/dev, `false` for production).

---

## Local Development

### Prerequisites
- Java 17+
- Node.js 18+
- (Optional) PostgreSQL 14+ for dev profile

### Quick Start (H2 In-Memory DB)
```bash
# Terminal 1: Start backend
cd backend
./mvnw spring-boot:run
# Starts on http://localhost:8080 with H2 in-memory DB

# Terminal 2: Start frontend
cd frontend
npm install
npm run dev
# Opens http://localhost:5173
```

### Local PostgreSQL Dev Profile
```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

---

## Production Deployment

### Step 1: Supabase Database Setup

1. Go to [supabase.com](https://supabase.com) → Create a new project.
2. After creation, go to **Project Settings → Database → Connection string → JDBC**.
3. Copy the JDBC connection string (format: `jdbc:postgresql://...`).
4. Note your DB password.
5. (Optional) Run `backend/src/main/resources/db/migration/V1__initial_schema.sql` in the Supabase SQL Editor to pre-create the schema. Hibernate will also create it automatically on first startup with `ddl-auto=update`.

### Step 2: Backend Deployment (Render.com)

1. Go to [render.com](https://render.com) → Create a **Web Service**.
2. Connect your GitHub repository.
3. Set **Root Directory**: `backend`
4. Set **Runtime**: Docker (uses `backend/Dockerfile`)
5. Set the following **Environment Variables**:

| Variable | Value |
|----------|-------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DB_URL` | `jdbc:postgresql://<host>:5432/<db>?sslmode=require` |
| `DB_USERNAME` | Your Supabase DB username |
| `DB_PASSWORD` | Your Supabase DB password |
| `JWT_SECRET` | Random 64-char string (`openssl rand -base64 64`) |
| `JWT_EXPIRATION` | `86400000` (24 hours in ms) |
| `FRONTEND_URL` | `https://your-site.netlify.app` |
| `PORT` | `8080` |
| `SEED_DEMO_DATA` | `false` (or `true` for demo) |

6. Deploy. After deployment, your backend URL will be: `https://your-service.onrender.com`
7. Verify: `GET https://your-service.onrender.com/api/health` → `{"status":"UP"}`

### Step 3: Netlify Frontend Deployment

1. Go to [netlify.com](https://netlify.com) → **Add new site → Import from Git**.
2. Connect your GitHub repository.
3. Netlify will auto-detect `netlify.toml`. Settings will be pre-filled:
   - Base directory: `frontend`
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`
4. Add **Environment Variable**:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-backend.onrender.com` *(no trailing slash)* |

5. Deploy. Your site URL: `https://your-site.netlify.app`

### Step 4: Update CORS on Backend

After deploying both services, update the backend `FRONTEND_URL` env var on Render to your Netlify URL:
```
FRONTEND_URL=https://your-site.netlify.app
```

---

## Environment Variables

### Backend (`backend/.env.example`)

| Variable | Required | Description |
|----------|----------|-------------|
| `SPRING_PROFILES_ACTIVE` | Yes | `prod` \| `dev` \| `h2` |
| `DB_URL` | Yes (prod) | JDBC connection string |
| `DB_USERNAME` | Yes (prod) | PostgreSQL username |
| `DB_PASSWORD` | Yes (prod) | PostgreSQL password |
| `JWT_SECRET` | Yes (prod) | Strong random secret (min 32 chars) |
| `JWT_EXPIRATION` | No | Token lifetime in ms (default: 86400000) |
| `FRONTEND_URL` | Yes (prod) | Netlify deployment URL for CORS |
| `PORT` | No | Server port (default: 8080) |
| `SEED_DEMO_DATA` | No | Seed demo data on empty DB (default: false in prod) |

### Frontend (`frontend/.env.example`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes (prod) | Backend base URL (e.g. `https://backend.onrender.com`) |

---

## CORS Configuration

CORS is configured in `SecurityConfig.java` and reads `app.cors.allowed-origins` from properties.

- **Production**: `FRONTEND_URL=https://your-site.netlify.app`
- **Development**: `http://localhost:5173,http://localhost:3000`
- `allowCredentials: true` is set — wildcard `*` is **NOT** used.

---

## Database Migration

The production database migration script is at:
```
backend/src/main/resources/db/migration/V1__initial_schema.sql
```

**Current strategy:** `spring.jpa.hibernate.ddl-auto=update`
- Hibernate automatically creates/updates schema on startup.
- Safe for initial deployment to Supabase.

**Recommended for stable production:** After first successful deployment, switch to:
```properties
spring.jpa.hibernate.ddl-auto=validate
```
This prevents accidental schema changes and requires proper migrations.

---

## Security Notes

- Passwords hashed with **BCrypt**
- JWT tokens stored in **sessionStorage** (cleared on tab close)
- CORS restricted to specific origins (no `*`)
- Health endpoint (`/api/health`) does NOT expose secrets
- `.env` files excluded from Git
- Demo credentials only seeded when `SEED_DEMO_DATA=true`
- JWT secret loaded from env var — never hardcoded in production
- Student/Faculty role separation enforced at the API level with Spring Security

> ⚠️ **If you committed secrets to Git history**: The `jwt.secret` in `application.properties` was previously hardcoded. After switching to production env vars, **rotate your JWT secret** and any other credentials.

---

## Production URLs

| Service | URL |
|---------|-----|
| Frontend (Netlify) | *(Set after Netlify deployment)* |
| Backend API (Render) | *(Set after Render deployment)* |
| Health Check | `GET <backend-url>/api/health` |
| Supabase Dashboard | [supabase.com/dashboard](https://supabase.com/dashboard) |

---

## Troubleshooting

### Backend can't connect to Supabase
- Verify `DB_URL` includes `?sslmode=require` (Supabase requires SSL)
- Check Supabase allows connections from Render IPs (Settings → Database → Connection Pooling)
- Verify `SPRING_PROFILES_ACTIVE=prod`

### Frontend shows blank page after refresh
- Ensure `netlify.toml` is committed — it contains the SPA redirect rule
- The redirect `/* -> /index.html` is required for React Router

### CORS errors in browser console
- Verify `FRONTEND_URL` on the backend exactly matches the Netlify domain
- Ensure no trailing slash in `FRONTEND_URL`

### JWT token rejected
- After rotating `JWT_SECRET`, all existing sessions are invalidated — users must re-login
- Verify the secret is consistent between restarts (don't use a random secret that regenerates each startup)

### Render free tier sleeps after 15 minutes
- First request after sleep has a ~30s cold start delay
- Consider upgrading to Render's paid tier or use an uptime monitor (e.g., UptimeRobot)

---

## Project Structure

```
Digital_lab_manual-experiment_project/
├── backend/                     # Spring Boot API
│   ├── Dockerfile               # Production Docker image
│   ├── .dockerignore
│   ├── .env.example             # Backend env var template
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/example/digitallab/
│       │   ├── config/          # Security, CORS, DataInitializer
│       │   ├── controller/      # REST controllers + HealthController
│       │   ├── dto/             # Request/Response DTOs
│       │   ├── entity/          # JPA entities
│       │   ├── exception/       # Global error handling
│       │   ├── repository/      # Spring Data repositories
│       │   ├── security/        # JWT filter, UserDetailsService
│       │   └── service/         # Business logic
│       └── resources/
│           ├── application.properties        # Base config
│           ├── application-h2.properties     # H2 dev (default)
│           ├── application-dev.properties    # Local PostgreSQL dev
│           ├── application-prod.properties   # Production (Supabase)
│           └── db/migration/
│               └── V1__initial_schema.sql    # Production schema
├── frontend/                    # React/Vite SPA
│   ├── .env.example             # Frontend env var template
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── context/AuthContext.jsx
│       ├── services/api.js      # Axios with VITE_API_URL support
│       ├── services/dataService.js
│       ├── pages/               # Student + Faculty pages
│       └── layouts/
├── netlify.toml                 # Netlify build + SPA routing
├── .gitignore                   # Excludes .env files
└── README.md
```
