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
@RequestMapping("/api/bookmarks")
@RequiredArgsConstructor
public class BookmarkController {

    private final BookmarkService bookmarkService;

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ExperimentResponse>> getBookmarks(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(bookmarkService.getBookmarks(userDetails.getUsername()));
    }

    @PostMapping("/{experimentId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> addBookmark(
            @PathVariable Long experimentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        bookmarkService.addBookmark(experimentId, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{experimentId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> removeBookmark(
            @PathVariable Long experimentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        bookmarkService.removeBookmark(experimentId, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }
}
