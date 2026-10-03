package com.example.digitallab.service;

import com.example.digitallab.dto.DashboardStats;
import com.example.digitallab.dto.StudentResponse;
import com.example.digitallab.entity.AttendanceStatus;
import com.example.digitallab.entity.Student;
import com.example.digitallab.entity.StudentSubject;
import com.example.digitallab.entity.Subject;
import com.example.digitallab.entity.User;
import com.example.digitallab.exception.DuplicateResourceException;
import com.example.digitallab.exception.ResourceNotFoundException;
import com.example.digitallab.repository.AttendanceRepository;
import com.example.digitallab.repository.ExperimentRepository;
import com.example.digitallab.repository.MarkRepository;
import com.example.digitallab.repository.StudentRepository;
import com.example.digitallab.repository.StudentSubjectRepository;
import com.example.digitallab.repository.SubjectRepository;
import com.example.digitallab.repository.SubmissionRepository;
import com.example.digitallab.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final StudentSubjectRepository studentSubjectRepository;
    private final ExperimentRepository experimentRepository;
    private final SubmissionRepository submissionRepository;
    private final AttendanceRepository attendanceRepository;
    private final MarkRepository markRepository;

    @Transactional(readOnly = true)
    public List<StudentResponse> getAllStudents() {
        return studentRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<StudentResponse> getStudentsBySubject(Long subjectId) {
        List<StudentSubject> enrollments = studentSubjectRepository.findBySubjectId(subjectId);
        return enrollments.stream()
                .map(ss -> toResponse(ss.getStudent()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StudentResponse getById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", id));
        return toResponse(student);
    }

    @Transactional(readOnly = true)
    public StudentResponse getByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return toResponse(student);
    }

    @Transactional
    public void enrollInSubject(String email, Long subjectId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", subjectId));

        if (studentSubjectRepository.existsByStudentIdAndSubjectId(student.getId(), subjectId)) {
            throw new DuplicateResourceException("Already enrolled in this subject");
        }

        StudentSubject enrollment = StudentSubject.builder()
                .student(student)
                .subject(subject)
                .build();
        studentSubjectRepository.save(enrollment);
    }

    @Transactional
    public void unenrollFromSubject(String email, Long subjectId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        StudentSubject enrollment = studentSubjectRepository.findByStudentIdAndSubjectId(student.getId(), subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));
        studentSubjectRepository.delete(enrollment);
    }

    @Transactional(readOnly = true)
    public DashboardStats getStudentDashboard(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        long totalExperiments = experimentRepository.findPublishedExperimentsForStudent(student.getId()).size();
        long completed = submissionRepository.countApprovedByStudentId(student.getId());
        long pending = submissionRepository.countPendingByStudentId(student.getId());
        long totalAttendance = attendanceRepository.countByStudentId(student.getId());
        long presentAttendance = attendanceRepository.countByStudentIdAndStatus(student.getId(), AttendanceStatus.PRESENT);
        double attendancePct = totalAttendance > 0 ? (presentAttendance * 100.0 / totalAttendance) : 0;
        Double avgMarks = markRepository.findAveragePercentageByStudentId(student.getId());

        return DashboardStats.builder()
                .totalExperiments(totalExperiments)
                .completedExperiments(completed)
                .pendingSubmissions(pending)
                .attendancePercentage(Math.round(attendancePct * 100.0) / 100.0)
                .averageMarks(avgMarks != null ? Math.round(avgMarks * 100.0) / 100.0 : 0)
                .build();
    }

    @Transactional(readOnly = true)
    public DashboardStats getFacultyDashboard(String email) {
        long totalStudents = studentRepository.count();
        long totalSubjects = subjectRepository.count();
        long totalExperiments = experimentRepository.count();
        long pendingSubmissions = submissionRepository.count();

        return DashboardStats.builder()
                .totalStudents(totalStudents)
                .totalSubjects(totalSubjects)
                .totalExperimentsCreated(totalExperiments)
                .pendingSubmissionsCount(pendingSubmissions)
                .build();
    }

    private StudentResponse toResponse(Student s) {
        long total = experimentRepository.findPublishedExperimentsForStudent(s.getId()).size();
        long completed = submissionRepository.countApprovedByStudentId(s.getId());
        long pending = submissionRepository.countPendingByStudentId(s.getId());
        long totalAtt = attendanceRepository.countByStudentId(s.getId());
        long present = attendanceRepository.countByStudentIdAndStatus(s.getId(), AttendanceStatus.PRESENT);
        double attPct = totalAtt > 0 ? (present * 100.0 / totalAtt) : 0;
        Double avgMarks = markRepository.findAveragePercentageByStudentId(s.getId());

        return StudentResponse.builder()
                .id(s.getId())
                .userId(s.getUser().getId())
                .fullName(s.getUser().getFullName())
                .email(s.getUser().getEmail())
                .registerNumber(s.getRegisterNumber())
                .department(s.getUser().getDepartment())
                .year(s.getYear())
                .section(s.getSection())
                .totalExperiments(total)
                .completedExperiments(completed)
                .pendingSubmissions(pending)
                .attendancePercentage(Math.round(attPct * 100.0) / 100.0)
                .averageMarks(avgMarks != null ? Math.round(avgMarks * 100.0) / 100.0 : 0)
                .build();
    }

    @Transactional
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", id));
        User user = student.getUser();
        studentRepository.delete(student);
        if (user != null) {
            userRepository.delete(user);
        }
    }
}
