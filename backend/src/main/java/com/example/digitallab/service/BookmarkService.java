package com.example.digitallab.service;

import com.example.digitallab.dto.ExperimentResponse;
import com.example.digitallab.entity.*;
import com.example.digitallab.exception.*;
import com.example.digitallab.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final StudentRepository studentRepository;
    private final ExperimentRepository experimentRepository;
    private final UserRepository userRepository;
    private final ExperimentService experimentService;

    @Transactional
    public void addBookmark(Long experimentId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Experiment experiment = experimentRepository.findById(experimentId)
                .orElseThrow(() -> new ResourceNotFoundException("Experiment", experimentId));

        if (bookmarkRepository.existsByStudentIdAndExperimentId(student.getId(), experimentId)) {
            throw new DuplicateResourceException("Experiment already bookmarked");
        }

        Bookmark bookmark = Bookmark.builder()
                .student(student)
                .experiment(experiment)
                .build();
        bookmarkRepository.save(bookmark);
    }

    @Transactional
    public void removeBookmark(Long experimentId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Bookmark bookmark = bookmarkRepository.findByStudentIdAndExperimentId(student.getId(), experimentId)
                .orElseThrow(() -> new ResourceNotFoundException("Bookmark not found"));
        bookmarkRepository.delete(bookmark);
    }

    @Transactional(readOnly = true)
    public List<ExperimentResponse> getBookmarks(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return bookmarkRepository.findByStudentId(student.getId())
                .stream()
                .map(b -> experimentService.toResponse(b.getExperiment()))
                .collect(Collectors.toList());
    }
}
