import axios from 'axios';

export const BASE_URL = `https://145d-220-158-237-109.ngrok-free.app`;
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';

// Auth Service
export const AUTH_BASE = `${BASE_URL}/authservice/api/auth`;
export const Login_URL = `${AUTH_BASE}/login`;
export const FORGOT_PASSWORD_SEND_OTP_URL = `${AUTH_BASE}/forgot-password/send-otp`;
export const FORGOT_PASSWORD_VERIFY_OTP_URL = `${AUTH_BASE}/forgot-password/verify-otp`;
export const FORGOT_PASSWORD_SET_NEW_URL = (token) =>
  `${AUTH_BASE}/forgot-password/set-new-password/${token}`;

// Repository Service (Spring Boot Backend)
export const REPO_BASE = `${BASE_URL}/repositoryservice/api`;

// User Endpoints
export const USERS_URL = `${REPO_BASE}/users`;
export const USER_COUNTS_URL = `${USERS_URL}/counts`;
export const USER_AGGREGATE_URL = (id) => `${USERS_URL}/aggregate/${id}`;
export const DELETE_USER_URL = (id) => `${USERS_URL}/${id}`;
export const REGISTER_INITIATE_URL = (indexNumber) => `${AUTH_BASE}/register/initiate/${indexNumber}`;
export const REGISTER_COMPLETE_URL = `${AUTH_BASE}/register/complete`;
export const UPLOAD_PROFILE_IMAGE_URL = (id) => `${USERS_URL}/${id}/upload-image`;
export const SET_ADMIN_PASSWORD_URL = `${AUTH_BASE}/register/set-password`;

// College Endpoints
export const COLLEGES_URL = `${REPO_BASE}/colleges`;
export const COLLEGE_STATS_URL = `${COLLEGES_URL}/stats`;
export const COLLEGE_DETAIL_URL = (id) => `${COLLEGES_URL}/${id}`;
export const DELETE_COLLEGE_URL = (id) => `${COLLEGES_URL}/${id}`;
export const REGISTER_ADMIN_URL = `${AUTH_BASE}/register/admin`;

// Course Endpoints
export const COURSES_URL = `${REPO_BASE}/courses`;
export const ALL_COURSES_URL = `${COURSES_URL}/all`;
export const MY_COURSES_URL = `${COURSES_URL}/my-courses`;
export const ADD_COURSE_URL = `${COURSES_URL}/add`;
export const GET_COURSE_BY_ID = (id) => `${COURSES_URL}/${id}`;
export const MY_COURSE_COUNT_URL = `${COURSES_URL}/my-count`;

// Recommendation Endpoints
export const RECOMMENDATIONS_BASE = `${REPO_BASE}/recommendations`;
export const GET_STUDENT_RECOMMENDATIONS_URL = (studentId) => `${RECOMMENDATIONS_BASE}/student/${studentId}`;

// Analysis 
export const SUPERADMIN_ANALYTICS_URL = `${REPO_BASE}/analytics/superadmin`;
export const ADMIN_ANALYTICS_URL = `${REPO_BASE}/analytics/admin`;
export const ADMIN_RECENT_APPLICATIONS_URL = `${REPO_BASE}/analytics/admin/recent-applications`;

// Placement Service
export const PLACEMENT_BASE = `${BASE_URL}/placementservice/api/applications`;
export const CHECK_ELIGIBILITY_URL = (courseId) => `${PLACEMENT_BASE}/check-eligibility/${courseId}`;
export const SUBMIT_APPLICATION_URL = (courseId) => `${PLACEMENT_BASE}/apply/${courseId}`;
export const GET_COURSE_APPLICATIONS_URL = (courseId) => `${PLACEMENT_BASE}/course/${courseId}`;
export const MY_APPLICATIONS_URL = `${PLACEMENT_BASE}/my`;
export const PLACEMENT_STATUS_URL = `${PLACEMENT_BASE}/placement-status`;
export const APPLICATION_STATUS_HISTORY_URL = (applicationId) => `${PLACEMENT_BASE}/${applicationId}/history`;
export const UPDATE_APPLICATION_STATUS_URL = (applicationId) => `${PLACEMENT_BASE}/${applicationId}/status`;


