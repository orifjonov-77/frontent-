import { useState, useEffect } from 'react';
import { getCategories, getCourses } from '../api/courses.js';
import CourseCard from '../components/CourseCard.jsx';
import './CoursesPage.css';

export default function CoursesPage() {
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [categoryId, setCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [cats, crs] = await Promise.all([
          getCategories(),
          getCourses(categoryId),
        ]);
        if (!cancelled) {
          setCategories(cats);
          setCourses(crs);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [categoryId]);

  if (loading) return <div className="page-loading">Kurslar yuklanmoqda…</div>;
  if (error) return <div className="page-error">Xato: {error}</div>;

  return (
    <div className="courses-page">
      <h1 className="page-title">Kurslar</h1>
      {categories.length > 0 && (
        <div className="category-tabs">
          <button
            type="button"
            className={categoryId === null ? 'active' : ''}
            onClick={() => setCategoryId(null)}
          >
            Hammasi
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={categoryId === cat.id ? 'active' : ''}
              onClick={() => setCategoryId(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}
      <div className="course-grid">
        {courses.length === 0 ? (
          <p className="empty">Hozircha kurslar yo‘q.</p>
        ) : (
          courses.map((course) => <CourseCard key={course.id} course={course} />)
        )}
      </div>
    </div>
  );
}
