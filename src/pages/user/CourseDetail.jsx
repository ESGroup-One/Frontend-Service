import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './styles/courseDetail.module.css';

import {
    GET_COURSE_BY_ID,
    CHECK_ELIGIBILITY_URL,
} from '../../constant';

const formatBackendCriteria = (criteriaObject) => {
    if (!criteriaObject || typeof criteriaObject !== 'object') return [];

    return Object.keys(criteriaObject).map(key => {
        const value = criteriaObject[key];
        if (typeof value === 'number' && key !== 'Overall_Aggregate') {
            return `${key} x ${value}`;
        }
        if (typeof value === 'number') {
            return `Minimum ${value}% in ${key}`;
        }
        return `${key}: ${value}`;
    });
};

const formatDate = (isoDateString) => {
    if (!isoDateString) return 'N/A';
    try {
        const date = new Date(isoDateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
        return 'N/A';
    }
};

const CheckCircleIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.iconCheck}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const PlusCircleIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.iconPlus}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
    </svg>
);

const SectionTitle = ({ children }) => (
    <h2 className={styles.sectionTitle}>{children}</h2>
);

const SeatAvailability = ({ govSeats, selfFinancedSeats }) => {
    const totalSeats = (govSeats || 0) + (selfFinancedSeats || 0);
    const govPercentage = totalSeats > 0 ? (govSeats / totalSeats) * 100 : 0;

    return (
        <div className={styles.seatAvailabilityDetails}>
            <p className={styles.seatText}>
                <strong>{govSeats || 0}</strong> Higher Education Grant and <strong>{selfFinancedSeats || 0}</strong> self financed
            </p>
            <div className={styles.progressBarContainer}>
                <div className={styles.govSeatsBar} style={{ width: `${govPercentage}%` }} />
            </div>
        </div>
    );
};

const CourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isEligible, setIsEligible] = useState(false);
    const [eligibleData, setEligibleData] = useState();
    const [eligibilityMessage, setEligibilityMessage] = useState('Checking eligibility...');
    const [eligibilityLoading, setEligibilityLoading] = useState(true);

    useEffect(() => {
        const fetchCourseAndEligibility = async () => {
            setLoading(true);
            setEligibilityLoading(true);
            const token = localStorage.getItem('authToken');

            try {
                const courseResponse = await fetch(GET_COURSE_BY_ID(courseId));
                if (!courseResponse.ok) throw new Error("Course not found");
                const courseData = await courseResponse.json();

                const formattedData = {
                    ...courseData,
                    // Map backend merit_ranking to UI meritRanking
                    meritRanking: Object.entries(courseData.merit_ranking || {}).map(
                        ([subject, weight]) => `${subject} (x${weight})`
                    ),
                    // Ensure dates are formatted correctly
                    applicationDates: {
                        applyBefore: formatDate(courseData.applyBefore),
                        postedOn: formatDate(courseData.createdAt) // or courseData.postedOn
                    },
                    // Use fallback for seats if keys differ (e.g., gov_seats vs govSeats)
                    govSeats: courseData.govSeats || courseData.gov_seats || 0,
                    selfFinancedSeats: courseData.selfFinancedSeats || courseData.self_finance_seats || 0
                };

                setData(formattedData);

                if (token) {
                    const eligibilityResponse = await fetch(CHECK_ELIGIBILITY_URL(courseId), {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    const result = await eligibilityResponse.json();
                    setEligibleData(result);

                    if (eligibilityResponse.ok) {
                        setIsEligible(result.isEligible);
                        setEligibilityMessage(result.reasons?.join(' ') || result.message);
                    } else {
                        setIsEligible(false);
                        setEligibilityMessage(result.message || "Eligibility check failed.");
                    }
                } else {
                    setEligibilityMessage("Please login to check eligibility.");
                }

            } catch (err) {
                console.error("Fetch Error:", err);
                setError("Course details could not be loaded.");
            } finally {
                setLoading(false);
                setEligibilityLoading(false);
            }
        };

        fetchCourseAndEligibility();
    }, [courseId]);

    const handleApply = () => {
        if (!isEligible) return;
        localStorage.setItem('applicationPreviewData', JSON.stringify(eligibleData));
        navigate(`/user/courses/${courseId}/apply`)
    };

    if (loading) return <div className={styles.courseDetailPage}><div className={styles.courseContainer}><h1>Loading...</h1></div></div>;
    if (error || !data) return <div className={styles.courseDetailPage}><div className={styles.courseContainer}><h1>Error</h1><p>{error}</p></div></div>;

    return (
        <div className={styles.courseDetailPage}>
            <div className={styles.courseContainer}>
                {/* Header Section - Fixed Image Access */}
                <div className={styles.headerSection}>
                    <div className={styles.headerContent}>
                        <img
                            src={data.logoUrl}
                            alt={`${data.collegeName} Logo`}
                            className={styles.collegeLogo}
                        />
                        <div className={styles.collegeInfo}>
                            <h1 className={styles.collegeName}>{data.collegeName}</h1>
                            <p className={styles.courseTitle}>{data.title}</p>
                        </div>
                    </div>
                </div>

                <div className={styles.twoColumnLayout}>
                    <div className={styles.leftColumn}>
                        <div className={styles.contentSection}>
                            <SectionTitle>Description</SectionTitle>
                            <p className={styles.descriptionText}>{data.fullDescription}</p>
                        </div>

                        <div className={styles.contentSection}>
                            <SectionTitle>Eligibility Criteria</SectionTitle>
                            <ul className={styles.criteriaList}>
                                {Array.isArray(data.eligibility) ?
                                    data.eligibility.map((item, index) => (
                                        <li key={index} className={styles.criteriaItem}>
                                            <CheckCircleIcon />
                                            <span>{item}</span>
                                        </li>
                                    )) :
                                    formatBackendCriteria(data.eligibility_criteria).map((item, index) => (
                                        <li key={index} className={styles.criteriaItem}>
                                            <CheckCircleIcon />
                                            <span>{item}</span>
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>

                        <div className={styles.contentSection}>
                            <SectionTitle>Merit Ranking Details</SectionTitle>
                            <ul className={styles.criteriaList}>
                                {(data.meritRanking || []).map((item, index) => (
                                    <li key={index} className={styles.criteriaItem}>
                                        <PlusCircleIcon />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className={styles.rightColumn}>
                        <div className={styles.applySection}>
                            <button
                                className={styles.applyButton}
                                onClick={handleApply}
                                disabled={eligibilityLoading || !isEligible}
                                style={{
                                    backgroundColor: isEligible ? '#4E296C' : '#33324eff',
                                    cursor: isEligible ? 'pointer' : 'not-allowed'
                                }}
                            >
                                {eligibilityLoading ? 'Checking...' : isEligible ? 'Apply Now' : 'Not Eligible'}
                            </button>
                            <p className={styles.eligibilityMessage} style={{ color: isEligible ? '#10b981' : '#ef4444' }}>
                                {eligibilityMessage}
                            </p>
                        </div>

                        <hr className={styles.divider} />
                        <div className={styles.sidebarSection}>
                            <h3 className={styles.sidebarTitle}>Available Seat Details</h3>
                            <SeatAvailability govSeats={data.govSeats} selfFinancedSeats={data.selfFinancedSeats} />
                        </div>

                        <hr className={styles.divider} />
                        <div className={styles.sidebarSection}>
                            <h3 className={styles.sidebarTitle}>Application Timeline</h3>
                            <div className={styles.dateRow}>
                                <span className={styles.dateLabel}>Apply Before</span>
                                {/* Added ?. to safely access nested properties */}
                                <span className={styles.dateValue}>{data.applicationDates?.applyBefore || 'N/A'}</span>
                            </div>
                            <div className={styles.dateRow}>
                                <span className={styles.dateLabel}>Posted On</span>
                                <span className={styles.dateValue}>{data.applicationDates?.postedOn || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;