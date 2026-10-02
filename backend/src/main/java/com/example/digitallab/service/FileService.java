package com.example.digitallab.service;

import com.example.digitallab.dto.FileResponse;
import com.example.digitallab.entity.*;
import com.example.digitallab.exception.*;
import com.example.digitallab.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileService {

    private final SubmissionFileRepository submissionFileRepository;
    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final List<String> ALLOWED_TYPES = List.of(
            "image/jpeg", "image/png", "image/gif",
            "text/plain", "application/pdf",
            "application/zip", "text/x-java-source",
            "application/octet-stream"
    );

    @Transactional
    public FileResponse uploadFile(Long submissionId, MultipartFile file,
                                    String category, String uploaderEmail) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds 10MB limit");
        }
        if (file.getContentType() != null && !ALLOWED_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("File type not allowed: " + file.getContentType());
        }

        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission", submissionId));

        User uploader = userRepository.findByEmail(uploaderEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Create directory if not exists
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath();
        Files.createDirectories(uploadPath);

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
        String storedFilename = UUID.randomUUID().toString() + extension;

        Path filePath = uploadPath.resolve(storedFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        SubmissionFile submissionFile = SubmissionFile.builder()
                .submission(submission)
                .uploadedBy(uploader)
                .originalFilename(originalFilename)
                .storedFilename(storedFilename)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .storagePath(filePath.toString())
                .fileCategory(category)
                .build();

        submissionFile = submissionFileRepository.save(submissionFile);

        return FileResponse.builder()
                .id(submissionFile.getId())
                .originalFilename(originalFilename)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .fileCategory(category)
                .downloadUrl("/uploads/" + storedFilename)
                .uploadedAt(submissionFile.getUploadedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<SubmissionFile> getFilesForSubmission(Long submissionId) {
        return submissionFileRepository.findBySubmissionId(submissionId);
    }
}
