import React, { useState, useEffect } from 'react';
import {
  FaBuilding,
  FaUsers,
  FaBookOpen,
  FaEye,
  FaFileAlt,
  FaGlobe,
  FaPhone
} from 'react-icons/fa';
import './SuperAdminDashboard.css';

import { USER_COUNTS_URL, ALL_COURSES_URL, COLLEGES_URL } from '../../constant'

const SuperAdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalColleges: 0,
    totalCourses: 0,
    totalUsers: 0,
    coursesViews: 0,
    coursesApplied: 0,
    activeCourses: 0
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [recentColleges, setRecentColleges] = useState([]);
  const [chartData, setChartData] = useState([
    { day: 'Mon', views: 0, applied: 0 },
    { day: 'Tue', views: 0, applied: 0 },
    { day: 'Wed', views: 0, applied: 0 },
    { day: 'Thu', views: 0, applied: 0 },
    { day: 'Fri', views: 0, applied: 0 },
    { day: 'Sat', views: 0, applied: 0 },
    { day: 'Sun', views: 0, applied: 0 }
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        // 1. Fetch Global Counts
        const countsRes = await fetch(USER_COUNTS_URL, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const counts = await countsRes.json();
        setStats(prev => ({
          ...prev,
          totalColleges: counts.colleges || 0,
          totalCourses: counts.courses || 0,
          totalUsers: counts.users || 0
        }));

        // 2. Fetch Recent Courses
        const coursesRes = await fetch(ALL_COURSES_URL, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const courses = await coursesRes.json();
        if (Array.isArray(courses)) {
          setRecentCourses(courses.slice(0, 2).map(c => ({
            id: c.id,
            college: c.college?.collegeName || 'N/A',
            title: c.title,
            description: c.description,
            govSeats: c.gov_seats,
            selfFinancedSeats: c.self_finance_seats
          })));
          setStats(prev => ({ ...prev, activeCourses: courses.length }));
        }

        // 3. Fetch Recent Colleges
        const collegesRes = await fetch(COLLEGES_URL, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const colleges = await collegesRes.json();
        if (Array.isArray(colleges)) {
          setRecentColleges(colleges.slice(0, 6).map(col => ({
            id: col.id,
            name: col.collegeName,
            adminName: col.fullName,
            adminEmail: col.email,
            website: col.websiteUrl,
            contactInfo: col.contactInfo
          })));
        }
      } catch (error) {
        console.error('Dashboard Load Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const maxValue = Math.max(...chartData.map(d => d.views + d.applied), 1);

  return (
    <>
      <div className="dashboard-container">

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-label">Total College Registered</div>
              <div className="stat-number">{loading ? '...' : stats.totalColleges}</div>
            </div>
            <div className="stat-icon">
              <FaBuilding />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-label">Total Courses Available</div>
              <div className="stat-number">{loading ? '...' : stats.totalCourses}</div>
            </div>
            <div className="stat-icon">
              <FaBookOpen />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-label">Total Number of Users</div>
              <div className="stat-number">{loading ? '...' : stats.totalUsers}</div>
            </div>
            <div className="stat-icon">
              <FaUsers />
            </div>
          </div>
        </div>

        {/* <div className="middle-section">

          <div className="application-stats-card">
            <div className="card-header">
              <h3 className="card-title">Application</h3>
              <p className="card-subtitle">Showing Application statistics</p>
            </div>
            <div className="bar-chart-container">
              <div className="bar-chart">
                {chartData.map((data, index) => (
                  <div key={index} className="bar-group">
                    <div className="bars">
                      <div
                        className="bar bar-views"
                        style={{ height: `${(data.views / maxValue) * 100}%` }}
                      ></div>
                      <div
                        className="bar bar-applied"
                        style={{ height: `${(data.applied / maxValue) * 100}%` }}
                      ></div>
                    </div>
                    <div className="bar-label">{data.day}</div>
                  </div>
                ))}
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color legend-views"></div>
                  <span>Courses View</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color legend-applied"></div>
                  <span>Courses Applied</span>
                </div>
              </div>
            </div>
          </div>

          <div className="summary-cards-container">
            <div className="date-range">13 August - 30 September</div>
            <div className="summary-cards">
              <div className="summary-card">
                <div className="summary-content">
                  <div className="summary-label">Courses Views</div>
                  <div className="summary-number">{loading ? '...' : stats.coursesViews}</div>
                </div>
                <div className="summary-icon">
                  <FaEye />
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-content">
                  <div className="summary-label">Courses Applied</div>
                  <div className="summary-number">{loading ? '...' : stats.coursesApplied}</div>
                </div>
                <div className="summary-icon">
                  <FaFileAlt />
                </div>
              </div>
            </div>
          </div>

          <div className="cards-column">
            <div className="active-courses-card">
              <h3 className="card-title">Active Courses</h3>
              <div className="active-courses-content">
                <div className="active-number">{loading ? '...' : stats.activeCourses}</div>
                <div className="active-label">Registration Opened</div>
              </div>
            </div>

            <div className="application-type-card">
              <h3 className="card-title">Application Type</h3>
              <div className="application-type-content">
                <div className="type-number-label-wrapper">
                  <div className="type-number">{loading ? '...' : stats.coursesApplied}</div>
                  <div className="type-label">Higher Education Grant</div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: stats.coursesApplied > 0 ? '75%' : '0%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div> */}

        {/* Recently Registered Colleges
        <div className="recent-courses-section">
          <h3 className="section-title">Recently Registered Colleges</h3>
          <div className="recent-courses-grid">
            {loading ? (
              <div>Loading colleges...</div>
            ) : recentColleges.length > 0 ? (
              recentColleges.map((college) => (
                <div key={college.id} className="recent-course-card">
                  <div className="course-card-header">
                    {college.logo && (
                      <img src={college.logo} alt={college.name} className="course-logo" />
                    )}
                    <h4 className="course-college-name">{college.name}</h4>
                  </div>

                  {college.adminName && (
                    <div className="course-seats" style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                      Admin: <b>{college.adminName}</b>
                    </div>
                  )}

                  {college.website && (
                    <div className="course-seats" style={{ fontSize: '14px', color: '#666', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaGlobe size={14} color="#4E296C" />
                      <a
                        href={college.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#4E296C', textDecoration: 'none' }}
                        onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                      >
                        {college.website.length > 30 ? college.website.substring(0, 30) + '...' : college.website}
                      </a>
                    </div>
                  )}

                  {college.contactInfo && (
                    <div className="course-seats" style={{ fontSize: '14px', color: '#666', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaPhone size={14} color="#4E296C" />
                      <span>{college.contactInfo}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div>No colleges registered yet</div>
            )}
          </div>
        </div>

        {recentCourses.length > 0 && (
          <div className="recent-courses-section" style={{ marginTop: '40px' }}>
            <h3 className="section-title">Recently Added Courses</h3>
            <div className="recent-courses-grid">
              {recentCourses.map((course) => (
                <div key={course.id} className="recent-course-card">
                  <div className="course-card-header">
                    {course.logoUrl && (
                      <img src={course.logoUrl} alt={course.college} className="course-logo" />
                    )}
                    <h4 className="course-college-name">{course.college}</h4>
                  </div>
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-description">{course.description}</p>
                  <div className="course-seats">
                    <b>{course.govSeats}</b> Higher Education Grant and <b>{course.selfFinancedSeats}</b> self financed seats available
                  </div>
                </div>
              ))}
            </div>
          </div>
        )} */}
        
      </div>
    </>
  )
}

export default SuperAdminDashboard;
