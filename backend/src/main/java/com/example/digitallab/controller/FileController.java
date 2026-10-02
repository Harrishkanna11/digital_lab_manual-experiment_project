package com.example.digitallab.controller;

import com.example.digitallab.dto.FileResponse;
import com.example.digitallab.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping("/upload/{submissionId}")
    public ResponseEntity<FileResponse> uploadFile(
            @PathVariable Long submissionId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "DOCUMENT") String category,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        return ResponseEntity.ok(
                fileService.uploadFile(submissionId, file, category, userDetails.getUsername())
        );
    }
}
