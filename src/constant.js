export const BASE_URL = `http://localhost:8081`;

// Auth Service
export const AUTH_BASE = `${BASE_URL}/authservice/api/auth`;
export const Login_URL = `${AUTH_BASE}/login`;

// Repository Service (Spring Boot Backend)
export const REPO_BASE = `${BASE_URL}/repositoryservice/api`;

// User Endpoints
export const USERS_URL = `${REPO_BASE}/users`;
export const USER_COUNTS_URL = `${USERS_URL}/counts`;
export const USER_AGGREGATE_URL = (id) => `${USERS_URL}/aggregate/${id}`;
export const DELETE_USER_URL = (id) => `${USERS_URL}/${id}`;

// College Endpoints
export const COLLEGES_URL = `${REPO_BASE}/colleges`;
export const COLLEGE_STATS_URL = `${COLLEGES_URL}/stats`;
export const COLLEGE_DETAIL_URL = (id) => `${COLLEGES_URL}/${id}`;
export const DELETE_COLLEGE_URL = (id) => `${COLLEGES_URL}/${id}`;

// Course Endpoints
export const COURSES_URL = `${REPO_BASE}/courses`;
export const ALL_COURSES_URL = `${COURSES_URL}/all`;
export const MY_COURSES_URL = `${COURSES_URL}/my-courses`;
export const ADD_COURSE_URL = `${COURSES_URL}/add`;
export const GET_COURSE_BY_ID = (id) => `${COURSES_URL}/${id}`;
export const MY_COURSE_COUNT_URL = `${COURSES_URL}/my-count`;