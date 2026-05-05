import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// layouts
import UserLayout from './layouts/Userlayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import SuperAdminLayout from './layouts/SuperAdminLayout.jsx';

// admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AllCoursesPage from './pages/admin/AllCoursesPage.jsx';
import AddCoursePage from './pages/admin/AddCoursePage.jsx';
import ViewApplicationsPage from './pages/admin/ViewApplications.jsx';
import ViewDetailsPage from './pages/admin/ViewDetailsPage.jsx';
import AdminProfile from './pages/admin/AdminProfile.jsx';

// user
import UserHome from './pages/user/UserHome.jsx';
import ExploreCourses from './pages/user/ExploreCourses.jsx';
import MyProfile from './pages/user/MyProfile.jsx';
import CourseDetail from './pages/user/CourseDetail.jsx';
import ApplicationForm from './pages/user/ApplicationForm.jsx';

// superadmin
import Colleges from './pages/superAdmin/Colleges.jsx';
import Users from './pages/superAdmin/Users.jsx';
import AddCollegePage from './pages/superAdmin/AddCollegePage.jsx';
import SuperAdminDashboard from './pages/superAdmin/SuperAdminDashboard';
import SuperAdminProfile from './pages/superAdmin/SuperAdminProfile.jsx';

// Auth pages
import Signup from './pages/Auth/Signup.jsx';
import Login from './pages/Auth/Login.jsx';
import PrivateRoute from './routes/PrivateRoute';
import ForgotPassword from './pages/Auth/ForgetPassword.jsx';
import SetPassword from './pages/Auth/SetPassword.jsx';




const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/set-password/:token" element={<SetPassword />} />

          {/* User routes (protected) */}
          <Route element={<PrivateRoute allowedRole="student" />}>
            <Route path='/user' element={<UserLayout><UserHome /></UserLayout>} />
            <Route path='/user/explore' element={<UserLayout><ExploreCourses /></UserLayout>} />
            <Route path='/user/profile' element={<UserLayout><MyProfile /></UserLayout>} />
            <Route path='/user/courses/:courseId' element={<UserLayout><CourseDetail /></UserLayout>} />
            <Route path='/user/courses/:courseId/apply' element={<UserLayout><ApplicationForm /></UserLayout>} />
          </Route>

          {/* Admin routes (protected) */}
          <Route element={<PrivateRoute allowedRole="admin" />}>
            <Route path='/admin' element={<AdminLayout><AdminDashboard /></AdminLayout>} />
            <Route path='/admin/courses' element={<AdminLayout><AllCoursesPage /></AdminLayout>} />
            <Route path='/admin/courses/add' element={<AdminLayout><AddCoursePage /></AdminLayout>} />
            <Route path='/admin/applications' element={<AdminLayout><ViewApplicationsPage /></AdminLayout>} />
            <Route path='/admin/applications/:courseId' element={<AdminLayout><ViewDetailsPage /></AdminLayout>} />
            <Route path='/admin/profile' element={<AdminLayout><AdminProfile /></AdminLayout>} />

          </Route>

          {/* Super admin routes (protected) */}
          <Route element={<PrivateRoute allowedRole="superadmin" />}>
            <Route path='/superadmin' element={<SuperAdminLayout><SuperAdminDashboard /></SuperAdminLayout>} />
            <Route path='/superadmin/colleges' element={<SuperAdminLayout><Colleges /></SuperAdminLayout>} />
            <Route path='/superadmin/AddCollegePage' element={<SuperAdminLayout><AddCollegePage /></SuperAdminLayout>} />
            <Route path='/superadmin/users' element={<SuperAdminLayout><Users /></SuperAdminLayout>} />
            <Route path='/superadmin/profile' element={<SuperAdminLayout><SuperAdminProfile/></SuperAdminLayout>} />
          </Route>

          {/* Fallback: redirect unknown paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
