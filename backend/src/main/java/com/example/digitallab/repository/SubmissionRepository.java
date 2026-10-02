package com.example.digitallab.repository;

import com.example.digitallab.entity.Submission;
import com.example.digitallab.entity.SubmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByStudentId(Long studentId);
    Optional<Submission> findByStudentIdAndExperimentId(Long studentId, Long experimentId);
    boolean existsByStudentIdAndExperimentId(Long studentId, Long experimentId);

    @Query("""
        SELECT s FROM Submission s
        WHERE s.experiment.subject.id IN (
            SELECT sub.id FROM Subject sub WHERE sub.faculty.id = :facultyId
        )
        ORDER BY s.createdAt DESC
        """)
    List<Submission> findSubmissionsForFaculty(Long facultyId);

    @Query("""
        SELECT s FROM Submission s
        WHERE s.experiment.subject.id IN (
            SELECT sub.id FROM Subject sub WHERE sub.faculty.id = :facultyId
        )
        AND s.status = :status
        """)
    List<Submission> findSubmissionsForFacultyByStatus(Long facultyId, SubmissionStatus status);

    @Query("""
        SELECT COUNT(s) FROM Submission s
        WHERE s.student.id = :studentId AND s.status = 'APPROVED'
        """)
    long countApprovedByStudentId(Long studentId);

    @Query("""
        SELECT COUNT(s) FROM Submission s
        WHERE s.student.id = :studentId AND s.status IN ('SUBMITTED', 'UNDER_REVIEW')
        """)
    long countPendingByStudentId(Long studentId);
}
