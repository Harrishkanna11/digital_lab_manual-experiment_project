package com.example.digitallab.repository;

import com.example.digitallab.entity.StudentSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentSubjectRepository extends JpaRepository<StudentSubject, Long> {
    boolean existsByStudentIdAndSubjectId(Long studentId, Long subjectId);
    Optional<StudentSubject> findByStudentIdAndSubjectId(Long studentId, Long subjectId);
    List<StudentSubject> findByStudentId(Long studentId);
    List<StudentSubject> findBySubjectId(Long subjectId);
}
