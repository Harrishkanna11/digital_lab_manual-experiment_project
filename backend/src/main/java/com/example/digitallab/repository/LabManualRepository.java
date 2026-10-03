package com.example.digitallab.repository;

import com.example.digitallab.entity.LabManual;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LabManualRepository extends JpaRepository<LabManual, Long> {
    Optional<LabManual> findBySubjectId(Long subjectId);
    List<LabManual> findByPublished(boolean published);
}
