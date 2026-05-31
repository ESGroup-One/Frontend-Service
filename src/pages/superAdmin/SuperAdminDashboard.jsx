import React, { useState, useEffect } from 'react';
import {
  FaBuilding,
  FaUsers,
  FaBookOpen,
  FaFileAlt,
  FaGlobe,
  FaPhone
} from 'react-icons/fa';
import './SuperAdminDashboard.css';

import { USER_COUNTS_URL, ALL_COURSES_URL, COLLEGES_URL, SUPERADMIN_ANALYTICS_URL } from '../../constant';

const SuperAdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalColleges: 0,
    totalCourses: 0,
    totalUsers: 0,
    coursesViews: 0,
    coursesApplied: 0,
    activeCourses: 0,
    higherEducationGrants: 0
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [recentColleges, setRecentColleges] = useState([]);

  // Updated initial structure to expect rolling 'date' keys
  const [chartData, setChartData] = useState([
    { date: 'Loading...', grantCount: 0, selfFinanceCount: 0 },
    { date: 'Loading...', grantCount: 0, selfFinanceCount: 0 },
    { date: 'Loading...', grantCount: 0, selfFinanceCount: 0 },
    { date: 'Loading...', grantCount: 0, selfFinanceCount: 0 },
    { date: 'Loading...', grantCount: 0, selfFinanceCount: 0 },
    { date: 'Loading...', grantCount: 0, selfFinanceCount: 0 },
    { date: 'Loading...', grantCount: 0, selfFinanceCount: 0 }
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

        const analyticsRes = await fetch(SUPERADMIN_ANALYTICS_URL, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const analyticsData = await analyticsRes.json();

        if (analyticsData && analyticsData.summary) {
          setStats(prev => ({
            ...prev,
            coursesViews: analyticsData.summary.totalPlaced,
            coursesApplied: analyticsData.summary.totalApplications,
            higherEducationGrants: analyticsData.summary.higherEducationGrants,
            selfFinanced: analyticsData.summary.selfFinancedApplications
          }));
        }

        if (analyticsData && Array.isArray(analyticsData.weeklyChart)) {
          setChartData(analyticsData.weeklyChart);
        }

      } catch (error) {
        console.error('Dashboard Load Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const staticTicks = [20, 15, 10, 5, 0];

  const realMaxVal = Math.max(
    ...chartData.map(d => Math.max(d.grantCount || 0, d.selfFinanceCount || 0)),
    0
  );

  const maxValue = realMaxVal > 20 ? Math.ceil(realMaxVal / 5) * 5 : 20;

  const yAxisTicks = maxValue > 20
    ? Array.from({ length: (maxValue / 5) + 1 }, (_, i) => maxValue - (i * 5))
    : staticTicks;

  if (loading) {
    return <div className="dashboard-loading">Loading system records...</div>;
  }

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
              <div className="chart-wrapper-with-y-axis">

                {/* Fixed Dynamic Step Y-Axis Labels */}
                <div className="y-axis-labels">
                  {yAxisTicks.map((tick, i) => (
                    <span key={i}>{tick}</span>
                  ))}
                </div>

                <div className="chart-and-x-axis-container">
                  {/* Chart Plot Workspace Canvas */}
                  <div className="bar-chart">

                    {/* Synchronized Background Horizontal Gridlines */}
                    <div className="chart-grid-lines">
                      {yAxisTicks.map((_, i) => (
                        <div
                          key={i}
                          className={`grid-line ${i === yAxisTicks.length - 1 ? 'base-line' : ''}`}
                        ></div>
                      ))}
                    </div>

                    {/* Chart Bars Render Loop */}
                    {chartData.map((data, index) => (
                      <div key={index} className="bar-group">
                        <div className="bars">
                          <div
                            className="bar bar-views"
                            style={{ height: `${((data.grantCount || 0) / maxValue) * 100}%` }}
                            title={`Grants: ${data.grantCount}`}
                          >
                            {/* {data.grantCount > 0 && (
                              <span className="bar-tooltip-val">{data.grantCount}</span>
                            )} */}
                          </div>
                          <div
                            className="bar bar-applied"
                            style={{ height: `${((data.selfFinanceCount || 0) / maxValue) * 100}%` }}
                            title={`Self-Financed: ${data.selfFinanceCount}`}
                          >
                            {/* {data.selfFinanceCount > 0 && (
                              <span className="bar-tooltip-val">{data.selfFinanceCount}</span>
                            )} */}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Clean Downsized X-Axis Timelines Wrapper Row */}
                  <div className="x-axis-labels-row">
                    {chartData.map((data, index) => (
                      <div key={index} className="x-axis-date-label">
                        {data.date}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Chart Color Legends Info */}
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color legend-views"></div>
                  <span>Higher Grant Applications</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color legend-applied"></div>
                  <span>Self-Financed Applications</span>
                </div>
              </div>
            </div>
          </div>

          <div className="summary-cards-container">
            {/* <div className="date-range">Recent Activity Range</div> */}
            <div className="summary-cards">
              <div className="summary-card">
                <div className="summary-content">
                  <div className="summary-label">Placed Candidates</div>
                  <div className="summary-number">{loading ? '...' : stats.coursesViews}</div>
                </div>
                <div className="summary-icon">
                  <FaUsers />
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-content">
                  <div className="summary-label">Total Applications</div>
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
              <h3 className="card-title">Application Count</h3>
              <div className="active-courses-content">
                <div className="active-number">{loading ? '...' : stats.selfFinanced}</div>
                <div className="active-label">Self Financed</div>
              </div>
            </div>

            <div className="application-type-card">
              <h3 className="card-title">Application Count</h3>
              <div className="application-type-content">
                <div className="type-number-label-wrapper">
                  <div className="type-number">{loading ? '...' : (stats.higherEducationGrants || 0)}</div>
                  <div className="type-label">Higher Education Grant</div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
        )}

      </div>
    </>
  );
};

export default SuperAdminDashboard;