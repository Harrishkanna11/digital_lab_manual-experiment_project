package com.example.digitallab.dto;

import com.example.digitallab.entity.Difficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ExperimentRequest {
    @NotNull
    private Integer experimentNumber;
    @NotBlank
    private String title;
    @NotNull
    private Long subjectId;
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
    private Difficulty difficulty = Difficulty.MEDIUM;
    private LocalDate deadline;
    private boolean published = false;
}
