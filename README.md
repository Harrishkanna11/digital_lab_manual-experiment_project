# Digital Lab Manual & Experiment Management System (DLME)

## 🚀 Running the Project

### Prerequisites
- Java 17+
- Maven 3.9+
- Node.js 18+
- PostgreSQL 14+

### 1. Set up PostgreSQL database

```sql
CREATE DATABASE digital_lab_manual;
```

### 2. Update credentials in `backend/src/main/resources/application.properties`

```properties
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD
```

### 3. Start the backend

#### Option A: Zero-Setup In-Memory Mode (No PostgreSQL required)
```bash
cd backend
# Windows:
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=h2"
# Linux / macOS:
./mvnw spring-boot:run -Dspring-boot.run.profiles=h2
```

#### Option B: PostgreSQL Production / Local Mode
```bash
cd backend
# Windows:
.\mvnw.cmd spring-boot:run
# Linux / macOS:
./mvnw spring-boot:run
```

Starts on **http://localhost:8080**. Hibernate automatically creates and updates all tables and seeds initial demo data on launch.

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Starts on **http://localhost:5173**. Vite proxies `/api` to the backend.

### 5. Default Demo Credentials

The backend automatically seeds demo accounts, subjects, lab manuals, and experiments on initial launch:

| Role | Email | Password | Name / Details |
|---|---|---|---|
| **Faculty** | `faculty@digitallab.edu` | `password123` | Dr. Alan Turing (HOD, CSE) |
| **Student** | `student@digitallab.edu` | `password123` | Ada Lovelace (Reg: 21CS101) |

---

## ✅ Implemented Features

### Student Portal
- Dashboard with live stats (experiments, attendance, marks)
- Browse & search published experiments with bookmark support
- Detailed experiment view (aim, theory, procedure, source code, viva Qs)
- Submit experiments with source code, observation, result
- Submission history with status badges (Submitted / Approved / Rejected)
- Marks & feedback view with average score
- Attendance history + summary (present/absent/percentage)
- Lab Journal (chronological timeline of all submissions)
- Lab Manuals listing
- Bookmarks management
- Real-time Notifications with unread count badge
- Subject enrollment & unenrollment
- Profile page

### Faculty Portal
- Dashboard with aggregate counts
- Experiment CRUD with Publish / Unpublish
- Subject CRUD
- Lab Manual CRUD
- Submission review with verdict (Approve/Reject/Request Resubmit), marks, feedback
- Attendance marking by student + subject + experiment
- Marks management
- Student directory with performance stats

---

## 📁 Project Structure

```
backend/
  pom.xml                         Spring Boot 3.2, Java 17
  src/main/java/com/example/digitallab/
    config/     SecurityConfig, JwtConfig, CorsConfig
    controller/ 11 REST controllers
    dto/        21 request/response DTOs
    entity/     17 JPA entities
    exception/  GlobalExceptionHandler
    repository/ 13 Spring Data JPA repositories
    service/    11 service classes

frontend/
  src/
    context/    AuthContext (JWT + role-based state)
    layouts/    StudentLayout, FacultyLayout
    pages/
      auth/     Login, Register
      student/  Dashboard, Experiments, ExperimentDetails,
                LabManuals, StudentSubmissions, AttendancePage,
                MarksPage, MyLabJournal, BookmarksPage,
                NotificationsPage, ProfilePage, SubjectEnrollment
      faculty/  FacultyDashboard, ExperimentManagement,
                SubjectManagement, LabManualManagement,
                SubmissionReview, AttendanceManagement,
                MarksManagement, StudentManagement
    services/   dataService.js (all API calls via Axios)
    styles/     index.css (full design system)
  vite.config.js  (proxies /api → localhost:8080)
```

---

## 🔑 Key API Endpoints

| Method | Endpoint | Role |
|---|---|---|
| POST | /api/auth/login | Public |
| POST | /api/auth/register/student | Public |
| POST | /api/auth/register/faculty | Public |
| GET | /api/experiments/student | STUDENT |
| POST | /api/submissions | STUDENT |
| PUT | /api/submissions/{id}/review | FACULTY |
| PUT | /api/experiments/{id}/publish | FACULTY |
| POST | /api/subjects/{id}/enroll | STUDENT |
| GET | /api/attendance/student/summary | STUDENT |
