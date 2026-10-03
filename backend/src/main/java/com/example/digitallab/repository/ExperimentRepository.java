package com.example.digitallab.repository;

import com.example.digitallab.entity.Experiment;
import com.example.digitallab.entity.Difficulty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ExperimentRepository extends JpaRepository<Experiment, Long> {
    List<Experiment> findByPublishedTrue();
    List<Experiment> findBySubjectId(Long subjectId);
    List<Experiment> findBySubjectIdAndPublishedTrue(Long subjectId);
    List<Experiment> findByCreatedById(Long facultyId);
    List<Experiment> findByLabManualId(Long labManualId);

    @Query("""
        SELECT e FROM Experiment e
        WHERE e.published = true
        AND e.subject.id IN (
            SELECT ss.subject.id FROM StudentSubject ss WHERE ss.student.id = :studentId
        )
        ORDER BY e.subject.subjectName, e.experimentNumber
        """)
    List<Experiment> findPublishedExperimentsForStudent(Long studentId);

    @Query("""
        SELECT e FROM Experiment e
        WHERE e.published = true
        AND e.subject.id IN (
            SELECT ss.subject.id FROM StudentSubject ss WHERE ss.student.id = :studentId
        )
        AND (LOWER(e.title) LIKE LOWER(CONCAT('%', :search, '%'))
             OR LOWER(e.subject.subjectName) LIKE LOWER(CONCAT('%', :search, '%')))
        """)
    List<Experiment> searchPublishedExperimentsForStudent(Long studentId, String search);

    @Query("""
        SELECT e FROM Experiment e
        WHERE e.published = true
        AND e.subject.id IN (
            SELECT ss.subject.id FROM StudentSubject ss WHERE ss.student.id = :studentId
        )
        AND e.difficulty = :difficulty
        """)
    List<Experiment> findByStudentAndDifficulty(Long studentId, Difficulty difficulty);
}
