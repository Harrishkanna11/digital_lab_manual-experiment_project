package com.example.digitallab.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubjectRequest {
    @NotBlank
    private String subjectName;
    @NotBlank
    private String courseCode;
    @NotBlank
    private String department;
    @NotNull
    private Integer year;
    @NotNull
    private Integer semester;
    @NotBlank
    private String academicYear;
}
