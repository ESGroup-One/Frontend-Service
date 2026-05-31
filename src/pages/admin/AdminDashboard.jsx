import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaBookOpen,
  FaUsers,
  FaFileAlt,
  FaUserTie,
  FaChartLine,
  FaClock,
  FaCheckCircle
} from "react-icons/fa";
import "../superAdmin/SuperAdminDashboard.css";

import {
  MY_COURSE_COUNT_URL,
  ADMIN_ANALYTICS_URL,
  ADMIN_RECENT_APPLICATIONS_URL
} from "../../constant";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeApplications: 0,
    totalApplications: 0,
    totalPlaced: 0,
    higherEducationGrants: 0,
    selfFinancedApplications: 0,
    activeCourses: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);

  const [chartData, setChartData] = useState([
    { date: "Loading...", grantCount: 0, selfFinanceCount: 0 },
    { date: "Loading...", grantCount: 0, selfFinanceCount: 0 },
    { date: "Loading...", grantCount: 0, selfFinanceCount: 0 },
    { date: "Loading...", grantCount: 0, selfFinanceCount: 0 },
    { date: "Loading...", grantCount: 0, selfFinanceCount: 0 },
    { date: "Loading...", grantCount: 0, selfFinanceCount: 0 },
    { date: "Loading...", grantCount: 0, selfFinanceCount: 0 },
  ]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const config = {
        headers: { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` }
      };

      try {
        const countResponse = await axios.get(MY_COURSE_COUNT_URL, config);
        const countData = countResponse.data;

        if (countData) {
          setStats((prev) => ({
            ...prev,
            totalCourses: countData.totalCourses || 0,
            activeApplications: countData.activeApplications || 0,
            totalApplications: countData.totalApplications || 0,
          }));
        }
      } catch (error) {
        console.error("Error fetching simple course counters:", error?.response?.data || error.message);
      }

      try {
        const analyticsResponse = await axios.get(ADMIN_ANALYTICS_URL, config);
        const analyticsData = analyticsResponse.data;

        if (analyticsData && analyticsData.summary) {
          const summary = analyticsData.summary;
          setStats((prev) => ({
            ...prev,
            totalPlaced: summary.totalPlaced || 0,
            higherEducationGrants: summary.higherEducationGrants || 0,
            selfFinancedApplications: summary.selfFinancedApplications || 0,
            activeCourses: summary.activeCourses || 0,
          }));
        }

        if (analyticsData && Array.isArray(analyticsData.weeklyChart)) {
          setChartData(analyticsData.weeklyChart);
        }
      } catch (error) {
        console.error("Error fetching admin analytical trends:", error?.response?.data || error.message);
      }

      try {
        const response = await axios.get(ADMIN_RECENT_APPLICATIONS_URL, config);
        const applications = Array.isArray(response.data) ? response.data : [];

        const recent = applications.map((app) => {
          const studentObj = app?.student || {};
          const courseObj = app?.course || {};
          const collegeObj = courseObj?.college || {};

          return {
            id: app?.id || Math.random().toString(),
            studentName: studentObj.fullName || "Unknown Student",
            studentIndex: studentObj.indexNumber || "N/A",
            courseName: courseObj.title || "Unknown Course",
            collegeName: collegeObj.collegeName || "N/A",
            status: app?.status || "pending",
            submittedAt: app?.submittedAt || app?.createdAt || new Date().toISOString(),
            meritScore: typeof app?.totalMeritScore === 'number' ? app.totalMeritScore : 0,
            applicationType: app?.applicationType || "N/A"
          };
        });

        setRecentApplications(recent);

      } catch (error) {
        console.error("Error fetching recent applications collection context:", error?.response?.data || error.message);
      }

    } catch (error) {
      console.error("Global Dashboard Data Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return "#f59e0b";
      case "shortlisted":
      case "placed": return "#10b981";
      case "rejected": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return <FaClock />;
      case "shortlisted":
      case "placed": return <FaCheckCircle />;
      default: return <FaFileAlt />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatXAxisLabel = (rawDateString) => {
    if (!rawDateString || rawDateString.includes("Loading")) return rawDateString;
    const parts = rawDateString.split("-");
    if (parts.length !== 3) return rawDateString; // Safe fallback

    const dateObj = new Date(rawDateString);
    if (isNaN(dateObj.getTime())) return rawDateString;

    return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) {
    return <div className="dashboard-loading">Loading administrative parameters...</div>;
  }

  return (
    <>
      <div className="dashboard-container">
        {/* Statistics Cards Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-label">Total Courses Registered</div>
              <div className="stat-number">{stats.totalCourses}</div>
            </div>
            <div className="stat-icon">
              <FaBookOpen />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-label">Active Applications</div>
              <div className="stat-number">{stats.activeApplications}</div>
            </div>
            <div className="stat-icon">
              <FaUserTie />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-label">Total Applications</div>
              <div className="stat-number">{stats.totalApplications}</div>
            </div>
            <div className="stat-icon">
              <FaUsers />
            </div>
          </div>
        </div>

        {/* Charting Workspace Module */}
        <div className="middle-section">
          <div className="application-stats-card">
            <div className="card-header">
              <h3 className="card-title">Application Processing Patterns</h3>
              <p className="card-subtitle">Showing tracking allocations over active timeline blocks</p>
            </div>

            <div className="bar-chart-container">
              <div className="chart-wrapper-with-y-axis">

                {/* Dynamic Step Y-Axis Labels */}
                <div className="y-axis-labels">
                  {yAxisTicks.map((tick, i) => (
                    <span key={i}>{tick}</span>
                  ))}
                </div>

                <div className="chart-and-x-axis-container">
                  {/* Canvas Workspace */}
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
                          {/* Higher Education Grant Bars */}
                          <div
                            className="bar bar-views"
                            style={{ height: `${((data.grantCount || 0) / maxValue) * 100}%` }}
                            title={`Grants: ${data.grantCount}`}
                          ></div>

                          {/* Self-Financed Bars */}
                          <div
                            className="bar bar-applied"
                            style={{ height: `${((data.selfFinanceCount || 0) / maxValue) * 100}%` }}
                            title={`Self-Financed: ${data.selfFinanceCount}`}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* X-Axis Date Timelines Wrapper Row */}
                  <div className="x-axis-labels-row">
                    {chartData.map((data, index) => (
                      <div key={index} className="x-axis-date-label">
                        {formatXAxisLabel(data.date)}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Chart Color Legends */}
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

          {/* Application Summary Metrics Side Panel */}
          <div className="summary-cards-container">
            <div className="summary-cards">
              <div className="summary-card">
                <div className="summary-content">
                  <div className="summary-label">Placed Candidates</div>
                  <div className="summary-number">{stats.totalPlaced}</div>
                </div>
                <div className="summary-icon">
                  <FaCheckCircle />
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-content">
                  <div className="summary-label">Total Applications Evaluated</div>
                  <div className="summary-number">{stats.totalApplications}</div>
                </div>
                <div className="summary-icon">
                  <FaFileAlt />
                </div>
              </div>
            </div>
          </div>

          {/* Categorized Side Column Modules */}
          <div className="cards-column">
            <div className="active-courses-card">
              <h3 className="card-title">Self Financed Registry</h3>
              <div className="active-courses-content">
                <div className="active-number">{stats.selfFinancedApplications}</div>
                <div className="active-label">Submitted Profiles</div>
              </div>
            </div>

            <div className="application-type-card">
              <h3 className="card-title">Higher Education Catalog</h3>
              <div className="application-type-content">
                <div className="type-number-label-wrapper">
                  <div className="type-number">{stats.higherEducationGrants}</div>
                  <div className="type-label">Grant Applications Allocations</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="recent-courses-section">
          <h3 className="section-title">Recently Submitted Applications</h3>
          <div className="recent-courses-grid">
            {recentApplications.length > 0 ? (
              recentApplications.map((application) => (
                <div key={application.id} className="recent-course-card">
                  <div className="course-card-header">
                    <div style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: getStatusColor(application.status),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "20px"
                    }}>
                      {getStatusIcon(application.status)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 className="course-college-name">{application.studentName}</h4>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        Index: {application.studentIndex}
                      </div>
                    </div>
                  </div>
                  <h3 className="course-title">{application.courseName}</h3>
                  <p className="course-description">{application.collegeName}</p>

                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "12px",
                    paddingTop: "12px",
                    borderTop: "1px solid #e5e7eb"
                  }}>
                    <div style={{ fontSize: "13px", color: "#6b7280" }}>
                      {formatDate(application.submittedAt)}
                    </div>
                    <div style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      padding: "4px 8px",
                      color: getStatusColor(application.status),
                      backgroundColor: `${getStatusColor(application.status)}20`,
                      borderRadius: "12px",
                      textTransform: "uppercase"
                    }}>
                      {application.status}
                    </div>
                  </div>
                  <div className="course-seats" style={{ marginTop: "8px" }}>
                    Type: <b>{application.applicationType}</b> • Merit Score: <b>{application.meritScore > 0 ? application.meritScore.toFixed(2) : "0.00"}</b>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: "20px", color: "#6b7280" }}>
                No applications have been submitted for your courses yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;