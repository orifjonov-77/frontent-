import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCourseBySlug } from '../api/courses.js';
import { initPayment } from '../api/payments.js';
import { useAuth } from '../context/AuthContext.jsx';
import './CourseDetailPage.css';

function formatPrice(price) {
  if (price === 0) return 'Bepul';
  return `${Number(price).toLocaleString('uz-UZ')} so'm`;
}

export default function CourseDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getCourseBySlug(slug);
        if (!cancelled) setCourse(data);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [slug]);

  const hasFullAccess = course?.lessons?.every((l) => l.has_access) ?? false;

  const handleBuy = async (provider = 'payme') => {
    if (!user) {
      window.location.href = '/login?redirect=' + encodeURIComponent('/courses/' + slug);
      return;
    }
    setPaying(true);
    try {
      const res = await initPayment({ course_id: course.id, provider });
      if (res.payment_url) window.location.href = res.payment_url;
    } catch (e) {
      alert(e.message || 'To‘lovni boshlashda xato');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div className="page-loading">Kurs yuklanmoqda…</div>;
  if (error) return <div className="page-error">Xato: {error}</div>;
  if (!course) return null;

  return (
    <div className="course-detail">
      <div className="course-detail__head">
        <div className="course-detail__thumb">
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.name} />
          ) : (
            <div className="course-detail__placeholder" />
          )}
        </div>
        <div className="course-detail__info">
          <h1>{course.name}</h1>
          {course.description && <p className="course-detail__desc">{course.description}</p>}
          <div className="course-detail__meta">
            <span>{course.lessons?.length ?? 0} dars</span>
            <span className="course-detail__price">{formatPrice(course.price)}</span>
          </div>
          {!hasFullAccess && course.price > 0 && (
            <div className="course-detail__actions">
              <button
                type="button"
                className="btn btn-primary"
                disabled={paying}
                onClick={() => handleBuy('payme')}
              >
                {paying ? '…' : 'Payme orqali to‘lash'}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                disabled={paying}
                onClick={() => handleBuy('click')}
              >
                Click orqali to‘lash
              </button>
            </div>
          )}
        </div>
      </div>

      <section className="lessons-section">
        <h2>Darslar</h2>
        <ul className="lesson-list">
          {course.lessons?.map((lesson) => (
            <li key={lesson.id} className={lesson.has_access ? '' : 'lesson-locked'}>
              <div className="lesson-item">
                <span className="lesson-title">{lesson.title}</span>
                {lesson.has_access ? (
                  <span className="lesson-badge">Ochiq</span>
                ) : (
                  <span className="lesson-badge locked">Qulflangan</span>
                )}
              </div>
              {lesson.videos?.length > 0 && (
                <ul className="video-list">
                  {lesson.videos.map((v) => (
                    <li key={v.id}>
                      {lesson.has_access ? (
                        <a href={v.video_url} target="_blank" rel="noopener noreferrer" className="video-link">
                          {v.title}
                          {v.duration_seconds != null && (
                            <span className="video-duration">
                              {Math.floor(v.duration_seconds / 60)}:{(v.duration_seconds % 60).toString().padStart(2, '0')}
                            </span>
                          )}
                        </a>
                      ) : (
                        <span className="video-link disabled">{v.title}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
