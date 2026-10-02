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
@RequestMapping("/api/experiments")
@RequiredArgsConstructor
public class ExperimentController {

    private final ExperimentService experimentService;

    @GetMapping
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<List<ExperimentResponse>> getAll() {
        return ResponseEntity.ok(experimentService.getAll());
    }

    @GetMapping("/published")
    public ResponseEntity<List<ExperimentResponse>> getPublished() {
        return ResponseEntity.ok(experimentService.getPublished());
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ExperimentResponse>> getForStudent(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(experimentService.searchForStudent(userDetails.getUsername(), search));
        }
        return ResponseEntity.ok(experimentService.getForStudent(userDetails.getUsername()));
    }

    @GetMapping("/faculty")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<List<ExperimentResponse>> getForFaculty(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(experimentService.getForFaculty(userDetails.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExperimentResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(experimentService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ExperimentResponse> create(
            @Valid @RequestBody ExperimentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(experimentService.create(request, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ExperimentResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ExperimentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(experimentService.update(id, request, userDetails.getUsername()));
    }

    @PutMapping("/{id}/publish")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ExperimentResponse> publish(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(experimentService.publish(id, userDetails.getUsername()));
    }

    @PutMapping("/{id}/unpublish")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ExperimentResponse> unpublish(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(experimentService.unpublish(id, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        experimentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
