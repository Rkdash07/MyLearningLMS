import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import './Courses.css';

function CoursesCatalogPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();


  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError('');
      try {
        const url = query
          ? `/course/search?query=${encodeURIComponent(query)}`
          : '/course/published';
        const res = await api.get(url);
        setCourses(res.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchCourses();
    }, query ? 500 : 0);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const filtered = courses;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Course catalog</h1>
          <p>Browse secure, instructor-led courses and start learning.</p>
        </div>
        <input
          className="search-input"
          placeholder="Search by title…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading && <div className="muted">Loading courses…</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <div className="grid">
          {filtered.map((course) => (
            <button
              key={course._id}
              className="card"
              onClick={() => navigate(`/courses/${course._id}`)}
            >
              <div
                className="card-thumb"
                style={{
                  backgroundImage: `url(${course.thumbnail})`,
                }}
              />
              <div className="card-body">
                <h3>{course.title}</h3>
                <p className="muted small">{course.subtitle}</p>
                <p className="muted tiny">
                  {course.category} • {course.level}
                </p>
                <p className="price">₹ {course.price}</p>
              </div>
            </button>
          ))}
          {!filtered.length && (
            <p className="muted">No courses match your search yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default CoursesCatalogPage;


