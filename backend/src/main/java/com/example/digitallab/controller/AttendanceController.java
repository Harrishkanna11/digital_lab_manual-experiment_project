package com.example.digitallab.controller;

import com.example.digitallab.dto.*;
import com.example.digitallab.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<AttendanceResponse> mark(
            @Valid @RequestBody AttendanceRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(attendanceService.markAttendance(request, userDetails.getUsername()));
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<AttendanceResponse>> getStudentAttendance(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(attendanceService.getStudentAttendance(userDetails.getUsername()));
    }

    @GetMapping("/student/summary")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<AttendanceService.AttendanceSummary> getStudentSummary(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(attendanceService.getStudentSummary(userDetails.getUsername()));
    }

    @GetMapping("/subject/{subjectId}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<List<AttendanceResponse>> getBySubject(@PathVariable Long subjectId) {
        return ResponseEntity.ok(attendanceService.getBySubject(subjectId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<AttendanceResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody AttendanceRequest request) {
        return ResponseEntity.ok(attendanceService.update(id, request));
    }
}
