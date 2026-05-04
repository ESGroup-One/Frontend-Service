import React, { useState, useEffect } from "react";
import styles from "./styles/userHome.module.css";
import { Building2, BookOpen, BarChart3 } from "lucide-react";
import { FaGlobe, FaPhone } from "react-icons/fa";
import { dashboardAPI, collegeAPI } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

export const StatsSection = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalColleges: 0,
    totalCourses: 0,
    aggregatePercentage: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Fetch counts (colleges and courses)
        const countsResponse = await dashboardAPI.getCounts();
        if (countsResponse.success && countsResponse.counts) {
          setStats((prev) => ({
            ...prev,
            totalColleges: countsResponse.counts.colleges || 0,
            totalCourses: countsResponse.counts.courses || 0,
          }));
        }

        const token = localStorage.getItem("authToken");
        const aggregateResponse = await dashboardAPI.getAggregatePercentage(
          token
        );

        if (
          aggregateResponse.success &&
          aggregateResponse.data?.aggregatePercentage !== undefined
        ) {
          setStats((prev) => ({
            ...prev,
            aggregatePercentage: aggregateResponse.data.aggregatePercentage,
          }));
        }

        // console.log("Fetched stats:", stats);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const statsData = [
    {
      icon: <Building2 size={24} />,
      title: "Total College Registered",
      value: loading ? "..." : stats.totalColleges.toString(),
    },
    {
      icon: <BookOpen size={24} />,
      title: "Total Courses Available",
      value: loading ? "..." : stats.totalCourses.toString(),
    },
    {
      icon: <BarChart3 size={24} />,
      title: "Your aggregate percentage",
      value: loading ? "..." : `${stats.aggregatePercentage}%`,
    },
  ];

  return (
    <div className={styles.statsContainer}>
      {statsData.map((item, index) => (
        <div className={styles.statBox} key={index}>
          <div className={styles.statIcon}>{item.icon}</div>
          <div className={styles.statInfo}>
            <p className={styles.statTitle}>{item.title}</p>
            <h3 className={styles.statValue}>{item.value}</h3>
          </div>
          {index !== statsData.length - 1 && (
            <div className={styles.divider}></div>
          )}
        </div>
      ))}
    </div>
  );
};

export const RecommendedCourses = () => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoading(true);
        const response = await collegeAPI.getAll({ page: 1, limit: 4 });
        const collegesData = response?.data?.colleges || [];

        // Map colleges data similar to SuperAdminDashboard
        const mappedColleges = collegesData
          .sort(
            (a, b) =>
              new Date(b.createdAt || b.appliedDate || b._id) -
              new Date(a.createdAt || a.appliedDate || a._id)
          )
          .slice(0, 4)
          .map((college) => ({
            id: college._id,
            name: college.name || "Unknown College",
            logo: college.logo || "",
            adminEmail: college.admin?.email || "",
            contactInfo: college.admin?.contactInfo || "",
            website: college.website || "",
          }));

        setColleges(mappedColleges);
      } catch (error) {
        console.error("Error fetching colleges:", error);
        setColleges([]);
      } finally {
        setLoading(false);
      }
    };

    fetchColleges();
  }, []);

  return (
    <div className={styles.recommendedSection}>
      <h1 className={styles.sectionTitle}>Recently Added Colleges</h1>
      <p className={styles.showingResults}>
        {loading
          ? "Loading..."
          : `Showing ${colleges.length} Recently Added College${
              colleges.length !== 1 ? "s" : ""
            }`}
      </p>

      <div className={styles.courseGrid}>
        {loading ? (
          <div>Loading colleges...</div>
        ) : colleges.length > 0 ? (
          colleges.map((college) => (
            <div key={college.id} className={styles.collegeCard}>
              <div className={styles.collegeCardHeader}>
                {college.logo && (
                  <img
                    src={college.logo}
                    alt={college.name}
                    className={styles.collegeLogo}
                  />
                )}
                <h4 className={styles.collegeName}>{college.name}</h4>
              </div>

              {college.adminEmail && (
                <div
                  className={styles.collegeInfo}
                  style={{
                    fontSize: "14px",
                    color: "#666",
                    marginBottom: "8px",
                  }}
                >
                  <strong>Email:</strong> {college.adminEmail}
                </div>
              )}

              {college.website && (
                <div
                  className={styles.collegeInfo}
                  style={{
                    fontSize: "14px",
                    color: "#666",
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FaGlobe size={14} color="#4640DE" />
                  <a
                    href={college.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#4640DE", textDecoration: "none" }}
                    onMouseEnter={(e) =>
                      (e.target.style.textDecoration = "underline")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.textDecoration = "none")
                    }
                  >
                    {college.website.length > 30
                      ? college.website.substring(0, 30) + "..."
                      : college.website}
                  </a>
                </div>
              )}

              {college.contactInfo && (
                <div
                  className={styles.collegeInfo}
                  style={{
                    fontSize: "14px",
                    color: "#666",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FaPhone size={14} color="#4640DE" />
                  <span>{college.contactInfo}</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div>No colleges available</div>
        )}
      </div>
    </div>
  );
};

function UserHome() {
  return (
    <>
      <StatsSection />
      <RecommendedCourses />
    </>
  );
}

export default UserHome;
