package com.example.digitallab.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LabManualRequest {
    @NotBlank
    private String title;
    private String description;
    @NotBlank
    private String academicYear;
    @NotNull
    private Long subjectId;
    private boolean published = false;
}
