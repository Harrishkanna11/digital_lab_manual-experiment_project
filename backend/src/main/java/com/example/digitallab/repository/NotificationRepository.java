package com.example.digitallab.repository;

import com.example.digitallab.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    long countByStudentIdAndReadFalse(Long studentId);
    List<Notification> findByStudentIdAndReadFalse(Long studentId);
}
