package com.example.digitallab.dto;

import com.example.digitallab.entity.Difficulty;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class ExperimentResponse {
    private Long id;
    private Integer experimentNumber;
    private String title;
    private Long subjectId;
    private String subjectName;
    private String courseCode;
    private Long labManualId;
    private String aim;
    private String requirements;
    private String theory;
    private String algorithm;
    private String procedure;
    private String sourceCode;
    private String expectedOutput;
    private String observation;
    private String result;
    private String vivaQuestions;
    private Difficulty difficulty;
    private LocalDate deadline;
    private boolean published;
    private LocalDateTime publishedAt;
    private String createdByFacultyName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
