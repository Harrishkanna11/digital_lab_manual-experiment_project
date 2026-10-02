package com.example.digitallab.dto;

import com.example.digitallab.entity.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AttendanceRequest {
    @NotNull
    private Long studentId;
    @NotNull
    private Long subjectId;
    private Long experimentId;
    @NotNull
    private LocalDate date;
    @NotNull
    private AttendanceStatus status;
}
