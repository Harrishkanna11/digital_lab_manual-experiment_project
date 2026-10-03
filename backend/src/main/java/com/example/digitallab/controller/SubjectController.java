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
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectService subjectService;
    private final StudentService studentService;

    @GetMapping
    public ResponseEntity<List<SubjectResponse>> getAll(
            @AuthenticationPrincipal UserDetails userDetails) {
        // Faculty gets their subjects, others get all
        return ResponseEntity.ok(subjectService.getAll());
    }

    @GetMapping("/faculty")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<List<SubjectResponse>> getForFaculty(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(subjectService.getForFaculty(userDetails.getUsername()));
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<SubjectResponse>> getForStudent(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(subjectService.getForStudent(userDetails.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubjectResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(subjectService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<SubjectResponse> create(
            @Valid @RequestBody SubjectRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(subjectService.create(request, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<SubjectResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody SubjectRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(subjectService.update(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        subjectService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{subjectId}/assign-students")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<List<StudentResponse>> assignStudents(
            @PathVariable Long subjectId,
            @RequestBody AssignStudentsRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        subjectService.assignStudents(subjectId, request.getStudentIds(), userDetails.getUsername());
        return ResponseEntity.ok(studentService.getStudentsBySubject(subjectId));
    }

    @DeleteMapping("/{subjectId}/assign/{studentId}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<Void> unassignStudent(
            @PathVariable Long subjectId,
            @PathVariable Long studentId) {
        subjectService.unassignStudent(subjectId, studentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{subjectId}/students")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<List<StudentResponse>> getSubjectStudents(@PathVariable Long subjectId) {
        return ResponseEntity.ok(studentService.getStudentsBySubject(subjectId));
    }

    @PostMapping("/{subjectId}/enroll")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> enroll(
            @PathVariable Long subjectId,
            @AuthenticationPrincipal UserDetails userDetails) {
        studentService.enrollInSubject(userDetails.getUsername(), subjectId);
        return ResponseEntity.ok().build();
    }

    @RequestMapping(value = "/{subjectId}/unenroll", method = {RequestMethod.POST, RequestMethod.DELETE})
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> unenroll(
            @PathVariable Long subjectId,
            @AuthenticationPrincipal UserDetails userDetails) {
        studentService.unenrollFromSubject(userDetails.getUsername(), subjectId);
        return ResponseEntity.ok().build();
    }
}
