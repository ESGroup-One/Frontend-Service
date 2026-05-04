import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './styles/courseDetail.module.css';

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
    <h2 className={styles.sectionTitle}>
        {children}
    </h2>
);

const SeatAvailability = ({ govSeats, selfFinancedSeats }) => {
    const totalSeats = (govSeats || 0) + (selfFinancedSeats || 0);
    const govPercentage = totalSeats > 0 ? (govSeats / totalSeats) * 100 : 0;
    const selfFinancedPercentage = totalSeats > 0 ? (selfFinancedSeats / totalSeats) * 100 : 0;

    return (
        <div className={styles.seatAvailabilityDetails}>
            <p className={styles.seatText}>
                <strong>{govSeats || 0}</strong> Higher Education Grant and <strong>{selfFinancedSeats || 0}</strong> self financed
            </p>

            <div className={styles.progressBarContainer}>
                <div
                    className={styles.govSeatsBar}
                    style={{ width: `${govPercentage}%` }}
                />
                {/* <div
                    className={styles.selfFinancedBar}
                    style={{
                        width: `${selfFinancedPercentage}%`,
                        transform: `translateX(${govPercentage}%)`
                    }}
                /> */}
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
    const [eligibilityMessage, setEligibilityMessage] = useState('Checking eligibility...');
    const [eligibilityLoading, setEligibilityLoading] = useState(true);
    const [applicationData, setApplicationData] = useState(null);

    useEffect(() => {
        const fetchCourseAndEligibility = async () => {
            setLoading(true);
            setEligibilityLoading(true);
            const token = localStorage.getItem('authToken'); // Assuming JWT is stored here

            try {
                // 1. Fetch Course Details
                const courseResponse = await fetch(`http://localhost:8000/api/courses/${courseId}`);

                if (!courseResponse.ok) {
                    throw new Error(`HTTP error! Status: ${courseResponse.status}`);
                }
                const courseData = await courseResponse.json();

                const eligibilityList = formatBackendCriteria(courseData.eligibility_criteria);
                const meritList = formatBackendCriteria(courseData.merit_ranking);
                const applyBeforeDate = formatDate(courseData.application_dateline);
                const postedOnDate = formatDate(courseData.createdAt);

                const processedData = {
                    ...courseData,
                    eligibility: eligibilityList,
                    meritRanking: meritList,
                    govSeats: courseData.gov_seats || 0,
                    selfFinancedSeats: courseData.self_finance_seats || 0,
                    fullDescription: courseData.fullDescription || courseData.description || 'No detailed description available.',
                    applicationDates: { applyBefore: applyBeforeDate, postedOn: postedOnDate },
                    logoUrl: courseData.logoUrl || 'default_logo_path.png',
                };

                setData(processedData);
                setError(null);

                // 2. Check Eligibility
                const eligibilityResponse = await fetch(`http://localhost:8000/api/applications/check-eligibility/${courseId}`, {
                    method: 'POST', // POST for security/state
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`, // Pass token for authentication
                    },
                    // Send an empty body or any required mock data if needed, but not application data
                    body: JSON.stringify({}),
                });

                const eligibilityResult = await eligibilityResponse.json();

                if (eligibilityResponse.ok && eligibilityResult.status === 'success') {
                    if (eligibilityResult.isEligible) {
                        setIsEligible(true);
                        setEligibilityMessage('');
                        setApplicationData(eligibilityResult.applicationData);
                    } else {
                        setIsEligible(false);
                        const reasons = Object.entries(eligibilityResult.eligibilityDetails || {})
                            .filter(([, detail]) => !detail.met)
                            .map(([subject, detail]) =>
                                `${subject} (Required: ${detail.required})`
                            ).join(', ');

                        if (eligibilityResult.message.includes('already applied')) {
                            setEligibilityMessage('You have already applied for this course.');
                        } else if (reasons) {
                            setEligibilityMessage(`Failed criteria: ${reasons}.`);
                        } else {
                            setEligibilityMessage(eligibilityResult.message || 'You are NOT eligible for this course.');
                        }
                    }
                } else {
                    // Handle server errors or application dateline passed
                    setIsEligible(false);
                    setEligibilityMessage(eligibilityResult.message || 'Error checking eligibility.');
                }

            } catch (err) {
                console.error("Fetch Error:", err);
                setError("Course details could not be loaded.");
                setIsEligible(false);
                setEligibilityMessage('Error connecting to the server.');
            } finally {
                setLoading(false);
                setEligibilityLoading(false);
            }
        };

        fetchCourseAndEligibility();
    }, [courseId]);

    useEffect(() => {
        const fetchCourse = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:8000/api/courses/${courseId}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const courseData = await response.json();

                const eligibilityList = formatBackendCriteria(courseData.eligibility_criteria);
                const meritList = formatBackendCriteria(courseData.merit_ranking);

                const applyBeforeDate = formatDate(courseData.application_dateline);
                const postedOnDate = formatDate(courseData.createdAt);

                const processedData = {
                    ...courseData,
                    eligibility: eligibilityList,
                    meritRanking: meritList,

                    // Map seat counts
                    govSeats: courseData.gov_seats || 0,
                    selfFinancedSeats: courseData.self_finance_seats || 0,

                    // Map description fields
                    fullDescription: courseData.fullDescription || courseData.description || 'No detailed description available.',

                    // Map date object
                    applicationDates: {
                        applyBefore: applyBeforeDate,
                        postedOn: postedOnDate
                    },

                    // Placeholder for college logo (needs to be implemented on backend/static assets for real logos)
                    logoUrl: courseData.logoUrl || 'default_logo_path.png',
                };

                setData(processedData);
                setError(null);
            } catch (err) {
                console.error("Fetch Course Error:", err);
                setError("Course details could not be loaded.");
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId]);

    const handleApply = () => {
        // Pass the pre-calculated application data to the application form page
        // Use state or local storage for data transfer on navigation
        if (isEligible && applicationData) {
            sessionStorage.setItem('applicationPreviewData', JSON.stringify(applicationData));
            navigate(`/user/courses/${courseId}/apply`);
        } else if (applicationData) {
            // Handle case where user somehow clicks apply when ineligible
            console.log("Cannot apply, not eligible.");
        }
    };

    if (loading) {
        return (
            <div className={styles.courseDetailPage}>
                <div className={styles.courseContainer} style={{ textAlign: 'center', padding: '50px' }}>
                    <h1 className={styles.collegeName}>Loading...</h1>
                    <p className={styles.courseTitle}>Fetching course details.</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className={styles.courseDetailPage}>
                <div className={styles.courseContainer} style={{ textAlign: 'center', padding: '50px' }}>
                    <h1 className={styles.collegeName}>Course Not Found</h1>
                    <p className={styles.courseTitle}>{error || 'The requested course does not exist.'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.courseDetailPage}>
            <div className={styles.courseContainer}>

                {/* Header Section */}
                <div className={styles.headerSection}>
                    <div className={styles.headerContent}>
                        <img
                            src={data.createdBy.image}
                            alt={`${data.createdBy.image} Logo`}
                            className={styles.collegeLogo}
                        />
                        <div className={styles.collegeInfo}>
                            <h1 className={styles.collegeName}>
                                {data.college}
                            </h1>
                            <p className={styles.courseTitle}>
                                {data.title}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className={styles.twoColumnLayout}>

                    {/* Left Column - Main Content */}
                    <div className={styles.leftColumn}>

                        {/* Description Section */}
                        <div className={styles.contentSection}>
                            <SectionTitle>Description</SectionTitle>
                            <p className={styles.descriptionText}>
                                {data.fullDescription}
                            </p>
                        </div>

                        {/* Eligibility Criteria */}
                        <div className={styles.contentSection}>
                            <SectionTitle>Eligibility Criteria</SectionTitle>
                            <ul className={styles.criteriaList}>
                                {data.eligibility.map((item, index) => (
                                    <li key={index} className={styles.criteriaItem}>
                                        <CheckCircleIcon />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Merit Ranking Details */}
                        <div className={styles.contentSection}>
                            <SectionTitle>Merit Ranking Details</SectionTitle>
                            <ul className={styles.criteriaList}>
                                {data.meritRanking.map((item, index) => (
                                    <li key={index} className={styles.criteriaItem}>
                                        <PlusCircleIcon />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>

                    {/* Right Column - Sidebar */}
                    <div className={styles.rightColumn}>

                        <div className={styles.applySection}>
                            {eligibilityLoading ? (
                                <button className={styles.applyButton} disabled style={{ backgroundColor: '#9ca3af' }}>
                                    Checking Eligibility...
                                </button>
                            ) : (
                                <button
                                    className={styles.applyButton}
                                    onClick={handleApply}
                                    disabled={!isEligible}
                                    style={{
                                        backgroundColor: isEligible ? '#4f46e5' : '#33324eff',
                                        cursor: isEligible ? 'pointer' : 'not-allowed'
                                    }}
                                    title={eligibilityMessage}
                                >
                                    {isEligible ? 'Apply Now' : 'Not Eligible'}
                                </button>
                            )}
                            <p className={styles.eligibilityMessage} style={{ color: isEligible ? '#10b981' : '#ef4444', marginTop: '10px', fontSize: '14px', textAlign: 'justify' }}>
                                {eligibilityMessage}
                            </p>
                        </div>

                        <hr className={styles.divider} />

                        {/* Available Seat Details */}
                        <div className={styles.sidebarSection}>
                            <h3 className={styles.sidebarTitle}>Available Seat Details</h3>
                            <SeatAvailability
                                govSeats={data.govSeats}
                                selfFinancedSeats={data.selfFinancedSeats}
                            />
                        </div>

                        <hr className={styles.divider} />

                        {/* Application Dates */}
                        <div className={styles.sidebarSection}>
                            <h3 className={styles.sidebarTitle}>Application Timeline</h3>
                            <div className={styles.dateTable}>
                                <div className={styles.dateRow}>
                                    <span className={styles.dateLabel}>Apply Before</span>
                                    <span className={styles.dateValue}>{data.applicationDates.applyBefore || 'N/A'}</span>
                                </div>
                                <div className={styles.dateRow}>
                                    <span className={styles.dateLabel}>Posted On</span>
                                    <span className={styles.dateValue}>{data.applicationDates.postedOn || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default CourseDetail;