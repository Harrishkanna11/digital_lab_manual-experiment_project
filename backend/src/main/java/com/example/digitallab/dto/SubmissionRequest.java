package com.example.digitallab.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubmissionRequest {
    @NotNull(message = "Experiment ID is required")
    private Long experimentId;

    @NotBlank(message = "Source code is required")
    private String sourceCode;

    @NotBlank(message = "Observation is required")
    private String observation;

    @NotBlank(message = "Result is required")
    private String result;

    private String additionalNotes;
}
