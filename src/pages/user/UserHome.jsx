import React, { useState, useEffect } from "react";
import styles from "./styles/userHome.module.css";
import { Building2, BookOpen, BarChart3, Award } from "lucide-react";
import { FaGlobe, FaPhone } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

import CourseCard from '../../components/common/CourseCard';

import {
  USER_COUNTS_URL,
  USER_AGGREGATE_URL,
  GET_STUDENT_RECOMMENDATIONS_URL
} from "../../constant";

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

function UserHome() {
  return (
    <>
      <StatsSection />
      <div className={styles.recommendedSection}>
        <h1 className={styles.sectionTitle}>Recommended Courses</h1>
        <p className={styles.sectionSubtitle}>Top entries mapped to your specific eligibility criteria and merit rules</p>
        <RecommendedCourses />
      </div>
    </>
  );
}

export default UserHome;
