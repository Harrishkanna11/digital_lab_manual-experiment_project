package com.example.digitallab.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private String type;
    private Long referenceId;
    private boolean read;
    private LocalDateTime createdAt;
}
