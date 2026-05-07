import React, { useState, useEffect } from "react";
import styles from "./styles/userHome.module.css";
import { Building2, BookOpen, BarChart3 } from "lucide-react";
import { FaGlobe, FaPhone } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

import {
  USER_COUNTS_URL,
  USER_AGGREGATE_URL,
  COLLEGES_URL
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

// export const RecommendedCourses = () => {
//   const [colleges, setColleges] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchColleges = async () => {
//       try {
//         setLoading(true);
//         const response = await collegeAPI.getAll({ page: 1, limit: 4 });
//         const collegesData = response?.data?.colleges || [];

//         // Map colleges data similar to SuperAdminDashboard
//         const mappedColleges = collegesData
//           .sort(
//             (a, b) =>
//               new Date(b.createdAt || b.appliedDate || b._id) -
//               new Date(a.createdAt || a.appliedDate || a._id)
//           )
//           .slice(0, 4)
//           .map((college) => ({
//             id: college._id,
//             name: college.name || "Unknown College",
//             logo: college.logo || "",
//             adminEmail: college.admin?.email || "",
//             contactInfo: college.admin?.contactInfo || "",
//             website: college.website || "",
//           }));

//         setColleges(mappedColleges);
//       } catch (error) {
//         console.error("Error fetching colleges:", error);
//         setColleges([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchColleges();
//   }, []);

//   return (
//     <div className={styles.recommendedSection}>
//       <h1 className={styles.sectionTitle}>Recently Added Colleges</h1>
//       <p className={styles.showingResults}>
//         {loading
//           ? "Loading..."
//           : `Showing ${colleges.length} Recently Added College${colleges.length !== 1 ? "s" : ""
//           }`}
//       </p>

//       <div className={styles.courseGrid}>
//         {loading ? (
//           <div>Loading colleges...</div>
//         ) : colleges.length > 0 ? (
//           colleges.map((college) => (
//             <div key={college.id} className={styles.collegeCard}>
//               <div className={styles.collegeCardHeader}>
//                 {college.logo && (
//                   <img
//                     src={college.logo}
//                     alt={college.name}
//                     className={styles.collegeLogo}
//                   />
//                 )}
//                 <h4 className={styles.collegeName}>{college.name}</h4>
//               </div>

//               {college.adminEmail && (
//                 <div
//                   className={styles.collegeInfo}
//                   style={{
//                     fontSize: "14px",
//                     color: "#666",
//                     marginBottom: "8px",
//                   }}
//                 >
//                   <strong>Email:</strong> {college.adminEmail}
//                 </div>
//               )}

//               {college.website && (
//                 <div
//                   className={styles.collegeInfo}
//                   style={{
//                     fontSize: "14px",
//                     color: "#666",
//                     marginBottom: "8px",
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "8px",
//                   }}
//                 >
//                   <FaGlobe size={14} color="#4E296C" />
//                   <a
//                     href={college.website}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     style={{ color: "#4E296C", textDecoration: "none" }}
//                     onMouseEnter={(e) =>
//                       (e.target.style.textDecoration = "underline")
//                     }
//                     onMouseLeave={(e) =>
//                       (e.target.style.textDecoration = "none")
//                     }
//                   >
//                     {college.website.length > 30
//                       ? college.website.substring(0, 30) + "..."
//                       : college.website}
//                   </a>
//                 </div>
//               )}

//               {college.contactInfo && (
//                 <div
//                   className={styles.collegeInfo}
//                   style={{
//                     fontSize: "14px",
//                     color: "#666",
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "8px",
//                   }}
//                 >
//                   <FaPhone size={14} color="#4E296C" />
//                   <span>{college.contactInfo}</span>
//                 </div>
//               )}
//             </div>
//           ))
//         ) : (
//           <div>No colleges available</div>
//         )}
//       </div>
//     </div>
//   );
// };

function UserHome() {
  return (
    <>
      <StatsSection />
      <div className={styles.recommendedSection}>
        <h1 className={styles.sectionTitle}>Recommended Courses</h1>
      </div>
      {/* <RecommendedCourses /> */}
    </>
  );
}

export default UserHome;
