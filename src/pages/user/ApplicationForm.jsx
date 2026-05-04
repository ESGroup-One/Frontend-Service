import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './styles/profile.module.css';
import { AlertCircle } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

    const applicationPreviewData = useMemo(() => {
        const data = sessionStorage.getItem('applicationPreviewData');
        return data ? JSON.parse(data) : null;
    }, []);

    useEffect(() => {
        const fetchCourse = async () => {
            setCourseLoading(true);
            try {
                const response = await fetch(`http://localhost:8000/api/courses/${courseId}`);

                if (!response.ok) {
                    throw new Error("Failed to fetch course data.");
                }
                const courseData = await response.json();

                const eligibilityDisplay = Object.entries(courseData.eligibility_criteria || {})
                    .map(([key, value]) => {
                        if (key === 'Overall_Aggregate' && typeof value === 'number') return `Minimum ${value}% Overall Aggregate`;
                        if (typeof value === 'number') return `Minimum ${value}% in ${key}`;
                        return `${key}: ${value}`;
                    });

                const meritRankingDisplay = Object.entries(courseData.merit_ranking || {})
                    .map(([key, value]) => {
                        if (typeof value === 'number') return `${key} (x${value})`;
                        return key;
                    });

                setCourse({
                    ...courseData,
                    eligibility: eligibilityDisplay,
                    meritRanking: meritRankingDisplay,
                    logoUrl: courseData.logoUrl || '/default_college_logo.png'
                });
            } catch (error) {
                console.error("Error fetching course data:", error);
                toast.error("Failed to load course details. Redirecting...");
                navigate('/user/courses');
            } finally {
                setCourseLoading(false);
            }
        };

        if (courseId) {
            fetchCourse();
        } else {
            setCourseLoading(false);
        }
    }, [courseId, navigate]);

    const [formData, setFormData] = useState({
        indexNumber: applicationPreviewData?.indexNumber || '',
        cidNumber: applicationPreviewData?.cidNumber || '',
        fullName: applicationPreviewData?.fullName || '',
        emailAddress: applicationPreviewData?.email || '',
        phoneNumber: applicationPreviewData?.phone || '',
        applicationType: 'Higher Education Grant',
    });

    const totalMerit = applicationPreviewData?.totalMeritScore || 0;

    const handleApplicationTypeChange = (e) => {
        const { value } = e.target;
        setFormData(prev => ({
            ...prev,
            applicationType: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('authToken');

        if (!applicationPreviewData) {
            toast.error("Pre-calculated application data is missing. Please return to the course page and re-check eligibility.");
            return;
        }

        if (!formData.applicationType) {
            toast.error("Please select an Application Type (Grant or Self Financed).");
            return;
        }

        const submissionPayload = {
            applicationType: formData.applicationType === 'Higher Education Grant' ? 'higher-education' : 'self-financed',
        };

        setLoading(true);

        try {
            const response = await fetch(`http://localhost:8000/api/applications/${courseId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(submissionPayload),
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                sessionStorage.removeItem('applicationPreviewData');
                toast.success("Application submitted successfully!");
                setTimeout(() => navigate(`/user/courses/${courseId}`), 3000);
            } else {
                console.error(`Submission failed: ${result.message || 'Server error'}`);
                toast.error(`Application submission failed: ${result.message || 'Server error'}`);
            }
        } catch (error) {
            console.error("Submission Error:", error);
            toast.error("An unexpected error occurred during submission. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!courseLoading && !applicationPreviewData) {
            toast.warn("Missing application data, redirecting to course details.");
            navigate(`/user/courses/${courseId}`);
        }
    }, [applicationPreviewData, navigate, courseId, courseLoading]);

    const meritSubjectInputs = useMemo(() => {
        if (!applicationPreviewData || !course) return [];

        const rankingCriteria = course.meritRanking || [];

        const breakdown = applicationPreviewData.meritRankingBreakdown || {};

        return Object.entries(breakdown).map(([subjectWithMark, score]) => {
            const criteriaKey = subjectWithMark.toLowerCase().split('(')[0].trim();
            const originalCriteria = rankingCriteria.find(item => item.toLowerCase().includes(criteriaKey)) || criteriaKey;
            const weightMatch = originalCriteria.match(/x\s*(\d+)/);
            const weight = weightMatch ? parseInt(weightMatch[1]) : 1;
            const studentMark = (score / weight).toFixed(0);

            return {
                label: originalCriteria,
                scoreDisplay: `${studentMark} x ${weight} = ${score}`,
            };
        });

    }, [applicationPreviewData, course]);

    if (courseLoading || loading) {
        return (
            <div className={styles.pageContainer} style={{ minHeight: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div>
                    {loading ? 'Submitting Application...' : `Loading details for course ID: ${courseId}...`}
                </div>
            </div>
        );
    }

    if (!course || !applicationPreviewData) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.formWrapper} style={{ textAlign: 'center', padding: '40px' }}>
                    <AlertCircle color="#ef4444" size={32} />
                    <h3 className={styles.sectionTitle} style={{ marginTop: '10px' }}>Application Data Missing</h3>
                    <p className={styles.sectionSubtitle}>Please go back to the course details page to check eligibility and start the application process.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

            <div className={styles.formWrapper} style={{ paddingBottom: '32px', margin: 'auto', backgroundColor: '#fff' }}>

                <div className={styles.headerSection}>
                    <div className={styles.headerContent}>
                        <img
                            src={course.logoUrl}
                            alt={`${course.college} Logo`}
                            className={styles.collegeLogo}
                        />
                        <div className={styles.collegeInfo}>
                            <h1 className={styles.collegeName}>
                                {course.college}
                            </h1>
                            <p className={styles.courseTitle}>
                                {course.title}
                            </p>
                        </div>
                    </div>
                </div>

                <h3 className={styles.sectionTitle}>
                    Submit your application
                </h3>
                <p className={styles.sectionSubtitle} style={{ marginBottom: '24px', color: '#6b7280', fontSize: '14px' }}>
                    The following is required and will only be shared with {course.college}
                </p>

                <form onSubmit={handleSubmit}>
                    <div className={styles.grid}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="indexNumber">Index Number</label>
                            <input
                                id="indexNumber"
                                name="indexNumber"
                                type="text"
                                value={formData.indexNumber}
                                placeholder="Enter your index number"
                                readOnly
                                style={{ backgroundColor: '#f9fafb' }}
                            />
                        </div>
                        <div style={{ height: '0' }}></div>
                    </div>

                    <div className={styles.grid} style={{ marginTop: '16px' }}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="cidNumber">CID Number</label>
                            <input
                                id="cidNumber"
                                name="cidNumber"
                                type="text"
                                value={formData.cidNumber}
                                placeholder="Enter your cid number"
                                readOnly
                                style={{ backgroundColor: '#f9fafb' }}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="fullName">Full name</label>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                value={formData.fullName}
                                placeholder="Enter your fullname"
                                readOnly
                                style={{ backgroundColor: '#f9fafb' }}
                            />
                        </div>
                    </div>

                    <div className={styles.grid} style={{ marginTop: '16px' }}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="emailAddress">Email address</label>
                            <input
                                id="emailAddress"
                                name="emailAddress"
                                type="email"
                                value={formData.emailAddress}
                                placeholder="Enter your email address"
                                readOnly
                                style={{ backgroundColor: '#f9fafb' }}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="phoneNumber">Phone number</label>
                            <input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="tel"
                                value={formData.phoneNumber}
                                placeholder="Enter your phone number"
                                readOnly
                                style={{ backgroundColor: '#f9fafb' }}
                            />
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '30px', paddingTop: '0px' }}>
                        <h4 className={styles.subHeading} style={{ fontSize: '16px', fontWeight: 500, marginBottom: '16px' }}>Application Type</h4>
                        <div style={{ display: 'flex', gap: '30px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="radio"
                                    id="grant"
                                    name="applicationType"
                                    value="Higher Education Grant"
                                    checked={formData.applicationType === 'Higher Education Grant'}
                                    onChange={handleApplicationTypeChange}
                                    style={{ margin: 0, width: 'auto', border: '1px solid #ccc' }}
                                    required
                                />
                                <label htmlFor="grant" style={{ fontWeight: 400, fontSize: '14px', color: '#374151', marginBottom: 0 }}>Higher Education Grant</label>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="radio"
                                    id="self"
                                    name="applicationType"
                                    value="Self Financed"
                                    checked={formData.applicationType === 'Self Financed'}
                                    onChange={handleApplicationTypeChange}
                                    style={{ margin: 0, width: 'auto', border: '1px solid #ccc' }}
                                    required
                                />
                                <label htmlFor="self" style={{ fontWeight: 400, fontSize: '14px', color: '#374151', marginBottom: 0 }}>Self Financed</label>
                            </div>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '30px', paddingTop: '0px' }}>
                        <h4 className={styles.subHeading} style={{ fontSize: '16px', fontWeight: 500, marginBottom: '16px' }}>Eligibility Criteria</h4>
                        <p className={styles.sectionSubtitle} style={{ marginTop: '8px', marginBottom: '14px', color: '#6b7280', fontSize: '14px' }}>
                            Your records confirm you meet the following essential criteria for this course.
                        </p>

                        {(course.eligibility || []).map((criterion, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <CheckCircleIcon color="#10b981" style={{ minWidth: '20px' }} />
                                <label style={{ fontWeight: 400, fontSize: '14px', color: '#374151', marginBottom: 0 }}>
                                    {criterion}
                                </label>
                            </div>
                        ))}
                    </div>

                    <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '30px', paddingTop: '0px' }}>
                        <h4 className={styles.subHeading} style={{ fontSize: '16px', fontWeight: 500, marginBottom: '16px' }}>Merit Ranking Details</h4>
                        <p className={styles.sectionSubtitle} style={{ marginTop: '8px', marginBottom: '24px', color: '#6b7280', fontSize: '14px' }}>
                            The merit score has been securely calculated based on your subject marks and the course's weighted criteria.
                        </p>

                        <div className={styles.grid}>
                            {meritSubjectInputs.map((input, index) => (
                                <div className={styles.inputGroup} key={index} style={{ marginTop: index > 1 ? '16px' : '0' }}>
                                    <label htmlFor={`mark-${index}`}>{input.label}</label>
                                    <input
                                        id={`mark-${index}`}
                                        type="text"
                                        value={input.scoreDisplay}
                                        readOnly
                                        style={{ backgroundColor: '#f9fafb' }}
                                    />
                                </div>
                            ))}

                            <div className={styles.inputGroup} style={{ marginTop: '0px' }}>
                                <label htmlFor="total">Total</label>
                                <input
                                    id="total"
                                    type="text"
                                    value={totalMerit}
                                    readOnly
                                    placeholder=""
                                    style={{ backgroundColor: '#f9fafb' }}
                                />
                            </div>

                        </div>
                    </div>

                    <div style={{ marginTop: '30px' }}>
                        <p className={styles.termsText} style={{ color: '#6b7280' }}>
                            By sending the request you can confirm that you accept our <strong style={{ color: '#4f46e5' }}>Terms of Service</strong> and <strong style={{ color: '#4f46e5' }}>Privacy Policy</strong>
                        </p>
                        <button type="submit"
                            disabled={loading}
                            style={{
                                padding: '5px 20px',
                                backgroundColor: loading ? '#9ca3af' : '#4f46e5',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '16px',
                                fontWeight: 500,
                                width: 'auto'
                            }}>
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

export default ApplicationForm;