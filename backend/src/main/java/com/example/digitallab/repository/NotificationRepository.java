package com.example.digitallab.repository;

import com.example.digitallab.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    long countByStudentIdAndReadFalse(Long studentId);
    List<Notification> findByStudentIdAndReadFalse(Long studentId);
}
