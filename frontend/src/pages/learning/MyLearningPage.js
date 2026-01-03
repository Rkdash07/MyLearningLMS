import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import '../courses/Courses.css';

function MyLearningPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPurchased() {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/purchase');
        setCourses(res.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load learning list');
      } finally {
        setLoading(false);
      }
    }
    fetchPurchased();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>My learning</h1>
          <p>Access courses you’ve securely purchased and track progress.</p>
        </div>
      </div>

      {loading && <div className="muted">Loading…</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <div className="grid">
          {courses.map((course) => (
            <button
              key={course._id}
              className="card"
              onClick={() => navigate(`/learning/${course._id}`)}
            >
              <div
                className="card-thumb"
                style={{
                  backgroundImage: `url(${course.thumbnail})`,
                }}
              />
              <div className="card-body">
                <h3>{course.title}</h3>
                <p className="muted small">
                  {course.category} • {course.level}
                </p>
              </div>
            </button>
          ))}
          {!courses.length && (
            <p className="muted">No courses purchased yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default MyLearningPage;


