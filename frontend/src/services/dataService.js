import API from './api';

export const authService = {
  registerStudent: (data) => API.post('/auth/register/student', data),
  registerFaculty: (data) => API.post('/auth/register/faculty', data),
  login: (data) => API.post('/auth/login', data),
  getCurrentUser: () => API.get('/auth/me'),
};

export const subjectService = {
  getAll: () => API.get('/subjects'),
  getForFaculty: () => API.get('/subjects/faculty'),
  getForStudent: () => API.get('/subjects/student'),
  getById: (id) => API.get(`/subjects/${id}`),
  create: (data) => API.post('/subjects', data),
  update: (id, data) => API.put(`/subjects/${id}`, data),
  delete: (id) => API.delete(`/subjects/${id}`),
  enroll: (subjectId) => API.post(`/subjects/${subjectId}/enroll`),
  unenroll: (subjectId) => API.delete(`/subjects/${subjectId}/unenroll`),
  assignStudents: (subjectId, studentIds) => API.post(`/subjects/${subjectId}/assign-students`, { studentIds }),
  unassignStudent: (subjectId, studentId) => API.delete(`/subjects/${subjectId}/assign/${studentId}`),
  getSubjectStudents: (subjectId) => API.get(`/subjects/${subjectId}/students`),
};

export const labManualService = {
  getAll: () => API.get('/lab-manuals'),
  getPublished: () => API.get('/lab-manuals?publishedOnly=true'),
  getById: (id) => API.get(`/lab-manuals/${id}`),
  create: (data) => API.post('/lab-manuals', data),
  update: (id, data) => API.put(`/lab-manuals/${id}`, data),
  delete: (id) => API.delete(`/lab-manuals/${id}`),
};

export const experimentService = {
  getAll: () => API.get('/experiments'),
  getPublished: () => API.get('/experiments/published'),
  getForStudent: (search) => API.get('/experiments/student', { params: search ? { search } : {} }),
  getForFaculty: () => API.get('/experiments/faculty'),
  getById: (id) => API.get(`/experiments/${id}`),
  create: (data) => API.post('/experiments', data),
  update: (id, data) => API.put(`/experiments/${id}`, data),
  publish: (id) => API.put(`/experiments/${id}/publish`),
  unpublish: (id) => API.put(`/experiments/${id}/unpublish`),
  delete: (id) => API.delete(`/experiments/${id}`),
};

export const submissionService = {
  submit: (data) => API.post('/submissions', data),
  getStudentSubmissions: () => API.get('/submissions/student'),
  getFacultySubmissions: () => API.get('/submissions/faculty'),
  getById: (id) => API.get(`/submissions/${id}`),
  review: (id, data) => API.put(`/submissions/${id}/review`, data),
};

export const attendanceService = {
  mark: (data) => API.post('/attendance', data),
  getStudentAttendance: () => API.get('/attendance/student'),
  getStudentSummary: () => API.get('/attendance/student/summary'),
  getStudentSubjectSummary: () => API.get('/attendance/student/subject-summary'),
  getForFaculty: () => API.get('/attendance/faculty'),
  getBySubject: (subjectId) => API.get(`/attendance/subject/${subjectId}`),
  getBySubjectAndDate: (subjectId, date) => API.get(`/attendance/subject/${subjectId}/date/${date}`),
  update: (id, data) => API.put(`/attendance/${id}`, data),
  markBulk: (records) => Promise.all(records.map(r => API.post('/attendance', r))),
};

export const markService = {
  give: (data) => API.post('/marks', data),
  getStudentMarks: () => API.get('/marks/student'),
  getByExperiment: (experimentId) => API.get(`/marks/experiment/${experimentId}`),
  getBySubject: (subjectId) => API.get(`/marks/subject/${subjectId}`),
};

export const studentService = {
  getAll: () => API.get('/students'),
  getById: (id) => API.get(`/students/${id}`),
  getBySubject: (subjectId) => API.get(`/students/subject/${subjectId}`),
  getProfile: () => API.get('/students/me'),
  getDashboard: () => API.get('/students/me/dashboard'),
  getFacultyDashboard: () => API.get('/students/faculty/dashboard'),
  delete: (id) => API.delete(`/students/${id}`),
};

export const notificationService = {
  getAll: () => API.get('/notifications'),
  getUnreadCount: () => API.get('/notifications/unread-count'),
  markAsRead: (id) => API.put(`/notifications/${id}/read`),
  markAllAsRead: () => API.put('/notifications/read-all'),
};

export const bookmarkService = {
  getAll: () => API.get('/bookmarks'),
  add: (experimentId) => API.post(`/bookmarks/${experimentId}`),
  remove: (experimentId) => API.delete(`/bookmarks/${experimentId}`),
};

export const fileService = {
  upload: (submissionId, file, category) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    return API.post(`/files/upload/${submissionId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
