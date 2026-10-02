package com.example.digitallab.repository;

import com.example.digitallab.entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    Optional<Faculty> findByUserId(Long userId);
    Optional<Faculty> findByFacultyId(String facultyId);
    boolean existsByFacultyId(String facultyId);
}
