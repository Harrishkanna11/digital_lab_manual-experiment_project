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
public class LabManualService {

    private final LabManualRepository labManualRepository;
    private final SubjectRepository subjectRepository;

    @Transactional
    public LabManualResponse create(LabManualRequest request, String facultyEmail) {
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject", request.getSubjectId()));

        if (labManualRepository.findBySubjectId(request.getSubjectId()).isPresent()) {
            throw new DuplicateResourceException("Lab manual already exists for this subject");
        }

        LabManual manual = LabManual.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .academicYear(request.getAcademicYear())
                .subject(subject)
                .published(request.isPublished())
                .build();

        return toResponse(labManualRepository.save(manual));
    }

    @Transactional(readOnly = true)
    public List<LabManualResponse> getAll() {
        return labManualRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LabManualResponse> getPublished() {
        return labManualRepository.findByPublished(true).stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LabManualResponse getById(Long id) {
        return toResponse(labManualRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lab Manual", id)));
    }

    @Transactional
    public LabManualResponse update(Long id, LabManualRequest request) {
        LabManual manual = labManualRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lab Manual", id));
        manual.setTitle(request.getTitle());
        manual.setDescription(request.getDescription());
        manual.setAcademicYear(request.getAcademicYear());
        return toResponse(labManualRepository.save(manual));
    }

    @Transactional
    public void delete(Long id) {
        LabManual manual = labManualRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lab Manual", id));
        labManualRepository.delete(manual);
    }

    public LabManualResponse toResponse(LabManual m) {
        Subject subject = m.getSubject();
        return LabManualResponse.builder()
                .id(m.getId())
                .title(m.getTitle())
                .description(m.getDescription())
                .academicYear(m.getAcademicYear())
                .published(m.isPublished())
                .publishedAt(m.getPublishedAt())
                .subjectId(subject.getId())
                .subjectName(subject.getSubjectName())
                .courseCode(subject.getCourseCode())
                .department(subject.getDepartment())
                .year(subject.getYear())
                .semester(subject.getSemester())
                .facultyName(subject.getFaculty() != null ? subject.getFaculty().getUser().getFullName() : null)
                .experimentCount(m.getExperiments().size())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
