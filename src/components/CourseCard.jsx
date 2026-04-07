import { Link } from 'react-router-dom';
import './CourseCard.css';

function formatPrice(price) {
    if (price === 0 || price === null || price === undefined) return { label: 'Bepul', type: 'free' };
    return { label: `${Number(price).toLocaleString('uz-UZ')} so'm`, type: 'paid' };
}

export default function CourseCard({ course }) {
    const lessonCount = course.lessons?.length ?? 0;
    const { label, type } = formatPrice(course.price);

    return (
        <Link to={`/courses/${course.slug}`} className="course-card">
            <div className="course-card__thumb">
                {course.thumbnail ? (
                    <img
                        src={course.thumbnail}
                        alt={course.name}
                        loading="lazy"
                    />
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
                    <span className="course-card__lessons">
                        <svg className="course-card__lessons-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.899L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                        </svg>
                        {lessonCount} dars
                    </span>
                    <span className={`course-card__price ${type}`}>
                        {label}
                    </span>
                </div>
            </div>
        </Link>
    );
}
