import React, { useState, useEffect } from 'react';
import {
  FaBuilding,
  FaUsers,
  FaBookOpen,
  FaEye,
  FaFileAlt,
  FaGlobe,
  FaPhone
} from 'react-icons/fa'
import './SuperAdminDashboard.css'
import { dashboardAPI, courseAPI, collegeAPI } from '../../utils/api'

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
        
        const countsResponse = await dashboardAPI.getCounts();
        if (countsResponse.success && countsResponse.counts) {
          setStats(prev => ({
            ...prev,
            totalColleges: countsResponse.counts.colleges || 0,
            totalCourses: countsResponse.counts.courses || 0,
            totalUsers: countsResponse.counts.users || 0
          }));
        }

        const appStatsResponse = await dashboardAPI.getApplicationStats();
        if (appStatsResponse.success && appStatsResponse.data) {
          setStats(prev => ({
            ...prev,
            coursesApplied: appStatsResponse.data.total || 0,
            coursesViews: appStatsResponse.data.total || 0
          }));
        }

        try {
          const dailyStatsResponse = await dashboardAPI.getDailyStats();
          if (dailyStatsResponse && dailyStatsResponse.success && dailyStatsResponse.data) {
            const dayOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const orderedData = dayOrder.map(day => {
              const dayData = dailyStatsResponse.data.find(d => d.day === day);
              return dayData || { day, views: 0, applied: 0 };
            });
            setChartData(orderedData);
          }
        } catch (error) {
          console.error('Error fetching daily stats:', error);
        }

        try {
          const coursesResponse = await courseAPI.getAll();
          const courses = Array.isArray(coursesResponse) ? coursesResponse : [];
          
          const recent = courses
            .sort((a, b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id))
            .slice(0, 2)
            .map(course => ({
              id: course._id,
              college: course.college || 'Unknown College',
              title: course.title || 'Untitled Course',
              description: course.description ? 
                (course.description.length > 100 ? course.description.substring(0, 100) + '...' : course.description) 
                : 'No description available',
              logoUrl: null,
              govSeats: course.gov_seats || 0,
              selfFinancedSeats: course.self_finance_seats || 0
            }));
          
          setRecentCourses(recent);
          setStats(prev => ({
            ...prev,
            activeCourses: courses.length || 0
          }));
        } catch (error) {
          console.error('Error fetching courses:', error);
        }

        try {
          const collegesResponse = await collegeAPI.getAll({ page: 1, limit: 6 });
          const colleges = collegesResponse?.data?.colleges || [];
          
          const recent = colleges
            .sort((a, b) => new Date(b.createdAt || b.appliedDate || b._id) - new Date(a.createdAt || a.appliedDate || a._id))
            .slice(0, 6)
            .map(college => ({
              id: college._id,
              name: college.name || 'Unknown College',
              logo: college.logo || '',
              adminName: college.admin?.name || '',
              adminEmail: college.admin?.email || '',
              website: college.website || '',
              contactInfo: college.admin?.contactInfo || ''
            }));
          
          setRecentColleges(recent);
        } catch (error) {
          console.error('Error fetching colleges:', error);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
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

        <div className="middle-section">

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
        </div>

        {/* Recently Registered Colleges */}
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

                  {/* Removed courseName + courseDescription */}

                  {college.adminName && (
                    <div className="course-seats" style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                      Admin: <b>{college.adminName}</b>
                    </div>
                  )}

                  {college.website && (
                    <div className="course-seats" style={{ fontSize: '14px', color: '#666', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaGlobe size={14} color="#4640DE" />
                      <a 
                        href={college.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#4640DE', textDecoration: 'none' }}
                        onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                      >
                        {college.website.length > 30 ? college.website.substring(0, 30) + '...' : college.website}
                      </a>
                    </div>
                  )}

                  {college.contactInfo && (
                    <div className="course-seats" style={{ fontSize: '14px', color: '#666', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaPhone size={14} color="#4640DE" />
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

        {/* Recently Added Courses */}
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
        )}
      </div>
    </>
  )
}

export default SuperAdminDashboard;
