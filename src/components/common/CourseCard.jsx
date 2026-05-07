import styles from './CourseCard.module.css';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ course, onClick }) => {

  const navigate = useNavigate();
  const handleClick = (e) => {
    if (onClick) {
      onClick(course);
    } else {
      navigate(`/user/courses/${course.id}`);
    }
  };
  
  return (
    <div
      className={styles.card}
      onClick={handleClick}
    >
      <div className={styles.cardHeader}>
        <img
          src={course.college?.image || '/default-college-logo.png'}
          alt={`${course.college?.collegeName || 'College'} logo`}
          className={styles.collegeLogo}
        />
        <h3 className={styles.collegeName}>{course.college.collegeName}</h3>
      </div>
      <h2 className={styles.courseTitle}>{course.title}</h2>
      <p className={styles.courseDescription}>
        {course.description}
      </p>
      <div className={styles.cardFooter}>
        <b>{course.gov_seats}</b> Higher Education Grant and <b>{course.self_finance_seats}</b> self financed seats available
      </div>
    </div>
  );
};

export default CourseCard;