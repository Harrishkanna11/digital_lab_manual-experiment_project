package com.example.digitallab.repository;

import com.example.digitallab.entity.SubmissionFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionFileRepository extends JpaRepository<SubmissionFile, Long> {
    List<SubmissionFile> findBySubmissionId(Long submissionId);
}
