package com.example.digitallab.dto;

import com.example.digitallab.entity.SubmissionStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewRequest {
    @NotNull
    private SubmissionStatus status;
    private String feedback;
    private Integer marks;
    private Integer maxMarks;
}
