import { useState, useEffect } from "react";
import axios from "axios";
import { FaBuilding, FaUsers, FaBookOpen, FaEye, FaFileAlt, FaUserTie, FaChartLine, FaClock, FaCheckCircle } from "react-icons/fa";
import "../superAdmin/SuperAdminDashboard.css";

import {
  MY_COURSE_COUNT_URL,
  REPO_BASE,
} from "../../constant";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeRegistrations: 0,
    totalApplicants: 0,
    coursesViews: 0,
    coursesApplied: 0,
    activeCourses: 0,
  })
  const [recentApplications, setRecentApplications] = useState([])
  const [chartData, setChartData] = useState([
    { day: "Mon", views: 0, applied: 0 },
    { day: "Tue", views: 0, applied: 0 },
    { day: "Wed", views: 0, applied: 0 },
    { day: "Thu", views: 0, applied: 0 },
    { day: "Fri", views: 0, applied: 0 },
    { day: "Sat", views: 0, applied: 0 },
    { day: "Sun", views: 0, applied: 0 },
  ])
  const [hoveredPieSection, setHoveredPieSection] = useState("active")
  const [userAnalytics, setUserAnalytics] = useState({ inactive: 0, active: 0 })

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('authToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // 1. Fetch My Course Count (Using the new update)
      try {
        const countResponse = await axios.get(MY_COURSE_COUNT_URL, config);
        const count = countResponse.data;

        console.log(countResponse)

        setStats((prev) => ({
          ...prev,
          totalCourses: count || 0,
          activeCourses: count || 0, // Assuming all created courses are active for now
        }))
      } catch (error) {
        console.error("Error fetching my course count:", error);
      }

      // // 2. Fetch application stats (Simplified example using axios and your REPO_BASE)
      // // Note: You'll need to ensure your backend has these endpoints or keep your existing fetch logic
      // try {
      //   const appStatsResponse = await axios.get(`${REPO_BASE}/applications/stats`, config);
      //   if (appStatsResponse.data) {
      //     const data = appStatsResponse.data;
      //     setStats((prev) => ({
      //       ...prev,
      //       totalApplicants: data.total || 0,
      //       activeRegistrations: (data.pending || 0) + (data.approved || 0),
      //     }));
      //   }
      // } catch (e) { console.error("App stats error", e); }

      // // 3. Fetch recent applications
      // try {
      //   const response = await axios.get(`${REPO_BASE}/applications`, config);
      //   const applications = response.data?.data || [];

      //   const recent = applications
      //     .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      //     .slice(0, 6)
      //     .map((app) => ({
      //       id: app._id,
      //       studentName: app.student?.fullName || "Unknown",
      //       studentIndex: app.student?.indexNumber || "",
      //       courseName: app.course?.title || "Unknown",
      //       collegeName: app.course?.college?.collegeName || "",
      //       status: app.status || "pending",
      //       submittedAt: app.createdAt,
      //       meritScore: app.totalMeritScore || 0,
      //       applicationType: app.applicationType
      //     }));

      //   setRecentApplications(recent);
      // } catch (error) {
      //   console.error("Error fetching applications:", error);
      // }

    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const maxValue = Math.max(...chartData.map((d) => d.views + d.applied), 1)

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f59e0b"
      case "shortlisted":
        return "#10b981"
      case "rejected":
        return "#ef4444"
      default:
        return "#6b7280"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FaClock />
      case "shortlisted":
        return <FaCheckCircle />
      case "rejected":
        return <FaFileAlt />
      default:
        return <FaFileAlt />
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <>
      <div className="dashboard-container">
        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-label">Total Courses Registered</div>
              <div className="stat-number">{loading ? "..." : stats.totalCourses}</div>
            </div>
            <div className="stat-icon">
              <FaBookOpen />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-label">Total Number of Active Registration</div>
              <div className="stat-number">{loading ? "..." : stats.activeRegistrations}</div>
            </div>
            <div className="stat-icon">
              <FaUserTie />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-label">Total Number of Applicants</div>
              <div className="stat-number">{loading ? "..." : stats.totalApplicants}</div>
            </div>
            <div className="stat-icon">
              <FaUsers />
            </div>
          </div>
        </div>

        {/* Middle Section */}
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
                      <div className="bar bar-views" style={{ height: `${(data.views / maxValue) * 100}%` }}></div>
                      <div className="bar bar-applied" style={{ height: `${(data.applied / maxValue) * 100}%` }}></div>
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
        </div> */}

        {/* Application Summary Cards */}
        {/* <div className="summary-cards-container">
          <div className="date-range">13 August - 30 September</div>
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-content">
                <div className="summary-label">Courses Views</div>
                <div className="summary-number">{loading ? "..." : stats.coursesViews}</div>
              </div>
              <div className="summary-icon">
                <FaEye />
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-content">
                <div className="summary-label">Courses Applied</div>
                <div className="summary-number">{loading ? "..." : stats.coursesApplied}</div>
              </div>
              <div className="summary-icon">
                <FaFileAlt />
              </div>
            </div>
          </div>
        </div> */}

        {/* Cards Column - Active Courses and Application Type stacked */}
        {/* <div className="cards-column">
          <div className="active-courses-card">
            <h3 className="card-title">Active Courses</h3>
            <div className="active-courses-content">
              <div className="active-number">{loading ? "..." : stats.activeCourses}</div>
              <div className="active-label">Registration Opened</div>
            </div>
          </div>

          <div className="application-type-card">
            <h3 className="card-title">Application Type</h3>
            <div className="application-type-content">
              <div className="type-number-label-wrapper">
                <div className="type-number">{loading ? "..." : stats.coursesApplied}</div>
                <div className="type-label">Higher Education Grant</div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: stats.coursesApplied > 0 ? "75%" : "0%" }}></div>
              </div>
              <div className="pie-label">{hoveredPieSection === "inactive" ? "Inactive" : "Active"}</div>
            </div>
          </div>
          <div className="pie-legend">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: "#10b981" }}></div>
              <span>Inactive ({userAnalytics.inactive} users)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: "#3b82f6" }}></div>
              <span>Active ({userAnalytics.active} users)</span>
            </div>
          </div>
        </div> */}

        {/* Recently Submitted Applications */}
        {/* <div className="recent-courses-section">
          <h3 className="section-title">Recently Submitted Applications</h3>
          <div className="recent-courses-grid">
            {loading ? (
              <div>Loading applications...</div>
            ) : recentApplications.length > 0 ? (
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
                      color: getStatusColor(application.status),
                      // FIX 5: String concatenation for the background color with opacity
                      backgroundColor: `${getStatusColor(application.status)}20`,
                      borderRadius: "12px"
                    }}>
                      {application.status}
                    </div>
                  </div>
                  <div className="course-seats" style={{ marginTop: "8px" }}>
                    Type: <b>{application.applicationType}</b> • Merit Score: <b>{application.meritScore.toFixed(2)}</b>
                  </div>
                </div>
              ))
            ) : (
              <div>No applications submitted yet</div>
            )}
          </div>
        </div> */}
      </div>

      {/* <div className="dashboard-actions">
        <button className="refresh-button" onClick={fetchDashboardData} disabled={loading}>
          <FaChartLine />
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div> */}
    </>
  )
}

export default AdminDashboard