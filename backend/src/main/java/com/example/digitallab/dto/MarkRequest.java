package com.example.digitallab.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MarkRequest {
    @NotNull
    private Long studentId;
    @NotNull
    private Long experimentId;
    @NotNull
    private Integer marksObtained;
    @NotNull
    private Integer maxMarks;
    private String feedback;
}
