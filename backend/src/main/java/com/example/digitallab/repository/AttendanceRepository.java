package com.example.digitallab.repository;

import com.example.digitallab.entity.Attendance;
import com.example.digitallab.entity.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentId(Long studentId);
    List<Attendance> findByStudentIdAndSubjectId(Long studentId, Long subjectId);
    List<Attendance> findBySubjectId(Long subjectId);
    java.util.Optional<Attendance> findByStudentIdAndSubjectIdAndDate(Long studentId, Long subjectId, java.time.LocalDate date);

    @Query("""
        SELECT a FROM Attendance a
        WHERE a.subject.id = :subjectId
        ORDER BY a.date DESC, a.id DESC
        """)
    List<Attendance> findBySubjectIdOrdered(Long subjectId);

    @Query("""
        SELECT a FROM Attendance a
        WHERE a.subject.faculty.id = :facultyId OR a.markedBy.id = :facultyId
        ORDER BY a.date DESC, a.id DESC
        """)
    List<Attendance> findForFaculty(Long facultyId);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.status = :status")
    long countByStudentIdAndStatus(Long studentId, AttendanceStatus status);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId")
    long countByStudentId(Long studentId);

    @Query("""
        SELECT COUNT(a) FROM Attendance a
        WHERE a.student.id = :studentId AND a.subject.id = :subjectId AND a.status = :status
        """)
    long countByStudentIdAndSubjectIdAndStatus(Long studentId, Long subjectId, AttendanceStatus status);

    @Query("""
        SELECT a FROM Attendance a
        WHERE a.subject.id = :subjectId AND a.date = :date
        ORDER BY a.student.user.fullName ASC
        """)
    List<Attendance> findBySubjectIdAndDate(Long subjectId, java.time.LocalDate date);
}
