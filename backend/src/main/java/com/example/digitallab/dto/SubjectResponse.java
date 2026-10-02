package com.example.digitallab.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SubjectResponse {
    private Long id;
    private String subjectName;
    private String courseCode;
    private String department;
    private Integer year;
    private Integer semester;
    private String academicYear;
    private String facultyName;
    private Long facultyId;
    private boolean hasLabManual;
    private LocalDateTime createdAt;
}
