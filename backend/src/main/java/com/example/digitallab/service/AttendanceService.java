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
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final ExperimentRepository experimentRepository;
    private final FacultyRepository facultyRepository;
    private final UserRepository userRepository;

    @Transactional
    public AttendanceResponse markAttendance(AttendanceRequest request, String facultyEmail) {
        User user = userRepository.findByEmail(facultyEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Faculty faculty = facultyRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", request.getStudentId()));
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject", request.getSubjectId()));

        java.util.Optional<Attendance> existingOpt = attendanceRepository.findByStudentIdAndSubjectIdAndDate(
                student.getId(), subject.getId(), request.getDate());

        Attendance attendance;
        if (existingOpt.isPresent()) {
            attendance = existingOpt.get();
            attendance.setStatus(request.getStatus());
            attendance.setMarkedBy(faculty);
        } else {
            attendance = Attendance.builder()
                    .student(student)
                    .subject(subject)
                    .date(request.getDate())
                    .status(request.getStatus())
                    .markedBy(faculty)
                    .build();
        }

        if (request.getExperimentId() != null) {
            Experiment experiment = experimentRepository.findById(request.getExperimentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Experiment", request.getExperimentId()));
            attendance.setExperiment(experiment);
        } else {
            attendance.setExperiment(null);
        }

        return toResponse(attendanceRepository.save(attendance));
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getStudentAttendance(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return attendanceRepository.findByStudentId(student.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getBySubject(Long subjectId) {
        return attendanceRepository.findBySubjectIdOrdered(subjectId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getFacultyAttendance(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Faculty faculty = facultyRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));
        return attendanceRepository.findForFaculty(faculty.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AttendanceSummary getStudentSummary(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        long total = attendanceRepository.countByStudentId(student.getId());
        long present = attendanceRepository.countByStudentIdAndStatus(student.getId(), AttendanceStatus.PRESENT);
        double percentage = total > 0 ? (present * 100.0 / total) : 0;

        return AttendanceSummary.builder()
                .totalSessions(total)
                .presentSessions(present)
                .absentSessions(total - present)
                .attendancePercentage(Math.round(percentage * 100.0) / 100.0)
                .build();
    }

    @Transactional
    public AttendanceResponse update(Long id, AttendanceRequest request) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance", id));
        attendance.setStatus(request.getStatus());
        if (request.getExperimentId() != null) {
            Experiment experiment = experimentRepository.findById(request.getExperimentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Experiment", request.getExperimentId()));
            attendance.setExperiment(experiment);
        }
        return toResponse(attendanceRepository.save(attendance));
    }

    private AttendanceResponse toResponse(Attendance a) {
        return AttendanceResponse.builder()
                .id(a.getId())
                .studentId(a.getStudent().getId())
                .studentName(a.getStudent().getUser().getFullName())
                .registerNumber(a.getStudent().getRegisterNumber())
                .subjectId(a.getSubject().getId())
                .subjectName(a.getSubject().getSubjectName())
                .experimentId(a.getExperiment() != null ? a.getExperiment().getId() : null)
                .experimentTitle(a.getExperiment() != null ? a.getExperiment().getTitle() : null)
                .date(a.getDate())
                .status(a.getStatus())
                .createdAt(a.getCreatedAt())
                .build();
    }

    @lombok.Builder
    @lombok.Data
    public static class AttendanceSummary {
        private long totalSessions;
        private long presentSessions;
        private long absentSessions;
        private double attendancePercentage;
    }
}
