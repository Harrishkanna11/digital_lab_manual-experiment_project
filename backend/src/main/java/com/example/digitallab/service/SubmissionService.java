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
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final StudentRepository studentRepository;
    private final ExperimentRepository experimentRepository;
    private final FacultyRepository facultyRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final MarkRepository markRepository;
    private final StudentSubjectRepository studentSubjectRepository;
    private final AttendanceRepository attendanceRepository;

    @Transactional
    public SubmissionResponse submit(SubmissionRequest request, String studentEmail) {
        User user = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Experiment experiment = experimentRepository.findById(request.getExperimentId())
                .orElseThrow(() -> new ResourceNotFoundException("Experiment", request.getExperimentId()));

        // Ensure student is enrolled in the subject so experiment and submission appear on their dashboard
        if (!studentSubjectRepository.existsByStudentIdAndSubjectId(student.getId(), experiment.getSubject().getId())) {
            StudentSubject enrollment = StudentSubject.builder()
                    .student(student)
                    .subject(experiment.getSubject())
                    .build();
            studentSubjectRepository.save(enrollment);
        }

        // Check for existing submission to prevent accidental duplicates or allow legitimate resubmissions
        java.util.Optional<Submission> existingOpt = submissionRepository.findByStudentIdAndExperimentId(student.getId(), experiment.getId());
        if (existingOpt.isPresent()) {
            Submission existing = existingOpt.get();
            if (existing.getStatus() == SubmissionStatus.REJECTED || existing.getStatus() == SubmissionStatus.RESUBMIT) {
                existing.setSourceCode(request.getSourceCode().trim());
                existing.setObservation(request.getObservation().trim());
                existing.setResult(request.getResult().trim());
                existing.setAdditionalNotes(request.getAdditionalNotes() != null ? request.getAdditionalNotes().trim() : null);
                existing.setStatus(SubmissionStatus.SUBMITTED);
                existing.setSubmittedAt(LocalDateTime.now());
                existing.setReviewedAt(null);
                existing.setReviewedBy(null);
                existing.setFeedback(null);
                existing.setMarks(null);
                Submission saved = submissionRepository.save(existing);
                recordSubmissionAttendance(student, experiment);
                return toResponse(saved);
            } else {
                throw new DuplicateResourceException("You have already submitted this experiment (Status: " + existing.getStatus() + ")");
            }
        }

        Submission submission = Submission.builder()
                .student(student)
                .experiment(experiment)
                .sourceCode(request.getSourceCode().trim())
                .observation(request.getObservation().trim())
                .result(request.getResult().trim())
                .additionalNotes(request.getAdditionalNotes() != null ? request.getAdditionalNotes().trim() : null)
                .status(SubmissionStatus.SUBMITTED)
                .submittedAt(LocalDateTime.now())
                .build();

        Submission saved = submissionRepository.save(submission);
        recordSubmissionAttendance(student, experiment);
        return toResponse(saved);
    }

    private void recordSubmissionAttendance(Student student, Experiment experiment) {
        try {
            java.time.LocalDate today = java.time.LocalDate.now();
            Subject subject = experiment.getSubject();
            Faculty faculty = experiment.getCreatedBy() != null ? experiment.getCreatedBy() : (subject != null ? subject.getFaculty() : null);

            if (subject != null) {
                java.util.Optional<Attendance> existingAtt = attendanceRepository.findByStudentIdAndSubjectIdAndDate(
                        student.getId(), subject.getId(), today);

                if (existingAtt.isPresent()) {
                    Attendance att = existingAtt.get();
                    att.setStatus(AttendanceStatus.PRESENT);
                    att.setExperiment(experiment);
                    if (att.getMarkedBy() == null && faculty != null) {
                        att.setMarkedBy(faculty);
                    }
                    attendanceRepository.save(att);
                } else {
                    Attendance att = Attendance.builder()
                            .student(student)
                            .subject(subject)
                            .experiment(experiment)
                            .date(today)
                            .status(AttendanceStatus.PRESENT)
                            .markedBy(faculty)
                            .build();
                    attendanceRepository.save(att);
                }
            }
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(SubmissionService.class)
                    .error("Failed to auto-record attendance for experiment submission: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<SubmissionResponse> getStudentSubmissions(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return submissionRepository.findByStudentId(student.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SubmissionResponse> getFacultySubmissions(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Faculty faculty = facultyRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));
        List<Submission> list = submissionRepository.findSubmissionsForFaculty(faculty.getId());
        if (list.isEmpty()) {
            list = submissionRepository.findAllSubmissions();
        }
        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SubmissionResponse getById(Long id, String userEmail) {
        Submission s = submissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission", id));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == Role.STUDENT) {
            if (!s.getStudent().getUser().getId().equals(user.getId())) {
                throw new org.springframework.security.access.AccessDeniedException("You do not have permission to view another student's submission");
            }
        }
        return toResponse(s);
    }

    @Transactional
    public SubmissionResponse review(Long id, ReviewRequest request, String facultyEmail) {
        Submission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission", id));

        User user = userRepository.findByEmail(facultyEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Faculty faculty = facultyRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));

        submission.setStatus(request.getStatus());
        submission.setFeedback(request.getFeedback());
        submission.setMarks(request.getMarks());
        submission.setMaxMarks(request.getMaxMarks());
        submission.setReviewedBy(faculty);
        submission.setReviewedAt(LocalDateTime.now());
        Submission savedSubmission = submissionRepository.save(submission);

        // Notify student with appropriate status title and message
        String notifType;
        String notifTitle;
        String notifMsg;
        switch (request.getStatus()) {
            case APPROVED -> {
                notifType = "SUBMISSION_APPROVED";
                notifTitle = "Submission Approved";
                notifMsg = "Your submission for " + savedSubmission.getExperiment().getTitle() + " has been approved!";
            }
            case RESUBMIT -> {
                notifType = "SUBMISSION_RESUBMIT";
                notifTitle = "Resubmission Requested";
                notifMsg = "Resubmission requested for " + savedSubmission.getExperiment().getTitle() + (request.getFeedback() != null ? ". Feedback: " + request.getFeedback() : "");
            }
            default -> {
                notifType = "SUBMISSION_REJECTED";
                notifTitle = "Submission Rejected";
                notifMsg = "Your submission for " + savedSubmission.getExperiment().getTitle() + " has been rejected. Feedback: " + request.getFeedback();
            }
        }

        notificationService.createNotification(savedSubmission.getStudent(),
                notifTitle,
                notifMsg, notifType, savedSubmission.getId());

        // Auto-create mark record if marks given
        if (request.getMarks() != null && request.getMaxMarks() != null) {
            markRepository.findByStudentIdAndExperimentId(
                    savedSubmission.getStudent().getId(), savedSubmission.getExperiment().getId())
                    .ifPresentOrElse(
                            mark -> {
                                mark.setMarksObtained(request.getMarks());
                                mark.setMaxMarks(request.getMaxMarks());
                                mark.setFeedback(request.getFeedback());
                                markRepository.save(mark);
                            },
                            () -> {
                                Mark mark = Mark.builder()
                                        .student(savedSubmission.getStudent())
                                        .experiment(savedSubmission.getExperiment())
                                        .submission(savedSubmission)
                                        .marksObtained(request.getMarks())
                                        .maxMarks(request.getMaxMarks())
                                        .feedback(request.getFeedback())
                                        .givenBy(faculty)
                                        .build();
                                markRepository.save(mark);
                            }
                    );
        }

        return toResponse(savedSubmission);
    }

    public SubmissionResponse toResponse(Submission s) {
        return SubmissionResponse.builder()
                .id(s.getId())
                .studentId(s.getStudent() != null ? s.getStudent().getId() : null)
                .studentName(s.getStudent() != null && s.getStudent().getUser() != null ? s.getStudent().getUser().getFullName() : "Student")
                .studentRegisterNumber(s.getStudent() != null ? s.getStudent().getRegisterNumber() : "N/A")
                .experimentId(s.getExperiment() != null ? s.getExperiment().getId() : null)
                .experimentTitle(s.getExperiment() != null ? s.getExperiment().getTitle() : "Untitled Experiment")
                .experimentNumber(s.getExperiment() != null ? s.getExperiment().getExperimentNumber() : null)
                .subjectName(s.getExperiment() != null && s.getExperiment().getSubject() != null ? s.getExperiment().getSubject().getSubjectName() : "N/A")
                .sourceCode(s.getSourceCode())
                .observation(s.getObservation())
                .result(s.getResult())
                .additionalNotes(s.getAdditionalNotes())
                .status(s.getStatus())
                .submittedAt(s.getSubmittedAt())
                .reviewedAt(s.getReviewedAt())
                .reviewedByFacultyName(s.getReviewedBy() != null && s.getReviewedBy().getUser() != null ? s.getReviewedBy().getUser().getFullName() : null)
                .feedback(s.getFeedback())
                .marks(s.getMarks())
                .maxMarks(s.getMaxMarks())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
