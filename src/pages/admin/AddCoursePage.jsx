import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, X, AlertCircle } from 'lucide-react';
import styles from './AddCoursePage.module.css';
import formStyles from '../../styles/Form.module.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ADD_COURSE_URL } from '../../constant';

const STANDARD_SUBJECTS = [
    "English", "Dzongkha", "Mathematics", "Physics", "Chemistry",
    "Biology", "History", "Geography", "Economics", "Commerce",
    "Accountancy", "Rigzhung", "Best Subject 1", "Best Subject 2",
    "Best Subject 3", "Best Subject 4"
];

const AddCoursePage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // State for simple form fields
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        college: '',
        application_dateline: '',
        gov_seats: '',
        self_finance_seats: '',
        aggregate_marks: '',
    });

    // State for dynamic, structured fields
    const [requiredMarks, setRequiredMarks] = useState([{ subject: '', marks: '' }]);
    const [meritDetails, setMeritDetails] = useState([{ subject: '', times: '' }]);

    // --- Handlers for Simple Inputs ---
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    // --- Generic Handlers for Dynamic Lists ---
    const handleListChange = (setter, list, index, field, value) => {
        const updatedList = [...list];
        updatedList[index] = {
            ...updatedList[index],
            [field]: value
        };
        setter(updatedList);
    };

    const addListField = (setter, list, newObject) => {
        setter([...list, newObject]);
    };

    const removeListField = (setter, list, index) => {
        setter(list.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Note: If you use toasts, you might not even need the local 'error' state 
        // for the UI anymore, but keeping it won't hurt.
        setError(null);

        const token = localStorage.getItem("authToken");

        if (!token) {
            toast.error('Authorization failed. Please log in again.');
            setIsLoading(false);
            return;
        }

        // 1. Data Transformation
        const eligibility_criteria = requiredMarks.reduce((acc, item) => {
            if (item.subject.trim() && item.marks) {
                acc[item.subject.trim()] = Number(item.marks);
            }
            return acc;
        }, {});

        if (formData.aggregate_marks) {
            eligibility_criteria['Overall_Aggregate'] = Number(formData.aggregate_marks);
        }

        const merit_ranking = meritDetails.reduce((acc, item) => {
            if (item.subject.trim() && item.times) {
                acc[item.subject.trim()] = Number(item.times);
            }
            return acc;
        }, {});

        // 2. Final payload
        const payload = {
            title: formData.title,
            description: formData.description,
            application_dateline: formData.application_dateline ? `${formData.application_dateline}T00:00:00` : null,
            gov_seats: Number(formData.gov_seats),
            self_finance_seats: Number(formData.self_finance_seats),
            eligibility_criteria,
            merit_ranking,
        };

        // 3. API Submission
        try {
            const response = await axios.post(ADD_COURSE_URL, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            toast.success(`Course "${response.data.title}" created successfully!`, {
                position: "top-right",
                autoClose: 3000,
            });

            // Delay navigation slightly so the user sees the success toast
            setTimeout(() => {
                navigate('/admin/courses');
            }, 1500);

        } catch (err) {
            console.error('Error creating course:', err.response?.data || err.message);

            const errorMessage = err.response?.data?.message || 'Failed to create course.';

            if (err.response?.status === 401) {
                toast.error('Session expired. Please log in again.');
                setError('Session expired. Please log in again.');
            } else {
                toast.error(errorMessage);
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.formWrapper}>
                {error && (
                    <div className={formStyles.errorMessage} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Course & Description */}
                    <div className={formStyles.grid}>
                        <div className={formStyles.formGroup}>
                            <label htmlFor="title" className={formStyles.label}>Course</label>
                            <input id="title" type="text" value={formData.title} onChange={handleChange} placeholder="Enter course name" className={formStyles.input} required />
                        </div>
                        <div className={formStyles.formGroup}>
                            <label htmlFor="description" className={formStyles.label}>Description</label>
                            <textarea id="description" value={formData.description} onChange={handleChange} placeholder="Enter the course description" className={formStyles.input} rows="1" required />
                        </div>
                    </div>

                    {/* Dateline & Seats */}
                    <div className={formStyles.grid}>
                        <div className={formStyles.formGroup}>
                            <label htmlFor="application_dateline" className={formStyles.label}>Application Dateline</label>
                            <input id="application_dateline" type="date" value={formData.application_dateline} onChange={handleChange} className={formStyles.input} required />
                        </div>
                        <div className={formStyles.formGroup}>
                            <label htmlFor="gov_seats" className={formStyles.label}>Higher Education Grant</label>
                            <input id="gov_seats" type="number" value={formData.gov_seats} onChange={handleChange} placeholder="Enter seats..." className={formStyles.input} required />
                        </div>
                        <div className={formStyles.formGroup}>
                            <label htmlFor="self_finance_seats" className={formStyles.label}>Self-Financed</label>
                            <input id="self_finance_seats" type="number" value={formData.self_finance_seats} onChange={handleChange} placeholder="Enter seats..." className={formStyles.input} required />
                        </div>
                    </div>

                    <div className={formStyles.grid}>
                        {/* --- Eligibility Criteria --- */}
                        <div className={formStyles.formGroup}>
                            <h3 className={styles.sectionTitle}>Eligibility Criteria</h3>
                            <label htmlFor="aggregate_marks" className={formStyles.label}>Minimum aggregate marks of</label>
                            <input id="aggregate_marks" type="number" value={formData.aggregate_marks} onChange={handleChange} placeholder="Enter minimum aggregate marks required" className={formStyles.input} style={{ marginBottom: '16px' }} />
                            <label className={formStyles.label}>Minimum marks required</label>
                            {requiredMarks.map((item, index) => (
                                <div key={index} className={formStyles.dynamicRow}>
                                    <input
                                        type="text"
                                        list="subject-options"
                                        value={item.subject}
                                        onChange={(e) => handleListChange(setRequiredMarks, requiredMarks, index, 'subject', e.target.value)}
                                        placeholder="Subject"
                                        className={formStyles.input}
                                    />
                                    <span className={formStyles.colon}>:</span>
                                    <input type="number" value={item.marks} onChange={(e) => handleListChange(setRequiredMarks, requiredMarks, index, 'marks', e.target.value)} placeholder="Marks" className={formStyles.input} />
                                    {requiredMarks.length > 1 && <button type="button" onClick={() => removeListField(setRequiredMarks, requiredMarks, index)} className={formStyles.removeButton}><X size={16} /></button>}
                                </div>
                            ))}
                            <button type="button" onClick={() => addListField(setRequiredMarks, requiredMarks, { subject: '', marks: '' })} className={formStyles.addButton}><Plus size={16} /> List more</button>
                        </div>

                        {/* --- Merit Ranking --- */}
                        <div className={formStyles.formGroup}>
                            <h3 className={styles.sectionTitle}>Merit Ranking Details</h3>
                            {meritDetails.map((item, index) => (
                                <div key={index} className={formStyles.dynamicRow}>
                                    <input
                                        style={{ marginTop: "24px" }}
                                        type="text"
                                        list="subject-options" // Use the SAME datalist ID here
                                        value={item.subject}
                                        onChange={(e) => handleListChange(setMeritDetails, meritDetails, index, 'subject', e.target.value)}
                                        placeholder="Subject"
                                        className={formStyles.input}
                                    />
                                    <span style={{ marginTop: "24px" }} className={formStyles.colon}>:</span>
                                    <input style={{ marginTop: "24px" }} type="number" value={item.times} onChange={(e) => handleListChange(setMeritDetails, meritDetails, index, 'times', e.target.value)} placeholder="Weightage" className={formStyles.input} />
                                    {meritDetails.length > 1 && <button type="button" onClick={() => removeListField(setMeritDetails, meritDetails, index)} className={formStyles.removeButton}><X size={16} /></button>}
                                </div>
                            ))}
                            <button type="button" onClick={() => addListField(setMeritDetails, meritDetails, { subject: '', times: '' })} className={formStyles.addButton}><Plus size={16} /> List more</button>
                        </div>
                    </div>

                    {/* The Single Datalist */}
                    <datalist id="subject-options">
                        {STANDARD_SUBJECTS.map(sub => <option key={sub} value={sub} />)}
                    </datalist>

                    <div className={styles.formFooter}>
                        <button type="submit" className={formStyles.submitButton} disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Course'}
                        </button>
                    </div>
                </form>
            </div>
            <ToastContainer />
        </div>
    );
};

export default AddCoursePage;