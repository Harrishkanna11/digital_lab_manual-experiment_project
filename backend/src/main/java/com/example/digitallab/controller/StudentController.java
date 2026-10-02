package com.example.digitallab.controller;

import com.example.digitallab.dto.*;
import com.example.digitallab.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @GetMapping
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<List<StudentResponse>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<StudentResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getById(id));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentResponse> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(studentService.getByEmail(userDetails.getUsername()));
    }

    @GetMapping("/me/dashboard")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<DashboardStats> getStudentDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(studentService.getStudentDashboard(userDetails.getUsername()));
    }

    @GetMapping("/faculty/dashboard")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<DashboardStats> getFacultyDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(studentService.getFacultyDashboard(userDetails.getUsername()));
    }
}
