import React, { useState, useEffect, useMemo } from 'react';
import CourseCard from '../../components/common/CourseCard';
import styles from './styles/allCourses.module.css';

import { ALL_COURSES_URL } from '../../constant';

const ExploreCourses = () => {
    const [allCourses, setAllCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortOption, setSortOption] = useState('Most recent');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                // Using the constant from your constant.js
                const response = await fetch(ALL_COURSES_URL);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setAllCourses(data);
                setError(null);
            } catch (err) {
                console.error("Fetch Error:", err);
                setError("Failed to fetch courses. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    };

    const sortedCourses = useMemo(() => {
        let sortableCourses = [...allCourses];

        switch (sortOption) {
            case 'Course Title (A-Z)':
                sortableCourses.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'College (A-Z)':
                sortableCourses.sort((a, b) => a.college.localeCompare(b.college));
                break;
            case 'Most recent':
                sortableCourses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            default:
                break;
        }

        return sortableCourses;
    }, [allCourses, sortOption]);

    if (loading) {
        return <div className={styles.allCoursesContainer}>Loading courses...</div>;
    }

    if (error) {
        return <div className={styles.allCoursesContainer} style={{ color: 'red' }}>{error}</div>;
    }

    return (
        <div className={styles.allCoursesContainer}>
            <div className={styles.headerBar}>
                <div className={styles.titleGroup}>
                    <h1 className={styles.pageTitle}>All Courses</h1>
                    <p className={styles.resultsCount}>Showing {allCourses.length} results</p>
                </div>

                <div className={styles.sortControl}>
                    <label htmlFor="sort" className={styles.sortLabel}>Sort by:</label>
                    <select
                        id="sort"
                        className={styles.sortDropdown}
                        value={sortOption}
                        onChange={handleSortChange}
                        style={{
                            outline: 'none',
                            border: 'none'
                        }}
                    >
                        <option value="Most recent">Most recent</option>
                        <option value="Course Title (A-Z)">Course Title (A-Z)</option>
                        <option value="College (A-Z)">College (A-Z)</option>
                    </select>
                </div>
            </div>

            <div className={styles.courseGrid}>
                {sortedCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                ))}
            </div>
        </div>
    );
};

export default ExploreCourses;