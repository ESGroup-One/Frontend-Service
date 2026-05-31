import React, { useState, useEffect } from "react";
import styles from "./styles/userHome.module.css";
import { Building2, BookOpen, BarChart3, Award } from "lucide-react";
import { FaGlobe, FaPhone } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

import CourseCard from '../../components/common/CourseCard';

import {
  USER_COUNTS_URL,
  USER_AGGREGATE_URL,
  GET_STUDENT_RECOMMENDATIONS_URL,
  MY_APPLICATIONS_URL,
  PLACEMENT_STATUS_URL
} from "../../constant";

const STATUS_META = {
  pending: { label: "Pending", className: "statusPending" },
  shortlisted: { label: "Shortlisted", className: "statusShortlisted" },
  passed_ctt: { label: "Passed for CTT Test", className: "statusCtt" },
  passed_interview: { label: "Passed for Interview", className: "statusInterview" },
  placed: { label: "Placed", className: "statusPlaced" },
  rejected: { label: "Rejected", className: "statusRejected" },
  closed_candidate_placed_elsewhere: {
    label: "Closed - Candidate Placed Elsewhere",
    className: "statusClosed",
  },
};

const WORKFLOW_STATUSES = [
  "pending",
  "shortlisted",
  "passed_ctt",
  "passed_interview",
  "placed",
];

const normalizeStatus = (status) => {
  if (!status) return "pending";
  const normalized = status.toLowerCase().replaceAll("-", "_").replaceAll(" ", "_");
  if (normalized === "applied") return "pending";
  if (normalized === "passed_for_ctt" || normalized === "passed_for_ctt_test") return "passed_ctt";
  if (normalized === "passed_for_interview") return "passed_interview";
  return STATUS_META[normalized] ? normalized : "pending";
};

const getStatusLabel = (status) => STATUS_META[normalizeStatus(status)]?.label || "Pending";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const StatusBadge = ({ status }) => {
  const normalized = normalizeStatus(status);
  const statusClass = STATUS_META[normalized]?.className || STATUS_META.pending.className;

  return (
    <span className={`${styles.statusBadge} ${styles[statusClass]}`}>
      {getStatusLabel(normalized)}
    </span>
  );
};

const ProgressTracker = ({ status }) => {
  const normalized = normalizeStatus(status);
  const currentIndex = WORKFLOW_STATUSES.indexOf(normalized);

  return (
    <div className={styles.progressTracker}>
      {WORKFLOW_STATUSES.map((stage, index) => {
        const isDone = currentIndex >= index;
        const isActive = currentIndex === index;

        return (
          <div
            key={stage}
            className={`${styles.progressStep} ${isDone ? styles.progressDone : ""} ${isActive ? styles.progressActive : ""}`}
            title={getStatusLabel(stage)}
          >
            <span className={styles.progressDot}></span>
            <span className={styles.progressLabel}>{getStatusLabel(stage)}</span>
          </div>
        );
      })}
    </div>
  );
};

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
        const token = localStorage.getItem("authToken");
        const headers = { Authorization: `Bearer ${token}` };

        const countsRes = await fetch(USER_COUNTS_URL, { headers });
        const countsData = await countsRes.json();

        let aggregateVal = 0;
        if (user?.id) {
          const aggRes = await fetch(USER_AGGREGATE_URL(user.id), { headers });
          const aggData = await aggRes.json();
          aggregateVal = aggData.aggregatePercentage || 0;
        }

        setStats({
          totalColleges: countsData.colleges || 0,
          totalCourses: countsData.courses || 0,
          aggregatePercentage: aggregateVal,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchStats();
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
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        const headers = { Authorization: `Bearer ${token}` };

        if (user?.id) {
          const res = await fetch(GET_STUDENT_RECOMMENDATIONS_URL(user.id), { headers });
          const data = await res.json();
          setRecommendations(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error fetching recommended courses:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchRecommendations();
  }, [user]);

  if (loading) {
    return <div className={styles.loadingText}>Loading recommendations...</div>;
  }

  if (recommendations.length === 0) {
    return (
      <div className={styles.noRecommendations}>
        No recommended courses found based on your eligibility parameters.
      </div>
    );
  }

  return (
    <div className={styles.courseGrid}>
      {recommendations.map((item) => (
        <CourseCard course={item.course} />
      ))}
    </div>
  );
};

export const ApplicationStatusSection = () => {
  const [applications, setApplications] = useState([]);
  const [placementStatus, setPlacementStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplicationStatus = async () => {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: `Bearer ${token}` };

      try {
        setLoading(true);
        const [applicationsRes, placementRes] = await Promise.all([
          fetch(MY_APPLICATIONS_URL, { headers }),
          fetch(PLACEMENT_STATUS_URL, { headers }),
        ]);

        const applicationsData = applicationsRes.ok ? await applicationsRes.json() : [];
        const placementData = placementRes.ok ? await placementRes.json() : null;

        setApplications(Array.isArray(applicationsData) ? applicationsData : []);
        setPlacementStatus(placementData);
      } catch (error) {
        console.error("Error fetching application statuses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationStatus();
  }, []);

  return (
    <div className={styles.applicationStatusSection}>
      <div className={styles.sectionHeaderRow}>
        <div>
          <h1 className={styles.sectionTitle}>My Application Status</h1>
          <p className={styles.sectionSubtitle}>Track your submitted course applications and current placement stage</p>
        </div>
      </div>

      {placementStatus?.isPlaced && (
        <div className={styles.placedNotice}>
          <div className={styles.placedIcon}>
            <Award size={22} />
          </div>
          <div>
            <h3>You have already been placed</h3>
            <p>
              {placementStatus.collegeName && placementStatus.courseTitle
                ? `Placed for ${placementStatus.courseTitle} at ${placementStatus.collegeName}.`
                : placementStatus.message}
              {" "}New course applications are now disabled.
            </p>
          </div>
        </div>
      )}

      {loading && <div className={styles.loadingText}>Loading application statuses...</div>}

      {!loading && applications.length === 0 && (
        <div className={styles.noRecommendations}>No applications submitted yet.</div>
      )}

      {!loading && applications.length > 0 && (
        <div className={styles.applicationList}>
          {applications.map((application) => {
            const status = normalizeStatus(application.currentStatus || application.status);
            const course = application.course || {};
            const college = course.college || {};

            return (
              <div className={styles.applicationCard} key={application.id || application._id}>
                <div className={styles.applicationTopRow}>
                  <div>
                    <h3 className={styles.applicationTitle}>{course.title || "Course Application"}</h3>
                    <p className={styles.applicationCollege}>{college.collegeName || "College"}</p>
                  </div>
                  <StatusBadge status={status} />
                </div>

                <ProgressTracker status={status} />

                <div className={styles.applicationMeta}>
                  <span>Applied: {formatDate(application.submittedAt || application.createdAt)}</span>
                  <span>Type: {application.applicationType === "self-financed" ? "Self Finance" : "High Edu Grant"}</span>
                  <span>Merit: {Number(application.totalMeritScore || 0).toFixed(0)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

function UserHome() {
  return (
    <>
      <StatsSection />
      <ApplicationStatusSection />
      <div className={styles.recommendedSection}>
        <h1 className={styles.sectionTitle}>Recommended Courses</h1>
        <p className={styles.sectionSubtitle}>Top entries mapped to your specific eligibility criteria and merit rules</p>
        <RecommendedCourses />
      </div>
    </>
  );
}

export default UserHome;
