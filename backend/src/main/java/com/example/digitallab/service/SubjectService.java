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
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final FacultyRepository facultyRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    @Transactional
    public SubjectResponse create(SubjectRequest request, String facultyEmail) {
        if (subjectRepository.existsByCourseCode(request.getCourseCode())) {
            throw new DuplicateResourceException("Course code already exists: " + request.getCourseCode());
        }

        User user = userRepository.findByEmail(facultyEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Faculty faculty = facultyRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));

        Subject subject = Subject.builder()
                .subjectName(request.getSubjectName())
                .courseCode(request.getCourseCode())
                .department(request.getDepartment())
                .year(request.getYear())
                .semester(request.getSemester())
                .academicYear(request.getAcademicYear())
                .faculty(faculty)
                .build();

        return toResponse(subjectRepository.save(subject));
    }

    @Transactional(readOnly = true)
    public List<SubjectResponse> getAll() {
        return subjectRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SubjectResponse> getForFaculty(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Faculty faculty = facultyRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));
        List<SubjectResponse> list = subjectRepository.findByFacultyId(faculty.getId()).stream()
                .map(this::toResponse).collect(Collectors.toList());
        return list.isEmpty() ? getAll() : list;
    }

    @Transactional(readOnly = true)
    public List<SubjectResponse> getForStudent(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Student student = findStudentByUserId(user.getId());
        return subjectRepository.findByStudentId(student.getId()).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SubjectResponse getById(Long id) {
        return toResponse(subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", id)));
    }

    @Transactional
    public SubjectResponse update(Long id, SubjectRequest request, String facultyEmail) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", id));

        subject.setSubjectName(request.getSubjectName());
        subject.setCourseCode(request.getCourseCode());
        subject.setDepartment(request.getDepartment());
        subject.setYear(request.getYear());
        subject.setSemester(request.getSemester());
        subject.setAcademicYear(request.getAcademicYear());

        return toResponse(subjectRepository.save(subject));
    }

    @Transactional
    public void delete(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", id));
        subjectRepository.delete(subject);
    }

    @Transactional
    public void enrollStudent(Long subjectId, Long studentId) {
        // Used internally by student enrollment logic
    }

    private Student findStudentByUserId(Long userId) {
        return studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for user id: " + userId));
    }

    public SubjectResponse toResponse(Subject subject) {
        return SubjectResponse.builder()
                .id(subject.getId())
                .subjectName(subject.getSubjectName())
                .courseCode(subject.getCourseCode())
                .department(subject.getDepartment())
                .year(subject.getYear())
                .semester(subject.getSemester())
                .academicYear(subject.getAcademicYear())
                .facultyName(subject.getFaculty() != null ? subject.getFaculty().getUser().getFullName() : null)
                .facultyId(subject.getFaculty() != null ? subject.getFaculty().getId() : null)
                .hasLabManual(subject.getLabManual() != null)
                .createdAt(subject.getCreatedAt())
                .build();
    }
}
