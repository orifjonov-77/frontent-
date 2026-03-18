import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// In-memory GET cache (30 sekund)
const apiCache = new Map();
const CACHE_TTL = 30000; // 30 seconds

// Auto-attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Check cache for GET requests
  if (config.method === 'get') {
    const cacheKey = config.url + JSON.stringify(config.params || {});
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      config.adapter = () => Promise.resolve({
        data: cached.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });
    }
  }
  return config;
});

// Handle responses — cache GET, handle 401
api.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (response.config.method === 'get' && response.status === 200) {
      const cacheKey = response.config.url + JSON.stringify(response.config.params || {});
      apiCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
      // Periodically clean expired entries
      if (apiCache.size > 100) {
        const now = Date.now();
        for (const [key, val] of apiCache) {
          if (now - val.timestamp > CACHE_TTL) apiCache.delete(key);
        }
      }
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Cache tozalash funksiyasi (mutation operatsiyalardan keyin chaqirish uchun)
export const clearApiCache = () => apiCache.clear();

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Profile
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.patch('/profile', data),
  courses: () => api.get('/profile/courses'),
};

// Courses
export const coursesAPI = {
  getModules: () => api.get('/courses/modules'),
  getAll: (moduleId) => api.get('/courses/', { params: moduleId ? { module_id: moduleId } : {} }),
  getOne: (id) => api.get(`/courses/${id}`),
  watchVideo: (lessonId) => api.post(`/courses/lessons/${lessonId}/watch`),
  getProgress: (lessonId) => api.get(`/courses/lessons/${lessonId}/progress`),
};

// Tests
export const testsAPI = {
  getForLesson: (lessonId) => api.get(`/tests/lesson/${lessonId}`),
  start: (testId) => api.post(`/tests/${testId}/start`),
  submit: (testId, answers) => api.post(`/tests/${testId}/submit`, { answers }),
  getResult: (testId) => api.get(`/tests/${testId}/result`),
};

// Games
export const gamesAPI = {
  getForLesson: (lessonId) => api.get(`/games/lesson/${lessonId}`),
  start: (gameId) => api.post(`/games/${gameId}/start`),
  submit: (gameId, data) => api.post(`/games/${gameId}/submit`, data),
};

// Homework
export const homeworkAPI = {
  getForLesson: (lessonId) => api.get(`/homework/lesson/${lessonId}`),
  submit: (hwId, data) => api.post(`/homework/${hwId}/submit`, data),
  getStatus: (hwId) => api.get(`/homework/${hwId}/status`),
};

// Exams
export const examsAPI = {
  getForCourse: (courseId) => api.get(`/exams/course/${courseId}`),
  getOne: (examId) => api.get(`/exams/${examId}`),
  start: (examId) => api.post(`/exams/${examId}/start`),
  submit: (examId, answers) => api.post(`/exams/${examId}/submit`, { answers }),
};

// Payments
export const paymentsAPI = {
  getCardInfo: () => api.get('/payments/card-info'),
  submitCheck: (formData) => api.post('/payments/submit-check', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMy: () => api.get('/payments/my'),
};

// Rating
export const ratingAPI = {
  getLeaderboard: () => api.get('/rating/leaderboard'),
  rateTeacher: (rating) => api.post('/rating/teacher', { rating }),
  getTeacherRating: () => api.get('/rating/teacher'),
};

// Admin
export const adminAPI = {
  dashboard: () => api.get('/admin/dashboard'),
  // Students
  getStudents: () => api.get('/admin/students'),
  getStudent: (id) => api.get(`/admin/students/${id}`),
  updateStudent: (id, data) => api.patch(`/admin/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),
  // Select dropdowns
  getModulesSelect: () => api.get('/admin/select/modules'),
  getCoursesSelect: (moduleId) => api.get('/admin/select/courses', { params: moduleId ? { module_id: moduleId } : {} }),
  getLessonsSelect: (courseId) => api.get('/admin/select/lessons', { params: courseId ? { course_id: courseId } : {} }),
  getStudentsSelect: () => api.get('/admin/select/students'),
  // Modules CRUD
  createModule: (data) => api.post('/admin/modules', data),
  updateModule: (id, data) => api.put(`/admin/modules/${id}`, data),
  deleteModule: (id) => api.delete(`/admin/modules/${id}`),
  // Courses CRUD
  createCourse: (data) => api.post('/admin/courses', data),
  updateCourse: (id, data) => api.put(`/admin/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`),
  // Lessons CRUD
  getLessons: (courseId) => api.get('/admin/lessons', { params: courseId ? { course_id: courseId } : {} }),
  createLesson: (data) => api.post('/admin/lessons', data),
  updateLesson: (id, data) => api.put(`/admin/lessons/${id}`, data),
  deleteLesson: (id) => api.delete(`/admin/lessons/${id}`),
  // Tests CRUD
  createTest: (data) => api.post('/admin/tests', data),
  getTest: (id) => api.get(`/admin/tests/${id}`),
  deleteTest: (id) => api.delete(`/admin/tests/${id}`),
  // Homework CRUD
  createHomework: (data) => api.post('/admin/homework', data),
  deleteHomework: (id) => api.delete(`/admin/homework/${id}`),
  getHomeworkSubmissions: () => api.get('/admin/homework/submissions'),
  gradeHomework: (id, data) => api.patch(`/admin/homework/submissions/${id}/grade`, data),
  // Games CRUD
  createGame: (data) => api.post('/admin/games', data),
  deleteGame: (id) => api.delete(`/admin/games/${id}`),
  // Exams CRUD
  createExam: (data) => api.post('/admin/exams', data),
  deleteExam: (id) => api.delete(`/admin/exams/${id}`),
  // Payments
  getPayments: (status) => api.get('/admin/payments', { params: status ? { status } : {} }),
  reviewPayment: (id, data) => api.patch(`/admin/payments/${id}/review`, data),
  // Grant
  grantCourse: (userId, courseId) => api.post(`/admin/grant-course?user_id=${userId}&course_id=${courseId}`),
  // Certificates
  getCertificates: () => api.get('/admin/certificates'),
  sendCertificate: (userId, title, fileUrl, description) => api.post(`/admin/certificates?user_id=${userId}&title=${encodeURIComponent(title)}&file_url=${encodeURIComponent(fileUrl)}&description=${encodeURIComponent(description || '')}`),
  deleteCertificate: (id) => api.delete(`/admin/certificates/${id}`),
};

// Chat
export const chatAPI = {
  send: (data) => api.post('/chat/send', data),
  getMy: () => api.get('/chat/my'),
  getUnread: () => api.get('/chat/unread-count'),
  // Admin
  getConversations: () => api.get('/chat/admin/conversations'),
  getStudentMessages: (studentId) => api.get(`/chat/admin/messages/${studentId}`),
  adminReply: (studentId, data) => api.post(`/chat/admin/reply/${studentId}`, data),
};

// Results
export const resultsAPI = {
  getMy: () => api.get('/results/my'),
};

export default api;

// Student Certificates
export const certificatesAPI = {
  getMy: () => api.get('/certificates/my'),
};
