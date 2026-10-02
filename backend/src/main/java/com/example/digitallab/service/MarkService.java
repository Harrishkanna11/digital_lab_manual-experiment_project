package com.example.digitallab.service;

import com.example.digitallab.dto.*;
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
public class MarkService {

    private final MarkRepository markRepository;
    private final StudentRepository studentRepository;
    private final ExperimentRepository experimentRepository;
    private final FacultyRepository facultyRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public MarkResponse giveMarks(MarkRequest request, String facultyEmail) {
        User user = userRepository.findByEmail(facultyEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Faculty faculty = facultyRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", request.getStudentId()));
        Experiment experiment = experimentRepository.findById(request.getExperimentId())
                .orElseThrow(() -> new ResourceNotFoundException("Experiment", request.getExperimentId()));

        Mark mark = markRepository.findByStudentIdAndExperimentId(student.getId(), experiment.getId())
                .orElse(Mark.builder().student(student).experiment(experiment).build());

        mark.setMarksObtained(request.getMarksObtained());
        mark.setMaxMarks(request.getMaxMarks());
        mark.setFeedback(request.getFeedback());
        mark.setGivenBy(faculty);

        mark = markRepository.save(mark);

        notificationService.createNotification(student, "Marks Published",
                "Marks for " + experiment.getTitle() + ": " + request.getMarksObtained() + "/" + request.getMaxMarks(),
                "MARKS_RELEASED", mark.getId());

        return toResponse(mark);
    }

    @Transactional(readOnly = true)
    public List<MarkResponse> getStudentMarks(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return markRepository.findByStudentId(student.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MarkResponse> getByExperiment(Long experimentId) {
        return markRepository.findByExperimentId(experimentId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MarkResponse> getBySubject(Long subjectId) {
        return markRepository.findBySubjectId(subjectId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private MarkResponse toResponse(Mark m) {
        double percentage = m.getMaxMarks() > 0
                ? (m.getMarksObtained() * 100.0 / m.getMaxMarks()) : 0;
        return MarkResponse.builder()
                .id(m.getId())
                .studentId(m.getStudent().getId())
                .studentName(m.getStudent().getUser().getFullName())
                .experimentId(m.getExperiment().getId())
                .experimentTitle(m.getExperiment().getTitle())
                .experimentNumber(m.getExperiment().getExperimentNumber())
                .marksObtained(m.getMarksObtained())
                .maxMarks(m.getMaxMarks())
                .percentage(Math.round(percentage * 100.0) / 100.0)
                .feedback(m.getFeedback())
                .givenByFacultyName(m.getGivenBy() != null ? m.getGivenBy().getUser().getFullName() : null)
                .createdAt(m.getCreatedAt())
                .build();
    }
}
