import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './styles/profile.module.css';
import { AlertCircle } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { GET_COURSE_BY_ID, SUBMIT_APPLICATION_URL } from '../../constant';

const CheckCircleIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.iconCheck}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

function ApplicationForm() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [courseLoading, setCourseLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const applicationPreviewData = useMemo(() => {
        const data = localStorage.getItem('applicationPreviewData');
        return data ? JSON.parse(data) : null;
    }, []);

    const userData = useMemo(() => {
        const data = localStorage.getItem('userDetails');
        return data ? JSON.parse(data) : null;
    }, []);

    useEffect(() => {
        const fetchCourse = async () => {
            setCourseLoading(true);
            try {
                const response = await fetch(GET_COURSE_BY_ID(courseId));

                if (!response.ok) {
                    throw new Error("Failed to fetch course data.");
                }
                const courseData = await response.json();

                const eligibilityDisplay = Object.entries(courseData.eligibility_criteria || {})
                    .map(([key, value]) => {
                        if (key === 'Overall_Aggregate') return `Minimum ${value}% Overall Aggregate`;
                        return `Minimum ${value}% in ${key}`;
                    });

                const meritRankingDisplay = Object.entries(courseData.merit_ranking || {})
                    .map(([key, value]) => `${key} (x${value})`);

                setCourse({
                    ...courseData,
                    eligibility: eligibilityDisplay,
                    meritRanking: meritRankingDisplay,
                    logoUrl: courseData.logoUrl || '/default_college_logo.png'
                });
            } catch (error) {
                console.error("Error fetching course data:", error);
                toast.error("Failed to load course details. Redirecting...");
                navigate(`/user/courses/${courseId}`);
            } finally {
                setCourseLoading(false);
            }
        };

        if (courseId) {
            fetchCourse();
        }
    }, [courseId, navigate]);

    const [formData, setFormData] = useState({
        indexNumber: userData?.indexNumber || '',
        cidNumber: userData?.cid || '',
        fullName: userData?.fullName || '',
        emailAddress: userData?.email || '',
        applicationType: 'Higher Education Grant',
    });

    const totalMerit = applicationPreviewData?.applicationData?.totalMeritScore || 0;

    const handleApplicationTypeChange = (e) => {
        setFormData(prev => ({
            ...prev,
            applicationType: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');

        if (!applicationPreviewData) {
            toast.error("Application data missing.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(SUBMIT_APPLICATION_URL(courseId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    applicationType: formData.applicationType === 'Higher Education Grant' ? 'higher-education' : 'self-financed',
                }),
            });

            if (response.ok) {
                setIsSuccess(true);
                toast.success("Application submitted successfully!");
                localStorage.removeItem('applicationPreviewData');
                setTimeout(() => navigate(`/user/courses/${courseId}`), 3000);
            } else {
                const result = await response.json();
                toast.error(`Submission failed: ${result.message || 'Server error'}`);
            }
        } catch (error) {
            toast.error("An unexpected error occurred during submission.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!courseLoading && !applicationPreviewData && !isSuccess) {
            navigate(`/user/courses/${courseId}`);
        }
    }, [applicationPreviewData, navigate, courseId, courseLoading, isSuccess]);

    const meritSubjectInputs = useMemo(() => {
        const breakdown = applicationPreviewData?.applicationData?.meritRankingBreakdown || {};

        return Object.entries(breakdown).map(([key, score]) => {
            let label = key;

            if (key.includes('(')) {
                const parts = key.split('(');
                const prefix = parts[0];
                const subject = parts[1].replace(')', '');
                const formattedSubject = subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase();

                label = `${prefix}(${formattedSubject})`;
            } else {
                label = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
            }

            return {
                label: label,
                scoreDisplay: score,
            };
        });
    }, [applicationPreviewData]);

    if (courseLoading || loading) {
        return (
            <div className={styles.pageContainer} style={{ minHeight: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div>{loading ? 'Submitting Application...' : `Loading details for course...`}</div>
            </div>
        );
    }

    if (!course || !applicationPreviewData) return null;

    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} />

            <div className={styles.formWrapper} style={{ paddingBottom: '32px', margin: 'auto', backgroundColor: '#fff' }}>
                {/* Header UI */}
                <div className={styles.headerSection}>
                    <div className={styles.headerContent}>
                        <img
                            src={course.logoUrl}
                            alt="Logo"
                            className={styles.collegeLogo}
                        />
                        <div className={styles.collegeInfo}>
                            <h1 className={styles.collegeName}>
                                {course.college?.collegeName || course.collegeName}
                            </h1>
                            <p className={styles.courseTitle}>{course.title}</p>
                        </div>
                    </div>
                </div>

                <h3 className={styles.sectionTitle}>Submit your application</h3>
                <p className={styles.sectionSubtitle} style={{ marginBottom: '24px', color: '#6b7280', fontSize: '14px' }}>
                    The following is required and will only be shared with {course.college?.collegeName || course.collegeName}
                </p>

                <form onSubmit={handleSubmit}>
                    <div className={styles.grid} style={{ marginTop: '16px' }}>
                        <div className={styles.inputGroup}>
                            <label>Index Number</label>
                            <input type="text" value={formData.indexNumber} readOnly style={{ backgroundColor: '#f9fafb' }} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Email address</label>
                            <input type="email" value={formData.emailAddress} readOnly style={{ backgroundColor: '#f9fafb' }} />
                        </div>
                    </div>


                    <div className={styles.grid} style={{ marginTop: '16px' }}>
                        <div className={styles.inputGroup}>
                            <label>CID Number</label>
                            <input type="text" value={formData.cidNumber} readOnly style={{ backgroundColor: '#f9fafb' }} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Full name</label>
                            <input type="text" value={formData.fullName} readOnly style={{ backgroundColor: '#f9fafb' }} />
                        </div>
                    </div>

                    {/* Application Type Selection */}
                    <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '30px', paddingTop: '10px' }}>
                        <h4 className={styles.subHeading} style={{ fontSize: '16px', fontWeight: 500, marginBottom: '16px', marginTop: '10px' }}>Application Type</h4>
                        <div style={{ display: 'flex', gap: '30px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="radio"
                                    id="grant"
                                    name="applicationType"
                                    value="Higher Education Grant"
                                    checked={formData.applicationType === 'Higher Education Grant'}
                                    onChange={handleApplicationTypeChange}
                                    style={{ margin: 0, width: 'auto' }}
                                    required
                                />
                                <label htmlFor="grant" style={{ fontWeight: 400, fontSize: '14px', marginBottom: 0 }}>Higher Education Grant</label>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="radio"
                                    id="self"
                                    name="applicationType"
                                    value="Self Financed"
                                    checked={formData.applicationType === 'Self Financed'}
                                    onChange={handleApplicationTypeChange}
                                    style={{ margin: 0, width: 'auto' }}
                                    required
                                />
                                <label htmlFor="self" style={{ fontWeight: 400, fontSize: '14px', marginBottom: 0 }}>Self Financed</label>
                            </div>
                        </div>
                    </div>

                    {/* Eligibility Display */}
                    <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '30px', paddingTop: '10px' }}>
                        <h4 className={styles.subHeading} style={{ fontSize: '16px', fontWeight: 500, marginBottom: '10px', marginTop: '10px' }}>Eligibility Criteria</h4>
                        <p className={styles.sectionSubtitle} style={{ marginBottom: '14px', color: '#6b7280', fontSize: '14px' }}>
                            Your records confirm you meet the following essential criteria.
                        </p>
                        {(course.eligibility || []).map((criterion, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <CheckCircleIcon color="#10b981" style={{ minWidth: '20px' }} />
                                <label style={{ fontWeight: 400, fontSize: '14px', color: '#374151', marginBottom: 0 }}>{criterion}</label>
                            </div>
                        ))}
                    </div>

                    {/* Merit Ranking Details Section */}
                    <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '30px', padding: '10px' }}>
                        <h4 className={styles.subHeading} style={{ fontSize: '16px', fontWeight: 500, marginBottom: '16px' }}>
                            Merit Ranking Details
                        </h4>
                        <p className={styles.sectionSubtitle} style={{ marginTop: '8px', marginBottom: '24px', color: '#6b7280', fontSize: '14px' }}>
                            The merit score has been securely calculated based on your subject marks and the course's weighted criteria.
                        </p>

                        <div className={styles.grid} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                            {meritSubjectInputs.map((input, index) => (
                                <div className={styles.inputGroup} key={index}>
                                    <label style={{ fontSize: '13px', fontWeight: '500' }}>{input.label}</label>
                                    <input
                                        type="text"
                                        value={input.scoreDisplay}
                                        readOnly
                                        style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', padding: '8px', width: '100%' }}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className={styles.inputGroup} style={{ marginTop: '16px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '600' }}>Total</label>
                            <input
                                type="text"
                                value={totalMerit}
                                readOnly
                                style={{
                                    backgroundColor: '#f9fafb',
                                    border: '1px solid #e5e7eb',
                                    padding: '12px',
                                    width: '100%',
                                    fontWeight: 'bold',
                                    fontSize: '16px'
                                }}
                            />
                        </div>
                    </div>

                    {/* Footer / Submit Section */}
                    <div style={{ marginTop: '30px' }}>
                        <p className={styles.termsText} style={{ color: '#6b7280', fontSize: '13px', lineHeight: '1.5' }}>
                            By sending the request you can confirm that you accept our <strong style={{ color: '#4E296C' }}>Terms of Service</strong> and <strong style={{ color: '#4E296C' }}>Privacy Policy</strong>
                        </p>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: '15px',
                                padding: '10px 25px',
                                backgroundColor: loading ? '#9ca3af' : '#4E296C',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '16px',
                                fontWeight: 500,
                                width: 'auto',
                                transition: 'background-color 0.2s'
                            }}>
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </div>
                </form>
            </div>
            <ToastContainer
            />
        </>
    );
}

export default ApplicationForm;