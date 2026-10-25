import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'https://backend-5nr3.onrender.com'
);

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// In-memory GET cache (60 sekund — tezlik uchun)
const apiCache = new Map();
const CACHE_TTL = 60000;

// Auto-attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
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

// Handle responses
api.interceptors.response.use(
  (response) => {
    if (response.config.method === 'get' && response.status === 200) {
      const cacheKey = response.config.url + JSON.stringify(response.config.params || {});
      apiCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
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
    const isAuthRequest = error.config?.url?.includes('/auth/');
    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const clearApiCache = () => apiCache.clear();

// Auth
export const authAPI = {
  requestCode: (data) => api.post('/auth/request-code', data),
  verifyCode: (data) => api.post('/auth/verify-code', data),
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Profile
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.patch('/profile', data),
  courses: () => api.get('/profile/my-courses'),
  activity: () => api.get('/profile/activity'),
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
  forceSubmit: (testId, answers) => api.post(`/tests/${testId}/force-submit`, { answers }),
  getResult: (testId) => api.get(`/tests/${testId}/result`),
};

// Homework
export const homeworkAPI = {
  getForLesson: (lessonId) => api.get(`/homework/lesson/${lessonId}`),
  submit: (hwId, data) => {
    // Support FormData for file upload
    if (data instanceof FormData) {
      return api.post(`/homework/${hwId}/submit`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    // Legacy: JSON body (convert to FormData)
    const fd = new FormData();
    if (data.answer_text) fd.append('answer_text', data.answer_text);
    if (data.file_url) fd.append('file_url', data.file_url);
    return api.post(`/homework/${hwId}/submit`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadFile: (hwId, file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post(`/homework/${hwId}/upload`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getStatus: (hwId) => api.get(`/homework/${hwId}/status`, { params: { _t: Date.now() } }),
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
  getStudents: () => api.get('/admin/students'),
  getStudent: (id) => api.get(`/admin/students/${id}`),
  updateStudent: (id, data) => api.patch(`/admin/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),
  getModulesSelect: () => api.get('/admin/select/modules'),
  getCoursesSelect: (moduleId) => api.get('/admin/select/courses', { params: moduleId ? { module_id: moduleId } : {} }),
  getLessonsSelect: (courseId) => api.get('/admin/select/lessons', { params: courseId ? { course_id: courseId } : {} }),
  getStudentsSelect: () => api.get('/admin/select/students'),
  createModule: (data) => api.post('/admin/modules', data),
  updateModule: (id, data) => api.put(`/admin/modules/${id}`, data),
  deleteModule: (id) => api.delete(`/admin/modules/${id}`),
  createCourse: (data) => api.post('/admin/courses', data),
  updateCourse: (id, data) => api.put(`/admin/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`),
  getLessons: (courseId) => api.get('/admin/lessons', { params: courseId ? { course_id: courseId } : {} }),
  createLesson: (data) => api.post('/admin/lessons', data),
  updateLesson: (id, data) => api.put(`/admin/lessons/${id}`, data),
  deleteLesson: (id) => api.delete(`/admin/lessons/${id}`),
  createTest: (data) => api.post('/admin/tests', data),
  getTest: (id) => api.get(`/admin/tests/${id}`),
  deleteTest: (id) => api.delete(`/admin/tests/${id}`),
  createHomework: (data) => api.post('/admin/homework', data),
  deleteHomework: (id) => api.delete(`/admin/homework/${id}`),
  getHomeworkSubmissions: () => api.get('/admin/homework/submissions'),
  gradeHomework: (id, data) => api.patch(`/admin/homework/submissions/${id}/grade`, data),
  createExam: (data) => api.post('/admin/exams', data),
  deleteExam: (id) => api.delete(`/admin/exams/${id}`),
  getPayments: (status) => api.get('/admin/payments', { params: { ...(status ? { status } : {}), _t: Date.now() } }),
  reviewPayment: (id, data) => api.patch(`/admin/payments/${id}/review`, data),
  grantCourse: (userId, courseId) => api.post(`/admin/grant-course?user_id=${userId}&course_id=${courseId}`),
  getCertificates: () => api.get('/admin/certificates'),
  sendCertificate: (userId, title, fileUrl, description) => api.post(`/admin/certificates?user_id=${userId}&title=${encodeURIComponent(title)}&file_url=${encodeURIComponent(fileUrl)}&description=${encodeURIComponent(description || '')}`),
  deleteCertificate: (id) => api.delete(`/admin/certificates/${id}`),
  updateTest: (id, data) => api.put(`/admin/tests/${id}`, data),
  deleteTestByLesson: (lessonId) => api.delete(`/admin/tests/by-lesson/${lessonId}`),
};

// Chat (no cache — must always show fresh messages)
export const chatAPI = {
  send: (data) => api.post('/chat/send', data),
  getMy: () => api.get('/chat/my', { params: { _t: Date.now() } }),
  getUnread: () => api.get('/chat/unread-count', { params: { _t: Date.now() } }),
  getConversations: () => api.get('/chat/admin/conversations', { params: { _t: Date.now() } }),
  getStudentMessages: (studentId) => api.get(`/chat/admin/messages/${studentId}`, { params: { _t: Date.now() } }),
  adminReply: (studentId, data) => api.post(`/chat/admin/reply/${studentId}`, data),
};

// Results
export const resultsAPI = {
  getMy: () => api.get('/results/my'),
};

// Rating bonus
export const bonusAPI = {
  getWeekly: () => api.get('/rating/weekly-bonus'),
  useBonus: (lessonId) => api.post('/rating/use-bonus', { lesson_id: lessonId }),
};

// Student Certificates
export const certificatesAPI = {
  getMy: () => api.get('/certificates/my'),
};

export default api;
