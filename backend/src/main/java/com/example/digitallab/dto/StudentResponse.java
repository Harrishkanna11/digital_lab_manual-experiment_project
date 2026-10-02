package com.example.digitallab.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StudentResponse {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String registerNumber;
    private String department;
    private Integer year;
    private String section;
    private long totalExperiments;
    private long completedExperiments;
    private long pendingSubmissions;
    private double attendancePercentage;
    private double averageMarks;
}
