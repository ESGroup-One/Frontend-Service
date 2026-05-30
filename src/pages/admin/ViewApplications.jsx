import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { MY_COURSES_URL } from '../../constant';

import styles from './ViewApplications.module.css';

const DEFAULT_COLLEGE_LOGO = '/default_college_logo.png';

const ViewApplicationsPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortOption, setSortOption] = useState('Most recent');

  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setError('');
        const response = await axios.get(MY_COURSES_URL, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching courses", error);
        setError(error.response?.data?.message || 'Unable to load courses.');
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
        sortableCourses.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
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
              Application Postings
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

        {loading && <p className={styles.stateMessage}>Loading courses...</p>}
        {!loading && error && <p className={styles.errorMessage}>{error}</p>}
        {!loading && !error && sortedCourses.length === 0 && (
          <p className={styles.stateMessage}>No courses found for your college.</p>
        )}

        <div className={styles.grid}>
          {sortedCourses.map((course) => (
            <div key={course.id || course._id} className={styles.card}>
              <div className={styles.cardHeader}>
                <img
                  src={course.college?.profileImageUrl || DEFAULT_COLLEGE_LOGO}
                  alt="College logo"
                  className={styles.collegeLogo}
                />
                <span className={styles.cardCollegeName}>
                  {course.college?.collegeName || 'Your College'}
                </span>
              </div>

              <h3 className={styles.courseTitle}>{course.title || 'Untitled Course'}</h3>

              <p className={styles.seatsInfo}>
                {course.gov_seats || 0} Higher Education Grant and {course.self_finance_seats || 0} self financed seats available
              </p>

              <button
                className={styles.applicantBadge}
                onClick={() => handleCardClick(course.id || course._id)}
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
