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
@RequestMapping("/api/marks")
@RequiredArgsConstructor
public class MarkController {

    private final MarkService markService;

    @PostMapping
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<MarkResponse> giveMarks(
            @Valid @RequestBody MarkRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(markService.giveMarks(request, userDetails.getUsername()));
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<MarkResponse>> getStudentMarks(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(markService.getStudentMarks(userDetails.getUsername()));
    }

    @GetMapping("/experiment/{experimentId}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<List<MarkResponse>> getByExperiment(@PathVariable Long experimentId) {
        return ResponseEntity.ok(markService.getByExperiment(experimentId));
    }

    @GetMapping("/subject/{subjectId}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<List<MarkResponse>> getBySubject(@PathVariable Long subjectId) {
        return ResponseEntity.ok(markService.getBySubject(subjectId));
    }
}
