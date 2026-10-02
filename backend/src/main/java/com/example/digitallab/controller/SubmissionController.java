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
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<SubmissionResponse> submit(
            @Valid @RequestBody SubmissionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(submissionService.submit(request, userDetails.getUsername()));
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<SubmissionResponse>> getStudentSubmissions(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(submissionService.getStudentSubmissions(userDetails.getUsername()));
    }

    @GetMapping("/faculty")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<List<SubmissionResponse>> getFacultySubmissions(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(submissionService.getFacultySubmissions(userDetails.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubmissionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(submissionService.getById(id));
    }

    @PutMapping("/{id}/review")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<SubmissionResponse> review(
            @PathVariable Long id,
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(submissionService.review(id, request, userDetails.getUsername()));
    }
}
