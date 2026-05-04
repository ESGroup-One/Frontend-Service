import { useState, useEffect, useMemo } from 'react'; // 1. Added useMemo
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './ViewDetailsPage.module.css';

// Use environment variable or hardcoded URL
const API_BASE = 'http://localhost:8000/api/applications';

const ApplicationDetailsPage = () => {
    const { courseId } = useParams();
    const [applications, setApplications] = useState([]);
    const [courseInfo, setCourseInfo] = useState({ title: 'Loading...', college: '' });
    const [loading, setLoading] = useState(true);
    
    // --- New State for Sorting ---
    const [sortOption, setSortOption] = useState('Most recent');

    // --- 1. Fetch Data ---
    useEffect(() => {
        const fetchApps = async () => {
            const token = localStorage.getItem('authToken');
            try {
                const response = await axios.get(`${API_BASE}/course/${courseId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setApplications(response.data.data);
                // console.log(response.data)
                setCourseInfo({
                    title: response.data.courseTitle,
                    college: response.data.college,
                    image: response.data.courseCreator.image
                });
            } catch (error) {
                console.error("Error fetching applications", error);
            } finally {
                setLoading(false);
            }
        };
        if (courseId) fetchApps();
    }, [courseId]);

    // --- 2. Action Handlers ---
    const handleStatusUpdate = async (appId, newStatus) => {
        const token = localStorage.getItem(LOCAL_STORAGE_KEY);
        try {
            await axios.patch(`${API_BASE}/${appId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Optimistic UI Update
            setApplications(prev => prev.map(app =>
                app._id === appId ? { ...app, status: newStatus } : app
            ));

            alert(`Candidate ${newStatus} successfully.`);
        } catch (error) {
            alert("Failed to update status.");
        }
    };

    // --- 3. Sorting Logic (Adapted from your snippet) ---
    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    };

    const sortedApplications = useMemo(() => {
        let sortableApps = [...applications];

        switch (sortOption) {
            case 'Student Name (A-Z)': // Changed from Course Title to Student Name for context
                sortableApps.sort((a, b) => (a.student?.name || '').localeCompare(b.student?.name || ''));
                break;
            case 'Most recent':
                // Safe navigation in case createdAt is undefined
                sortableApps.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                break;
            case 'Merit Ranking':
                sortableApps.sort((a, b) => b.totalMeritScore - a.totalMeritScore);
                break;
            default:
                break;
        }

        return sortableApps;
    }, [applications, sortOption]);

    // --- 4. Filter Lists (Now using sortedApplications) ---
    const pendingApps = sortedApplications.filter(app => app.status === 'pending');
    const shortlistedApps = sortedApplications.filter(app => app.status === 'shortlisted');

    // Helper to format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {/* Course Info Card */}
                <div className={styles.courseHeader}>
                    <div className={styles.logoWrapper}>
                        <img src={courseInfo.image} alt="Logo" className={styles.headerLogo} />
                    </div>
                    <div>
                        <h2 className={styles.collegeName}>{courseInfo.college}</h2>
                        <h1 className={styles.courseName}>{courseInfo.title}</h1>
                    </div>

                </div>
                {/* --- Table 1: Applicants List (Pending) --- */}
                <div className={styles.section}>
                    <div className={styles.tableHeaderRow}>
                        <div>
                            <h3 className={styles.sectionTitle}>Applicants List</h3>
                            <p className={styles.resultCount}>Showing {pendingApps.length} results</p>
                        </div>
                        
                        {/* --- APPLIED NEW SORT CONTROL HERE --- */}
                        <div className={styles.sortSection}>
                             <div className={styles.sortControl}>
                                <label htmlFor="sort" className={styles.sortLabel}>Sort by:</label>
                                <select
                                    id="sort"
                                    className={styles.sortDropdown}
                                    value={sortOption}
                                    onChange={handleSortChange}
                                    style={{
                                        outline: 'none',
                                        border: 'none',
                                        background: 'transparent',
                                        fontWeight: '500'
                                    }}
                                >
                                    <option value="Most recent">Most recent</option>
                                    <option value="Student Name (A-Z)">Student Name (A-Z)</option>
                                    <option value="Merit Ranking">Merit Ranking</option>
                                </select>
                            </div>
                        </div>
                        {/* ------------------------------------- */}
                        
                    </div>

                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th><input type="checkbox" /></th>
                                    <th>Index Number</th>
                                    <th>CID Number</th>
                                    <th>Student Name</th>
                                    <th>Email Address</th>
                                    <th>Types</th>
                                    <th>Merit Ranking</th>
                                    <th>Applied Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingApps.map(app => (
                                    <tr key={app._id}>
                                        <td><input type="checkbox" /></td>
                                        <td className={styles.mono}>{app.student?.indexNumber || 'N/A'}</td>
                                        <td className={styles.mono}>{app.student?.cidNumber || 'N/A'}</td>
                                        <td className={styles.nameCell}>{app.student?.name}</td>
                                        <td>{app.student?.email}</td>
                                        <td>
                                            <span className={app.applicationType === 'self-financed' ? styles.badgeSelf : styles.badgeGrant}>
                                                {app.applicationType === 'self-financed' ? 'Self Finance' : 'High Edu Grant'}
                                            </span>
                                        </td>
                                        <td className={styles.meritScore}>{app.totalMeritScore.toFixed(0)}</td>
                                        <td>{formatDate(app.createdAt)}</td>
                                        <td>
                                            <div className={styles.actionGroup}>
                                                <button
                                                    className={styles.shortlistBtn}
                                                    onClick={() => handleStatusUpdate(app._id, 'shortlisted')}
                                                >
                                                    Shortlist
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {pendingApps.length === 0 && <tr><td colSpan="9" className={styles.empty}>No pending applications</td></tr>}
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.pagination}>
                        <div className={styles.pageControls}>
                            <button className={styles.pageBtn}><ChevronLeft size={16} /></button>
                            <button className={`${styles.pageBtn} ${styles.activePage}`}>1</button>
                            <button className={styles.pageBtn}>2</button>
                            <button className={styles.pageBtn}><ChevronRight size={16} /></button>
                        </div>
                    </div>
                </div>

                {/* --- Table 2: Shortlisted Candidates --- */}
                <div className={styles.section} style={{ marginTop: '40px' }}>
                    <div className={styles.tableHeaderRow}>
                        <div>
                            <h3 className={styles.sectionTitle}>Shortlisted Candidates</h3>
                            <p className={styles.resultCount}>Showing {shortlistedApps.length} results</p>
                        </div>
                        {/* Optional: Add the same sort control here if you want independent sorting */}
                    </div>

                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th><input type="checkbox" /></th>
                                    <th>Index Number</th>
                                    <th>CID Number</th>
                                    <th>Student Name</th>
                                    <th>Email Address</th>
                                    <th>Types</th>
                                    <th>Merit Ranking</th>
                                    <th>Applied Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shortlistedApps.map(app => (
                                    <tr key={app._id}>
                                        <td><input type="checkbox" /></td>
                                        <td className={styles.mono}>{app.student?.indexNumber || 'N/A'}</td>
                                        <td className={styles.mono}>{app.student?.cidNumber || 'N/A'}</td>
                                        <td className={styles.nameCell}>{app.student?.name}</td>
                                        <td>{app.student?.email}</td>
                                        <td>
                                            <span className={app.applicationType === 'self-financed' ? styles.badgeSelf : styles.badgeGrant}>
                                                {app.applicationType === 'self-financed' ? 'Self Finance' : 'High Edu Grant'}
                                            </span>
                                        </td>
                                        <td className={styles.meritScore}>{app.totalMeritScore.toFixed(0)}</td>
                                        <td>{formatDate(app.createdAt)}</td>
                                        <td>
                                            <div className={styles.actionGroup}>
                                                <button className={styles.shortlistedTag}>Shortlisted</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {shortlistedApps.length === 0 && <tr><td colSpan="9" className={styles.empty}>No shortlisted candidates yet</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ApplicationDetailsPage;