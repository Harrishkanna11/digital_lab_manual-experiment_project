package com.example.digitallab.repository;

import com.example.digitallab.entity.SubmissionFile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubmissionFileRepository extends JpaRepository<SubmissionFile, Long> {
    List<SubmissionFile> findBySubmissionId(Long submissionId);
}
