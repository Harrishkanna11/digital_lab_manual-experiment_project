package com.example.digitallab.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStats {
    // Student Dashboard
    private long totalExperiments;
    private long completedExperiments;
    private long pendingSubmissions;
    private double attendancePercentage;
    private double averageMarks;

    // Faculty Dashboard
    private long totalStudents;
    private long totalSubjects;
    private long totalExperimentsCreated;
    private long pendingSubmissionsCount;
    private double averageAttendance;
    private double averageMarksAll;
}
