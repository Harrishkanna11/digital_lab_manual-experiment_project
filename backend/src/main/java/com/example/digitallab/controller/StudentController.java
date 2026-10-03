package com.example.digitallab.controller;

import com.example.digitallab.dto.DashboardStats;
import com.example.digitallab.dto.StudentResponse;
import com.example.digitallab.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    @GetMapping("/subject/{subjectId}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<List<StudentResponse>> getBySubject(@PathVariable Long subjectId) {
        return ResponseEntity.ok(studentService.getStudentsBySubject(subjectId));
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

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }
}

