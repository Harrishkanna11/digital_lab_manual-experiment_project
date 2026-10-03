package com.example.digitallab.repository;

import com.example.digitallab.entity.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    List<Bookmark> findByStudentId(Long studentId);
    Optional<Bookmark> findByStudentIdAndExperimentId(Long studentId, Long experimentId);
    boolean existsByStudentIdAndExperimentId(Long studentId, Long experimentId);
}
