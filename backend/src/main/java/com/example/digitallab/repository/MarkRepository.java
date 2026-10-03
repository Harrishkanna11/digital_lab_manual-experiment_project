package com.example.digitallab.repository;

import com.example.digitallab.entity.Mark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface MarkRepository extends JpaRepository<Mark, Long> {
    List<Mark> findByStudentId(Long studentId);
    List<Mark> findByExperimentId(Long experimentId);
    Optional<Mark> findByStudentIdAndExperimentId(Long studentId, Long experimentId);

    @Query("SELECT m FROM Mark m WHERE m.experiment.subject.id = :subjectId")
    List<Mark> findBySubjectId(Long subjectId);

    @Query("SELECT AVG(m.marksObtained * 100.0 / m.maxMarks) FROM Mark m WHERE m.student.id = :studentId")
    Double findAveragePercentageByStudentId(Long studentId);
}
