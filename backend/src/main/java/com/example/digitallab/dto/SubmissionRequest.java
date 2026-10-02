package com.example.digitallab.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubmissionRequest {
    @NotNull
    private Long experimentId;
    private String sourceCode;
    private String observation;
    private String result;
    private String additionalNotes;
}
