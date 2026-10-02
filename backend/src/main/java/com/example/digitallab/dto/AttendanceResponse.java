package com.example.digitallab.dto;

import com.example.digitallab.entity.AttendanceStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class AttendanceResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private String registerNumber;
    private Long subjectId;
    private String subjectName;
    private Long experimentId;
    private String experimentTitle;
    private LocalDate date;
    private AttendanceStatus status;
    private LocalDateTime createdAt;
}
