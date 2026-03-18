import { Link } from 'react-router-dom';
import './CourseCard.css';

function formatPrice(price) {
  if (price === 0) return 'Bepul';
  return `${Number(price).toLocaleString('uz-UZ')} so'm`;
}

export default function CourseCard({ course }) {
  const lessonCount = course.lessons?.length ?? 0;

  return (
    <Link to={`/courses/${course.slug}`} className="course-card">
      <div className="course-card__thumb">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.name} />
        ) : (
          <div className="course-card__placeholder" />
        )}
      </div>
      <div className="course-card__body">
        <h3 className="course-card__title">{course.name}</h3>
        {course.description && (
          <p className="course-card__desc">{course.description}</p>
        )}
        <div className="course-card__meta">
          <span>{lessonCount} dars</span>
          <span className="course-card__price">{formatPrice(course.price)}</span>
        </div>
      </div>
    </Link>
  );
}
