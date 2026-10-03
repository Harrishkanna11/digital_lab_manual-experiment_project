package com.example.digitallab.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectResponse {
    private Long id;
    private String subjectName;
    private String courseCode;
    private String department;
    private Integer year;
    private Integer semester;
    private String academicYear;
    private String facultyName;
    private Long facultyId;
    private boolean hasLabManual;
    private Integer enrolledStudentsCount;
    private LocalDateTime createdAt;

    public static SubjectResponseBuilder builder() {
        return new SubjectResponseBuilder();
    }

    public static class SubjectResponseBuilder {
        private Long id;
        private String subjectName;
        private String courseCode;
        private String department;
        private Integer year;
        private Integer semester;
        private String academicYear;
        private String facultyName;
        private Long facultyId;
        private boolean hasLabManual;
        private Integer enrolledStudentsCount;
        private LocalDateTime createdAt;

        public SubjectResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public SubjectResponseBuilder subjectName(String subjectName) {
            this.subjectName = subjectName;
            return this;
        }

        public SubjectResponseBuilder courseCode(String courseCode) {
            this.courseCode = courseCode;
            return this;
        }

        public SubjectResponseBuilder department(String department) {
            this.department = department;
            return this;
        }

        public SubjectResponseBuilder year(Integer year) {
            this.year = year;
            return this;
        }

        public SubjectResponseBuilder semester(Integer semester) {
            this.semester = semester;
            return this;
        }

        public SubjectResponseBuilder academicYear(String academicYear) {
            this.academicYear = academicYear;
            return this;
        }

        public SubjectResponseBuilder facultyName(String facultyName) {
            this.facultyName = facultyName;
            return this;
        }

        public SubjectResponseBuilder facultyId(Long facultyId) {
            this.facultyId = facultyId;
            return this;
        }

        public SubjectResponseBuilder hasLabManual(boolean hasLabManual) {
            this.hasLabManual = hasLabManual;
            return this;
        }

        public SubjectResponseBuilder enrolledStudentsCount(Integer enrolledStudentsCount) {
            this.enrolledStudentsCount = enrolledStudentsCount;
            return this;
        }

        public SubjectResponseBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public SubjectResponse build() {
            return new SubjectResponse(
                    id,
                    subjectName,
                    courseCode,
                    department,
                    year,
                    semester,
                    academicYear,
                    facultyName,
                    facultyId,
                    hasLabManual,
                    enrolledStudentsCount,
                    createdAt
            );
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }

    public Long getFacultyId() { return facultyId; }
    public void setFacultyId(Long facultyId) { this.facultyId = facultyId; }

    public boolean isHasLabManual() { return hasLabManual; }
    public void setHasLabManual(boolean hasLabManual) { this.hasLabManual = hasLabManual; }

    public Integer getEnrolledStudentsCount() { return enrolledStudentsCount; }
    public void setEnrolledStudentsCount(Integer enrolledStudentsCount) { this.enrolledStudentsCount = enrolledStudentsCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
