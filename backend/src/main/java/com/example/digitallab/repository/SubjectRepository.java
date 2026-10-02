package com.example.digitallab.repository;

import com.example.digitallab.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    boolean existsByCourseCode(String courseCode);
    List<Subject> findByFacultyId(Long facultyId);

    @Query("SELECT ss.subject FROM StudentSubject ss WHERE ss.student.id = :studentId")
    List<Subject> findByStudentId(Long studentId);
}
