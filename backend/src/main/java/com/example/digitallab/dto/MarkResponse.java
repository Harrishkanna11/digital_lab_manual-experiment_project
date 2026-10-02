package com.example.digitallab.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MarkResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long experimentId;
    private String experimentTitle;
    private Integer experimentNumber;
    private Integer marksObtained;
    private Integer maxMarks;
    private Double percentage;
    private String feedback;
    private String givenByFacultyName;
    private LocalDateTime createdAt;
}
