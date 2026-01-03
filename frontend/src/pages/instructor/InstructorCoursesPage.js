import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import '../courses/Courses.css';

function InstructorCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMyCourses() {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/course');
        setCourses(res.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    }
    fetchMyCourses();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Instructor courses</h1>
          <p>Manage courses you create for SecureLMS learners.</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate('/instructor/courses/new')}
        >
          + New course
        </button>
      </div>

      {loading && <div className="muted">Loading…</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <div className="grid">
          {courses.map((course) => (
            <button
              key={course._id}
              className="card"
              onClick={() => navigate(`/instructor/courses/${course._id}`)}
            >
              <div
                className="card-thumb"
                style={{
                  backgroundImage: `url(${course.thumbnail})`,
                }}
              />
              <div className="card-body">
                <h3>{course.title}</h3>
                <p className="muted tiny">
                  Enrolled: {course.enrolledStudents?.length || 0}
                </p>
              </div>
            </button>
          ))}
          {!courses.length && (
            <p className="muted">You haven’t created any courses yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default InstructorCoursesPage;


