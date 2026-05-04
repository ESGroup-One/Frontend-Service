import styles from './CourseCard.module.css';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ course }) => {

  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/user/courses/${course._id}`);
  };
  return (
    <div
      className={styles.card}
      onClick={handleClick}
    >
      <div className={styles.cardHeader}>
        <img src={course.createdBy.image} alt={`${course.college} logo`} className={styles.collegeLogo} />
        <h3 className={styles.collegeName}>{course.college}</h3>
      </div>
      <h2 className={styles.courseTitle}>{course.title}</h2>
      <p className={styles.courseDescription}>
        {course.description}
      </p>
      <div className={styles.cardFooter}>
        <b>{course.govSeats}</b> Higher Education Grant and <b>{course.selfFinancedSeats}</b> self financed seats available
      </div>
    </div>
  );
};

export default CourseCard;