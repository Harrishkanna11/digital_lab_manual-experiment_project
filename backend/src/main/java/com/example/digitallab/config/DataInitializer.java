package com.example.digitallab.config;

import com.example.digitallab.entity.Attendance;
import com.example.digitallab.entity.AttendanceStatus;
import com.example.digitallab.entity.Difficulty;
import com.example.digitallab.entity.Experiment;
import com.example.digitallab.entity.Faculty;
import com.example.digitallab.entity.LabManual;
import com.example.digitallab.entity.Mark;
import com.example.digitallab.entity.Notification;
import com.example.digitallab.entity.Role;
import com.example.digitallab.entity.Student;
import com.example.digitallab.entity.StudentSubject;
import com.example.digitallab.entity.Subject;
import com.example.digitallab.entity.Submission;
import com.example.digitallab.entity.SubmissionStatus;
import com.example.digitallab.entity.User;
import com.example.digitallab.repository.AttendanceRepository;
import com.example.digitallab.repository.ExperimentRepository;
import com.example.digitallab.repository.FacultyRepository;
import com.example.digitallab.repository.LabManualRepository;
import com.example.digitallab.repository.MarkRepository;
import com.example.digitallab.repository.NotificationRepository;
import com.example.digitallab.repository.StudentRepository;
import com.example.digitallab.repository.StudentSubjectRepository;
import com.example.digitallab.repository.SubjectRepository;
import com.example.digitallab.repository.SubmissionRepository;
import com.example.digitallab.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final LabManualRepository labManualRepository;
    private final ExperimentRepository experimentRepository;
    private final StudentSubjectRepository studentSubjectRepository;
    private final SubmissionRepository submissionRepository;
    private final AttendanceRepository attendanceRepository;
    private final MarkRepository markRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Value("${app.seed.demo-data:true}")
    private boolean seedDemoData;

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedDemoData) {
            log.info("Demo data seeding is disabled (app.seed.demo-data=false). Skipping.");
            return;
        }
        if (userRepository.count() > 0) {
            log.info("Database already initialized, skipping seed data.");
            return;
        }

        log.info("Seeding initial data for Digital Lab Management System...");

        // 1. Create Faculty User
        User facultyUser = User.builder()
                .email("faculty@digitallab.edu")
                .password(passwordEncoder.encode("password123"))
                .fullName("Faculty Instructor")
                .department("Computer Science and Engineering")
                .role(Role.FACULTY)
                .active(true)
                .build();
        facultyUser = userRepository.save(facultyUser);

        Faculty faculty = Faculty.builder()
                .user(facultyUser)
                .facultyId("FAC001")
                .designation("Professor & HOD")
                .build();
        faculty = facultyRepository.save(faculty);

        // 2. Create Student User
        User studentUser = User.builder()
                .email("student@digitallab.edu")
                .password(passwordEncoder.encode("password123"))
                .fullName("Student User")
                .department("Computer Science and Engineering")
                .role(Role.STUDENT)
                .active(true)
                .build();
        studentUser = userRepository.save(studentUser);

        Student student = Student.builder()
                .user(studentUser)
                .registerNumber("21CS101")
                .year(3)
                .section("A")
                .build();
        student = studentRepository.save(student);

        // 3. Create Subjects
        Subject sub1 = Subject.builder()
                .subjectName("Data Structures and Algorithms Lab")
                .courseCode("CS301")
                .department("Computer Science and Engineering")
                .year(3)
                .semester(5)
                .academicYear("2024-2025")
                .faculty(faculty)
                .build();
        sub1 = subjectRepository.save(sub1);

        Subject sub2 = Subject.builder()
                .subjectName("Database Management Systems Lab")
                .courseCode("CS302")
                .department("Computer Science and Engineering")
                .year(3)
                .semester(5)
                .academicYear("2024-2025")
                .faculty(faculty)
                .build();
        sub2 = subjectRepository.save(sub2);

        Subject sub3 = Subject.builder()
                .subjectName("Operating Systems Lab")
                .courseCode("CS303")
                .department("Computer Science and Engineering")
                .year(3)
                .semester(5)
                .academicYear("2024-2025")
                .faculty(faculty)
                .build();
        sub3 = subjectRepository.save(sub3);

        // 4. Enroll Student in Subjects
        studentSubjectRepository.save(StudentSubject.builder().student(student).subject(sub1).build());
        studentSubjectRepository.save(StudentSubject.builder().student(student).subject(sub2).build());
        studentSubjectRepository.save(StudentSubject.builder().student(student).subject(sub3).build());

        // 5. Create Lab Manuals
        LabManual manual1 = LabManual.builder()
                .title("CS301 Data Structures Lab Manual")
                .description("Comprehensive laboratory manual covering linear and non-linear data structures, searching, sorting, and graph algorithms.")
                .subject(sub1)
                .academicYear("2024-2025")
                .published(true)
                .build();
        manual1 = labManualRepository.save(manual1);

        LabManual manual2 = LabManual.builder()
                .title("CS302 DBMS Lab Manual")
                .description("Hands-on lab manual covering SQL DDL/DML, Relational Algebra, Joins, Triggers, and Normalization in PostgreSQL.")
                .subject(sub2)
                .academicYear("2024-2025")
                .published(true)
                .build();
        manual2 = labManualRepository.save(manual2);

        // 6. Create Experiments
        Experiment exp1 = Experiment.builder()
                .experimentNumber(1)
                .title("Implementation of Stack using Array")
                .subject(sub1)
                .labManual(manual1)
                .createdBy(faculty)
                .aim("To design, implement and analyze a Stack data structure using static array representation in C++ with push, pop, peek, and display operations.")
                .requirements("G++ / Clang Compiler, C++ Standard Library, Terminal / IDE")
                .theory("A Stack is a linear data structure following the Last In First Out (LIFO) principle. All insertions (push) and deletions (pop) occur at a single end named top.")
                .algorithm("1. Initialize top = -1.\n2. Push(x): If top == MAX-1, return Overflow; else arr[++top] = x.\n3. Pop(): If top == -1, return Underflow; else return arr[top--].\n4. Peek(): If top == -1, return Underflow; else return arr[top].\n5. Display(): Traverse from top down to 0 and print each element.")
                .procedure("1. Define maximum capacity MAX and create class Stack.\n2. Implement methods push(), pop(), peek(), isEmpty(), isFull().\n3. Write a driver program with menu options to test all operations.")
                .sourceCode("#include <iostream>\nusing namespace std;\n#define MAX 5\n\nclass Stack {\n    int top;\n    int arr[MAX];\npublic:\n    Stack() { top = -1; }\n    bool push(int x) {\n        if (top >= MAX - 1) { cout << \"Stack Overflow\\n\"; return false; }\n        arr[++top] = x;\n        return true;\n    }\n    int pop() {\n        if (top < 0) { cout << \"Stack Underflow\\n\"; return -1; }\n        return arr[top--];\n    }\n    int peek() {\n        if (top < 0) { cout << \"Stack is Empty\\n\"; return -1; }\n        return arr[top];\n    }\n};\n\nint main() {\n    Stack s;\n    s.push(10);\n    s.push(20);\n    s.push(30);\n    cout << \"Top Element: \" << s.peek() << endl;\n    cout << \"Popped: \" << s.pop() << endl;\n    return 0;\n}")
                .expectedOutput("Top Element: 30\nPopped: 30")
                .observation("All stack operations executed with O(1) constant time complexity.")
                .result("Stack implementation using static array was successfully verified.")
                .vivaQuestions("1. What are the time complexities of push and pop operations?\n2. What causes stack overflow and how can dynamic sizing prevent it?\n3. List real-world applications of stacks.")
                .difficulty(Difficulty.EASY)
                .deadline(LocalDate.now().plusDays(14))
                .published(true)
                .publishedAt(LocalDateTime.now())
                .build();
        exp1 = experimentRepository.save(exp1);

        Experiment exp2 = Experiment.builder()
                .experimentNumber(2)
                .title("Binary Search Tree Operations & Inorder Traversal")
                .subject(sub1)
                .labManual(manual1)
                .createdBy(faculty)
                .aim("To implement a Binary Search Tree (BST) with insertion, search, and inorder, preorder, postorder traversals.")
                .requirements("Java 17+ or C++ Compiler")
                .theory("A Binary Search Tree is a binary tree where each node has a key greater than all keys in its left subtree and less than all keys in its right subtree.")
                .algorithm("1. Insert(root, key): If root is null, create Node(key).\n2. If key < root.key, root.left = Insert(root.left, key); else root.right = Insert(root.right, key).\n3. Inorder(root): Inorder(root.left) -> Visit(root) -> Inorder(root.right).")
                .procedure("1. Define TreeNode structure.\n2. Implement recursive insertion.\n3. Implement inorder traversal to output keys in sorted order.")
                .sourceCode("public class BST {\n    static class Node {\n        int data; Node left, right;\n        Node(int d) { data = d; }\n    }\n    Node root;\n    void insert(int key) { root = insertRec(root, key); }\n    Node insertRec(Node root, int key) {\n        if (root == null) return new Node(key);\n        if (key < root.data) root.left = insertRec(root.left, key);\n        else if (key > root.data) root.right = insertRec(root.right, key);\n        return root;\n    }\n    void inorder(Node root) {\n        if (root != null) { inorder(root.left); System.out.print(root.data + \" \"); inorder(root.right); }\n    }\n}")
                .expectedOutput("Inorder Traversal: 20 30 40 50 60 70 80")
                .observation("In-order traversal visits nodes in non-decreasing order.")
                .result("Binary Search Tree operations were successfully implemented.")
                .vivaQuestions("1. What is the worst-case search complexity of an unbalanced BST?\n2. How does an AVL tree ensure O(log n) performance?")
                .difficulty(Difficulty.MEDIUM)
                .deadline(LocalDate.now().plusDays(21))
                .published(true)
                .publishedAt(LocalDateTime.now())
                .build();
        experimentRepository.save(exp2);

        Experiment exp3 = Experiment.builder()
                .experimentNumber(1)
                .title("Relational Schema Design & DDL/DML Queries")
                .subject(sub2)
                .labManual(manual2)
                .createdBy(faculty)
                .aim("To design a student information system schema using PostgreSQL DDL statements with primary/foreign keys and execute DML queries.")
                .requirements("PostgreSQL 14+, pgAdmin or psql")
                .theory("Data Definition Language (DDL) creates and modifies table schemas with integrity constraints. Data Manipulation Language (DML) manages table tuples.")
                .algorithm("1. Create Department and Student tables with referential integrity.\n2. Insert valid tuples.\n3. Execute JOIN and GROUP BY queries.")
                .procedure("1. Connect to PostgreSQL database.\n2. Execute CREATE TABLE queries with NOT NULL and FOREIGN KEY constraints.\n3. Verify integrity constraints by attempting invalid foreign key insertions.")
                .sourceCode("CREATE TABLE departments (\n    dept_id SERIAL PRIMARY KEY,\n    dept_name VARCHAR(100) NOT NULL\n);\nCREATE TABLE students (\n    student_id SERIAL PRIMARY KEY,\n    name VARCHAR(100) NOT NULL,\n    dept_id INT REFERENCES departments(dept_id),\n    cgpa NUMERIC(3,2) CHECK (cgpa >= 0.0 AND cgpa <= 10.0)\n);\nINSERT INTO departments (dept_name) VALUES ('CSE'), ('ECE');\nINSERT INTO students (name, dept_id, cgpa) VALUES ('Student A', 1, 9.5), ('Student B', 1, 9.8);\nSELECT s.name, d.dept_name, s.cgpa FROM students s JOIN departments d ON s.dept_id = d.dept_id;")
                .expectedOutput("name         | dept_name | cgpa\n-------------+-----------+-----\nStudent A    | CSE       | 9.50\nStudent B    | CSE       | 9.80")
                .observation("Referential integrity and domain constraints properly enforced.")
                .result("DDL and DML operations executed and validated.")
                .vivaQuestions("1. What is the difference between primary key and unique key?\n2. What is ON DELETE CASCADE?")
                .difficulty(Difficulty.EASY)
                .deadline(LocalDate.now().plusDays(10))
                .published(true)
                .publishedAt(LocalDateTime.now())
                .build();
        experimentRepository.save(exp3);

        // 7. Create a Sample Approved Submission for Exp 1
        Submission submission = Submission.builder()
                .student(student)
                .experiment(exp1)
                .sourceCode(exp1.getSourceCode())
                .observation("Stack operates as expected with O(1) complexity for push and pop.")
                .result("Program compiled without errors and passed all edge cases.")
                .additionalNotes("Included dynamic overflow checking demonstration.")
                .status(SubmissionStatus.APPROVED)
                .submittedAt(LocalDateTime.now().minusDays(2))
                .reviewedAt(LocalDateTime.now().minusDays(1))
                .reviewedBy(faculty)
                .marks(95)
                .maxMarks(100)
                .feedback("Excellent work Ada! Clear code structure and thorough analysis.")
                .build();
        submission = submissionRepository.save(submission);

        // 8. Create Mark Record
        Mark mark = Mark.builder()
                .student(student)
                .experiment(exp1)
                .submission(submission)
                .marksObtained(95)
                .maxMarks(100)
                .feedback("Excellent work Ada! Clear code structure and thorough analysis.")
                .givenBy(faculty)
                .build();
        markRepository.save(mark);

        // 9. Create Attendance Record
        Attendance attendance = Attendance.builder()
                .student(student)
                .subject(sub1)
                .experiment(exp1)
                .date(LocalDate.now().minusDays(2))
                .status(AttendanceStatus.PRESENT)
                .markedBy(faculty)
                .build();
        attendanceRepository.save(attendance);

        // 10. Create Notification
        Notification notification = Notification.builder()
                .student(student)
                .title("Welcome to DLME!")
                .message("Welcome to Digital Lab Manual & Experiment Management System. Your subjects and experiments have been assigned.")
                .type("SYSTEM")
                .read(false)
                .build();
        notificationRepository.save(notification);

        log.info("Initial data successfully seeded.");
        log.info("Faculty credentials: faculty@digitallab.edu / password123");
        log.info("Student credentials: student@digitallab.edu / password123");
    }
}
