package com.example.digitallab.service;

import com.example.digitallab.dto.*;
import com.example.digitallab.entity.*;
import com.example.digitallab.exception.*;
import com.example.digitallab.repository.*;
import com.example.digitallab.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
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
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }
        if (studentRepository.existsByRegisterNumber(request.getRegisterNumber())) {
            throw new DuplicateResourceException("Register number already exists: " + request.getRegisterNumber());
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(Role.STUDENT)
                .department(request.getDepartment())
                .build();
        user = userRepository.save(user);

        Student student = Student.builder()
                .user(user)
                .registerNumber(request.getRegisterNumber())
                .year(request.getYear())
                .section(request.getSection())
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
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }
        if (facultyRepository.existsByFacultyId(request.getFacultyId())) {
            throw new DuplicateResourceException("Faculty ID already exists: " + request.getFacultyId());
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(Role.FACULTY)
                .department(request.getDepartment())
                .build();
        user = userRepository.save(user);

        Faculty faculty = Faculty.builder()
                .user(user)
                .facultyId(request.getFacultyId())
                .designation(request.getDesignation())
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
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

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
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return AuthResponse.builder()
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(user.getFullName())
                .userId(user.getId())
                .build();
    }
}
