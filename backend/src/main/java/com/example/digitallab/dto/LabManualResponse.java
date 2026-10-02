package com.example.digitallab.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class LabManualResponse {
    private Long id;
    private String title;
    private String description;
    private String academicYear;
    private boolean published;
    private LocalDateTime publishedAt;
    private Long subjectId;
    private String subjectName;
    private String courseCode;
    private String department;
    private Integer year;
    private Integer semester;
    private String facultyName;
    private int experimentCount;
    private LocalDateTime createdAt;
}
