package com.example.digitallab.repository;

import com.example.digitallab.entity.Attendance;
import com.example.digitallab.entity.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentId(Long studentId);
    List<Attendance> findByStudentIdAndSubjectId(Long studentId, Long subjectId);
    List<Attendance> findBySubjectId(Long subjectId);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.status = :status")
    long countByStudentIdAndStatus(Long studentId, AttendanceStatus status);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId")
    long countByStudentId(Long studentId);

    @Query("""
        SELECT COUNT(a) FROM Attendance a
        WHERE a.student.id = :studentId AND a.subject.id = :subjectId AND a.status = :status
        """)
    long countByStudentIdAndSubjectIdAndStatus(Long studentId, Long subjectId, AttendanceStatus status);
}
