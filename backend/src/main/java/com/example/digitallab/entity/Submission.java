package com.example.digitallab.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "submissions",
    uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "experiment_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "experiment_id", nullable = false)
    private Experiment experiment;

    @Column(columnDefinition = "TEXT")
    private String sourceCode;

    @Column(columnDefinition = "TEXT")
    private String observation;

    @Column(columnDefinition = "TEXT")
    private String result;

    @Column(columnDefinition = "TEXT")
    private String additionalNotes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SubmissionStatus status = SubmissionStatus.SUBMITTED;

    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;

    // Faculty review fields
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_faculty_id")
    private Faculty reviewedBy;

    private String feedback;
    private Integer marks;
    private Integer maxMarks;

    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SubmissionFile> files = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
