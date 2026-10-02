package com.example.digitallab.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FacultyRegisterRequest {
    @NotBlank
    private String fullName;
    @NotBlank
    private String facultyId;
    @Email @NotBlank
    private String email;
    @NotBlank
    private String password;
    @NotBlank
    private String department;
    @NotBlank
    private String designation;
}
