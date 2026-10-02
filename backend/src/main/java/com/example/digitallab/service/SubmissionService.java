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

    @Transactional
    public SubmissionResponse submit(SubmissionRequest request, String studentEmail) {
        User user = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Experiment experiment = experimentRepository.findById(request.getExperimentId())
                .orElseThrow(() -> new ResourceNotFoundException("Experiment", request.getExperimentId()));

        if (submissionRepository.existsByStudentIdAndExperimentId(student.getId(), experiment.getId())) {
            throw new DuplicateResourceException("You have already submitted this experiment");
        }

        Submission submission = Submission.builder()
                .student(student)
                .experiment(experiment)
                .sourceCode(request.getSourceCode())
                .observation(request.getObservation())
                .result(request.getResult())
                .additionalNotes(request.getAdditionalNotes())
                .status(SubmissionStatus.SUBMITTED)
                .submittedAt(LocalDateTime.now())
                .build();

        return toResponse(submissionRepository.save(submission));
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
        return submissionRepository.findSubmissionsForFaculty(faculty.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SubmissionResponse getById(Long id) {
        return toResponse(submissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission", id)));
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

        // Notify student
        String notifType = request.getStatus() == SubmissionStatus.APPROVED
                ? "SUBMISSION_APPROVED" : "SUBMISSION_REJECTED";
        String notifMsg = request.getStatus() == SubmissionStatus.APPROVED
                ? "Your submission for " + savedSubmission.getExperiment().getTitle() + " has been approved!"
                : "Your submission for " + savedSubmission.getExperiment().getTitle() + " has been rejected. Feedback: " + request.getFeedback();

        notificationService.createNotification(savedSubmission.getStudent(),
                request.getStatus() == SubmissionStatus.APPROVED ? "Submission Approved" : "Submission Rejected",
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
                .studentId(s.getStudent().getId())
                .studentName(s.getStudent().getUser().getFullName())
                .studentRegisterNumber(s.getStudent().getRegisterNumber())
                .experimentId(s.getExperiment().getId())
                .experimentTitle(s.getExperiment().getTitle())
                .experimentNumber(s.getExperiment().getExperimentNumber())
                .subjectName(s.getExperiment().getSubject().getSubjectName())
                .sourceCode(s.getSourceCode())
                .observation(s.getObservation())
                .result(s.getResult())
                .additionalNotes(s.getAdditionalNotes())
                .status(s.getStatus())
                .submittedAt(s.getSubmittedAt())
                .reviewedAt(s.getReviewedAt())
                .reviewedByFacultyName(s.getReviewedBy() != null ? s.getReviewedBy().getUser().getFullName() : null)
                .feedback(s.getFeedback())
                .marks(s.getMarks())
                .maxMarks(s.getMaxMarks())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
