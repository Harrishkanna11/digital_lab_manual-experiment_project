package com.example.digitallab.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class FileResponse {
    private Long id;
    private String originalFilename;
    private String fileType;
    private Long fileSize;
    private String fileCategory;
    private String downloadUrl;
    private LocalDateTime uploadedAt;
}
