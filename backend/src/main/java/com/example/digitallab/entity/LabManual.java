package com.example.digitallab.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lab_manuals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabManual {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String academicYear;

    @Builder.Default
    private boolean published = false;
    private LocalDateTime publishedAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false, unique = true)
    private Subject subject;

    @OneToMany(mappedBy = "labManual", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Experiment> experiments = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
