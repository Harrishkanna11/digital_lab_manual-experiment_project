-- ============================================================
-- DLME Production Database Schema — Supabase / PostgreSQL
-- Generated from JPA entities (application-prod profile)
--
-- Run this in Supabase SQL Editor BEFORE starting the backend
-- with spring.jpa.hibernate.ddl-auto=validate
--
-- When ddl-auto=update (default for prod), Hibernate will
-- create/update these tables automatically. This script is
-- provided for reference and for manual schema control.
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================
DO $$ BEGIN
    CREATE TYPE role_type AS ENUM ('STUDENT', 'FACULTY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE difficulty_type AS ENUM ('EASY', 'MEDIUM', 'HARD');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE submission_status AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'RESUBMIT_REQUESTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'LATE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(255) NOT NULL,
    role        VARCHAR(50)  NOT NULL,  -- STUDENT | FACULTY
    department  VARCHAR(255) NOT NULL,
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP
);

-- ============================================================
-- FACULTY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS faculty (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    faculty_id    VARCHAR(255) NOT NULL UNIQUE,
    designation   VARCHAR(255),
    created_at    TIMESTAMP,
    updated_at    TIMESTAMP
);

-- ============================================================
-- STUDENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT       NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    register_number VARCHAR(255) NOT NULL UNIQUE,
    year            INTEGER      NOT NULL,
    section         VARCHAR(255) NOT NULL,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP
);

-- ============================================================
-- SUBJECTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS subjects (
    id            BIGSERIAL PRIMARY KEY,
    subject_name  VARCHAR(255) NOT NULL,
    course_code   VARCHAR(255) NOT NULL UNIQUE,
    department    VARCHAR(255) NOT NULL,
    year          INTEGER      NOT NULL,
    semester      INTEGER      NOT NULL,
    academic_year VARCHAR(255) NOT NULL,
    faculty_id    BIGINT REFERENCES faculty(id) ON DELETE SET NULL,
    created_at    TIMESTAMP,
    updated_at    TIMESTAMP
);

-- ============================================================
-- STUDENT_SUBJECTS (Enrollment Join Table)
-- ============================================================
CREATE TABLE IF NOT EXISTS student_subjects (
    id          BIGSERIAL PRIMARY KEY,
    student_id  BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id  BIGINT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP,
    UNIQUE (student_id, subject_id)
);

-- ============================================================
-- LAB_MANUALS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS lab_manuals (
    id            BIGSERIAL PRIMARY KEY,
    title         VARCHAR(255) NOT NULL,
    description   TEXT,
    subject_id    BIGINT REFERENCES subjects(id) ON DELETE CASCADE,
    academic_year VARCHAR(255),
    published     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP,
    updated_at    TIMESTAMP
);

-- ============================================================
-- EXPERIMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS experiments (
    id                   BIGSERIAL PRIMARY KEY,
    experiment_number    INTEGER      NOT NULL,
    title                VARCHAR(255) NOT NULL,
    aim                  TEXT,
    requirements         TEXT,
    theory               TEXT,
    algorithm            TEXT,
    procedure            TEXT,
    source_code          TEXT,
    expected_output      TEXT,
    observation          TEXT,
    result               TEXT,
    viva_questions       TEXT,
    difficulty           VARCHAR(50)  NOT NULL DEFAULT 'MEDIUM',
    deadline             DATE,
    published            BOOLEAN      NOT NULL DEFAULT FALSE,
    published_at         TIMESTAMP,
    subject_id           BIGINT       NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    lab_manual_id        BIGINT       REFERENCES lab_manuals(id) ON DELETE SET NULL,
    created_by_faculty_id BIGINT      REFERENCES faculty(id) ON DELETE SET NULL,
    created_at           TIMESTAMP,
    updated_at           TIMESTAMP
);

-- ============================================================
-- SUBMISSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS submissions (
    id                   BIGSERIAL PRIMARY KEY,
    student_id           BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    experiment_id        BIGINT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    source_code          TEXT,
    observation          TEXT,
    result               TEXT,
    additional_notes     TEXT,
    status               VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
    submitted_at         TIMESTAMP,
    reviewed_at          TIMESTAMP,
    reviewed_by_faculty_id BIGINT REFERENCES faculty(id) ON DELETE SET NULL,
    feedback             TEXT,
    marks                INTEGER,
    max_marks            INTEGER,
    created_at           TIMESTAMP,
    updated_at           TIMESTAMP,
    UNIQUE (student_id, experiment_id)
);

-- ============================================================
-- SUBMISSION_FILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS submission_files (
    id            BIGSERIAL PRIMARY KEY,
    submission_id BIGINT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    file_name     VARCHAR(255),
    file_path     VARCHAR(500),
    file_type     VARCHAR(255),
    file_size     BIGINT,
    category      VARCHAR(255),
    uploaded_at   TIMESTAMP,
    created_at    TIMESTAMP,
    updated_at    TIMESTAMP
);

-- ============================================================
-- ATTENDANCE TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id      BIGINT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    experiment_id   BIGINT REFERENCES experiments(id) ON DELETE SET NULL,
    date            DATE   NOT NULL,
    status          VARCHAR(50) NOT NULL DEFAULT 'PRESENT',
    marked_by_faculty_id BIGINT REFERENCES faculty(id) ON DELETE SET NULL,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP
);

-- ============================================================
-- MARKS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS marks (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    experiment_id   BIGINT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    submission_id   BIGINT REFERENCES submissions(id) ON DELETE SET NULL,
    marks_obtained  INTEGER NOT NULL,
    max_marks       INTEGER NOT NULL DEFAULT 100,
    feedback        TEXT,
    given_by_faculty_id BIGINT REFERENCES faculty(id) ON DELETE SET NULL,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP
);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id          BIGSERIAL PRIMARY KEY,
    student_id  BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    message     TEXT,
    type        VARCHAR(100),
    read        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP
);

-- ============================================================
-- BOOKMARKS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS bookmarks (
    id            BIGSERIAL PRIMARY KEY,
    student_id    BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    experiment_id BIGINT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    created_at    TIMESTAMP,
    UNIQUE (student_id, experiment_id)
);

-- ============================================================
-- INDEXES (for query performance)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_experiments_subject ON experiments(subject_id);
CREATE INDEX IF NOT EXISTS idx_experiments_published ON experiments(published);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_experiment ON submissions(experiment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_subject ON attendance(subject_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_marks_student ON marks(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_student ON notifications(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_bookmarks_student ON bookmarks(student_id);
CREATE INDEX IF NOT EXISTS idx_student_subjects_student ON student_subjects(student_id);
CREATE INDEX IF NOT EXISTS idx_student_subjects_subject ON student_subjects(subject_id);
