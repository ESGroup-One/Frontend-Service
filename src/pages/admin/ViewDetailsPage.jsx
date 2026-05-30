import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
    APPLICATION_STATUS_HISTORY_URL,
    GET_COURSE_APPLICATIONS_URL,
    UPDATE_APPLICATION_STATUS_URL,
} from '../../constant';
import styles from './ViewDetailsPage.module.css';

const DEFAULT_COLLEGE_LOGO = '/default_college_logo.png';

const STATUS_META = {
    pending: { label: 'Pending', className: 'statusPending' },
    shortlisted: { label: 'Shortlisted', className: 'statusShortlisted' },
    passed_ctt: { label: 'Passed for CTT Test', className: 'statusCtt' },
    passed_interview: { label: 'Passed for Interview', className: 'statusInterview' },
    placed: { label: 'Placed', className: 'statusPlaced' },
    rejected: { label: 'Rejected', className: 'statusRejected' },
    closed_candidate_placed_elsewhere: {
        label: 'Closed - Candidate Placed Elsewhere',
        className: 'statusClosed',
    },
};

const getApplicationId = (application) => application?.id || application?._id;

const normalizeStatus = (status) => {
    if (!status) return 'pending';
    const normalized = status.toLowerCase().replaceAll('-', '_').replaceAll(' ', '_');
    if (normalized === 'applied') return 'pending';
    if (normalized === 'passed_for_ctt' || normalized === 'passed_for_ctt_test') return 'passed_ctt';
    if (normalized === 'passed_for_interview') return 'passed_interview';
    if (STATUS_META[normalized]) return normalized;
    return 'pending';
};

const getStatusLabel = (status) => STATUS_META[normalizeStatus(status)]?.label || 'Pending';

const getNextStatuses = (status) => {
    const normalized = normalizeStatus(status);

    switch (normalized) {
        case 'pending':
            return ['shortlisted', 'rejected'];
        case 'shortlisted':
            return ['passed_ctt', 'rejected'];
        case 'passed_ctt':
            return ['passed_interview', 'rejected'];
        case 'passed_interview':
            return ['placed', 'rejected'];
        default:
            return [];
    }
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'N/A';

    return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'N/A';

    return date.toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatScore = (score) => {
    const numericScore = Number(score);
    if (Number.isNaN(numericScore)) return 'N/A';
    return numericScore.toFixed(0);
};

const getStudentName = (student) => student?.fullName || student?.name || 'N/A';
const getStudentCid = (student) => student?.cid || student?.cidNumber || 'N/A';

const StatusBadge = ({ status }) => {
    const normalized = normalizeStatus(status);
    const statusClass = STATUS_META[normalized]?.className || STATUS_META.pending.className;

    return (
        <span className={`${styles.statusBadge} ${styles[statusClass]}`}>
            {getStatusLabel(normalized)}
        </span>
    );
};

const ApplicationDetailsPage = () => {
    const { courseId } = useParams();
    const [applications, setApplications] = useState([]);
    const [courseInfo, setCourseInfo] = useState({
        title: 'Loading...',
        college: '',
        image: DEFAULT_COLLEGE_LOGO,
    });
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [sortOption, setSortOption] = useState('Most recent');
    const [expandedHistoryId, setExpandedHistoryId] = useState(null);
    const [historyByApplication, setHistoryByApplication] = useState({});
    const [historyLoadingId, setHistoryLoadingId] = useState(null);

    const fetchApplications = useCallback(async () => {
        if (!courseId) return;

        const token = localStorage.getItem('authToken');
        setLoading(true);

        try {
            const response = await axios.get(GET_COURSE_APPLICATIONS_URL(courseId), {
                headers: { Authorization: `Bearer ${token}` },
            });

            const payload = response.data || {};
            setApplications(Array.isArray(payload.data) ? payload.data : []);
            setCourseInfo({
                title: payload.courseTitle || 'Course Applications',
                college: payload.college || 'College',
                image: payload.courseCreator?.image || DEFAULT_COLLEGE_LOGO,
            });
        } catch (error) {
            console.error('Error fetching applications', error);
            toast.error(error.response?.data?.message || 'Unable to load applications.');
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const sortedApplications = useMemo(() => {
        const sortableApps = [...applications];

        switch (sortOption) {
            case 'Student Name (A-Z)':
                sortableApps.sort((a, b) => getStudentName(a.student).localeCompare(getStudentName(b.student)));
                break;
            case 'Merit Ranking':
                sortableApps.sort((a, b) => (b.totalMeritScore || 0) - (a.totalMeritScore || 0));
                break;
            case 'Status':
                sortableApps.sort((a, b) => getStatusLabel(a.currentStatus || a.status).localeCompare(getStatusLabel(b.currentStatus || b.status)));
                break;
            case 'Most recent':
            default:
                sortableApps.sort((a, b) => new Date(b.submittedAt || b.createdAt || 0) - new Date(a.submittedAt || a.createdAt || 0));
                break;
        }

        return sortableApps;
    }, [applications, sortOption]);

    const handleStatusUpdate = async (applicationId, newStatus) => {
        if (!newStatus) return;

        const token = localStorage.getItem('authToken');
        setUpdatingId(applicationId);

        try {
            await axios.put(
                UPDATE_APPLICATION_STATUS_URL(applicationId),
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } },
            );

            toast.success(`Candidate moved to ${getStatusLabel(newStatus)}.`);
            setHistoryByApplication((current) => {
                const next = { ...current };
                delete next[applicationId];
                return next;
            });
            await fetchApplications();
        } catch (error) {
            console.error('Status update failed', error);
            const message =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.response?.data?.detail ||
                'Failed to update application status.';
            toast.error(message);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleToggleHistory = async (applicationId) => {
        if (expandedHistoryId === applicationId) {
            setExpandedHistoryId(null);
            return;
        }

        setExpandedHistoryId(applicationId);

        if (historyByApplication[applicationId]) return;

        const token = localStorage.getItem('authToken');
        setHistoryLoadingId(applicationId);

        try {
            const response = await axios.get(APPLICATION_STATUS_HISTORY_URL(applicationId), {
                headers: { Authorization: `Bearer ${token}` },
            });

            setHistoryByApplication((current) => ({
                ...current,
                [applicationId]: Array.isArray(response.data) ? response.data : [],
            }));
        } catch (error) {
            console.error('History fetch failed', error);
            toast.error(error.response?.data?.message || 'Unable to load status history.');
        } finally {
            setHistoryLoadingId(null);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.courseHeader}>
                    <div className={styles.logoWrapper}>
                        <img src={courseInfo.image} alt="College logo" className={styles.headerLogo} />
                    </div>
                    <div>
                        <h2 className={styles.collegeName}>{courseInfo.college}</h2>
                        <h1 className={styles.courseName}>{courseInfo.title}</h1>
                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.tableHeaderRow}>
                        <div>
                            <h3 className={styles.sectionTitle}>Candidate Status Management</h3>
                            <p className={styles.resultCount}>Showing {sortedApplications.length} applicants</p>
                        </div>

                        <div className={styles.sortSection}>
                            <label htmlFor="sort" className={styles.sortLabel}>Sort by:</label>
                            <select
                                id="sort"
                                className={styles.sortDropdown}
                                value={sortOption}
                                onChange={(event) => setSortOption(event.target.value)}
                            >
                                <option value="Most recent">Most recent</option>
                                <option value="Student Name (A-Z)">Student Name (A-Z)</option>
                                <option value="Merit Ranking">Merit Ranking</option>
                                <option value="Status">Status</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Index Number</th>
                                    <th>CID Number</th>
                                    <th>Student Name</th>
                                    <th>Email Address</th>
                                    <th>Types</th>
                                    <th>Merit Ranking</th>
                                    <th>Status</th>
                                    <th>Applied Date</th>
                                    <th>Action</th>
                                    <th>History</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && (
                                    <tr>
                                        <td colSpan="10" className={styles.empty}>Loading applications...</td>
                                    </tr>
                                )}

                                {!loading && sortedApplications.map((application) => {
                                    const applicationId = getApplicationId(application);
                                    const status = normalizeStatus(application.currentStatus || application.status);
                                    const allowedStatuses = getNextStatuses(status);

                                    return (
                                        <tr key={applicationId}>
                                            <td className={styles.mono}>{application.student?.indexNumber || 'N/A'}</td>
                                            <td className={styles.mono}>{getStudentCid(application.student)}</td>
                                            <td className={styles.nameCell}>{getStudentName(application.student)}</td>
                                            <td>{application.student?.email || 'N/A'}</td>
                                            <td>
                                                <span className={application.applicationType === 'self-financed' ? styles.badgeSelf : styles.badgeGrant}>
                                                    {application.applicationType === 'self-financed' ? 'Self Finance' : 'High Edu Grant'}
                                                </span>
                                            </td>
                                            <td className={styles.meritScore}>{formatScore(application.totalMeritScore)}</td>
                                            <td className={styles.statusCell}>
                                                <StatusBadge status={status} />
                                            </td>
                                            <td>{formatDate(application.submittedAt || application.createdAt)}</td>
                                            <td>
                                                {allowedStatuses.length > 0 ? (
                                                    <select
                                                        className={styles.statusSelect}
                                                        value=""
                                                        disabled={updatingId === applicationId}
                                                        onChange={(event) => handleStatusUpdate(applicationId, event.target.value)}
                                                    >
                                                        <option value="">Move to...</option>
                                                        {allowedStatuses.map((nextStatus) => (
                                                            <option key={nextStatus} value={nextStatus}>
                                                                {getStatusLabel(nextStatus)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className={styles.lockedText}>Final</span>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className={styles.historyButton}
                                                    onClick={() => handleToggleHistory(applicationId)}
                                                >
                                                    {expandedHistoryId === applicationId ? 'Hide' : 'View'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {!loading && sortedApplications.length === 0 && (
                                    <tr>
                                        <td colSpan="10" className={styles.empty}>No applications found for this course</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {expandedHistoryId && (
                        <div className={styles.historyPanel}>
                            <div className={styles.historyHeader}>
                                <h4>Status History</h4>
                                <button type="button" onClick={() => setExpandedHistoryId(null)}>Close</button>
                            </div>

                            {historyLoadingId === expandedHistoryId ? (
                                <p className={styles.historyState}>Loading history...</p>
                            ) : (
                                <div className={styles.timeline}>
                                    {(historyByApplication[expandedHistoryId] || []).map((item, index) => (
                                        <div className={styles.timelineItem} key={`${item.toStatus}-${item.changedAt}-${index}`}>
                                            <span className={styles.timelineDot}></span>
                                            <div>
                                                <p className={styles.timelineTitle}>
                                                    {getStatusLabel(item.fromStatus)} to {getStatusLabel(item.toStatus)}
                                                </p>
                                                <p className={styles.timelineMeta}>
                                                    {formatDateTime(item.changedAt)} by {item.changedBy || 'system'}
                                                </p>
                                                {item.note && <p className={styles.timelineNote}>{item.note}</p>}
                                            </div>
                                        </div>
                                    ))}

                                    {(historyByApplication[expandedHistoryId] || []).length === 0 && (
                                        <p className={styles.historyState}>No history recorded yet.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className={styles.pagination}>
                        <div></div>
                        <div className={styles.pageControls}>
                            <button className={styles.pageBtn}><ChevronLeft size={16} /></button>
                            <button className={`${styles.pageBtn} ${styles.activePage}`}>1</button>
                            <button className={styles.pageBtn}><ChevronRight size={16} /></button>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};

export default ApplicationDetailsPage;
