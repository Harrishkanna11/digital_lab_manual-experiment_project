package com.example.digitallab.repository;

import com.example.digitallab.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserId(Long userId);
    Optional<Student> findByRegisterNumber(String registerNumber);
    boolean existsByRegisterNumber(String registerNumber);

    @Query("SELECT s FROM Student s JOIN s.studentSubjects ss WHERE ss.subject.id = :subjectId")
    List<Student> findBySubjectId(Long subjectId);
}
