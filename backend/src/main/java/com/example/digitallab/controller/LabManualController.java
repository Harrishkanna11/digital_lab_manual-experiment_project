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
@RequestMapping("/api/lab-manuals")
@RequiredArgsConstructor
public class LabManualController {

    private final LabManualService labManualService;

    @GetMapping
    public ResponseEntity<List<LabManualResponse>> getAll(
            @RequestParam(required = false, defaultValue = "false") boolean publishedOnly) {
        if (publishedOnly) return ResponseEntity.ok(labManualService.getPublished());
        return ResponseEntity.ok(labManualService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LabManualResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(labManualService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<LabManualResponse> create(
            @Valid @RequestBody LabManualRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(labManualService.create(request, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<LabManualResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody LabManualRequest request) {
        return ResponseEntity.ok(labManualService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        labManualService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
