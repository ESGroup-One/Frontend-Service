import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate} from 'react-router-dom';
import axios from 'axios';
import CourseCard from '../../components/common/CourseCard';
import { Plus, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'; // Added Chevrons
import styles from './AllCoursesPage.module.css';

import { MY_COURSES_URL } from '../../constant';

const AllCoursesPage = () => {
    const navigate = useNavigate();
    
    const [courses, setCourses] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortOption, setSortOption] = useState('Most recent');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const token = localStorage.getItem("authToken");

                if (!token) {
                    setError("No authentication token found. Please login.");
                    setIsLoading(false);
                    return;
                }

                const response = await axios.get(MY_COURSES_URL, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                setCourses(response.data);
                console.log(response.data)
                setIsLoading(false);
            } catch (err) {
                console.error("Error fetching courses:", err);
                const errorMsg = err.response?.data?.message || err.message;
                setError(`Failed to fetch courses: ${errorMsg}`);
                setIsLoading(false);
            }
        };

        fetchCourses();
    }, []);

    //added new constant for sort filter
    useEffect(() => {
        setCurrentPage(1);
    }, [sortOption]);

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

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCourses = sortedCourses.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedCourses.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Optional: Scroll to top on change
    };

    const handleCourseClick = (course) => {
        navigate(`/admin/courses/${course.id}`);
    };

    // --- Loading State ---
    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader2 className={styles.spinner} size={48} />
                <p>Loading your courses...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <AlertCircle size={48} color="#ef4444" />
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className={styles.retryButton}>
                    Retry
                </button>
            </div>
        );
    }

    // Success State
    return (
        <div className={styles.pageContainer}>
            <div className={styles.filterBar}>
                <div className={styles.coursesInfo}>
                    <h2>All Courses</h2>
                    {/* Updated count to show range */}
                    <p className={styles.resultsCount}>
                        Showing {sortedCourses.length} results
                    </p>
                    <Link to="/admin/courses/add" className={styles.addButton}>
                        <Plus size={18} /> Add New Course
                    </Link>
                </div>

                <div className={styles.sortControl}>
                    <label htmlFor="sort" className={styles.sortLabel}>Sort by:</label>
                    <select
                        id="sort"
                        className={styles.sortDropdown}
                        value={sortOption}
                        onChange={handleSortChange}
                    >
                        <option value="Most recent">Most recent</option>
                        <option value="Course Title (A-Z)">Course Title (A-Z)</option>
                    </select>
                </div>

            </div>

            {sortedCourses.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No courses found. Click "Add New Course" to create one.</p>
                </div>
            ) : (
                <>
                    {/* Render sliced currentCourses instead of sortedCourses */}
                    <div className={styles.coursesGrid}>
                        {currentCourses.map((course) => (
                            <CourseCard key={course.id} course={course} onClick={handleCourseClick} />
                        ))}
                    </div>
                </>
            )}
            <div className={styles.pagination}>
                <button className={styles.pageBtn}><ChevronLeft size={16} /></button>
                <button className={`${styles.pageBtn} ${styles.activePage}`}>1</button>
                <button className={styles.pageBtn}>2</button>
                <button className={styles.pageBtn}>...</button>
                <button className={styles.pageBtn}>10</button>
                <button className={styles.pageBtn}><ChevronRight size={16} /></button>
            </div>
        </div>
    );
};

export default AllCoursesPage;