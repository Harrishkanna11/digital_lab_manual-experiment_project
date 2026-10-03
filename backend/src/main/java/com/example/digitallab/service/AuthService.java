package com.example.digitallab.service;

import com.example.digitallab.dto.AuthResponse;
import com.example.digitallab.dto.FacultyRegisterRequest;
import com.example.digitallab.dto.LoginRequest;
import com.example.digitallab.dto.StudentRegisterRequest;
import com.example.digitallab.entity.Faculty;
import com.example.digitallab.entity.Role;
import com.example.digitallab.entity.Student;
import com.example.digitallab.entity.User;
import com.example.digitallab.exception.DuplicateResourceException;
import com.example.digitallab.exception.ResourceNotFoundException;
import com.example.digitallab.repository.FacultyRepository;
import com.example.digitallab.repository.StudentRepository;
import com.example.digitallab.repository.UserRepository;
import com.example.digitallab.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse registerStudent(StudentRegisterRequest request) {
        String normalizedEmail = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail().trim());
        }
        String cleanRegNo = request.getRegisterNumber() != null ? request.getRegisterNumber().trim() : "";
        if (studentRepository.existsByRegisterNumber(cleanRegNo)) {
            throw new DuplicateResourceException("Register number already exists: " + cleanRegNo);
        }

        User user = User.builder()
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName() != null ? request.getFullName().trim() : "")
                .role(Role.STUDENT)
                .department(request.getDepartment() != null ? request.getDepartment().trim() : "")
                .active(true)
                .build();
        user = userRepository.save(user);

        Student student = Student.builder()
                .user(user)
                .registerNumber(cleanRegNo)
                .year(request.getYear())
                .section(request.getSection() != null ? request.getSection().trim() : "")
                .build();
        studentRepository.save(student);

        String token = tokenProvider.generateToken(user.getEmail());
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(user.getFullName())
                .userId(user.getId())
                .build();
    }

    @Transactional
    public AuthResponse registerFaculty(FacultyRegisterRequest request) {
        String normalizedEmail = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail().trim());
        }
        String cleanFacultyId = request.getFacultyId() != null ? request.getFacultyId().trim() : "";
        if (facultyRepository.existsByFacultyId(cleanFacultyId)) {
            throw new DuplicateResourceException("Faculty ID already exists: " + cleanFacultyId);
        }

        User user = User.builder()
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName() != null ? request.getFullName().trim() : "")
                .role(Role.FACULTY)
                .department(request.getDepartment() != null ? request.getDepartment().trim() : "")
                .active(true)
                .build();
        user = userRepository.save(user);

        Faculty faculty = Faculty.builder()
                .user(user)
                .facultyId(cleanFacultyId)
                .designation(request.getDesignation() != null ? request.getDesignation().trim() : "")
                .build();
        facultyRepository.save(faculty);

        String token = tokenProvider.generateToken(user.getEmail());
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(user.getFullName())
                .userId(user.getId())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException("Invalid email ID or password"));

        if (request.getRole() != null && !request.getRole().isBlank()) {
            if (!user.getRole().name().equalsIgnoreCase(request.getRole().trim())) {
                String portalName = request.getRole().equalsIgnoreCase("STUDENT") ? "Student" : "Faculty";
                String userRole = user.getRole() == Role.STUDENT ? "Student" : "Faculty";
                throw new BadCredentialsException(
                        userRole + " credentials cannot authenticate through the " + portalName + " portal."
                );
            }
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), request.getPassword())
        );

        String token = tokenProvider.generateToken(authentication);
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(user.getFullName())
                .userId(user.getId())
                .build();
    }

    public AuthResponse getCurrentUser(String email) {
        String cleanEmail = email != null ? email.trim() : "";
        User user = userRepository.findByEmailIgnoreCase(cleanEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return AuthResponse.builder()
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(user.getFullName())
                .userId(user.getId())
                .build();
    }
}
