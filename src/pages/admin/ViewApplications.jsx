import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';


import styles from './ViewApplications.module.css';

const API_URL = 'http://localhost:8000/api/courses';

const ViewApplicationsPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState('Most recent');

  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        const response = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCardClick = (courseId) => {
    navigate(`/admin/applications/${courseId}`);
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  const sortedCourses = useMemo(() => {
    let sortableCourses = [...courses];

    switch (sortOption) {
      case 'Course Title (A-Z)':
        sortableCourses.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'Most recent':
        sortableCourses.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      default:
        break;
    }

    return sortableCourses;
  }, [courses, sortOption]);


  return (
    <>    
      <div className={styles.container}>
        <div className={styles.subHeader}>
          <div>
            <h2 className={styles.pageTitle}>
              All Courses Available
            </h2>
            <p className={styles.resultCount}>Showing {sortedCourses.length} results</p>
          </div>
          
          <div className={styles.sortSection}>
              <label htmlFor="sort" className={styles.sortLabel}>Sort by:</label>
              <select
                  id="sort"
                  className={styles.sortSelect}
                  value={sortOption}
                  onChange={handleSortChange}
              >
                  <option value="Most recent">Most recent</option>
                  <option value="Course Title (A-Z)">Course Title (A-Z)</option>
              </select>
          </div>
        </div>

        <div className={styles.grid}>
          {sortedCourses.map((course) => (
            <div key={course._id} className={styles.card}>
              <div className={styles.cardHeader}>
                <img 
                  src={course.createdBy.image}
                  alt="Logo" 
                  className={styles.collegeLogo} 
                />
                <span className={styles.cardCollegeName}>{course.college}</span>
              </div>
              
              <h3 className={styles.courseTitle}>{course.title}</h3>
              
              <p className={styles.seatsInfo}>
                {course.gov_seats} Higher Education Grant and {course.self_finance_seats} self financed seats available
              </p>

              <button 
                className={styles.applicantBadge}
                onClick={() => handleCardClick(course._id)}
              >
                View Applicants
              </button>
            </div>
          ))}
        </div>

        <div className={styles.pagination}>
          <button className={styles.pageBtn}><ChevronLeft size={16}/></button>
          <button className={`${styles.pageBtn} ${styles.activePage}`}>1</button>
          <button className={styles.pageBtn}>2</button>
          <button className={styles.pageBtn}>...</button>
          <button className={styles.pageBtn}>10</button>
          <button className={styles.pageBtn}><ChevronRight size={16}/></button>
        </div>
      </div>
    </>
  );
};

export default ViewApplicationsPage;