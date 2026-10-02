package com.example.digitallab.service;

import com.example.digitallab.dto.*;
import com.example.digitallab.entity.*;
import com.example.digitallab.exception.*;
import com.example.digitallab.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExperimentService {

    private final ExperimentRepository experimentRepository;
    private final SubjectRepository subjectRepository;
    private final LabManualRepository labManualRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final StudentSubjectRepository studentSubjectRepository;

    @Transactional
    public ExperimentResponse create(ExperimentRequest request, String facultyEmail) {
        User user = userRepository.findByEmail(facultyEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Faculty faculty = facultyRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject", request.getSubjectId()));

        Experiment experiment = Experiment.builder()
                .experimentNumber(request.getExperimentNumber())
                .title(request.getTitle())
                .subject(subject)
                .aim(request.getAim())
                .requirements(request.getRequirements())
                .theory(request.getTheory())
                .algorithm(request.getAlgorithm())
                .procedure(request.getProcedure())
                .sourceCode(request.getSourceCode())
                .expectedOutput(request.getExpectedOutput())
                .observation(request.getObservation())
                .result(request.getResult())
                .vivaQuestions(request.getVivaQuestions())
                .difficulty(request.getDifficulty())
                .deadline(request.getDeadline())
                .published(request.isPublished())
                .createdBy(faculty)
                .build();

        if (request.getLabManualId() != null) {
            LabManual labManual = labManualRepository.findById(request.getLabManualId())
                    .orElseThrow(() -> new ResourceNotFoundException("Lab Manual", request.getLabManualId()));
            experiment.setLabManual(labManual);
        }

        if (request.isPublished()) {
            experiment.setPublishedAt(LocalDateTime.now());
        }

        experiment = experimentRepository.save(experiment);

        if (request.isPublished()) {
            notifyStudentsOfNewExperiment(experiment);
        }

        return toResponse(experiment);
    }

    @Transactional(readOnly = true)
    public List<ExperimentResponse> getAll() {
        return experimentRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExperimentResponse> getPublished() {
        return experimentRepository.findByPublishedTrue().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExperimentResponse> getForStudent(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return experimentRepository.findPublishedExperimentsForStudent(student.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExperimentResponse> getForFaculty(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Faculty faculty = facultyRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));
        List<ExperimentResponse> list = experimentRepository.findByCreatedById(faculty.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
        return list.isEmpty() ? getAll() : list;
    }

    @Transactional(readOnly = true)
    public ExperimentResponse getById(Long id) {
        return toResponse(experimentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Experiment", id)));
    }

    @Transactional
    public ExperimentResponse update(Long id, ExperimentRequest request, String facultyEmail) {
        Experiment experiment = experimentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Experiment", id));

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject", request.getSubjectId()));

        experiment.setExperimentNumber(request.getExperimentNumber());
        experiment.setTitle(request.getTitle());
        experiment.setSubject(subject);
        experiment.setAim(request.getAim());
        experiment.setRequirements(request.getRequirements());
        experiment.setTheory(request.getTheory());
        experiment.setAlgorithm(request.getAlgorithm());
        experiment.setProcedure(request.getProcedure());
        experiment.setSourceCode(request.getSourceCode());
        experiment.setExpectedOutput(request.getExpectedOutput());
        experiment.setObservation(request.getObservation());
        experiment.setResult(request.getResult());
        experiment.setVivaQuestions(request.getVivaQuestions());
        experiment.setDifficulty(request.getDifficulty());
        experiment.setDeadline(request.getDeadline());

        return toResponse(experimentRepository.save(experiment));
    }

    @Transactional
    public ExperimentResponse publish(Long id, String facultyEmail) {
        Experiment experiment = experimentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Experiment", id));

        if (!experiment.isPublished()) {
            experiment.setPublished(true);
            experiment.setPublishedAt(LocalDateTime.now());
            experiment = experimentRepository.save(experiment);
            notifyStudentsOfNewExperiment(experiment);
        }

        return toResponse(experiment);
    }

    @Transactional
    public ExperimentResponse unpublish(Long id, String facultyEmail) {
        Experiment experiment = experimentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Experiment", id));

        experiment.setPublished(false);
        experiment.setPublishedAt(null);
        return toResponse(experimentRepository.save(experiment));
    }

    @Transactional
    public void delete(Long id) {
        Experiment experiment = experimentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Experiment", id));
        experimentRepository.delete(experiment);
    }

    @Transactional(readOnly = true)
    public List<ExperimentResponse> searchForStudent(String email, String search) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return experimentRepository.searchPublishedExperimentsForStudent(student.getId(), search)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private void notifyStudentsOfNewExperiment(Experiment experiment) {
        // Find all students enrolled in the subject
        List<StudentSubject> enrollments = studentSubjectRepository.findBySubjectId(experiment.getSubject().getId());
        for (StudentSubject enrollment : enrollments) {
            notificationService.createNotification(
                    enrollment.getStudent(),
                    "New Experiment Published",
                    "Experiment " + experiment.getExperimentNumber() + ": " + experiment.getTitle()
                            + " has been published in " + experiment.getSubject().getSubjectName(),
                    "EXPERIMENT_PUBLISHED",
                    experiment.getId()
            );
        }
    }

    public ExperimentResponse toResponse(Experiment e) {
        return ExperimentResponse.builder()
                .id(e.getId())
                .experimentNumber(e.getExperimentNumber())
                .title(e.getTitle())
                .subjectId(e.getSubject() != null ? e.getSubject().getId() : null)
                .subjectName(e.getSubject() != null ? e.getSubject().getSubjectName() : null)
                .courseCode(e.getSubject() != null ? e.getSubject().getCourseCode() : null)
                .labManualId(e.getLabManual() != null ? e.getLabManual().getId() : null)
                .aim(e.getAim())
                .requirements(e.getRequirements())
                .theory(e.getTheory())
                .algorithm(e.getAlgorithm())
                .procedure(e.getProcedure())
                .sourceCode(e.getSourceCode())
                .expectedOutput(e.getExpectedOutput())
                .observation(e.getObservation())
                .result(e.getResult())
                .vivaQuestions(e.getVivaQuestions())
                .difficulty(e.getDifficulty())
                .deadline(e.getDeadline())
                .published(e.isPublished())
                .publishedAt(e.getPublishedAt())
                .createdByFacultyName(e.getCreatedBy() != null ? e.getCreatedBy().getUser().getFullName() : null)
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}
