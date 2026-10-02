package com.example.digitallab.dto;

import com.example.digitallab.entity.SubmissionStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class SubmissionResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentRegisterNumber;
    private Long experimentId;
    private String experimentTitle;
    private Integer experimentNumber;
    private String subjectName;
    private String sourceCode;
    private String observation;
    private String result;
    private String additionalNotes;
    private SubmissionStatus status;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
    private String reviewedByFacultyName;
    private String feedback;
    private Integer marks;
    private Integer maxMarks;
    private List<FileResponse> files;
    private LocalDateTime createdAt;
}
